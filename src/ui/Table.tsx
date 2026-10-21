import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as PE, type ReactNode } from 'react'
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
export interface DoRong {
  gt: Record<string, number>
  dat: (k: string, w: number) => void
  xong?: (k: string, w: number) => void
}

export const BaoCaoDoRongCtx = createContext<DoRong | undefined>(undefined)

/** Kéo tay nắm ở mép phải ô tiêu đề để đổi độ rộng cột, tối thiểu 60px.
 * Dùng tỉ lệ offsetWidth / getBoundingClientRect().width để quy đổi delta chuột đúng cả khi html có zoom (T42) */
function keoRong(e: PE<HTMLSpanElement>, k: string, dat: DoRong['dat'], xong?: DoRong['xong']) {
  e.preventDefault()
  e.stopPropagation()
  const el = e.currentTarget
  const th = el.parentElement as HTMLElement
  const x0 = e.clientX
  const rect = th.getBoundingClientRect()
  const w0 = th.offsetWidth
  const scale = rect.width > 0 ? th.offsetWidth / rect.width : 1
  el.setPointerCapture(e.pointerId)
  let curW = w0
  const di = (ev: PointerEvent) => {
    const delta = (ev.clientX - x0) * scale
    curW = Math.max(60, Math.round(w0 + delta))
    dat(k, curW)
  }
  const tha = () => {
    el.removeEventListener('pointermove', di)
    el.removeEventListener('pointerup', tha)
    el.removeEventListener('pointercancel', tha)
    xong?.(k, curW)
  }
  el.addEventListener('pointermove', di)
  el.addEventListener('pointerup', tha)
  el.addEventListener('pointercancel', tha)
}

function docRong(kho: string): Record<string, number> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(kho) || '{}')
    return typeof v === 'object' && v !== null && !Array.isArray(v) && Object.values(v).every(y => typeof y === 'number')
      ? v as Record<string, number> : {}
  } catch {
    return {}
  }
}

/** Độ rộng cột đã kéo ở lưới chi tiết chứng từ, nhớ trên trình duyệt theo khoá màn (T618).
 *  Kéo thì đổi ngay trên bảng, thả chuột mới ghi vào localStorage */
export function useDoRongCot(khoa: string): DoRong {
  const kho = `iacc-cot-rong-ct:${khoa}`
  const [gt, setGt] = useState(() => docRong(kho))
  const [khoCu, setKhoCu] = useState(kho)
  if (khoCu !== kho) { setKhoCu(kho); setGt(docRong(kho)) }   // đổi màn, đổi tab thì đọc độ rộng của khoá mới
  return {
    gt,
    dat: (k, w) => setGt(x => (x[k] === w ? x : { ...x, [k]: w })),
    xong: (k, w) => {
      try { localStorage.setItem(kho, JSON.stringify({ ...docRong(kho), [k]: w })) } catch { /* không ghi được thì chỉ giữ trong phiên */ }
    },
  }
}

/** Ô tiêu đề của bảng tự vẽ (BangSua, BangKiemKe) có tay nắm kéo giãn như Table (T618).
 *  w: độ rộng mặc định; cột đã kéo thì cố định đúng độ rộng đó, tối thiểu 60px */
