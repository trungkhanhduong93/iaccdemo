// Sơ đồ nghiệp vụ bán hàng: đơn POS từ FABi thành chứng từ, xuất hoá đơn, thu tiền, đối soát
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ bán hàng',
  buoc: [
    { chinh: { ten: 'Đơn POS từ FABi', icon: 'pos', di: 'tien-ich/11-1', tone: 'fabi' } },
    { chinh: { ten: 'Chứng từ bán hàng', icon: 'cart', di: 'ban-hang/3-1-1/moi' },
      tren: [{ ten: 'Bán hàng nội bộ', icon: 'store', di: 'ban-hang/3-1-3/moi' }],
      duoi: [{ ten: 'Hàng bán trả lại', icon: 'back', di: 'ban-hang/3-1-4/moi' }] },
    { chinh: { ten: 'Xuất hoá đơn điện tử', icon: 'receipt', di: 'ban-hang/3-1-5/moi', tone: 'hd' },
      tren: [{ ten: 'Hoá đơn bán hàng', icon: 'doc', di: 'ban-hang/3-1-2/moi' }],
      duoi: [{ ten: 'Điều chỉnh, thay thế hoá đơn', icon: 'edit', di: 'ban-hang/3-1-6/moi' }] },
    { chinh: { ten: 'Thu tiền', icon: 'cashin', di: 'tien/2-1-1/moi?loai=thu' },
      duoi: [{ ten: 'Thu qua ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=bc' }] },
    { chinh: { ten: 'Đối soát với POS', icon: 'scale', di: 'ban-hang/3-2-2' } },
  ],
  baoCao: ['3-2-1', '3-2-3', '3-2-2', '3-2-4', 'thue/6-2-2'],
  danhMuc: ['danh-muc/1-2', 'danh-muc/1-5', 'danh-muc/1-14'],
  tienIch: ['tien-ich/11-1', 'tien-ich/11-2', 'tien-ich/11-7'],
}
