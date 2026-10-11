// Hệ thống tài khoản mẫu theo TT133; TT99 đổi một số tài khoản chi phí (chờ kế toán trưởng duyệt). Cột tài khoản có cảnh báo "Chưa gắn"
import { createElement } from 'react'
import type { Col, Row } from '../types'
import type { CheDo } from '../../app/che-do'
import { CCDC_HANG, HANG, NVL } from '../../data/mock'

export const tkCot = (k: string, t: string): Col => ({
  k, t, cls: 'code',
  r: (r: Row) => r[k] ? r[k] : createElement('span', { className: 'chip err' }, 'Chưa gắn'),
})

const TK: [string, string, string, string, string][] = [
  ['111', 'Tiền mặt', 'Tài sản', 'Dư Nợ', ''], ['1111', 'Tiền Việt Nam', 'Tài sản', 'Dư Nợ', 'Quỹ, chi nhánh'],
  ['112', 'Tiền gửi ngân hàng', 'Tài sản', 'Dư Nợ', ''], ['1121', 'Tiền Việt Nam', 'Tài sản', 'Dư Nợ', 'Tài khoản ngân hàng'],
  ['131', 'Phải thu của khách hàng', 'Tài sản', 'Lưỡng tính', 'Khách hàng'], ['133', 'Thuế GTGT được khấu trừ', 'Tài sản', 'Dư Nợ', ''],
  ['1331', 'Thuế GTGT được khấu trừ của hàng hoá, dịch vụ', 'Tài sản', 'Dư Nợ', ''], ['141', 'Tạm ứng', 'Tài sản', 'Dư Nợ', 'Nhân viên'],
  ['152', 'Nguyên liệu, vật liệu', 'Tài sản', 'Dư Nợ', 'Kho, hàng hoá'], ['153', 'Công cụ, dụng cụ', 'Tài sản', 'Dư Nợ', 'Kho, hàng hoá'],
  ['154', 'Chi phí sản xuất, kinh doanh dở dang', 'Tài sản', 'Dư Nợ', 'Công việc'], ['156', 'Hàng hoá', 'Tài sản', 'Dư Nợ', 'Kho, hàng hoá'],
  ['211', 'Tài sản cố định', 'Tài sản', 'Dư Nợ', 'Tài sản'], ['214', 'Hao mòn tài sản cố định', 'Tài sản', 'Dư Có', 'Tài sản'],
  ['242', 'Chi phí trả trước', 'Tài sản', 'Dư Nợ', 'Khoản phân bổ'], ['331', 'Phải trả cho người bán', 'Nợ phải trả', 'Lưỡng tính', 'Nhà cung cấp'],
  ['333', 'Thuế và các khoản phải nộp Nhà nước', 'Nợ phải trả', 'Dư Có', ''], ['33311', 'Thuế GTGT đầu ra', 'Nợ phải trả', 'Dư Có', ''],
  ['334', 'Phải trả người lao động', 'Nợ phải trả', 'Dư Có', 'Nhân viên'], ['338', 'Phải trả, phải nộp khác', 'Nợ phải trả', 'Dư Có', ''],
  ['341', 'Vay và nợ thuê tài chính', 'Nợ phải trả', 'Dư Có', 'Khế ước vay'], ['411', 'Vốn đầu tư của chủ sở hữu', 'Vốn chủ sở hữu', 'Dư Có', ''],
  ['421', 'Lợi nhuận sau thuế chưa phân phối', 'Vốn chủ sở hữu', 'Lưỡng tính', ''], ['511', 'Doanh thu bán hàng và cung cấp dịch vụ', 'Doanh thu', 'Không số dư', ''],
  ['5111', 'Doanh thu bán hàng hoá', 'Doanh thu', 'Không số dư', 'Chi nhánh, hàng hoá'], ['515', 'Doanh thu hoạt động tài chính', 'Doanh thu', 'Không số dư', ''],
  ['632', 'Giá vốn hàng bán', 'Chi phí', 'Không số dư', 'Chi nhánh, hàng hoá'], ['635', 'Chi phí tài chính', 'Chi phí', 'Không số dư', ''],
  ['642', 'Chi phí quản lý kinh doanh', 'Chi phí', 'Không số dư', 'Mục chi phí'], ['6421', 'Chi phí bán hàng', 'Chi phí', 'Không số dư', 'Mục chi phí, chi nhánh'],
  ['6422', 'Chi phí quản lý doanh nghiệp', 'Chi phí', 'Không số dư', 'Mục chi phí'], ['711', 'Thu nhập khác', 'Thu nhập khác', 'Không số dư', ''],
  ['811', 'Chi phí khác', 'Chi phí', 'Không số dư', ''], ['821', 'Chi phí thuế thu nhập doanh nghiệp', 'Chi phí', 'Không số dư', ''],
  ['911', 'Xác định kết quả kinh doanh', 'Kết quả', 'Không số dư', ''],
]
export const TAI_KHOAN = TK.map(([so, ten, loai, tc, ct]) => ({ so, ten, loai, tc, ct }))

