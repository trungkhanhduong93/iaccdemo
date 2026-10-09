// Hỗ trợ cuộn ảo (Virtual Scroll) và gom nhóm đa cấp cho bảng dữ liệu lớn theo chuẩn LedgerStudio (T50)
import { useLayoutEffect, useEffect, useRef, useState, useMemo } from 'react'
import { flushSync } from 'react-dom'
import { heSoZoom } from './zoom'

const VS_FAST_JUMP = 20
const VS_OVERSCAN_NORMAL = 30
const VS_OVERSCAN_FAST = 8

export interface VirtualScrollResult {
  startIndex: number
  endIndex: number
  topPadding: number
  bottomPadding: number
  totalHeight: number
  fast: boolean
  isVirtual: boolean
}

/**
 * Hook cuộn ảo tự hiệu chỉnh chiều cao dòng từ DOM (median 16 dòng đầu).
 * Hỗ trợ chế độ vuốt nhanh (fast drag) để không bị khựng DOM.
 */
export function useVirtualScroll<T>(
  data: T[],
  estimatedRowHeight: number,
  containerRef: React.RefObject<HTMLElement | null>,
  enabled = true,
): VirtualScrollResult {
  const totalItems = data.length
  const [pos, setPos] = useState({ top: 0, fast: false })
  const [containerHeight, setContainerHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 600))
  const [rowH, setRowH] = useState(estimatedRowHeight)
  const rowHRef = useRef(estimatedRowHeight)
  rowHRef.current = rowH
  const calibRef = useRef(0)

  // Tự đo chiều cao dòng thực tế từ DOM (median 16 dòng đầu)
  useLayoutEffect(() => {
    if (!enabled || totalItems === 0) return
    const c = containerRef.current
    if (!c) return
    if (calibRef.current > 12) return
    calibRef.current += 1

    const z = heSoZoom()
    const all = [...c.querySelectorAll('tbody tr')].filter(tr => tr.children.length > 1 && !tr.classList.contains('tbl-spacer'))
    const plain = all.filter(tr => !tr.classList.contains('ds-grp-row'))
    const rows = plain.length ? plain : all
    const hs = rows
      .slice(0, 16)
      .map(tr => tr.getBoundingClientRect().height / z)
      .filter(h => h > 10 && h < 200)

    if (hs.length) {
      hs.sort((a, b) => a - b)
      const med = hs[Math.floor(hs.length / 2)]
      if (med > 10 && Math.abs(med - rowH) > 0.5) {
        setRowH(med)
      }
    }
  })

  // Lắng nghe scroll và resize của khung chứa
  const boundRef = useRef<{ el: HTMLElement | null; off: (() => void) | null }>({ el: null, off: null })
  useEffect(() => {
    const b = boundRef.current
    return () => {
      if (b.off) b.off()
      b.el = null
      b.off = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    const b = boundRef.current
    if (container === b.el) return
    if (b.off) b.off()
    b.el = container
    b.off = null
    if (!container) return

    let lastTop = container.scrollTop
    let fast = false
    let idle: number | undefined

    const handleScroll = () => {
      const st = container.scrollTop
      const rh = rowHRef.current > 10 ? rowHRef.current : estimatedRowHeight
      const jump = Math.abs(st - lastTop) > VS_FAST_JUMP * rh
      lastTop = st

      if (jump || fast) {
        fast = true
        window.clearTimeout(idle)
        idle = window.setTimeout(() => {
          fast = false
          setPos({ top: container.scrollTop, fast: false })
        }, 150)
        flushSync(() => {
          setPos(prev => (prev.fast && Math.abs(st - prev.top) < rh ? prev : { top: st, fast: true }))
        })
        return
      }

      const step = 6 * rh
      setPos(prev => (Math.abs(st - prev.top) >= step || st === 0 ? { top: st, fast: false } : prev))
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    const measure = () => {
      const z = heSoZoom()
      const h = (container.clientHeight || container.getBoundingClientRect().height) / z
      if (h > 0) setContainerHeight(h)
    }

    const ro = new ResizeObserver(() => measure())
    ro.observe(container)
    measure()

    b.off = () => {
      container.removeEventListener('scroll', handleScroll)
      window.clearTimeout(idle)
      ro.disconnect()
    }
  }, [enabled, estimatedRowHeight, containerRef])

  // Khi dữ liệu đổi -> reset cuộn về đầu
  useLayoutEffect(() => {
    if (!enabled) return
    const container = containerRef.current
    if (!container) return
    calibRef.current = 0
    const z = heSoZoom()
    const h = (container.clientHeight || container.getBoundingClientRect().height) / z
    if (h > 0) setContainerHeight(h)
  }, [data, containerRef, enabled])

  if (!enabled || totalItems <= 25) {
    return {
      startIndex: 0,
      endIndex: totalItems - 1,
      topPadding: 0,
      bottomPadding: 0,
      totalHeight: totalItems * rowH,
      fast: false,
      isVirtual: false,
    }
  }

  const eff = rowH > 10 ? rowH : estimatedRowHeight
  const overscan = pos.fast ? VS_OVERSCAN_FAST : VS_OVERSCAN_NORMAL
  const startIndex = Math.max(0, Math.floor(pos.top / eff) - overscan)
  const endIndex = Math.min(totalItems - 1, Math.floor((pos.top + containerHeight) / eff) + overscan)

  const topPadding = startIndex * eff
  const totalHeight = totalItems * eff
  const bottomPadding = Math.max(0, totalHeight - (endIndex + 1) * eff)

  return {
    startIndex,
    endIndex,
    topPadding,
    bottomPadding,
    totalHeight,
    fast: pos.fast,
    isVirtual: true,
  }
}

/** Cấu trúc một nút nhóm trong danh sách đã gom nhóm */
export interface GroupNode {
  id: string
  name: string
  col: string
  colTen: string
  level: number
  count: number
  sums: Record<string, number>
  children: any[]
  expanded: boolean
  isGroup: true
}

/**
 * Thuật toán gom nhóm đa cấp học từ LedgerStudio:
 * Tạo cây theo các cột groupCols, tính subtotal theo sumFields, làm phẳng có cờ isGroup.
 */
export function buildGroupedData<T extends Record<string, any>>(
  rawData: T[],
  groupCols: string[],
  sumFields: string[],
  colNames: Record<string, string> = {},
  expandState: Map<string, boolean>,
): (T | GroupNode)[] {
  if (!groupCols || groupCols.length === 0) return rawData

  interface InternalNode {
    id: string
    name: string
    col: string
    colTen: string
    level: number
    count: number
    sums: Record<string, number>
    children: T[]
    map: Map<string, InternalNode>
    expanded: boolean
  }

  const rootGroups = new Map<string, InternalNode>()

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i]
    let currentMap = rootGroups
    let parentKey = ''

    for (let j = 0; j < groupCols.length; j++) {
      const col = groupCols[j]
      const val = String(row[col] ?? '(Trống)').trim() || '(Trống)'
      const key = parentKey ? `${parentKey}|${val}` : val
      parentKey = key

      if (!currentMap.has(key)) {
        const exp = expandState.has(key) ? expandState.get(key)! : true
        const initialSums: Record<string, number> = {}
        sumFields.forEach(f => { initialSums[f] = 0 })
        currentMap.set(key, {
          id: key,
          name: val,
          col,
          colTen: colNames[col] || col,
          level: j,
          count: 0,
          sums: initialSums,
          children: [],
          map: new Map(),
          expanded: exp,
        })
      }

      const node = currentMap.get(key)!
      node.count += 1
      sumFields.forEach(f => {
        const num = typeof row[f] === 'number' ? row[f] : Number(row[f]) || 0
        node.sums[f] = (node.sums[f] || 0) + num
      })

      if (j === groupCols.length - 1) {
        node.children.push(row)
      } else {
        currentMap = node.map
      }
    }
  }

  const flat: (T | GroupNode)[] = []
  const flatten = (map: Map<string, InternalNode>) => {
    for (const [, node] of map.entries()) {
      const groupItem: GroupNode = {
        id: node.id,
        name: node.name,
        col: node.col,
        colTen: node.colTen,
        level: node.level,
        count: node.count,
        sums: node.sums,
        children: node.children,
        expanded: node.expanded,
        isGroup: true,
      }
      flat.push(groupItem)

      if (node.expanded) {
        if (node.children.length > 0) {
          for (let i = 0; i < node.children.length; i++) {
            flat.push(node.children[i])
          }
        } else {
          flatten(node.map)
        }
      }
    }
  }

  flatten(rootGroups)
  return flat
}
