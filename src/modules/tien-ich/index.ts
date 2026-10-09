// Phân hệ Tiện ích bổ sung: đồng bộ, đối soát, hoá đơn đầu vào, duyệt, cảnh báo, kết nối, AI, báo cáo động
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { DoiSoat } from './DoiSoat'
import { CanhBao, DongBo, DuyetChungTu, HoaDonDauVao, NhatKyThaoTac } from './TienIch'
import { TongQuan } from '../home/TongQuan'
import { ThietKeMauIn } from './ThietKeMauIn'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '11.1': 'Đồng bộ bán hàng', '11.2': 'Xuất kho định lượng', '11.3': 'Đồng bộ kho', '11.4': 'Hoá đơn đầu vào', '11.5': 'Duyệt chứng từ', '11.6': 'Cảnh báo', '11.7': 'Đối soát', '11.8': 'Ngân hàng', '11.9': 'Cơ quan thuế', '11.10': 'AI nhập liệu', '11.11': 'Thiết kế mẫu in', '11.12': 'Báo cáo tự khai báo', '11.13': 'Nhiều bộ dữ liệu', '11.14': 'Dữ liệu lớn', '11.15': 'Nhiều kho một điểm bán', '11.16': 'Dashboard', 'X1': 'Truy cập web', 'X2': 'Nhật ký thao tác', 'X3': 'App điện thoại' }

const tienIch: ModuleDef = {
  key: 'tien-ich', ten: 'Tiện ích bổ sung', ngan: 'Tiện ích', icon: 'grid', mod: 10,
  mota: 'Đồng bộ, đối soát, kết nối thuế và ngân hàng, AI',
  quyTrinh,
  screens: tuExcel(10, {
    '11.1': { kind: 'custom', comp: DongBo },
    '11.2': { tool: { nut: 'Chạy xuất kho ngày 07/10', mota: 'Món bán trên FABi tự sinh phiếu xuất kho nguyên vật liệu theo công thức chế biến, ngay khi đơn về. Món chưa có công thức được đưa vào danh sách chờ.',
      caiDat: [['Thời điểm xuất', 'Ngay khi đơn về'], ['Món chưa có công thức', 'Đưa vào danh sách chờ, không xuất']],
      nhatKy: [['07/10/2026 14:20', 'Xuất 1.894 món, 3 chi nhánh', 'Xong'], ['07/10/2026 14:05', '2 món chưa có công thức: Bún bò Huế, Mì Quảng', 'Cảnh báo']] } },
    '11.3': { tool: { nut: 'Đồng bộ kho ngay', mota: 'Lấy phiếu nhập, xuất, điều chuyển, kiểm kê từ iPOS Inventory về IACC Cloud. Danh mục kho, nguyên vật liệu không phải nhập lại.',
      caiDat: [['Lịch', 'Mỗi giờ'], ['Kho áp dụng', '5 kho']] } },
    '11.4': { kind: 'custom', comp: HoaDonDauVao },
    '11.5': { kind: 'custom', comp: DuyetChungTu },
    '11.6': { kind: 'custom', comp: CanhBao },
    '11.7': { kind: 'custom', comp: DoiSoat },
    '11.8': { tool: { nut: 'Tải sao kê ngay', mota: 'Nhận sao kê từ ngân hàng, tự khớp giao dịch với phiếu thu, chi và tiền QR bán hàng. Giao dịch chưa khớp chờ kế toán chọn chứng từ.',
      caiDat: [['Ngân hàng', 'Vietcombank, Techcombank'], ['Lịch tải', 'Mỗi giờ']],
      nhatKy: [['07/10/2026 14:00', '86 giao dịch, khớp 81', 'Còn 5 chờ khớp'], ['07/10/2026 13:00', '42 giao dịch, khớp 42', 'Xong']] } },
    '11.9': { tool: { nut: 'Kiểm tra kết nối', mota: 'Nộp tờ khai, tra cứu thông báo, tra trạng thái hoá đơn trực tiếp với cơ quan thuế, không phải đăng nhập cổng thuế riêng.',
      caiDat: [['Mã số thuế', '0319 990 001'], ['Chữ ký số', 'Đã gắn, hạn 12/2027']] } },
    '11.10': { tool: { nut: 'Thử quét hoá đơn', mota: 'Chụp hoá đơn giấy hoặc nói "chi 450 nghìn mua rau chợ Bến Thành" để AI lập phiếu nháp kèm định khoản gợi ý. Kế toán xem lại rồi mới lưu.',
      caiDat: [['Ngôn ngữ', 'Tiếng Việt'], ['Tự lưu khi tin cậy trên', 'Không tự lưu']] } },
    '11.11': { kind: 'custom', comp: ThietKeMauIn },
    '11.12': { tool: { nut: 'Thêm báo cáo', mota: 'Tự khai báo dòng báo cáo bằng công thức lấy số từ sổ cái, theo tài khoản, đối tượng, chi nhánh. Mỗi mã số thuế có bộ báo cáo riêng.', caiDat: [['Báo cáo', 'Lãi lỗ theo chi nhánh'], ['Nguồn', 'Sổ cái']] } },
    '11.13': { tool: { nut: 'Thêm bộ dữ liệu', mota: 'Một tài khoản FABi gắn nhiều bộ dữ liệu kế toán. Tách theo mã số thuế, theo thương hiệu, hoặc giữ bộ cũ khi đổi thông tư. Đổi bộ ở góc trên bên trái.', caiDat: [['Bộ dữ liệu đang dùng', '3 đơn vị']] } },
    '11.14': { tool: { nut: 'Xuất thử 500.000 dòng', mota: 'Lọc và xuất dữ liệu hàng trăm nghìn dòng, không giới hạn khoảng thời gian. Việc lâu chạy nền, xong thì báo và gửi tệp.', caiDat: [['Định dạng xuất', 'Excel (.xlsx), CSV']] } },
    '11.15': { tool: { nut: 'Lưu cấu hình', mota: 'Một điểm bán có nhiều kho: kho bếp, kho bar, kho đồ khô. Phiếu xuất bán POS chọn kho theo nhóm món.', caiDat: [['Món nhóm Đồ uống', 'Kho bar'], ['Món còn lại', 'Kho bếp']] } },
    '11.16': { kind: 'custom', comp: TongQuan },
    'X1': { tool: { nut: 'Mở hướng dẫn', mota: 'Dùng đủ tính năng của gói trên trình duyệt Chrome, Edge, Safari bản mới. Không cài phần mềm, không dựng máy chủ.' } },
    'X2': { kind: 'custom', comp: NhatKyThaoTac },
    'X3': { tool: { nut: 'Gửi link tải app', mota: 'App điện thoại cho chủ doanh nghiệp xem báo cáo, biểu đồ và duyệt chứng từ. Bản mẫu này chỉ làm giao diện web.' } },
  }, NGAN),
}
export default tienIch
