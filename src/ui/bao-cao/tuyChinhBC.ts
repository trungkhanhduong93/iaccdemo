// Trạng thái lọc và tuỳ chỉnh báo cáo (kế hoạch mục 6, 10, T47). Lưu tuỳ chỉnh theo đơn vị, hàm thuần biến đổi bảng.
import { useSyncExternalStore } from 'react'
import type { Col, Row } from '../../modules/types'
import type { OKy } from '../generic/ReportScreen'
import { thangLamViec } from '../../app/thangLamViec'

export interface TuyChinhCot {
  k: string
  ten?: string
  an?: boolean
  rong?: number
}

export interface TuyChinhLuu {
  cot?: TuyChinhCot[]
  nhom?: string[]
  xemNhom?: 'tongHop' | 'chiTiet'   // đang gom nhóm thì xem tổng hợp (mỗi nhóm một dòng) hay chi tiết; thiếu là chi tiết (T289)
  coChu?: number
  ky?: OKy[]
}

export interface BanLoc {
  loc: Record<string, string[]>
  ky: string
}

export interface TrangThaiLoc {
  loc: Record<string, string[]>
  ky: string
  daXem: BanLoc
  nhap: BanLoc
  coThayDoi: boolean
  kyDatSan?: boolean   // mở từ báo cáo, trang khác kèm kỳ (datLocDaXem): kỳ mặc định của trang không ghi đè, tránh giành kỳ lặp vô hạn (T230)
  tuyChon: Record<string, string[]>
  cotNhuDangXem: boolean
  colsGoc?: Col[]
  dsKyMacDinh?: OKy[]
}

function soSanhLoc(a: Record<string, string[]>, b: Record<string, string[]>): boolean {
  const ka = Object.keys(a).filter(k => a[k] && a[k].length > 0)
  const kb = Object.keys(b).filter(k => b[k] && b[k].length > 0)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    const va = a[k] ?? []
    const vb = b[k] ?? []
    if (va.length !== vb.length) return false
    if (!va.every(x => vb.includes(x))) return false
  }
  return true
}

export function coThayDoiLoc(nhap: BanLoc, daXem: BanLoc): boolean {
  if (nhap.ky !== daXem.ky) return true
  if (!soSanhLoc(nhap.loc, daXem.loc)) return true
  return false
}

// ── Kho trạng thái runtime theo đường dẫn (location.pathname) ──

type Listener = () => void
const listeners = new Set<Listener>()
const subscribe = (l: Listener) => {
  listeners.add(l)
  return () => { listeners.delete(l) }
}
const phatSong = () => { listeners.forEach(l => l()) }

const khoPath = new Map<string, TrangThaiLoc>()

function layTrangThai(path: string): TrangThaiLoc {
  let s = khoPath.get(path)
  if (!s) {
    const defaultBan: BanLoc = { loc: {}, ky: '9' }
    s = {
      loc: {},
      ky: '9',
      daXem: { ...defaultBan },
      nhap: { ...defaultBan },
      coThayDoi: false,
      tuyChon: {},
      cotNhuDangXem: true,
    }
    khoPath.set(path, s)
  }
  return s
}

export function datColsGoc(path: string, cols: Col[]) {
  const s = layTrangThai(path)
  if (s.colsGoc && s.colsGoc.length === cols.length && s.colsGoc.every((c, i) => c.k === cols[i].k && c.t === cols[i].t)) return
  khoPath.set(path, { ...s, colsGoc: cols })
  phatSong()
}

export function datDsKyMacDinh(path: string, ds: OKy[]) {
  const s = layTrangThai(path)
  if (s.dsKyMacDinh && s.dsKyMacDinh.length === ds.length && s.dsKyMacDinh.every((o, i) => o.chucDanh === ds[i].chucDanh && o.hoTen === ds[i].hoTen)) return
  khoPath.set(path, { ...s, dsKyMacDinh: ds })
  phatSong()
}

export function datKyMacDinh(path: string, kyTrang: string) {
  // Gói Free: tháng làm việc chọn ở trang chủ thay kỳ mặc định của trang, chỉ các tháng có trong ô chọn kỳ 8, 9, 10 (T617)
  const lv = thangLamViec()
  const ky = lv && lv >= 8 && lv <= 10 ? String(lv) : kyTrang
  const s = layTrangThai(path)
  if (s.daXem.ky === ky && s.nhap.ky === ky) return
  if (s.kyDatSan) return
  if (!s.coThayDoi) {
    const ban: BanLoc = { ...s.daXem, ky }
    khoPath.set(path, {
      ...s,
      daXem: { ...ban },
      nhap: { ...ban },
      ky,
    })
    phatSong()
  }
}

