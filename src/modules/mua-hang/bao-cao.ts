// Báo cáo mua hàng, nhập hàng lấy từ đúng các phiếu mua hàng 4.1.1 trong danh sách (cùng hạt giống), nên số khớp nhau (T63)
import { createElement } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row, VoucherCfg } from '../types'
import { chungTu, dongCua, type Dong } from '../../ui/generic/gen'
import { datLocDaXem } from '../../ui/bao-cao/tuyChinhBC'
import { CHI_NHANH } from '../../data/mock'
import { KHOA_LOC_NGUON, docLocNguon, quaLocDong, quaLocDt } from '../bao-cao/loc-nguon'

const MUA = ['Mua thịt bò, xương ống', 'Mua bánh phở tươi', 'Mua cà phê hạt Robusta', 'Mua bia Sài Gòn', 'Mua rau thơm các loại', 'Mua dầu ăn, gia vị']

/** Phiếu mua hàng 4.1.1; nguồn Thủ công hoặc Excel, không tải từ iPOS Inventory (T64) */
export const PHIEU_MUA: VoucherCfg = { prefix: 'MH', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm phiếu mua hàng', dong: 'nvl', tien: [0, 0], nguon: 'excel', dienGiai: MUA, soPhieu: 80,
  soTT58: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá', noCo: [['152', '331', 'Nhập kho nguyên vật liệu'], ['1331', '331', 'Thuế GTGT được khấu trừ']] }

/** Phiếu mua trong tháng, theo chi nhánh đang chọn (tên chi nhánh), kèm dòng hàng.
 *  Bộ lọc nhà cung cấp lọc phiếu; kho, hàng hoá, nhóm hàng hoá lọc dòng hàng, phiếu không còn dòng thì bỏ (T207).
 *  Kho của dòng lấy như danh sách phiếu mua: kho ghi trên dòng, rồi kho trên phiếu, không có thì kho đầu của chi nhánh */
function phieuThang(thang: number, cn?: string, loc?: Record<string, string[]>) {
  const f = docLocNguon(loc)
  return chungTu(PHIEU_MUA, '4.1.1')
    .filter(r => r.thang === thang && (!cn || r.cn === cn) && quaLocDt(f, String(r.doiTuong)))
    .map((r): Row & { dong: Dong[] } => {
      const khoPhieu = String(r._kho || CHI_NHANH.find(c => c.ten === r.cn)?.kho[0] || '')
      return { ...r, dong: dongCua(PHIEU_MUA, `4.1.1-${r.id}`).filter(d => quaLocDong(f, { ...d, kho: d.kho || khoPhieu })) }
    })
    .filter(r => r.dong.length > 0)
}
const cong = (ds: Row[], k: string) => ds.reduce((a, x) => a + (Number(x[k]) || 0), 0)

/** Thành tiền (số lượng × đơn giá), chiết khấu, tiền trước thuế của dòng hàng; phiếu mẫu chưa có chiết khấu thì 0, nên tổng khớp phiếu (T200) */
const tienDong = (d: Dong) => { const ck = d.ck ?? 0; return { thanhTien: d.tien, ck, truocThue: d.tien - ck, thue: d.thue, tong: d.tien - ck + d.thue } }
const cotTien: Col[] = [{ k: 'thanhTien', t: 'Thành tiền', num: true }, { k: 'ck', t: 'Chiết khấu', num: true }, { k: 'truocThue', t: 'Tiền trước thuế', num: true },
  { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tong', t: 'Tổng tiền', num: true }]
const KHOA_TIEN = ['thanhTien', 'ck', 'truocThue', 'thue', 'tong'] as const
const congTien = (ds: Row[]): Row => Object.fromEntries(KHOA_TIEN.map(k => [k, cong(ds, k)]))
const tienPhieu = (dong: Dong[]): Row => congTien(dong.map(tienDong))

/** Chi tiết mua hàng: mỗi phiếu một dòng. Không hiện ở danh sách báo cáo, mở khi bấm nhà cung cấp ở Tổng hợp mua hàng (T200) */
export const chiTietMua = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số phiếu', cls: 'code', w: 120 }, { k: 'doiTuong', t: 'Nhà cung cấp' }, { k: 'dienGiai', t: 'Diễn giải' }, ...cotTien] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const ds: Row[] = phieuThang(thang, cn, loc).map(r => ({ ngay: r.ngay, so: r.so, doiTuong: r.doiTuong, dienGiai: r.dienGiai, nguon: r.nguon, ...tienPhieu(r.dong) }))
    return [...ds, { doiTuong: 'Tổng cộng', ...congTien(ds), _t: 1 }]
  },
}

/** Bấm nhà cung cấp mở Chi tiết mua hàng lọc sẵn nhà cung cấp đó, cùng kỳ (T200); giữ kho, hàng hoá, nhóm hàng đang lọc (T207) */
const moChiTiet = (x: Row) => createElement(Link, {
  to: '/app/bao-cao/4-2-1', className: 'bc-mo-so', title: 'Xem chi tiết mua hàng',
  onClick: () => datLocDaXem('/app/bao-cao/4-2-1', { ...x._loc, [KHOA_LOC_NGUON.dt]: [x.doiTuong] }, String(x._ky)),
}, x.doiTuong)

/** Tổng hợp mua hàng: gom theo nhà cung cấp */
export const tongHopMua = {
  cols: [{ k: 'doiTuong', t: 'Nhà cung cấp', r: x => x._t ? x.doiTuong : moChiTiet(x) }, { k: 'soPhieu', t: 'Số phiếu', num: true, w: 90 }, ...cotTien] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const nhom = new Map<string, Row[]>()
    for (const r of phieuThang(thang, cn, loc)) nhom.set(r.doiTuong, [...(nhom.get(r.doiTuong) ?? []), tienPhieu(r.dong)])
    const ds = [...nhom].map(([doiTuong, phieu]): Row => ({ doiTuong, soPhieu: phieu.length, ...congTien(phieu), _ky: thang, _loc: loc })).sort((a, b) => b.tong - a.tong)
    return [...ds, { doiTuong: 'Tổng cộng', soPhieu: cong(ds, 'soPhieu'), ...congTien(ds), _t: 1 }]
  },
}

