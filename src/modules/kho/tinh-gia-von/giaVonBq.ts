// Đơn giá vốn bình quân theo tháng của hàng bán. Chạy Tính giá vốn (5.1.7) xong thì ghi đơn giá của tháng đó;
// phiếu bán hàng trong tháng (gõ tay, Xuất bán POS) áp vào cột Giá vốn, Tiền vốn và phiếu xuất kho in từ phiếu bán.
// Tháng chưa tính thì không có đơn giá, hai cột để trống. Chưa có backend nên lưu localStorage, đọc ghi bọc try/catch.
import { useSyncExternalStore } from 'react'
import { HANG } from '../../../data/mock'
import { rng } from '../../../ui/format'

type Bang = Record<string, Record<string, number>>   // 'tháng/năm' → mã hàng → đơn giá vốn

const KHOA = 'gia-von-bq'
const SU_KIEN = 'gia-von-bq'

function doc(): Bang {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KHOA) ?? '{}')
    return typeof v === 'object' && v !== null && !Array.isArray(v) ? v as Bang : {}
  } catch {
    return {}
  }
}

/** Khoá tháng của ngày dạng dd/MM/yyyy (có thể kèm giờ) hoặc Date: '9/2026' */
export function kyCua(ngay: string | Date): string {
  if (ngay instanceof Date) return `${ngay.getMonth() + 1}/${ngay.getFullYear()}`
  const p = String(ngay).split(' ')[0].split('/')
  return p.length === 3 ? `${Number(p[1])}/${p[2]}` : ''
}

/** Đơn giá bình quân gia quyền giả lập: dữ liệu mẫu chưa có nhập, xuất từng món nên lấy 30 đến 40% giá bán, cố định theo mã và tháng */
function donGiaMau(h: (typeof HANG)[number], ky: string): number {
  return Math.round(h.gia * (0.3 + rng(`gv-${h.ma}-${ky}`)() * 0.1) / 100) * 100
}

/** Ghi đơn giá vốn bình quân của tháng t/n cho mọi mặt hàng bán, sau khi Tính giá vốn chạy xong */
export function luuGiaVonThang(t: number, n: number) {
  const ky = `${t}/${n}`
  const bang = doc()
  bang[ky] = Object.fromEntries(HANG.map(h => [h.ma, donGiaMau(h, ky)]))
  try { localStorage.setItem(KHOA, JSON.stringify(bang)) } catch { /* trình duyệt chặn lưu thì cột giá vốn để trống */ }
  window.dispatchEvent(new Event(SU_KIEN))
}

/** Đơn giá vốn bình quân của mặt hàng trong tháng của ngày bán; tháng chưa tính giá vốn thì undefined */
export function giaVonBq(ma: string | undefined, ngay: string | Date): number | undefined {
  return ma ? doc()[kyCua(ngay)]?.[ma] : undefined
}

/** Tiền vốn của dòng = đơn giá vốn × số lượng; chưa có đơn giá thì undefined */
export function tienVon(gia: number | undefined, sl: number | undefined): number | undefined {
  return gia === undefined ? undefined : Math.round(gia * (sl || 0))
}

let banGhi = 0
function dangKy(f: () => void) {
  const on = () => { banGhi++; f() }
  window.addEventListener(SU_KIEN, on)
  window.addEventListener('storage', on)
  return () => { window.removeEventListener(SU_KIEN, on); window.removeEventListener('storage', on) }
}

/** Vẽ lại khi vừa tính giá vốn xong (cùng tab hoặc tab khác) */
export function useGiaVonBq(): number {
  return useSyncExternalStore(dangKy, () => banGhi)
}
