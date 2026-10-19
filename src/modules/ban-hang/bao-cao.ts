// Báo cáo bán hàng theo ngày, tổng hợp, chi tiết bán hàng (T157). Lấy đúng dòng món của chứng từ Xuất bán POS 3.1.1
// (tổng hợp theo kênh mỗi ngày, cửa hàng), nên doanh thu, thuế cộng lại bằng DAILY và ba báo cáo khớp nhau
import type { Col, Row } from '../types'
import { CUA_HANG, DAILY, HANG, trongThang } from '../../data/mock'
import { dmy } from '../../ui/format'
import { chiaTheo, dongCuaPhieu, soFabi, theoKenh } from './ChungTuBanHang'
import { giamThueHkd } from './giam-thue'
import { docLocNguon, quaLocDong, quaLocDt } from '../bao-cao/loc-nguon'

/** Hệ số giá vốn theo nhóm món, như báo cáo bán hàng cũ: đồ uống rẻ vốn, bia rượu vốn cao */
const heSoGv = (nhom: string) => nhom === 'Đồ uống' ? 0.24 : nhom === 'Bia, rượu' ? 0.62 : 0.38

interface DongBan {
  ngay: string; so: string; kh: string; cn: string; ma: string; ten: string; nhom: string; dvt: string
  sl: number; gia: number; thanh: number; giam: number; tien: number; thue: number; gv: number
  ck: number; phiDv: number; phiVc: number; phieuGg: number   // các khoản của đơn POS theo món (T106, T453)
}

/** Dòng món của các chứng từ Xuất bán POS trong tháng; cn là tên cửa hàng chọn trên thanh trên.
 *  Giá vốn của chứng từ chia cho món theo doanh thu nhân hệ số nhóm, cộng lại bằng giá vốn ngày.
 *  Bộ lọc hàng hoá, nhóm hàng hoá, khách hàng lọc dòng món; không lọc kho vì đơn POS không ghi kho xuất (T207) */
function dongBan(thang: number, cn?: string, loc?: Record<string, string[]>): DongBan[] {
  const f = docLocNguon(loc)
  const id = CUA_HANG.find(c => c.ten === cn)?.id
  return DAILY.filter(x => trongThang(x.date, thang, 2026) && (!id || x.cn === id)).flatMap(x => theoKenh(x).flatMap(p => {
    const ds = dongCuaPhieu(p)
    const gv = chiaTheo(p.gv, ds.map(d => d.tien * heSoGv(d.nhom)), 1)
    const so = soFabi(`fabi-${p.seed}`)
    return ds.map((d, i): DongBan => ({
      ngay: dmy(p.date), so, kh: 'Khách lẻ POS', cn: CUA_HANG.find(c => c.id === p.cn)?.ten ?? p.cn, ma: d.ma, ten: d.ten, nhom: d.nhom, dvt: d.dvt,
      sl: d.sl, gia: d.gia, thanh: d.thanh, giam: d.giam, tien: d.tien, thue: d.thue, gv: gv[i],
      ck: d.ck, phiDv: d.phiDv, phiVc: d.phiVc, phieuGg: 0,   // dữ liệu mẫu FABi chưa có phiếu giảm giá
    }))
  })).filter(d => quaLocDong(f, d) && quaLocDt(f, d.kh))
}
const cong = (ds: Row[], k: string) => ds.reduce((a, x) => a + (Number(x[k]) || 0), 0)
/** Các cột tiền của dòng món theo mẫu báo cáo bán hàng iFaster (T453); thuế theo phương pháp GTGT (T450):
 *  % doanh thu thì không tiền thuế, có Giảm thuế GTGT; khấu trừ thì ngược lại.
 *  Doanh thu tính thuế = thành tiền − giảm giá − chiết khấu + phí dịch vụ;
 *  Tổng tiền = doanh thu tính thuế + thuế − giảm thuế − phiếu giảm giá + phí vận chuyển */
