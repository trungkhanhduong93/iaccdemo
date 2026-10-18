// Cách tính chi phí NVL gói Free theo từng cửa hàng (T232), chọn ở Danh mục cửa hàng:
// - ivt: tổng giá thành món trên iPOS Inventory + chi phí NVL tiêu hao (xuất huỷ + xuất điều chỉnh − nhập điều chỉnh)
// - tay: món bán trong kỳ × giá thành người dùng tự nhập ở màn Chi phí NVL
// - nhap: tổng tiền phiếu nhập mua (4.1.1) trong tháng, gồm cả thuế GTGT (PhuongXT chốt 14/10/2026)
// Đổi cách tính chỉ áp dụng từ tháng đầu chưa khoá sổ; tháng đã khoá giữ cách cũ.
import type { Session } from '../../app/session'
import { CUA_HANG, HANG, KHOA_SO_DEN, tongKy } from '../../data/mock'
import { between, rng } from '../../ui/format'
import { chungTu } from '../../ui/generic/gen'
import { PHIEU_MUA } from '../mua-hang/bao-cao'
import { timMan } from '../../app/registry'
import { mauDieuChinh } from '../kho/dieu-chinh'
import type { Row } from '../types'

export type CachNvl = 'ivt' | 'tay' | 'nhap'
/** Một lần đặt cách tính: áp dụng từ kỳ tu (yyyymm) cho tới lần đặt sau */
export interface LichCachNvl { tu: number; cach: CachNvl }

export const CACH_NVL: Record<CachNvl, { ten: string; theo: string; mota: string }> = {
  ivt: { ten: 'Giá thành iPOS Inventory', theo: 'theo giá thành iPOS Inventory', mota: 'Tổng giá thành iPOS Inventory + Chi phí NVL tiêu hao' },
  tay: { ten: 'Giá thành nhập tay', theo: 'theo giá thành nhập tay', mota: 'Số lượng món bán × giá thành tự nhập cho từng món' },
  nhap: { ten: 'Tổng chi phí NVL trong tháng', theo: 'theo phiếu nhập mua', mota: 'Tổng tiền phiếu nhập mua hàng hoá trong tháng, gồm thuế GTGT' },
}
export const DS_CACH_NVL = (Object.keys(CACH_NVL) as CachNvl[]).map(v => ({ v, t: CACH_NVL[v].ten }))

const NAM = 2026
const kySo = (thang: number, nam = NAM) => nam * 100 + thang
/** Kỳ đầu tiên chưa khoá sổ (yyyymm): đổi cách tính áp dụng từ kỳ này */
export const kyDauChuaKhoa = () => KHOA_SO_DEN.thang === 12 ? kySo(1, KHOA_SO_DEN.nam + 1) : kySo(KHOA_SO_DEN.thang + 1, KHOA_SO_DEN.nam)
export const daKhoaThang = (thang: number, nam = NAM) => kySo(thang, nam) < kyDauChuaKhoa()
export const tenKy = (ky: number) => `${ky % 100}/${Math.floor(ky / 100)}`

type SNvl = Pick<Session, 'donVi' | 'cachNvl' | 'giaThanhTay'>

/** Cách tính của cửa hàng ở một tháng; chưa đặt thì theo iPOS Inventory */
export function cachNvlCua(s: SNvl, cn: string, thang: number, nam = NAM): CachNvl {
  const ky = kySo(thang, nam)
  const lich = s.cachNvl?.[s.donVi]?.[cn] ?? []
  return [...lich].filter(x => x.tu <= ky).sort((a, b) => b.tu - a.tu)[0]?.cach ?? 'ivt'
}
/** Cách tính hiện tại của cửa hàng, tức cách áp dụng cho kỳ đầu chưa khoá sổ */
export const cachNvlHienTai = (s: SNvl, cn: string) => { const ky = kyDauChuaKhoa(); return cachNvlCua(s, cn, ky % 100, Math.floor(ky / 100)) }

