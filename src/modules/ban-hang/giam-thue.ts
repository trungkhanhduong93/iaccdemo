// Giảm thuế GTGT khi tính thuế theo % doanh thu (T163, T450, T754). Tách riêng để form chứng từ chung dùng được mà không vòng import
import { timNganhNghe } from '../danh-muc/nganh-nghe'
import { DN_AN_UONG, DN_BAN_LE, timNganhNgheDn } from '../danh-muc/nganh-nghe-dn'
import { HOM_NAY } from '../../data/mock'

/** Một nghị quyết giảm thuế GTGT ở Cấu hình kế toán (T754): số nghị quyết, % giảm mức tỷ lệ, hiệu lực từ ngày đến ngày (dd/mm/yyyy) */
export interface DongGiamVat { nq: string; pt: number; tu: string; den: string }
/** Cấu hình giảm thuế GTGT của đơn vị: có giảm không, các nghị quyết; có nghị quyết mới thì thêm dòng */
export interface CauHinhGiamVat { bat: boolean; ds: DongGiamVat[] }

/** Các nghị quyết của Quốc hội đã ban hành, giảm 20% mức tỷ lệ % tính thuế GTGT trên doanh thu. Gợi ý khi gõ số nghị quyết */
export const NGHI_QUYET_GIAM_VAT: DongGiamVat[] = [
  { nq: '204/2025/QH15', pt: 20, tu: '01/07/2025', den: '31/12/2026' },
  { nq: '174/2024/QH15', pt: 20, tu: '01/01/2025', den: '30/06/2025' },
  { nq: '142/2024/QH15', pt: 20, tu: '01/07/2024', den: '31/12/2024' },
  { nq: '110/2023/QH15', pt: 20, tu: '01/01/2024', den: '30/06/2024' },
  { nq: '101/2023/QH15', pt: 20, tu: '01/07/2023', den: '31/12/2023' },
  { nq: '43/2022/QH15', pt: 20, tu: '01/02/2022', den: '31/12/2022' },
]
/** Chưa lưu cấu hình thì hiểu là đang giảm theo nghị quyết mới nhất, như trước T754 (PhuongXT chốt 12/10/2026, T163) */
export const GIAM_VAT_MAC_DINH: CauHinhGiamVat = { bat: true, ds: [{ ...NGHI_QUYET_GIAM_VAT[0] }] }

type PhienGiamVat = { donVi: string; giamVat?: Record<string, CauHinhGiamVat>; hangGiamVat?: Record<string, Record<string, boolean>> }
export function cauHinhGiamVat(s: PhienGiamVat): CauHinhGiamVat {
  const c = s.giamVat?.[s.donVi] as (CauHinhGiamVat & { nq?: string; pt?: number }) | undefined
  if (!c) return GIAM_VAT_MAC_DINH
  if (Array.isArray(c.ds)) return c
  // Bản lưu đầu tiên của T754 chỉ có một nghị quyết, chưa có hiệu lực: lấy hiệu lực theo danh sách đã ban hành
  const g = NGHI_QUYET_GIAM_VAT.find(n => n.nq === c.nq) ?? NGHI_QUYET_GIAM_VAT[0]
  return { bat: c.bat, ds: [{ ...g, pt: c.pt ?? g.pt }] }
}
const soNgay = (d: string) => { const [dd, mm, yy] = d.split('/').map(Number); return (yy || 0) * 10000 + (mm || 0) * 100 + (dd || 0) }
/** % giảm đang áp dụng: nghị quyết có hiệu lực tới ngày làm việc; không dòng nào còn hiệu lực thì không giảm */
export function ptGiamHienHanh(c: CauHinhGiamVat, ngay: Date = HOM_NAY): number {
  if (!c.bat) return 0
  const n = ngay.getFullYear() * 10000 + (ngay.getMonth() + 1) * 100 + ngay.getDate()
  return c.ds.find(d => soNgay(d.tu) <= n && n <= soNgay(d.den))?.pt ?? 0
}

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
let pt = 20
let phien: PhienGiamVat = { donVi: '' }
let laDn = false
export const datGiamVat = (s: PhienGiamVat, dn: boolean) => { pt = ptGiamHienHanh(cauHinhGiamVat(s)); phien = s; laDn = dn }

/** Giảm thuế GTGT trên tổng doanh thu khi không biết từng hàng (danh sách, báo cáo): tỷ lệ ngành ăn uống × % giảm; tắt giảm hoặc hết hiệu lực thì 0 */
export const giamThueHkd = (dt: number) => (pt ? Math.round(dt * tlGtgtHang(undefined, laDn) * pt / 10000) : 0)
/** Giảm thuế GTGT của một dòng hàng (T754): doanh thu tính thuế × % GTGT ngầm định của hàng × % giảm.
 *  Hàng không tích Giảm thuế theo quy định thì 0; dòng không có mã hàng thì tính như tổng */
export function giamThueHang(dt: number, ma?: string): number {
  if (!pt) return 0
  if (!ma) return giamThueHkd(dt)
  return hangDuocGiam(phien, ma) ? Math.round(dt * tlGtgtHang(ma, laDn) * pt / 10000) : 0
}
