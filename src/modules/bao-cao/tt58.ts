// Nghiệp vụ và biểu mẫu Thông tư 58/2026/TT-BTC cho doanh nghiệp siêu nhỏ (T108).
import type { Col, Row } from '../types'
import type { PpGtgt, PpTndn } from '../../app/session'
import { du, soCai } from '../tong-hop/so-cai'
import { CHI_NHANH, NVL, kqkd } from '../../data/mock'
import { DS_TSCD } from '../tscd/data'
import { pad } from '../../ui/format'

/**
 * Ngày tháng chứng từ: kỳ tháng 10 chỉ có dữ liệu đến 07/10 (KY_CHON).
 * Co ngày gốc 1..30 về 1..7 khi thang === 10 để ngày chứng từ không vượt quá 07.
 */
export function ngayCt(ngay: number, thang: number): string {
  const d = thang === 10 ? Math.max(1, Math.min(7, Math.ceil((ngay / 30) * 7))) : ngay
  return `${pad(d)}/${pad(thang)}/2026`
}

/**
 * Số hiệu chứng từ dạng XX26MM-YY, dùng pad(thang) tránh sinh 26010
 */
export function soCt(prefix: string, thang: number, stt?: string | number): string {
  return stt !== undefined && stt !== '' ? `${prefix}26${pad(thang)}-${stt}` : `${prefix}26${pad(thang)}`
}

export type ThTT58 = 1 | 2 | 3 | 4

/**
 * Xác định trường hợp thuế TT58 từ phương pháp tính thuế GTGT và TNDN:
 * TH1: GTGT tỷ lệ % trên doanh thu, TNDN tỷ lệ % trên doanh thu
 * TH2: GTGT tỷ lệ % trên doanh thu, TNDN trên thu nhập tính thuế (mặc định)
 * TH3: GTGT khấu trừ, TNDN tỷ lệ % trên doanh thu
 * TH4: GTGT khấu trừ, TNDN trên thu nhập tính thuế
 */
export function thTT58(ppGtgt?: PpGtgt, ppTndn?: PpTndn): ThTT58 {
  const gtgt = ppGtgt ?? 'tyLe'
  const tndn = ppTndn ?? 'thuNhap'
  if (gtgt === 'tyLe' && tndn === 'tyLe') return 1
  if (gtgt === 'tyLe' && tndn === 'thuNhap') return 2
  if (gtgt === 'khauTru' && tndn === 'tyLe') return 3
  return 4
}

/** Tên trường hợp và bộ sổ bắt buộc tương ứng */
export function moTaBoSoTT58(th: ThTT58): string {
  switch (th) {
    case 1:
      return 'Trường hợp 1: S1-DNSN'
    case 2:
      return 'Trường hợp 2: S2a, S2b, S2c, S2d-DNSN'
    case 3:
      return 'Trường hợp 3: S3a, S3b-DNSN'
    case 4:
      return 'Trường hợp 4: S2b, S2c, S2d, S3b-DNSN'
  }
}

// Tỷ lệ mẫu, chưa đối chiếu pháp luật thuế (T04)
export interface NhomNganhTT58 {
  ten: string
  tyLeGtgt: number
  tyLeTndn: number
}

export const NHOM_NGANH_TT58: NhomNganhTT58[] = [
  { ten: 'Dịch vụ ăn uống', tyLeGtgt: 3, tyLeTndn: 1.5 },
  { ten: 'Bán lẻ hàng hóa', tyLeGtgt: 1, tyLeTndn: 0.5 },
]

/** 6 mục chi phí trên S2b-DNSN theo sheet "Dong in san" */
export const MUC_CHI_PHI_S2B = [
  { ma: 'a', ten: 'Chi phí nguyên liệu, vật liệu, nhiên liệu, năng lượng, hàng hóa' },
  { ma: 'b', ten: 'Chi phí tiền lương, tiền công, các khoản phụ cấp và bảo hiểm bắt buộc cho người lao động' },
  { ma: 'c', ten: 'Chi phí khấu hao tài sản cố định' },
  { ma: 'd', ten: 'Chi phí dịch vụ mua ngoài (điện, nước, vận chuyển, sửa chữa...)' },
  { ma: 'đ', ten: 'Chi phí lãi tiền vay' },
  { ma: 'e', ten: 'Chi phí khác phục vụ hoạt động sản xuất, kinh doanh' },
]

// ── S1-DNSN: Sổ doanh thu bán hàng hóa, dịch vụ (TH1) ──
export const colsS1: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 100, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', kyHieu: 'C' },
  { k: 'tien', t: 'Số tiền', num: true, kyHieu: '1' },
]

export function rowsS1(thang: number): Row[] {
  const q = kqkd(thang, 2026)
  const dt1 = Math.round(q.dtThuan * 0.85) // Dịch vụ ăn uống
  const dt2 = q.dtThuan - dt1             // Bán lẻ hàng hóa
  const vat1 = Math.round(dt1 * 0.03)
  const tndn1 = Math.round(dt1 * 0.015)
  const vat2 = Math.round(dt2 * 0.01)
  const tndn2 = Math.round(dt2 * 0.005)

  return [
    { dienGiai: '1. Nhóm Dịch vụ ăn uống (GTGT 3%, TNDN 1,5%)', _b: 1, _nhom: 1 },
    { so: soCt('BH', thang, '01'), ngay: ngayCt(5, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 1', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '02'), ngay: ngayCt(12, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 2', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '03'), ngay: ngayCt(19, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 3', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '04'), ngay: ngayCt(26, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 4', tien: dt1 - Math.round(dt1 * 0.25) * 3 },
    { dienGiai: 'Tổng cộng (1)', tien: dt1, _b: 1 },
    { dienGiai: 'Thuế GTGT (3%)', tien: vat1, _b: 1 },
    { dienGiai: 'Thuế TNDN (1,5%)', tien: tndn1, _b: 1 },

    { dienGiai: '2. Nhóm Bán lẻ hàng hóa (GTGT 1%, TNDN 0,5%)', _b: 1, _nhom: 1 },
    { so: soCt('BH', thang, '05'), ngay: ngayCt(15, thang), dienGiai: 'Doanh thu bán lẻ hàng đóng gói đợt 1', tien: Math.round(dt2 * 0.5) },
    { so: soCt('BH', thang, '06'), ngay: ngayCt(28, thang), dienGiai: 'Doanh thu bán lẻ hàng đóng gói đợt 2', tien: dt2 - Math.round(dt2 * 0.5) },
    { dienGiai: 'Tổng cộng (2)', tien: dt2, _b: 1 },
    { dienGiai: 'Thuế GTGT (1%)', tien: vat2, _b: 1 },
    { dienGiai: 'Thuế TNDN (0,5%)', tien: tndn2, _b: 1 },

    { dienGiai: 'Tổng số thuế GTGT phải nộp', tien: vat1 + vat2, _t: 1 },
    { dienGiai: 'Tổng số thuế TNDN phải nộp', tien: tndn1 + tndn2, _t: 1 },
  ]
}

// ── S2a-DNSN: Sổ doanh thu bán hàng hóa, dịch vụ theo dõi thuế GTGT (TH2) ──
export const colsS2a: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 100, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', kyHieu: 'C' },
  { k: 'tien', t: 'Số tiền', num: true, kyHieu: '1' },
]

