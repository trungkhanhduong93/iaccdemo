// Sơ đồ nghiệp vụ mua hàng kiểu hội tụ như Thu chi (T63): nhập hàng, hoá đơn, trả lại, trả tiền nhà cung cấp, đối chiếu công nợ cùng đổ về sổ sách, báo cáo mua hàng
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ mua hàng',
  buoc: [],
  hoiTu: {
    lan: [
      { ten: 'Nhập hàng', tone: 'ok', nut: [
        { ten: 'Phiếu mua hàng', icon: 'truck', di: 'mua-hang/4-1-1/moi' },
        { ten: 'Mua hàng qua sơ chế', icon: 'chef', di: 'mua-hang/4-1-3/moi' },
        { ten: 'Chi phí mua hàng', icon: 'layers', di: 'mua-hang/4-1-5/moi' },
      ] },
      { ten: 'Hoá đơn, trả lại', tone: 'info', nut: [
        { ten: 'Hoá đơn mua hàng', icon: 'doc', di: 'mua-hang/4-1-2/moi' },
        { ten: 'Nhận hoá đơn đầu vào', icon: 'mail', di: 'tien-ich/11-4' },
        { ten: 'Bổ sung hoá đơn', icon: 'filein', di: 'mua-hang/4-1-6/moi' },
        { ten: 'Trả lại hàng mua', icon: 'back', di: 'mua-hang/4-1-4/moi' },
      ] },
      { ten: 'Thanh toán', tone: 'err', nut: [
        { ten: 'Chi ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=unc' },
        { ten: 'Chi tiền mặt', icon: 'cashout', di: 'tien/2-1-1/moi?loai=chi' },
      ] },
      { ten: 'Đối chiếu công nợ', tone: 'ad', nut: [
        { ten: 'Biên bản đối chiếu công nợ', icon: 'scale', di: 'tien/2-1-2/moi' },
      ] },
    ],
    ra: { ten: 'Sổ sách, báo cáo', nut: [
      { ten: 'Tổng hợp mua hàng', icon: 'truck', di: 'mua-hang/4-2-2' },
      { ten: 'Chi tiết mua hàng', icon: 'doc', di: 'mua-hang/4-2-1' },
      { ten: 'Tổng hợp nhập', icon: 'box', di: 'mua-hang/4-2-4' },
      { ten: 'Chi tiết nhập', icon: 'filein', di: 'mua-hang/4-2-5' },
      { ten: 'Sổ công nợ nhà cung cấp', icon: 'users', di: 'mua-hang/4-2-3' },
    ] },
  },
  baoCao: ['4-2-2', '4-2-1', '4-2-4', '4-2-5', '4-2-3', 'tien/2-2-5', 'thue/6-2-1', 'kho/5-2-2'],
  danhMuc: ['danh-muc/1-5', 'danh-muc/1-2', 'danh-muc/1-14'],
  tienIch: ['tien-ich/11-4', 'tien-ich/11-10'],   // bỏ tải từ iPOS Inventory (T64)
}
