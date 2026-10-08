// Bảng dữ liệu dùng chung: cột số căn phải, dòng tổng dính đáy, bấm dòng để mở chi tiết, cột đứng yên khi cuộn ngang
import type { CSSProperties, PointerEvent as PE, ReactNode } from 'react'
import type { Col, Row } from '../modules/types'
import { money } from './format'
import { OLoc, type LocCot } from './LocCot'

export function cell(c: Col, r: Row): ReactNode {
  if (c.r) return c.r(r)
  const v = r[c.k]
  if (c.num && typeof v === 'number') return v === 0 ? '' : money(v)
  return v
}

/** Vị trí của cột đứng yên: cột 'trai' cộng dồn bề rộng các cột 'trai' trước nó, cột 'phai' tính từ mép phải */
function viTri(cols: Col[]): { cls: string; style?: CSSProperties }[] {
  let trai = 0
  const out = cols.map(c => {
    if (c.dinh !== 'trai') return { cls: '' }
    const o = { cls: 'dinh', style: { left: trai } as CSSProperties }
    trai += c.w ?? 0
    return o
  })
  const cuoiTrai = cols.map(c => c.dinh).lastIndexOf('trai')
  if (cuoiTrai >= 0) out[cuoiTrai].cls += ' dinh-cuoi'
  const dauPhai = cols.findIndex(c => c.dinh === 'phai')
  if (dauPhai >= 0) out[dauPhai] = { cls: 'dinh dinh-phai', style: { right: 0 } }
  return out
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

export function Table({ cols: cols0, rows, sum, onRow, onDbl, sel, rowCls, maxH, motDong, loc, doRong, keDoc }: {
  cols: Col[]; rows: Row[]; sum?: Row; onRow?: (r: Row) => void; onDbl?: (r: Row) => void; sel?: (r: Row) => boolean
  rowCls?: (r: Row) => string; maxH?: number; motDong?: boolean; loc?: LocCot
  doRong?: DoRong                       // cho kéo giãn độ rộng cột
  keDoc?: boolean                       // kẻ dọc giữa các cột
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
      const w = tinhRongNum(c, rows, sum)
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
      ...(rd.minW ? { minWidth: rd.minW } : {}),
      ...(rd.maxW ? { maxWidth: rd.maxW } : {}),
    }
  }

  return (
    <div className="tbl-wrap" style={maxH ? { maxHeight: maxH } : undefined}>
      <table className={`tbl${motDong ? ' mot-dong' : ''}${keDoc ? ' ke-doc' : ''}`}>
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
              <th key={c.k} className={[lop(c, i), keo(c) ? 'da-keo' : ''].join(' ')}
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
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={[onRow ? 'click' : '', sel?.(r) ? 'dang-chon' : '', rowCls?.(r) ?? ''].join(' ')}
              onClick={onRow ? () => onRow(r) : undefined} onDoubleClick={onDbl ? () => onDbl(r) : undefined}>
              {cols.map((c, j) => {
                const v = cell(c, r)
                const title = motDong && (typeof v === 'string' || typeof v === 'number') ? String(v) : undefined
                return <td key={c.k} className={[lop(c, j), c.cls ?? ''].join(' ')} style={tdStyle(c, j)} title={title}>{v}</td>
              })}
            </tr>
          ))}
          {/* Hàng đệm để hấp thụ chiều cao thừa khi danh sách ít dòng, giữ dòng tổng luôn dính đáy bảng (T42) */}
          <tr className="tbl-spacer" aria-hidden="true">
            <td colSpan={cols.length} />
          </tr>
        </tbody>
        {sum && (
          <tfoot>
            <tr className="sum">
              {cols.map((c, j) => {
                const v = c.k in sum ? cell(c, sum) : null
                const title = motDong && (typeof v === 'string' || typeof v === 'number') ? String(v) : undefined
                return <td key={c.k} className={lop(c, j)} style={tdStyle(c, j)} title={title}>{v}</td>
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

export const St = ({ k, children }: { k: string; children: ReactNode }) => <span className={`stt ${k}`}>{children}</span>