export function rowsS2a(thang: number): Row[] {
  const q = kqkd(thang, 2026)
  const dt1 = Math.round(q.dtThuan * 0.85)
  const dt2 = q.dtThuan - dt1
  const vat1 = Math.round(dt1 * 0.03)
  const vat2 = Math.round(dt2 * 0.01)
  const tongVatTrongKy = vat1 + vat2
  const vatDauKy = Math.round(tongVatTrongKy * 0.45)
  const daNop = Math.round((vatDauKy + tongVatTrongKy) * 0.7)
  const vatCuoiKy = vatDauKy + tongVatTrongKy - daNop

  return [
    { dienGiai: 'Số thuế GTGT còn phải nộp đầu kỳ (1)', tien: vatDauKy, _b: 1 },
    { dienGiai: 'Số phát sinh trong kỳ', _b: 1 },
    { dienGiai: 'A. Nhóm Dịch vụ ăn uống (GTGT 3%)', _b: 1, _nhom: 1 },
    { so: soCt('BH', thang, '01'), ngay: ngayCt(5, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 1', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '02'), ngay: ngayCt(12, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 2', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '03'), ngay: ngayCt(19, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 3', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '04'), ngay: ngayCt(26, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 4', tien: dt1 - Math.round(dt1 * 0.25) * 3 },
    { dienGiai: 'Tổng cộng (A)', tien: dt1, _b: 1 },
    { dienGiai: 'Thuế GTGT', tien: vat1, _b: 1 },

    { dienGiai: 'B. Nhóm Bán lẻ hàng hóa (GTGT 1%)', _b: 1, _nhom: 1 },
    { so: soCt('BH', thang, '05'), ngay: ngayCt(15, thang), dienGiai: 'Doanh thu bán lẻ hàng đóng gói đợt 1', tien: Math.round(dt2 * 0.5) },
    { so: soCt('BH', thang, '06'), ngay: ngayCt(28, thang), dienGiai: 'Doanh thu bán lẻ hàng đóng gói đợt 2', tien: dt2 - Math.round(dt2 * 0.5) },
    { dienGiai: 'Tổng cộng (B)', tien: dt2, _b: 1 },
    { dienGiai: 'Thuế GTGT', tien: vat2, _b: 1 },

    { dienGiai: 'Tổng số thuế GTGT phải nộp trong kỳ (2)', tien: tongVatTrongKy, _t: 1 },
    { so: soCt('UNC', thang, '88'), ngay: ngayCt(20, thang), dienGiai: 'Số thuế GTGT đã nộp trong kỳ (3)', tien: daNop },
    { dienGiai: 'Số thuế GTGT còn phải nộp cuối kỳ {(4) = (1) + (2) - (3)}', tien: vatCuoiKy, _t: 1 },
  ]
}

// ── S3a-DNSN: Sổ doanh thu bán hàng hóa, dịch vụ theo dõi thuế TNDN theo tỷ lệ % (TH3) ──
export const colsS3a: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 100, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', kyHieu: 'C' },
  { k: 'tien', t: 'Số tiền', num: true, kyHieu: '1' },
]

