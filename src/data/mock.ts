// Dữ liệu giả dùng chung. Mọi màn đọc doanh thu từ DAILY để số khớp nhau giữa
// Tổng quan, chứng từ bán hàng, sổ, báo cáo kết quả kinh doanh.
import type { Goi } from '../app/plan'
import { k, rng, between, pad } from '../ui/format'

export const HOM_NAY = new Date(2026, 9, 7)          // 07/10/2026
export const KY_MO = { thang: 10, nam: 2026 }        // kỳ đang mở
export const KY_KHOA_SO = { thang: 9, nam: 2026 }    // kỳ đang làm khoá sổ
export const KHOA_SO_DEN = { thang: 8, nam: 2026 }   // đã khoá sổ đến hết tháng này
/** Khoá sổ thật trên máy (T315): tháng đã khoá và lịch sử khoá, mở khoá lưu ở trình duyệt, bản mẫu chưa có backend */
export interface LichSuKhoaSo { ky: string; viec: string; ai: string; luc: string }
const KHOA_LUU = 'iacc-khoa-so'
const LICH_SU_MAU: LichSuKhoaSo[] = [
  { ky: '8/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '05/09/2026 17:42:15' },
  { ky: '7/2026', viec: 'Mở khoá, lý do: bổ sung hoá đơn điện', ai: 'Trần Thu Hà', luc: '12/08/2026 09:05:48' },
  { ky: '7/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '06/08/2026 16:20:03' },
]
export const LICH_SU_KHOA_SO: LichSuKhoaSo[] = [...LICH_SU_MAU]
try {
  const v = JSON.parse(localStorage.getItem(KHOA_LUU) ?? 'null') as { den?: { thang: number; nam: number }; ls?: LichSuKhoaSo[] } | null
  if (v?.den?.thang) Object.assign(KHOA_SO_DEN, v.den)
  if (v?.ls?.length) LICH_SU_KHOA_SO.splice(0, LICH_SU_KHOA_SO.length, ...v.ls)
} catch { /* trình duyệt chặn thì dùng số mẫu */ }
/** Đặt tháng đã khoá sổ đến (khoá thêm một tháng hoặc mở khoá lùi một tháng), ghi lịch sử, báo các màn vẽ lại */
export function datKhoaSoDen(thang: number, nam: number, viec: string, ai: string) {
  Object.assign(KHOA_SO_DEN, { thang, nam })
  const ky = viec.startsWith('Mở') ? `${thang === 12 ? 1 : thang + 1}/${thang === 12 ? nam + 1 : nam}` : `${thang}/${nam}`
  // Lúc khoá, mở khoá: ngày làm việc của bản mẫu (07/10/2026), giờ phút giây theo đồng hồ máy
  const d = new Date(), p = (n: number) => String(n).padStart(2, '0')
  LICH_SU_KHOA_SO.unshift({ ky, viec, ai, luc: `07/10/2026 ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` })
  try { localStorage.setItem(KHOA_LUU, JSON.stringify({ den: KHOA_SO_DEN, ls: LICH_SU_KHOA_SO })) } catch { /* bỏ qua */ }
  window.dispatchEvent(new Event('iacc-khoa-so'))
}
/** Ngày dd/mm/yyyy thuộc kỳ đã khoá sổ: chứng từ không được xoá (T48) */
export const daKhoaSo = (ngay: unknown) => {
  const [, m, y] = String(ngay).split('/').map(Number)
  return y < KHOA_SO_DEN.nam || (y === KHOA_SO_DEN.nam && m <= KHOA_SO_DEN.thang)
}

export interface DonVi { id: string; ten: string; viettat: string; mst: string; goi: Goi; diaChi: string; diem: number; nguoiDaiDien: string }
export const DON_VI: DonVi[] = [
  { id: 'pm', ten: 'Công ty TNHH Ẩm thực Phố Mây', viettat: 'PM', mst: '0319 990 001', goi: 'PL', diaChi: '86 Lê Lợi, phường Sài Gòn, TP.HCM', diem: 3, nguoiDaiDien: 'Nguyễn Minh Anh' },
  { id: 'tl', ten: 'Công ty CP Chuỗi Trà Lá', viettat: 'TL', mst: '0319 990 002', goi: 'PR', diaChi: '12 Nguyễn Văn Linh, phường Tân Hưng, TP.HCM', diem: 14, nguoiDaiDien: 'Nguyễn Minh Anh' },
  { id: 'gn', ten: 'Hộ kinh doanh Cà phê Góc Nhỏ', viettat: 'GN', mst: '8090 112 233', goi: 'F', diaChi: '5 Hẻm 42 Trần Quang Khải, phường Tân Định, TP.HCM', diem: 1, nguoiDaiDien: 'Nguyễn Minh Anh' },
]

export interface CuaHang { id: string; posId?: string; ten: string; ngan: string; base: number; kho: string[] }
export const CUA_HANG: CuaHang[] = [
  { id: 'q1', posId: '10001', ten: 'Phố Mây Lê Lợi', ngan: 'Lê Lợi', base: 33_500_000, kho: ['Kho bếp Lê Lợi', 'Kho bar Lê Lợi'] },
  { id: 'q5', posId: '10002', ten: 'Phố Mây Nguyễn Trãi', ngan: 'Nguyễn Trãi', base: 24_800_000, kho: ['Kho bếp Nguyễn Trãi'] },
  { id: 'td', posId: '10003', ten: 'Phố Mây Thảo Điền', ngan: 'Thảo Điền', base: 28_600_000, kho: ['Kho bếp Thảo Điền', 'Kho bar Thảo Điền'] },
]
export const KHO = ['Kho tổng', ...CUA_HANG.flatMap(c => c.kho)]

export type Role = 'owner' | 'ktt' | 'ktv'
export const ROLE: Record<Role, string> = { owner: 'Chủ doanh nghiệp', ktt: 'Kế toán trưởng', ktv: 'Kế toán viên' }
export const NGUOI_DUNG = [
  { ten: 'Nguyễn Minh Anh', username: 'minhanh', email: 'minhanh@phomay.vn', sdt: '0901 234 567', bp: 'Ban giám đốc', cv: 'Giám đốc', role: 'owner' as Role, vaiTro: 'Chủ doanh nghiệp', pham: 'Tất cả cửa hàng', kho: 'Tất cả kho', otp2fa: true, hieuLucTu: '01/01/2026', lan: 'Hôm nay 08:12', tt: 'ok', _tt: 1, dongY: true },
  { ten: 'Trần Thu Hà', username: 'thuha', email: 'thuha@phomay.vn', sdt: '0912 345 678', bp: 'Phòng kế toán', cv: 'Kế toán trưởng', role: 'ktt' as Role, vaiTro: 'Kế toán trưởng', pham: 'Tất cả cửa hàng', kho: 'Tất cả kho', otp2fa: true, hieuLucTu: '01/01/2026', lan: 'Hôm nay 09:40', tt: 'ok', _tt: 1, dongY: true },
  { ten: 'Lê Quốc Bảo', username: 'quocbao', email: 'quocbao@phomay.vn', sdt: '0923 456 789', bp: 'Phòng kế toán', cv: 'Kế toán viên', role: 'ktv' as Role, vaiTro: 'Kế toán viên', pham: 'Tất cả cửa hàng', kho: 'Tất cả kho', otp2fa: false, hieuLucTu: '01/01/2026', lan: 'Hôm nay 10:05', tt: 'ok', _tt: 1, dongY: true },
  { ten: 'Phạm Ngọc Lan', username: 'ngoclan', email: 'ngoclan@phomay.vn', sdt: '0934 567 890', bp: 'Cửa hàng Thảo Điền', cv: 'Cửa hàng trưởng', role: 'ktv' as Role, vaiTro: 'Quản lý cửa hàng', pham: 'Phố Mây Thảo Điền', kho: 'Kho bếp Thảo Điền', otp2fa: false, hieuLucTu: '01/01/2026', lan: 'Hôm qua 21:30', tt: 'ok', _tt: 1, dongY: true },
  { ten: 'Võ Thanh Tùng', username: 'thanhtung', email: 'thanhtung@phomay.vn', sdt: '0945 678 901', bp: 'Kho vận', cv: 'Thủ kho', role: 'ktv' as Role, vaiTro: 'Thủ kho', pham: 'Phố Mây Lê Lợi', kho: 'Kho tổng', otp2fa: false, hieuLucTu: '01/01/2026', lan: 'Chưa đăng nhập', tt: 'warn', _tt: 1, dongY: true },
]

/** tonKho: hàng có theo dõi tồn kho (T114). Món chế biến không theo dõi tồn, kho trừ nguyên vật liệu theo định lượng; hàng mua về bán lại có theo dõi tồn */
export const HANG = [
  { ma: 'PHO01', ten: 'Phở bò tái', nhom: 'Món nước', dvt: 'Tô', gia: 65000, ts: 8, tonKho: false },
  { ma: 'PHO02', ten: 'Phở bò đặc biệt', nhom: 'Món nước', dvt: 'Tô', gia: 85000, ts: 8, tonKho: false },
  { ma: 'BUN01', ten: 'Bún chả Hà Nội', nhom: 'Món nước', dvt: 'Phần', gia: 60000, ts: 8, tonKho: false },
  { ma: 'COM01', ten: 'Cơm tấm sườn bì chả', nhom: 'Món cơm', dvt: 'Dĩa', gia: 55000, ts: 8, tonKho: false },
  { ma: 'GOI01', ten: 'Gỏi cuốn tôm thịt', nhom: 'Khai vị', dvt: 'Phần', gia: 45000, ts: 8, tonKho: false },
  { ma: 'CF01', ten: 'Cà phê sữa đá', nhom: 'Đồ uống', dvt: 'Ly', gia: 29000, ts: 8, tonKho: false },
  { ma: 'TRA01', ten: 'Trà đào cam sả', nhom: 'Đồ uống', dvt: 'Ly', gia: 39000, ts: 8, tonKho: false },
  { ma: 'BIA01', ten: 'Bia Sài Gòn lon', nhom: 'Bia, rượu', dvt: 'Lon', gia: 22000, ts: 10, tonKho: true },
  { ma: 'NS01', ten: 'Nước suối', nhom: 'Đồ uống', dvt: 'Chai', gia: 12000, ts: 8, tonKho: true },
]
export const NVL = [
  { ma: 'NVL001', ten: 'Thịt bò thăn', nhom: 'Thịt, cá', dvt: 'kg', gia: 320000, ts: 0 },
  { ma: 'NVL002', ten: 'Xương ống bò', nhom: 'Thịt, cá', dvt: 'kg', gia: 65000, ts: 0 },
  { ma: 'NVL003', ten: 'Bánh phở tươi', nhom: 'Tinh bột', dvt: 'kg', gia: 18000, ts: 0 },
  { ma: 'NVL004', ten: 'Sườn heo', nhom: 'Thịt, cá', dvt: 'kg', gia: 145000, ts: 0 },
  { ma: 'NVL005', ten: 'Gạo tấm', nhom: 'Tinh bột', dvt: 'kg', gia: 19000, ts: 5 },
  { ma: 'NVL006', ten: 'Tôm sú', nhom: 'Thịt, cá', dvt: 'kg', gia: 280000, ts: 0 },
  { ma: 'NVL007', ten: 'Rau thơm các loại', nhom: 'Rau củ', dvt: 'kg', gia: 40000, ts: 0 },
  { ma: 'NVL008', ten: 'Cà phê hạt Robusta', nhom: 'Pha chế', dvt: 'kg', gia: 210000, ts: 5 },
  { ma: 'NVL009', ten: 'Sữa đặc', nhom: 'Pha chế', dvt: 'Lon', gia: 24000, ts: 8 },
  { ma: 'NVL010', ten: 'Đào ngâm', nhom: 'Pha chế', dvt: 'Hộp', gia: 52000, ts: 8 },
  { ma: 'NVL011', ten: 'Bia Sài Gòn lon (thùng 24)', nhom: 'Bia, rượu', dvt: 'Thùng', gia: 355000, ts: 10 },
  { ma: 'NVL012', ten: 'Dầu ăn', nhom: 'Gia vị', dvt: 'Lít', gia: 48000, ts: 8 },
]
/** Hàng dùng riêng cho sơ chế, chế biến (T152): nguyên liệu thô đem sơ chế, phần sau sơ chế, gia vị nấu và bán thành phẩm bếp trung tâm.
 *  Tách khỏi NVL để không đổi số liệu giả của các màn đang sinh từ NVL. tkKho: tài khoản kho khi nhập (bán thành phẩm vẫn để 152 vì dùng tiếp như nguyên liệu) */
export const HANG_SX = [
  { ma: 'NVL013', ten: 'Thịt bò nguyên tảng', nhom: 'Thịt, cá', dvt: 'kg', gia: 255000, tkKho: '152' },
  { ma: 'NVL014', ten: 'Thịt bò gầu', nhom: 'Thịt, cá', dvt: 'kg', gia: 240000, tkKho: '152' },
  { ma: 'NVL015', ten: 'Thịt bò nạm', nhom: 'Thịt, cá', dvt: 'kg', gia: 210000, tkKho: '152' },
  { ma: 'NVL016', ten: 'Tôm sú nguyên con', nhom: 'Thịt, cá', dvt: 'kg', gia: 245000, tkKho: '152' },
  { ma: 'NVL017', ten: 'Tôm sú bóc vỏ', nhom: 'Thịt, cá', dvt: 'kg', gia: 390000, tkKho: '152' },
  { ma: 'NVL018', ten: 'Đầu, vỏ tôm nấu nước dùng', nhom: 'Thịt, cá', dvt: 'kg', gia: 25000, tkKho: '152' },
  { ma: 'NVL019', ten: 'Sườn heo nguyên dẻ', nhom: 'Thịt, cá', dvt: 'kg', gia: 128000, tkKho: '152' },
  { ma: 'NVL020', ten: 'Sụn sườn heo', nhom: 'Thịt, cá', dvt: 'kg', gia: 110000, tkKho: '152' },
  { ma: 'NVL021', ten: 'Gà ta nguyên con', nhom: 'Thịt, cá', dvt: 'kg', gia: 135000, tkKho: '152' },
  { ma: 'NVL022', ten: 'Ức gà', nhom: 'Thịt, cá', dvt: 'kg', gia: 150000, tkKho: '152' },
  { ma: 'NVL023', ten: 'Đùi gà', nhom: 'Thịt, cá', dvt: 'kg', gia: 165000, tkKho: '152' },
  { ma: 'NVL024', ten: 'Xương gà', nhom: 'Thịt, cá', dvt: 'kg', gia: 30000, tkKho: '152' },
  { ma: 'NVL025', ten: 'Bún tươi', nhom: 'Tinh bột', dvt: 'kg', gia: 16000, tkKho: '152' },
  { ma: 'NVL026', ten: 'Sả cây', nhom: 'Rau củ', dvt: 'kg', gia: 22000, tkKho: '152' },
  { ma: 'NVL027', ten: 'Hành tím', nhom: 'Rau củ', dvt: 'kg', gia: 45000, tkKho: '152' },
  { ma: 'NVL028', ten: 'Mắm ruốc Huế', nhom: 'Gia vị', dvt: 'kg', gia: 90000, tkKho: '152' },
  { ma: 'NVL029', ten: 'Nước mắm', nhom: 'Gia vị', dvt: 'Lít', gia: 55000, tkKho: '152' },
  { ma: 'NVL030', ten: 'Đường cát', nhom: 'Gia vị', dvt: 'kg', gia: 24000, tkKho: '152' },
  { ma: 'NVL031', ten: 'Quế, hồi, thảo quả', nhom: 'Gia vị', dvt: 'kg', gia: 260000, tkKho: '152' },
  { ma: 'NVL032', ten: 'Trứng gà', nhom: 'Trứng, sữa', dvt: 'Quả', gia: 3200, tkKho: '152' },
  { ma: 'BTP01', ten: 'Nước dùng phở bò', nhom: 'Bán thành phẩm', dvt: 'Lít', gia: 32000, tkKho: '152' },
  { ma: 'BTP02', ten: 'Nước dùng bún bò', nhom: 'Bán thành phẩm', dvt: 'Lít', gia: 30000, tkKho: '152' },
  { ma: 'BTP03', ten: 'Sườn nướng ướp sẵn', nhom: 'Bán thành phẩm', dvt: 'kg', gia: 165000, tkKho: '152' },
  { ma: 'BUN02', ten: 'Bún bò Huế', nhom: 'Món nước', dvt: 'Tô', gia: 0, tkKho: '' },
]
// Công cụ dụng cụ trong danh mục hàng hoá (loại Công cụ dụng cụ), thẻ chi phí phân bổ loại CCDC chọn mã từ đây
export const CCDC_HANG = [
  { ma: 'CC001', ten: 'Bộ nồi inox 50 lít', nhom: 'Dụng cụ bếp', dvt: 'Bộ' },
  { ma: 'CC002', ten: 'Bàn ghế gỗ khu ngoài trời', nhom: 'Nội thất', dvt: 'Bộ' },
  { ma: 'CC003', ten: 'Máy POS cầm tay', nhom: 'Thiết bị', dvt: 'Cái' },
  { ma: 'CC004', ten: 'Máy xay sinh tố công nghiệp', nhom: 'Thiết bị', dvt: 'Cái' },
  { ma: 'CC005', ten: 'Dao thớt bếp trọn bộ', nhom: 'Dụng cụ bếp', dvt: 'Bộ' },
  { ma: 'CC006', ten: 'Ly thuỷ tinh 300ml', nhom: 'Dụng cụ quầy', dvt: 'Cái' },
  { ma: 'CC007', ten: 'Tủ mát 2 cánh', nhom: 'Thiết bị', dvt: 'Cái' },
  { ma: 'CC008', ten: 'Khay inox chữ nhật', nhom: 'Dụng cụ bếp', dvt: 'Cái' },
]
export const KHACH = [
  { ma: 'KL', ten: 'Khách lẻ POS', mst: '', nhom: 'Khách lẻ' },
  { ma: 'KH001', ten: 'Công ty TNHH Giải pháp Sao Việt', mst: '0319 880 101', nhom: 'Khách công ty' },
  { ma: 'KH002', ten: 'Công ty CP Du lịch Biển Xanh', mst: '0319 880 102', nhom: 'Khách công ty' },
  { ma: 'KH003', ten: 'Văn phòng đại diện Hạ Long Tech', mst: '0319 880 103', nhom: 'Khách công ty' },
  { ma: 'KH004', ten: 'Công ty TNHH Sự kiện Ánh Dương', mst: '0319 880 104', nhom: 'Khách công ty' },
  { ma: 'GRAB', ten: 'GrabFood', mst: '0319 880 105', nhom: 'Sàn giao đồ ăn' },
  { ma: 'SPF', ten: 'ShopeeFood', mst: '0319 880 106', nhom: 'Sàn giao đồ ăn' },
]
export const NCC = [
  { ma: 'NCC001', ten: 'Công ty TNHH Thực phẩm Tươi An Phú', mst: '0319 770 201', nhom: 'Thịt, cá' },
  { ma: 'NCC002', ten: 'Cơ sở bánh phở Bà Tư', mst: '8090 770 202', nhom: 'Tinh bột' },
  { ma: 'NCC003', ten: 'Công ty CP Cà phê Cao Nguyên Xanh', mst: '0319 770 203', nhom: 'Pha chế' },
  { ma: 'NCC004', ten: 'Công ty TNHH Nước giải khát Nam Bộ', mst: '0319 770 204', nhom: 'Bia, rượu' },
  { ma: 'NCC005', ten: 'Hợp tác xã Rau sạch Củ Chi', mst: '0319 770 205', nhom: 'Rau củ' },
  { ma: 'NCC006', ten: 'Công ty TNHH Thiết bị bếp Gia Phát', mst: '0319 770 206', nhom: 'Công cụ, thiết bị' },
  { ma: 'NCC007', ten: 'Công ty Điện lực Sài Gòn', mst: '0319 770 207', nhom: 'Điện nước' },
]
export const NHAN_VIEN = [
  { ma: 'NV001', ten: 'Lê Quốc Bảo', bp: 'Kế toán' }, { ma: 'NV002', ten: 'Trần Thu Hà', bp: 'Kế toán' },
  { ma: 'NV003', ten: 'Võ Thanh Tùng', bp: 'Kho' }, { ma: 'NV004', ten: 'Phạm Ngọc Lan', bp: 'Quản lý cửa hàng' },
  { ma: 'NV005', ten: 'Đặng Văn Hiếu', bp: 'Bếp' }, { ma: 'NV006', ten: 'Hồ Thị Mai', bp: 'Thu ngân' },
]
export const TK_NGAN_HANG = [
  { so: '0071 0012 34567', nh: 'Vietcombank, chi nhánh Sài Gòn' },
  { so: '1903 4455 6677 88', nh: 'Techcombank, chi nhánh Thảo Điền' },
]

export const KHOAN_MUC = [
  { ma: 'CP01', ten: 'Lương nhân viên bếp' },
  { ma: 'CP02', ten: 'Lương phục vụ, thu ngân' },
  { ma: 'CP03', ten: 'Lương văn phòng' },
  { ma: 'CP04', ten: 'Thuê mặt bằng' },
  { ma: 'CP05', ten: 'Điện' },
  { ma: 'CP06', ten: 'Nước' },
  { ma: 'CP07', ten: 'Gas' },
  { ma: 'CP08', ten: 'Hoa hồng app giao đồ ăn' },
  { ma: 'CP09', ten: 'Quảng cáo, khuyến mãi' },
  { ma: 'CP10', ten: 'Sửa chữa, bảo trì' },
  { ma: 'CP11', ten: 'Văn phòng phẩm' },
]

export const CONG_VIEC = [
  { ma: 'CV01', ten: 'Khai trương cửa hàng Thảo Điền' },
  { ma: 'CV02', ten: 'Sự kiện Trung thu 2026' },
  { ma: 'CV03', ten: 'Cải tạo bếp Lê Lợi' },
  { ma: 'CV04', ten: 'Tiệc cuối năm khách công ty' },
]

// Danh mục lý do nghiệp vụ 1.16. Form phiếu thu, chi lấy lý do theo cột "Dùng cho".
// Lý do nghiệp vụ thu, chi theo danh sách FABi PhuongXT gửi 15/10/2026 (T269): tên, thu hay chi như FABi; mã đánh lại THU01.., CHI01.. theo thứ tự,
// lý do kho XK01.., NK01... Giữ thêm Chi phí chờ phân bổ (phiếu chi sinh thẻ chi phí phân bổ) và 3 lý do kho.
// Lý do chi tính là chi phí (Sổ chi phí, Chi phí trong tháng) theo đề xuất PhuongXT duyệt; trả nợ, nhà cung cấp, tạm ứng, vay, nộp thuế, TSCĐ, đầu tư không tính
const LY_LA_CHI_PHI = ['CHI01', 'CHI03', 'CHI04', 'CHI06', 'CHI07', 'CHI08', 'CHI09', 'CHI12', 'CHI13', 'CHI14', 'CHI15', 'CHI18', 'CHI19', 'CHI20', 'CHI21', 'CHI22', 'CHI24', 'CHI25', 'CHI26', 'CHI27', 'CHI29', 'CHI30', 'CHI31', 'CHI35']
/** Mã lý do Chi phí chờ phân bổ: phiếu chi lý do này sinh thẻ chi phí phân bổ; sơ đồ Chi phí phân bổ mở phiếu chi với ?ly=mã này */
export const MA_LY_CHO_PHAN_BO = 'CHI35'
export const LY_DO = [
  ['THU01', 'Khách hàng đặt cọc', 'Thu tiền'],
  ['THU02', 'Thu Nợ', 'Thu tiền'],
  ['THU03', 'Thu khác', 'Thu tiền'],
  ['THU04', 'Thu tiền bán hàng', 'Thu tiền'],
  ['THU05', 'Thu tiền bán phế liệu', 'Thu tiền'],
  ['THU06', 'Thu tiền hoàn ứng của nhân viên', 'Thu tiền'],
  ['THU07', 'Thu tiền nạp ví Heo Vàng', 'Thu tiền'],
  ['THU08', 'Thu tiền phạt nhân viên', 'Thu tiền'],
  ['THU09', 'Thu tiền từ thanh lý tài sản cố định', 'Thu tiền'],
  ['THU10', 'Đi vay', 'Thu tiền'],
  ['CHI01', 'Chi mua đồ thắp hương', 'Chi tiền'],
  ['CHI02', 'Thanh Toán Công Nợ Nhà Cung Cấp', 'Chi tiền'],
  ['CHI03', 'Chi phí công cụ dụng cụ', 'Chi tiền'],
  ['CHI04', 'Chi phí đồng phục nhân viên', 'Chi tiền'],
  ['CHI05', 'Chi phí đầu tư mở rộng', 'Chi tiền'],
  ['CHI06', 'Chi phí giặt là', 'Chi tiền'],
  ['CHI07', 'Chi phí in ấn tài liệu', 'Chi tiền'],
  ['CHI08', 'Chi phí khác', 'Chi tiền'],
  ['CHI09', 'Chi phí vận chuyển', 'Chi tiền'],
  ['CHI10', 'Chuyển tiền cho nhà hàng', 'Chi tiền'],
  ['CHI11', 'Chi tiền nộp thuế', 'Chi tiền'],
  ['CHI12', 'Công tác phí', 'Chi tiền'],
  ['CHI13', 'Chi tiền quảng cáo, marketing', 'Chi tiền'],
  ['CHI14', 'Chi tiền thuê nhà', 'Chi tiền'],
  ['CHI15', 'Phí ngân hàng', 'Chi tiền'],
  ['CHI16', 'Trả nợ', 'Chi tiền'],
  ['CHI17', 'Chi phí tài sản cố định', 'Chi tiền'],
  ['CHI18', 'Chi phí nguyên liệu phụ', 'Chi tiền'],
  ['CHI19', 'Chi phí sửa chữa', 'Chi tiền'],
  ['CHI20', 'Chi phí tư vấn, setup', 'Chi tiền'],
  ['CHI21', 'Trả lãi vay', 'Chi tiền'],
  ['CHI22', 'Thanh toán tiền bảo hiểm', 'Chi tiền'],
  ['CHI23', 'Thanh toán tiền cho nhà cung cấp', 'Chi tiền'],
  ['CHI24', 'Thanh toán tiền điện', 'Chi tiền'],
  ['CHI25', 'Thanh toán tiền điện thoại', 'Chi tiền'],
  ['CHI26', 'Thanh toán tiền internet', 'Chi tiền'],
  ['CHI27', 'Thanh toán tiền lương', 'Chi tiền'],
  ['CHI28', 'Chi tiền khác (Không đưa vào chi phí)', 'Chi tiền'],
  ['CHI29', 'Chi tiền tiếp khách', 'Chi tiền'],
  ['CHI30', 'Phí an ninh', 'Chi tiền'],
  ['CHI31', 'Thanh toán tiền nước', 'Chi tiền'],
  ['CHI32', 'Thanh toán tiền vay', 'Chi tiền'],
  ['CHI33', 'Tạm ứng cho nhân viên', 'Chi tiền'],
  ['CHI34', 'Cho vay', 'Chi tiền'],
  ['CHI35', 'Chi phí chờ phân bổ', 'Chi tiền'],
  ['XK01', 'Xuất huỷ hàng hỏng', 'Xuất kho'],
  ['XK02', 'Xuất dùng nội bộ', 'Xuất kho'],
  ['NK01', 'Nhập hàng khách trả lại', 'Nhập kho'],
].map(([ma, ten, dung]) => ({ ma, ten, dung, chiPhi: LY_LA_CHI_PHI.includes(ma) }))
/** Tên lý do chi tiền được tích là chi phí: báo cáo chi phí (Sổ chi phí, Chi phí trong tháng) chỉ lấy các lý do này (T231) */
export const LY_CHI_PHI = LY_DO.filter(x => x.dung === 'Chi tiền' && x.chiPhi).map(x => x.ten)

// ── Doanh thu từng ngày, từng cửa hàng (đồng bộ từ FABi, gom theo ngày) ──
export interface Ngay {
  date: Date; cn: string; dt: number; vat: number; don: number; gv: number
  tm: number; the: number; ck: number; app: number
}
function genDaily(): Ngay[] {
  const out: Ngay[] = []
  const r = rng(2026)
  for (let d = new Date(2026, 6, 1); d <= HOM_NAY; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const wk = d.getDay() === 0 || d.getDay() === 6 ? 1.24 : d.getDay() === 5 ? 1.1 : 1
    for (const c of CUA_HANG) {
      const today = +d === +HOM_NAY ? 0.62 : 1                       // hôm nay mới bán tới trưa chiều
      const dt = k(c.base * wk * between(r, 0.88, 1.12) * today)
      const vat = Math.round(dt * 0.88 * 0.08 + dt * 0.12 * 0.1)    // đồ ăn uống 8%, bia rượu 10%
      const tong = dt + vat
      const tm = k(tong * between(r, 0.3, 0.38)), the = k(tong * between(r, 0.17, 0.22)), app = k(tong * between(r, 0.08, 0.12))
      out.push({ date: d, cn: c.id, dt, vat, don: Math.round(dt / between(r, 150000, 175000)), gv: k(dt * between(r, 0.33, 0.365)),
        tm, the, app, ck: tong - tm - the - app })
    }
  }
  return out
}
export const DAILY = genDaily()

export const trongThang = (d: Date, thang: number, nam: number) => d.getMonth() + 1 === thang && d.getFullYear() === nam
export function daysOf(thang: number, nam: number, cn?: string) {
  return DAILY.filter(x => trongThang(x.date, thang, nam) && (!cn || cn === 'all' || x.cn === cn))
}
export function tongKy(thang: number, nam: number, cn?: string) {
  const ds = daysOf(thang, nam, cn)
  const s = (f: (x: Ngay) => number) => ds.reduce((a, x) => a + f(x), 0)
  return { dt: s(x => x.dt), vat: s(x => x.vat), don: s(x => x.don), gv: s(x => x.gv), tm: s(x => x.tm), ck: s(x => x.ck), the: s(x => x.the), app: s(x => x.app), ngay: ds.length }
}

/** Chi phí quản lý kinh doanh một tháng (lương, mặt bằng, điện nước, khác) theo số ngày đã chạy */
export function chiPhiThang(thang: number, nam: number) {
  const dim = new Date(nam, thang, 0).getDate()
  const f = Math.min(1, daysOf(thang, nam).length / 3 / dim)
  return {
    luong: k(742_000_000 * f), matBang: k(368_000_000 * f), dienNuoc: k(108_400_000 * f),
    khauHao: k(31_250_000 * f), ccdc: k(18_600_000 * f), khac: k(96_300_000 * f),
  }
}

/** Báo cáo kết quả kinh doanh một kỳ — dùng chung cho Tổng quan và B02 */
export function kqkd(thang: number, nam: number) {
  const t = tongKy(thang, nam)
  const cp = chiPhiThang(thang, nam)
  const giamTru = k(t.dt * 0.0035)
  const dtThuan = t.dt - giamTru
  const lnGop = dtThuan - t.gv
  const dtTc = k(1_850_000 * (t.ngay / 3 / 30))
  const cpTc = k(9_400_000 * (t.ngay / 3 / 30))
  // Làm tròn từng khoản trước rồi cộng trừ đúng số nguyên, để sổ cái và bảng cân đối khớp tới từng đồng
  const cpBh = k(cp.luong * 0.62 + cp.matBang * 0.8 + cp.dienNuoc * 0.85 + cp.ccdc)
  const cpQl = k(cp.luong * 0.38 + cp.matBang * 0.2 + cp.dienNuoc * 0.15 + cp.khauHao + cp.khac)
  const cpQlkd = cpBh + cpQl
  const lnThuan = lnGop + dtTc - cpTc - cpQlkd
  const tnKhac = k(2_400_000 * (t.ngay / 3 / 30)), cpKhac = k(650_000 * (t.ngay / 3 / 30))
  const lnTruocThue = lnThuan + tnKhac - cpKhac
  const thue = k(Math.max(0, lnTruocThue) * 0.2)
  return { dt: t.dt, giamTru, dtThuan, gv: t.gv, lnGop, dtTc, cpTc, laiVay: cpTc, cpBh, cpQl, cpQlkd,
    lnThuan, tnKhac, cpKhac, lnKhac: tnKhac - cpKhac, lnTruocThue, thue, lnSauThue: lnTruocThue - thue, cp, t }
}

/** Chi phí trong tháng gói Free theo lý do chi (T318): cộng lại đúng chi phí hoạt động trừ phân bổ của kqkd().
 *  Điện nước chia tiền điện, tiền nước; chi khác chia theo tỷ lệ mẫu; Chi phí khác nhận phần còn lại (gas, chi lẻ, trừ thu lãi tiền gửi) */
export function chiPhiTheoLyDo(thang: number, nam: number): [string, number][] {
  const q = kqkd(thang, nam), cp = q.cp
  const tong = q.cpQlkd + q.cpTc - q.dtTc - cp.ccdc - cp.khauHao
  const khac = (ty: number) => k(cp.khac * ty)
  const ds: [string, number][] = [
    ['Thanh toán tiền lương', cp.luong], ['Chi tiền thuê nhà', cp.matBang],
    ['Thanh toán tiền điện', k(cp.dienNuoc * 0.55)], ['Thanh toán tiền nước', k(cp.dienNuoc * 0.15)],
    ['Chi tiền quảng cáo, marketing', khac(0.28)], ['Chi phí sửa chữa', khac(0.14)], ['Chi phí vận chuyển', khac(0.09)], ['Chi phí giặt là', khac(0.07)],
    ['Thanh toán tiền internet', khac(0.05)], ['Chi tiền tiếp khách', khac(0.05)], ['Thanh toán tiền điện thoại', khac(0.04)], ['Phí an ninh', khac(0.04)],
    ['Chi phí đồng phục nhân viên', khac(0.03)], ['Phí ngân hàng', khac(0.02)], ['Chi mua đồ thắp hương', khac(0.01)], ['Trả lãi vay', q.cpTc],
  ]
  return [...ds, ['Chi phí khác', tong - ds.reduce((a, x) => a + x[1], 0)]]
}

/** Chi phí phân bổ hàng tháng gói Free theo loại thẻ (T318): cộng lại đúng phân bổ CCDC cộng khấu hao của chiPhiThang() */
export function phanBoTheoLoai(thang: number, nam: number): [string, number][] {
  const cp = chiPhiThang(thang, nam)
  const traTruoc = k(cp.ccdc * 0.6)
  return [['Chi phí trả trước', traTruoc], ['Công cụ dụng cụ', cp.ccdc - traTruoc], ['Tài sản cố định', cp.khauHao]]
}

/** Số chứng từ Xuất bán POS lấy số hoá đơn FABi (T104): 12 ký tự chữ, số viết hoa, cố định theo cửa hàng và ngày, vd K7QX2PM9WZ4D */
export const soBH = (x: Ngay) => {
  const r = rng(`fabi-${x.cn}-${x.date.getFullYear()}-${x.date.getMonth()}-${x.date.getDate()}`)
  const kt = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 12 }, () => kt[Math.floor(r() * kt.length)]).join('')
}
export const cnTen = (id: string) => CUA_HANG.find(c => c.id === id)?.ten ?? id

