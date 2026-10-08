// Dữ liệu giả dùng chung. Mọi màn đọc doanh thu từ DAILY để số khớp nhau giữa
// Tổng quan, chứng từ bán hàng, sổ, báo cáo kết quả kinh doanh.
import type { Goi } from '../app/plan'
import { k, rng, between, pad } from '../ui/format'

export const HOM_NAY = new Date(2026, 9, 7)          // 07/10/2026
export const KY_MO = { thang: 10, nam: 2026 }        // kỳ đang mở
export const KY_KHOA_SO = { thang: 9, nam: 2026 }    // kỳ đang làm khoá sổ

export interface DonVi { id: string; ten: string; viettat: string; mst: string; goi: Goi; diaChi: string; diem: number; nguoiDaiDien: string }
export const DON_VI: DonVi[] = [
  { id: 'pm', ten: 'Công ty TNHH Ẩm thực Phố Mây', viettat: 'PM', mst: '0319 990 001', goi: 'M', diaChi: '86 Lê Lợi, phường Sài Gòn, TP.HCM', diem: 3, nguoiDaiDien: 'Nguyễn Minh Anh' },
  { id: 'tl', ten: 'Công ty CP Chuỗi Trà Lá', viettat: 'TL', mst: '0319 990 002', goi: 'A', diaChi: '12 Nguyễn Văn Linh, phường Tân Hưng, TP.HCM', diem: 14, nguoiDaiDien: 'Nguyễn Minh Anh' },
  { id: 'gn', ten: 'Hộ kinh doanh Cà phê Góc Nhỏ', viettat: 'GN', mst: '8090 112 233', goi: 'F', diaChi: '5 Hẻm 42 Trần Quang Khải, phường Tân Định, TP.HCM', diem: 1, nguoiDaiDien: 'Nguyễn Minh Anh' },
]

export interface ChiNhanh { id: string; ten: string; ngan: string; base: number; kho: string[] }
export const CHI_NHANH: ChiNhanh[] = [
  { id: 'q1', ten: 'Phố Mây Lê Lợi', ngan: 'Lê Lợi', base: 33_500_000, kho: ['Kho bếp Lê Lợi', 'Kho bar Lê Lợi'] },
  { id: 'q5', ten: 'Phố Mây Nguyễn Trãi', ngan: 'Nguyễn Trãi', base: 24_800_000, kho: ['Kho bếp Nguyễn Trãi'] },
  { id: 'td', ten: 'Phố Mây Thảo Điền', ngan: 'Thảo Điền', base: 28_600_000, kho: ['Kho bếp Thảo Điền', 'Kho bar Thảo Điền'] },
]
export const KHO = ['Kho tổng', ...CHI_NHANH.flatMap(c => c.kho)]

export type Role = 'owner' | 'ktt' | 'ktv'
export const ROLE: Record<Role, string> = { owner: 'Chủ doanh nghiệp', ktt: 'Kế toán trưởng', ktv: 'Kế toán viên' }
export const NGUOI_DUNG = [
  { ten: 'Nguyễn Minh Anh', email: 'minhanh@phomay.vn', role: 'owner' as Role, vaiTro: 'Chủ doanh nghiệp', pham: 'Tất cả chi nhánh', lan: 'Hôm nay 08:12', tt: 'ok' },
  { ten: 'Trần Thu Hà', email: 'thuha@phomay.vn', role: 'ktt' as Role, vaiTro: 'Kế toán trưởng', pham: 'Tất cả chi nhánh', lan: 'Hôm nay 09:40', tt: 'ok' },
  { ten: 'Lê Quốc Bảo', email: 'quocbao@phomay.vn', role: 'ktv' as Role, vaiTro: 'Kế toán viên', pham: 'Tất cả chi nhánh', lan: 'Hôm nay 10:05', tt: 'ok' },
  { ten: 'Phạm Ngọc Lan', email: 'ngoclan@phomay.vn', role: 'ktv' as Role, vaiTro: 'Quản lý chi nhánh', pham: 'Phố Mây Thảo Điền', lan: 'Hôm qua 21:30', tt: 'ok' },
  { ten: 'Võ Thanh Tùng', email: 'thanhtung@phomay.vn', role: 'ktv' as Role, vaiTro: 'Thủ kho', pham: 'Kho tổng, Kho bếp Lê Lợi', lan: 'Chưa đăng nhập', tt: 'warn' },
]

