// Màn mở từ trang chủ gói Free có nút "Trang chủ" ở đầu thanh tab để quay về (T232).
// Bấm liên kết trong vùng trang chủ thì mở màn kèm state tuTrangChu; mở từ menu, thanh tab thì không có nút.
import type { MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export const laTuTrangChu = (state: unknown) => !!(state as { tuTrangChu?: boolean } | null)?.tuTrangChu

/** Gắn vào onClickCapture của vùng trang chủ: liên kết trong vùng mở màn kèm state tuTrangChu.
 *  onClick riêng của liên kết (vd đặt bộ lọc báo cáo) vẫn chạy, chỉ thay bước chuyển màn */
export function useMoTuTrangChu() {
  const nav = useNavigate()
  return (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href')
    if (!a || !href?.startsWith('#/') || a.target === '_blank') return
    e.preventDefault()
    nav(href.slice(1), { state: { tuTrangChu: true } })
  }
}