/** Đặt cách tính mới cho cửa hàng từ kỳ đầu chưa khoá sổ; các lần đặt từ kỳ đó trở đi bị thay */
export function datCachNvl(s: SNvl, cn: string, cach: CachNvl): Pick<Session, 'cachNvl'> {
  const tu = kyDauChuaKhoa()
  const cu = (s.cachNvl?.[s.donVi]?.[cn] ?? []).filter(x => x.tu < tu)
  return { cachNvl: { ...s.cachNvl, [s.donVi]: { ...s.cachNvl?.[s.donVi], [cn]: [...cu, { tu, cach }] } } }
}

/** Món bán trong tháng của cửa hàng: số lượng từng món theo tỷ trọng ngẫu nhiên cố định, sao cho số lượng × giá bán cộng lại bằng doanh thu tháng */
export function monBanKy(cn: string, thang: number, nam = NAM) {
  const dt = tongKy(thang, nam, cn).dt
  const r = rng(`mon-ban-${cn}-${nam}-${thang}`)
  const ty = HANG.map(() => between(r, 0.4, 1.6))
  const tong = HANG.reduce((a, h, i) => a + ty[i] * h.gia, 0)
  return HANG.map((h, i) => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, sl: Math.round(dt * ty[i] / tong) })).filter(m => m.sl > 0)
}

/** Giá thành món iPOS Inventory trong tháng (đồng, làm tròn): tỷ lệ giá vốn từng món quanh 28–42% giá bán,
 *  chỉnh chung một hệ số để số lượng × giá thành cộng lại sát giá vốn xuất bán POS của cửa hàng trong tháng */
export function giaThanhIvt(cn: string, thang: number, nam = NAM): Map<string, number> {
  const mon = monBanKy(cn, thang, nam)
  const r = rng(`gia-thanh-ivt-${cn}-${nam}-${thang}`)
  const tho = new Map(mon.map(m => [m.ma, (HANG.find(h => h.ma === m.ma)?.gia ?? 0) * between(r, 0.28, 0.42)]))
  const tong = mon.reduce((a, m) => a + m.sl * (tho.get(m.ma) ?? 0), 0)
  const he = tong ? tongKy(thang, nam, cn).gv / tong : 0
  return new Map(mon.map(m => [m.ma, Math.round((tho.get(m.ma) ?? 0) * he)]))
}

const khoaGia = (cn: string, thang: number, ma: string, nam = NAM) => `${cn}-${kySo(thang, nam)}-${ma}`
export const giaThanhTayCua = (s: SNvl, cn: string, thang: number, ma: string) => s.giaThanhTay?.[s.donVi]?.[khoaGia(cn, thang, ma)]
export function datGiaThanhTay(s: SNvl, cn: string, thang: number, ma: string, gia: number | undefined): Pick<Session, 'giaThanhTay'> {
  const cu = { ...s.giaThanhTay?.[s.donVi] }
  if (gia === undefined) delete cu[khoaGia(cn, thang, ma)]
  else cu[khoaGia(cn, thang, ma)] = gia
  return { giaThanhTay: { ...s.giaThanhTay, [s.donVi]: cu } }
}

/** Phiếu nhập mua trong tháng của cửa hàng (theo tên cửa hàng như danh sách phiếu mua) */
export function phieuMuaKy(cn: string, thang: number) {
  const ten = CUA_HANG.find(c => c.id === cn)?.ten
  return chungTu(PHIEU_MUA, '4.1.1').filter(r => Number(r.thang) === thang && r.cn === ten)
}

/** Chi phí NVL tiêu hao trong tháng của cửa hàng: xuất huỷ + xuất điều chỉnh − nhập điều chỉnh (phiếu điều chỉnh sinh từ kiểm kê).
 *  Phiếu nhập điều chỉnh mang số âm để cộng thẳng ra tổng */
