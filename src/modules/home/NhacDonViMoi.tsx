// Nhắc trên Trang chủ cho đơn vị mới khởi tạo (T138), theo trải nghiệm chủ quán lần đầu (vai chị Linh, PhuongXT gửi 28/10/2026):
// lợi nhuận mới tính từ doanh thu FABi nên ghi rõ là tạm tính (bỏ dòng nhắc kèm nút Ghi khoản chi, PhuongXT 29/10/2026); quỹ tiền mặt chưa có tiền lẻ đầu ca trong két
// nên nhắc nhập số dư ban đầu bằng một nhãn nhỏ, không che biểu đồ. Dùng chung web (BaBaiToanStandard) và điện thoại (MTrangChuStandard).
import { Link } from 'react-router-dom'
import { useSession, type Session } from '../../app/session'
import { Icon } from '../../ui/Icon'

/** Đơn vị mới tạo khi kết nối FABi hoặc Thêm đơn vị kế toán; 3 đơn vị mẫu đã có đủ số liệu nên không nhắc */
export const laDonViMoi = (s: Pick<Session, 'dvMoi' | 'donVi'>) => !!s.dvMoi && s.donVi === s.dvMoi.id

export function ChipTamTinh() {
  const { s } = useSession()
  return laDonViMoi(s) ? <span className="chip warn nhac-tt-chip">Tạm tính</span> : null
}

export function NhacSoDuKet() {
  const { s } = useSession()
  if (!laDonViMoi(s) || s.soDuQuy?.[s.donVi]) return null
  return (
    <Link className="nhac-sodu" to="/app/danh-muc/1-12" title="Nhập tiền đang có trong két, tiền gửi ngân hàng tại ngày bắt đầu làm việc">
      <Icon n="info" className="ic sm" />Nhập số dư két ban đầu để sổ khớp tiền thực tế
    </Link>
  )
}
