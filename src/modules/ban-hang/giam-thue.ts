// Giảm thuế GTGT khi tính thuế theo % doanh thu (T163, T450). Tách riêng để form chứng từ chung dùng được mà không vòng import
import { timNganhNghe } from '../danh-muc/nganh-nghe'

/** Được giảm 20% mức tỷ lệ % tính thuế GTGT trên doanh thu (PhuongXT chốt 12/10/2026, T163).
 *  Tỷ lệ lấy theo ngành Dịch vụ ăn uống của danh mục ngành nghề */
const TL_GTGT_HKD = timNganhNghe('301-5')?.gtgt ?? 3
export const giamThueHkd = (dt: number) => Math.round(dt * TL_GTGT_HKD * 0.2 / 100)