export function rowsS3a(thang: number): Row[] {
  const q = kqkd(thang, 2026)
  const dt1 = Math.round(q.dtThuan * 0.85)
  const dt2 = q.dtThuan - dt1
  const tndn1 = Math.round(dt1 * 0.015)
  const tndn2 = Math.round(dt2 * 0.005)
  const tongTndnTrongKy = tndn1 + tndn2
  const tndnDauKy = Math.round(tongTndnTrongKy * 0.35)
  const daNop = Math.round((tndnDauKy + tongTndnTrongKy) * 0.6)
  const tndnCuoiKy = tndnDauKy + tongTndnTrongKy - daNop

  return [
    { dienGiai: 'Số thuế TNDN còn phải nộp đầu kỳ (1)', tien: tndnDauKy, _b: 1 },
    { dienGiai: 'Số phát sinh trong kỳ', _b: 1 },
    { dienGiai: 'A. Nhóm Dịch vụ ăn uống (TNDN 1,5%)', _b: 1, _nhom: 1 },
    { so: soCt('BH', thang, '01'), ngay: ngayCt(5, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 1', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '02'), ngay: ngayCt(12, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 2', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '03'), ngay: ngayCt(19, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 3', tien: Math.round(dt1 * 0.25) },
    { so: soCt('BH', thang, '04'), ngay: ngayCt(26, thang), dienGiai: 'Doanh thu dịch vụ ăn uống tuần 4', tien: dt1 - Math.round(dt1 * 0.25) * 3 },
    { dienGiai: 'Tổng cộng (A)', tien: dt1, _b: 1 },
    { dienGiai: 'Thuế TNDN', tien: tndn1, _b: 1 },

    { dienGiai: 'B. Nhóm Bán lẻ hàng hóa (TNDN 0,5%)', _b: 1, _nhom: 1 },
    { so: soCt('BH', thang, '05'), ngay: ngayCt(15, thang), dienGiai: 'Doanh thu bán lẻ hàng đóng gói đợt 1', tien: Math.round(dt2 * 0.5) },
    { so: soCt('BH', thang, '06'), ngay: ngayCt(28, thang), dienGiai: 'Doanh thu bán lẻ hàng đóng gói đợt 2', tien: dt2 - Math.round(dt2 * 0.5) },
    { dienGiai: 'Tổng cộng (B)', tien: dt2, _b: 1 },
    { dienGiai: 'Thuế TNDN', tien: tndn2, _b: 1 },

    { dienGiai: 'Tổng số thuế TNDN phải nộp trong kỳ (2)', tien: tongTndnTrongKy, _t: 1 },
    { so: soCt('UNC', thang, '89'), ngay: ngayCt(20, thang), dienGiai: 'Số thuế TNDN đã nộp trong kỳ (3)', tien: daNop },
    { dienGiai: 'Số thuế TNDN còn phải nộp cuối kỳ {(4) = (1) + (2) - (3)}', tien: tndnCuoiKy, _t: 1 },
  ]
}

// ── S2b-DNSN: Sổ chi tiết doanh thu, chi phí theo dõi thuế TNDN (TH2, TH4) ──
export const colsS2b: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 100, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', kyHieu: 'C' },
  { k: 'tien', t: 'Số tiền', num: true, kyHieu: '1' },
]

export function chiTietS2b(thang: number) {
  const q = kqkd(thang, 2026)
  const sc = soCai(thang)
  const dt = q.dtThuan
  // 6 mục chi phí phân bổ từ chi phí thực tế trong kqkd để tổng khớp q.dtThuan - q.lnTruocThue
  const tongCp = q.dtThuan - q.lnTruocThue
  const cpNvl = q.gv
  const cpLuong = q.cp.luong
  const cpKhauHao = q.cp.khauHao
  const cpDienNuoc = q.cp.dienNuoc
  const cpLaiVay = q.cpTc
  const cpKhac = tongCp - (cpNvl + cpLuong + cpKhauHao + cpDienNuoc + cpLaiVay)

  const thueTrongKy = q.thue
  const thueDauKy = Math.max(0, -du(sc.mo, '3334'))
  const daNop = Math.round((thueDauKy + thueTrongKy) * 0.5)
  const thueCuoiKy = thueDauKy + thueTrongKy - daNop

  return {
    dt,
    tongCp,
    cpNvl,
    cpLuong,
    cpKhauHao,
    cpDienNuoc,
    cpLaiVay,
    cpKhac,
    lnTruocThue: q.lnTruocThue,
    thueTrongKy,
    thueDauKy,
    daNop,
    thueCuoiKy,
    lnSauThue: q.lnSauThue,
  }
}

export function rowsS2b(thang: number): Row[] {
  const b = chiTietS2b(thang)
  return [
    { dienGiai: 'Số thuế TNDN còn phải nộp đầu kỳ (1)', tien: b.thueDauKy, _b: 1 },
    { dienGiai: 'Số phát sinh trong kỳ', _b: 1 },
    { dienGiai: '1. Doanh thu và thu nhập', tien: b.dt, _b: 1 },
    { so: soCt('BH', thang), ngay: ngayCt(30, thang), dienGiai: 'Doanh thu thuần bán hàng hóa và cung cấp dịch vụ trong kỳ', tien: b.dt },
    { dienGiai: '2. Chi phí', tien: b.tongCp, _b: 1 },
    { so: soCt('MH', thang), ngay: ngayCt(15, thang), dienGiai: 'a) Chi phí nguyên liệu, vật liệu, nhiên liệu, năng lượng, hàng hóa', tien: b.cpNvl },
    { so: soCt('PC', thang, 'L'), ngay: ngayCt(5, thang), dienGiai: 'b) Chi phí tiền lương, tiền công, các khoản phụ cấp và bảo hiểm bắt buộc cho người lao động', tien: b.cpLuong },
    { so: soCt('KH', thang), ngay: ngayCt(30, thang), dienGiai: 'c) Chi phí khấu hao tài sản cố định', tien: b.cpKhauHao },
    { so: soCt('PC', thang, 'DV'), ngay: ngayCt(20, thang), dienGiai: 'd) Chi phí dịch vụ mua ngoài (điện, nước, vận chuyển, sửa chữa...)', tien: b.cpDienNuoc },
    { so: soCt('UNC', thang, 'V'), ngay: ngayCt(25, thang), dienGiai: 'đ) Chi phí lãi tiền vay', tien: b.cpLaiVay },
    { so: soCt('PC', thang, 'K'), ngay: ngayCt(28, thang), dienGiai: 'e) Chi phí khác phục vụ hoạt động sản xuất, kinh doanh', tien: b.cpKhac },
    { dienGiai: 'Tổng số thuế TNDN phải nộp trong kỳ (2)', tien: b.thueTrongKy, _t: 1 },
    { so: soCt('UNC', thang, 'T'), ngay: ngayCt(20, thang), dienGiai: 'Số thuế TNDN đã nộp trong kỳ (3)', tien: b.daNop },
    { dienGiai: 'Số thuế TNDN còn phải nộp cuối kỳ {(4) = (1) + (2) - (3)}', tien: b.thueCuoiKy, _t: 1 },
  ]
}

// ── S2c-DNSN: Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa (TH2, TH4) ──
export const colsS2c: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 85, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 85, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', w: 140, kyHieu: 'C' },
  { k: 'dvt', t: 'Đơn vị tính', c: true, w: 55, kyHieu: 'D' },
  { k: 'gia', t: 'Đơn giá', num: true, w: 75, kyHieu: '1' },
  { k: 'slNhap', t: 'Số lượng', num: true, w: 65, nhom: 'Nhập', kyHieu: '2' },
  { k: 'ttNhap', t: 'Thành tiền', num: true, w: 85, nhom: 'Nhập', kyHieu: '3' },
  { k: 'slXuat', t: 'Số lượng', num: true, w: 65, nhom: 'Xuất', kyHieu: '4' },
  { k: 'ttXuat', t: 'Thành tiền', num: true, w: 85, nhom: 'Xuất', kyHieu: '5' },
  { k: 'slTon', t: 'Số lượng', num: true, w: 65, nhom: 'Tồn', kyHieu: '6' },
  { k: 'ttTon', t: 'Thành tiền', num: true, w: 85, nhom: 'Tồn', kyHieu: '7' },
  { k: 'ghiChu', t: 'Ghi chú', w: 70, kyHieu: '—' },
]

export function chiTietS2c(thang: number) {
  const sc = soCai(thang)
  const htkMo = sc.mo['152'] ?? 398_700_000
  const htkCuoi = sc.cuoi['152'] ?? 420_000_000
  const giaNhap = 85_000
  const slDau = Math.round(htkMo / giaNhap)
  const slNhap1 = 2_200
  const ttNhap1 = slNhap1 * giaNhap
  const slNhap2 = 1_800
  const ttNhap2 = slNhap2 * giaNhap
  const tongSlNhap = slNhap1 + slNhap2
  const tongTtNhap = ttNhap1 + ttNhap2

  // Đơn giá bình quân gia quyền cả kỳ = (tồn đầu + nhập trong kỳ) / (sl tồn đầu + sl nhập trong kỳ)
  const donGiaBq = Math.round((htkMo + tongTtNhap) / (slDau + tongSlNhap))
  const tongTtXuat = htkMo + tongTtNhap - htkCuoi
  const tongSlXuat = Math.round(tongTtXuat / donGiaBq)
  const slXuat1 = Math.round(tongSlXuat * 0.45)
  const ttXuat1 = Math.round(slXuat1 * donGiaBq)
  const slXuat2 = tongSlXuat - slXuat1
  const ttXuat2 = tongTtXuat - ttXuat1
  const slCuoi = slDau + tongSlNhap - tongSlXuat

  return {
    htkMo,
    slDau,
    tongSlNhap,
    tongTtNhap,
    donGiaBq,
    tongSlXuat,
    tongTtXuat,
    htkCuoi,
    slCuoi,
    slNhap1, ttNhap1, slNhap2, ttNhap2,
    slXuat1, ttXuat1, slXuat2, ttXuat2,
  }
}

