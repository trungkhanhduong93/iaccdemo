// Hệ thống tài khoản mẫu (trích theo TT133) và cột tài khoản có cảnh báo "Chưa gắn"
import { createElement } from 'react'
import type { Col, Row } from '../types'

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