const tienDong = (d: DongBan, tyLe?: boolean) => {
  const dtTt = d.thanh - d.giam - d.ck + d.phiDv
  const giamThue = tyLe ? giamThueHkd(dtTt) : 0
  const thue = tyLe ? 0 : d.thue
  return { thanh: d.thanh, giam: d.giam, ck: d.ck, phiDv: d.phiDv, dtTt, thue, giamThue, phieuGg: d.phieuGg, phiVc: d.phiVc, tong: dtTt + thue - giamThue - d.phieuGg + d.phiVc }
}
const K_TIEN = ['thanh', 'giam', 'ck', 'phiDv', 'dtTt', 'thue', 'giamThue', 'phieuGg', 'phiVc', 'tong'] as const
const COT_TIEN: Col[] = [{ k: 'thanh', t: 'Thành tiền', num: true }, { k: 'giam', t: 'Giảm giá', num: true }, { k: 'ck', t: 'Chiết khấu', num: true },
  { k: 'phiDv', t: 'Phí dịch vụ', num: true }, { k: 'dtTt', t: 'Doanh thu tính thuế', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true },
  { k: 'giamThue', t: 'Giảm thuế GTGT', num: true }, { k: 'phieuGg', t: 'Phiếu giảm giá', num: true }, { k: 'phiVc', t: 'Phí vận chuyển', num: true },
  { k: 'tong', t: 'Tổng tiền', num: true }]
/** Cộng các cột tiền của dòng món vào dòng gom */
const congTien = (g: Row, t: ReturnType<typeof tienDong>) => { for (const k of K_TIEN) g[k] = (Number(g[k]) || 0) + t[k] }
const tongTien = (ds: Row[]) => Object.fromEntries(K_TIEN.map(k => [k, cong(ds, k)]))

/** Bán hàng theo ngày: mỗi ngày một dòng */
export const banHangTheoNgay = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'don', t: 'Số hoá đơn', num: true, w: 90 }, ...COT_TIEN] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>, tyLe?: boolean): Row[] => {
    const id = CUA_HANG.find(c => c.ten === cn)?.id
    // Số hoá đơn là số đơn POS FABi gửi về trong ngày
    const don = new Map<string, number>()
    for (const x of DAILY) if (trongThang(x.date, thang, 2026) && (!id || x.cn === id)) don.set(dmy(x.date), (don.get(dmy(x.date)) ?? 0) + x.don)
    const nhom = new Map<string, Row>()
    for (const d of dongBan(thang, cn, loc)) {
      const g = nhom.get(d.ngay) ?? { ngay: d.ngay, don: don.get(d.ngay) ?? 0 }
      congTien(g, tienDong(d, tyLe))
      nhom.set(d.ngay, g)
    }
    const ds = [...nhom.values()]
    return [...ds, { ngay: 'Tổng cộng', don: cong(ds, 'don'), ...tongTien(ds), _t: 1 }]
  },
}

/** Tổng hợp bán hàng: gom theo mặt hàng, xếp theo nhóm hàng như danh mục */
export const tongHopBanHang = {
  cols: [{ k: 'nhom', t: 'Nhóm hàng', w: 110 }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 80 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 60 },
    { k: 'sl', t: 'Số lượng', num: true }, ...COT_TIEN, { k: 'gv', t: 'Giá vốn', num: true }, { k: 'lg', t: 'Lãi gộp', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>, tyLe?: boolean): Row[] => {
    const nhom = new Map<string, Row>()
    for (const d of dongBan(thang, cn, loc)) {
      const g = nhom.get(d.ma) ?? { nhom: d.nhom, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: 0, gv: 0, lg: 0 }
      const t = tienDong(d, tyLe)
      congTien(g, t)
      g.sl = Number(g.sl) + d.sl; g.gv = Number(g.gv) + d.gv; g.lg = Number(g.lg) + t.dtTt - d.gv
      nhom.set(d.ma, g)
    }
    const thuTu = HANG.map(h => h.ma)
    const ds = [...nhom.values()].sort((a, b) => thuTu.indexOf(a.ma) - thuTu.indexOf(b.ma))
    return [...ds, { ten: 'Tổng cộng', ...tongTien(ds), gv: cong(ds, 'gv'), lg: cong(ds, 'lg'), _t: 1 }]
  },
}

/** Chi tiết bán hàng: mỗi dòng món của chứng từ một dòng */
export const chiTietBanHang = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 88 }, { k: 'so', t: 'Số hoá đơn', cls: 'code', w: 120 }, { k: 'kh', t: 'Khách hàng' }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 70 },
    { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 50 }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true },
    ...COT_TIEN] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>, tyLe?: boolean): Row[] => {
    const ds: Row[] = dongBan(thang, cn, loc).map(d => ({ ngay: d.ngay, so: d.so, kh: d.kh, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, ...tienDong(d, tyLe) }))
    return [...ds, { ten: 'Tổng cộng', ...tongTien(ds), _t: 1 }]
  },
}
