import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties, type PointerEvent as PE, type ReactNode } from 'react'
import type { Col, Row } from '../modules/types'
import { money } from './format'
import { OLoc, type LocCot } from './LocCot'
import { useVirtualScroll, type GroupNode } from './virtual'
import { heSoZoom } from './zoom'

export function cell(c: Col, r: Row): ReactNode {
  if (c.r) return c.r(r)
  const v = r[c.k]
  if (c.num && typeof v === 'number') return v === 0 ? '' : money(v)
  return v
}

/** Vị trí của cột đứng yên: dùng biến CSS --tr-i và --ph-i trên <table>, đo bằng ResizeObserver (T74) */
function viTri(cols: Col[]): { cls: string; style?: CSSProperties }[] {
  const traiIndices: number[] = []
  const phaiIndices: number[] = []
  cols.forEach((c, i) => {
    if (c.dinh === 'trai') traiIndices.push(i)
    else if (c.dinh === 'phai') phaiIndices.push(i)
  })
  const cuoiTrai = cols.map(c => c.dinh).lastIndexOf('trai')
  const dauPhai = cols.findIndex(c => c.dinh === 'phai')
  const phaiReversed = [...phaiIndices].reverse()

  return cols.map((c, i) => {
    if (c.dinh === 'trai') {
      const idx = traiIndices.indexOf(i)
      let cls = 'dinh'
      if (i === cuoiTrai) cls += ' dinh-cuoi'
      return { cls, style: { left: `var(--tr-${idx}, 0px)` } }
    }
    if (c.dinh === 'phai') {
      const idx = phaiReversed.indexOf(i)
      let cls = 'dinh dinh-phai'
      return { cls, style: { right: `var(--ph-${idx}, 0px)` } }
    }
    return { cls: '' }
  })
}

/** Độ rộng cột người dùng đã kéo, theo khoá cột (T41) */
export interface DoRong { gt: Record<string, number>; dat: (k: string, w: number) => void }

/** Kéo tay nắm ở mép phải ô tiêu đề để đổi độ rộng cột, tối thiểu 60px.
 * Dùng tỉ lệ offsetWidth / getBoundingClientRect().width để quy đổi delta chuột đúng cả khi html có zoom (T42) */
function keoRong(e: PE<HTMLSpanElement>, k: string, dat: DoRong['dat']) {
  e.preventDefault()
  e.stopPropagation()
  const el = e.currentTarget
  const th = el.parentElement as HTMLElement
  const x0 = e.clientX
  const rect = th.getBoundingClientRect()
  const w0 = th.offsetWidth
  const scale = rect.width > 0 ? th.offsetWidth / rect.width : 1
  el.setPointerCapture(e.pointerId)
  const di = (ev: PointerEvent) => {
    const delta = (ev.clientX - x0) * scale
    dat(k, Math.max(60, Math.round(w0 + delta)))
  }
  const tha = () => {
    el.removeEventListener('pointermove', di)
    el.removeEventListener('pointerup', tha)
    el.removeEventListener('pointercancel', tha)
  }
  el.addEventListener('pointermove', di)
  el.addEventListener('pointerup', tha)
  el.addEventListener('pointercancel', tha)
}

/** Tính độ rộng cột số đủ chứa trọn tiêu đề và giá trị lớn nhất, tối thiểu 120px (T42) */
function tinhRongNum(c: Col, rows: Row[], sum?: Row): number {
  const tieuDe = c.t || ''
  const tieuDeW = tieuDe.length * 8.5 + 48
  let maxLen = 0
  for (const r of rows) {
    const v = r[c.k]
    if (typeof v === 'number' && v !== 0) {
      const s = v.toLocaleString('vi-VN')
      if (s.length > maxLen) maxLen = s.length
    }
  }
  if (sum && typeof sum[c.k] === 'number') {
    const s = (sum[c.k] as number).toLocaleString('vi-VN')
    if (s.length > maxLen) maxLen = s.length
  }
  const noiDungW = maxLen > 0 ? maxLen * 8.5 + 32 : 0
  return Math.max(120, Math.ceil(tieuDeW), Math.ceil(noiDungW), c.w ?? 0)
}