/** Bảng kê mua hàng theo hàng hoá: như Chi tiết mua hàng nhưng mỗi mặt hàng của phiếu một dòng (T200) */
export const bangKeMuaTheoHang = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số phiếu', cls: 'code', w: 120 }, { k: 'doiTuong', t: 'Nhà cung cấp' }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 90 },
    { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 60 }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, ...cotTien] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const ds: Row[] = phieuThang(thang, cn, loc).flatMap(r => r.dong.map(d => ({ ngay: r.ngay, so: r.so, doiTuong: r.doiTuong, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, ...tienDong(d) })))
    return [...ds, { doiTuong: 'Tổng cộng', ...congTien(ds), _t: 1 }]
  },
}

/** Chi tiết nhập: mỗi dòng hàng của phiếu mua một dòng */
export const chiTietNhap = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số phiếu', cls: 'code', w: 120 }, { k: 'doiTuong', t: 'Nhà cung cấp' }, { k: 'ma', t: 'Mã hàng', cls: 'code', w: 90 },
    { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 60 }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const ds: Row[] = phieuThang(thang, cn, loc).flatMap(r => r.dong.map(d => ({ ngay: r.ngay, so: r.so, doiTuong: r.doiTuong, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, tien: d.tien })))
    return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), _t: 1 }]
  },
}

/** Tổng hợp nhập: gom theo mặt hàng */
export const tongHopNhap = {
  cols: [{ k: 'ma', t: 'Mã hàng', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên hàng' }, { k: 'dvt', t: 'ĐVT', c: true, w: 60 },
    { k: 'sl', t: 'Số lượng nhập', num: true }, { k: 'gia', t: 'Đơn giá bình quân', num: true }, { k: 'tien', t: 'Giá trị nhập', num: true }] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const nhom = new Map<string, Row>()
    for (const r of phieuThang(thang, cn, loc)) for (const d of r.dong) {
      const g = nhom.get(d.ma) ?? { ma: d.ma, ten: d.ten, dvt: d.dvt, sl: 0, tien: 0 }
      g.sl += d.sl; g.tien += d.tien
      nhom.set(d.ma, g)
    }
    const ds = [...nhom.values()].map((g): Row => ({ ...g, gia: g.sl ? Math.round(g.tien / g.sl) : 0 })).sort((a, b) => b.tien - a.tien)
    return [...ds, { ten: 'Tổng cộng', tien: cong(ds, 'tien'), _t: 1 }]
  },
}

/** Mua hàng theo ngày: gom theo từng ngày phát sinh (T97). Cột tiền như Tổng hợp mua hàng, bỏ Đã trả hàng, Đã thanh toán, Còn nợ (T205) */
export const muaHangTheoNgay = {
  cols: [{ k: 'ngay', t: 'Ngày', w: 92 }, ...cotTien] as Col[],
  rows: (thang: number, cn?: string, loc?: Record<string, string[]>): Row[] => {
    const nhom = new Map<string, Row[]>()
    for (const r of phieuThang(thang, cn, loc)) nhom.set(r.ngay, [...(nhom.get(r.ngay) ?? []), tienPhieu(r.dong)])
    const ds = [...nhom].map(([ngay, phieu]): Row => ({ ngay, ...congTien(phieu) })).sort((a, b) => a.ngay.localeCompare(b.ngay))
    return [...ds, { ngay: 'Tổng cộng', ...congTien(ds), _t: 1 }]
  },
}
