// Báo cáo bán hàng theo món và báo cáo doanh thu theo ngày, tính từ DAILY tháng 9/2026
import type { Col, Row } from '../types'
import { CHI_NHANH, HANG, daysOf, tongKy } from '../../data/mock'
import { dm } from '../../ui/format'

const TY_LE = [0.21, 0.09, 0.12, 0.14, 0.07, 0.15, 0.1, 0.09, 0.03]

export const baoCaoBanHang = {
  cols: [{ k: 'ma', t: 'Mã món', cls: 'code' }, { k: 'ten', t: 'Tên món' }, { k: 'nhom', t: 'Nhóm' }, { k: 'sl', t: 'Số lượng', num: true },
    { k: 'dt', t: 'Doanh thu', num: true }, { k: 'gv', t: 'Giá vốn', num: true }, { k: 'lg', t: 'Lãi gộp', num: true },
    { k: 'tl', t: 'Tỷ lệ lãi gộp', num: true }] as Col[],
  rows: (thang: number): Row[] => {
    // Doanh thu, giá vốn từng món chia theo cơ cấu; món cuối nhận phần còn lại để tổng khớp KQKD
    const t = tongKy(thang, 2026)
    const heSo = (n: string) => n === 'Đồ uống' ? 0.24 : n === 'Bia, rượu' ? 0.62 : 0.38
    const dts = HANG.map((_, i) => Math.round(t.dt * TY_LE[i]))
    dts[dts.length - 1] = t.dt - dts.slice(0, -1).reduce((a, x) => a + x, 0)
    const tho = HANG.map((h, i) => dts[i] * heSo(h.nhom))
    const tong = tho.reduce((a, x) => a + x, 0)
    const gvs = tho.map(x => Math.round(x / tong * t.gv))
    gvs[gvs.length - 1] = t.gv - gvs.slice(0, -1).reduce((a, x) => a + x, 0)
    const rows = HANG.map((h, i) => {
      const dt = dts[i], gv = gvs[i]
      return { ma: h.ma, ten: h.ten, nhom: h.nhom, sl: Math.round(dt / h.gia), dt, gv, lg: dt - gv, tl: ((dt - gv) / dt * 100).toFixed(1).replace('.', ',') + '%' }
    })
    const s = (k: string) => rows.reduce((a, r) => a + (r as Row)[k], 0)
    return [...rows, { ten: 'Tổng cộng', sl: s('sl'), dt: s('dt'), gv: s('gv'), lg: s('lg'), _t: 1 }]
  },
}

export const baoCaoDoanhThu = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 70 }, ...CHI_NHANH.map(c => ({ k: c.id, t: c.ngan, num: true })), { k: 'dt', t: 'Doanh thu chưa thuế', num: true },
    { k: 'vat', t: 'Thuế GTGT', num: true }, { k: 'don', t: 'Số đơn', num: true }] as Col[],
  rows: (thang: number): Row[] => {
    const ds = daysOf(thang, 2026)
    const ngay = [...new Set(ds.map(x => +x.date))]
    const rows: Row[] = ngay.map(d => {
      const n = ds.filter(x => +x.date === d)
      const r: Row = { ngay: dm(new Date(d)), dt: 0, vat: 0, don: 0 }
      for (const x of n) { r[x.cn] = x.dt; r.dt += x.dt; r.vat += x.vat; r.don += x.don }
      return r
    })
    const s = (k: string) => rows.reduce((a, r) => a + (r[k] ?? 0), 0)
    return [...rows, { ngay: 'Cộng', ...Object.fromEntries(CHI_NHANH.map(c => [c.id, s(c.id)])), dt: s('dt'), vat: s('vat'), don: s('don'), _t: 1 }]
  },
}
