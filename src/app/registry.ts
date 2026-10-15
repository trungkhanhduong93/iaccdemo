// Thứ tự phân hệ trên sidebar. Thêm phân hệ mới: tạo thư mục trong src/modules rồi thêm vào đây.
// Phân hệ có quyTrinh được thêm tab Quy trình đứng đầu; có màn báo cáo thì thêm tab Báo cáo đứng cuối.
import type { ModuleDef, ScreenDef } from '../modules/types'
import { FEATURE, GOIS, anNgoaiGoi, coTrongGoi, coMotTrong, minGoi, type Goi } from './plan'
import { CHE_DO_MAC_DINH, type CheDo } from './che-do'
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
import thaoTacNhanh from '../modules/thao-tac-nhanh'
import { TrungTamBaoCao } from '../modules/bao-cao/TrungTam'
import { AN_NHOM_BC, CAU_HINH_BC, CHI_MO_TU_BC, MO_IFASTER, NHOM_CONG_NO, anSoHkdGoiFree, cachHkd, giuBC, laHkd, type PhienBC } from '../modules/bao-cao/danh-sach'
import { thTT58 } from '../modules/bao-cao/tt58'
import type { Session } from './session'

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
  // Nhóm Công nợ không theo phân hệ, gom công nợ nhà cung cấp, khách hàng (T217)
  nhoms.push({ slug: `nhom-${NHOM_CONG_NO.key}`, ten: `Nhóm báo cáo ${NHOM_CONG_NO.ngan}`, nhom: 'Báo cáo', kind: 'custom', comp: TrungTamBaoCao, tab: false, can: ['4.2.3'] })
  return {
    key: 'bao-cao',
    ten: 'Báo cáo',
    ngan: 'Báo cáo',
    icon: 'chart',
    mota: 'Toàn bộ sổ sách, báo cáo chia theo phân hệ',
    screens: [tatCa, ...nhoms, ...banSao],
  }
}

// Kê khai thuế ngay dưới Công cụ dụng cụ; Danh mục nằm dưới, ngay trên Hệ thống (T52); Thao tác nhanh dưới Hệ thống (T266)
const danhSachCu = [home, tien, banHang, muaHang, kho, tscd, ccdc, thue, giaThanh, tongHop, tienIch, danhMuc, heThong, thaoTacNhanh].map(dung)
const iTongHop = danhSachCu.findIndex(m => m.key === 'tong-hop')
const baoCao = phanHeBaoCao(danhSachCu)
export const MODULES: ModuleDef[] = [
  ...danhSachCu.slice(0, iTongHop + 1),
  baoCao,
  ...danhSachCu.slice(iTongHop + 1),
]

export const tenMan = (sc: ScreenDef) => sc.ten ?? (sc.code ? FEATURE[sc.code]?.n : undefined) ?? sc.slug

export function moDuoc(sc: ScreenDef, goi: Goi) {
  if (sc.goi && !sc.goi.includes(goi)) return false
  if (sc.code) return coTrongGoi(sc.code, goi)
  if (sc.can) return coMotTrong(sc.can, goi)
  return true
}

/** Mã tính năng của màn báo cáo; màn chưa có trong Excel lấy theo slug (3-2-6 thành 3.2.6) */
const maBC = (sc: ScreenDef) => sc.code ?? (/^\d+(-\d+)+$/.test(sc.slug) ? sc.slug.replace(/-/g, '.') : undefined)

/** Báo cáo có áp dụng cho chế độ (thông tư) không: phải nằm trong danh sách giữ lại (T171), rồi theo khai báo cheDo, anTam (T97).
 *  TT58 lọc tiếp theo trường hợp thuế, khớp dòng bộ sổ ở Thông tin đơn vị (T108, T171) */
export function apDung(sc: ScreenDef, cheDo?: CheDo, session?: Pick<Session, 'ppGtgt' | 'ppTndn'> | Session): boolean {
  if (!cheDo) return true
  const hkd = cheDo === 'TT152' && laHkd(session as PhienBC)
  if (!giuBC(maBC(sc), cheDo, hkd)) return false
  if (MO_IFASTER.includes(maBC(sc) ?? '')) return true   // báo cáo theo iFaster mở mọi chế độ (T185)
  const cfg = sc.code ? CAU_HINH_BC[sc.code] : undefined
  if (cfg?.anTam?.includes(cheDo)) return false
  if (cfg?.cheDo && !cfg.cheDo.includes(cheDo)) return false
  if (cheDo === 'TT58' && cfg?.th && !cfg.th.includes(thTT58(session?.ppGtgt, session?.ppTndn))) return false
  if (hkd && cfg?.hkd && !cfg.hkd.includes(cachHkd(session as PhienBC))) return false   // bộ sổ hộ kinh doanh theo cách tính thuế (T179)
  return true
}

/** Tab Báo cáo của phân hệ: chỉ hiện khi còn ít nhất một báo cáo hiện được (T171).
 *  Nhóm báo cáo ở phân hệ Báo cáo vẫn hiện khi chưa có báo cáo, miễn phân hệ mở được ở gói (T171) */
