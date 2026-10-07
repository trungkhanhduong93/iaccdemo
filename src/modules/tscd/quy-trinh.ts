// Sơ đồ tài sản cố định: mua, ghi tăng, khấu hao hằng tháng, điều chuyển, ngừng khấu hao, thanh lý
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ tài sản cố định',
  buoc: [
    { chinh: { ten: 'Hoá đơn mua tài sản', icon: 'doc', di: 'mua-hang/4-1-2/moi' } },
    { chinh: { ten: 'Ghi tăng TSCĐ', icon: 'building', di: 'tscd/7-1-2/moi?loai=tang' },
      duoi: [{ ten: 'Danh sách TSCĐ', icon: 'grid', di: 'tscd/7-1-1' }] },
    { chinh: { ten: 'Tính khấu hao', icon: 'calc', di: 'tscd/7-1-3' } },
    { chinh: { ten: 'Điều chuyển TSCĐ', icon: 'swap', di: 'tscd/7-1-2/moi?loai=dc' },
      tren: [{ ten: 'Ngừng khấu hao', icon: 'clock', di: 'tscd/7-1-2/moi?loai=ngung' }],
      duoi: [{ ten: 'Thanh lý TSCĐ', icon: 'trash', di: 'tscd/7-1-2/moi?loai=tl' }] },
  ],
  baoCao: ['7-2-1', '7-2-2'],
  danhMuc: ['danh-muc/1-13', 'danh-muc/1-5'],
  tienIch: ['tien-ich/11-14'],
}