export const HANG = [
  { ma: 'PHO01', ten: 'Phở bò tái', nhom: 'Món nước', dvt: 'Tô', gia: 65000, ts: 8 },
  { ma: 'PHO02', ten: 'Phở bò đặc biệt', nhom: 'Món nước', dvt: 'Tô', gia: 85000, ts: 8 },
  { ma: 'BUN01', ten: 'Bún chả Hà Nội', nhom: 'Món nước', dvt: 'Phần', gia: 60000, ts: 8 },
  { ma: 'COM01', ten: 'Cơm tấm sườn bì chả', nhom: 'Món cơm', dvt: 'Dĩa', gia: 55000, ts: 8 },
  { ma: 'GOI01', ten: 'Gỏi cuốn tôm thịt', nhom: 'Khai vị', dvt: 'Phần', gia: 45000, ts: 8 },
  { ma: 'CF01', ten: 'Cà phê sữa đá', nhom: 'Đồ uống', dvt: 'Ly', gia: 29000, ts: 8 },
  { ma: 'TRA01', ten: 'Trà đào cam sả', nhom: 'Đồ uống', dvt: 'Ly', gia: 39000, ts: 8 },
  { ma: 'BIA01', ten: 'Bia Sài Gòn lon', nhom: 'Bia, rượu', dvt: 'Lon', gia: 22000, ts: 10 },
  { ma: 'NS01', ten: 'Nước suối', nhom: 'Đồ uống', dvt: 'Chai', gia: 12000, ts: 8 },
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
  { ma: 'CV01', ten: 'Khai trương chi nhánh Thảo Điền' },
  { ma: 'CV02', ten: 'Sự kiện Trung thu 2026' },
  { ma: 'CV03', ten: 'Cải tạo bếp Lê Lợi' },
  { ma: 'CV04', ten: 'Tiệc cuối năm khách công ty' },
]

// Danh mục lý do nghiệp vụ 1.16. Form phiếu thu, chi lấy lý do theo cột "Dùng cho".
export const LY_DO = [
  ['LD01', 'Thu tiền bán hàng', 'Phiếu thu'], ['LD02', 'Thu nợ khách hàng', 'Phiếu thu'], ['LD03', 'Rút tiền ngân hàng nhập quỹ', 'Phiếu thu'],
  ['LD04', 'Chi mua nguyên vật liệu', 'Phiếu chi'], ['LD05', 'Chi trả lương', 'Phiếu chi'], ['LD06', 'Chi tạm ứng', 'Phiếu chi'],
  ['LD07', 'Xuất huỷ hàng hỏng', 'Phiếu xuất kho'], ['LD08', 'Xuất dùng nội bộ', 'Phiếu xuất kho'], ['LD09', 'Nhập hàng khách trả lại', 'Phiếu nhập kho'],
  ['LD10', 'Thu hoàn ứng', 'Phiếu thu'], ['LD11', 'Thu khác', 'Phiếu thu'], ['LD12', 'Trả tiền nhà cung cấp', 'Phiếu chi'],
  ['LD13', 'Chi phí khác', 'Phiếu chi'],
].map(([ma, ten, dung]) => ({ ma, ten, dung }))

// ── Doanh thu từng ngày, từng chi nhánh (đồng bộ từ FABi, gom theo ngày) ──
export interface Ngay {
  date: Date; cn: string; dt: number; vat: number; don: number; gv: number
  tm: number; the: number; ck: number; app: number
}
function genDaily(): Ngay[] {
  const out: Ngay[] = []
  const r = rng(2026)
  for (let d = new Date(2026, 6, 1); d <= HOM_NAY; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const wk = d.getDay() === 0 || d.getDay() === 6 ? 1.24 : d.getDay() === 5 ? 1.1 : 1
    for (const c of CHI_NHANH) {
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

/** Số chứng từ bán hàng gom theo ngày: BH2609-Q1-30 */
export const soBH = (x: Ngay) => `BH${String(x.date.getFullYear()).slice(2)}${pad(x.date.getMonth() + 1)}-${x.cn.toUpperCase()}-${pad(x.date.getDate())}`
export const cnTen = (id: string) => CHI_NHANH.find(c => c.id === id)?.ten ?? id

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
  { luc: '07/10 14:20', nguon: 'FABi', loai: 'Đơn bán hàng', pham: '3 chi nhánh · 07/10', lay: 612, vao: 612, loi: 0, ai: 'Lịch mỗi 15 phút' },
  { luc: '07/10 14:05', nguon: 'FABi', loai: 'Đơn bán hàng', pham: '3 chi nhánh · 07/10', lay: 188, vao: 186, loi: 2, ai: 'Lịch mỗi 15 phút' },
  { luc: '07/10 13:00', nguon: 'iPOS Inventory', loai: 'Phiếu nhập, xuất kho', pham: '5 kho · 07/10', lay: 46, vao: 46, loi: 0, ai: 'Lịch mỗi giờ' },
  { luc: '07/10 09:12', nguon: 'iPOS Invoice', loai: 'Hoá đơn đầu vào', pham: 'MST 0319 990 001', lay: 23, vao: 18, loi: 5, ai: 'Lê Quốc Bảo bấm tải' },
  { luc: '07/10 06:00', nguon: 'FABi', loai: 'Danh mục món, nhóm món', pham: 'Toàn bộ', lay: 4, vao: 4, loi: 0, ai: 'Lịch hằng ngày' },
  { luc: '06/10 23:30', nguon: 'FABi', loai: 'Chốt ca, thanh toán', pham: '3 chi nhánh · 06/10', lay: 9, vao: 9, loi: 0, ai: 'Lịch cuối ngày' },
]

export const tenThang = (thang: number, nam: number) => `Tháng ${thang}/${nam}`