export function tieuHaoKy(cn: string, thang: number) {
  const ten = CUA_HANG.find(c => c.id === cn)?.ten
  const trong = (r: Row) => Number(r.thang) === thang && r.cn === ten
  const cfgHuy = timMan('kho', '5-1-2-3').sc?.voucher
  const cfgKk = timMan('kho', '5-1-10').sc?.voucher
  const huy = cfgHuy ? chungTu(cfgHuy, '5.1.2-3').filter(trong).map(r => ({ ...r, tenLoai: 'Xuất huỷ', gt: Number(r.tong) || 0 })) : []
  const dc = cfgKk ? mauDieuChinh(cfgKk).filter(trong).map(r => ({ ...r, gt: (r.loai === 'ndc' ? -1 : 1) * (Number(r.tong) || 0) })) : []
  const ds: (Row & { gt: number })[] = [...huy, ...dc]
  ds.sort((a, b) => String(a.ngay).split('/').reverse().join('').localeCompare(String(b.ngay).split('/').reverse().join('')))
  const cong = (f: (r: Row) => boolean) => ds.filter(f).reduce((a, r) => a + r.gt, 0)
  return { ds, huy: cong(r => r.tenLoai === 'Xuất huỷ'), xdc: cong(r => r.loai === 'xdc'), ndc: -cong(r => r.loai === 'ndc'), tong: ds.reduce((a, r) => a + r.gt, 0) }
}

export interface NvlCn { cn: string; ten: string; cach: CachNvl; tien: number; dt: number; thieuGia: number; gtMon?: number; tieuHao?: number }

/** Chi phí NVL một cửa hàng trong tháng theo cách tính của cửa hàng ở tháng đó */
export function nvlCuaHang(s: SNvl, cn: string, thang: number): NvlCn {
  const cach = cachNvlCua(s, cn, thang)
  const t = tongKy(thang, NAM, cn)
  let tien = t.gv, thieuGia = 0, gtMon: number | undefined, tieuHao: number | undefined
  if (cach === 'ivt') {
    const gt = giaThanhIvt(cn, thang)
    gtMon = monBanKy(cn, thang).reduce((a, m) => a + m.sl * (gt.get(m.ma) ?? 0), 0)
    tieuHao = tieuHaoKy(cn, thang).tong
    tien = gtMon + tieuHao
  } else if (cach === 'tay') {
    const mon = monBanKy(cn, thang)
    tien = mon.reduce((a, m) => a + m.sl * (giaThanhTayCua(s, cn, thang, m.ma) ?? 0), 0)
    thieuGia = mon.filter(m => giaThanhTayCua(s, cn, thang, m.ma) === undefined).length
  } else if (cach === 'nhap') {
    tien = phieuMuaKy(cn, thang).reduce((a, r) => a + (Number(r.tong) || 0), 0)
  }
  return { cn, ten: CUA_HANG.find(c => c.id === cn)?.ten ?? cn, cach, tien, dt: t.dt, thieuGia, gtMon, tieuHao }
}

/** Chi phí NVL cộng các cửa hàng, mỗi cửa hàng theo cách riêng; cns rỗng là mọi cửa hàng */
export function nvlKy(s: SNvl, cns: string[], thang: number) {
  const ds = (cns.length ? cns : CUA_HANG.map(c => c.id)).map(cn => nvlCuaHang(s, cn, thang))
  const cach = [...new Set(ds.map(x => x.cach))]
  return { tien: ds.reduce((a, x) => a + x.tien, 0), ds, cach: cach.length === 1 ? cach[0] : undefined as CachNvl | undefined }
}

/** Dòng phụ dưới Chi phí NVL: tính theo cách nào; nhiều cách thì đếm cửa hàng mỗi cách */
export function moTaCach(ds: NvlCn[]) {
  const dem = new Map<CachNvl, number>()
  ds.forEach(x => dem.set(x.cach, (dem.get(x.cach) ?? 0) + 1))
  if (dem.size === 1) { const t = CACH_NVL[ds[0].cach].theo; return t[0].toUpperCase() + t.slice(1) }
  return [...dem].map(([c, n]) => `${n} cửa hàng ${CACH_NVL[c].theo}`).join(', ')
}

/** Mô tả ngắn một dòng ở thẻ Kết quả kinh doanh trang chủ (T390): một cách tính thì ghi cách đó, nhiều cách thì đếm */
export function moTaCachNgan(ds: NvlCn[]) {
  const dem = new Set(ds.map(x => x.cach))
  return dem.size === 1 ? moTaCach(ds) : `${ds.length} cửa hàng, ${dem.size} cách tính`
}
