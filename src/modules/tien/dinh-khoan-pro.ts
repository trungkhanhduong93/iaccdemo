// Phiếu thu, chi bản Pro: tài khoản Nợ, Có của dòng và chi tiết đi kèm tài khoản (đối tượng, công việc, thành phẩm, vật tư hàng hoá).
// Nợ, Có lấy từ danh mục Quỹ tiền (1.12), Lý do nghiệp vụ (1.16), Đối tượng (1.5); người dùng chọn lại được trên dòng.
import { CONG_VIEC, ganLyDo } from '../../data/mock'
import type { Session } from '../../app/session'
import { fold } from '../../ui/format'
import { getAllCatalogRows } from '../../ui/generic/danhMucStore'
import { tkCuaQuy, type Dong } from '../../ui/generic/gen'
import { chiTietTheoTk, locTkChiTiet, heThongTk } from '../danh-muc/he-thong-tk'

type Chu = (v: unknown) => string
const chu: Chu = v => String(v ?? '').trim()

/** Tài khoản của quỹ tiền: theo danh mục Quỹ tiền, quỹ chưa khai tài khoản thì 1111 cho quỹ tiền mặt, 1121 cho ngân hàng */
export function tkQuyCua(quy: string): string {
  const ds = getAllCatalogRows('1.12')
  const r = ds.find(x => chu(x.ten) === quy) ?? ds.find(x => chu(x.stk) && quy.replace(/\s/g, '').includes(chu(x.stk).replace(/\s/g, '')))
  return chu(r?.tkQuy) || tkCuaQuy(quy)
}

/** Tài khoản công nợ khai ở danh mục Đối tượng (TK công nợ); đối tượng chưa khai thì rỗng */
export function tkCongNoDoiTuong(ten: string): string {
  return chu(getAllCatalogRows('1.5').find(x => chu(x.ten) === ten)?.tkCn)
}

/** Lý do thu, chi lấy tài khoản công nợ của đối tượng khi đã chọn đối tượng:
 *  thu nợ khách, thu tiền bán hàng, đi vay; trả tiền nhà cung cấp, đặt cọc trước cho nhà cung cấp, trả nợ vay */
const MA_LY_THEO_DT = ['THU02', 'THU04', 'THU10', 'CHI02', 'CHI16', 'CHI23', 'CHI32']
function lyTheoDoiTuong(ly: { ma?: unknown; ten?: unknown; dung?: unknown }): boolean {
  return MA_LY_THEO_DT.includes(chu(ly.ma)) || (ly.dung === 'Chi tiền' && fold(chu(ly.ten)).includes('dat coc'))
}

interface DauVao { loai: string; ly: string; doiTuong: string; quy: string; s: Pick<Session, 'donVi' | 'lyDoGhiDe'> }

/** Tài khoản Nợ, Có của dòng phiếu thu (thu, bc) hoặc chi (chi, unc) */
export function dinhKhoanThuChi({ loai, ly, doiTuong, quy, s }: DauVao): { tkNo: string; tkCo: string } {
  const r = getAllCatalogRows('1.16').find(x => chu(x.ten) === ly)
  const tkLy = chu(r ? ganLyDo(r, s).tk : '')
  const tkDt = tkCongNoDoiTuong(doiTuong)
  // Lý do trống tài khoản, hoặc lý do theo công nợ: lấy tài khoản công nợ của đối tượng, đối tượng chưa khai thì về tài khoản của lý do
  const tkDoiUng = (!tkLy || (r && lyTheoDoiTuong(r))) && tkDt ? tkDt : tkLy
  const tkQuy = tkQuyCua(quy)
  return loai === 'thu' || loai === 'bc' ? { tkNo: tkQuy, tkCo: tkDoiUng } : { tkNo: tkDoiUng, tkCo: tkQuy }
}