/** Hệ thống tài khoản theo chế độ: TT99 thay 642, 6421, 6422 bằng 641, 642; đổi tên 211; thêm 8211 */
export function taiKhoan(cd: CheDo) {
  if (cd !== 'TT99') return TAI_KHOAN
  return TAI_KHOAN.flatMap(t => {
    if (t.so === '642') return [
      { so: '641', ten: 'Chi phí bán hàng', loai: 'Chi phí', tc: 'Không số dư', ct: 'Mục chi phí, chi nhánh' },
      { so: '642', ten: 'Chi phí quản lý doanh nghiệp', loai: 'Chi phí', tc: 'Không số dư', ct: 'Mục chi phí' },
    ]
    if (t.so === '6421' || t.so === '6422') return []
    if (t.so === '211') return [{ ...t, ten: 'Tài sản cố định hữu hình' }]
    if (t.so === '821') return [t, { so: '8211', ten: 'Chi phí thuế thu nhập doanh nghiệp hiện hành', loai: 'Chi phí', tc: 'Không số dư', ct: '' }]
    return [t]
  })
}

/** Đơn vị tính cơ bản ngành F&B: mã viết hoa không dấu, tên, mô tả (T88). Mọi ô chọn ĐVT trong panel danh mục lấy từ đây */
export const DON_VI_TINH: [string, string, string][] = [
  ['TO', 'Tô', 'Món nước'], ['PHAN', 'Phần', 'Món ăn'], ['DIA', 'Dĩa', 'Món cơm'], ['SUAT', 'Suất', 'Cơm phần, set ăn'],
  ['BAT', 'Bát', 'Món nước, chè'], ['CHEN', 'Chén', 'Nước chấm, chè'], ['NOI', 'Nồi', 'Lẩu'], ['LY', 'Ly', 'Đồ uống pha chế'],
  ['COC', 'Cốc', 'Đồ uống'], ['LON', 'Lon', 'Bia, nước ngọt'], ['CHAI', 'Chai', 'Nước suối, rượu'],
  ['KET', 'Két', 'Bia, nước ngọt nhập hàng'], ['THUNG', 'Thùng', 'Đóng gói nhập hàng'], ['HOP', 'Hộp', 'Đồ hộp'],
  ['GOI', 'Gói', 'Gia vị, đồ khô'], ['BICH', 'Bịch', 'Đá, đồ khô'], ['BAO', 'Bao', 'Gạo, bột'],
  ['TUI', 'Túi', 'Đóng gói mang về'], ['CAN', 'Can', 'Dầu ăn, nước mắm'], ['KG', 'kg', 'Nguyên liệu tươi'],
  ['G', 'g', 'Định lượng công thức'], ['LIT', 'Lít', 'Dầu ăn, sữa tươi'], ['ML', 'ml', 'Định lượng pha chế'],
  ['CON', 'Con', 'Hải sản, gia cầm'], ['QUA', 'Quả', 'Trái cây, trứng'], ['VI', 'Vỉ', 'Trứng'],
  ['KHAY', 'Khay', 'Thịt đóng khay'], ['MIENG', 'Miếng', 'Bánh, thịt cắt'], ['XIEN', 'Xiên', 'Món nướng'],
  ['CAI', 'Cái', 'Công cụ dụng cụ'], ['CHIEC', 'Chiếc', 'Công cụ dụng cụ'], ['BO', 'Bộ', 'Bộ dụng cụ, set'],
  ['DOI', 'Đôi', 'Đũa'], ['LAN', 'Lần', 'Dịch vụ'], ['GIO', 'Giờ', 'Dịch vụ theo giờ'], ['THANG', 'Tháng', 'Thuê theo tháng'],
]
export const TEN_DVT = DON_VI_TINH.map(d => d[1])

