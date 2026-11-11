// Hoá đơn thay thế, điều chỉnh kê khai về kỳ của hoá đơn gốc (QD107, T788). Gói Plus, tờ khai hộ kinh doanh kỳ 6 tháng.
// Kỳ gốc chưa nộp: tờ khai lấy luôn chênh lệch doanh thu, bảng hoá đơn gạch hoá đơn bị thay thế. Kỳ đã nộp: nhắc lập tờ khai bổ sung.
// Huỷ bán không có hoá đơn nên không kê khai.
import type { Row } from '../types'
import { apKhoPhieu } from '../../ui/generic/daXoa'
import { dmy } from '../../ui/format'
import { MAN_BAN, hangTay, mauTay } from '../ban-hang/ChungTuBanHang'
import { hdCua, hdGocCua, loaiCtCua } from '../ban-hang/hddt'

/** Kỳ tờ khai hộ kinh doanh: 6 tháng đầu hoặc cuối năm */
export interface KyHkd { dau: boolean; nam: number }
/** Hoá đơn thay thế, điều chỉnh đã phát hành, hoá đơn gốc thuộc kỳ; chênh là doanh thu tăng (+) hoặc giảm (-) so với hoá đơn bị thay thế, điều chỉnh */
export interface HdDoiKy { id: string; loai: 'HDTHAYTHE' | 'HDDIEUCHINH'; goc: Row; moi: Row; chenh: number }

const ngayDate = (ngay: string) => { const [d, t, n] = ngay.split(' ')[0].split('/').map(Number); return new Date(n, t - 1, d) }
const trongKy = (ngay: string, ky: KyHkd) => { const x = ngayDate(ngay); return x.getFullYear() === ky.nam && (ky.dau ? x.getMonth() < 6 : x.getMonth() >= 6) }
/** Doanh thu trên hoá đơn: tiền trước thuế, điều chỉnh giảm là số âm */
const dtHd = (r: Row) => Number(hdCua(r)?.truoc) || 0

/** Hoá đơn thay thế, điều chỉnh đã phát hành có hoá đơn gốc (đầu chuỗi thay thế) thuộc kỳ, cũ trước mới sau */
export function hdDoiKy(ky: KyHkd): HdDoiKy[] {
  const ds = apKhoPhieu(MAN_BAN, mauTay()).map(r => hangTay(r, true))
  const tim = (id?: string) => (id ? ds.find(x => String(x.id) === id) : undefined)
  const out: HdDoiKy[] = []
  for (const moi of ds) {
    const loai = loaiCtCua(moi)
    if ((loai !== 'HDTHAYTHE' && loai !== 'HDDIEUCHINH') || !hdCua(moi)) continue
    const goc = tim(hdGocCua(moi)?.id)
    if (!goc || !hdCua(goc)) continue
    // thay thế của hoá đơn thay thế: kỳ kê khai theo hoá đơn gốc đầu tiên
    let dau = goc
    for (let n = 0, g = tim(hdGocCua(dau)?.id); g && n < 20; n++, g = tim(hdGocCua(dau)?.id)) dau = g
    if (!trongKy(hdCua(dau)!.ngay, ky)) continue
    out.push({ id: String(moi.id), loai, goc, moi, chenh: loai === 'HDTHAYTHE' ? dtHd(moi) - dtHd(goc) : dtHd(moi) })
  }
  return out.sort((a, b) => ngayDate(hdCua(a.moi)!.ngay).getTime() - ngayDate(hdCua(b.moi)!.ngay).getTime())
}

/** Tờ khai tối thiểu để xét hoá đơn: trạng thái, hoá đơn thay thế, điều chỉnh đã lấy khi nộp */
interface TkXet extends KyHkd { tt: string; lan: number; hd?: string[] }
/** Hoá đơn thay thế, điều chỉnh tờ khai lấy số: chưa nộp thì lấy hết, đã nộp thì giữ đúng các hoá đơn lúc nộp */
export const hdCuaToKhai = (tk: TkXet) => hdDoiKy(tk).filter(x => tk.tt === 'Chưa nộp' || tk.hd?.includes(x.id))
/** Hoá đơn thay thế, điều chỉnh phát hành sau khi nộp tờ khai của kỳ: cần lập tờ khai bổ sung.
 *  Kỳ đang có tờ khai chưa nộp thì tờ khai đó đã lấy số mới, không nhắc */
export function hdChoBoSung(ky: KyHkd, ds: TkXet[]): HdDoiKy[] {
  const cua = ds.filter(x => x.nam === ky.nam && x.dau === ky.dau && x.tt !== 'Đã huỷ')
  if (cua.some(x => x.tt === 'Chưa nộp')) return []
  const nop = cua.filter(x => x.tt === 'Đã nộp').sort((a, b) => b.lan - a.lan)[0]
  return nop ? hdDoiKy(ky).filter(x => !nop.hd?.includes(x.id)) : []
}
/** Tờ khai đã nộp mới nhất của kỳ: nơi hiện nhắc lập tờ khai bổ sung */
export const laToKhaiNopCuoi = (tk: TkXet & { id: string }, ds: (TkXet & { id: string })[]) =>
  tk.tt === 'Đã nộp' && ds.filter(x => x.nam === tk.nam && x.dau === tk.dau && x.tt === 'Đã nộp').sort((a, b) => b.lan - a.lan)[0]?.id === tk.id

/** Tên ngắn loại hoá đơn mới cho câu nhắc, vd "1 hoá đơn điều chỉnh" */
export function demHd(ds: HdDoiKy[]) {
  const tt = ds.filter(x => x.loai === 'HDTHAYTHE').length, dc = ds.length - tt
  return [tt && `${tt} hoá đơn thay thế`, dc && `${dc} hoá đơn điều chỉnh`].filter(Boolean).join(', ')
}

/** Dòng bảng hoá đơn kỳ gốc: hoá đơn gốc (bị thay thế thì gạch), rồi hoá đơn thay thế, điều chỉnh với số âm hoặc dương */
export interface DongBk { id: string; kyHieu: string; so: string; ngay: string; mua: string; dt: number; ghiChu: string; gach: boolean; moi: boolean }
export function dongBangKe(ds: HdDoiKy[]): DongBk[] {
  const out: DongBk[] = []
  const dong = (r: Row, ghiChu: string, gach: boolean, moi: boolean): DongBk => {
    const h = hdCua(r)!
    return { id: String(r.id), kyHieu: h.mau + h.kyHieu, so: h.so, ngay: dmy(ngayDate(h.ngay)), mua: h.nguoiMua ?? String(r.doiTuong ?? ''), dt: dtHd(r), ghiChu, gach, moi }
  }
  for (const x of ds) {
    const soGoc = hdCua(x.goc)!.so
    const tt = x.loai === 'HDTHAYTHE'
    const cu = out.find(d => d.id === String(x.goc.id))
    if (cu) { if (tt) { cu.gach = true; cu.ghiChu = 'Bị thay thế' } }
    else out.push(dong(x.goc, tt ? 'Bị thay thế' : 'Bị điều chỉnh', tt, false))
    out.push(dong(x.moi, tt ? `Thay thế HĐ ${soGoc}` : `Điều chỉnh ${x.moi._dcLoai === 'tang' ? 'tăng' : 'giảm'} HĐ ${soGoc}`, false, true))
  }
  return out
}
