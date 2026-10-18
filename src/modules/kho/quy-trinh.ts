// Sơ đồ nghiệp vụ kho: nhập, sơ chế và chế biến, xuất, kiểm kê, tính giá vốn
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ kho',
  buoc: [
    { ten: 'Nhập kho', chinh: { ten: 'Nhập khác', icon: 'filein', di: 'kho/5-1-1/moi' },
      tren: [{ ten: 'Phiếu mua hàng', icon: 'truck', di: 'mua-hang/4-1-1/moi' }],
      // Điều chuyển tách ba phiếu (T155): nhập từ cửa hàng khác, chuyển giữa các kho cùng cửa hàng; xuất sang cửa hàng khác ở bước Xuất kho
      duoi: [{ ten: 'Nhập điều chuyển', icon: 'filein', di: 'kho/5-1-4-2/moi' }, { ten: 'Chuyển kho', icon: 'swap', di: 'kho/5-1-4-3/moi' }] },
    // Sản xuất theo IVT (T152): sơ chế tách, chế biến gộp; phiếu nhập tham chiếu phiếu xuất. Hai màn công thức ở hàng Danh mục liên quan
    { ten: 'Sơ chế, chế biến', chinh: { ten: 'Xuất chế biến', icon: 'flask', di: 'kho/5-1-3/moi' },
      tren: [{ ten: 'Xuất sơ chế', icon: 'chef', di: 'kho/5-1-6/moi' }, { ten: 'Nhập sơ chế', icon: 'chef', di: 'kho/5-1-6-2/moi' }],
      duoi: [{ ten: 'Nhập chế biến', icon: 'filein', di: 'kho/5-1-3-2/moi' }] },
    { ten: 'Xuất kho', chinh: { ten: 'Xuất bán POS', icon: 'pos', di: 'kho/5-1-2/moi' },
      tren: [{ ten: 'Xuất bán hàng', icon: 'cart', di: 'kho/5-1-2-2/moi' }, { ten: 'Xuất điều chuyển', icon: 'truck', di: 'kho/5-1-4/moi' }],
      duoi: [{ ten: 'Xuất huỷ', icon: 'trash', di: 'kho/5-1-2-3/moi' }, { ten: 'Xuất khác', icon: 'more', di: 'kho/5-1-2-4/moi' }] },
    { ten: 'Kiểm kê', chinh: { ten: 'Kiểm kê kho', icon: 'clipboard', di: 'kho/5-1-10/moi' },
      duoi: [{ ten: 'Định mức tồn kho', icon: 'chart', di: 'kho/5-1-13' }] },
    { ten: 'Tính giá', chinh: { ten: 'Tính giá vốn', icon: 'calc', di: 'kho/5-1-7' },
      tren: [{ ten: 'Bổ sung giá nhập', icon: 'edit', di: 'kho/5-1-11/moi' }],
      duoi: [{ ten: 'Giá thành đơn giản', icon: 'flask', di: 'kho/5-1-8' }] },
  ],
  // Gói Free (T267): sơ đồ hội tụ như Thu chi, Mua hàng; các làn nghiệp vụ đổ về Sổ sách, báo cáo
  moTaFree: 'Theo dõi nhập xuất tồn nguyên vật liệu, hàng hoá và kiểm kê thực tế theo kỳ.',
  hoiTuFree: {
    lan: [
      { ten: 'Nhập hàng', tone: 'ok', nut: [
        { ten: 'Mua hàng', icon: 'truck', di: 'mua-hang/4-1-1' },
      ] },
      { ten: 'Xuất hàng', tone: 'err', nut: [
        { ten: 'Bán hàng', icon: 'pos', di: 'ban-hang/3-1-1' },
      ] },
      { ten: 'Kiểm kê', tone: 'info', nut: [
        { ten: 'Tồn hệ thống', icon: 'box', di: '', tone: 'kq' },
        { ten: 'Kiểm kê kho', icon: 'clipboard', di: 'kho/5-1-10', noi: 'so sánh' },
        { ten: 'Xuất điều chỉnh', icon: 'xuatkho', di: 'kho/dieu-chinh?loai=xdc' },
        { ten: 'Nhập điều chỉnh', icon: 'nhapkho', di: 'kho/dieu-chinh?loai=ndc' },
      ] },
    ],
    ra: { ten: 'Sổ sách, báo cáo', nut: [
      { ten: 'Báo cáo xuất nhập tồn', icon: 'box', di: 'kho/5-2-3' },
      { ten: 'Báo cáo kiểm kê', icon: 'clipboard', di: 'kho/5-2-15' },
      { ten: 'Tổng hợp xuất kho', icon: 'xuatkho', di: 'kho/5-2-11' },
      { ten: 'Chi tiết xuất kho', icon: 'xuatkho', di: 'kho/5-2-12' },
      { ten: 'Tổng hợp nhập kho', icon: 'nhapkho', di: 'kho/5-2-9' },
      { ten: 'Chi tiết nhập kho', icon: 'nhapkho', di: 'kho/5-2-10' },
    ] },
  },
  // Gói Free (T368): sơ đồ bước theo kỳ (mẫu C), ưu tiên trên hoiTuFree
  buocKyFree: [
    {
      ten: 'Nhập xuất hằng ngày',
      moTa: 'Ghi nhận hàng mua vào và hàng bán ra mỗi ngày.',
      ghiChu: 'Hàng nhập theo hoá đơn và xuất bán tự động qua máy thu ngân POS.',
      nut: [
        { ten: 'Mua hàng', icon: 'truck', di: 'mua-hang/4-1-1', taoMoi: 'mua-hang/4-1-1/moi', chieu: 'vao', moTa: 'Nhập hàng từ nhà cung cấp' },
        { ten: 'Bán hàng', icon: 'pos', di: 'ban-hang/3-1-1', chieu: 'ra', moTa: 'Xuất kho theo đơn bán POS' },
      ],
    },
    {
      ten: 'Kiểm kê kho',
      moTa: 'So sánh tồn trên máy với hàng thực tế để xử lý thừa thiếu.',
      ghiChu: 'Định kỳ kiểm đếm để bù trừ chênh lệch và chống thất thoát.',
      nut: [
        { ten: 'Tồn hệ thống', icon: 'box', di: '', tone: 'kq', moTa: 'Số lượng máy tính đang tính' },
        { ten: 'Kiểm kê kho', icon: 'clipboard', di: 'kho/5-1-10', noi: 'so sánh', taoMoi: 'kho/5-1-10/moi', moTa: 'Đếm số lượng thực tế tại kho' },
        { ten: 'Xuất điều chỉnh', icon: 'xuatkho', di: 'kho/dieu-chinh?loai=xdc', chieu: 'noi', moTa: 'Ghi giảm khi hàng thực tế thiếu' },
        { ten: 'Nhập điều chỉnh', icon: 'nhapkho', di: 'kho/dieu-chinh?loai=ndc', chieu: 'noi', moTa: 'Ghi tăng khi hàng thực tế thừa' },
      ],
    },
    {
      ten: 'Theo dõi nhập xuất',
      moTa: 'Xem chi tiết và tổng hợp hàng hoá luân chuyển trong kỳ.',
      ghiChu: 'Đối chiếu số lượng và tiền hàng vào ra của từng mặt hàng.',
      nut: [
        { ten: 'Tổng hợp nhập kho', icon: 'nhapkho', di: 'kho/5-2-9', chieu: 'vao', moTa: 'Tổng số lượng và tiền hàng nhập' },
        { ten: 'Chi tiết nhập kho', icon: 'nhapkho', di: 'kho/5-2-10', chieu: 'vao', moTa: 'Từng lần nhập hàng theo phiếu' },
        { ten: 'Tổng hợp xuất kho', icon: 'xuatkho', di: 'kho/5-2-11', chieu: 'ra', moTa: 'Tổng số lượng và tiền hàng xuất' },
        { ten: 'Chi tiết xuất kho', icon: 'xuatkho', di: 'kho/5-2-12', chieu: 'ra', moTa: 'Từng lần xuất hàng theo phiếu' },
      ],
    },
    {
      ten: 'Báo cáo tồn kho',
      moTa: 'Xem tồn kho tổng thể và kết quả sau khi kiểm đếm.',
      ghiChu: 'Nắm lượng tồn để chủ động đặt hàng và quản lý hao hụt.',
      nut: [
        { ten: 'Báo cáo xuất nhập tồn', icon: 'box', di: 'kho/5-2-3', moTa: 'Tồn đầu, nhập xuất và tồn cuối kỳ' },
        { ten: 'Báo cáo kiểm kê', icon: 'clipboard', di: 'kho/5-2-15', moTa: 'Chi tiết chênh lệch thừa thiếu' },
      ],
    },
  ],
  baoCao: ['5-2-3', '5-2-4', '5-2-1', '5-2-2', '5-2-5'],
  danhMuc: ['danh-muc/1-8', 'danh-muc/1-2', 'danh-muc/1-3', 'danh-muc/1-4', 'kho/5-1-5', 'kho/9-1-3'],
  tienIch: ['tien-ich/11-3', 'tien-ich/11-15'],   // bỏ 11.2 (T100)
}
