// Hệ thống tài khoản mẫu theo TT133; TT99 đổi một số tài khoản chi phí (chờ kế toán trưởng duyệt). Cột tài khoản có cảnh báo "Chưa gắn"
import { createElement } from 'react'
import type { Col, Row } from '../types'
import type { CheDo } from '../../app/che-do'

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
