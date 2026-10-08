// Bảng dữ liệu dùng chung: cột số căn phải, dòng tổng, bấm dòng để mở chi tiết, cột đứng yên khi cuộn ngang
import type { CSSProperties, ReactNode } from 'react'
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


export function Table({ cols, rows, sum, onRow, onDbl, sel, rowCls, maxH, motDong, loc }: {
  cols: Col[]; rows: Row[]; sum?: Row; onRow?: (r: Row) => void; onDbl?: (r: Row) => void; sel?: (r: Row) => boolean
  rowCls?: (r: Row) => string; maxH?: number; motDong?: boolean; loc?: LocCot
}) {
  const vt = viTri(cols)
  const lop = (c: Col, i: number) => [c.num ? 'num' : c.c ? 'c' : '', vt[i].cls].join(' ')
  return (
    <div className="tbl-wrap" style={maxH ? { maxHeight: maxH } : undefined}>
      <table className={`tbl${motDong ? ' mot-dong' : ''}`}>
        <thead>
          <tr>{cols.map((c, i) => <th key={c.k} className={lop(c, i)} style={{ ...(c.w ? { width: c.w } : {}), ...(c.dinh && c.w ? { minWidth: c.w } : {}), ...vt[i].style }}>{c.hd ?? c.t}</th>)}</tr>
          {loc && (
            <tr className="loc-hang">
              {cols.map((c, i) => (
                <th key={c.k} className={lop(c, i)} style={vt[i].style}>
                  {!loc.bo?.has(c.k) && !c.hd && <OLoc c={c} loc={loc} />}
                </th>
              ))}
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
                return <td key={c.k} className={[lop(c, j), c.cls ?? ''].join(' ')} style={vt[j].style} title={title}>{v}</td>
              })}
            </tr>
          ))}
          {sum && (
            <tr className="sum">
              {cols.map((c, j) => {
                const v = c.k in sum ? cell(c, sum) : null
                const title = motDong && (typeof v === 'string' || typeof v === 'number') ? String(v) : undefined
                return <td key={c.k} className={lop(c, j)} style={vt[j].style} title={title}>{v}</td>
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export const St = ({ k, children }: { k: string; children: ReactNode }) => <span className={`stt ${k}`}>{children}</span>