export interface NhomHang {
  ma: string
  ten: string
  thuocNhom?: string
  loai?: string
  dienGiai?: string
  tkKho?: string
  tkDt?: string
  tkGv?: string
  tkCp?: string
  tkTraLai?: string
  mucCp?: string
  ppGia?: string
  ts?: string
  tonKho?: boolean
  khoMacDinh?: string
}

export const NHOM_HANG: NhomHang[] = [
  { ma: 'NHH01', ten: 'Món khai vị', thuocNhom: '', loai: 'Thành phẩm', dienGiai: 'Món ăn nhẹ đầu bữa', tkKho: '', tkDt: '5111', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: 'Quảng cáo, khuyến mãi', ppGia: 'Bình quân cuối kỳ', ts: '8', tonKho: false, khoMacDinh: 'Kho bếp Lê Lợi' },
  { ma: 'NHH02', ten: 'Món chính', thuocNhom: '', loai: 'Thành phẩm', dienGiai: 'Món ăn no chính của quán', tkKho: '', tkDt: '5111', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: 'Quảng cáo, khuyến mãi', ppGia: 'Bình quân cuối kỳ', ts: '8', tonKho: false, khoMacDinh: 'Kho bếp Lê Lợi' },
  { ma: 'NHH03', ten: 'Món lẩu', thuocNhom: '', loai: 'Thành phẩm', dienGiai: 'Các món lẩu và đồ nhúng', tkKho: '', tkDt: '5111', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: 'Quảng cáo, khuyến mãi', ppGia: 'Bình quân cuối kỳ', ts: '8', tonKho: false, khoMacDinh: 'Kho bếp Lê Lợi' },
  { ma: 'NHH04', ten: 'Đồ uống', thuocNhom: '', loai: 'Hàng hoá', dienGiai: 'Cà phê, trà, nước ngọt', tkKho: '1561', tkDt: '5111', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: 'Quảng cáo, khuyến mãi', ppGia: 'Bình quân cuối kỳ', ts: '8', tonKho: true, khoMacDinh: 'Kho bar Lê Lợi' },
  { ma: 'NHH05', ten: 'Tráng miệng', thuocNhom: '', loai: 'Thành phẩm', dienGiai: 'Chè, bánh ngọt, trái cây', tkKho: '', tkDt: '5111', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: 'Quảng cáo, khuyến mãi', ppGia: 'Bình quân cuối kỳ', ts: '8', tonKho: false, khoMacDinh: 'Kho bếp Lê Lợi' },
  { ma: 'NHH06', ten: 'Món mới tháng 10', thuocNhom: '', loai: 'Thành phẩm', dienGiai: 'Các món ăn ra mắt trong tháng 10', tkKho: '', tkDt: '5111', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: 'Quảng cáo, khuyến mãi', ppGia: 'Bình quân cuối kỳ', ts: '8', tonKho: false, khoMacDinh: 'Kho bếp Lê Lợi' },
  { ma: 'NHH07', ten: 'Thịt, cá', thuocNhom: '', loai: 'Nguyên vật liệu', dienGiai: 'Nguyên liệu thịt tươi sống, thuỷ hải sản', tkKho: '152', tkDt: '', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: '', ppGia: 'Bình quân cuối kỳ', ts: 'KCT', tonKho: true, khoMacDinh: 'Kho tổng' },
  { ma: 'NHH08', ten: 'Rau củ', thuocNhom: '', loai: 'Nguyên vật liệu', dienGiai: 'Rau sạch, nấm, củ quả tươi', tkKho: '152', tkDt: '', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: '', ppGia: 'Bình quân cuối kỳ', ts: '0', tonKho: true, khoMacDinh: 'Kho tổng' },
  { ma: 'NHH09', ten: 'Gia vị', thuocNhom: '', loai: 'Nguyên vật liệu', dienGiai: 'Dầu ăn, nước mắm, sốt, đồ khô', tkKho: '152', tkDt: '', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: '', ppGia: 'Bình quân cuối kỳ', ts: '8', tonKho: true, khoMacDinh: 'Kho tổng' },
  { ma: 'NHH10', ten: 'Bia, nước ngọt', thuocNhom: '', loai: 'Hàng hoá', dienGiai: 'Bia lon, nước đóng chai', tkKho: '1561', tkDt: '5111', tkGv: '632', tkCp: '6421', tkTraLai: '', mucCp: 'Quảng cáo, khuyến mãi', ppGia: 'Bình quân cuối kỳ', ts: '10', tonKho: true, khoMacDinh: 'Kho bar Lê Lợi' },
]
export const TEN_NHOM_HANG = NHOM_HANG.map(n => n.ten)