// ── Dòng lệch đối soát (Bàn làm việc, màn Đối soát) ──
export interface Lech { id: string; cap: string; ngay: string; cn: string; nguon: string; nguonV: number; soV: number; nghi: string; ct: string; tt: 'moi' | 'xem' | 'xong' }
export const LECH: Lech[] = [
  { id: 'L1', cap: 'FABi ↔ Sổ', ngay: '05/10/2026', cn: 'q5', nguon: 'Doanh thu FABi', nguonV: 27_640_000, soV: 26_390_000, nghi: '2 đơn huỷ sau khi chốt ca, FABi chưa gửi lại', ct: 'BH2610-Q5-05', tt: 'moi' },
  { id: 'L2', cap: 'Sổ ↔ Hoá đơn', ngay: '03/10/2026', cn: 'q1', nguon: 'Hoá đơn từ máy tính tiền', nguonV: 35_975_000, soV: 36_060_000, nghi: 'Hoá đơn điều chỉnh giảm 85.000 đ chưa về', ct: 'BH2610-Q1-03', tt: 'moi' },
  { id: 'L3', cap: 'Sổ ↔ Tiền', ngay: '06/10/2026', cn: 'td', nguon: 'Sao kê ngân hàng', nguonV: 9_120_000, soV: 11_460_000, nghi: 'Tiền QR ngày 06/10 về tài khoản chậm 1 ngày', ct: 'BC2610-0041', tt: 'xem' },
  { id: 'L4', cap: 'FABi ↔ Sổ', ngay: '29/09/2026', cn: 'q1', nguon: 'Doanh thu FABi', nguonV: 41_205_000, soV: 41_205_000, nghi: 'Đã khớp sau khi tải lại ca 2', ct: 'BH2609-Q1-29', tt: 'xong' },
]

