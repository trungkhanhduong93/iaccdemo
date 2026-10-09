// Sổ nhật ký chung sinh từ doanh thu FABi của kỳ (3 ngày đầu), khớp số với chứng từ bán hàng
import type { Col, Row } from '../types'
import { DAILY, cnTen, soBH } from '../../data/mock'
import { dmy } from '../../ui/format'

const cols: Col[] = [
  { k: 'ngay', t: 'Ngày ghi sổ', w: 96 }, { k: 'so', t: 'Số chứng từ', cls: 'code', w: 140 }, { k: 'dg', t: 'Diễn giải' },
  { k: 'tk', t: 'Số hiệu TK', c: true, w: 90 }, { k: 'no', t: 'Nợ', num: true }, { k: 'co', t: 'Có', num: true },
]
function rows(thang: number): Row[] {
  const out: Row[] = []
  for (const x of DAILY.filter(d => d.date.getMonth() + 1 === thang && d.date.getDate() <= 3)) {
    const so = soBH(x), ngay = dmy(x.date), dg = `Doanh thu ${cnTen(x.cn)} ngày ${ngay.slice(0, 5)}`
    out.push({ ngay, so, dg, tk: '1111', no: x.tm }, { ngay, so, dg, tk: '1121', no: x.ck + x.the }, { ngay, so, dg, tk: '131', no: x.app },
      { ngay, so, dg, tk: '5111', co: x.dt }, { ngay, so, dg: 'Thuế GTGT đầu ra', tk: '33311', co: x.vat },
      { ngay, so: so.replace('BH', 'XB'), dg: 'Giá vốn xuất bán theo định lượng', tk: '632', no: x.gv }, { ngay, so: so.replace('BH', 'XB'), dg: 'Giá vốn xuất bán theo định lượng', tk: '152', co: x.gv })
  }
  const s = (k: string) => out.reduce((a, r) => a + (r[k] ?? 0), 0)
  return [...out, { dg: 'Cộng số phát sinh', no: s('no'), co: s('co'), _t: 1 }]
}
export const nhatKyChung = { cols, rows }
