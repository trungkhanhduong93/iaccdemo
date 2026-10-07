// Luồng dữ liệu tự động giữa FABi, iPOS Inventory, hoá đơn, ngân hàng, cơ quan thuế và IACC Cloud
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Luồng dữ liệu tự động',
  buoc: [
    { chinh: { ten: 'Đồng bộ bán hàng FABi', icon: 'pos', di: 'tien-ich/11-1', tone: 'fabi' },
      duoi: [{ ten: 'Đồng bộ kho iPOS Inventory', icon: 'box', di: 'tien-ich/11-3', tone: 'ivt' }] },
    { chinh: { ten: 'Xuất kho theo định lượng', icon: 'box', di: 'tien-ich/11-2' },
      duoi: [{ ten: 'Nhận hoá đơn đầu vào', icon: 'mail', di: 'tien-ich/11-4', tone: 'hd' }] },
    { chinh: { ten: 'Đối soát tự động', icon: 'scale', di: 'tien-ich/11-7' },
      duoi: [{ ten: 'Khớp sao kê ngân hàng', icon: 'bank', di: 'tien-ich/11-8' }] },
    { chinh: { ten: 'Duyệt chứng từ', icon: 'check', di: 'tien-ich/11-5' },
      duoi: [{ ten: 'AI nhập liệu', icon: 'sparkle', di: 'tien-ich/11-10' }] },
    { chinh: { ten: 'Cảnh báo cuối kỳ', icon: 'alert', di: 'tien-ich/11-6' },
      duoi: [{ ten: 'Nộp qua cơ quan thuế', icon: 'send', di: 'tien-ich/11-9' }] },
  ],
  ghiChu: { tieuDe: 'Kết nối', dong: [['FABi', 'Đồng bộ 14:20', 'ok'], ['iPOS Inventory', 'Đồng bộ 14:00', 'ok'], ['iPOS Invoice', 'Đã kết nối', 'ok'],
    ['Ngân hàng', '5 giao dịch chờ khớp', 'warn'], ['Cơ quan thuế', 'Chữ ký số hạn 12/2027', 'ok']] },
  tienIch: ['tien-ich/11-11', 'tien-ich/11-12', 'tien-ich/11-13', 'tien-ich/11-14'],
}