export interface NhomDoiTuong {
  ma: string
  ten: string
  thuocNhom?: string
  dienGiai?: string
  tkThu?: string
  tkTra?: string
}

export const NHOM_DOI_TUONG: NhomDoiTuong[] = [
  { ma: 'NDT01', ten: 'Khách lẻ', thuocNhom: '', dienGiai: 'Khách ăn tại quán, mua mang về', tkThu: '131', tkTra: '331' },
  { ma: 'NDT02', ten: 'Khách doanh nghiệp', thuocNhom: '', dienGiai: 'Khách hàng công ty, cơ quan đặt tiệc', tkThu: '131', tkTra: '331' },
  { ma: 'NDT03', ten: 'Khách công ty', thuocNhom: 'Khách doanh nghiệp', dienGiai: 'Doanh nghiệp ký hợp đồng ăn ca, tiếp khách', tkThu: '131', tkTra: '331' },
  { ma: 'NDT04', ten: 'Sàn giao đồ ăn', thuocNhom: '', dienGiai: 'GrabFood, ShopeeFood, sàn đối tác', tkThu: '131', tkTra: '331' },
  { ma: 'NDT05', ten: 'Nhà cung cấp thực phẩm', thuocNhom: '', dienGiai: 'Cung cấp thịt, cá, rau củ tươi sống', tkThu: '131', tkTra: '331' },
  { ma: 'NDT06', ten: 'Nhà cung cấp đồ uống', thuocNhom: '', dienGiai: 'Cung cấp bia, rượu, nước ngọt đóng chai', tkThu: '131', tkTra: '331' },
  { ma: 'NDT07', ten: 'Thịt, cá', thuocNhom: 'Nhà cung cấp thực phẩm', dienGiai: 'Nhà cung cấp thịt tươi, hải sản', tkThu: '131', tkTra: '331' },
  { ma: 'NDT08', ten: 'Tinh bột', thuocNhom: 'Nhà cung cấp thực phẩm', dienGiai: 'Bánh phở, gạo tấm, bún tươi', tkThu: '131', tkTra: '331' },
  { ma: 'NDT09', ten: 'Pha chế', thuocNhom: 'Nhà cung cấp đồ uống', dienGiai: 'Cà phê hạt, trà, sữa đặc, siro', tkThu: '131', tkTra: '331' },
  { ma: 'NDT10', ten: 'Bia, rượu', thuocNhom: 'Nhà cung cấp đồ uống', dienGiai: 'Bia các loại, rượu vang', tkThu: '131', tkTra: '331' },
  { ma: 'NDT11', ten: 'Rau củ', thuocNhom: 'Nhà cung cấp thực phẩm', dienGiai: 'Rau sạch, củ quả, nấm', tkThu: '131', tkTra: '331' },
  { ma: 'NDT12', ten: 'Công cụ, thiết bị', thuocNhom: '', dienGiai: 'Nhà cung cấp bếp, bát đĩa, thiết bị POS', tkThu: '131', tkTra: '331' },
  { ma: 'NDT13', ten: 'Điện nước', thuocNhom: '', dienGiai: 'Điện lực, cấp nước, viễn thông', tkThu: '131', tkTra: '331' },
  { ma: 'NDT14', ten: 'Nhân viên', thuocNhom: '', dienGiai: 'Cán bộ công nhân viên nội bộ', tkThu: '141', tkTra: '334' },
]
export const TEN_NHOM_DOI_TUONG = NHOM_DOI_TUONG.map(n => n.ten)

