// Bảng dữ liệu dùng chung: cột số căn phải, dòng tổng, bấm dòng để mở chi tiết
import type { ReactNode } from 'react'
import type { Col, Row } from '../modules/types'
import { money } from './format'

export function cell(c: Col, r: Row): ReactNode {
  if (c.r) return c.r(r)
  const v = r[c.k]
  if (c.num && typeof v === 'number') return v === 0 ? '' : money(v)
  return v
}

export function Table({ cols, rows, sum, onRow, sel, rowCls, maxH }: {
  cols: Col[]; rows: Row[]; sum?: Row; onRow?: (r: Row) => void; sel?: (r: Row) => boolean
  rowCls?: (r: Row) => string; maxH?: number
}) {
  return (
    <div className="tbl-wrap" style={maxH ? { maxHeight: maxH } : undefined}>
      <table className="tbl">
        <thead>
          <tr>{cols.map(c => <th key={c.k} className={c.num ? 'num' : c.c ? 'c' : ''} style={c.w ? { width: c.w } : undefined}>{c.t}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={[onRow ? 'click' : '', sel?.(r) ? 'sel' : '', rowCls?.(r) ?? ''].join(' ')} onClick={onRow ? () => onRow(r) : undefined}>
              {cols.map(c => <td key={c.k} className={[c.num ? 'num' : c.c ? 'c' : '', c.cls ?? ''].join(' ')}>{cell(c, r)}</td>)}
            </tr>
          ))}
          {sum && <tr className="sum">{cols.map(c => <td key={c.k} className={c.num ? 'num' : ''}>{c.k in sum ? cell(c, sum) : null}</td>)}</tr>}
        </tbody>
      </table>
    </div>
  )
}

export const St = ({ k, children }: { k: string; children: ReactNode }) => <span className={`stt ${k}`}>{children}</span>
