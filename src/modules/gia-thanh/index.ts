// Phân hệ Chi phí, giá thành
import type { Col, ModuleDef, Row } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { CHI_NHANH, HANG, chiPhiThang, tongKy } from '../../data/mock'

const tongHopChiPhi = {
  cols: [{ k: 'km', t: 'Khoản mục' }, ...CHI_NHANH.map(c => ({ k: c.id, t: c.ngan, num: true })), { k: 'tong', t: 'Tổng', num: true }] as Col[],
  rows: (thang: number): Row[] => {
    const cp = chiPhiThang(thang, 2026)
    const dts = CHI_NHANH.map(c => tongKy(thang, 2026, c.id))
    const tot = dts.reduce((a, x) => a + x.dt, 0)
    const dong = (km: string, v: number, theo?: number[]) => {
      const r: Row = { km, tong: v }
      CHI_NHANH.forEach((c, i) => { r[c.id] = Math.round(v * (theo ? theo[i] : dts[i].dt / tot)) })
      return r
    }
    const gv = dts.reduce((a, x) => a + x.gv, 0)
    const rows = [dong('Nguyên vật liệu trực tiếp', gv, dts.map(x => x.gv / gv)), dong('Nhân công', cp.luong), dong('Mặt bằng', cp.matBang),
      dong('Điện, nước, gas', cp.dienNuoc), dong('Khấu hao TSCĐ', cp.khauHao), dong('Phân bổ CCDC', cp.ccdc), dong('Chi phí khác', cp.khac)]
    const s = (k: string) => rows.reduce((a, r) => a + (r[k] ?? 0), 0)
    return [...rows, { km: 'Tổng cộng', ...Object.fromEntries(CHI_NHANH.map(c => [c.id, s(c.id)])), tong: s('tong'), _t: 1 }]
  },
}

const giaThanhMon = {
  cols: [{ k: 'ten', t: 'Món' }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'nvl', t: 'Nguyên vật liệu', num: true }, { k: 'nc', t: 'Nhân công', num: true },
    { k: 'sx', t: 'Chi phí chung', num: true }, { k: 'tong', t: 'Tổng giá thành', num: true }, { k: 'dv', t: 'Giá thành một phần', num: true }] as Col[],
  rows: (): Row[] => HANG.slice(0, 7).map((h, i) => {
    const sl = [8420, 2210, 4980, 6120, 3810, 12640, 6950][i]
    const nvl = Math.round(h.gia * (h.nhom === 'Đồ uống' ? 0.24 : 0.36)) * sl, nc = Math.round(h.gia * 0.12) * sl, sx = Math.round(h.gia * 0.08) * sl
    return { ten: h.ten, sl, nvl, nc, sx, tong: nvl + nc + sx, dv: Math.round((nvl + nc + sx) / sl) }
  }),
}

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '9.1.1': 'Phân bổ chi phí', '9.1.2': 'Tính giá thành' }

const giaThanh: ModuleDef = {
  key: 'gia-thanh', ten: 'Chi phí, giá thành', ngan: 'Giá thành', icon: 'flask', mod: 8,
  mota: 'Tập hợp chi phí, phân bổ, giá thành nhiều cấp cho món và bán thành phẩm',
  quyTrinh,
  screens: tuExcel(8, {
    '9.1.1': { tool: { nut: 'Phân bổ chi phí tháng 9/2026', mota: 'Phân bổ chi phí chung cho từng món: nhân công bếp, điện, gas, khấu hao bếp. Tiêu thức là nguyên vật liệu trực tiếp hoặc số lượng bán.',
      caiDat: [['Kỳ', 'Tháng 9/2026'], ['Tiêu thức', 'Chi phí nguyên vật liệu trực tiếp'], ['Khoản mục phân bổ', 'Nhân công bếp, điện, gas, khấu hao bếp']] } },
    '9.1.2': { tool: { nut: 'Tính giá thành tháng 9/2026', mota: 'Tính giá thành theo thứ tự cấp: nguyên liệu sơ chế, bán thành phẩm (nước dùng, sốt), rồi món bán. Giá thành cấp dưới làm giá xuất cho cấp trên.',
      caiDat: [['Kỳ', 'Tháng 9/2026'], ['Số cấp', '3 cấp: sơ chế, bán thành phẩm, món'], ['Phương pháp', 'Định mức kết hợp hệ số']] } },
    '9.2.1': { report: { kieu: 'bangke', ...tongHopChiPhi } },
    '9.2.2': { report: { kieu: 'bangke', ...giaThanhMon } },
  }, NGAN),
}
export default giaThanh