export function datKyNhap(path: string, ky: string) {
  const s = layTrangThai(path)
  if (s.nhap.ky === ky) return
  const nhapMoi: BanLoc = { ...s.nhap, ky }
  const thayDoi = coThayDoiLoc(nhapMoi, s.daXem)
  khoPath.set(path, { ...s, nhap: nhapMoi, coThayDoi: thayDoi })
  phatSong()
}

export function datLoc(path: string, k: string, vals: string[]) {
  const s = layTrangThai(path)
  const locMoi = { ...s.nhap.loc }
  if (vals.length > 0) locMoi[k] = vals
  else delete locMoi[k]
  const nhapMoi: BanLoc = { ...s.nhap, loc: locMoi }
  const thayDoi = coThayDoiLoc(nhapMoi, s.daXem)
  khoPath.set(path, { ...s, nhap: nhapMoi, coThayDoi: thayDoi })
  phatSong()
}

export function datCotNhuDangXem(path: string, v: boolean) {
  const s = layTrangThai(path)
  khoPath.set(path, { ...s, cotNhuDangXem: v })
  phatSong()
}

export function datTuyChon(path: string, k: string, ds: string[]) {
  const s = layTrangThai(path)
  const cu = s.tuyChon[k]
  if (cu && cu.length === ds.length && cu.every((x, i) => x === ds[i])) return
  khoPath.set(path, { ...s, tuyChon: { ...s.tuyChon, [k]: ds } })
  phatSong()
}

export function xoaLoc(path: string) {
  const s = layTrangThai(path)
  const nhapMoi: BanLoc = { ...s.nhap, loc: {} }
  const thayDoi = coThayDoiLoc(nhapMoi, s.daXem)
  khoPath.set(path, { ...s, nhap: nhapMoi, coThayDoi: thayDoi })
  phatSong()
}

export function xemBaoCao(path: string) {
  const s = layTrangThai(path)
  const daXemMoi: BanLoc = {
    loc: { ...s.nhap.loc },
    ky: s.nhap.ky,
  }
  khoPath.set(path, {
    ...s,
    daXem: daXemMoi,
    loc: daXemMoi.loc,
    ky: daXemMoi.ky,
    coThayDoi: false,
  })
  phatSong()
  window.dispatchEvent(new CustomEvent('bc-da-xem', { detail: { path, ky: daXemMoi.ky } }))
}

/** Mở báo cáo khác với sẵn bộ lọc, kỳ (bấm dòng ở báo cáo tổng hợp xem sổ chi tiết, T185): đặt cả bản đang nhập và bản đã xem */
export function datLocDaXem(path: string, loc: Record<string, string[]>, ky: string) {
  const s = layTrangThai(path)
  const ban: BanLoc = { loc: { ...loc }, ky }
  khoPath.set(path, { ...s, nhap: { ...ban }, daXem: { ...ban }, loc: ban.loc, ky, coThayDoi: false, kyDatSan: true })
  phatSong()
}

export function useTrangThaiLoc(path: string): TrangThaiLoc {
  return useSyncExternalStore(subscribe, () => layTrangThai(path))
}

// ── Lưu trữ localStorage: bc-tuy-chinh:<donVi>:<mã> ──

const khoaLuu = (donVi: string, ma: string) => `bc-tuy-chinh:${donVi}:${ma}`
/** Tuỳ chỉnh sẵn của báo cáo khi người dùng chưa lưu gì, Về mặc định cũng quay lại đây.
 *  Chi tiết bán hàng gom theo kênh bán, mở vào Chi tiết (T455) */
const TC_MAC_DINH: Record<string, TuyChinhLuu> = { '3.2.8': { nhom: ['kenh'], xemNhom: 'chiTiet' } }
const boNhoTuyChinh = new Map<string, { raw: string | null; val: TuyChinhLuu | null }>()

