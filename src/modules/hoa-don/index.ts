// Phân hệ Hoá đơn điện tử, ngay trên Kê khai thuế (QD106, T786): danh sách hoá đơn, cặp điều chỉnh thay thế, thông báo sai sót.
// Thay tab 3.1.5, 3.1.6 ở Bán hàng; mở ở gói có 3.1.5 (Plus, Pro)
import type { ModuleDef } from '../types'
import { DieuChinhThayThe, DsHoaDon, ThongBaoSaiSot } from './HoaDonDienTu'

const hoaDon: ModuleDef = {
  key: 'hoa-don', ten: 'Hoá đơn điện tử', ngan: 'Hoá đơn', icon: 'receipt',
  mota: 'Hoá đơn điện tử đã lập, điều chỉnh, thay thế, thông báo sai sót gửi cơ quan thuế',
  screens: [
    { slug: 'hddt', ten: 'Hoá đơn điện tử', ngan: 'Hoá đơn điện tử', nhom: 'Chứng từ', kind: 'custom', comp: DsHoaDon, can: ['3.1.5'] },
    { slug: 'dieu-chinh', ten: 'Điều chỉnh thay thế', ngan: 'Điều chỉnh thay thế', nhom: 'Chứng từ', kind: 'custom', comp: DieuChinhThayThe, can: ['3.1.6'] },
    { slug: 'sai-sot', ten: 'Thông báo sai sót', ngan: 'Thông báo sai sót', nhom: 'Chứng từ', kind: 'custom', comp: ThongBaoSaiSot, can: ['3.1.5'] },
  ],
}
export default hoaDon
