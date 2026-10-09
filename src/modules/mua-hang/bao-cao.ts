// Báo cáo mua hàng, nhập hàng lấy từ đúng các phiếu mua hàng 4.1.1 trong danh sách (cùng hạt giống), nên số khớp nhau (T63)
import type { Col, Row, VoucherCfg } from '../types'
import { chungTu, dongCua, type Dong } from '../../ui/generic/gen'

const MUA = ['Mua thịt bò, xương ống', 'Mua bánh phở tươi', 'Mua cà phê hạt Robusta', 'Mua bia Sài Gòn', 'Mua rau thơm các loại', 'Mua dầu ăn, gia vị']

/** Phiếu mua hàng 4.1.1; nguồn Thủ công hoặc Excel, không tải từ iPOS Inventory (T64) */
export const PHIEU_MUA: VoucherCfg = { prefix: 'MH', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm phiếu mua hàng', dong: 'nvl', tien: [0, 0], nguon: 'excel', dienGiai: MUA, soPhieu: 80,
  soTT58: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá', noCo: [['152', '331', 'Nhập kho nguyên vật liệu'], ['1331', '331', 'Thuế GTGT được khấu trừ']] }

/** Phiếu mua trong tháng, theo chi nhánh đang chọn (tên chi nhánh), kèm dòng hàng */
function phieuThang(thang: number, cn?: string) {
  return chungTu(PHIEU_MUA, '4.1.1')
    .filter(r => r.thang === thang && (!cn || r.cn === cn))
    .map((r): Row & { dong: Dong[] } => ({ ...r, dong: dongCua(PHIEU_MUA, `4.1.1-${r.id}`) }))
}
const cong = (ds: Row[], k: string) => ds.reduce((a, x) => a + (Number(x[k]) || 0), 0)

/** Chi tiết mua hàng: mỗi phiếu một dòng */
export const chiTietMua = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số phiếu', cls: 'code', w: 120 }, { k: 'doiTuong', t: 'Nhà cung cấp' }, { k: 'dienGiai', t: 'Diễn giải' },
    { k: 'tien', t: 'Tiền hàng', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tong', t: 'Tổng tiền', num: true }] as Col[],
  rows: (thang: number, cn?: string): Row[] => {
    const ds: Row[] = phieuThang(thang, cn).map(r => ({ ngay: r.ngay, so: r.so, doiTuong: r.doiTuong, dienGiai: r.dienGiai, tien: r.tien, thue: r.thue, tong: r.tong, nguon: r.nguon }))
    return [...ds, { doiTuong: 'Tổng cộng', tien: cong(ds, 'tien'), thue: cong(ds, 'thue'), tong: cong(ds, 'tong'), _t: 1 }]
  },
}

/** Tổng hợp mua hàng: gom theo nhà cung cấp */
export const tongHopMua = {
  cols: [{ k: 'doiTuong', t: 'Nhà cung cấp' }, { k: 'soPhieu', t: 'Số phiếu', num: true, w: 90 },
    { k: 'tien', t: 'Tiền hàng', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tong', t: 'Tổng tiền', num: true }] as Col[],
  rows: (thang: number, cn?: string): Row[] => {
    const nhom = new Map<string, Row>()
    for (const r of phieuThang(thang, cn)) {
      const g = nhom.get(r.doiTuong) ?? { doiTuong: r.doiTuong, soPhieu: 0, tien: 0, thue: 0, tong: 0 }
      g.soPhieu += 1; g.tien += r.tien; g.thue += r.thue; g.tong += r.tong
      nhom.set(r.doiTuong, g)
    }
    const ds = [...nhom.values()].sort((a, b) => b.tong - a.tong)
    return [...ds, { doiTuong: 'Tổng cộng', soPhieu: cong(ds, 'soPhieu'), tien: cong(ds, 'tien'), thue: cong(ds, 'thue'), tong: cong(ds, 'tong'), _t: 1 }]
  },
}

/** Chi tiết nhập: mỗi dòng hàng của phiếu mua một dòng */
export const chiTietNhap = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số phiếu', cls: 'code', w: 120 }, { k: 'doiTuong', t: 'Nhà cung cấp' }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 90 },
    { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 60 }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true }] as Col[],
  rows: (thang: number, cn?: string): Row[] => {
    const ds: Row[] = phieuThang(thang, cn).flatMap(r => r.dong.map(d => ({ ngay: r.ngay, so: r.so, doiTuong: r.doiTuong, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, tien: d.tien })))
    return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), _t: 1 }]
  },
}

/** Tổng hợp nhập: gom theo mặt hàng */
export const tongHopNhap = {
  cols: [{ k: 'ma', t: 'Mã hàng', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 60 },
    { k: 'sl', t: 'Số lượng nhập', num: true }, { k: 'gia', t: 'Đơn giá bình quân', num: true }, { k: 'tien', t: 'Giá trị nhập', num: true }] as Col[],
  rows: (thang: number, cn?: string): Row[] => {
    const nhom = new Map<string, Row>()
    for (const r of phieuThang(thang, cn)) for (const d of r.dong) {
      const g = nhom.get(d.ma) ?? { ma: d.ma, ten: d.ten, dvt: d.dvt, sl: 0, tien: 0 }
      g.sl += d.sl; g.tien += d.tien
      nhom.set(d.ma, g)
    }
    const ds = [...nhom.values()].map((g): Row => ({ ...g, gia: g.sl ? Math.round(g.tien / g.sl) : 0 })).sort((a, b) => b.tien - a.tien)
    return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), _t: 1 }]
  },
}
