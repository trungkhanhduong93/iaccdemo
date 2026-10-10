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

const CS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']

function docBlock(val: number, batBuocHangTram: boolean): string[] {
  const c = Math.floor(val / 100)
  const b = Math.floor((val % 100) / 10)
  const a = val % 10
  const words: string[] = []
  if (c > 0) words.push(CS[c], 'trăm')
  else if (batBuocHangTram) words.push('không', 'trăm')

  if (b === 0) {
    if (a > 0 && words.length > 0) words.push('linh')
  } else if (b === 1) {
    words.push('mười')
  } else {
    words.push(CS[b], 'mươi')
  }

  if (a === 1) {
    words.push(b >= 2 ? 'mốt' : 'một')
  } else if (a === 4) {
    words.push(b >= 2 ? 'tư' : 'bốn')
  } else if (a === 5) {
    words.push(b >= 1 ? 'lăm' : 'năm')
  } else if (a > 1) {
    words.push(CS[a])
  }
  return words
}

function docDuong(n: number, batBuocHangTram = false): string[] {
  if (n === 0) return []
  if (n >= 1e9) {
    const ty = Math.floor(n / 1e9)
    const du = n % 1e9
    const res = [...docDuong(ty, batBuocHangTram), 'tỷ']
    if (du > 0) res.push(...docDuong(du, true))
    return res
  }
  const b2 = Math.floor(n / 1e6) % 1000
  const b1 = Math.floor(n / 1e3) % 1000
  const b0 = n % 1000
  const res: string[] = []
  let coTruoc = batBuocHangTram
  if (b2 > 0) {
    res.push(...docBlock(b2, coTruoc), 'triệu')
    coTruoc = true
  }
  if (b1 > 0) {
    res.push(...docBlock(b1, coTruoc), 'nghìn')
    coTruoc = true
  }
  if (b0 > 0) {
    res.push(...docBlock(b0, coTruoc))
  }
  return res
}

/** Đọc số nguyên đồng thành chữ tiếng Việt theo chuẩn kế toán */
export function docSoTien(n: number): string {
  const num = Math.round(n)
  if (num === 0) return 'Không đồng'
  const abs = Math.abs(num)
  const chuoi = docDuong(abs).join(' ')
  if (num < 0) return 'Âm ' + chuoi + ' đồng'
  return chuoi.charAt(0).toUpperCase() + chuoi.slice(1) + ' đồng'
}

// ── Số kiểu quốc tế: phẩy ngăn hàng nghìn, chấm thập phân (thẻ chi phí phân bổ) ──
/** Đọc số kiểu quốc tế: bỏ dấu phẩy ngăn nghìn */
export const docSoQT = (v: unknown) => typeof v === 'number' ? v : Number(String(v ?? '').replace(/,/g, '')) || 0
/** Chuỗi đang gõ chỉ giữ chữ số và một dấu chấm thập phân, chưa có dấu phẩy */
export const nhapSoQT = (s: string) => {
  const [nguyen, ...sau] = s.replace(/[^\d.]/g, '').split('.')
  return sau.length ? `${nguyen}.${sau.join('')}` : nguyen
}
/** Hiện số kiểu quốc tế, chèn phẩy ngăn nghìn cả khi đang gõ dở (giữ nguyên phần thập phân đã gõ) */
export const soQT = (v: unknown) => {
  if (typeof v === 'number') return v.toLocaleString('en-US', { maximumFractionDigits: 4 })
  const s = nhapSoQT(String(v ?? ''))
  if (!s) return ''
  const [nguyen, thap] = s.split('.')
  return (nguyen ? Number(nguyen).toLocaleString('en-US') : '0') + (thap !== undefined ? `.${thap}` : '')
}
