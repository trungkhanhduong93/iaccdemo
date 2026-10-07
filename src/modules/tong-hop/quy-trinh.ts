// Sơ đồ tổng hợp: chứng từ nghiệp vụ khác, kiểm tra, kết chuyển, khoá sổ, báo cáo tài chính
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ tổng hợp',
  buoc: [
    { chinh: { ten: 'Chứng từ tổng hợp', icon: 'doc', di: 'tong-hop/10-1-1/moi' },
      tren: [{ ten: 'Số dư ban đầu', icon: 'db', di: 'tong-hop/10-1-3' }],
      duoi: [{ ten: 'Doanh thu trả trước', icon: 'calendar', di: 'tong-hop/10-1-2' }] },
    { chinh: { ten: 'Kiểm tra cuối kỳ', icon: 'check', di: 'tong-hop/10-1-4' },
      duoi: [{ ten: 'Cảnh báo số liệu', icon: 'alert', di: 'tien-ich/11-6' }] },
    { chinh: { ten: 'Kết chuyển cuối kỳ', icon: 'swap', di: 'tong-hop/10-1-5' } },
    { chinh: { ten: 'Khoá sổ', icon: 'shield', di: 'tong-hop/10-1-6' } },
    { chinh: { ten: 'Báo cáo tài chính', icon: 'chart', di: 'tong-hop/10-2-2' },
      tren: [{ ten: 'Báo cáo quản trị F&B', icon: 'pulse', di: 'tong-hop/10-3-1' }],
      duoi: [{ ten: 'Kết chuyển số dư', icon: 'arrow', di: 'tong-hop/10-1-9' }] },
  ],
  baoCao: ['10-2-2', '10-2-3', '10-2-1', '10-2-4', '10-3-1'],
  danhMuc: ['danh-muc/1-1', 'danh-muc/1-15'],
  tienIch: ['tien-ich/11-6', 'tien-ich/11-12', 'tien-ich/11-14'],
}