export function Table({
  cols: cols0,
  rows,
  sum,
  onRow,
  onDbl,
  sel,
  rowCls,
  maxH,
  motDong,
  loc,
  doRong,
  keDoc,
  virtual,
  onToggleGroup,
}: {
  cols: Col[]
  rows: (Row | GroupNode)[]
  sum?: Row
  onRow?: (r: Row) => void
  onDbl?: (r: Row) => void
  sel?: (r: Row) => boolean
  rowCls?: (r: Row) => string
  maxH?: number
  motDong?: boolean
  loc?: LocCot
  doRong?: DoRong                       // cho kéo giãn độ rộng cột
  keDoc?: boolean                       // kẻ dọc giữa các cột
  virtual?: boolean                     // bật cuộn ảo cho danh sách lớn
  onToggleGroup?: (id: string) => void  // đóng mở nhóm
}) {
  // Cột đã kéo giãn thì lấy độ rộng mới (tối thiểu 60px), kể cả để tính vị trí cột đứng yên (T41, T42)
  const cols = doRong ? cols0.map(c => doRong.gt[c.k] ? { ...c, w: Math.max(60, doRong.gt[c.k]) } : c) : cols0
  const keo = (c: Col) => Boolean(doRong?.gt[c.k])
  const vt = viTri(cols)
  const lop = (c: Col, i: number) => [c.num ? 'num' : c.c ? 'c' : '', vt[i].cls].join(' ')

  const rongDef = (c: Col) => {
    if (keo(c)) {
      const w = Math.max(60, c.w ?? 60)
      return { w, minW: w, maxW: w }
    }
    if (c.num) {
      const w = tinhRongNum(c, rows as Row[], sum)
      return { w, minW: w }
    }
    if (c.w) {
      return { w: c.w, minW: c.w }
    }
    return {}
  }

  const tdStyle = (c: Col, i: number) => {
    const rd = rongDef(c)
    return {
      ...vt[i].style,
      ...(rd.w ? { width: rd.w } : {}),
      ...(rd.minW ? { minWidth: rd.minW } : {}),
      ...(rd.maxW ? { maxWidth: rd.maxW } : {}),
    }
  }

  const wrapRef = useRef<HTMLDivElement>(null)
  const tblRef = useRef<HTMLTableElement>(null)

  // Giá trị khởi tạo biến CSS trên <table> trước khi ResizeObserver đo thật
  const initVars: Record<string, string> = {}
  let accL0 = 0
  let trIdx0 = 0
  const phaiList0: Col[] = []
  cols.forEach(c => {
    if (c.dinh === 'trai') {
      initVars[`--tr-${trIdx0}`] = `${accL0}px`
      accL0 += c.w ?? 60
      trIdx0++
    } else if (c.dinh === 'phai') {
      phaiList0.push(c)
    }
  })
  let accR0 = 0
  let phIdx0 = 0
  phaiList0.reverse().forEach(c => {
    initVars[`--ph-${phIdx0}`] = `${accR0}px`
    accR0 += c.w ?? 60
    phIdx0++
  })

  // Đo bề rộng thật của các ô tiêu đề cột cố định bằng offsetWidth (không dùng getBoundingClientRect vì html có zoom) (T74)
  const doCot = useCallback(() => {
    const tbl = tblRef.current
    if (!tbl) return
    const ths = tbl.querySelectorAll<HTMLTableCellElement>('thead tr:first-child > th')
    if (!ths.length) return

    let accL = 0
    let trIdx = 0
    const phaiColsList: { colIdx: number; el: HTMLTableCellElement }[] = []

    cols.forEach((c, i) => {
      const th = ths[i]
      if (!th) return
      if (c.dinh === 'trai') {
        tbl.style.setProperty(`--tr-${trIdx}`, `${accL}px`)
        accL += th.offsetWidth
        trIdx++
      } else if (c.dinh === 'phai') {
        phaiColsList.push({ colIdx: i, el: th })
      }
    })

    let accR = 0
    let phIdx = 0
    phaiColsList.reverse().forEach(item => {
      tbl.style.setProperty(`--ph-${phIdx}`, `${accR}px`)
      accR += item.el.offsetWidth
      phIdx++
    })
  }, [cols])

  useLayoutEffect(() => {
    doCot()
    const tbl = tblRef.current
    if (!tbl) return
    const ths = tbl.querySelectorAll<HTMLTableCellElement>('thead tr:first-child > th')
    if (!ths.length) return

    const ro = new ResizeObserver(() => {
      doCot()
    })
    cols.forEach((c, i) => {
      if ((c.dinh === 'trai' || c.dinh === 'phai') && ths[i]) {
        ro.observe(ths[i])
      }
    })
    return () => ro.disconnect()
  }, [cols, rows, doCot, doRong])

  // Gắn lớp cuon-trai, cuon-phai trên .tbl-wrap để bật bóng nhẹ cho cột cố định biên khi cuộn ngang (T74)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let rafId = 0
    const capNhatBong = () => {
      const coTrai = el.scrollLeft > 0
      const coPhai = Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 1
      el.classList.toggle('cuon-trai', coTrai)
      el.classList.toggle('cuon-phai', coPhai)
    }
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(capNhatBong)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    capNhatBong()
    const ro = new ResizeObserver(() => capNhatBong())
    ro.observe(el)
    return () => {
      cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [rows, cols0])

  // Hook cuộn ảo theo chuẩn LedgerStudio (T50) - chiều cao dòng thân chuẩn 42px (T74)
  const vs = useVirtualScroll(rows, 42, wrapRef, virtual ?? rows.length > 25)

  // Chống xô giật bề rộng cột khi cuộn: giữ bề rộng lớn nhất đã thấy làm minWidth
  useLayoutEffect(() => {
    if (!wrapRef.current) return
    const ths = wrapRef.current.querySelectorAll<HTMLTableCellElement>('thead tr:first-child > th')
    const z = heSoZoom()
    ths.forEach(th => {
      const w = th.getBoundingClientRect().width / z
      const cur = parseFloat(th.style.minWidth) || 0
      if (w > cur) {
        th.style.minWidth = `${w}px`
        doCot()
      }
    })
  })

  useLayoutEffect(() => {
    if (!wrapRef.current) return
    const ths = wrapRef.current.querySelectorAll<HTMLTableCellElement>('thead tr:first-child > th')
    ths.forEach(th => {
      const k = th.getAttribute('data-k')
      if (!k || !doRong?.gt[k]) th.style.minWidth = ''
    })
  }, [rows, cols0])

  const visibleRows = vs.isVirtual ? rows.slice(vs.startIndex, vs.endIndex + 1) : rows

  return (
    <div ref={wrapRef} className="tbl-wrap" style={maxH ? { maxHeight: maxH } : undefined}>
      <table ref={tblRef} className={`tbl${motDong ? ' mot-dong' : ''}${keDoc ? ' ke-doc' : ''}`} style={initVars as CSSProperties}>
        <thead>
          <tr>{cols.map((c, i) => {
            const rd = rongDef(c)
            const thStyle: CSSProperties = {
              ...(rd.w ? { width: rd.w } : {}),
              ...(rd.minW ? { minWidth: rd.minW } : {}),
              ...(rd.maxW ? { maxWidth: rd.maxW } : {}),
              ...vt[i].style,
            }
            return (
              <th key={c.k} data-k={c.k} className={[lop(c, i), keo(c) ? 'da-keo' : ''].join(' ')}
                style={thStyle}>
                {c.hd ?? c.t}
                {doRong && c.k !== 'chk' && <span className="ds-keo-rong" aria-hidden onPointerDown={e => keoRong(e, c.k, doRong.dat)} />}
              </th>
            )
          })}</tr>
          {loc && (
            <tr className="loc-hang">
              {cols.map((c, i) => {
                const rd = rongDef(c)
                const thLocStyle: CSSProperties = {
                  ...(rd.w ? { width: rd.w } : {}),
                  ...(rd.minW ? { minWidth: rd.minW } : {}),
                  ...(rd.maxW ? { maxWidth: rd.maxW } : {}),
                  ...vt[i].style,
                }
                return (
                  <th key={c.k} className={lop(c, i)} style={thLocStyle}>
                    {!loc.bo?.has(c.k) && !c.hd && <OLoc c={c} loc={loc} />}
                  </th>
                )
              })}
            </tr>
          )}
        </thead>
        <tbody>
          {vs.topPadding > 0 && (
            <tr key="vs-top" aria-hidden><td colSpan={cols.length} style={{ height: vs.topPadding, padding: 0, border: 0 }} /></tr>
          )}
          {visibleRows.map((item, idx) => {
            const i = vs.isVirtual ? vs.startIndex + idx : idx
            if ((item as any).isGroup) {
              const grp = item as GroupNode
              return (
                <tr key={grp.id} className="ds-grp-row" onClick={() => onToggleGroup?.(grp.id)}>
                  <td colSpan={cols.length} style={{ paddingLeft: `${14 + (grp.level || 0) * 22}px` }}>
                    <span className="ds-grp-icon">{grp.expanded ? '▼' : '▶'}</span>
                    <span className="ds-grp-title">{grp.colTen}: <b>{grp.name}</b></span>
                    <span className="ds-grp-count">({grp.count} chứng từ)</span>
                    {grp.sums?.tong !== undefined && (
                      <span className="ds-grp-sum">Tổng: <b>{money(grp.sums.tong)} đ</b></span>
                    )}
                  </td>
                </tr>
              )
            }
            const r = item as Row
            const rowKey = vs.fast ? `f${idx}` : (r.id ?? i)
            return (
              <tr key={rowKey} className={[onRow ? 'click' : '', sel?.(r) ? 'dang-chon' : '', rowCls?.(r) ?? ''].join(' ')}
                onClick={onRow ? () => onRow(r) : undefined} onDoubleClick={onDbl ? () => onDbl(r) : undefined}>
                {cols.map((c, j) => {
                  const v = cell(c, r)
                  const title = motDong && (typeof v === 'string' || typeof v === 'number') ? String(v) : undefined
                  return <td key={c.k} className={[lop(c, j), c.cls ?? ''].join(' ')} style={tdStyle(c, j)} title={title}>{v}</td>
                })}
              </tr>
            )
          })}
          {vs.bottomPadding > 0 && (
            <tr key="vs-bot" aria-hidden><td colSpan={cols.length} style={{ height: vs.bottomPadding, padding: 0, border: 0 }} /></tr>
          )}
          {!vs.isVirtual && <tr className="tbl-spacer" aria-hidden><td colSpan={cols.length} /></tr>}
        </tbody>
        {sum && (
          <tfoot>
            <tr className="sum">
              {(() => {
                // Ô nhãn (chữ, vd "Tổng cộng (9 dòng)") trải sang các ô trống liền sau để không ép cột hẹp như cột #.
                // Không trải khi ô nhãn hoặc ô bị trải là cột đứng yên, để giữ vị trí sticky (T43)
                const nhan = cols.findIndex(c => c.k in sum && typeof sum[c.k] === 'string')
                let trai = 1
                if (nhan >= 0 && !vt[nhan].cls) {
                  while (nhan + trai < cols.length && !(cols[nhan + trai].k in sum) && !vt[nhan + trai].cls) trai++
                }
                return cols.map((c, j) => {
                  if (nhan >= 0 && j > nhan && j < nhan + trai) return null
                  const v = c.k in sum ? cell(c, sum) : null
                  const title = motDong && (typeof v === 'string' || typeof v === 'number') ? String(v) : undefined
                  const span = j === nhan && trai > 1 ? trai : undefined
                  return <td key={c.k} colSpan={span} className={lop(c, j)} style={span ? vt[j].style : tdStyle(c, j)} title={title}>{v}</td>
                })
              })()}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export const St = ({ k, children }: { k: string; children: ReactNode }) => <span className={`stt ${k}`}>{children}</span>
