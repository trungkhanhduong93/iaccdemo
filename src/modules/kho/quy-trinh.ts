// Sơ đồ nghiệp vụ kho: nhập, sơ chế và chế biến, xuất, kiểm kê, tính giá vốn
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ kho',
  buoc: [
    { ten: 'Nhập kho', chinh: { ten: 'Nhập khác', icon: 'filein', di: 'kho/5-1-1/moi' },
      tren: [{ ten: 'Phiếu mua hàng', icon: 'truck', di: 'mua-hang/4-1-1/moi' }],
      duoi: [{ ten: 'Điều chuyển kho', icon: 'swap', di: 'kho/5-1-4/moi' }] },
    { ten: 'Sơ chế, chế biến', chinh: { ten: 'Chế biến', icon: 'flask', di: 'kho/5-1-3/moi' },
      tren: [{ ten: 'Sơ chế', icon: 'chef', di: 'kho/5-1-6/moi' }],
      duoi: [{ ten: 'Công thức chế biến', icon: 'book', di: 'kho/9-1-3' }] },
    { ten: 'Xuất kho', chinh: { ten: 'Xuất bán POS', icon: 'pos', di: 'kho/5-1-2/moi' },
      tren: [{ ten: 'Xuất bán hàng', icon: 'cart', di: 'kho/5-1-2-2/moi' }],
      duoi: [{ ten: 'Xuất huỷ', icon: 'trash', di: 'kho/5-1-2-3/moi' }, { ten: 'Xuất khác', icon: 'more', di: 'kho/5-1-2-4/moi' }] },
    { ten: 'Kiểm kê', chinh: { ten: 'Kiểm kê kho', icon: 'clipboard', di: 'kho/5-1-10/moi' },
      duoi: [{ ten: 'Định mức tồn kho', icon: 'chart', di: 'kho/5-1-13' }] },
    { ten: 'Tính giá', chinh: { ten: 'Tính giá vốn', icon: 'calc', di: 'kho/5-1-7' },
      tren: [{ ten: 'Bổ sung giá nhập', icon: 'edit', di: 'kho/5-1-11/moi' }],
      duoi: [{ ten: 'Giá thành đơn giản', icon: 'flask', di: 'kho/5-1-8' }] },
  ],
  // Gói Free (T123): hàng mua vào, bán ra làm nên tồn hệ thống; kiểm kê đối chiếu tồn thực tế, thiếu thì xuất điều chỉnh, thừa thì nhập điều chỉnh
  hoiTuFree: {
    lan: [
      { ten: 'Nhập kho', tone: 'ok', nut: [
        { ten: 'Phiếu mua hàng', icon: 'truck', di: 'mua-hang/4-1-1/moi' },
      ] },
      { ten: 'Xuất kho', tone: 'err', nut: [
        { ten: 'Xuất bán POS', icon: 'pos', di: 'ban-hang/3-1-1' },
      ] },
      { ten: 'Kiểm kê', icon: 'clipboard', tone: 'info', nut: [
        { ten: 'Tồn hệ thống', icon: 'box', di: '' },   // tồn theo sổ sau mua vào, bán ra; chỉ để xem
        { ten: 'Kiểm kê kho', icon: 'clipboard', di: 'kho/5-1-10/moi', noi: 'đối chiếu' },
      ] },
      // Chênh lệch sau kiểm kê: phiếu kiểm kê tự hạch toán phần thiếu, thừa nên hai ô chỉ để xem, không mở màn
      { ten: 'Điều chỉnh', icon: 'scale', tone: 'ad', nut: [
        { ten: 'Xuất điều chỉnh (hàng thiếu)', icon: 'cashout', di: '' },
        { ten: 'Nhập điều chỉnh (hàng thừa)', icon: 'filein', di: '' },
      ] },
    ],
    ra: { ten: 'Báo cáo', nut: [
      { ten: 'Báo cáo xuất nhập tồn', icon: 'chart', di: 'kho/5-2-3' },
    ] },
  },
  baoCao: ['5-2-3', '5-2-4', '5-2-1', '5-2-2', '5-2-5'],
  danhMuc: ['danh-muc/1-8', 'danh-muc/1-2', 'danh-muc/1-3', 'danh-muc/1-4'],
  tienIch: ['tien-ich/11-3', 'tien-ich/11-15'],   // bỏ 11.2 (T100)
}