export function ThKeo({ k, w, minW, doRong, className, children }: {
  k: string; w?: number | string; minW?: number; doRong?: DoRong; className?: string; children?: ReactNode
}) {
  const keo = doRong?.gt[k]
  const style: CSSProperties = keo
    ? { width: Math.max(60, keo), minWidth: Math.max(60, keo), maxWidth: Math.max(60, keo) }
    : { ...(w !== undefined ? { width: w } : {}), ...(minW ? { minWidth: minW } : {}) }
  return (
    <th className={[className, keo ? 'da-keo' : ''].filter(Boolean).join(' ') || undefined} style={style} data-k={k}>
      {children}
      {doRong && <span className="ds-keo-rong" aria-hidden onPointerDown={e => keoRong(e, k, doRong.dat, doRong.xong)} />}
    </th>
  )
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
  doRong: doRongProp,
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
  const doRongCtx = useContext(BaoCaoDoRongCtx)
  const doRong = doRongProp ?? doRongCtx
  // Cột đã kéo giãn thì lấy độ rộng mới (tối thiểu 60px), kể cả để tính vị trí cột đứng yên (T41, T42)
  const cols = doRong ? cols0.map(c => doRong.gt[c.k] ? { ...c, w: Math.max(60, doRong.gt[c.k]) } : c) : cols0
  const keo = (c: Col) => Boolean(doRong?.gt[c.k])
  const vt = viTri(cols)
  const lop = (c: Col, i: number) => [c.num ? 'num' : c.c ? 'c' : '', c.wCung && c.w ? 'w-cung' : '', vt[i].cls].join(' ')

  // Bề rộng cột số tính một lần mỗi cột, không tính lại cho từng ô: sổ nhiều dòng từng treo vài giây (T196)
  const rongNum = new Map<string, number>()
  const rongDef = (c: Col) => {
    if (keo(c)) {
      const w = Math.max(60, c.w ?? 60)
      return { w, minW: w, maxW: w }
    }
    // Cột khai wCung: rộng đúng w, không giãn theo tiêu đề (T287)
    if (c.wCung && c.w) return { w: c.w, minW: c.w, maxW: c.w }
    if (c.num) {
      let w = rongNum.get(c.k)
      if (w === undefined) {
        w = tinhRongNum(c, rows as Row[], sum)
        rongNum.set(c.k, w)
      }
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

  // Đo bề rộng thật của các ô tiêu đề cột cố định bằng getBoundingClientRect / heSoZoom (T74, T372)
  const doCot = useCallback(() => {
    const tbl = tblRef.current
    if (!tbl) return
    const ths = tbl.querySelectorAll<HTMLTableCellElement>('thead tr.tbl-cot > th')
    if (!ths.length) return

    const z = heSoZoom()
    let accL = 0
    let trIdx = 0
    const phaiColsList: { colIdx: number; el: HTMLTableCellElement }[] = []

    cols.forEach((c, i) => {
      const th = ths[i]
      if (!th) return
      if (c.dinh === 'trai') {
        tbl.style.setProperty(`--tr-${trIdx}`, `${accL}px`)
        accL += th.getBoundingClientRect().width / z
        trIdx++
      } else if (c.dinh === 'phai') {
        phaiColsList.push({ colIdx: i, el: th })
      }
    })

    let accR = 0
    let phIdx = 0
    phaiColsList.reverse().forEach(item => {
      tbl.style.setProperty(`--ph-${phIdx}`, `${accR}px`)
      accR += item.el.getBoundingClientRect().width / z
      phIdx++
    })
  }, [cols])

  useLayoutEffect(() => {
    doCot()
    const tbl = tblRef.current
    if (!tbl) return
    const ths = tbl.querySelectorAll<HTMLTableCellElement>('thead tr.tbl-cot > th')
    if (!ths.length) return

    const ro = new ResizeObserver(() => {
      doCot()
    })
    cols.forEach((c, i) => {
      if ((c.dinh === 'trai' || c.dinh === 'phai') && ths[i]) {
        ro.observe(ths[i])
      }
    })
    window.addEventListener('resize', doCot)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', doCot)
    }
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

  // Chống xô giật bề rộng cột khi cuộn ảo (T148): chỉ áp dụng khi cuộn ảo đang bật (vs.isVirtual),
  // không đè minWidth lên bảng tĩnh để tránh hiện tượng giật cột khi đổi trang hay mở màn hình
  useLayoutEffect(() => {
    if (!wrapRef.current || !vs.isVirtual) return
    const ths = wrapRef.current.querySelectorAll<HTMLTableCellElement>('thead tr.tbl-cot > th')
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

  // Đặt lại minWidth chỉ khi cấu hình cột cols0 đổi, không reset theo rows khi phân trang (T148)
  useLayoutEffect(() => {
    if (!wrapRef.current) return
    const ths = wrapRef.current.querySelectorAll<HTMLTableCellElement>('thead tr.tbl-cot > th')
    ths.forEach(th => {
      const k = th.getAttribute('data-k')
      if (!k || !doRong?.gt[k]) th.style.minWidth = ''
    })
  }, [cols0])

  const coNhomCot = cols.some(c => c.nhom)   // tiêu đề 2 tầng; cột lẻ (không nhóm) căn giữa cả hai tầng như iFaster (T185)
  const visibleRows = vs.isVirtual ? rows.slice(vs.startIndex, vs.endIndex + 1) : rows

  return (
    <div ref={wrapRef} className="tbl-wrap" style={maxH ? { maxHeight: maxH } : undefined}>
      <table ref={tblRef} className={`tbl${motDong ? ' mot-dong' : ''}${keDoc ? ' ke-doc' : ''}`} style={initVars as CSSProperties}>
        <thead>
          {coNhomCot && (   // tiêu đề 2 tầng: ô nhóm gộp các cột liền nhau cùng nhom, cột lẻ để trống (T185)
            <tr className="tbl-nhom">
              {cols.map((c, i) => {
                if (c.nhom && cols[i - 1]?.nhom === c.nhom) return null
                let n = 1
                while (c.nhom && cols[i + n]?.nhom === c.nhom) n++
                return <th key={c.k} colSpan={n} className={c.nhom ? 'c' : 'trong'}>{c.nhom ?? ''}</th>
              })}
            </tr>
          )}
          <tr className="tbl-cot">{cols.map((c, i) => {
            const rd = rongDef(c)
            const thStyle: CSSProperties = {
              ...(rd.w ? { width: rd.w } : {}),
              ...(rd.minW ? { minWidth: rd.minW } : {}),
              ...(rd.maxW ? { maxWidth: rd.maxW } : {}),
              ...vt[i].style,
            }
            return (
              <th key={c.k} data-k={c.k} className={[lop(c, i), keo(c) ? 'da-keo' : '', coNhomCot && !c.nhom ? 'tbl-le' : ''].join(' ')}
                style={thStyle}>
                {coNhomCot && !c.nhom ? <span>{c.hd ?? c.t}</span> : c.hd ?? c.t}
                {doRong && c.k !== 'chk' && <span className="ds-keo-rong" aria-hidden onPointerDown={e => keoRong(e, c.k, doRong.dat, doRong.xong)} />}
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
              const hasSum = (c: Col) => grp.sums && typeof grp.sums[c.k] === 'number'
              const firstSumIdx = cols.findIndex(hasSum)
              const cuoiTraiIdx = cols.map(c => c.dinh).lastIndexOf('trai')
              const span0 = cuoiTraiIdx >= 0 && (firstSumIdx === -1 || cuoiTraiIdx < firstSumIdx)
                ? cuoiTraiIdx + 1
                : (firstSumIdx > 0 ? firstSumIdx : (firstSumIdx === -1 ? cols.length : 1))
              const isDinh0 = cuoiTraiIdx >= 0 && span0 <= cuoiTraiIdx + 1

              return (
                <tr key={grp.id} className="ds-grp-row" onClick={() => onToggleGroup?.(grp.id)}>
                  {cols.map((c, j) => {
                    if (j === 0) {
                      const cls = [
                        isDinh0 ? 'dinh dinh-cuoi' : '',
                        'ds-grp-cell',
                      ].filter(Boolean).join(' ')
                      return (
                        <td
                          key={c.k}
                          colSpan={span0 > 1 ? span0 : undefined}
                          className={cls}
                          style={{
                            ...(isDinh0 ? { left: 0 } : {}),
                            paddingLeft: `${14 + (grp.level || 0) * 22}px`,
                          }}
                        >
                          <span className="ds-grp-icon">{grp.expanded ? '▼' : '▶'}</span>
                          <span className="ds-grp-title">{grp.colTen}: <b>{grp.name}</b></span>
                          <span className="ds-grp-count">({grp.count} chứng từ)</span>
                        </td>
                      )
                    }
                    if (j < span0) return null

                    const val = grp.sums?.[c.k]
                    const txt = typeof val === 'number' ? money(val) : ''
                    return (
                      <td
                        key={c.k}
                        className={[lop(c, j), 'ds-grp-cell', c.num ? 'num' : ''].join(' ')}
                        style={tdStyle(c, j)}
                        title={motDong && txt ? txt : undefined}
                      >
                        {txt}
                      </td>
                    )
                  })}
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
