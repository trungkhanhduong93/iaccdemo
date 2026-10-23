// Tháng làm việc gói Free (T617): tháng chọn ở trang chủ thành kỳ mặc định khi mở báo cáo, danh sách, Chi phí phân bổ.
// Giữ trong sessionStorage, đóng tab là về tháng hiện tại. Gói khác không dùng.
const KEY = 'iacc-thang-lam-viec'

const laGoiStandard = () => {
  try { return JSON.parse(localStorage.getItem('iacc-cloud-session') ?? '{}').goi === 'S' } catch { return false }
}

/** Tháng làm việc năm 2026 đã chọn ở trang chủ Free; chưa chọn hoặc không phải gói Free thì null */
export function thangLamViec(): number | null {
  if (!laGoiStandard()) return null
  try {
    const t = Number(sessionStorage.getItem(KEY))
    return t >= 1 && t <= 12 ? t : null
  } catch { return null }
}

export function datThangLamViec(thang: number) {
  try { sessionStorage.setItem(KEY, String(thang)) } catch { /* chế độ riêng tư chặn bộ nhớ: bỏ qua */ }
}
