// Giảm thuế GTGT khi tính thuế theo % doanh thu (T163, T450, T754). Tách riêng để form chứng từ chung dùng được mà không vòng import
import { timNganhNghe } from '../danh-muc/nganh-nghe'
import { DN_AN_UONG, DN_BAN_LE, timNganhNgheDn } from '../danh-muc/nganh-nghe-dn'

/** Cấu hình giảm thuế GTGT của đơn vị ở Cấu hình kế toán (T754): có giảm không, theo nghị quyết nào, giảm bao nhiêu % mức tỷ lệ */
export interface CauHinhGiamVat { bat: boolean; nq: string; pt: number }

/** Các nghị quyết của Quốc hội giảm 20% mức tỷ lệ % tính thuế GTGT trên doanh thu. Mới nhất đứng đầu */
export const NGHI_QUYET_GIAM_VAT: { ma: string; ten: string; hieuLuc: string; pt: number }[] = [
  { ma: '204/2025/QH15', ten: 'Nghị quyết 204/2025/QH15', hieuLuc: '01/07/2025 - 31/12/2026', pt: 20 },
  { ma: '174/2024/QH15', ten: 'Nghị quyết 174/2024/QH15', hieuLuc: '01/01/2025 - 30/06/2025', pt: 20 },
  { ma: '142/2024/QH15', ten: 'Nghị quyết 142/2024/QH15', hieuLuc: '01/07/2024 - 31/12/2024', pt: 20 },
  { ma: '110/2023/QH15', ten: 'Nghị quyết 110/2023/QH15', hieuLuc: '01/01/2024 - 30/06/2024', pt: 20 },
  { ma: '101/2023/QH15', ten: 'Nghị quyết 101/2023/QH15', hieuLuc: '01/07/2023 - 31/12/2023', pt: 20 },
  { ma: '43/2022/QH15', ten: 'Nghị quyết 43/2022/QH15', hieuLuc: '01/02/2022 - 31/12/2022', pt: 20 },
]
/** Chưa lưu cấu hình thì hiểu là đang giảm theo nghị quyết mới nhất, như trước T754 (PhuongXT chốt 12/10/2026, T163) */
export const GIAM_VAT_MAC_DINH: CauHinhGiamVat = { bat: true, nq: NGHI_QUYET_GIAM_VAT[0].ma, pt: NGHI_QUYET_GIAM_VAT[0].pt }

type PhienGiamVat = { donVi: string; giamVat?: Record<string, CauHinhGiamVat>; hangGiamVat?: Record<string, Record<string, boolean>> }
export const cauHinhGiamVat = (s: PhienGiamVat): CauHinhGiamVat => s.giamVat?.[s.donVi] ?? GIAM_VAT_MAC_DINH

/** Hàng bán thẳng mua về bán lại: bia, nước suối. Ngành nghề tính thuế bán lẻ, món khác ăn uống */
export const BAN_THANG = new Set(['BIA01', 'NS01'])
export const nganhCuaHang = (ma: string) => (BAN_THANG.has(ma) ? '101-1' : '301-5')
/** Hàng mẫu chưa tích giảm thuế: bia chịu thuế tiêu thụ đặc biệt nên không thuộc diện giảm */
const KHONG_GIAM_MAU = new Set(['BIA01'])
/** Ô Giảm thuế theo quy định của hàng hoá: tích đã lưu ở danh mục, chưa lưu thì hàng bán mẫu tích sẵn, nguyên vật liệu không */
export const hangDuocGiam = (s: PhienGiamVat, ma: string) =>
  s.hangGiamVat?.[s.donVi]?.[ma] ?? (!KHONG_GIAM_MAU.has(ma) && !ma.startsWith('NVL') && !ma.startsWith('CCDC'))

/** Tỷ lệ % tính thuế GTGT trên doanh thu ngầm định theo hàng: theo ngành nghề của hàng, hộ kinh doanh và doanh nghiệp dùng bảng riêng */
export function tlGtgtHang(ma: string | undefined, dn: boolean): number {
  const nganh = nganhCuaHang(ma ?? '')
  if (dn) return timNganhNgheDn(nganh === '101-1' ? DN_BAN_LE : DN_AN_UONG)?.gtgt ?? 3
  return timNganhNghe(nganh)?.gtgt ?? 3
}

// SessionProvider đặt lại mỗi lần vẽ (như kiểu chữ số T710) để các hàm tính dưới đây không cần truyền phiên
let ch: CauHinhGiamVat = GIAM_VAT_MAC_DINH
let phien: PhienGiamVat = { donVi: '' }
let laDn = false
export const datGiamVat = (s: PhienGiamVat, dn: boolean) => { ch = cauHinhGiamVat(s); phien = s; laDn = dn }

/** Giảm thuế GTGT trên tổng doanh thu khi không biết từng hàng (danh sách, báo cáo): tỷ lệ ngành ăn uống × % giảm; tắt giảm thì 0 */
export const giamThueHkd = (dt: number) => (ch.bat ? Math.round(dt * tlGtgtHang(undefined, laDn) * ch.pt / 10000) : 0)
/** Giảm thuế GTGT của một dòng hàng (T754): doanh thu tính thuế × % GTGT ngầm định của hàng × % giảm.
 *  Hàng không tích Giảm thuế theo quy định thì 0; dòng không có mã hàng thì tính như tổng */
export function giamThueHang(dt: number, ma?: string): number {
  if (!ch.bat) return 0
  if (!ma) return giamThueHkd(dt)
  return hangDuocGiam(phien, ma) ? Math.round(dt * tlGtgtHang(ma, laDn) * ch.pt / 10000) : 0
}
