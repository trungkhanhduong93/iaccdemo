// Báo cáo bán hàng theo ngày, tổng hợp, chi tiết bán hàng (T157). Lấy đúng dòng món của chứng từ Xuất bán POS 3.1.1
// (tổng hợp theo kênh mỗi ngày, cửa hàng), nên doanh thu, thuế cộng lại bằng DAILY và ba báo cáo khớp nhau
import type { Col, Row } from '../types'
import { CUA_HANG, DAILY, HANG, trongThang } from '../../data/mock'
import { dmy } from '../../ui/format'
import { chiaTheo, dongCuaPhieu, soFabi, theoKenh } from './ChungTuBanHang'
import { docLocNguon, quaLocDong, quaLocDt } from '../bao-cao/loc-nguon'

/** Hệ số giá vốn theo nhóm món, như báo cáo bán hàng cũ: đồ uống rẻ vốn, bia rượu vốn cao */
const heSoGv = (nhom: string) => nhom === 'Đồ uống' ? 0.24 : nhom === 'Bia, rượu' ? 0.62 : 0.38

interface DongBan {
  ngay: string; so: string; kh: string; cn: string; ma: string; ten: string; nhom: string; dvt: string
  sl: number; gia: number; thanh: number; giam: number; tien: number; thue: number; gv: number
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
    }))
  })).filter(d => quaLocDong(f, d) && quaLocDt(f, d.kh))
}
const cong = (ds: Row[], k: string) => ds.reduce((a, x) => a + (Number(x[k]) || 0), 0)

/** Bán hàng theo ngày: mỗi ngày một dòng */
export const banHangTheoNgay = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'don', t: 'Số hoá đơn', num: true, w: 90 }, { k: 'thanh', t: 'Doanh thu hàng', num: true }, { k: 'giam', t: 'Giảm giá', num: true },
    { k: 'tien', t: 'Doanh thu thuần', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tong', t: 'Tổng thanh toán', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const id = CUA_HANG.find(c => c.ten === cn)?.id
    // Số hoá đơn là số đơn POS FABi gửi về trong ngày
    const don = new Map<string, number>()
    for (const x of DAILY) if (trongThang(x.date, thang, 2026) && (!id || x.cn === id)) don.set(dmy(x.date), (don.get(dmy(x.date)) ?? 0) + x.don)
    const nhom = new Map<string, Row>()
    for (const d of dongBan(thang, cn, loc)) {
      const g = nhom.get(d.ngay) ?? { ngay: d.ngay, don: don.get(d.ngay) ?? 0, thanh: 0, giam: 0, tien: 0, thue: 0, tong: 0 }
      g.thanh += d.thanh; g.giam += d.giam; g.tien += d.tien; g.thue += d.thue; g.tong += d.tien + d.thue
      nhom.set(d.ngay, g)
    }
    const ds = [...nhom.values()]
    return [...ds, { ngay: 'Tổng cộng', don: cong(ds, 'don'), thanh: cong(ds, 'thanh'), giam: cong(ds, 'giam'), tien: cong(ds, 'tien'), thue: cong(ds, 'thue'), tong: cong(ds, 'tong'), _t: 1 }]
  },
}

/** Tổng hợp bán hàng: gom theo mặt hàng, xếp theo nhóm hàng như danh mục */
export const tongHopBanHang = {
  cols: [{ k: 'nhom', t: 'Nhóm hàng', w: 110 }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 80 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 60 },
    { k: 'sl', t: 'Số lượng', num: true }, { k: 'thanh', t: 'Doanh thu', num: true }, { k: 'giam', t: 'Giảm giá', num: true }, { k: 'tien', t: 'Doanh thu thuần', num: true },
    { k: 'gv', t: 'Giá vốn', num: true }, { k: 'lg', t: 'Lãi gộp', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const nhom = new Map<string, Row>()
    for (const d of dongBan(thang, cn, loc)) {
      const g = nhom.get(d.ma) ?? { nhom: d.nhom, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: 0, thanh: 0, giam: 0, tien: 0, gv: 0, lg: 0 }
      g.sl += d.sl; g.thanh += d.thanh; g.giam += d.giam; g.tien += d.tien; g.gv += d.gv; g.lg += d.tien - d.gv
      nhom.set(d.ma, g)
    }
    const thuTu = HANG.map(h => h.ma)
    const ds = [...nhom.values()].sort((a, b) => thuTu.indexOf(a.ma) - thuTu.indexOf(b.ma))
    return [...ds, { ten: 'Tổng cộng', thanh: cong(ds, 'thanh'), giam: cong(ds, 'giam'), tien: cong(ds, 'tien'), gv: cong(ds, 'gv'), lg: cong(ds, 'lg'), _t: 1 }]
  },
}

/** Chi tiết bán hàng: mỗi dòng món của chứng từ một dòng */
export const chiTietBanHang = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 88 }, { k: 'so', t: 'Số hoá đơn', cls: 'code', w: 120 }, { k: 'kh', t: 'Khách hàng' }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 70 },
    { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 50 }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true },
    { k: 'thanh', t: 'Thành tiền', num: true }, { k: 'giam', t: 'Giảm giá', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tong', t: 'Tổng tiền', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const ds: Row[] = dongBan(thang, cn, loc).map(d => ({ ngay: d.ngay, so: d.so, kh: d.kh, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, thanh: d.thanh, giam: d.giam, thue: d.thue, tong: d.tien + d.thue }))
    return [...ds, { ten: 'Tổng cộng', thanh: cong(ds, 'thanh'), giam: cong(ds, 'giam'), thue: cong(ds, 'thue'), tong: cong(ds, 'tong'), _t: 1 }]
  },
}