export function docTuyChinh(donVi: string, ma?: string): TuyChinhLuu | null {
  if (!donVi || !ma) return null
  const k = khoaLuu(donVi, ma)
  try {
    const raw = localStorage.getItem(k)
    const cu = boNhoTuyChinh.get(k)
    if (cu && cu.raw === raw) return cu.val
    if (!raw) {
      const md = TC_MAC_DINH[ma] ? { ...TC_MAC_DINH[ma], nhom: [...(TC_MAC_DINH[ma].nhom ?? [])] } : null   // bản sao, nơi gọi có thể sửa trước khi lưu
      boNhoTuyChinh.set(k, { raw: null, val: md })
      return md
    }
    const v = JSON.parse(raw) as TuyChinhLuu
    const val = typeof v === 'object' && v !== null ? v : null
    boNhoTuyChinh.set(k, { raw, val })
    return val
  } catch {
    return null
  }
}

export function luuTuyChinh(donVi: string, ma: string, tc: TuyChinhLuu) {
  if (!donVi || !ma) return
  const k = khoaLuu(donVi, ma)
  try {
    const raw = JSON.stringify(tc)
    localStorage.setItem(k, raw)
    boNhoTuyChinh.set(k, { raw, val: tc })
  } catch {
    // Trình duyệt chặn thì chịu
  }
  phatSong()
}

export function xoaTuyChinh(donVi: string, ma: string) {
  if (!donVi || !ma) return
  const k = khoaLuu(donVi, ma)
  try {
    localStorage.removeItem(k)
    boNhoTuyChinh.set(k, { raw: null, val: null })
  } catch {
    // Trình duyệt chặn thì chịu
  }
  phatSong()
}

/** Lưu độ rộng một cột khi người dùng kéo giãn trên bảng báo cáo web (T350) */
export function luuRongCotBC(donVi: string, ma: string, k: string, w: number, colsGoc?: Col[]) {
  if (!donVi || !ma) return
  const wChuan = Math.max(60, Math.round(w))
  const tc = docTuyChinh(donVi, ma) ?? {}
  let dsCot = tc.cot ? [...tc.cot] : []

  if (dsCot.length === 0 && colsGoc && colsGoc.length > 0) {
    dsCot = colsGoc.map(cg => ({
      k: cg.k,
      ten: cg.t,
      rong: cg.k === k ? wChuan : cg.w,
    }))
  } else {
    const idx = dsCot.findIndex(c => c.k === k)
    if (idx >= 0) {
      dsCot[idx] = { ...dsCot[idx], rong: wChuan }
    } else if (colsGoc && colsGoc.length > 0) {
      const mapCot = new Map(dsCot.map(c => [c.k, c]))
      const moi: TuyChinhCot[] = []
      for (const cg of colsGoc) {
        if (cg.k === k) {
          moi.push({ k, ten: cg.t, rong: wChuan })
        } else if (mapCot.has(cg.k)) {
          moi.push(mapCot.get(cg.k)!)
        } else {
          moi.push({ k: cg.k, ten: cg.t, rong: cg.w })
        }
      }
      dsCot = moi
    } else {
      dsCot.push({ k, rong: wChuan })
    }
  }
  tc.cot = dsCot
  luuTuyChinh(donVi, ma, tc)
}

export function useTuyChinhBC(donVi: string, ma?: string): TuyChinhLuu | null {
  return useSyncExternalStore(subscribe, () => docTuyChinh(donVi, ma))
}

// ── Hàm thuần biến đổi bảng: lọc, ẩn không phát sinh, gom nhóm, sắp cột ──

export interface BienDoiOpts {
  loc?: Record<string, string[]>
  anKhongPS?: boolean
  nhom?: string[]
  tongHop?: boolean   // T289: gom nhóm xem dạng tổng hợp
  cot?: TuyChinhCot[]
  tinhLaiTong?: boolean
  khoa?: boolean
}

const soO = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim()) {
    return Number(v.replace(/\./g, '').replace(',', '.')) || 0
  }
  return 0
}

