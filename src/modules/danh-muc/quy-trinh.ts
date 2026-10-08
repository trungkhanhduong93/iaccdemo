// Thứ tự khởi tạo danh mục: tài khoản, hàng hoá, kho, đối tượng, bảng giá, bút toán tự động
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Khởi tạo danh mục',
  buoc: [
    { chinh: { ten: 'Hệ thống tài khoản', icon: 'sotk', di: 'danh-muc/1-1' },
      duoi: [{ ten: 'Loại thuế', icon: 'loaithue', di: 'danh-muc/1-11' }] },
    { chinh: { ten: 'Hàng hoá từ FABi', icon: 'hanghoa', di: 'danh-muc/1-2', tone: 'fabi' },
      tren: [{ ten: 'Đơn vị tính', icon: 'dvt', di: 'danh-muc/1-3' }],
      duoi: [{ ten: 'Quy đổi đơn vị tính', icon: 'quydoi', di: 'danh-muc/1-4' }] },
    { chinh: { ten: 'Kho từ iPOS Inventory', icon: 'khohang', di: 'danh-muc/1-8', tone: 'ivt' },
      duoi: [{ ten: 'Quỹ tiền', icon: 'quytien', di: 'danh-muc/1-12' }] },
    { chinh: { ten: 'Khách hàng, nhà cung cấp', icon: 'users', di: 'danh-muc/1-5' },
      duoi: [{ ten: 'Mục chi phí', icon: 'receipt', di: 'danh-muc/1-6' }] },
    { chinh: { ten: 'Bảng giá', icon: 'banggia', di: 'danh-muc/1-14' },
      tren: [{ ten: 'Tiền tệ, tỷ giá', icon: 'tiente', di: 'danh-muc/1-9' }],
      duoi: [{ ten: 'Công việc', icon: 'congviec', di: 'danh-muc/1-7' }] },
    { chinh: { ten: 'Bút toán tự động', icon: 'buttoan', di: 'danh-muc/1-15' },
      duoi: [{ ten: 'Lý do nghiệp vụ', icon: 'lydo', di: 'danh-muc/1-16' }] },
  ],
  ghiChu: { tieuDe: 'Nguồn danh mục', dong: [['Hàng hoá, nhóm hàng', 'FABi'], ['Chi nhánh, khách hàng', 'FABi'], ['Kho, nguyên vật liệu', 'iPOS Inventory'],
    ['Nhà cung cấp, công thức', 'iPOS Inventory'], ['Tài khoản, bút toán', 'IACC Cloud']] },
  tienIch: ['tien-ich/11-1', 'tien-ich/11-3'],
}
