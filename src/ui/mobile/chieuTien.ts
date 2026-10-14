import type { Row, VoucherCfg } from '../../modules/types'
import { nhomCua } from '../generic/nhom'

// Chiều tiền của chứng từ trên điện thoại (T223): vào ghi dấu + màu xanh, ra ghi dấu − màu đỏ.
// Chứng từ không có chiều (kho, tổng hợp, chuyển quỹ) trả null, giữ màu chữ thường.
export type ChieuTien = 'vao' | 'ra' | null

export function chieuTien(modKey: string, cfg: VoucherCfg, row: Row): ChieuTien {
  const nhom = nhomCua(modKey, cfg, String(row.loai ?? ''))
  if (nhom === 'thu' || nhom === 'nhthu') return 'vao'
  if (nhom === 'chi' || nhom === 'nhchi') return 'ra'
  // TL: hàng bán bị trả lại (trả tiền cho khách), TLN: trả lại hàng mua (nhận tiền từ nhà cung cấp)
  if (nhom === 'ban') return cfg.prefix === 'TL' ? 'ra' : 'vao'
  if (nhom === 'mua') return cfg.prefix === 'TLN' ? 'vao' : 'ra'
  return null
}

/** Số tiền kèm dấu theo chiều: "+1.250.000", "−1.250.000" (dấu trừ U+2212) */
export const dauTien = (chieu: ChieuTien) => (chieu === 'vao' ? '+' : chieu === 'ra' ? '−' : '')

/** Lớp màu theo chiều, định nghĩa trong mục CSS T223 */
export const lopChieu = (chieu: ChieuTien) => (chieu === 'vao' ? 'm-tien-vao' : chieu === 'ra' ? 'm-tien-ra' : '')
