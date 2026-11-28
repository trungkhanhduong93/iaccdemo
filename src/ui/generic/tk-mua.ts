// Tài khoản hạch toán của chứng từ mua hàng (4.1.1, 4.1.2): Tk thanh toán, Tk kho, Tk thuế theo từng dòng
import { CCDC_HANG, NVL } from '../../data/mock'
import { tkCuaQuy, type Dong } from './gen'

/** Giá trị mặc định chứng từ nhập mua của cửa hàng lập phiếu. Tạm cố định, chưa có màn khai báo theo cửa hàng.
 *  tkCongNo để trống thì lấy TK công nợ của NCC trong danh mục đối tượng, danh mục chưa khai thì 331 */
export const MAC_DINH_NHAP_MUA = { tkCongNo: '', tkThue: '1331' }
const TK_CONG_NO_NCC = '331'

export type HinhThucTt = 'congno' | 'tienmat' | 'chuyenkhoan'

/** Tk thanh toán: trả ngay thì ăn theo quỹ tiền (tiền mặt, ngân hàng); chưa trả thì TK công nợ */
export function tkThanhToan(httt: HinhThucTt, quy: string, tkCongNoNcc?: string): string {
  if (httt === 'congno') return MAC_DINH_NHAP_MUA.tkCongNo || tkCongNoNcc || TK_CONG_NO_NCC
  return tkCuaQuy(quy) || (httt === 'tienmat' ? '1111' : '1121')
}

/** Tài khoản cấp phiếu mua (T964): Tk thanh toán/công nợ và Tk thuế hiện ở đầu phiếu, user sửa được, lưu vào phiếu ở _tkTt, _tkThue.
 *  Phiếu chưa lưu hai trường này (hoặc user để trống) thì dùng mặc định theo hình thức thanh toán và giá trị mặc định cửa hàng */
export function tkPhieuMua(r: Record<string, unknown> | undefined, httt: HinhThucTt, quy: string, tkCongNoNcc?: string): { tt: string; thue: string } {
  const tuRow = (k: string) => (typeof r?.[k] === 'string' ? (r[k] as string).trim() : '')
  return {
    tt: tuRow('_tkTt') || tkThanhToan(httt, quy, tkCongNoNcc),
    thue: tuRow('_tkThue') || MAC_DINH_NHAP_MUA.tkThue,
  }
}

/** Tk kho của dòng: theo hàng hoá trong danh mục. Hoá đơn mua không qua kho (khongKho) ghi thẳng chi phí 6422 */
export function tkKhoCua(d: Dong, khongKho?: boolean): string {
  if (khongKho) return '6422'
  return (NVL as { ma: string; tkKho?: string }[]).find(h => h.ma === d.ma)?.tkKho || (CCDC_HANG.some(h => h.ma === d.ma) ? '153' : '152')
}

export interface DongButToan { no: string; co: string; dg: string; tien: number; soNo: string; soCo: string; dt?: string; thue?: boolean }

/** TK công nợ ghi cho đơn vị vận chuyển khác nhà cung cấp. Tạm cố định, chờ giá trị mặc định Trum khai báo */
const TK_CO_VAN_CHUYEN = '331'

/** Bút toán sinh ra: Nợ Tk kho / Có Tk thanh toán, số tiền là tiền sau giảm giá (thành tiền trừ chiết khấu);
 *  thuế: Nợ Tk thuế / Có Tk thanh toán, số tiền là tiền thuế.
 *  Chi phí mua hàng (vận chuyển) theo dòng: Nợ Tk kho; nhà cung cấp tự vận chuyển thì Có Tk thanh toán,
 *  có đơn vị vận chuyển khác thì Có 331 ghi cho đơn vị đó.
 *  Số chứng từ: Nợ Tk kho theo số phiếu mua; khi thanh toán luôn, các bên còn lại theo số chứng từ thanh toán (soTt) */
export function butToanMua(dong: Dong[], tkTt: string, o: { khongKho?: boolean; dvVc?: string; soMua: string; soTt?: string; soChuaCo?: string; thanhToanNgay: boolean; tkThue?: string }): DongButToan[] {
  const tkThue = o.tkThue || MAC_DINH_NHAP_MUA.tkThue
  const ra: DongButToan[] = []
  const soKhac = o.thanhToanNgay ? (o.soTt || o.soChuaCo || 'Số cấp khi lưu') : o.soMua
  dong.forEach(d => {
    const ten = d.ten || d.ma || 'Hàng'
    const tien = (d.tien || 0) - (d.ck || 0)
    if (tien > 0) ra.push({ no: tkKhoCua(d, o.khongKho), co: tkTt, dg: ten, tien, soNo: o.soMua, soCo: soKhac })
    if ((d.thue || 0) > 0) ra.push({ no: tkThue, co: tkTt, dg: ten, tien: d.thue, soNo: soKhac, soCo: soKhac, thue: true })
    if ((d.cpMua || 0) > 0) {
      const khac = Boolean(o.dvVc)
      ra.push({
        no: tkKhoCua(d, o.khongKho), co: khac ? TK_CO_VAN_CHUYEN : tkTt, dg: ten, tien: d.cpMua!,
        soNo: o.soMua, soCo: khac ? o.soMua : soKhac, ...(khac ? { dt: o.dvVc } : {}),
      })
    }
  })
  return ra
}
