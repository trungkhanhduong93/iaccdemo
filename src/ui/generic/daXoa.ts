// Phiếu đã xoá trong phiên (bản mẫu chưa có backend): ẩn khỏi danh sách và form tới khi tải lại trang (T48)
import { useSyncExternalStore } from 'react'

const daXoa = new Set<string>()
const nghe = new Set<() => void>()
let banSo = 0

export function xoaPhieu(man: string, ids: string[]) {
  for (const id of ids) daXoa.add(`${man}|${id}`)
  banSo++
  nghe.forEach(f => f())
}

/** Trả về số phiên bản (đổi mỗi lần xoá, dùng làm phụ thuộc useMemo) và hàm hỏi phiếu đã xoá chưa */
export function useDaXoa(man: string) {
  const ban = useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => banSo)
  return { ban, laDaXoa: (id: unknown) => daXoa.has(`${man}|${id}`) }
}
