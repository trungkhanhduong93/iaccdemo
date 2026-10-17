import { useSyncExternalStore } from 'react'

export interface KhoangNgayMobile {
  tu: string   // YYYY-MM-DD
  den: string  // YYYY-MM-DD
}

function pad(n: number | string): string {
  return String(n).padStart(2, '0')
}

export function ngayCuoiThang(nam: number, thang: number): number {
  return new Date(nam, thang, 0).getDate()
}

/** Kiểm tra khoảng ngày có phải trọn một tháng hay không */
export function laTronThang(tu: string, den: string): { tron: boolean; thang: number; nam: number } {
  if (!tu || !den) return { tron: false, thang: 0, nam: 0 }
  const [y1, m1, d1] = tu.split('-').map(Number)
  const [y2, m2, d2] = den.split('-').map(Number)
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return { tron: false, thang: 0, nam: 0 }
  if (y1 !== y2 || m1 !== m2 || d1 !== 1) return { tron: false, thang: m1, nam: y1 }
  const cuoi = ngayCuoiThang(y1, m1)
  if (d2 !== cuoi) return { tron: false, thang: m1, nam: y1 }
  return { tron: true, thang: m1, nam: y1 }
}

/** Định dạng nhãn hiển thị: trọn tháng -> "Tháng M/YYYY", khác -> "dd/MM/yyyy - dd/MM/yyyy" */
export function dinhDangKyMobile(tu: string, den: string, kyFallback?: string): string {
  if (!tu || !den) {
    return kyFallback ? `Tháng ${kyFallback}/2026` : 'Tháng 9/2026'
  }
  const check = laTronThang(tu, den)
  if (check.tron) {
    return `Tháng ${check.thang}/${check.nam}`
  }
  const [y1, m1, d1] = tu.split('-')
  const [y2, m2, d2] = den.split('-')
  return `${pad(d1)}/${pad(m1)}/${y1} - ${pad(d2)}/${pad(m2)}/${y2}`
}

const khoKy = new Map<string, KhoangNgayMobile>()
const boNhoMacDinh = new Map<string, KhoangNgayMobile>()
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(l => l())

export function datKhoangNgayMobile(path: string, kn: KhoangNgayMobile) {
  khoKy.set(path, kn)
  notify()
}

export function layKhoangNgayMobile(path: string, kyDaXem?: string): KhoangNgayMobile {
  const existing = khoKy.get(path)
  if (existing) {
    const m = Number(existing.tu.split('-')[1])
    if (!kyDaXem || m === Number(kyDaXem)) {
      return existing
    }
  }
  const thang = Number(kyDaXem) || 9
  const nam = 2026
  const khoa = `${path}:${thang}`
  let def = boNhoMacDinh.get(khoa)
  if (!def) {
    const cuoi = ngayCuoiThang(nam, thang)
    def = {
      tu: `${nam}-${pad(thang)}-01`,
      den: `${nam}-${pad(thang)}-${pad(cuoi)}`,
    }
    boNhoMacDinh.set(khoa, def)
  }
  return def
}

export function useKhoangNgayMobile(path: string, kyDaXem?: string): KhoangNgayMobile {
  return useSyncExternalStore(
    cb => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => layKhoangNgayMobile(path, kyDaXem)
  )
}
