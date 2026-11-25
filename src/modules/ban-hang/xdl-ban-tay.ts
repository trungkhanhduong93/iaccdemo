// Xuất kho định lượng của chứng từ bán hàng lập tay (gói Plus): bật Xuất định lượng thì lưu xong sinh phiếu,
// số phiếu ghi vào chứng từ (_xdlSo). File nhỏ, chỉ import daXoa, để form chứng từ gọi được mà không vòng import (BAY.md).
import { bayGio, suaPhieu } from '../../ui/generic/daXoa'
import { pad } from '../../ui/format'
import type { Row } from '../types'

const MAN_BAN_TAY = 'ban-hang/3-1-1'   // cùng MAN_BAN ở ChungTuBanHang.tsx
/** Đường dẫn màn Xuất kho định lượng ở Bán hàng (gói Plus) */
export const DI_XDL = '/app/ban-hang/5-1-2'

/** Chứng từ bán hàng thật cần xuất kho định lượng: bỏ hoá đơn thay thế, điều chỉnh, huỷ bán và chứng từ chưa ghi sổ */
export const canXdlBanTay = (r: Row) => !r._loaiCt && (r.tt !== 'nhap' || Boolean(r._xdlSo))

let soBt = 6001
/** Tạo xuất kho định lượng cho chứng từ bán hàng lập tay đã lưu: ghi số phiếu vào chứng từ. Trả số phiếu. */
export function taoXdlBanTay(id: string, nguoi: string, ngay: string): string {
  const [, mm = '10', yyyy = '2026'] = ngay.split(' ')[0].split('/')
  const so = `XDL${yyyy.slice(2)}${mm}-${pad(soBt++, 4)}`
  suaPhieu(MAN_BAN_TAY, id, { _xdlSo: so, _xdlNguoi: nguoi, _xdlNgay: bayGio() })
  return so
}
