// Sinh dữ liệu giả cho màn chung. Có hạt giống theo mã màn nên mở lại vẫn ra đúng số cũ.
import type { Row, VoucherCfg } from '../../modules/types'
import { CHI_NHANH, HANG, HOM_NAY, KHACH, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { between, k, pad, pick, rng } from '../format'

export function doiTuongDs(kind: VoucherCfg['doiTuong']): { ma: string; ten: string }[] {
  if (kind === 'kh') return KHACH
  if (kind === 'ncc') return NCC
  if (kind === 'nv') return NHAN_VIEN
  if (kind === 'cn') return CHI_NHANH.map(c => ({ ma: c.id.toUpperCase(), ten: c.ten }))
  return [{ ma: '', ten: '' }]
}

export interface Dong { ma: string; ten: string; dvt: string; sl: number; gia: number; tien: number; ts: number; thue: number }

export function dongCua(cfg: VoucherCfg, id: string): Dong[] {
  const r = rng(id)
  const kind = cfg.dong ?? 'tien'
  if (kind === 'tien' || kind === 'ts') {
    const n = 1 + Math.floor(r() * 2)
    return Array.from({ length: n }, (_, i) => {
      const tien = k(between(r, cfg.tien[0], cfg.tien[1]) / n)
      const ts = cfg.thue ?? 0
      return { ma: '', ten: cfg.dienGiai[(i + Math.floor(r() * 9)) % cfg.dienGiai.length], dvt: '', sl: 1, gia: tien, tien, ts, thue: Math.round(tien * ts / 100) }
    })
  }
  const src = kind === 'hang' ? HANG : NVL
  const n = 2 + Math.floor(r() * 4)
  const used = new Set<number>()
  const out: Dong[] = []
  for (let i = 0; i < n; i++) {
    let j = Math.floor(r() * src.length)
    while (used.has(j)) j = (j + 1) % src.length
    used.add(j)
    const h = src[j]
    const sl = h.gia > 100000 ? Math.round(between(r, 2, 18)) : Math.round(between(r, 10, 80))
    const tien = sl * h.gia
    const ts = cfg.thue === 0 ? 0 : h.ts
    out.push({ ma: h.ma, ten: h.ten, dvt: h.dvt, sl, gia: h.gia, tien, ts, thue: Math.round(tien * ts / 100) })
  }
  return out
}

export function tongDong(ds: Dong[]) {
  const tien = ds.reduce((a, d) => a + d.tien, 0), thue = ds.reduce((a, d) => a + d.thue, 0)
  return { tien, thue, tong: tien + thue }
}

/** 26 chứng từ trải từ 07/10 lùi về đầu tháng 9 */
export function chungTu(cfg: VoucherCfg, seed: string): Row[] {
  const r = rng(seed)
  const dts = doiTuongDs(cfg.doiTuong)
  const rows: Row[] = []
  let d = new Date(HOM_NAY)
  for (let i = 0; i < 26; i++) {
    const so = `${cfg.prefix}${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}-${pad(260 - i * 3 - Math.floor(r() * 3), 4)}`
    const dt = pick(r, dts)
    const id = `${seed}-${i}`
    const t = tongDong(dongCua(cfg, id))
    const nguon = cfg.nguon && cfg.nguon !== 'tay' && r() < 0.75 ? cfg.nguon : 'tay'
    rows.push({
      id: String(i), so, ngay: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`, thang: d.getMonth() + 1,
      doiTuong: dt.ten, maDt: dt.ma, cn: pick(r, CHI_NHANH).ten,
      dienGiai: pick(r, cfg.dienGiai), tien: t.tien, thue: t.thue, tong: t.tong, nguon,
      tt: i < 3 ? 'nhap' : i === 5 ? 'loi' : 'ghi',
    })
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - (r() < 0.55 ? 1 : 2))
  }
  return rows
}

export const TT_CT: Record<string, [string, string]> = {
  nhap: ['warn', 'Chưa ghi sổ'], ghi: ['ok', 'Đã ghi sổ'], loi: ['err', 'Lỗi hạch toán'], khoa: ['dim', 'Đã khoá'],
}
export const NGUON: Record<string, [string, string]> = {
  FABi: ['', 'FABi'], IVT: ['ivt', 'iPOS Inventory'], 'HĐ': ['hd', 'iPOS Invoice'], tay: ['tay', 'Thủ công'],
}

/** Sổ chi tiết: phát sinh trong kỳ có số dư luỹ kế */
export function soChiTiet(seed: string, mo: number, dien: string[], doiUng: string[], tien: [number, number], thang: number) {
  const r = rng(seed + thang)
  const rows: Row[] = []
  let du = mo, tn = 0, tc = 0
  const dim = thang === 10 ? 7 : new Date(2026, thang, 0).getDate()
  for (let day = 1; day <= dim; day++) {
    const n = r() < 0.35 ? 0 : 1 + Math.floor(r() * 2)
    for (let j = 0; j < n; j++) {
      const thu = r() < 0.55
      const v = k(between(r, tien[0], tien[1]))
      du += thu ? v : -v
      if (thu) tn += v; else tc += v
      rows.push({
        ngay: `${pad(day)}/${pad(thang)}/2026`, so: `${thu ? 'PT' : 'PC'}26${pad(thang)}-${pad(rows.length + 1, 4)}`,
        dienGiai: pick(r, dien), tk: pick(r, doiUng), no: thu ? v : 0, co: thu ? 0 : v, du,
      })
    }
  }
  return { rows, mo, tn, tc, cuoi: du }
}