export function bienDoiBang(
  cols: Col[],
  rows: Row[],
  tc: BienDoiOpts,
  opts?: { tinhLaiTong?: boolean; khoa?: boolean },
): { cols: Col[]; rows: Row[] } {
  const tinhLaiTong = tc.tinhLaiTong ?? opts?.tinhLaiTong ?? false
  const khoa = tc.khoa ?? opts?.khoa ?? false
  const loc = tc.loc ?? {}
  const anKhongPS = tc.anKhongPS ?? false
  const nhom = !khoa && tc.nhom && tc.nhom.length > 0 ? tc.nhom.filter(Boolean) : []
  const cot = !khoa ? tc.cot : undefined

  // 1. Phân loại dòng
  const dongDau: Row[] = []
  const dongChiTiet: Row[] = []
  const dongTongCuoi: Row[] = []

  let daGapChiTiet = false
  for (const r of rows) {
    if (r._t) {
      dongTongCuoi.push({ ...r })
    } else if (r._b && !daGapChiTiet) {
      dongDau.push({ ...r })
    } else {
      daGapChiTiet = true
      dongChiTiet.push({ ...r })
    }
  }

  // 2. Lọc dòng chi tiết
  const keysLoc = Object.keys(loc).filter(k => loc[k] && loc[k].length > 0)
  const cotNum = cols.filter(c => c.num)

  const conLai = dongChiTiet.filter(r => {
    // Dòng tiêu đề nhóm sẵn có của mẫu sổ (vd "2. Ngành nghề") giữ lại; chỉ bỏ khi người dùng gom nhóm lại (T179)
    if (r._nhom) return nhom.length === 0

    // Lọc theo từng khoá loc
    for (const k of keysLoc) {
      const vals = loc[k]
      const rVal = String(r[k] ?? '')
      if (!vals.includes(rVal)) return false
    }

    // Ẩn dòng không phát sinh (bỏ qua cột đơn giá)
    if (anKhongPS && cotNum.length > 0) {
      const cotPS = cotNum.filter(c => c.k !== 'gia' && !c.t.includes('Đơn giá'))
      const coPS = (cotPS.length > 0 ? cotPS : cotNum).some(c => Math.abs(soO(r[c.k])) > 1e-9)
      if (!coPS) return false
    }

    return true
  })

  // 3. Biến đổi cột
  let colsMoi = [...cols]
  if (cot && cot.length > 0) {
    const colsMap = new Map(cols.map(c => [c.k, c]))
    const daDung = new Set<string>()
    const ds: Col[] = []

    for (const cSave of cot) {
      const cGoc = colsMap.get(cSave.k)
      if (!cGoc) continue
      daDung.add(cSave.k)
      if (cSave.an) continue
      const m: Col = { ...cGoc }
      if (cSave.ten) m.t = cSave.ten
      if (typeof cSave.rong === 'number') m.w = cSave.rong
      ds.push(m)
    }

    // Thêm các cột mới chưa có trong cấu hình lưu vào cuối
    for (const cGoc of cols) {
      if (!daDung.has(cGoc.k)) {
        ds.push(cGoc)
      }
    }

    // Luôn còn ít nhất 1 cột
    if (ds.length > 0) {
      colsMoi = ds
    } else if (cols.length > 0) {
      colsMoi = [cols[0]]
    }
  }

  // Cột chữ đầu tiên không bị ẩn để đặt nhãn nhóm
  const colChu = colsMoi.find(c => !c.num)?.k ?? colsMoi[0]?.k ?? 'ten'
  const tenCot = (k: string) => cols.find(c => c.k === k)?.t ?? k

  // Hàm tính tổng cột num (bỏ đơn giá) cho dòng cộng nhóm
  const tongNumNhom = (ds: Row[]) => {
    const res: Record<string, number> = {}
    for (const c of colsMoi) {
      if (c.num && c.k !== 'gia' && !c.t.includes('Đơn giá')) {
        res[c.k] = ds.reduce((acc, r) => acc + soO(r[c.k]), 0)
      }
    }
    return res
  }

  // 4a. Gom nhóm dạng tổng hợp (T289): mỗi nhóm một dòng, chỉ còn cột gom nhóm và cột số đã cộng; cấp 2, 3 thụt dưới cấp trên; dòng Tổng cộng cuối bảng
  if (nhom.length > 0 && tc.tongHop) {
    const cotNhom = nhom.map(k => cols.find(c => c.k === k)).filter((c): c is Col => !!c).map(c => ({ ...c, num: false, w: c.w && c.w > 180 ? c.w : 180 }))
    const cotSo = colsMoi.filter(c => c.num && !nhom.includes(c.k) && c.k !== 'gia' && !c.t.includes('Đơn giá'))
    const nhomTheo = (ds: Row[], k: string) => {
      const m = new Map<string, Row[]>()
      for (const r of ds) { const v = String(r[k] ?? ''); m.set(v, [...(m.get(v) ?? []), r]) }
      return m
    }
    const tongSo = (ds: Row[]) => Object.fromEntries(cotSo.map(c => [c.k, ds.reduce((a, r) => a + soO(r[c.k]), 0)]))
    const nhomCap = nhom.slice(0, 3)
    // Gom một cấp: giữ thêm cột chữ có cùng giá trị trong mọi nhóm (vd gom theo Mã hàng thì giữ Tên hàng, ĐVT) (T304)
    const nhom1 = nhomTheo(conLai, nhomCap[0])
    const cotKem = nhomCap.length > 1 ? [] : colsMoi.filter(c => !c.num && !c.chiManHinh && c.k !== nhomCap[0] && [...nhom1.values()].every(ds => ds.every(r => String(r[c.k] ?? '') === String(ds[0][c.k] ?? ''))))
    const dong: Row[] = []
    const deQuyTongHop = (ds: Row[], cap: number) => {
      const k = nhomCap[cap]
      const coCapDuoi = cap < nhomCap.length - 1
      for (const [val, subDs] of nhomTheo(ds, k)) {
        dong.push({
          [k]: val || '(Trống)',
          ...(cap === 0 && cotKem.length > 0 ? Object.fromEntries(cotKem.map(c => [c.k, subDs[0][c.k]])) : {}),
          ...tongSo(subDs),
          ...(coCapDuoi ? { _b: 1 } : {}),
          ...(cap > 0 ? { _i: cap } : {}),
        })
        if (coCapDuoi) {
          deQuyTongHop(subDs, cap + 1)
        }
      }
    }
    deQuyTongHop(conLai, 0)
    dong.push({ [cotNhom[0]?.k ?? nhomCap[0]]: 'Tổng cộng', ...tongSo(conLai), _t: 1 })
    return { cols: [...cotNhom, ...cotKem, ...cotSo], rows: dong }
  }

  // 4. Gom nhóm
  let rowsMoi: Row[] = []
  if (nhom.length > 0) {
    const nhomCap = nhom.slice(0, 3)
    const nhomTheo = (ds: Row[], k: string) => {
      const m = new Map<string, Row[]>()
      for (const r of ds) {
        const v = String(r[k] ?? '')
        let list = m.get(v)
        if (!list) {
          list = []
          m.set(v, list)
        }
        list.push(r)
      }
      return m
    }

    const deQuyChiTiet = (ds: Row[], cap: number) => {
      const k = nhomCap[cap]
      const coCapDuoi = cap < nhomCap.length - 1
      for (const [val, subDs] of nhomTheo(ds, k)) {
        // Tiêu đề nhóm
        rowsMoi.push({
          [colChu]: `${tenCot(k)}: ${val}`,
          _b: 1,
          ...(cap > 0 ? { _i: cap } : {}),
          _nhom: true,
        })

        if (coCapDuoi) {
          deQuyChiTiet(subDs, cap + 1)
        } else {
          rowsMoi.push(...subDs)
        }

        // Cộng nhóm
        rowsMoi.push({
          [colChu]: `Cộng ${val}`,
          ...tongNumNhom(subDs),
          _t: 1,
          ...(cap > 0 ? { _i: cap } : {}),
          _nhom: true,
        })
      }
    }

    deQuyChiTiet(conLai, 0)
  } else {
    rowsMoi = conLai
  }

  // 5. Tính lại dòng tổng cuối bảng nếu có lọc/ẩn và tinhLaiTong
  let dongTongSau = dongTongCuoi
  const daLoc = keysLoc.length > 0 || anKhongPS
  if (tinhLaiTong && daLoc && dongTongCuoi.length > 0) {
    dongTongSau = dongTongCuoi.map(tRow => {
      // Chỉ tính lại dòng tổng nếu là dòng tổng cộng
      const chu = Object.values(tRow).some(v => typeof v === 'string' && (v.includes('Tổng') || v.includes('Cộng')))
      if (!chu) return tRow
      const moi = { ...tRow }
      for (const c of cols) {
        if (c.num && c.k !== 'gia' && !c.t.includes('Đơn giá')) {
          moi[c.k] = conLai.reduce((acc, r) => acc + soO(r[c.k]), 0)
        }
      }
      return moi
    })
  }

  return {
    cols: colsMoi,
    rows: [...dongDau, ...rowsMoi, ...dongTongSau],
  }
}
