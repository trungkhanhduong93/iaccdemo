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

export interface Dong {
  ma: string
  ten: string
  dvt: string
  sl: number
  gia: number
  tien: number
  ts: number
  thue: number
  ptCk?: number
  ck?: number
  kho?: string
  tkNo?: string
  tkCo?: string
  stt?: number
}

export interface TTNghiepVu {
  ttTien: 'chua' | 'mot' | 'da'
  ttHd: 'chua' | 'da'
  dc: string
  nguoi: string
  mst: string
  soHd: string
  ngayHd: string
  kyHieuHd: string
  hanTt: string
  dieuKhoan: string
}

const DIA_CHI_MAU = [
  '45 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM',
  '128 Hai Bà Trưng, Đa Kao, Quận 1, TP.HCM',
  '234 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM',
  '78 Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP.HCM',
  '56 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP.HCM',
  '12 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
]

const NGUOI_MAU = [
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Hoàng Nam', 'Phạm Minh Tuấn', 'Vũ Bích Ngọc', 'Đỗ Thanh Tùng',
]

export function ttNghiepVu(row: Row): TTNghiepVu {
  const r = rng(`${row.so}-tt`)
  const ttTien: 'chua' | 'mot' | 'da' = row.tt === 'nhap'
    ? (r() < 0.8 ? 'chua' : 'mot')
    : (r() < 0.6 ? 'da' : r() < 0.85 ? 'mot' : 'chua')
  const ttHd: 'chua' | 'da' = row.nguon === 'HĐ' ? 'da' : (r() < 0.7 ? 'da' : 'chua')
  const dc = pick(r, DIA_CHI_MAU)
  const nguoi = pick(r, NGUOI_MAU)
  const mst = `03${pad(Math.floor(r() * 90000000) + 10000000, 8)}`
  const soHd = pad(Math.floor(r() * 90000) + 10000, 7)
  const ngayHd = String(row.ngay)
  const kyHieuHd = String(row.so).startsWith('CTBH') || String(row.so).startsWith('HD') ? '1C26TBB' : '1C26TMM'
  const hanTt = row.ngay ? (() => {
    const parts = String(row.ngay).split('/')
    if (parts.length === 3) {
      const dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      dt.setDate(dt.getDate() + 30)
      return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`
    }
    return '06/11/2026'
  })() : '06/11/2026'
  const dieuKhoan = pick(r, ['Nợ 30 ngày', 'Nợ 15 ngày', 'Thanh toán ngay', 'Gối đầu theo tuần'])
  return { ttTien, ttHd, dc, nguoi, mst, soHd, ngayHd, kyHieuHd, hanTt, dieuKhoan }
}

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
