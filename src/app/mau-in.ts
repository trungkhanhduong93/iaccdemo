// Mẫu in chứng từ theo chế độ kế toán (QD31, kế hoạch mục 8.6). Mẫu chuẩn không sửa trực tiếp; mẫu riêng của đơn vị lưu ở tiện ích Thiết kế mẫu in (11.11).
import type { CheDo } from './che-do'

export type KhoIn = 'A4' | 'A5'
export type HuongIn = 'doc' | 'ngang'
export type KhoiInK = 'dauTrang' | 'mauSo' | 'tieuDe' | 'thongTin' | 'bang' | 'tongCong' | 'bangChu' | 'ghiChu' | 'ky' | 'chanTrang'
export interface KhoiIn { k: KhoiInK; an?: boolean }
export interface TruongIn { k: string; nhan: string; batBuoc?: boolean; an?: boolean; rongNhan?: number; caHang?: boolean }   // k là khoá trong DuLieuIn.tt; caHang: chiếm cả hàng khi chia 2 cột
export interface CotIn { k: string; t: string; rong: number; can?: 'trai' | 'giua' | 'phai'; so?: boolean; batBuoc?: boolean; an?: boolean; chiNoCo?: boolean; nhom?: string; kyHieu?: string } // rong: mm; k là khoá trong mỗi dòng DuLieuIn.dong; nhom: tiêu đề tầng trên chung cho các cột liền nhau; kyHieu: hàng A, B, 1, 2 dưới tiêu đề
export interface OKyIn { chucDanh: string; goiY: string; hoTen?: string }
export interface MauIn {
  id: string
  ten: string                                   // tên mẫu, vd 'Phiếu thu'
  kyHieu: Partial<Record<CheDo, string>>        // '01-TT'…; không có khoá = mẫu tự thiết kế, đầu trang không ghi "Mẫu số"
  tieuDe: string                                // chữ tiêu đề in hoa trên phiếu
  tieuDeCo?: number                             // pt, không có = 1,6 lần cỡ chữ chung
  tieuDeDam?: boolean                           // mặc định true
  trang: { kho: KhoIn; huong: HuongIn; le: [number, number, number, number]; lien: 1 | 2; coChu: number; phong: 'app' | 'times' }  // le: trên, phải, dưới, trái (mm)
  khoi: KhoiIn[]                                // thứ tự khối từ trên xuống
  thongTin: TruongIn[]
  thongTinTheoCheDo?: Partial<Record<CheDo, TruongIn[]>> // trường thông tin theo chế độ
  soCotThongTin: 1 | 2
  bang?: { cot: CotIn[]; caoDong: number; dongTrongToiThieu: number; dongTong: boolean; coChu?: number }
  cotTheoCheDo?: Partial<Record<CheDo, CotIn[]>> // cột theo chế độ
  tongCong?: { k: string; nhan: string }[]       // các dòng tổng dưới bảng (Cộng tiền hàng, Tiền thuế, Tổng thanh toán…)
  bangChu?: string                               // nhãn dòng số tiền bằng chữ, vd 'Số tiền viết bằng chữ'
  ghiChu?: string[]                              // dòng chữ cố định, vd 'Đã nhận đủ số tiền (viết bằng chữ): ...'
  ghiChuTheoCheDo?: Partial<Record<CheDo, string[]>>     // dòng chữ cố định theo chế độ
  ky: OKyIn[]
  kyTheoCheDo?: Partial<Record<CheDo, OKyIn[]>>  // khối chữ ký theo chế độ
  coNoCo?: boolean                               // in Nợ/Có ở góc phải khi chế độ dùng tài khoản
  quyenSo?: boolean
  quyenSoTheoCheDo?: Partial<Record<CheDo, boolean>>     // hiện quyển số theo chế độ
  boPhan?: boolean                               // đầu trang thêm dòng Bộ phận (phiếu kho)
}

/** Áp cấu hình theo chế độ kế toán vào mẫu in: khối chữ ký, trường thông tin, cột bảng, ghi chú, quyển số.
 *  Kết quả bỏ các trường *TheoCheDo: mẫu riêng lưu từ kết quả này giữ nguyên phần người dùng đã sửa (vd xoá ô Kế toán trưởng) */
export function mauChoCheDo(mau: MauIn, cd: CheDo): MauIn {
  const { kyTheoCheDo, thongTinTheoCheDo, cotTheoCheDo, ghiChuTheoCheDo, quyenSoTheoCheDo, ...m } = mau
  const kyGoc = kyTheoCheDo?.[cd]
  const ky = kyGoc
    ? kyGoc.map(k => {
        const tim = m.ky.find(x => x.chucDanh === k.chucDanh)
        return tim?.hoTen ? { ...k, hoTen: tim.hoTen } : k
      })
    : m.ky
  const thongTin = thongTinTheoCheDo?.[cd] ?? m.thongTin
  const cot = cotTheoCheDo?.[cd]
  const ghiChu = ghiChuTheoCheDo?.[cd] ?? m.ghiChu
  const quyenSo = quyenSoTheoCheDo?.[cd] ?? m.quyenSo
  return {
    ...m,
    ky,
    thongTin,
    ghiChu,
    quyenSo,
    bang: m.bang ? (cot ? { ...m.bang, cot } : m.bang) : undefined,
  }
}

function taoKhoi(coBang = false, coTongCong = false, coBangChu = false, coGhiChu = false, ghiChuSauKy = false): KhoiIn[] {
  const ds: KhoiInK[] = ['dauTrang', 'mauSo', 'tieuDe', 'thongTin']
  if (coBang) ds.push('bang')
  if (coTongCong) ds.push('tongCong')
  if (coBangChu) ds.push('bangChu')
  if (coGhiChu && !ghiChuSauKy) ds.push('ghiChu')
  ds.push('ky')
  if (coGhiChu && ghiChuSauKy) ds.push('ghiChu')
  ds.push('chanTrang')
  return ds.map(k => ({ k }))
}