export function rowsS2c(thang: number, tenMatHang = NVL[0].ten, _tenKho = CHI_NHANH[0].ten): Row[] {
  const c = chiTietS2c(thang)
  const dvt = NVL.find(n => n.ten === tenMatHang)?.dvt ?? 'kg'
  let slHien = c.slDau
  let ttHien = c.htkMo

  const r1TonSl = slHien + c.slNhap1
  const r1TonTt = ttHien + c.ttNhap1
  slHien = r1TonSl - c.slXuat1
  ttHien = r1TonTt - c.ttXuat1

  const r3TonSl = slHien + c.slNhap2
  const r3TonTt = ttHien + c.ttNhap2
  slHien = r3TonSl - c.slXuat2
  ttHien = r3TonTt - c.ttXuat2

  return [
    {
      dienGiai: `Số dư đầu kỳ (${tenMatHang})`,
      dvt,
      gia: c.donGiaBq,
      slTon: c.slDau,
      ttTon: c.htkMo,
      _b: 1,
    },
    {
      so: soCt('PN', thang, '01'),
      ngay: ngayCt(4, thang),
      dienGiai: `Nhập mua ${tenMatHang.toLowerCase()} đợt 1`,
      dvt,
      gia: 85_000,
      slNhap: c.slNhap1,
      ttNhap: c.ttNhap1,
      slTon: r1TonSl,
      ttTon: r1TonTt,
    },
    {
      so: soCt('PX', thang, '01'),
      ngay: ngayCt(12, thang),
      dienGiai: `Xuất chế biến ${tenMatHang.toLowerCase()} đợt 1 (giá BQ)`,
      dvt,
      gia: c.donGiaBq,
      slXuat: c.slXuat1,
      ttXuat: c.ttXuat1,
      slTon: r1TonSl - c.slXuat1,
      ttTon: r1TonTt - c.ttXuat1,
    },
    {
      so: soCt('PN', thang, '02'),
      ngay: ngayCt(18, thang),
      dienGiai: `Nhập mua ${tenMatHang.toLowerCase()} đợt 2`,
      dvt,
      gia: 85_000,
      slNhap: c.slNhap2,
      ttNhap: c.ttNhap2,
      slTon: r3TonSl,
      ttTon: r3TonTt,
    },
    {
      so: soCt('PX', thang, '02'),
      ngay: ngayCt(28, thang),
      dienGiai: `Xuất chế biến ${tenMatHang.toLowerCase()} đợt 2 (giá BQ)`,
      dvt,
      gia: c.donGiaBq,
      slXuat: c.slXuat2,
      ttXuat: c.ttXuat2,
      slTon: c.slCuoi,
      ttTon: c.htkCuoi,
    },
    {
      dienGiai: 'Cộng phát sinh trong kỳ',
      slNhap: c.tongSlNhap,
      ttNhap: c.tongTtNhap,
      slXuat: c.tongSlXuat,
      ttXuat: c.tongTtXuat,
      _t: 1,
    },
    {
      dienGiai: 'Số dư cuối kỳ',
      dvt,
      gia: c.donGiaBq,
      slTon: c.slCuoi,
      ttTon: c.htkCuoi,
      _t: 1,
    },
  ]
}

// ── S2d-DNSN: Sổ chi tiết tiền (TH2, TH4) ──
export const colsS2d: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 100, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', kyHieu: 'C' },
  { k: 'thu', t: 'Thu / Gửi vào', num: true, kyHieu: '1' },
  { k: 'chi', t: 'Chi / Rút ra', num: true, kyHieu: '2' },
]

export function chiTietS2d(thang: number) {
  const sc = soCai(thang)
  const tmDau = sc.mo['1111'] ?? 286_400_000
  const tmCuoi = sc.cuoi['1111'] ?? 295_000_000
  const tgDau = sc.mo['1121'] ?? 404_650_000
  const tgCuoi = sc.cuoi['1121'] ?? 430_000_000

  const tongThuTm = sc.no['1111'] ?? 180_000_000
  const tongChiTm = sc.co['1111'] ?? 171_400_000

  const tongThuTg = sc.no['1121'] ?? 350_000_000
  const tongChiTg = sc.co['1121'] ?? 324_650_000

  return {
    tmDau,
    tmCuoi,
    tongThuTm,
    tongChiTm,
    tgDau,
    tgCuoi,
    tongThuTg,
    tongChiTg,
    tongTienCuoi: tmCuoi + tgCuoi,
    tongTienDau: tmDau + tgDau,
  }
}

export function rowsS2d(thang: number): Row[] {
  const c = chiTietS2d(thang)
  return [
    { dienGiai: 'I. TIỀN MẶT', _b: 1, _nhom: 1 },
    { dienGiai: 'Tiền mặt tồn đầu kỳ', thu: c.tmDau, _b: 1 },
    { so: soCt('PT', thang, '01'), ngay: ngayCt(7, thang), dienGiai: 'Thu tiền bán hàng bằng tiền mặt', thu: Math.round(c.tongThuTm * 0.6) },
    { so: soCt('PT', thang, '02'), ngay: ngayCt(22, thang), dienGiai: 'Thu tiền bán hàng đợt 2', thu: c.tongThuTm - Math.round(c.tongThuTm * 0.6) },
    { so: soCt('PC', thang, '01'), ngay: ngayCt(10, thang), dienGiai: 'Chi nộp tiền vào tài khoản ngân hàng', chi: Math.round(c.tongChiTm * 0.75) },
    { so: soCt('PC', thang, '02'), ngay: ngayCt(25, thang), dienGiai: 'Chi phí hoạt động bằng tiền mặt', chi: c.tongChiTm - Math.round(c.tongChiTm * 0.75) },
    { dienGiai: 'Cộng phát sinh trong kỳ', thu: c.tongThuTm, chi: c.tongChiTm, _b: 1 },
    { dienGiai: 'Tiền mặt tồn cuối kỳ', thu: c.tmCuoi, _t: 1 },

    { dienGiai: 'II. TIỀN GỬI KHÔNG KỲ HẠN (Vietcombank - TK 0071001234567)', _b: 1, _nhom: 1 },
    { dienGiai: 'Tiền gửi tồn đầu kỳ', thu: c.tgDau, _b: 1 },
    { so: soCt('BC', thang, '01'), ngay: ngayCt(8, thang), dienGiai: 'Thu tiền bán hàng chuyển khoản', thu: Math.round(c.tongThuTg * 0.55) },
    { so: soCt('BC', thang, '02'), ngay: ngayCt(21, thang), dienGiai: 'Nộp tiền mặt vào tài khoản ngân hàng', thu: c.tongThuTg - Math.round(c.tongThuTg * 0.55) },
    { so: soCt('UNC', thang, '01'), ngay: ngayCt(15, thang), dienGiai: 'Chuyển khoản thanh toán tiền nhà cung cấp', chi: Math.round(c.tongChiTg * 0.65) },
    { so: soCt('UNC', thang, '02'), ngay: ngayCt(27, thang), dienGiai: 'Chi trả lương nhân viên qua ngân hàng', chi: c.tongChiTg - Math.round(c.tongChiTg * 0.65) },
    { dienGiai: 'Cộng phát sinh trong kỳ', thu: c.tongThuTg, chi: c.tongChiTg, _b: 1 },
    { dienGiai: 'Tiền gửi tồn cuối kỳ', thu: c.tgCuoi, _t: 1 },
  ]
}