function conBaoCao(sc: ScreenDef, goi: Goi, cheDo?: CheDo, session?: Pick<Session, 'ppGtgt' | 'ppTndn'> | Session) {
  if (sc.kind !== 'baocao') {
    const key = sc.slug.slice(5)
    if (AN_NHOM_BC[goi]?.includes(key)) return false   // nhóm ẩn hẳn ở gói (T218)
    if (key === NHOM_CONG_NO.key) return Boolean(MODULES.find(x => x.key === 'bao-cao')?.screens
      .some(x => NHOM_CONG_NO.ma.includes(x.code ?? x.slug.replace(/-/g, '.')) && hienMan(x, goi, cheDo, session)))
    const m = MODULES.find(x => x.key === key)
    if (!m) return false
    if (hienPhanHe(m, goi) && !phanHeKhoa(m, goi)) return true
    // phân hệ ẩn ở gói (gói Free ẩn Tổng hợp) mà còn báo cáo mở được thì nhóm vẫn hiện (T185)
    return Boolean(MODULES.find(x => x.key === 'bao-cao')?.screens.some(x => x.goc === m.key && hienMan(x, goi, cheDo, session)))
  }
  const m = MODULES.find(x => x.screens.includes(sc))
  if (m && AN_NHOM_BC[goi]?.includes(m.key)) return false   // tab Báo cáo của phân hệ có nhóm ẩn ở gói (T218)
  return (m?.screens.filter(laBaoCao) ?? []).some(x => hienMan(x, goi, cheDo, session))
}

/** Mã quyết định khoá của màn (để tìm gói thấp nhất) */
export const maKhoa = (sc: ScreenDef) => sc.code ?? sc.can?.[0]
/** Màn có hiện trên menu, tab, sơ đồ không: gói Free ẩn màn ngoài gói (QD22) */
/** Màn chỉ gói thấp hơn mới có (sổ riêng của TT152, TT58): gói đang dùng không áp dụng, ẩn thay vì mời nâng cấp (T47) */
const khongApDung = (sc: ScreenDef, goi: Goi) => {
  const ma = maKhoa(sc)
  return !!ma && GOIS.indexOf(minGoi(ma)) < GOIS.indexOf(goi)
}
/** moThang: đang mở thẳng màn (Screen.tsx), báo cáo chỉ mở từ báo cáo khác (CHI_MO_TU_BC, T200) vẫn coi là hiện */
export const hienMan = (sc: ScreenDef, goi: Goi, cheDo?: CheDo, session?: Pick<Session, 'ppGtgt' | 'ppTndn'> | Session, moThang = false): boolean => {
  if (sc.goi && !sc.goi.includes(goi)) return false
  const cd = cheDo ?? CHE_DO_MAC_DINH[goi]
  if (sc.cheDo && !sc.cheDo.includes(cd)) return false
  if (sc.comp === TrungTamBaoCao && sc.slug === 'tat-ca') return true
  if (sc.kind === 'baocao' || sc.comp === TrungTamBaoCao) return conBaoCao(sc, goi, cd, session)
  const isBC = Boolean((sc.code && CAU_HINH_BC[sc.code]) || sc.goc || vaoBaoCao(sc))
  if (isBC) {
    if (!moThang && CHI_MO_TU_BC.includes(maBC(sc) ?? '')) return false
    if (!apDung(sc, cd, session)) return false
    if (cd === 'TT152' && anSoHkdGoiFree(maBC(sc), goi, session as PhienBC)) return false
    return moDuoc(sc, goi) || !anNgoaiGoi(goi)
  }
  return moDuoc(sc, goi) || (!anNgoaiGoi(goi) && !khongApDung(sc, goi))
}

export const duongDan = (m: ModuleDef, sc: ScreenDef) => `/app/${m.key}/${sc.slug}`

export function timMan(modKey?: string, slug?: string) {
  const mod = MODULES.find(m => m.key === modKey)
  const sc = mod?.screens.find(x => x.slug === slug)
  return { mod, sc }
}

/** Tên phân hệ theo gói: gói Free chỉ có Kiểm kê ở Kho nên gọi phân hệ Kho là Kiểm kê, PhuongXT chốt 14/10/2026 (T228) */
const TEN_THEO_GOI: Partial<Record<Goi, Record<string, { ten: string; ngan: string }>>> = { F: { kho: { ten: 'Kiểm kê', ngan: 'Kiểm kê' } } }
export const tenPhanHe = (m: ModuleDef, goi: Goi) => TEN_THEO_GOI[goi]?.[m.key] ?? { ten: m.ten, ngan: m.ngan }

/** Màn mở khi bấm phân hệ: danh sách chứng từ đầu tiên gói đang dùng thấy được, không có thì màn đầu tiên không phải Quy trình,
 *  PhuongXT chốt 14/10/2026 (T226); tab Quy trình vẫn còn để bấm xem. Không màn nào hiện thì màn đầu tiên mở được */
export function manDau(m: ModuleDef, goi: Goi) {
  const mo = m.screens.filter(sc => moDuoc(sc, goi) && hienMan(sc, goi))
  return mo.find(sc => sc.nhom === 'Chứng từ') ?? mo.find(sc => sc.kind !== 'quytrinh') ?? mo[0]
    ?? m.screens.find(sc => moDuoc(sc, goi)) ?? m.screens[0]
}

/** Phân hệ ẩn khỏi thanh bên trái theo gói dù còn màn trong gói: gói Free không có phân hệ Tổng hợp,
 *  chỉ xem Báo cáo kết quả kinh doanh ở phân hệ Báo cáo (T52) */
const AN_PHAN_HE: Partial<Record<Goi, string[]>> = { F: ['tong-hop', 'tien-ich'] }   // gói Free ẩn tạm Tiện ích, tiện ích sẽ chuyển về phân hệ của nó, PhuongXT 10/10/2026 (T100)
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
