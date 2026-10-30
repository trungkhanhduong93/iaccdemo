// Nhắc trên Trang chủ cho đơn vị mới khởi tạo (T138), theo trải nghiệm chủ quán lần đầu (vai chị Linh, PhuongXT gửi 28/10/2026):
// lợi nhuận mới tính từ doanh thu FABi nên ghi rõ là tạm tính (bỏ dòng nhắc kèm nút Ghi khoản chi, PhuongXT 29/10/2026); quỹ tiền mặt chưa có tiền lẻ đầu ca trong két
// nên nhắc nhập số dư ban đầu bằng một nhãn nhỏ, không che biểu đồ. Dùng chung web (BaBaiToanStandard) và điện thoại (MTrangChuStandard).
// Kết nối FABi xong mà chứng từ còn đổ về thì Doanh thu, từng quỹ báo đang đồng bộ x / y chứng từ (T687).
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession, type Session } from '../../app/session'
import { Icon } from '../../ui/Icon'

/** Đơn vị mới tạo khi kết nối FABi hoặc Thêm đơn vị kế toán; 3 đơn vị mẫu đã có đủ số liệu nên không nhắc */
export const laDonViMoi = (s: Pick<Session, 'dvMoi' | 'donVi'>) => !!s.dvMoi && s.donVi === s.dvMoi.id

/** Thời gian mẫu để chứng từ FABi đổ về hết sau khi Kết nối (T687) */
const THOI_GIAN_DB = 90_000

/** Chứng từ FABi còn đổ về sau Kết nối: t là phần thời gian đã chạy (0 tới 1); đổ về hết thì null (T687) */
export function useDongBoFabi() {
  const { s } = useSession()
  const db = s.dongBoFabi?.[s.donVi]
  const [bay, setBay] = useState(() => Date.now())
  const het = !db || bay - db.bd >= THOI_GIAN_DB
  useEffect(() => {
    if (het) return
    const t = setInterval(() => setBay(Date.now()), 700)
    return () => clearInterval(t)
  }, [het])
  if (!db || het) return null
  return { t: Math.max(0, (bay - db.bd) / THOI_GIAN_DB), ct: db.ct, tc: db.tc }
}
/** Phần đã về của một nhóm chứng từ chạy nhanh hơn chuẩn: k là phần thời gian nhóm đó cần (0 tới 1) */
export const phanDaVe = (t: number, k = 1) => Math.min(1, t / k)

/** Thanh tiến độ và dòng "Đang đồng bộ x / y chứng từ"; đủ rồi thì dòng xanh "Đã đủ" (T687) */
export function DongDongBo({ da, tong }: { da: number; tong: number }) {
  if (da >= tong) return <span className="db-dong xong"><Icon n="check" className="ic sm" />Đã đủ {tong.toLocaleString('vi-VN')} / {tong.toLocaleString('vi-VN')} chứng từ</span>
  return (
    <span className="db-dong">
      <span className="db-thanh"><i style={{ width: `${Math.round(da / (tong || 1) * 100)}%` }} /></span>
      <span className="db-chu"><Icon n="refresh" className="ic sm db-quay" />Đang đồng bộ {da.toLocaleString('vi-VN')} / {tong.toLocaleString('vi-VN')} chứng từ</span>
    </span>
  )
}

export function ChipTamTinh() {
  const { s } = useSession()
  const db = useDongBoFabi()
  if (!laDonViMoi(s)) return null
  return <span className="chip warn nhac-tt-chip">{db ? 'Đang đồng bộ, tạm tính' : 'Tạm tính'}</span>
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