// ── S3b-DNSN: Sổ theo dõi nghĩa vụ thuế GTGT theo phương pháp khấu trừ (TH3, TH4) ──
export const colsS3b: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 100, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', kyHieu: 'C' },
  { k: 'vao', t: 'Số thuế GTGT đầu vào', num: true, kyHieu: '1' },
  { k: 'ra', t: 'Số thuế GTGT đầu ra', num: true, kyHieu: '2' },
]

export function chiTietS3b(thang: number) {
  const sc = soCai(thang)
  const vatVaoDau = sc.mo['1331'] ?? 18_640_000
  const vatVaoTrongKy = sc.no['1331'] ?? 85_000_000
  const vatRaTrongKy = sc.co['33311'] ?? 102_000_000
  const thuePhaiNop = Math.max(0, vatRaTrongKy - vatVaoTrongKy)
  const daNop = Math.round(thuePhaiNop * 0.8)
  const daHoan = 0
  const cuoiKy = thuePhaiNop - daNop

  return {
    vatVaoDau,
    vatVaoTrongKy,
    vatRaTrongKy,
    thuePhaiNop,
    daNop,
    daHoan,
    cuoiKy,
  }
}

export function rowsS3b(thang: number): Row[] {
  const c = chiTietS3b(thang)
  return [
    { dienGiai: 'Số dư đầu kỳ (thuế GTGT còn được khấu trừ)', vao: c.vatVaoDau, _b: 1 },
    { so: soCt('HD', thang, '01'), ngay: ngayCt(5, thang), dienGiai: 'Thuế GTGT đầu vào mua nguyên vật liệu', vao: Math.round(c.vatVaoTrongKy * 0.6) },
    { so: soCt('HD', thang, '02'), ngay: ngayCt(18, thang), dienGiai: 'Thuế GTGT đầu vào dịch vụ mua ngoài', vao: c.vatVaoTrongKy - Math.round(c.vatVaoTrongKy * 0.6) },
    { so: soCt('BH', thang, '01'), ngay: ngayCt(10, thang), dienGiai: 'Thuế GTGT đầu ra bán hàng hóa, dịch vụ đợt 1', ra: Math.round(c.vatRaTrongKy * 0.5) },
    { so: soCt('BH', thang, '02'), ngay: ngayCt(25, thang), dienGiai: 'Thuế GTGT đầu ra bán hàng hóa, dịch vụ đợt 2', ra: c.vatRaTrongKy - Math.round(c.vatRaTrongKy * 0.5) },
    { dienGiai: 'Cộng số phát sinh trong kỳ', vao: c.vatVaoTrongKy, ra: c.vatRaTrongKy, _t: 1 },
    { dienGiai: 'Tổng số thuế GTGT phải nộp trong kỳ', ra: c.thuePhaiNop, _b: 1 },
    { so: soCt('UNC', thang, 'GTGT'), ngay: ngayCt(20, thang), dienGiai: 'Số thuế GTGT đã nộp trong kỳ', ra: c.daNop },
    { dienGiai: 'Số thuế GTGT đã được hoàn trong kỳ', vao: c.daHoan },
    { dienGiai: 'Số dư cuối kỳ (thuế GTGT còn phải nộp)', ra: c.cuoiKy, _t: 1 },
  ]
}

// ── S4a-DNSN: Sổ chi tiết thanh toán công nợ (Mọi TH) ──
export const colsS4a: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 85, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 85, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', w: 140, kyHieu: 'C' },
  { k: 'ptPhai', t: 'Số phải thu', num: true, w: 80, nhom: 'Nợ phải thu', kyHieu: '1' },
  { k: 'ptDa', t: 'Số đã thu', num: true, w: 80, nhom: 'Nợ phải thu', kyHieu: '2' },
  { k: 'ptCon', t: 'Số còn phải thu', num: true, w: 80, nhom: 'Nợ phải thu', kyHieu: '3' },
  { k: 'traPhai', t: 'Số phải trả', num: true, w: 80, nhom: 'Nợ phải trả', kyHieu: '4' },
  { k: 'traDa', t: 'Số đã trả', num: true, w: 80, nhom: 'Nợ phải trả', kyHieu: '5' },
  { k: 'traCon', t: 'Số còn phải trả', num: true, w: 80, nhom: 'Nợ phải trả', kyHieu: '6' },
]

export function chiTietS4a(thang: number) {
  const sc = soCai(thang)
  const ptDau = sc.mo['131'] ?? 168_200_000
  const ptCuoi = sc.cuoi['131'] ?? 180_000_000
  const ptPhai = sc.no['131'] ?? 450_000_000
  const ptDa = sc.co['131'] ?? (ptDau + ptPhai - ptCuoi)

  // Nợ phải trả: gồm phải trả người bán 331, lương 334, vay 341
  const traDau = -((sc.mo['331'] ?? 0) + (sc.mo['334'] ?? 0) + (sc.mo['331'] ?? 0))
  const tra310Dau = -((sc.mo['331'] ?? 0) + (sc.mo['334'] ?? 0) + (sc.mo['341'] ?? 0))
  const tra310Cuoi = -((sc.cuoi['331'] ?? 0) + (sc.cuoi['334'] ?? 0) + (sc.cuoi['341'] ?? 0))
  const traPhai = (sc.co['331'] ?? 0) + (sc.co['334'] ?? 0) + (sc.co['341'] ?? 0)
  const traDa = tra310Dau + traPhai - tra310Cuoi

  return {
    ptDau,
    ptPhai,
    ptDa,
    ptCuoi,
    tra310Dau,
    traPhai,
    traDa,
    tra310Cuoi,
  }
}

