// Định dạng số tiền, ngày theo kiểu Việt Nam và bộ sinh số giả có hạt giống (chạy lại ra đúng số cũ)

export const money = (n: number) => Math.round(n).toLocaleString('vi-VN')
export const moneyD = (n: number) => money(n) + ' đ'
/** 1.284.560.000 -> "1,28 tỷ"; 45.600.000 -> "45,6 tr" */
export function short(n: number): string {
  const a = Math.abs(n)
  if (a >= 1e9) return (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ'
  if (a >= 1e6) return (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr'
  if (a >= 1e3) return (n / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' k'
  return money(n)
}
export const pct = (n: number, d = 1) => (n * 100).toLocaleString('vi-VN', { maximumFractionDigits: d }) + '%'

export const pad = (n: number, w = 2) => String(n).padStart(w, '0')
export const dmy = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
export const dm = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`

export function rng(seed: number | string) {
  let s = typeof seed === 'number' ? seed : [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)]
export const between = (r: () => number, lo: number, hi: number) => lo + (hi - lo) * r()
/** Làm tròn tới nghìn đồng */
export const k = (n: number) => Math.round(n / 1000) * 1000

export function fold(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}
