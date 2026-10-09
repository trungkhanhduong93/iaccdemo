// Chỗ đặt thanh công cụ báo cáo trên hàng tiêu đề (T55). Lưu ở kho ngoài để thanh công cụ luôn theo đúng phần tử
// đang có trên trang, kể cả khi hàng tiêu đề vẽ lại
import { useSyncExternalStore } from 'react'

let choThanh: HTMLElement | null = null
const nghe = new Set<() => void>()

export function datChoThanhCongCu(el: HTMLElement | null) {
  if (choThanh === el) return
  choThanh = el
  nghe.forEach(f => f())
}

export function useChoThanhCongCu() {
  return useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => choThanh)
}
