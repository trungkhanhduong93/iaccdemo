// Cách tính giá vốn NVL ở trang chủ gói Free, chung cả công ty, chọn ở Hệ thống > Thông tin đơn vị (T767; trước đây chọn theo cửa hàng, T232):
// - kk: kiểm kê định kỳ, giá vốn NVL = tồn đầu kỳ + mua trong tháng − tồn cuối kỳ theo phiếu kiểm kê cuối tháng
// - nhap: tổng chi phí mua hàng trong tháng, tức tổng tiền phiếu mua hàng (4.1.1) trong tháng, gồm cả thuế GTGT (PhuongXT chốt 14/10/2026)
// Đổi cách tính chỉ áp dụng từ tháng đầu chưa khoá sổ; tháng đã khoá giữ cách cũ.
import type { Session } from '../../app/session'
import { CUA_HANG, KHOA_SO_DEN, tongKy } from '../../data/mock'
import { between, rng } from '../../ui/format'
import { chungTu } from '../../ui/generic/gen'
import { PHIEU_MUA } from '../mua-hang/bao-cao'

export type CachNvl = 'kk' | 'nhap'
/** Một lần đặt cách tính: áp dụng từ kỳ tu (yyyymm) cho tới lần đặt sau */
export interface LichCachNvl { tu: number; cach: CachNvl }

export const CACH_NVL: Record<CachNvl, { ten: string; theo: string; mota: string }> = {
  kk: { ten: 'Kiểm kê định kỳ', theo: 'theo kiểm kê định kỳ', mota: 'Tồn đầu kỳ + Mua trong tháng − Tồn cuối kỳ theo kiểm kê cuối tháng' },
  nhap: { ten: 'Tổng chi phí mua hàng trong tháng', theo: 'theo tổng chi phí mua hàng', mota: 'Tổng tiền phiếu mua hàng trong tháng, gồm thuế GTGT' },
}
export const DS_CACH_NVL = (Object.keys(CACH_NVL) as CachNvl[]).map(v => ({ v, t: CACH_NVL[v].ten }))
/** Màn Thông tin đơn vị, nơi đổi cách tính giá vốn NVL (T767) */
export const DI_DOI_CACH_NVL = '/app/he-thong/thong-tin'

const NAM = 2026
const kySo = (thang: number, nam = NAM) => nam * 100 + thang
/** Kỳ đầu tiên chưa khoá sổ (yyyymm): đổi cách tính áp dụng từ kỳ này */
export const kyDauChuaKhoa = () => KHOA_SO_DEN.thang === 12 ? kySo(1, KHOA_SO_DEN.nam + 1) : kySo(KHOA_SO_DEN.thang + 1, KHOA_SO_DEN.nam)
export const daKhoaThang = (thang: number, nam = NAM) => kySo(thang, nam) < kyDauChuaKhoa()
export const tenKy = (ky: number) => `${ky % 100}/${Math.floor(ky / 100)}`

type SNvl = Pick<Session, 'donVi' | 'cachNvlDv'>

/** Cách tính của công ty ở một tháng; chưa đặt thì theo kiểm kê định kỳ */
export function cachNvlCua(s: SNvl, thang: number, nam = NAM): CachNvl {
  const ky = kySo(thang, nam)
  const lich = (s.cachNvlDv?.[s.donVi] ?? []).filter(x => x.cach in CACH_NVL)
  return [...lich].filter(x => x.tu <= ky).sort((a, b) => b.tu - a.tu)[0]?.cach ?? 'kk'
}
/** Cách tính hiện tại của công ty, tức cách áp dụng cho kỳ đầu chưa khoá sổ */
export const cachNvlHienTai = (s: SNvl) => { const ky = kyDauChuaKhoa(); return cachNvlCua(s, ky % 100, Math.floor(ky / 100)) }

/** Đặt cách tính mới cho cả công ty từ kỳ đầu chưa khoá sổ; các lần đặt từ kỳ đó trở đi bị thay */
export function datCachNvl(s: SNvl, cach: CachNvl): Pick<Session, 'cachNvlDv'> {
  const tu = kyDauChuaKhoa()
  const cu = (s.cachNvlDv?.[s.donVi] ?? []).filter(x => x.tu < tu)
  return { cachNvlDv: { ...s.cachNvlDv, [s.donVi]: [...cu, { tu, cach }] } }
}

/** Phiếu mua hàng trong tháng của cửa hàng (theo tên cửa hàng như danh sách phiếu mua) */
export function phieuMuaKy(cn: string, thang: number) {
  const ten = CUA_HANG.find(c => c.id === cn)?.ten
  return chungTu(PHIEU_MUA, '4.1.1').filter(r => Number(r.thang) === thang && r.cn === ten)
}
const muaKy = (cn: string, thang: number) => phieuMuaKy(cn, thang).reduce((a, r) => a + (Number(r.tong) || 0), 0)

/** Giá trị NVL tồn kho theo phiếu kiểm kê cuối tháng của cửa hàng (dữ liệu giả, làm tròn nghìn đồng).
 *  Tháng 6 lấy quanh 40% giá vốn tháng 7; các tháng sau còn lại 55–75% của tồn đầu cộng mua trong tháng */
export function tonKiemKe(cn: string, thang: number, nam = NAM): number {
  if (thang <= 6) return Math.round(tongKy(7, nam, cn).gv * between(rng(`ton-kk-${cn}-${nam}-6`), 0.36, 0.44) / 1000) * 1000
  const coSan = tonKiemKe(cn, thang - 1, nam) + muaKy(cn, thang)
  return Math.round(coSan * between(rng(`ton-kk-${cn}-${nam}-${thang}`), 0.55, 0.75) / 1000) * 1000
}

export interface NvlCn { cn: string; ten: string; cach: CachNvl; tien: number; dt: number; tonDau?: number; mua: number; tonCuoi?: number }

/** Giá vốn NVL một cửa hàng trong tháng theo cách tính của công ty ở tháng đó */
export function nvlCuaHang(s: SNvl, cn: string, thang: number): NvlCn {
  const cach = cachNvlCua(s, thang)
  const mua = muaKy(cn, thang)
  const ten = CUA_HANG.find(c => c.id === cn)?.ten ?? cn
  const dt = tongKy(thang, NAM, cn).dt
  if (cach === 'nhap') return { cn, ten, cach, tien: mua, dt, mua }
  const tonDau = tonKiemKe(cn, thang - 1), tonCuoi = tonKiemKe(cn, thang)
  return { cn, ten, cach, tien: tonDau + mua - tonCuoi, dt, tonDau, mua, tonCuoi }
}

/** Giá vốn NVL cộng các cửa hàng; cns rỗng là mọi cửa hàng */
export function nvlKy(s: SNvl, cns: string[], thang: number) {
  const ds = (cns.length ? cns : CUA_HANG.map(c => c.id)).map(cn => nvlCuaHang(s, cn, thang))
  const cong = (f: (x: NvlCn) => number | undefined) => ds.reduce((a, x) => a + (f(x) ?? 0), 0)
  return { tien: cong(x => x.tien), ds, cach: cachNvlCua(s, thang), tonDau: cong(x => x.tonDau), mua: cong(x => x.mua), tonCuoi: cong(x => x.tonCuoi) }
}

/** Dòng phụ dưới Giá vốn NVL: tính theo cách nào (một cách chung cả công ty) */
export function moTaCach(cach: CachNvl) {
  const t = CACH_NVL[cach].theo
  return t[0].toUpperCase() + t.slice(1)
}
