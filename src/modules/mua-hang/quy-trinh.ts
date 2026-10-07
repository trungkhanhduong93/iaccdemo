// Sơ đồ nghiệp vụ mua hàng: phiếu nhập từ iPOS Inventory, hoá đơn mua, trả tiền nhà cung cấp, đối chiếu công nợ
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ mua hàng',
  buoc: [
    { chinh: { ten: 'Phiếu nhập từ iPOS Inventory', icon: 'box', di: 'tien-ich/11-3', tone: 'ivt' },
      duoi: [{ ten: 'Mua hàng qua sơ chế', icon: 'chef', di: 'mua-hang/4-1-3/moi' }] },
    { chinh: { ten: 'Phiếu mua hàng', icon: 'truck', di: 'mua-hang/4-1-1/moi' },
      tren: [{ ten: 'Chi phí mua hàng', icon: 'layers', di: 'mua-hang/4-1-5/moi' }],
      duoi: [{ ten: 'Trả lại hàng mua', icon: 'back', di: 'mua-hang/4-1-4/moi' }] },
    { chinh: { ten: 'Hoá đơn mua hàng', icon: 'doc', di: 'mua-hang/4-1-2/moi' },
      tren: [{ ten: 'Nhận hoá đơn đầu vào', icon: 'mail', di: 'tien-ich/11-4', tone: 'hd' }],
      duoi: [{ ten: 'Bổ sung hoá đơn', icon: 'filein', di: 'mua-hang/4-1-6/moi' }] },
    { chinh: { ten: 'Trả tiền nhà cung cấp', icon: 'cashout', di: 'tien/2-1-1/moi?loai=unc' },
      duoi: [{ ten: 'Chi tiền mặt', icon: 'cashout', di: 'tien/2-1-1/moi?loai=chi' }] },
    { chinh: { ten: 'Đối chiếu công nợ', icon: 'scale', di: 'tien/2-1-2/moi' } },
  ],
  baoCao: ['4-2-1', '4-2-2', 'tien/2-2-5', 'thue/6-2-1', 'kho/5-2-2'],
  danhMuc: ['danh-muc/1-5', 'danh-muc/1-2', 'danh-muc/1-14'],
  tienIch: ['tien-ich/11-3', 'tien-ich/11-4', 'tien-ich/11-10'],
}
