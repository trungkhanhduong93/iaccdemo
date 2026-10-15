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
  // Gói Free: sơ đồ ngang 4 bước của hộp tờ khai (ToKhaiHKD.tsx) như iFaster, ô mở tờ khai chưa nộp mới nhất đúng bước đó;
  // khung Báo cáo là sổ sách TT152 của hộ kinh doanh, chỉ hiện sổ đơn vị mở được (T261)
  tenFree: 'Quy trình lập tờ khai thuế',
  moTaFree: 'Tờ khai lấy doanh thu từ FABi, tính GTGT, TNCN theo tỷ lệ của ngành nghề.',
  anDuoiFree: true,   // bỏ Danh mục liên quan, PhuongXT chốt 15/10/2026
  // Gói Free (T267): sơ đồ hội tụ như Thu chi, Mua hàng; các làn nghiệp vụ đổ về Sổ sách, báo cáo
  hoiTuFree: {
    lan: [
      { ten: 'Lập tờ khai', tone: 'ok', nut: [
        { ten: 'Thông tin hộ kinh doanh', icon: 'user', di: 'thue/to-khai?buoc=1' },
        { ten: 'Kê khai doanh thu', icon: 'cashin', di: 'thue/to-khai?buoc=2' },
        { ten: 'Khai phụ lục', icon: 'doc', di: 'thue/to-khai?buoc=3' },
        { ten: 'Xem và nộp tờ khai', icon: 'send', di: 'thue/to-khai?buoc=4' },
      ] },
    ],
    ra: { ten: 'Sổ sách, báo cáo', nut: [
      { ten: 'Sổ doanh thu bán hàng', icon: 'book', di: 'ban-hang/3-2-5' },
      { ten: 'Sổ chi tiết doanh thu, chi phí', icon: 'doc', di: 'tong-hop/10-4-1' },
      { ten: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá', icon: 'box', di: 'kho/5-2-8' },
      { ten: 'Sổ chi tiết tiền', icon: 'wallet', di: 'tien/2-2-7' },
      { ten: 'Sổ theo dõi nghĩa vụ thuế khác', icon: 'percent', di: 'thue/6-2-5' },
    ] },
  },
  baoCao: ['6-2-3', '6-2-1', '6-2-2'],
  danhMuc: ['danh-muc/1-11', 'danh-muc/1-5'],
  tienIch: ['tien-ich/11-4', 'tien-ich/11-9'],
}
