// Phân hệ Kế toán bán hàng
import type { ModuleDef, ReportCfg, ScreenDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { ChungTuBanHang, NGOAI_POS } from './ChungTuBanHang'
import { phieuGocCoTt } from '../tien/tt-mau'
import { DoiSoat } from '../tien-ich/DoiSoat'
import { baoCaoBanHang, baoCaoDoanhThu } from './data'
import { SO_BO_SUNG } from '../bao-cao/so-bo-sung'
import { banHangTheoNgay, chiTietBanHang, tongHopBanHang } from './bao-cao'
import { colsCongNo, rowsCongNo } from '../bao-cao/cong-no'

/** Báo cáo bán hàng ngoài Excel (T157): lấy dòng món của chứng từ Xuất bán POS, cửa hàng theo thanh trên; mọi gói, mọi thông tư (T185).
 *  Mã trên đường dẫn 3-2-6, 3-2-7, 3-2-8 là khoá cấu hình mẫu trong bao-cao/danh-sach.ts */
// Gói Free tạm ẩn các báo cáo bán hàng (T216), PhuongXT mở lại 19/10/2026 (T452); gói Free chỉ có Tổng hợp bán hàng, Bảng kê chi tiết bán hàng (T458)
const baoCaoMoi = (slug: string, ten: string, report: Omit<ReportCfg, 'kieu'>, goi?: ScreenDef['goi']): ScreenDef =>
  ({ slug, ten, nhom: 'Sổ sách, báo cáo', kind: 'report', ...(goi ? { goi } : {}), report: { kieu: 'bangke', theoCn: true, theoGtgt: true, ...report } })
const BAO_CAO_MOI = [baoCaoMoi('3-2-6', 'Bán hàng theo ngày', banHangTheoNgay, ['S', 'PL', 'PR']), baoCaoMoi('3-2-7', 'Tổng hợp bán hàng', tongHopBanHang), baoCaoMoi('3-2-8', 'Bảng kê chi tiết bán hàng', chiTietBanHang),
  // theo mẫu iFaster, bấm tên mở lịch sử công nợ (T185); gói Free ẩn, PhuongXT chốt 20/10/2026 (T491)
  baoCaoMoi('3-2-9', 'Công nợ khách hàng', { cols: colsCongNo('kh'), rows: (t, cn) => rowsCongNo('kh', t, cn) }, ['S', 'PL', 'PR'])]

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '3.1.1': 'Xuất bán POS', '3.1.7': 'Bán hàng', '3.1.2': 'Hoá đơn bán hàng', '3.1.3': 'Bán nội bộ', '3.1.4': 'Hàng bán trả lại', '3.1.5': 'Hoá đơn điện tử', '3.1.6': 'Điều chỉnh, thay thế' }

const banHang: ModuleDef = {
  key: 'ban-hang', ten: 'Kế toán bán hàng', ngan: 'Bán hàng', icon: 'cart', mod: 2,
  mota: 'Doanh thu tự về từ FABi, hoá đơn điện tử, hàng bán trả lại',
  quyTrinh,
  screens: [...tuExcel(2, {
    // Xuất bán POS: chứng từ chỉ đổ về từ phần mềm bán hàng, không lập tay (T52)
    '3.1.1': { kind: 'custom', comp: ChungTuBanHang, ten: 'Xuất bán POS' },
    // Bán hàng lập tay ngoài POS: tiệc, khách công ty; từ gói Plus (T52)
    '3.1.7': { voucher: { ...NGOAI_POS, rowsMau: () => phieuGocCoTt('3.1.7') } },   // phiếu mẫu đã thu có phiếu thu tham chiếu (T586)
    '3.1.2': { voucher: { prefix: 'HDB', doiTuong: 'kh', nhan: 'Khách hàng', them: 'Thêm hoá đơn bán hàng', dong: 'hang', tien: [0, 0], nguon: 'HĐ', soTT58: 'Sổ doanh thu bán hàng hoá, dịch vụ',
      dienGiai: ['Bán tiệc cho khách công ty', 'Bán suất ăn hội nghị', 'Bán set quà Trung thu'], noCo: [['131', '5111', 'Doanh thu'], ['131', '33311', 'Thuế GTGT đầu ra'], ['632', '152', 'Giá vốn']] } },
    '3.1.3': { voucher: { prefix: 'BNB', doiTuong: 'cn', nhan: 'Cửa hàng nhận', them: 'Thêm phiếu bán nội bộ', dong: 'nvl', tien: [0, 0], thue: 0,
      dienGiai: ['Bán nước dùng phở cho cửa hàng Nguyễn Trãi', 'Bán bán thành phẩm cho cửa hàng Thảo Điền'], noCo: [['136', '5111', 'Doanh thu nội bộ'], ['632', '152', 'Giá vốn']] } },
    '3.1.4': { voucher: { prefix: 'TL', doiTuong: 'kh', nhan: 'Khách hàng', them: 'Thêm phiếu trả lại', dong: 'hang', tien: [0, 0], nguon: 'FABi', soTT58: 'Sổ doanh thu bán hàng hoá, dịch vụ',
      dienGiai: ['Khách trả lại món làm sai', 'Huỷ đơn sau khi chốt ca'], noCo: [['5111', '1111', 'Giảm doanh thu hàng bán trả lại'], ['33311', '1111', 'Giảm thuế GTGT đầu ra']] } },
    '3.1.5': { voucher: { prefix: 'C26T', doiTuong: 'kh', nhan: 'Người mua', them: 'Lập hoá đơn', dong: 'hang', tien: [0, 0], nguon: 'HĐ',
      dienGiai: ['Hoá đơn tổng hợp khách lẻ ngày', 'Hoá đơn khách công ty lấy hoá đơn', 'Hoá đơn tiệc hội nghị'], noCo: [['131', '5111', 'Doanh thu'], ['131', '33311', 'Thuế GTGT đầu ra']] } },
    '3.1.6': { voucher: { prefix: 'DCHD', doiTuong: 'kh', nhan: 'Người mua', them: 'Lập hoá đơn điều chỉnh', dong: 'hang', tien: [0, 0], nguon: 'HĐ',
      dienGiai: ['Điều chỉnh giảm đơn giá', 'Thay thế hoá đơn sai mã số thuế người mua'], noCo: [['5111', '131', 'Điều chỉnh giảm doanh thu'], ['33311', '131', 'Điều chỉnh giảm thuế']] } },
    '3.2.1': { report: { kieu: 'bangke', ...baoCaoBanHang } },
    '3.2.2': { kind: 'custom', comp: DoiSoat },
    '3.2.3': { report: { kieu: 'bangke', theoGtgt: true, ...baoCaoDoanhThu } },
    '3.2.4': { report: { kieu: 'bangke' } },
    '3.2.5': { report: SO_BO_SUNG['3.2.5'] },
  }, NGAN), ...BAO_CAO_MOI],
}
export default banHang
