// Hàng lọc từng cột dưới tiêu đề bảng: phễu chọn điều kiện theo kiểu dữ liệu của cột (T39)
import type { Col } from '../modules/types'
import { Dropdown, MenuHead, MenuItem, MenuSep } from './Dropdown'
import { Icon } from './Icon'
import { fold } from './format'

/** chu: chữ; so: số tiền, số lượng; ngay: dd/mm/yyyy; chon: chọn trong danh sách giá trị có sẵn */
export type KieuLoc = 'chu' | 'so' | 'ngay' | 'chon'
/** op: điều kiện; v: giá trị gõ; ds: các giá trị đã chọn của cột kiểu chon */
export interface GiaTriLoc { op: string; v: string; ds?: string[] }

export interface LocCot {
  gt: Record<string, GiaTriLoc>
  dat: (k: string, g: GiaTriLoc) => void
  bo?: Set<string>                        // cột không có ô lọc
  kieu: (c: Col) => KieuLoc
  luaChon?: Record<string, string[]>      // giá trị để chọn của cột kiểu chon
}

/** Điều kiện theo kiểu cột: mã, tên, ký hiệu hiện trên nút phễu */
export const PHEP: Record<Exclude<KieuLoc, 'chon'>, [string, string, string][]> = {
  chu: [['chua', 'Chứa', '∋'], ['khong', 'Không chứa', '∌'], ['bang', 'Bằng', '='], ['dau', 'Bắt đầu bằng', 'a…'], ['cuoi', 'Kết thúc bằng', '…a']],
  so: [['=', 'Bằng', '='], ['!=', 'Khác', '≠'], ['>', 'Lớn hơn', '>'], ['<', 'Nhỏ hơn', '<'], ['>=', 'Lớn hơn hoặc bằng', '≥'], ['<=', 'Nhỏ hơn hoặc bằng', '≤']],
  ngay: [['=', 'Đúng ngày', '='], ['<', 'Trước ngày', '<'], ['>', 'Sau ngày', '>'], ['>=', 'Từ ngày', '≥'], ['<=', 'Đến ngày', '≤']],
}
export const OP_DAU: Record<KieuLoc, string> = { chu: 'chua', so: '=', ngay: '=', chon: '' }

export const dangLoc = (g?: GiaTriLoc) => Boolean(g && (g.v.trim() || g.ds?.length))

const soSanh = (op: string, a: number, b: number) =>
  op === '=' ? a === b : op === '!=' ? a !== b : op === '>' ? a > b : op === '<' ? a < b : op === '>=' ? a >= b : a <= b

/** Dòng có khớp điều kiện lọc của cột không. chu là chữ hiện trong ô; so, ngay là giá trị gốc nếu có */
export function khopLoc(kieu: KieuLoc, g: GiaTriLoc, chu: string, so?: number, ngay?: Date): boolean {
  if (kieu === 'chon') return !g.ds?.length || g.ds.includes(chu)
  const v = g.v.trim()
  if (!v) return true
  if (kieu === 'so' && so !== undefined) {
    const n = Number(v.replace(/\./g, '').replace(',', '.'))
    return isNaN(n) ? true : soSanh(g.op, so, n)
  }
  if (kieu === 'ngay' && ngay) {
    const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (m) return soSanh(g.op, ngay.getTime(), new Date(+m[3], +m[2] - 1, +m[1]).getTime())
    return fold(chu).includes(fold(v))      // gõ dở ngày thì lọc theo chữ
  }
  const a = fold(chu), b = fold(v)
  return g.op === 'khong' ? !a.includes(b) : g.op === 'bang' ? a === b : g.op === 'dau' ? a.startsWith(b) : g.op === 'cuoi' ? a.endsWith(b) : a.includes(b)
}

/** Ô lọc của một cột: phễu chọn điều kiện và ô gõ, hoặc danh sách giá trị để tick */
export function OLoc({ c, loc }: { c: Col; loc: LocCot }) {
  const kieu = loc.kieu(c)
  const g = loc.gt[c.k] ?? { op: OP_DAU[kieu], v: '' }
  if (kieu === 'chon') {
    const ds = g.ds ?? []
    const tatCa = loc.luaChon?.[c.k] ?? []
    const doi = (x: string) => loc.dat(c.k, { ...g, ds: ds.includes(x) ? ds.filter(y => y !== x) : [...ds, x] })
    return (
      <Dropdown btnClass={`loc-chon${ds.length ? ' on' : ''}`} width={220} title={`Lọc cột ${c.t}`}
        label={<><span>{ds.length === 0 ? 'Tất cả' : ds.length === 1 ? ds[0] : `${ds.length} mục`}</span><Icon n="filter" className="ic sm" /></>}>
        <MenuHead>Chọn giá trị</MenuHead>
        {tatCa.map(x => <MenuItem key={x} on={ds.includes(x)} onClick={() => doi(x)}>{x}</MenuItem>)}
        <MenuSep />
        <MenuItem onClick={() => loc.dat(c.k, { ...g, ds: [] })}>Bỏ chọn, hiện tất cả</MenuItem>
      </Dropdown>
    )
  }
  const phep = PHEP[kieu]
  const ky = phep.find(p => p[0] === g.op)?.[2] ?? phep[0][2]
  return (
    <div className="loc-cell" onClick={e => e.stopPropagation()}>
      <Dropdown btnClass={`loc-pheu${g.v.trim() ? ' on' : ''}`} width={190} title={`Điều kiện lọc cột ${c.t}`} label={<span className="loc-ky">{ky}</span>}>
        {dong => <>
          <MenuHead>Điều kiện lọc</MenuHead>
          {phep.map(([op, ten, k]) => (
            <MenuItem key={op} on={g.op === op} right={<b className="loc-ky">{k}</b>} onClick={() => { loc.dat(c.k, { ...g, op }); dong() }}>{ten}</MenuItem>
          ))}
        </>}
      </Dropdown>
      <input className="loc-o" value={g.v} placeholder={kieu === 'ngay' ? 'dd/mm/yyyy' : 'Lọc'} aria-label={`Lọc cột ${c.t}`}
        inputMode={kieu === 'so' ? 'decimal' : undefined} onChange={e => loc.dat(c.k, { ...g, v: e.target.value })} />
    </div>
  )
}
