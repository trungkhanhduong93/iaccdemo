// Bộ lọc Kho, Hàng hoá, Nhóm hàng hoá, Đối tượng của báo cáo mua hàng, bán hàng, kho (T207).
// Lọc trên từng phiếu, từng dòng hàng trước khi cộng, nên báo cáo gộp theo ngày, nhà cung cấp, mặt hàng vẫn đúng số.
// File dữ liệu: chỉ import mock, không import index.ts nào
import { CUA_HANG, HANG, HANG_SX, KHACH, NCC, NVL } from '../../data/mock'

export interface LocNguon { kho: string[]; hang: string[]; nhom: string[]; dt: string[]; kenh: string[] }

/** Khoá bộ lọc trong store báo cáo; khung lọc chung giữ dòng nhờ dòng mang sẵn giá trị đang lọc (ganLocNguon) */
export const KHOA_LOC_NGUON = { kho: 'locKho', hang: 'locHang', nhom: 'locNhomHang', dt: 'locDt', kenh: 'locKenh' } as const

export const docLocNguon = (loc: Record<string, string[]> = {}): LocNguon => ({
  kho: loc[KHOA_LOC_NGUON.kho] ?? [], hang: loc[KHOA_LOC_NGUON.hang] ?? [], nhom: loc[KHOA_LOC_NGUON.nhom] ?? [], dt: loc[KHOA_LOC_NGUON.dt] ?? [],
  kenh: loc[KHOA_LOC_NGUON.kenh] ?? [],
})

const DM_HANG = [...NVL, ...HANG, ...HANG_SX]
/** Nhóm hàng hoá theo mã hàng, lấy ở danh mục hàng hoá */
export const nhomCuaMa = (ma: string) => DM_HANG.find(h => h.ma === ma)?.nhom ?? ''

const khop = (ds: string[], v: string) => ds.length === 0 || ds.includes(v)
/** Dòng hàng qua bộ lọc kho, hàng hoá, nhóm hàng hoá (bỏ trống là không lọc) */
export const quaLocDong = (f: LocNguon, d: { kho?: string; ten: string; ma: string }) =>
  khop(f.kho, d.kho ?? '') && khop(f.hang, d.ten) && khop(f.nhom, nhomCuaMa(d.ma))
export const quaLocDt = (f: LocNguon, dt: string) => khop(f.dt, dt)
export const quaLocKenh = (f: LocNguon, kenh: string) => khop(f.kenh, kenh)

/** Dòng chi tiết mang giá trị đang lọc để khung lọc chung (bienDoiBang) không bỏ dòng */
export function ganLocNguon(rows: Record<string, any>[], loc: Record<string, string[]> = {}) {
  const gan = Object.fromEntries(Object.values(KHOA_LOC_NGUON).filter(k => (loc[k] ?? []).length > 0).map(k => [k, loc[k][0]]))
  return Object.keys(gan).length === 0 ? rows : rows.map(r => (r._t ? r : { ...r, ...gan }))
}

const tenDs = (ds: { ten: string; nhom: string }[]) => ({ ten: [...new Set(ds.map(h => h.ten))], nhom: [...new Set(ds.map(h => h.nhom))] })
const MUA = tenDs(NVL)
const KHO_HANG = tenDs([...NVL, ...HANG_SX, ...HANG.filter(h => h.tonKho)])
const BAN = tenDs(HANG)

type Loc = { k: string; nhan: string; kieu: 'chon' | 'chonNhieu'; ds: (cnId?: string) => string[] }
/** Kho của cửa hàng đang chọn trên thanh trên, xem tất cả cửa hàng thì mọi kho */
const LOC_KHO: Loc = { k: KHOA_LOC_NGUON.kho, nhan: 'Kho', kieu: 'chonNhieu', ds: id => CUA_HANG.filter(c => !id || c.id === id).flatMap(c => c.kho) }
const locHang = (ds: string[]): Loc => ({ k: KHOA_LOC_NGUON.hang, nhan: 'Hàng hoá', kieu: 'chonNhieu', ds: () => ds })
const locNhom = (ds: string[]): Loc => ({ k: KHOA_LOC_NGUON.nhom, nhan: 'Nhóm hàng hoá', kieu: 'chonNhieu', ds: () => ds })

/** Mua hàng: kho, hàng hoá, nhóm hàng hoá, đối tượng (nhà cung cấp); nhãn Đối tượng trùng bộ lọc tự sinh từ cột nên chỉ hiện một */
export const LOC_MUA: Loc[] = [LOC_KHO, locHang(MUA.ten), locNhom(MUA.nhom), { k: KHOA_LOC_NGUON.dt, nhan: 'Đối tượng', kieu: 'chonNhieu', ds: () => NCC.map(n => n.ten) }]
/** Kênh bán của chứng từ Xuất bán POS, như KENH ở ban-hang/ChungTuBanHang.tsx (file này không import phân hệ) */
const LOC_KENH: Loc = { k: KHOA_LOC_NGUON.kenh, nhan: 'Kênh bán', kieu: 'chonNhieu', ds: () => ['Tại quán', 'Mang về', 'App giao đồ ăn'] }
/** Bán hàng: kênh bán (T457), hàng hoá, nhóm hàng hoá, đối tượng; không lọc kho vì dòng món của đơn POS không ghi kho xuất (PhuongXT chốt 14/10/2026) */
export const LOC_BAN: Loc[] = [LOC_KENH, locHang(BAN.ten), locNhom(BAN.nhom), { k: KHOA_LOC_NGUON.dt, nhan: 'Đối tượng', kieu: 'chonNhieu', ds: () => KHACH.map(n => n.ten) }]
/** Kho: kho, hàng hoá, nhóm hàng hoá; hàng gồm nguyên vật liệu, hàng sơ chế và hàng bán theo dõi tồn kho */
export const LOC_KHO_BC: Loc[] = [LOC_KHO, locHang(KHO_HANG.ten), locNhom(KHO_HANG.nhom)]