export interface NhomMucChiPhi {
  ma: string
  ten: string
  thuocNhom?: string
  dienGiai?: string
}

export const NHOM_MUC_CP: NhomMucChiPhi[] = [
  { ma: 'NCP01', ten: 'Nhân công', thuocNhom: '', dienGiai: 'Lương, thưởng, phụ cấp nhân viên' },
  { ma: 'NCP02', ten: 'Mặt bằng', thuocNhom: '', dienGiai: 'Chi phí thuê nhà, mặt bằng kinh doanh' },
  { ma: 'NCP03', ten: 'Điện, nước, gas', thuocNhom: '', dienGiai: 'Năng lượng, nhiên liệu vận hành bếp' },
  { ma: 'NCP04', ten: 'Bán hàng', thuocNhom: '', dienGiai: 'Quảng cáo, hoa hồng sàn giao đồ ăn' },
  { ma: 'NCP05', ten: 'Khác', thuocNhom: '', dienGiai: 'Văn phòng phẩm, sửa chữa và chi phí khác' },
]
export const TEN_NHOM_MUC_CP = NHOM_MUC_CP.map(n => n.ten)

export interface NhomCongViec {
  ma: string
  ten: string
  thuocNhom?: string
  dienGiai?: string
}

export const NHOM_CONG_VIEC: NhomCongViec[] = [
  { ma: 'NCV01', ten: 'Mở rộng', thuocNhom: '', dienGiai: 'Khai trương, mở thêm điểm bán mới' },
  { ma: 'NCV02', ten: 'Marketing', thuocNhom: '', dienGiai: 'Chương trình truyền thông, sự kiện' },
  { ma: 'NCV03', ten: 'Sửa chữa lớn', thuocNhom: '', dienGiai: 'Cải tạo mặt bằng, nâng cấp bếp' },
  { ma: 'NCV04', ten: 'Bán hàng', thuocNhom: '', dienGiai: 'Tiệc công ty, bán hàng theo hợp đồng' },
]
export const TEN_NHOM_CONG_VIEC = NHOM_CONG_VIEC.map(n => n.ten)

export interface NhomKho {
  ma: string
  ten: string
  thuocNhom?: string
  dienGiai?: string
}

