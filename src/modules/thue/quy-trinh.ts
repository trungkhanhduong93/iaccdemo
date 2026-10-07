// Sơ đồ thuế GTGT: hoá đơn vào, ra; kê khai; bảng kê; tờ khai; nộp tờ khai và nộp tiền thuế. Hàng trên là mua vào, hàng dưới là bán ra
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ thuế GTGT',
  buoc: [
    { chinh: { ten: 'Nhận hoá đơn đầu vào', icon: 'mail', di: 'tien-ich/11-4', tone: 'hd' },
      duoi: [{ ten: 'Xuất hoá đơn điện tử', icon: 'receipt', di: 'ban-hang/3-1-5/moi', tone: 'hd' }] },
    { chinh: { ten: 'Kê khai thuế mua vào', icon: 'filein', di: 'thue/6-1-1/moi' },
      duoi: [{ ten: 'Kê khai thuế bán ra', icon: 'filein', di: 'thue/6-1-2/moi' }] },
    { chinh: { ten: 'Bảng kê mua vào', icon: 'doc', di: 'thue/6-2-1' },
      duoi: [{ ten: 'Bảng kê bán ra', icon: 'doc', di: 'thue/6-2-2' }] },
    { chinh: { ten: 'Tờ khai thuế GTGT', icon: 'percent', di: 'thue/6-2-3' } },
    { chinh: { ten: 'Nộp tờ khai', icon: 'send', di: 'tien-ich/11-9' } },
    { chinh: { ten: 'Nộp tiền thuế', icon: 'cashout', di: 'tien/2-1-1/moi?loai=unc' } },
  ],
  baoCao: ['6-2-3', '6-2-1', '6-2-2'],
  danhMuc: ['danh-muc/1-11', 'danh-muc/1-5'],
  tienIch: ['tien-ich/11-4', 'tien-ich/11-9'],
}
