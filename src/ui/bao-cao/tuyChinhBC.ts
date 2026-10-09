// Trạng thái lọc và tuỳ chỉnh báo cáo (kế hoạch mục 6, 10, T47). Lưu tuỳ chỉnh theo đơn vị, hàm thuần biến đổi bảng.
import { useSyncExternalStore } from 'react'
import type { Col, Row } from '../../modules/types'
import type { OKy } from '../generic/ReportScreen'

export interface TuyChinhCot {
  k: string
  ten?: string
  an?: boolean
  rong?: number
}

export interface TuyChinhLuu {
  cot?: TuyChinhCot[]
  nhom?: string[]
  coChu?: number
  ky?: OKy[]
}

export interface BanLoc {
  loc: Record<string, string[]>
  anKhongPS: boolean
  ky: string
}

export interface TrangThaiLoc {
  loc: Record<string, string[]>
  anKhongPS: boolean
  ky: string
  daXem: BanLoc
  nhap: BanLoc
  coThayDoi: boolean
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
  if (nhap.anKhongPS !== daXem.anKhongPS) return true
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
    const defaultBan: BanLoc = { loc: {}, anKhongPS: false, ky: '9' }
    s = {
      loc: {},
      anKhongPS: false,
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

export function datKyMacDinh(path: string, ky: string) {
  const s = layTrangThai(path)
  if (s.daXem.ky === ky && s.nhap.ky === ky) return
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

export function datAnKhongPS(path: string, v: boolean) {
  const s = layTrangThai(path)
  const nhapMoi: BanLoc = { ...s.nhap, anKhongPS: v }
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
  const nhapMoi: BanLoc = { ...s.nhap, loc: {}, anKhongPS: false }
  const thayDoi = coThayDoiLoc(nhapMoi, s.daXem)
  khoPath.set(path, { ...s, nhap: nhapMoi, coThayDoi: thayDoi })
  phatSong()
}

export function xemBaoCao(path: string) {
  const s = layTrangThai(path)
  const daXemMoi: BanLoc = {
    loc: { ...s.nhap.loc },
    anKhongPS: s.nhap.anKhongPS,
    ky: s.nhap.ky,
  }
  khoPath.set(path, {
    ...s,
    daXem: daXemMoi,
    loc: daXemMoi.loc,
    anKhongPS: daXemMoi.anKhongPS,
    ky: daXemMoi.ky,
    coThayDoi: false,
  })
  phatSong()
  window.dispatchEvent(new CustomEvent('bc-da-xem', { detail: { path, ky: daXemMoi.ky } }))
}

export function useTrangThaiLoc(path: string): TrangThaiLoc {
  return useSyncExternalStore(subscribe, () => layTrangThai(path))
}

// ── Lưu trữ localStorage: bc-tuy-chinh:<donVi>:<mã> ──

const khoaLuu = (donVi: string, ma: string) => `bc-tuy-chinh:${donVi}:${ma}`
const boNhoTuyChinh = new Map<string, { raw: string | null; val: TuyChinhLuu | null }>()

export function docTuyChinh(donVi: string, ma?: string): TuyChinhLuu | null {
  if (!donVi || !ma) return null
  const k = khoaLuu(donVi, ma)
  try {
    const raw = localStorage.getItem(k)
    const cu = boNhoTuyChinh.get(k)
    if (cu && cu.raw === raw) return cu.val
    if (!raw) {
      boNhoTuyChinh.set(k, { raw: null, val: null })
      return null
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

export function useTuyChinhBC(donVi: string, ma?: string): TuyChinhLuu | null {
  return useSyncExternalStore(subscribe, () => docTuyChinh(donVi, ma))
}

// ── Hàm thuần biến đổi bảng: lọc, ẩn không phát sinh, gom nhóm, sắp cột ──

export interface BienDoiOpts {
  loc?: Record<string, string[]>
  anKhongPS?: boolean
  nhom?: string[]
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
    // Bỏ qua dòng tiêu đề nhóm hoặc phân cách sẵn có nếu có
    if (r._nhom) return false

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

  // 4. Gom nhóm
  let rowsMoi: Row[] = []
  if (nhom.length > 0) {
    const k1 = nhom[0]
    const k2 = nhom.length > 1 ? nhom[1] : null

    // Gom ổn định cấp 1 theo thứ tự xuất hiện
    const nhom1Map = new Map<string, Row[]>()
    for (const r of conLai) {
      const v1 = String(r[k1] ?? '')
      let list = nhom1Map.get(v1)
      if (!list) {
        list = []
        nhom1Map.set(v1, list)
      }
      list.push(r)
    }

    for (const [val1, ds1] of nhom1Map) {
      // Tiêu đề nhóm 1
      rowsMoi.push({ [colChu]: `${tenCot(k1)}: ${val1}`, _b: 1, _nhom: true })

      if (k2) {
        // Gom ổn định cấp 2
        const nhom2Map = new Map<string, Row[]>()
        for (const r of ds1) {
          const v2 = String(r[k2] ?? '')
          let list = nhom2Map.get(v2)
          if (!list) {
            list = []
            nhom2Map.set(v2, list)
          }
          list.push(r)
        }

        for (const [val2, ds2] of nhom2Map) {
          rowsMoi.push({ [colChu]: `${tenCot(k2)}: ${val2}`, _b: 1, _i: 1, _nhom: true })
          rowsMoi.push(...ds2)
          rowsMoi.push({ [colChu]: `Cộng ${val2}`, ...tongNumNhom(ds2), _t: 1, _i: 1, _nhom: true })
        }
      } else {
        rowsMoi.push(...ds1)
      }

      // Cộng nhóm 1
      rowsMoi.push({ [colChu]: `Cộng ${val1}`, ...tongNumNhom(ds1), _t: 1, _nhom: true })
    }
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
