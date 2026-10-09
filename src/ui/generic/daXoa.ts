// Phiếu đã xoá, phiếu mới lưu, phiếu đã sửa trong phiên (bản mẫu chưa có backend): giữ tới khi tải lại trang (T48, T49)
import { useSyncExternalStore } from 'react'
import type { Row } from '../../modules/types'

const daXoa = new Set<string>()
const phieuMoi = new Map<string, Row[]>()
const daSua = new Map<string, Partial<Row>>()
const nghe = new Set<() => void>()
let banSo = 0

export function xoaPhieu(man: string, ids: string[]) {
  for (const id of ids) daXoa.add(`${man}|${id}`)
  banSo++
  nghe.forEach(f => f())
}

/** Phiếu mới lưu từ form: hiện lên đầu danh sách của màn */
export function themPhieu(man: string, row: Row) {
  phieuMoi.set(man, [row, ...(phieuMoi.get(man) ?? [])])
  banSo++
  nghe.forEach(f => f())
}

/** Phiếu đã có sửa trên form rồi lưu: danh sách hiện nội dung mới */
export function suaPhieu(man: string, id: string, moi: Partial<Row>) {
  daSua.set(`${man}|${id}`, { ...daSua.get(`${man}|${id}`), ...moi })
  banSo++
  nghe.forEach(f => f())
}

/** Số phiếu kế tiếp của tiền tố trong tháng 10/2026: 0261 rồi tăng theo số phiếu đã lưu trong phiên */
export function soKeTiep(man: string, tienTo: string) {
  const da = (phieuMoi.get(man) ?? []).filter(r => String(r.so).startsWith(tienTo)).length
  return `${tienTo}${String(261 + da).padStart(4, '0')}`
}

/** Trả về số phiên bản (đổi mỗi lần xoá, thêm, sửa; dùng làm phụ thuộc useMemo), hàm hỏi phiếu đã xoá chưa,
 *  các phiếu mới lưu và hàm áp nội dung đã sửa lên một phiếu */
export function useDaXoa(man: string) {
  const ban = useSyncExternalStore(f => { nghe.add(f); return () => { nghe.delete(f) } }, () => banSo)
  return {
    ban,
    laDaXoa: (id: unknown) => daXoa.has(`${man}|${id}`),
    phieuMoi: phieuMoi.get(man) ?? [],
    apSua: (r: Row): Row => { const s = daSua.get(`${man}|${r.id}`); return s ? { ...r, ...s } : r },
  }
}
