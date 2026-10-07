// Thứ tự phân hệ trên sidebar. Thêm phân hệ mới: tạo thư mục trong src/modules rồi thêm vào đây.
// Phân hệ có quyTrinh được thêm tab Quy trình đứng đầu; có màn báo cáo thì thêm tab Báo cáo đứng cuối.
import type { ModuleDef, ScreenDef } from '../modules/types'
import { FEATURE, coTrongGoi, coMotTrong, type Goi } from './plan'
import home from '../modules/home'
import danhMuc from '../modules/danh-muc'
import tien from '../modules/tien'
import banHang from '../modules/ban-hang'
import muaHang from '../modules/mua-hang'
import kho from '../modules/kho'
import thue from '../modules/thue'
import tscd from '../modules/tscd'
import ccdc from '../modules/ccdc'
import giaThanh from '../modules/gia-thanh'
import tongHop from '../modules/tong-hop'
import tienIch from '../modules/tien-ich'
import heThong from '../modules/he-thong'

/** Màn thuộc tab Báo cáo: nhóm Excel có chữ "báo cáo", trừ màn khai tab: true */
export function laBaoCao(sc: ScreenDef) {
  if (sc.kind === 'quytrinh' || sc.kind === 'baocao') return false
  return sc.tab === undefined ? /báo cáo/i.test(sc.nhom ?? '') : !sc.tab
}

function dung(m: ModuleDef): ModuleDef {
  const qt: ScreenDef[] = m.quyTrinh ? [{ slug: 'quy-trinh', ten: 'Quy trình', nhom: 'Quy trình', kind: 'quytrinh' }] : []
  const bc: ScreenDef[] = m.screens.some(laBaoCao) ? [{ slug: 'bao-cao', ten: 'Báo cáo', nhom: 'Báo cáo', kind: 'baocao' }] : []
  return { ...m, screens: [...qt, ...m.screens, ...bc] }
}

export const MODULES: ModuleDef[] = [home, danhMuc, tien, banHang, muaHang, kho, thue, tscd, ccdc, giaThanh, tongHop, tienIch, heThong].map(dung)

export const tenMan = (sc: ScreenDef) => sc.ten ?? (sc.code ? FEATURE[sc.code]?.n : undefined) ?? sc.slug

export function moDuoc(sc: ScreenDef, goi: Goi) {
  if (sc.code) return coTrongGoi(sc.code, goi)
  if (sc.can) return coMotTrong(sc.can, goi)
  return true
}

/** Mã quyết định khoá của màn (để tìm gói thấp nhất) */
export const maKhoa = (sc: ScreenDef) => sc.code ?? sc.can?.[0]

export const duongDan = (m: ModuleDef, sc: ScreenDef) => `/app/${m.key}/${sc.slug}`

export function timMan(modKey?: string, slug?: string) {
  const mod = MODULES.find(m => m.key === modKey)
  const sc = mod?.screens.find(x => x.slug === slug)
  return { mod, sc }
}

/** Màn đầu tiên mở được của phân hệ (Quy trình nếu có); không có thì màn đầu tiên */
export function manDau(m: ModuleDef, goi: Goi) {
  return m.screens.find(sc => moDuoc(sc, goi)) ?? m.screens[0]
}

/** Cả phân hệ ngoài gói: không màn nào gắn mã tính năng mở được */
export function phanHeKhoa(m: ModuleDef, goi: Goi) {
  const co = m.screens.filter(sc => sc.code || sc.can)
  return co.length > 0 && !co.some(sc => moDuoc(sc, goi))
}

/** Các tab ngang của phân hệ: Quy trình, màn không phải báo cáo, rồi Báo cáo */
export const tabCua = (m: ModuleDef) => m.screens.filter(sc => !laBaoCao(sc))
export const nhanTab = (sc: ScreenDef) => sc.ngan ?? tenMan(sc)

/** Đọc đích dạng 'slug' (trong phân hệ đang mở) hoặc 'phân hệ/slug[/id][?query]' */
export function dich(di: string, modKey?: string) {
  const [p] = di.split('?')
  const parts = p.split('/')
  const mk = parts.length === 1 ? modKey : parts[0]
  const { mod, sc } = timMan(mk, parts.length === 1 ? parts[0] : parts[1])
  return { mod, sc, path: parts.length === 1 ? `/app/${modKey}/${di}` : `/app/${di}` }
}