// ── Nhật ký đồng bộ ──
export const DONG_BO = [
  { luc: '07/10 14:20', nguon: 'FABi', loai: 'Đơn bán hàng', pham: '3 cửa hàng · 07/10', lay: 612, vao: 612, loi: 0, ai: 'Lịch mỗi 15 phút' },
  { luc: '07/10 14:05', nguon: 'FABi', loai: 'Đơn bán hàng', pham: '3 cửa hàng · 07/10', lay: 188, vao: 186, loi: 2, ai: 'Lịch mỗi 15 phút' },
  { luc: '07/10 13:00', nguon: 'iPOS Inventory', loai: 'Phiếu nhập, xuất kho', pham: '5 kho · 07/10', lay: 46, vao: 46, loi: 0, ai: 'Lịch mỗi giờ' },
  { luc: '07/10 09:12', nguon: 'iPOS Invoice', loai: 'Hoá đơn đầu vào', pham: 'MST 0319 990 001', lay: 23, vao: 18, loi: 5, ai: 'Lê Quốc Bảo bấm tải' },
  { luc: '07/10 06:00', nguon: 'FABi', loai: 'Danh mục món, nhóm món', pham: 'Toàn bộ', lay: 4, vao: 4, loi: 0, ai: 'Lịch hằng ngày' },
  { luc: '06/10 23:30', nguon: 'FABi', loai: 'Chốt ca, thanh toán', pham: '3 cửa hàng · 06/10', lay: 9, vao: 9, loi: 0, ai: 'Lịch cuối ngày' },
]

export const tenThang = (thang: number, nam: number) => `Tháng ${thang}/${nam}`