// Dòng ghi tay dưới chữ ký của phiếu thu, phiếu chi (01-TT, 02-TT theo TT133, TT99)
const GHI_CHU_TIEN = [
  'Đã nhận đủ số tiền (viết bằng chữ): ......',
  '+ Tỷ giá ngoại tệ (vàng, bạc, đá quý): ......',
  '+ Số tiền quy đổi: ......',
]

export const MAU_IN: MauIn[] = [
  // 1. Phiếu thu
  {
    id: 'phieu-thu',
    ten: 'Phiếu thu',
    kyHieu: { TT58: '01-TT', TT133: '01-TT', TT99: '01-TT' },
    tieuDe: 'PHIẾU THU',
    trang: { kho: 'A5', huong: 'ngang', le: [8, 10, 8, 15], lien: 1, coChu: 9.5, phong: 'app' },
    khoi: taoKhoi(false, false, false, true, true),
    soCotThongTin: 1,
    thongTin: [
      { k: 'nguoi', nhan: 'Họ và tên người nộp tiền', batBuoc: true },
      { k: 'diaChi', nhan: 'Địa chỉ' },
      { k: 'lyDo', nhan: 'Lý do nộp', batBuoc: true },
      { k: 'soTien', nhan: 'Số tiền', batBuoc: true },
      { k: 'bangChu', nhan: 'Viết bằng chữ', batBuoc: true },
      { k: 'kemTheo', nhan: 'Kèm theo' },
    ],
    thongTinTheoCheDo: {
      TT58: [
        { k: 'nguoi', nhan: 'Họ và tên người nộp tiền', batBuoc: true },
        { k: 'diaChi', nhan: 'Địa chỉ' },
        { k: 'lyDo', nhan: 'Lý do thu', batBuoc: true },
        { k: 'soTien', nhan: 'Số tiền', batBuoc: true },
        { k: 'bangChu', nhan: 'Viết bằng chữ', batBuoc: true },
        { k: 'kemTheo', nhan: 'Kèm theo' },
      ],
    },
    ghiChu: GHI_CHU_TIEN,
    ghiChuTheoCheDo: { TT58: [] },
    ky: [
      { chucDanh: 'Giám đốc', goiY: '(Ký, họ tên, đóng dấu)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người nộp tiền', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ quỹ', goiY: '(Ký, họ tên)' },
    ],
    kyTheoCheDo: {
      TT58: [
        { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Người đại diện theo pháp luật', goiY: '(Ký, họ tên, đóng dấu)' },
        { chucDanh: 'Người nộp tiền', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Thủ quỹ', goiY: '(Ký, họ tên)' },
      ],
    },
    quyenSo: true,
    quyenSoTheoCheDo: { TT58: false },
    coNoCo: true,
  },

  // 2. Phiếu chi
  {
    id: 'phieu-chi',
    ten: 'Phiếu chi',
    kyHieu: { TT58: '02-TT', TT133: '02-TT', TT99: '02-TT' },
    tieuDe: 'PHIẾU CHI',
    trang: { kho: 'A5', huong: 'ngang', le: [8, 10, 8, 15], lien: 1, coChu: 9.5, phong: 'app' },
    khoi: taoKhoi(false, false, false, true, true),
    soCotThongTin: 1,
    thongTin: [
      { k: 'nguoi', nhan: 'Họ và tên người nhận tiền', batBuoc: true },
      { k: 'diaChi', nhan: 'Địa chỉ' },
      { k: 'lyDo', nhan: 'Lý do chi', batBuoc: true },
      { k: 'soTien', nhan: 'Số tiền', batBuoc: true },
      { k: 'bangChu', nhan: 'Viết bằng chữ', batBuoc: true },
      { k: 'kemTheo', nhan: 'Kèm theo' },
    ],
    thongTinTheoCheDo: {
      TT58: [
        { k: 'nguoi', nhan: 'Họ và tên người nhận tiền', batBuoc: true },
        { k: 'diaChi', nhan: 'Địa chỉ' },
        { k: 'lyDo', nhan: 'Lý do chi', batBuoc: true },
        { k: 'soTien', nhan: 'Số tiền', batBuoc: true },
        { k: 'bangChu', nhan: 'Viết bằng chữ', batBuoc: true },
        { k: 'kemTheo', nhan: 'Kèm theo' },
      ],
    },
    ghiChu: GHI_CHU_TIEN,
    ghiChuTheoCheDo: { TT58: [] },
    ky: [
      { chucDanh: 'Giám đốc', goiY: '(Ký, họ tên, đóng dấu)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ quỹ', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người nhận tiền', goiY: '(Ký, họ tên)' },
    ],
    kyTheoCheDo: {
      TT58: [
        { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Người đại diện theo pháp luật', goiY: '(Ký, họ tên, đóng dấu)' },
        { chucDanh: 'Người nhận tiền', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Thủ quỹ', goiY: '(Ký, họ tên)' },
      ],
    },
    quyenSo: true,
    quyenSoTheoCheDo: { TT58: false },
    coNoCo: true,
  },

  // 3. Phiếu thu qua ngân hàng
  {
    id: 'phieu-thu-nh',
    ten: 'Phiếu thu qua ngân hàng',
    kyHieu: {},
    tieuDe: 'PHIẾU THU QUA NGÂN HÀNG',
    trang: { kho: 'A5', huong: 'ngang', le: [10, 10, 10, 15], lien: 1, coChu: 10, phong: 'app' },
    khoi: taoKhoi(false, false, false, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'nguoi', nhan: 'Người chuyển tiền', batBuoc: true },
      { k: 'nganHang', nhan: 'Tài khoản nhận', batBuoc: true },
      { k: 'lyDo', nhan: 'Nội dung', batBuoc: true },
      { k: 'soTien', nhan: 'Số tiền', batBuoc: true },
      { k: 'bangChu', nhan: 'Số tiền bằng chữ', batBuoc: true },
    ],
    ky: [
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
    ],
    coNoCo: true,
  },

  // 4. Uỷ nhiệm chi
  {
    id: 'uy-nhiem-chi',
    ten: 'Uỷ nhiệm chi',
    kyHieu: {},
    tieuDe: 'UỶ NHIỆM CHI',
    trang: { kho: 'A5', huong: 'ngang', le: [10, 10, 10, 15], lien: 1, coChu: 10, phong: 'app' },
    khoi: taoKhoi(false, false, false, false),
    soCotThongTin: 2,
    thongTin: [
      { k: 'donViTra', nhan: 'Đơn vị trả tiền', batBuoc: true },
      { k: 'donViNhan', nhan: 'Đơn vị nhận tiền', batBuoc: true },
      { k: 'tkTra', nhan: 'Số tài khoản', batBuoc: true },
      { k: 'tkNhan', nhan: 'Số tài khoản', batBuoc: true },
      { k: 'nhTra', nhan: 'Tại ngân hàng', batBuoc: true },
      { k: 'nhNhan', nhan: 'Tại ngân hàng', batBuoc: true },
      { k: 'soTien', nhan: 'Số tiền bằng số', batBuoc: true, caHang: true },
      { k: 'bangChu', nhan: 'Số tiền bằng chữ', batBuoc: true, caHang: true },
      { k: 'lyDo', nhan: 'Nội dung thanh toán', batBuoc: true, caHang: true },
    ],
    ky: [
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Chủ tài khoản', goiY: '(Ký, họ tên, đóng dấu)' },
    ],
  },

  // 5. Phiếu nhập kho
  {
    id: 'phieu-nhap-kho',
    ten: 'Phiếu nhập kho',
    kyHieu: { TT58: '01-VT', TT133: '01-VT', TT99: '01-VT' },
    tieuDe: 'PHIẾU NHẬP KHO',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, true, true),
    soCotThongTin: 1,
    thongTin: [
      { k: 'nguoi', nhan: 'Họ và tên người giao', batBuoc: true },
      { k: 'theoCt', nhan: 'Theo chứng từ' },
      { k: 'kho', nhan: 'Nhập tại kho', batBuoc: true },
      { k: 'diaDiem', nhan: 'Địa điểm' },
    ],
    thongTinTheoCheDo: {
      TT58: [
        { k: 'nguoi', nhan: 'Họ và tên người giao hàng', batBuoc: true },
        { k: 'theoCt', nhan: 'Theo số hoá đơn/lệnh nhập' },
        { k: 'kho', nhan: 'Nhập tại kho', batBuoc: true },
        { k: 'diaDiem', nhan: 'Địa điểm' },
      ],
    },
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true, kyHieu: 'A' },
        { k: 'ten', t: 'Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hoá', rong: 55, can: 'trai', batBuoc: true, kyHieu: 'B' },
        { k: 'ma', t: 'Mã số', rong: 18, can: 'trai', kyHieu: 'C' },
        { k: 'dvt', t: 'Đơn vị tính', rong: 14, can: 'giua', kyHieu: 'D' },
        { k: 'slCt', t: 'Theo chứng từ', rong: 18, can: 'phai', so: true, nhom: 'Số lượng', kyHieu: '1' },
        { k: 'sl', t: 'Thực nhập', rong: 18, can: 'phai', so: true, batBuoc: true, nhom: 'Số lượng', kyHieu: '2' },
        { k: 'gia', t: 'Đơn giá', rong: 22, can: 'phai', so: true, kyHieu: '3' },
        { k: 'tien', t: 'Thành tiền', rong: 30, can: 'phai', so: true, batBuoc: true, kyHieu: '4' },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    cotTheoCheDo: {
      TT58: [
        { k: 'stt', t: 'Số thứ tự', rong: 10, can: 'giua', batBuoc: true, kyHieu: 'A' },
        { k: 'ten', t: 'Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hoá', rong: 55, can: 'trai', batBuoc: true, kyHieu: 'B' },
        { k: 'ma', t: 'Mã số', rong: 18, can: 'trai', kyHieu: 'C' },
        { k: 'dvt', t: 'Đơn vị tính', rong: 14, can: 'giua', kyHieu: 'D' },
        { k: 'slCt', t: 'Theo chứng từ', rong: 18, can: 'phai', so: true, nhom: 'Số lượng', kyHieu: '1' },
        { k: 'sl', t: 'Thực nhập', rong: 18, can: 'phai', so: true, batBuoc: true, nhom: 'Số lượng', kyHieu: '2' },
        { k: 'gia', t: 'Đơn giá', rong: 22, can: 'phai', so: true, kyHieu: '3' },
        { k: 'tien', t: 'Thành tiền', rong: 30, can: 'phai', so: true, batBuoc: true, kyHieu: '4' },
      ],
    },
    bangChu: 'Tổng số tiền (viết bằng chữ)',
    ghiChu: ['Số chứng từ gốc kèm theo: ......'],
    ky: [
      { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người giao hàng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ kho', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(hoặc bộ phận có nhu cầu nhập) (Ký, họ tên)' },
    ],
    kyTheoCheDo: {
      TT58: [
        { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Người giao hàng', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Thủ kho', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      ],
    },
    quyenSo: true,
    coNoCo: true,
    boPhan: true,
  },

  // 6. Phiếu xuất kho
  {
    id: 'phieu-xuat-kho',
    ten: 'Phiếu xuất kho',
    kyHieu: { TT58: '02-VT', TT133: '02-VT', TT99: '02-VT' },
    tieuDe: 'PHIẾU XUẤT KHO',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, true, true),
    soCotThongTin: 1,
    thongTin: [
      { k: 'nguoi', nhan: 'Họ và tên người nhận hàng', batBuoc: true },
      { k: 'diaChi', nhan: 'Địa chỉ (bộ phận)' },
      { k: 'lyDo', nhan: 'Lý do xuất kho', batBuoc: true },
      { k: 'kho', nhan: 'Xuất tại kho', batBuoc: true },
      { k: 'diaDiem', nhan: 'Địa điểm' },
    ],
    thongTinTheoCheDo: {
      TT58: [
        { k: 'nguoi', nhan: 'Họ và tên người nhận hàng', batBuoc: true },
        { k: 'diaChi', nhan: 'Địa chỉ (bộ phận)' },
        { k: 'lyDo', nhan: 'Lý do xuất kho', batBuoc: true },
        { k: 'kho', nhan: 'Xuất tại kho', batBuoc: true },
        { k: 'diaDiem', nhan: 'Địa điểm' },
      ],
    },
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true, kyHieu: 'A' },
        { k: 'ten', t: 'Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hoá', rong: 55, can: 'trai', batBuoc: true, kyHieu: 'B' },
        { k: 'ma', t: 'Mã số', rong: 18, can: 'trai', kyHieu: 'C' },
        { k: 'dvt', t: 'Đơn vị tính', rong: 14, can: 'giua', kyHieu: 'D' },
        { k: 'slCt', t: 'Yêu cầu', rong: 18, can: 'phai', so: true, nhom: 'Số lượng', kyHieu: '1' },
        { k: 'sl', t: 'Thực xuất', rong: 18, can: 'phai', so: true, batBuoc: true, nhom: 'Số lượng', kyHieu: '2' },
        { k: 'gia', t: 'Đơn giá', rong: 22, can: 'phai', so: true, kyHieu: '3' },
        { k: 'tien', t: 'Thành tiền', rong: 30, can: 'phai', so: true, batBuoc: true, kyHieu: '4' },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    cotTheoCheDo: {
      TT58: [
        { k: 'stt', t: 'Số thứ tự', rong: 10, can: 'giua', batBuoc: true, kyHieu: 'A' },
        { k: 'ten', t: 'Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hoá', rong: 55, can: 'trai', batBuoc: true, kyHieu: 'B' },
        { k: 'ma', t: 'Mã số', rong: 18, can: 'trai', kyHieu: 'C' },
        { k: 'dvt', t: 'Đơn vị tính', rong: 14, can: 'giua', kyHieu: 'D' },
        { k: 'slCt', t: 'Yêu cầu', rong: 18, can: 'phai', so: true, nhom: 'Số lượng', kyHieu: '1' },
        { k: 'sl', t: 'Thực xuất', rong: 18, can: 'phai', so: true, batBuoc: true, nhom: 'Số lượng', kyHieu: '2' },
        { k: 'gia', t: 'Đơn giá', rong: 22, can: 'phai', so: true, kyHieu: '3' },
        { k: 'tien', t: 'Thành tiền', rong: 30, can: 'phai', so: true, batBuoc: true, kyHieu: '4' },
      ],
    },
    bangChu: 'Tổng số tiền (viết bằng chữ)',
    ghiChu: ['Số chứng từ gốc kèm theo: ......'],
    ky: [
      { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người nhận hàng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ kho', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Giám đốc', goiY: '(Ký, họ tên, đóng dấu)' },
    ],
    kyTheoCheDo: {
      TT58: [
        { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Người nhận hàng', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Thủ kho', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
        { chucDanh: 'Người đại diện theo pháp luật', goiY: '(Ký, họ tên)' },
      ],
    },
    quyenSo: true,
    coNoCo: true,
    boPhan: true,
  },

  // 7. Bảng kê mua hàng
  {
    id: 'bang-ke-mua-hang',
    ten: 'Bảng kê mua hàng',
    kyHieu: { TT133: '06-VT', TT99: '06-VT' },
    tieuDe: 'BẢNG KÊ MUA HÀNG',
    trang: { kho: 'A4', huong: 'ngang', le: [10, 10, 10, 15], lien: 1, coChu: 10, phong: 'app' },
    khoi: taoKhoi(true, false, true, true),
    soCotThongTin: 1,
    thongTin: [
      { k: 'nguoi', nhan: 'Họ và tên người mua', batBuoc: true },
      { k: 'boPhan', nhan: 'Bộ phận (phòng, ban)' },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'ngayMua', t: 'Ngày, tháng, năm mua hàng', rong: 24, can: 'giua' },
        { k: 'tenBan', t: 'Tên người bán', rong: 40, can: 'trai', nhom: 'Người bán' },
        { k: 'diaChiBan', t: 'Địa chỉ', rong: 48, can: 'trai', nhom: 'Người bán' },
        { k: 'ten', t: 'Tên, quy cách, phẩm chất hàng hoá', rong: 54, can: 'trai', batBuoc: true },
        { k: 'dvt', t: 'Đơn vị tính', rong: 15, can: 'giua' },
        { k: 'sl', t: 'Số lượng', rong: 20, can: 'phai', so: true, batBuoc: true },
        { k: 'gia', t: 'Đơn giá', rong: 25, can: 'phai', so: true },
        { k: 'tien', t: 'Tổng giá thanh toán', rong: 30, can: 'phai', so: true, batBuoc: true },
      ],
      caoDong: 6,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    bangChu: 'Tổng giá trị hàng hoá mua vào (viết bằng chữ)',
    ghiChu: ['Kèm theo: ...... chứng từ gốc'],
    ky: [
      { chucDanh: 'Người mua', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người duyệt mua', goiY: '(Ký, họ tên)' },
    ],
  },

  // 8. Biên bản huỷ hàng
  {
    id: 'bien-ban-huy',
    ten: 'Biên bản huỷ hàng',
    kyHieu: {},
    tieuDe: 'BIÊN BẢN HUỶ HÀNG',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, false, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'thoiDiem', nhan: 'Thời điểm huỷ', batBuoc: true },
      { k: 'kho', nhan: 'Kho', batBuoc: true },
      { k: 'lyDo', nhan: 'Lý do huỷ', batBuoc: true },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'ten', t: 'Tên, quy cách hàng hoá', rong: 65, can: 'trai', batBuoc: true },
        { k: 'dvt', t: 'Đơn vị tính', rong: 20, can: 'giua' },
        { k: 'sl', t: 'Số lượng', rong: 25, can: 'phai', so: true, batBuoc: true },
        { k: 'gia', t: 'Đơn giá', rong: 30, can: 'phai', so: true },
        { k: 'tien', t: 'Thành tiền', rong: 35, can: 'phai', so: true, batBuoc: true },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    ky: [
      { chucDanh: 'Người lập', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ kho', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Giám đốc', goiY: '(Ký, họ tên, đóng dấu)' },
    ],
  },

  // 9. Phiếu xuất kho kiêm vận chuyển nội bộ
  {
    id: 'phieu-xk-vcnb',
    ten: 'Phiếu xuất kho kiêm vận chuyển nội bộ',
    kyHieu: {},
    tieuDe: 'PHIẾU XUẤT KHO KIÊM VẬN CHUYỂN NỘI BỘ',
    trang: { kho: 'A4', huong: 'ngang', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, false, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'lenhDieuDong', nhan: 'Căn cứ lệnh điều động số', batBuoc: true },
      { k: 'nguoi', nhan: 'Họ tên người vận chuyển', batBuoc: true },
      { k: 'phuongTien', nhan: 'Phương tiện vận chuyển' },
      { k: 'khoXuat', nhan: 'Xuất tại kho', batBuoc: true },
      { k: 'khoNhap', nhan: 'Nhập tại kho', batBuoc: true },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'ten', t: 'Tên, nhãn hiệu, quy cách vật tư, hàng hoá', rong: 72, can: 'trai', batBuoc: true },
        { k: 'ma', t: 'Mã số', rong: 25, can: 'trai' },
        { k: 'dvt', t: 'Đơn vị tính', rong: 20, can: 'giua' },
        { k: 'slXuat', t: 'Thực xuất', rong: 30, can: 'phai', so: true, batBuoc: true },
        { k: 'slNhap', t: 'Thực nhập', rong: 30, can: 'phai', so: true },
        { k: 'gia', t: 'Đơn giá', rong: 35, can: 'phai', so: true },
        { k: 'tien', t: 'Thành tiền', rong: 45, can: 'phai', so: true, batBuoc: true },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    ky: [
      { chucDanh: 'Người lập', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ kho xuất', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người vận chuyển', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ kho nhập', goiY: '(Ký, họ tên)' },
    ],
  },

  // 10. Biên bản kiểm kê vật tư, hàng hoá
  {
    id: 'bien-ban-kiem-ke',
    ten: 'Biên bản kiểm kê vật tư, hàng hoá',
    kyHieu: { TT133: '05-VT', TT99: '05-VT' },
    tieuDe: 'BIÊN BẢN KIỂM KÊ VẬT TƯ, HÀNG HOÁ',
    trang: { kho: 'A4', huong: 'ngang', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, false, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'thoiDiem', nhan: 'Thời điểm kiểm kê', batBuoc: true },
      { k: 'banKiemKe', nhan: 'Ban kiểm kê gồm', batBuoc: true },
      { k: 'kho', nhan: 'Đã kiểm kê kho', batBuoc: true },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 8, can: 'giua', batBuoc: true },
        { k: 'ten', t: 'Tên, nhãn hiệu, quy cách vật tư, dụng cụ, sản phẩm, hàng hoá', rong: 42, can: 'trai', batBuoc: true },
        { k: 'ma', t: 'Mã số', rong: 14, can: 'trai' },
        { k: 'dvt', t: 'Đơn vị tính', rong: 11, can: 'giua' },
        { k: 'gia', t: 'Đơn giá', rong: 18, can: 'phai', so: true },
        { k: 'slSo', t: 'Số lượng', rong: 13, can: 'phai', so: true, nhom: 'Theo sổ kế toán' },
        { k: 'tienSo', t: 'Thành tiền', rong: 20, can: 'phai', so: true, nhom: 'Theo sổ kế toán' },
        { k: 'sl', t: 'Số lượng', rong: 13, can: 'phai', so: true, batBuoc: true, nhom: 'Theo kiểm kê' },
        { k: 'tien', t: 'Thành tiền', rong: 20, can: 'phai', so: true, batBuoc: true, nhom: 'Theo kiểm kê' },
        { k: 'slThua', t: 'Số lượng', rong: 12, can: 'phai', so: true, nhom: 'Chênh lệch thừa' },
        { k: 'tienThua', t: 'Thành tiền', rong: 18, can: 'phai', so: true, nhom: 'Chênh lệch thừa' },
        { k: 'slThieu', t: 'Số lượng', rong: 12, can: 'phai', so: true, nhom: 'Chênh lệch thiếu' },
        { k: 'tienThieu', t: 'Thành tiền', rong: 18, can: 'phai', so: true, nhom: 'Chênh lệch thiếu' },
        { k: 'pcTot', t: 'Còn tốt 100%', rong: 13, can: 'phai', so: true, nhom: 'Phẩm chất' },
        { k: 'pcKem', t: 'Kém phẩm chất', rong: 13, can: 'phai', so: true, nhom: 'Phẩm chất' },
        { k: 'pcMat', t: 'Mất phẩm chất', rong: 13, can: 'phai', so: true, nhom: 'Phẩm chất' },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
      coChu: 9,
    },
    ky: [
      { chucDanh: 'Giám đốc', goiY: '(Ý kiến giải quyết số chênh lệch) (Ký, họ tên, đóng dấu)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Thủ kho', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Trưởng ban kiểm kê', goiY: '(Ký, họ tên)' },
    ],
  },

  // 11. Biên bản giao nhận TSCĐ
  {
    id: 'bb-giao-nhan-tscd',
    ten: 'Biên bản giao nhận TSCĐ',
    kyHieu: { TT133: '01-TSCĐ', TT99: '01-TSCĐ' },
    tieuDe: 'BIÊN BẢN GIAO NHẬN TSCĐ',
    trang: { kho: 'A4', huong: 'ngang', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, false, true),
    soCotThongTin: 1,
    thongTin: [
      { k: 'canCu', nhan: 'Căn cứ quyết định số', batBuoc: true },
      { k: 'benGiao', nhan: 'Đại diện bên giao', batBuoc: true },
      { k: 'benNhan', nhan: 'Đại diện bên nhận', batBuoc: true },
      { k: 'diaDiem', nhan: 'Địa điểm giao nhận TSCĐ' },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 9, can: 'giua', batBuoc: true },
        { k: 'ten', t: 'Tên, ký mã hiệu, quy cách (cấp hạng TSCĐ)', rong: 44, can: 'trai', batBuoc: true },
        { k: 'ma', t: 'Số hiệu TSCĐ', rong: 18, can: 'trai' },
        { k: 'nuocSx', t: 'Nước sản xuất (xây dựng)', rong: 18, can: 'trai' },
        { k: 'namSx', t: 'Năm sản xuất', rong: 14, can: 'giua' },
        { k: 'namSd', t: 'Năm đưa vào sử dụng', rong: 15, can: 'giua' },
        { k: 'congSuat', t: 'Công suất (diện tích thiết kế)', rong: 20, can: 'trai' },
        { k: 'giaMua', t: 'Giá mua (giá thành sản xuất)', rong: 26, can: 'phai', so: true, nhom: 'Tính nguyên giá TSCĐ' },
        { k: 'cpVc', t: 'Chi phí vận chuyển', rong: 20, can: 'phai', so: true, nhom: 'Tính nguyên giá TSCĐ' },
        { k: 'cpChayThu', t: 'Chi phí chạy thử', rong: 20, can: 'phai', so: true, nhom: 'Tính nguyên giá TSCĐ' },
        { k: 'tien', t: 'Nguyên giá TSCĐ', rong: 26, can: 'phai', so: true, batBuoc: true, nhom: 'Tính nguyên giá TSCĐ' },
        { k: 'tyLeHm', t: 'Tỷ lệ hao mòn (%)', rong: 14, can: 'giua' },
        { k: 'taiLieu', t: 'Tài liệu kỹ thuật kèm theo', rong: 24, can: 'trai' },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
      coChu: 9,
    },
    ghiChu: ['Dụng cụ, phụ tùng kèm theo: ......'],
    ky: [
      { chucDanh: 'Giám đốc bên nhận', goiY: '(Ký, họ tên, đóng dấu)' },
      { chucDanh: 'Kế toán trưởng bên nhận', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người nhận', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Người giao', goiY: '(Ký, họ tên)' },
    ],
  },

  // 12. Biên bản thanh lý TSCĐ
  {
    id: 'bb-thanh-ly-tscd',
    ten: 'Biên bản thanh lý TSCĐ',
    kyHieu: { TT133: '02-TSCĐ', TT99: '02-TSCĐ' },
    tieuDe: 'BIÊN BẢN THANH LÝ TSCĐ',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(false, false, false, false),
    soCotThongTin: 2,
    thongTin: [
      { k: 'canCu', nhan: 'Căn cứ quyết định số', batBuoc: true, caHang: true },
      { k: 'banThanhLy', nhan: 'Ban thanh lý gồm', batBuoc: true, caHang: true },
      { k: 'ten', nhan: 'Tên, ký mã hiệu, quy cách (cấp hạng) TSCĐ', batBuoc: true, caHang: true },
      { k: 'soHieuTs', nhan: 'Số hiệu TSCĐ' },
      { k: 'soThe', nhan: 'Số thẻ TSCĐ' },
      { k: 'nuocSx', nhan: 'Nước sản xuất (xây dựng)' },
      { k: 'namSx', nhan: 'Năm sản xuất' },
      { k: 'namSd', nhan: 'Năm đưa vào sử dụng' },
      { k: 'nguyenGia', nhan: 'Nguyên giá', batBuoc: true },
      { k: 'haoMon', nhan: 'Giá trị hao mòn đã trích đến thời điểm thanh lý', batBuoc: true, caHang: true },
      { k: 'conLai', nhan: 'Giá trị còn lại', batBuoc: true, caHang: true },
      { k: 'ketLuan', nhan: 'Kết luận của Ban thanh lý', batBuoc: true, caHang: true },
      { k: 'chiPhiTl', nhan: 'Chi phí thanh lý' },
      { k: 'thuHoi', nhan: 'Giá trị thu hồi' },
      { k: 'ngayGhiGiam', nhan: 'Đã ghi giảm sổ TSCĐ ngày', caHang: true },
    ],
    ky: [
      { chucDanh: 'Trưởng ban thanh lý', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Giám đốc', goiY: '(Ký, họ tên, đóng dấu)' },
    ],
  },

  // 13. Biên bản điều chuyển, ghi giảm CCDC
  {
    id: 'bien-ban-ccdc',
    ten: 'Biên bản điều chuyển, ghi giảm CCDC',
    kyHieu: {},
    tieuDe: 'BIÊN BẢN ĐIỀU CHUYỂN, GHI GIẢM CCDC',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, false, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'lyDo', nhan: 'Lý do', batBuoc: true },
      { k: 'benGiao', nhan: 'Bên giao', batBuoc: true },
      { k: 'benNhan', nhan: 'Bên nhận', batBuoc: true },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'ten', t: 'Tên, quy cách CCDC', rong: 70, can: 'trai', batBuoc: true },
        { k: 'ma', t: 'Mã số', rong: 25, can: 'trai' },
        { k: 'dvt', t: 'Đơn vị tính', rong: 20, can: 'giua' },
        { k: 'sl', t: 'Số lượng', rong: 25, can: 'phai', so: true, batBuoc: true },
        { k: 'tien', t: 'Thành tiền', rong: 35, can: 'phai', so: true, batBuoc: true },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    ky: [
      { chucDanh: 'Người lập', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Bên giao', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Bên nhận', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
    ],
  },

  // 14. Phiếu kế toán
  {
    id: 'phieu-ke-toan',
    ten: 'Phiếu kế toán',
    kyHieu: {},
    tieuDe: 'PHIẾU KẾ TOÁN',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, true, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'lyDo', nhan: 'Diễn giải', batBuoc: true },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'dienGiai', t: 'Diễn giải', rong: 80, can: 'trai', batBuoc: true },
        { k: 'tkNo', t: 'TK Nợ', rong: 22, can: 'giua', chiNoCo: true },
        { k: 'tkCo', t: 'TK Có', rong: 22, can: 'giua', chiNoCo: true },
        { k: 'tien', t: 'Số tiền', rong: 35, can: 'phai', so: true, batBuoc: true },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    bangChu: 'Số tiền viết bằng chữ',
    ky: [
      { chucDanh: 'Người lập phiếu', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
    ],
  },

  // 15. Bảng kê bán hàng theo ngày
  {
    id: 'bang-ke-ban-hang',
    ten: 'Bảng kê bán hàng theo ngày',
    kyHieu: {},
    tieuDe: 'BẢNG KÊ BÁN HÀNG THEO NGÀY',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, true, false, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'cn', nhan: 'Chi nhánh', batBuoc: true },
      { k: 'ngayBan', nhan: 'Ngày bán', batBuoc: true },
      { k: 'nguon', nhan: 'Nguồn dữ liệu' },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'ten', t: 'Tên món, hàng hoá', rong: 55, can: 'trai', batBuoc: true },
        { k: 'dvt', t: 'Đơn vị tính', rong: 15, can: 'giua' },
        { k: 'sl', t: 'Số lượng', rong: 18, can: 'phai', so: true, batBuoc: true },
        { k: 'gia', t: 'Đơn giá', rong: 25, can: 'phai', so: true },
        { k: 'tien', t: 'Thành tiền', rong: 32, can: 'phai', so: true, batBuoc: true },
        { k: 'thue', t: 'Tiền thuế', rong: 30, can: 'phai', so: true },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    tongCong: [
      { k: 'tien', nhan: 'Cộng tiền hàng' },
      { k: 'thue', nhan: 'Tiền thuế GTGT' },
      { k: 'tong', nhan: 'Tổng cộng' },
    ],
    ky: [
      { chucDanh: 'Người lập', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)' },
    ],
  },

  // 16. Hoá đơn giá trị gia tăng
  {
    id: 'hoa-don',
    ten: 'Hoá đơn giá trị gia tăng',
    kyHieu: {},
    tieuDe: 'HOÁ ĐƠN GIÁ TRỊ GIA TĂNG',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, true, true, false),
    soCotThongTin: 2,
    thongTin: [
      { k: 'kyHieuHd', nhan: 'Ký hiệu', batBuoc: true },
      { k: 'soHd', nhan: 'Số', batBuoc: true },
      { k: 'nguoi', nhan: 'Họ tên người mua hàng', caHang: true },
      { k: 'doiTuong', nhan: 'Tên đơn vị', batBuoc: true, caHang: true },
      { k: 'mst', nhan: 'Mã số thuế' },
      { k: 'hinhThucTt', nhan: 'Hình thức thanh toán' },
      { k: 'diaChi', nhan: 'Địa chỉ', caHang: true },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'ten', t: 'Tên hàng hoá, dịch vụ', rong: 65, can: 'trai', batBuoc: true },
        { k: 'dvt', t: 'Đơn vị tính', rong: 20, can: 'giua' },
        { k: 'sl', t: 'Số lượng', rong: 25, can: 'phai', so: true, batBuoc: true },
        { k: 'gia', t: 'Đơn giá', rong: 30, can: 'phai', so: true },
        { k: 'tien', t: 'Thành tiền', rong: 35, can: 'phai', so: true, batBuoc: true },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    tongCong: [
      { k: 'tien', nhan: 'Cộng tiền hàng' },
      { k: 'thueSuat', nhan: 'Thuế suất GTGT' },
      { k: 'thue', nhan: 'Tiền thuế GTGT' },
      { k: 'tong', nhan: 'Tổng tiền thanh toán' },
    ],
    bangChu: 'Số tiền viết bằng chữ',
    ky: [
      { chucDanh: 'Người mua hàng', goiY: '(Ký, ghi rõ họ tên)' },
      { chucDanh: 'Người bán hàng', goiY: '(Ký điện tử)' },
    ],
  },

  // 17. Biên bản đối chiếu công nợ
  {
    id: 'bien-ban-doi-chieu',
    ten: 'Biên bản đối chiếu công nợ',
    kyHieu: {},
    tieuDe: 'BIÊN BẢN ĐỐI CHIẾU CÔNG NỢ',
    trang: { kho: 'A4', huong: 'doc', le: [10, 10, 10, 15], lien: 1, coChu: 10.5, phong: 'app' },
    khoi: taoKhoi(true, false, false, false),
    soCotThongTin: 1,
    thongTin: [
      { k: 'benA', nhan: 'Bên A', batBuoc: true },
      { k: 'benB', nhan: 'Bên B', batBuoc: true },
      { k: 'kyDoiChieu', nhan: 'Kỳ đối chiếu', batBuoc: true },
    ],
    bang: {
      cot: [
        { k: 'stt', t: 'STT', rong: 10, can: 'giua', batBuoc: true },
        { k: 'so', t: 'Số chứng từ', rong: 25, can: 'trai', batBuoc: true },
        { k: 'ngay', t: 'Ngày', rong: 22, can: 'giua' },
        { k: 'dienGiai', t: 'Diễn giải', rong: 58, can: 'trai', batBuoc: true },
        { k: 'tang', t: 'Phát sinh tăng', rong: 35, can: 'phai', so: true },
        { k: 'giam', t: 'Phát sinh giảm', rong: 35, can: 'phai', so: true },
      ],
      caoDong: 7,
      dongTrongToiThieu: 5,
      dongTong: true,
    },
    ky: [
      { chucDanh: 'Đại diện bên A', goiY: '(Ký, họ tên)' },
      { chucDanh: 'Đại diện bên B', goiY: '(Ký, họ tên)' },
    ],
  },
]