export function rowsS4a(thang: number): Row[] {
  const c = chiTietS4a(thang)
  return [
    {
      dienGiai: 'Số dư đầu kỳ',
      ptCon: c.ptDau,
      traCon: c.tra310Dau,
      _b: 1,
    },
    {
      so: soCt('BH', thang, '01'),
      ngay: ngayCt(6, thang),
      dienGiai: 'Bán hàng cho khách hàng theo hợp đồng',
      ptPhai: Math.round(c.ptPhai * 0.55),
      ptDa: 0,
      ptCon: Math.round(c.ptPhai * 0.55),
    },
    {
      so: soCt('BC', thang, '01'),
      ngay: ngayCt(14, thang),
      dienGiai: 'Khách hàng thanh toán tiền hàng',
      ptPhai: 0,
      ptDa: Math.round(c.ptDa * 0.6),
      ptCon: -Math.round(c.ptDa * 0.6),
    },
    {
      so: soCt('BH', thang, '02'),
      ngay: ngayCt(20, thang),
      dienGiai: 'Bán hàng cho khách đợt 2',
      ptPhai: c.ptPhai - Math.round(c.ptPhai * 0.55),
      ptDa: 0,
      ptCon: c.ptPhai - Math.round(c.ptPhai * 0.55),
    },
    {
      so: soCt('BC', thang, '02'),
      ngay: ngayCt(28, thang),
      dienGiai: 'Khách hàng thanh toán đợt 2',
      ptPhai: 0,
      ptDa: c.ptDa - Math.round(c.ptDa * 0.6),
      ptCon: -(c.ptDa - Math.round(c.ptDa * 0.6)),
    },
    {
      so: soCt('MH', thang, '01'),
      ngay: ngayCt(8, thang),
      dienGiai: 'Mua nguyên vật liệu chưa thanh toán',
      traPhai: Math.round(c.traPhai * 0.6),
      traDa: 0,
      traCon: Math.round(c.traPhai * 0.6),
    },
    {
      so: soCt('UNC', thang, '01'),
      ngay: ngayCt(22, thang),
      dienGiai: 'Thanh toán tiền nhà cung cấp',
      traPhai: 0,
      traDa: Math.round(c.traDa * 0.65),
      traCon: -Math.round(c.traDa * 0.65),
    },
    {
      so: soCt('MH', thang, '02'),
      ngay: ngayCt(24, thang),
      dienGiai: 'Chi phí mua ngoài và dịch vụ',
      traPhai: c.traPhai - Math.round(c.traPhai * 0.6),
      traDa: 0,
      traCon: c.traPhai - Math.round(c.traPhai * 0.6),
    },
    {
      so: soCt('UNC', thang, '02'),
      ngay: ngayCt(29, thang),
      dienGiai: 'Thanh toán tiền hàng và chi phí đợt 2',
      traPhai: 0,
      traDa: c.traDa - Math.round(c.traDa * 0.65),
      traCon: -(c.traDa - Math.round(c.traDa * 0.65)),
    },
    {
      dienGiai: 'Cộng số phát sinh trong kỳ',
      ptPhai: c.ptPhai,
      ptDa: c.ptDa,
      traPhai: c.traPhai,
      traDa: c.traDa,
      _b: 1,
    },
    {
      dienGiai: 'Số dư cuối kỳ',
      ptCon: c.ptCuoi,
      traCon: c.tra310Cuoi,
      _t: 1,
    },
  ]
}

// ── S4b-DNSN: Sổ tài sản cố định (Mọi TH) ──
export const colsS4b: Col[] = [
  { k: 'soTang', t: 'Số hiệu', cls: 'code', w: 80, nhom: 'Ghi tăng tài sản cố định', kyHieu: 'A' },
  { k: 'ngayTang', t: 'Ngày, tháng', w: 80, nhom: 'Ghi tăng tài sản cố định', kyHieu: 'B' },
  { k: 'tenTs', t: 'Tên, đặc điểm, ký hiệu TSCĐ', w: 170, nhom: 'Ghi tăng tài sản cố định', kyHieu: 'C' },
  { k: 'thangSd', t: 'Tháng, năm đưa vào sử dụng', c: true, w: 85, nhom: 'Ghi tăng tài sản cố định', kyHieu: 'D' },
  { k: 'nguyenGia', t: 'Nguyên giá TSCĐ', num: true, w: 95, nhom: 'Ghi tăng tài sản cố định', kyHieu: '1' },
  { k: 'tyLeKh', t: 'Tỷ lệ (%) khấu hao', c: true, w: 65, nhom: 'Khấu hao tài sản cố định', kyHieu: '2' },
  { k: 'mucKh', t: 'Mức khấu hao', num: true, w: 85, nhom: 'Khấu hao tài sản cố định', kyHieu: '3' },
  { k: 'luyKeKh', t: 'Khấu hao lũy kế', num: true, w: 95, nhom: 'Khấu hao tài sản cố định', kyHieu: '4' },
  { k: 'soGiam', t: 'Số hiệu', cls: 'code', w: 70, nhom: 'Ghi giảm tài sản cố định', kyHieu: 'E' },
  { k: 'ngayGiam', t: 'Ngày, tháng, năm', w: 80, nhom: 'Ghi giảm tài sản cố định', kyHieu: 'G' },
  { k: 'lyDoGiam', t: 'Lý do giảm TSCĐ', w: 90, nhom: 'Ghi giảm tài sản cố định', kyHieu: 'H' },
]

export function chiTietS4b(thang: number) {
  const sc = soCai(thang)
  const nguyenGia = sc.cuoi['211'] ?? 1_606_300_000
  const luyKeKh = Math.abs(sc.cuoi['214'] ?? -430_000_000)
  const mucKhThang = kqkd(thang, 2026).cp.khauHao
  const giaTriConLai = nguyenGia - luyKeKh
  return { nguyenGia, luyKeKh, mucKhThang, giaTriConLai }
}

export function rowsS4b(thang: number): Row[] {
  const c = chiTietS4b(thang)
  const ds = DS_TSCD.slice(0, 5)
  const tongNg = ds.reduce((a, x) => a + x[4], 0)
  const rows: Row[] = ds.map((x, i) => {
    const tiLeNg = x[4] / tongNg
    const ng = Math.round(c.nguyenGia * tiLeNg)
    const kh = Math.round(c.luyKeKh * tiLeNg)
    const muc = Math.round(c.mucKhThang * tiLeNg)
    const tyLe = ((muc / ng) * 100).toFixed(1).replace('.', ',') + '%'
    return {
      soTang: `TANG-0${i + 1}`,
      ngayTang: x[3],
      tenTs: x[1],
      thangSd: x[3].slice(3),
      nguyenGia: ng,
      tyLeKh: tyLe,
      mucKh: muc,
      luyKeKh: kh,
      soGiam: '',
      ngayGiam: '',
      lyDoGiam: '',
    }
  })
  // Điều chỉnh dòng cuối cho khớp tròn
  const sumNg = rows.reduce((a, r) => a + r.nguyenGia, 0)
  const sumKh = rows.reduce((a, r) => a + r.luyKeKh, 0)
  const sumMuc = rows.reduce((a, r) => a + r.mucKh, 0)
  if (rows.length > 0) {
    rows[rows.length - 1].nguyenGia += c.nguyenGia - sumNg
    rows[rows.length - 1].luyKeKh += c.luyKeKh - sumKh
    rows[rows.length - 1].mucKh += c.mucKhThang - sumMuc
  }
  rows.push({
    tenTs: 'Cộng',
    nguyenGia: c.nguyenGia,
    mucKh: c.mucKhThang,
    luyKeKh: c.luyKeKh,
    _t: 1,
  })
  return rows
}

