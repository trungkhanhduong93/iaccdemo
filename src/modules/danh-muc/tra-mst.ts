// Tra cứu mã số thuế giả lập cho ô MST ở danh mục Đối tượng: trả tên đối tượng, địa chỉ, trạng thái MST
import { KHACH, NCC } from '../../data/mock'

export interface KqTraMst { ten: string; diaChi: string; trangThai: string }

/** Mã số thuế là dãy số, dấu - liền nhau, dài 10, 12 hoặc 14 ký tự (không có dấu cách) */
export const laMstHopLe = (mst: string) => /^[\d-]+$/.test(mst) && [10, 12, 14].includes(mst.length)
/** Ô MST chỉ nhận số và dấu -, bỏ mọi ký tự khác kể cả dấu cách */
export const locMst = (s: string) => s.replace(/[^\d-]/g, '').slice(0, 14)
/** Ô CCCD chỉ nhận số, tối đa 12 */
export const locCccd = (s: string) => s.replace(/\D/g, '').slice(0, 12)

/** Khách, nhà cung cấp đã có trả đúng tên; MST hợp lệ khác trả đơn vị mẫu; sai dạng trả null. Số cuối là 9 thì giả lập đã ngừng hoạt động */
export function traCuuMstDm(mst: string): KqTraMst | null {
  const so = mst.trim()
  if (!laMstHopLe(so)) return null
  const co = [...KHACH, ...NCC].find(x => x.mst === so)
  const diaChi = `${Number(so.replace(/\D/g, '').slice(-2)) + 1} Nguyễn Huệ, phường Sài Gòn, TP.HCM`
  return {
    ten: co?.ten ?? `Công ty TNHH Thương mại Dịch vụ ${so.slice(-3)}`,
    diaChi,
    trangThai: so.endsWith('9') ? 'Ngừng hoạt động' : 'Đang hoạt động',
  }
}