export const NHOM_KHO: NhomKho[] = [
  { ma: 'NK01', ten: 'Kho bếp', thuocNhom: '', dienGiai: 'Kho nguyên liệu tại khu vực bếp của chi nhánh' },
  { ma: 'NK02', ten: 'Kho pha chế', thuocNhom: '', dienGiai: 'Kho đồ uống, nguyên liệu quầy bar' },
  { ma: 'NK03', ten: 'Kho tổng', thuocNhom: '', dienGiai: 'Kho trung tâm điều phối nguyên vật liệu' },
  { ma: 'NK04', ten: 'Kho phụ trợ', thuocNhom: '', dienGiai: 'Kho chứa công cụ dụng cụ, bao bì, vật tư' },
]
export const TEN_NHOM_KHO = NHOM_KHO.map(n => n.ten)

export const TEN_MUC_CHI_PHI = [
  'Lương nhân viên bếp', 'Lương phục vụ, thu ngân', 'Lương văn phòng',
  'Thuê mặt bằng', 'Điện', 'Nước', 'Gas',
  'Hoa hồng app giao đồ ăn', 'Quảng cáo, khuyến mãi', 'Sửa chữa, bảo trì', 'Văn phòng phẩm'
]

export const TEN_CONG_VIEC_17 = [
  'Khai trương chi nhánh Thảo Điền', 'Sự kiện Trung thu 2026', 'Cải tạo bếp Lê Lợi', 'Tiệc cuối năm khách công ty'
]

export const DS_HANG_HOA_12 = [
  ...HANG.map(h => ({ ma: h.ma, ten: h.ten, nhom: h.nhom })),
  { ma: 'BUN02', ten: 'Bún bò Huế', nhom: 'Món mới tháng 10' },
  { ma: 'MI01', ten: 'Mì Quảng tôm thịt', nhom: 'Món mới tháng 10' },
  ...NVL.map(h => ({ ma: h.ma, ten: h.ten, nhom: h.nhom })),
  ...CCDC_HANG.map(h => ({ ma: h.ma, ten: h.ten, nhom: h.nhom })),
]

export function demHangTheoNhom(tenNhom: string): number {
  if (!tenNhom) return 0
  return DS_HANG_HOA_12.filter(h => {
    if (h.nhom === tenNhom) return true
    if (tenNhom === 'Bia, nước ngọt' && (h.nhom === 'Bia, rượu' || h.nhom === 'Bia, nước ngọt')) return true
    if (tenNhom === 'Món khai vị' && (h.nhom === 'Khai vị' || h.nhom === 'Món khai vị')) return true
    return false
  }).length
}

export interface PhuongThucTT {
  ma: string
  ten: string
  loaiCt: string
  tkNo: string
  doiTuong: string
  congViec: string
  mucCp: string
  dienGiai: string
  _tt: number
}

/** Danh mục phương thức thanh toán (T137) */
export const DS_PTTT: PhuongThucTT[] = [
  {
    ma: 'TM',
    ten: 'Tiền mặt',
    loaiCt: 'Thu tiền mặt',
    tkNo: '1111',
    doiTuong: '',
    congViec: '',
    mucCp: '',
    dienGiai: 'Thanh toán trực tiếp bằng tiền mặt',
    _tt: 1,
  },
  {
    ma: 'CK',
    ten: 'Chuyển khoản, QR',
    loaiCt: 'Thu ngân hàng',
    tkNo: '1121',
    doiTuong: '',
    congViec: '',
    mucCp: '',
    dienGiai: 'Chuyển khoản ngân hàng hoặc quét mã QR',
    _tt: 1,
  },
  {
    ma: 'THE',
    ten: 'Thẻ',
    loaiCt: 'Thu ngân hàng',
    tkNo: '1121',
    doiTuong: '',
    congViec: '',
    mucCp: '',
    dienGiai: 'Thanh toán quẹt thẻ qua máy POS',
    _tt: 1,
  },
  {
    ma: 'APP',
    ten: 'App giao đồ ăn',
    loaiCt: 'Thu tiền mặt',
    tkNo: '131',
    doiTuong: 'GrabFood',
    congViec: '',
    mucCp: 'Hoa hồng app giao đồ ăn',
    dienGiai: 'Đơn hàng qua ứng dụng giao đồ ăn',
    _tt: 1,
  },
]