// ── S4c-DNSN: Sổ theo dõi nghĩa vụ thuế khác (Mọi TH) ──
export const colsS4c: Col[] = [
  { k: 'ngay', t: 'Ngày tháng ghi sổ', w: 85, kyHieu: 'A' },
  { k: 'giaoDich', t: 'Giao dịch', w: 120, kyHieu: 'B' },
  { k: 'luong', t: 'Lượng hàng hóa, DV chịu thuế', num: true, w: 70, kyHieu: '1' },
  { k: 'mucTuyetDoi', t: 'Mức thuế tuyệt đối', num: true, w: 75, kyHieu: '2' },
  { k: 'giaTinhThue', t: 'Giá tính thuế / Đơn vị', num: true, w: 75, kyHieu: '3' },
  { k: 'thueSuat', t: 'Thuế suất', c: true, w: 60, kyHieu: '4' },
  { k: 'thueTyLe', t: 'PP tính thuế tỷ lệ %', num: true, w: 75, nhom: 'Thuế XK, thuế NK, thuế TTĐB', kyHieu: '5' },
  { k: 'thueTuyetDoi', t: 'PP tính thuế tuyệt đối', num: true, w: 75, nhom: 'Thuế XK, thuế NK, thuế TTĐB', kyHieu: '6' },
  { k: 'phaiNopXk', t: 'Số thuế phải nộp', num: true, w: 75, nhom: 'Thuế XK, thuế NK, thuế TTĐB', kyHieu: '7' },
  { k: 'thueBvmt', t: 'Thuế BVMT', num: true, w: 70, nhom: 'Các loại thuế khác', kyHieu: '8' },
  { k: 'thueTn', t: 'Thuế tài nguyên', num: true, w: 70, nhom: 'Các loại thuế khác', kyHieu: '9' },
  { k: 'thueDat', t: 'Thuế sử dụng đất', num: true, w: 70, nhom: 'Các loại thuế khác', kyHieu: '10' },
  { k: 'thueKhac', t: 'Khác (thuế môn bài)', num: true, w: 70, nhom: 'Các loại thuế khác', kyHieu: '11' },
]

export function chiTietS4c(thang: number) {
  const luong = 500
  const gia = 65_000
  const ttdb = Math.round(luong * gia * 0.1) // 10%
  const bvmt = 1_500_000
  const dat = 1_800_000
  const monBai = 1_000_000
  const tongThueKhac = ttdb + bvmt + dat + monBai
  return { luong, gia, ttdb, bvmt, dat, monBai, tongThueKhac }
}

export function rowsS4c(thang: number): Row[] {
  const c = chiTietS4c(thang)
  return [
    {
      ngay: ngayCt(8, thang),
      giaoDich: 'Nhập đồ uống có cồn phục vụ kinh doanh',
      luong: c.luong,
      mucTuyetDoi: 0,
      giaTinhThue: c.gia,
      thueSuat: '10%',
      thueTyLe: c.ttdb,
      thueTuyetDoi: 0,
      phaiNopXk: c.ttdb,
      thueBvmt: 0,
      thueTn: 0,
      thueDat: 0,
      thueKhac: 0,
    },
    {
      ngay: ngayCt(15, thang),
      giaoDich: 'Nghĩa vụ thuế BVMT bao bì nilon tự hủy',
      luong: 100,
      mucTuyetDoi: 15_000,
      giaTinhThue: 0,
      thueSuat: '',
      thueTyLe: 0,
      thueTuyetDoi: 0,
      phaiNopXk: 0,
      thueBvmt: c.bvmt,
      thueTn: 0,
      thueDat: 0,
      thueKhac: 0,
    },
    {
      ngay: ngayCt(20, thang),
      giaoDich: 'Thuế sử dụng đất phi nông nghiệp cơ sở',
      luong: 1,
      mucTuyetDoi: 0,
      giaTinhThue: c.dat,
      thueSuat: '100%',
      thueTyLe: 0,
      thueTuyetDoi: 0,
      phaiNopXk: 0,
      thueBvmt: 0,
      thueTn: 0,
      thueDat: c.dat,
      thueKhac: 0,
    },
    {
      ngay: ngayCt(25, thang),
      giaoDich: 'Lệ phí môn bài bậc 2',
      luong: 1,
      mucTuyetDoi: c.monBai,
      giaTinhThue: 0,
      thueSuat: '',
      thueTyLe: 0,
      thueTuyetDoi: 0,
      phaiNopXk: 0,
      thueBvmt: 0,
      thueTn: 0,
      thueDat: 0,
      thueKhac: c.monBai,
    },
    {
      giaoDich: 'Cộng',
      phaiNopXk: c.ttdb,
      thueBvmt: c.bvmt,
      thueTn: 0,
      thueDat: c.dat,
      thueKhac: c.monBai,
      _t: 1,
    },
  ]
}

// ── S4d-DNSN: Sổ theo dõi vốn chủ sở hữu (Mọi TH) ──
export const colsS4d: Col[] = [
  { k: 'so', t: 'Số hiệu', cls: 'code', w: 100, kyHieu: 'A' },
  { k: 'ngay', t: 'Ngày, tháng', w: 100, kyHieu: 'B' },
  { k: 'dienGiai', t: 'Diễn giải', kyHieu: 'C' },
  { k: 'tang', t: 'Tăng trong kỳ', num: true, kyHieu: '1' },
  { k: 'giam', t: 'Giảm trong kỳ', num: true, kyHieu: '2' },
  { k: 'du', t: 'Số dư', num: true, kyHieu: '3' },
]

export function chiTietS4d(thang: number) {
  const sc = soCai(thang)
  const vonDau = -(sc.mo['411'] ?? -1_500_000_000)
  const vonCuoi = -(sc.cuoi['411'] ?? -1_500_000_000)
  const lnDau = -(sc.mo['421'] ?? 0)
  const lnCuoi = -(sc.cuoi['421'] ?? 0)
  const lnTang = Math.max(0, lnCuoi - lnDau)
  const lnGiam = Math.max(0, lnDau - lnCuoi)
  return {
    vonDau,
    vonCuoi,
    lnDau,
    lnCuoi,
    lnTang,
    lnGiam,
    quyDau: 0,
    quyCuoi: 0,
  }
}

export function rowsS4d(thang: number): Row[] {
  const c = chiTietS4d(thang)
  return [
    { dienGiai: '1. Vốn góp của chủ sở hữu', _b: 1, _nhom: 1 },
    { dienGiai: 'Số dư đầu kỳ', du: c.vonDau, _b: 1 },
    { so: soCt('BC', thang, 'V'), ngay: ngayCt(1, thang), dienGiai: 'Duy trì vốn điều lệ đã góp đủ', tang: 0, giam: 0, du: c.vonCuoi },
    { dienGiai: 'Số dư cuối kỳ', du: c.vonCuoi, _b: 1 },

    { dienGiai: '2. Lợi nhuận sau thuế chưa phân phối', _b: 1, _nhom: 1 },
    { dienGiai: 'Số dư đầu kỳ', du: c.lnDau, _b: 1 },
    { so: soCt('KC', thang), ngay: ngayCt(30, thang), dienGiai: 'Kết chuyển lợi nhuận sau thuế trong kỳ', tang: c.lnTang, giam: c.lnGiam, du: c.lnCuoi },
    { dienGiai: 'Số dư cuối kỳ', du: c.lnCuoi, _b: 1 },

    { dienGiai: '3. Các quỹ thuộc vốn chủ sở hữu', _b: 1, _nhom: 1 },
    { dienGiai: 'Số dư đầu kỳ', du: c.quyDau, _b: 1 },
    { dienGiai: 'Số dư cuối kỳ', du: c.quyCuoi, _b: 1 },
  ]
}

