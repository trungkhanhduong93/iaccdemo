// Phân hệ Kế toán tổng hợp: chứng từ tổng hợp, cuối kỳ, báo cáo tài chính, báo cáo quản trị
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { BaoCaoQuanTri, CanDoiKeToan, CanDoiPhatSinh, KetQuaKinhDoanh, LuuChuyenTien } from './BaoCaoTaiChinh'
import { KhoaSo, KiemTraCuoiKy } from './CuoiKy'
import { SoDuBanDau } from './SoDuBanDau'
import { SO_BO_SUNG } from '../bao-cao/so-bo-sung'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '10.1.1': 'Chứng từ tổng hợp', '10.1.2': 'Doanh thu trả trước', '10.1.3': 'Số dư ban đầu', '10.1.4': 'Kiểm tra cuối kỳ', '10.1.5': 'Kết chuyển', '10.1.6': 'Khoá sổ', '10.1.7': 'Kế hoạch tài chính', '10.1.8': 'Kế hoạch sản xuất', '10.1.9': 'Kết chuyển số dư' }

const tongHop: ModuleDef = {
  key: 'tong-hop', ten: 'Kế toán tổng hợp', ngan: 'Tổng hợp', icon: 'book', mod: 9,
  mota: 'Bút toán tổng hợp, cuối kỳ, báo cáo tài chính',
  quyTrinh,
  screens: tuExcel(9, {
    '10.1.1': { voucher: { prefix: 'NVK', doiTuong: 'none', them: 'Thêm chứng từ tổng hợp', dong: 'tien', tien: [3_000_000, 320_000_000],
      dienGiai: ['Phân bổ tiền thuê mặt bằng tháng 9', 'Trích khấu hao TSCĐ tháng 9', 'Kết chuyển thuế GTGT được khấu trừ', 'Hạch toán lương tháng 9'], noCo: [['6421', '242', 'Phân bổ chi phí trả trước']] } },
    '10.1.2': { tool: { nut: 'Phân bổ kỳ 9/2026', mota: 'Phân bổ doanh thu nhận trước (thẻ thành viên nạp tiền, voucher bán trước, tiền đặt tiệc) vào doanh thu theo kỳ sử dụng.',
      caiDat: [['Kỳ', 'Tháng 9/2026'], ['Tài khoản doanh thu chưa thực hiện', '3387']] } },
    '10.1.3': { kind: 'custom', comp: SoDuBanDau },
    '10.1.4': { kind: 'custom', comp: KiemTraCuoiKy },
    '10.1.5': { tool: { nut: 'Kết chuyển kỳ 9/2026', mota: 'Kết chuyển doanh thu, giá vốn, chi phí sang tài khoản 911 và kết chuyển lãi lỗ sang 421. Chạy lại được trước khi khoá sổ.',
      caiDat: [['Kỳ', 'Tháng 9/2026'], ['Bộ kết chuyển', 'Mặc định theo chế độ kế toán']] } },
    '10.1.6': { kind: 'custom', comp: KhoaSo },
    '10.1.7': { tool: { nut: 'Lập kế hoạch 2027', mota: 'Lập kế hoạch doanh thu, chi phí, dòng tiền theo tháng và theo chi nhánh. So sánh thực hiện với kế hoạch trên Tổng quan.', caiDat: [['Năm kế hoạch', '2027'], ['Lấy số gốc từ', 'Thực hiện năm 2026']] } },
    '10.1.8': { tool: { nut: 'Lập kế hoạch sản xuất', mota: 'Dự trù số lượng bán thành phẩm cần chế biến theo dự báo bán hàng: nước dùng, sốt, bánh. Từ đó ra nhu cầu nguyên vật liệu.', caiDat: [['Tuần', '12–18/10/2026'], ['Dự báo theo', 'Bình quân 4 tuần gần nhất']] } },
    '10.1.9': { tool: { nut: 'Kết chuyển số dư sang năm 2027', mota: 'Chuyển số dư cuối năm tài chính sang đầu năm mới, kể cả khi đổi chế độ kế toán hoặc tách dữ liệu đơn vị.', caiDat: [['Từ năm', '2026'], ['Sang năm', '2027']] } },
    '10.2.1': { kind: 'custom', comp: CanDoiPhatSinh },
    '10.2.2': { kind: 'custom', comp: CanDoiKeToan, ten: 'Báo cáo tình hình tài chính' },
    '10.2.3': { kind: 'custom', comp: KetQuaKinhDoanh },
    '10.2.4': { kind: 'custom', comp: LuuChuyenTien },
    '10.2.5': { report: { kieu: 'bangke', cols: [{ k: 'muc', t: 'Mục', w: 60 }, { k: 'nd', t: 'Nội dung' }, { k: 'tt', t: 'Trạng thái', w: 140 }],
      rows: () => [['I', 'Đặc điểm hoạt động của doanh nghiệp', 'Đã soạn'], ['II', 'Kỳ kế toán, đơn vị tiền tệ sử dụng', 'Tự điền'], ['III', 'Chuẩn mực và chế độ kế toán áp dụng', 'Tự điền'],
        ['IV', 'Các chính sách kế toán áp dụng', 'Đã soạn'], ['V', 'Thông tin bổ sung cho bảng cân đối kế toán', 'Lấy số từ sổ'], ['VI', 'Thông tin bổ sung cho báo cáo kết quả kinh doanh', 'Lấy số từ sổ'],
        ['VII', 'Thông tin bổ sung cho báo cáo lưu chuyển tiền tệ', 'Lấy số từ sổ'], ['VIII', 'Những thông tin khác', 'Chưa soạn']].map(([muc, nd, tt]) => ({ muc, nd, tt })) } },
    '10.3.1': { kind: 'custom', comp: BaoCaoQuanTri },
    '10.4.1': { report: SO_BO_SUNG['10.4.1'] },
    '10.4.2': { report: SO_BO_SUNG['10.4.2'] },
  }, NGAN),
}
export default tongHop
