// Cách tính chi phí NVL ở trang chủ gói Free, chung cả công ty, chọn ở Hệ thống > Thông tin đơn vị (T767; trước đây chọn theo cửa hàng, T232):
// - kk: kiểm kê định kỳ, chi phí NVL = tồn đầu kỳ + mua trong tháng − tồn cuối kỳ theo phiếu kiểm kê cuối tháng
// - nhap: tổng chi phí mua hàng trong tháng, tức tổng tiền phiếu mua hàng (4.1.1) trong tháng, gồm cả thuế GTGT (PhuongXT chốt 14/10/2026)
// Đổi cách tính chỉ áp dụng từ tháng đầu chưa khoá sổ; tháng đã khoá giữ cách cũ.
import type { Session } from '../../app/session'
import { CUA_HANG, KHOA_SO_DEN, NVL, tongKy } from '../../data/mock'
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
/** Màn Thông tin đơn vị, nơi đổi cách tính chi phí NVL (T767) */
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

/** Một mặt hàng NVL trong tháng của cửa hàng (T768). Số lượng theo đơn vị tính, giá gần nhất là giá mua lần cuối.
 *  Kiểm kê định kỳ: sử dụng = tồn đầu + mua − tồn cuối (số lượng), giá vốn = sử dụng × giá gần nhất.
 *  Tổng chi phí mua hàng: giá vốn là tiền phiếu mua hàng của mặt hàng đó */
export interface NvlHang { ma: string; ten: string; dvt: string; gia: number; slDau: number; slMua: number; slCuoi: number; slDung: number; tien: number }

const sl1 = (x: number) => Math.round(x * 10) / 10
/** Làm tròn số lượng theo đơn vị tính: kg, lít lấy một số lẻ; lon, hộp, thùng lấy số nguyên */
const slDvt = (x: number, i: number) => ['kg', 'Lít'].includes(NVL[i].dvt) ? sl1(x) : Math.round(x)
/** Tỷ trọng tiền mua của từng mặt hàng ở cửa hàng (dữ liệu giả, cố định theo cửa hàng) */
const tyTrong = (cn: string) => {
  const w = NVL.map(h => between(rng(`nvl-w-${cn}-${h.ma}`), 0.4, 1.6))
  const c = w.reduce((a, x) => a + x, 0)
  return w.map(x => x / c)
}
/** Số lượng mua trong tháng của từng mặt hàng: chia tiền phiếu mua theo tỷ trọng rồi đổi ra số lượng theo giá gần nhất */
const slMuaKy = (cn: string, thang: number) => { const m = muaKy(cn, thang), w = tyTrong(cn); return NVL.map((h, i) => slDvt(m * w[i] / h.gia, i)) }
/** Số lượng tồn theo phiếu kiểm kê cuối tháng (dữ liệu giả). Tháng 6 lấy quanh 50% lượng mua tháng 7; các tháng sau còn 35–45% của tồn đầu cộng mua */
function slTonKk(cn: string, thang: number, nam = NAM): number[] {
  const k = `${cn}-${nam}-${thang}`
  const c = TON_KK.get(k); if (c) return c
  const kq = thang <= 6
    ? slMuaKy(cn, 7).map((x, i) => slDvt(x * between(rng(`ton-kk-${cn}-${nam}-6-${NVL[i].ma}`), 0.4, 0.6), i))
    : (() => { const dau = slTonKk(cn, thang - 1, nam), mua = slMuaKy(cn, thang)
      return NVL.map((h, i) => slDvt((dau[i] + mua[i]) * between(rng(`ton-kk-${cn}-${nam}-${thang}-${h.ma}`), 0.35, 0.45), i)) })()
  TON_KK.set(k, kq)
  return kq
}
const TON_KK = new Map<string, number[]>()

/** Danh sách mặt hàng NVL trong tháng của các cửa hàng (cns rỗng là mọi cửa hàng), cộng số lượng các cửa hàng */
export function nvlHangKy(s: SNvl, cns: string[], thang: number): NvlHang[] {
  const cach = cachNvlCua(s, thang)
  const ds = cns.length ? cns : CUA_HANG.map(c => c.id)
  const cong = (f: (cn: string) => number[]) => ds.reduce((a, cn) => { const v = f(cn); return a.map((x, i) => x + v[i]) }, NVL.map(() => 0))
  const mua = cong(cn => slMuaKy(cn, thang))
  // Tổng chi phí mua hàng: chia tiền phiếu mua theo tỷ trọng, mặt hàng cuối nhận phần lẻ cho khớp tổng
  const tienMua = cong(cn => { const m = muaKy(cn, thang), w = tyTrong(cn), t = w.map(x => Math.round(m * x)); t[t.length - 1] += m - t.reduce((a, x) => a + x, 0); return t })
  const dau = cach === 'kk' ? cong(cn => slTonKk(cn, thang - 1)) : NVL.map(() => 0)
  const cuoi = cach === 'kk' ? cong(cn => slTonKk(cn, thang)) : NVL.map(() => 0)
  return NVL.map((h, i) => {
    const slDung = sl1(dau[i] + mua[i] - cuoi[i])
    return { ma: h.ma, ten: h.ten, dvt: h.dvt, gia: h.gia, slDau: sl1(dau[i]), slMua: sl1(mua[i]), slCuoi: sl1(cuoi[i]), slDung,
      tien: cach === 'kk' ? Math.round(slDung * h.gia) : tienMua[i] }
  })
}

export interface NvlCn { cn: string; ten: string; cach: CachNvl; tien: number; dt: number; tonDau?: number; mua: number; tonCuoi?: number }

/** Chi phí NVL một cửa hàng trong tháng theo cách tính của công ty ở tháng đó */
export function nvlCuaHang(s: SNvl, cn: string, thang: number): NvlCn {
  const cach = cachNvlCua(s, thang)
  const mua = muaKy(cn, thang)
  const ten = CUA_HANG.find(c => c.id === cn)?.ten ?? cn
  const dt = tongKy(thang, NAM, cn).dt
  if (cach === 'nhap') return { cn, ten, cach, tien: mua, dt, mua }
  // Kiểm kê định kỳ: cộng từ mặt hàng, mỗi số = số lượng × giá gần nhất (T768)
  const hang = nvlHangKy(s, [cn], thang)
  const tien = (f: (h: NvlHang) => number) => Math.round(hang.reduce((a, h) => a + f(h) * h.gia, 0))
  const tonDau = tien(h => h.slDau), muaKk = tien(h => h.slMua), tonCuoi = tien(h => h.slCuoi)
  return { cn, ten, cach, tien: hang.reduce((a, h) => a + h.tien, 0), dt, tonDau, mua: muaKk, tonCuoi }
}

/** Chi phí NVL cộng các cửa hàng; cns rỗng là mọi cửa hàng */
export function nvlKy(s: SNvl, cns: string[], thang: number) {
  const ds = (cns.length ? cns : CUA_HANG.map(c => c.id)).map(cn => nvlCuaHang(s, cn, thang))
  const cong = (f: (x: NvlCn) => number | undefined) => ds.reduce((a, x) => a + (f(x) ?? 0), 0)
  return { tien: cong(x => x.tien), ds, cach: cachNvlCua(s, thang), tonDau: cong(x => x.tonDau), mua: cong(x => x.mua), tonCuoi: cong(x => x.tonCuoi) }
}

/** Dòng phụ dưới Chi phí NVL: tính theo cách nào (một cách chung cả công ty) */
export function moTaCach(cach: CachNvl) {
  const t = CACH_NVL[cach].theo
  return t[0].toUpperCase() + t.slice(1)
}