// ── B01-DNSN: Báo cáo tình hình tài chính (TH2, TH4) ──
export interface DongB01 {
  ct: string
  ma: string
  cuoi: number
  dau: number
  _b?: number
  _t?: number
}

export function dongB01(thang: number): { rows: DongB01[]; can: boolean } {
  const sc = soCai(thang)
  const mo = sc.mo
  const c = sc.cuoi

  // 110: Tiền (gồm tiền mặt và tiền gửi: S2d-DNSN)
  const tienCuoi = du(c, '1111', '1121')
  const tienDau = du(mo, '1111', '1121')

  // 120: Các khoản nợ phải thu (S4a-DNSN)
  const ptCuoi = du(c, '131')
  const ptDau = du(mo, '131')

  // 130: Hàng tồn kho (S2c-DNSN)
  const htkCuoi = du(c, '152')
  const htkDau = du(mo, '152')

  // 140: Tài sản cố định (nguyên giá trừ khấu hao: S4b-DNSN)
  const tscdCuoi = du(c, '211') + du(c, '214')
  const tscdDau = du(mo, '211') + du(mo, '214')

  // 310: Các khoản nợ phải trả (S4a-DNSN: gồm phải trả người bán, lương, vay)
  const nptCuoi = -du(c, '331', '334', '341')
  const nptDau = -du(mo, '331', '334', '341')

  // 320: Thuế và các khoản phải nộp Nhà nước (S2a/S2b/S3a/S3b và S4c)
  const thueCuoi = -du(c, '33311', '3334')
  const thueDau = -du(mo, '33311', '3334')

  // 300 = 310 + 320
  const nptTongCuoi = nptCuoi + thueCuoi
  const nptTongDau = nptDau + thueDau

  // 410: Vốn đầu tư của chủ sở hữu (S4d-DNSN)
  const vonCuoi = -du(c, '411')
  const vonDau = -du(mo, '411')

  // 420: Lợi nhuận sau thuế chưa phân phối (S4d-DNSN)
  const lnCuoi = -du(c, '421')
  const lnDau = -du(mo, '421')

  // 430: Các quỹ thuộc vốn chủ sở hữu (S4d-DNSN)
  const quyCuoi = 0
  const quyDau = 0

  // 400 = 410 + 420 + 430
  const vcshTongCuoi = vonCuoi + lnCuoi + quyCuoi
  const vcshTongDau = vonDau + lnDau + quyDau

  // 500 = 300 + 400
  const nvTongCuoi = nptTongCuoi + vcshTongCuoi
  const nvTongDau = nptTongDau + vcshTongDau

  // 200 = 500 bắt buộc: dữ liệu giả cân bằng bằng chỉ tiêu 150 Tài sản khác
  // Chỉ tiêu 150 Tài sản khác cân bằng để 200 = 500 (gồm thuế VAT được khấu trừ 1331 và chi phí trả trước 242)
  const ts4Cuoi = tienCuoi + ptCuoi + htkCuoi + tscdCuoi
  const ts4Dau = tienDau + ptDau + htkDau + tscdDau

  const tsKhacCuoi = nvTongCuoi - ts4Cuoi
  const tsKhacDau = nvTongDau - ts4Dau

  const tsTongCuoi = ts4Cuoi + tsKhacCuoi
  const tsTongDau = ts4Dau + tsKhacDau

  const rows: DongB01[] = [
    { ct: 'TÀI SẢN', ma: '', cuoi: 0, dau: 0, _b: 1 },
    { ct: '1. Tiền', ma: '110', cuoi: tienCuoi, dau: tienDau },
    { ct: '2. Các khoản nợ phải thu', ma: '120', cuoi: ptCuoi, dau: ptDau },
    { ct: '3. Hàng tồn kho', ma: '130', cuoi: htkCuoi, dau: htkDau },
    { ct: '4. Tài sản cố định', ma: '140', cuoi: tscdCuoi, dau: tscdDau },
    { ct: '5. Tài sản khác', ma: '150', cuoi: tsKhacCuoi, dau: tsKhacDau },
    { ct: 'TỔNG CỘNG TÀI SẢN (200 = 110+120+130+140+150)', ma: '200', cuoi: tsTongCuoi, dau: tsTongDau, _t: 1 },
    { ct: 'NGUỒN VỐN', ma: '', cuoi: 0, dau: 0, _b: 1 },
    { ct: 'I. Nợ phải trả (300 = 310+320)', ma: '300', cuoi: nptTongCuoi, dau: nptTongDau, _b: 1 },
    { ct: '1. Các khoản nợ phải trả', ma: '310', cuoi: nptCuoi, dau: nptDau },
    { ct: '2. Thuế và các khoản phải nộp Nhà nước', ma: '320', cuoi: thueCuoi, dau: thueDau },
    { ct: 'II. Vốn chủ sở hữu (400 = 410+420+430)', ma: '400', cuoi: vcshTongCuoi, dau: vcshTongDau, _b: 1 },
    { ct: '1. Vốn đầu tư của chủ sở hữu', ma: '410', cuoi: vonCuoi, dau: vonDau },
    { ct: '2. Lợi nhuận sau thuế chưa phân phối', ma: '420', cuoi: lnCuoi, dau: lnDau },
    { ct: '3. Các quỹ thuộc vốn chủ sở hữu', ma: '430', cuoi: quyCuoi, dau: quyDau },
    { ct: 'TỔNG CỘNG NGUỒN VỐN (500 = 300+400)', ma: '500', cuoi: nvTongCuoi, dau: nvTongDau, _t: 1 },
  ]

  const can = tsTongCuoi === nvTongCuoi && tsTongDau === nvTongDau && tsKhacCuoi >= 0 && tsKhacDau >= 0
  return { rows, can }
}

// ── B02-DNSN: Báo cáo kết quả hoạt động kinh doanh (TH2, TH4) ──
export interface DongB02 {
  ct: string
  ma: string
  nay: number
  truoc: number
  _b?: number
  _t?: number
}

export function dongB02(thang: number): DongB02[] {
  const thangTruoc = Math.max(8, thang - 1)
  const bNay = chiTietS2b(thang)
  const bTruoc = chiTietS2b(thangTruoc)

  return [
    { ct: '1. Doanh thu và thu nhập thuần', ma: '01', nay: bNay.dt, truoc: bTruoc.dt, _b: 1 },
    { ct: '2. Các khoản chi phí', ma: '02', nay: bNay.tongCp, truoc: bTruoc.tongCp },
    { ct: '3. Lợi nhuận kế toán trước thuế thu nhập doanh nghiệp (03 = 01 - 02)', ma: '03', nay: bNay.lnTruocThue, truoc: bTruoc.lnTruocThue, _b: 1 },
    { ct: '4. Chi phí thuế thu nhập doanh nghiệp', ma: '10', nay: bNay.thueTrongKy, truoc: bTruoc.thueTrongKy },
    { ct: '5. Lợi nhuận sau thuế thu nhập doanh nghiệp (20 = 03 - 10)', ma: '20', nay: bNay.lnSauThue, truoc: bTruoc.lnSauThue, _t: 1 },
  ]
}
