// Thứ tự phân hệ trên sidebar. Thêm phân hệ mới: tạo thư mục trong src/modules rồi thêm vào đây.
// Phân hệ có quyTrinh được thêm tab Quy trình đứng đầu; có màn báo cáo thì thêm tab Báo cáo đứng cuối.
import type { ModuleDef, ScreenDef } from '../modules/types'
import { FEATURE, GOIS, anNgoaiGoi, coTrongGoi, coMotTrong, minGoi, type Goi } from './plan'
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
import { TrungTamBaoCao } from '../modules/bao-cao/TrungTam'

/** Màn thuộc tab Báo cáo: nhóm Excel có chữ "báo cáo", trừ màn khai tab: true */
export function laBaoCao(sc: ScreenDef) {
  if (sc.kind === 'quytrinh' || sc.kind === 'baocao') return false
  return sc.tab === undefined ? /báo cáo/i.test(sc.nhom ?? '') : !sc.tab
}

/** Màn vào phân hệ Báo cáo: nhóm Excel có chữ "báo cáo", kể cả màn ép thành tab (Tờ khai 6.2.3) */
export const vaoBaoCao = (sc: ScreenDef) => sc.kind !== 'quytrinh' && sc.kind !== 'baocao' && /báo cáo/i.test(sc.nhom ?? '')

function dung(m: ModuleDef): ModuleDef {
  const qt: ScreenDef[] = m.quyTrinh ? [{ slug: 'quy-trinh', ten: 'Quy trình', nhom: 'Quy trình', kind: 'quytrinh' }] : []
  const bc: ScreenDef[] = m.screens.some(laBaoCao) ? [{ slug: 'bao-cao', ten: 'Báo cáo', nhom: 'Báo cáo', kind: 'baocao' }] : []
  return { ...m, screens: [...qt, ...m.screens, ...bc] }
}

function phanHeBaoCao(nguon: ModuleDef[]): ModuleDef {
  const tatCa: ScreenDef = {
    slug: 'tat-ca',
    ten: 'Tất cả báo cáo',
    ngan: 'Tất cả báo cáo',
    nhom: 'Báo cáo',
    kind: 'custom',
    comp: TrungTamBaoCao,
    tab: true,
  }
  const nhoms: ScreenDef[] = []
  const banSao: ScreenDef[] = []
  for (const m of nguon) {
    const scs = m.screens.filter(vaoBaoCao)
    if (scs.length === 0) continue
    const codes = scs.map(x => x.code).filter((c): c is string => Boolean(c))
    nhoms.push({
      slug: `nhom-${m.key}`,
      ten: `Nhóm báo cáo ${m.ngan}`,
      nhom: 'Báo cáo',
      kind: 'custom',
      comp: TrungTamBaoCao,
      tab: false,
      can: codes,
    })
    for (const sc of scs) {
      banSao.push({ ...sc, goc: m.key, tab: false })
    }
  }
  return {
    key: 'bao-cao',
    ten: 'Báo cáo',
    ngan: 'Báo cáo',
    icon: 'chart',
    mota: 'Toàn bộ sổ sách, báo cáo chia theo phân hệ',
    screens: [tatCa, ...nhoms, ...banSao],
  }
}

// Kê khai thuế ngay dưới Công cụ dụng cụ; Danh mục nằm dưới, ngay trên Hệ thống (T52)
const danhSachCu = [home, tien, banHang, muaHang, kho, tscd, ccdc, thue, giaThanh, tongHop, tienIch, danhMuc, heThong].map(dung)
const iTongHop = danhSachCu.findIndex(m => m.key === 'tong-hop')
const baoCao = phanHeBaoCao(danhSachCu)
export const MODULES: ModuleDef[] = [
  ...danhSachCu.slice(0, iTongHop + 1),
  baoCao,
  ...danhSachCu.slice(iTongHop + 1),
]

export const tenMan = (sc: ScreenDef) => sc.ten ?? (sc.code ? FEATURE[sc.code]?.n : undefined) ?? sc.slug

export function moDuoc(sc: ScreenDef, goi: Goi) {
  if (sc.code) return coTrongGoi(sc.code, goi)
  if (sc.can) return coMotTrong(sc.can, goi)
  return true
}

/** Mã quyết định khoá của màn (để tìm gói thấp nhất) */
export const maKhoa = (sc: ScreenDef) => sc.code ?? sc.can?.[0]
/** Màn có hiện trên menu, tab, sơ đồ không: gói Free ẩn màn ngoài gói (QD22) */
/** Màn chỉ gói thấp hơn mới có (sổ riêng của TT152, TT58): gói đang dùng không áp dụng, ẩn thay vì mời nâng cấp (T47) */
const khongApDung = (sc: ScreenDef, goi: Goi) => {
  const ma = maKhoa(sc)
  return !!ma && GOIS.indexOf(minGoi(ma)) < GOIS.indexOf(goi)
}
export const hienMan = (sc: ScreenDef, goi: Goi) => moDuoc(sc, goi) || (!anNgoaiGoi(goi) && !khongApDung(sc, goi))

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

/** Phân hệ ẩn khỏi thanh bên trái theo gói dù còn màn trong gói: gói Free không có phân hệ Tổng hợp,
 *  chỉ xem Báo cáo kết quả kinh doanh ở phân hệ Báo cáo (T52) */
const AN_PHAN_HE: Partial<Record<Goi, string[]>> = { F: ['tong-hop'] }
export const anPhanHeGoi = (m: ModuleDef, goi: Goi) => Boolean(AN_PHAN_HE[goi]?.includes(m.key))

/** Cả phân hệ ngoài gói: không màn nào gắn mã tính năng mở được */
export function phanHeKhoa(m: ModuleDef, goi: Goi) {
  if (anPhanHeGoi(m, goi)) return true
  const co = m.screens.filter(sc => sc.code || sc.can)
  // màn không gắn gói (Người dùng, Gói thuê bao…) luôn mở, nên phân hệ có màn đó không bị khoá
  const tuDo = m.screens.some(sc => !sc.code && !sc.can && sc.kind !== 'quytrinh' && sc.kind !== 'baocao')
  return co.length > 0 && !tuDo && !co.some(sc => moDuoc(sc, goi))
}

/** Các tab ngang của phân hệ: Quy trình, màn không phải báo cáo, rồi Báo cáo */
/** Phân hệ có hiện trên sidebar không: gói Free ẩn phân hệ không còn màn nào mở được, không tính màn Quy trình, Báo cáo (QD22) */
export const hienPhanHe = (m: ModuleDef, goi: Goi) =>
  !anPhanHeGoi(m, goi) && (!anNgoaiGoi(goi) || m.screens.some(sc => sc.kind !== 'quytrinh' && sc.kind !== 'baocao' && moDuoc(sc, goi)))
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