/** Các cột chi tiết đi kèm tài khoản: [trường của dòng, tên cột, loại chi tiết, tài khoản mà cột đi theo] */
export const COT_CHI_TIET = [
  ['dtNo', 'Đối tượng Nợ', 'dt', 'tkNo'], ['dtCo', 'Đối tượng Có', 'dt', 'tkCo'],
  ['cvNo', 'Công việc Nợ', 'cv', 'tkNo'], ['cvCo', 'Công việc Có', 'cv', 'tkCo'],
  ['tpNo', 'Thành phẩm Nợ', 'tp', 'tkNo'], ['tpCo', 'Thành phẩm Có', 'tp', 'tkCo'],
  ['vtNo', 'VTHH Nợ', 'vt', 'tkNo'], ['vtCo', 'VTHH Có', 'vt', 'tkCo'],
] as const
export type CotChiTiet = typeof COT_CHI_TIET[number]

/** Mã đối tượng theo tên (cột chi tiết lưu mã); đối tượng chưa có trong danh mục thì giữ nguyên chữ */
export function maDoiTuong(ten: string): string {
  return chu(getAllCatalogRows('1.5').find(x => chu(x.ten) === ten)?.ma) || ten
}

/** Giữ chi tiết đúng theo tài khoản của dòng: tài khoản không theo dõi chi tiết nào thì xoá chi tiết đó;
 *  tài khoản theo dõi đối tượng mà chưa có thì gợi ý đối tượng đầu phiếu. ep = true: ghi đè bằng đối tượng đầu phiếu (vừa đổi đối tượng) */
export function chuanChiTiet(d: Dong, doiTuongDauPhieu: string, ep = false): Dong {
  const n: Dong = { ...d }
  for (const [k, , loai, tk] of COT_CHI_TIET) {
    if (!chiTietTheoTk(d[tk])[loai]) n[k] = ''
    else if (loai === 'dt' && (ep || !d[k])) n[k] = doiTuongDauPhieu ? maDoiTuong(doiTuongDauPhieu) : ''
  }
  return n
}

/** Lỗi khi lưu phiếu Pro: dòng thiếu tài khoản Nợ, Có, tài khoản tổng hợp, hoặc thiếu mã chi tiết đi kèm tài khoản; rỗng nếu đủ */
export function loiDinhKhoan(dong: Dong[], s: Pick<Session, 'cheDo' | 'goi'>): string {
  const chiTiet = new Set(locTkChiTiet(heThongTk(s.cheDo), s.goi).map(t => t.so))
  for (const [i, d] of dong.entries()) {
    const dau = `Dòng ${i + 1}:`
    if (!d.tkNo) return `${dau} chọn tài khoản Nợ`
    if (!d.tkCo) return `${dau} chọn tài khoản Có`
    for (const tk of [d.tkNo, d.tkCo]) if (!chiTiet.has(tk)) return `${dau} tài khoản ${tk} không phải tài khoản chi tiết, chọn tài khoản chi tiết`
    for (const [k, ten, loai, tk] of COT_CHI_TIET) {
      if (chiTietTheoTk(d[tk])[loai] && !d[k]) return `${dau} chọn ${ten.toLowerCase()} (tài khoản ${d[tk]})`
    }
  }
  return ''
}

type Muc = { v: string; t: string }
/** Danh sách chọn của từng loại chi tiết: công việc (danh mục 1.7), thành phẩm (loại Thành phẩm trong danh mục hàng hoá 1.2), vật tư hàng hoá (mọi hàng hoá, nguyên vật liệu 1.2) */
export function dsChiTiet(loai: 'dt' | 'cv' | 'tp' | 'vt'): Muc[] {
  const mucMa = (r: { ma?: unknown; ten?: unknown }): Muc => ({ v: chu(r.ma), t: `${chu(r.ma)} · ${chu(r.ten)}` })
  if (loai === 'dt') return getAllCatalogRows('1.5').filter(r => chu(r.ma)).map(mucMa)
  if (loai === 'cv') {
    const ds = getAllCatalogRows('1.7')
    return (ds.length ? ds : CONG_VIEC).map(mucMa)
  }
  const hang = getAllCatalogRows('1.2').filter(r => chu(r.ma))
  return (loai === 'tp' ? hang.filter(r => r.loai === 'Thành phẩm') : hang).map(mucMa)
}