export const mauIn = (id: string) => MAU_IN.find(m => m.id === id)

/** Các mẫu in của một màn chứng từ (mã Excel, vd '2.1.1') và loại phiếu (vd 'thu'); mẫu đầu là mặc định. Không có thì [] */
export function mauCuaChungTu(code: string, loai?: string, cd?: CheDo): MauIn[] {
  const ids: string[] = (() => {
    switch (code) {
      case '2.1.1':
        if (loai === 'thu') return ['phieu-thu']
        if (loai === 'chi') return ['phieu-chi']
        if (loai === 'cq') return ['phieu-chi', 'phieu-thu']
        if (loai === 'bc') return ['phieu-thu-nh']
        if (loai === 'unc') return ['uy-nhiem-chi']
        return ['phieu-chi', 'phieu-thu']
      case '2.1.2':
        return ['bien-ban-doi-chieu']
      case '2.1.3':
        return ['phieu-ke-toan']
      case '3.1.1':
        return ['bang-ke-ban-hang', 'hoa-don']
      case '3.1.2':
      case '3.1.5':
      case '3.1.6':
        return ['hoa-don']
      case '3.1.3':
        return ['phieu-xk-vcnb']
      case '3.1.4':
        return ['phieu-nhap-kho']
      case '4.1.1':
        return ['phieu-nhap-kho', 'bang-ke-mua-hang']
      case '4.1.2':
      case '4.1.3':
        return ['phieu-nhap-kho']
      case '4.1.4':
        return ['phieu-xuat-kho']
      case '4.1.5':
      case '4.1.6':
        return ['phieu-ke-toan']
      case '5.1.1':
        return ['phieu-nhap-kho']
      case '5.1.2':
      case '5.1.2-2':
      case '5.1.2-4':
        return ['phieu-xuat-kho']
      case '5.1.2-3':
        return ['phieu-xuat-kho', 'bien-ban-huy']
      case '5.1.3':
      case '5.1.6':
        return ['phieu-xuat-kho', 'phieu-nhap-kho']
      case '5.1.4':
        return ['phieu-xk-vcnb']
      case '5.1.10':
        return ['bien-ban-kiem-ke']
      case '5.1.11':
        return ['phieu-ke-toan']
      case '7.1.2':
        if (loai === 'tang' || loai === 'dc') return ['bb-giao-nhan-tscd']
        if (loai === 'tl') return ['bb-thanh-ly-tscd']
        if (loai === 'ngung') return ['phieu-ke-toan']
        return ['bb-giao-nhan-tscd']
      case '8.1.2':
        if (loai === 'tang') return ['phieu-xuat-kho']
        if (loai === 'dc' || loai === 'giam') return ['bien-ban-ccdc']
        return ['bien-ban-ccdc']
      case '8.1.3':
        return ['bien-ban-kiem-ke']
      case '10.1.1':
        return ['phieu-ke-toan']
      case '6.1.1':
      case '6.1.2':
        return []
      default:
        return ['phieu-ke-toan']
    }
  })()
  return ids.map(id => {
    const m = mauIn(id)
    return m ? (cd ? mauChoCheDo(m, cd) : m) : undefined
  }).filter(Boolean) as MauIn[]
}
