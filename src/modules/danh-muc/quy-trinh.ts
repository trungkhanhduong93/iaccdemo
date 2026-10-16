// Sơ đồ khởi tạo danh mục kiểu hội tụ: nền tảng, chi phí, kho, hàng hoá, đối tượng, tiền, hạch toán cùng đổ về sẵn sàng nhập liệu (T146)
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Khởi tạo danh mục',
  danhSo: true,
  buoc: [],
  hoiTu: {
    lan: [
      {
        ten: 'Nền tảng', icon: 'chinhanh', nut: [
          { ten: 'Cửa hàng', icon: 'chinhanh', di: 'danh-muc/cua-hang' },
          { ten: 'Hệ thống tài khoản', icon: 'sotk', di: 'danh-muc/1-1' },
          { ten: 'Loại thuế', icon: 'loaithue', di: 'danh-muc/1-11' },
          { ten: 'Tiền tệ', icon: 'tiente', di: 'danh-muc/1-9' },
          { ten: 'Tỷ giá', icon: 'tygia', di: 'danh-muc/1-10' },
        ],
      },
      {
        ten: 'Chi phí', icon: 'receipt', nut: [
          { ten: 'Nhóm mục chi phí', icon: 'receipt', di: 'danh-muc/nhom-muc-chi-phi' },
          { ten: 'Mục chi phí', icon: 'receipt', di: 'danh-muc/1-6' },
          { ten: 'Nhóm công việc', icon: 'congviec', di: 'danh-muc/nhom-cong-viec' },
          { ten: 'Công việc', icon: 'congviec', di: 'danh-muc/1-7' },
        ],
      },
      {
        ten: 'Kho', icon: 'khohang', nut: [
          { ten: 'Nhóm kho', icon: 'khohang', di: 'danh-muc/nhom-kho' },
          { ten: 'Kho', icon: 'khohang', di: 'danh-muc/1-8', tone: 'ivt' },
        ],
      },
      {
        ten: 'Hàng hoá', icon: 'hanghoa', nut: [
          { ten: 'Đơn vị tính', icon: 'dvt', di: 'danh-muc/1-3' },
          { ten: 'Nhóm hàng hoá', icon: 'hanghoa', di: 'danh-muc/nhom-hang-hoa' },
          { ten: 'Hàng hoá', icon: 'hanghoa', di: 'danh-muc/1-2', tone: 'fabi' },
          { ten: 'Quy đổi ĐVT', icon: 'quydoi', di: 'danh-muc/1-4' },
          { ten: 'Bảng giá', icon: 'banggia', di: 'danh-muc/1-14' },
        ],
      },
      {
        ten: 'Đối tượng', icon: 'users', nut: [
          { ten: 'Nhóm đối tượng', icon: 'users', di: 'danh-muc/nhom-doi-tuong' },
          { ten: 'Khách hàng, nhà cung cấp', icon: 'users', di: 'danh-muc/1-5' },
        ],
      },
      {
        ten: 'Tiền', icon: 'quytien', nut: [
          { ten: 'Quỹ tiền', icon: 'quytien', di: 'danh-muc/1-12' },
          { ten: 'Phương thức thanh toán', icon: 'quytien', di: 'danh-muc/phuong-thuc-thanh-toan' },
        ],
      },
      {
        ten: 'Hạch toán', icon: 'buttoan', nut: [
          { ten: 'Lý do', icon: 'lydo', di: 'danh-muc/1-16' },
          { ten: 'Bút toán tự động', icon: 'buttoan', di: 'danh-muc/1-15' },
        ],
      },
    ],
    ra: {
      ten: 'Sẵn sàng nhập liệu',
      icon: 'db',
      nut: [
        { ten: 'Số dư ban đầu', icon: 'db', di: 'tien/so-du-ban-dau' },
        { ten: 'Số dư ban đầu', icon: 'db', di: 'tong-hop/10-1-3' },
      ],
    },
  },
  khongBaoCao: true,
  ghiChu: {
    tieuDe: 'Nguồn danh mục',
    dong: [
      ['Hàng hoá, nhóm hàng', 'FABi'],
      ['Cửa hàng, khách hàng', 'FABi'],
      ['Kho, nguyên vật liệu', 'iPOS Inventory'],
      ['Nhà cung cấp, công thức', 'iPOS Inventory'],
      ['Tài khoản, bút toán', 'IACC Cloud'],
    ],
  },
  tienIch: ['tien-ich/11-3'],
}
