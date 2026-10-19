// Sơ đồ nghiệp vụ bán hàng: đơn POS từ FABi thành chứng từ, xuất hoá đơn, thu tiền, đối soát
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ bán hàng',
  buoc: [
    { chinh: { ten: 'Đơn POS từ FABi', icon: 'pos', di: '', tone: 'fabi' } },   // ô nguồn, không bấm được (T100)
    { chinh: { ten: 'Xuất bán POS', icon: 'cart', di: 'ban-hang/3-1-1' },
      tren: [{ ten: 'Bán hàng nội bộ', icon: 'store', di: 'ban-hang/3-1-3/moi' }],
      duoi: [{ ten: 'Hàng bán trả lại', icon: 'back', di: 'ban-hang/3-1-4/moi' }] },
    { chinh: { ten: 'Xuất hoá đơn điện tử', icon: 'receipt', di: 'ban-hang/3-1-5/moi', tone: 'hd' },
      tren: [{ ten: 'Hoá đơn bán hàng', icon: 'doc', di: 'ban-hang/3-1-2/moi' }],
      duoi: [{ ten: 'Điều chỉnh, thay thế hoá đơn', icon: 'edit', di: 'ban-hang/3-1-6/moi' }] },
    { chinh: { ten: 'Thu tiền', icon: 'cashin', di: 'tien/2-1-1/moi?loai=thu' },
      duoi: [{ ten: 'Thu ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=bc' }] },
    { chinh: { ten: 'Đối soát với POS', icon: 'scale', di: 'ban-hang/3-2-2' } },
  ],
  // Gói Free (T98): kiểu hội tụ như Mua hàng, Thu chi; đơn POS từ FABi đồng bộ thành Xuất bán POS rồi về báo cáo.
  // Sổ doanh thu hiện khi gói Free có (T97 của Trum mở 3.2.5); 3.2.1, 3.2.3 đã bỏ ở mọi gói (T99)
  hoiTuFree: {
    lan: [
      // Nhãn làn đã là nguồn FABi nên bỏ ô Đơn POS từ FABi trùng ý; mũi tên đồng bộ đi từ nhãn làn (T121)
      { ten: 'Bán hàng từ FABi', icon: 'pos', tone: 'ok', nut: [
        { ten: 'Xuất bán POS', icon: 'cart', di: 'ban-hang/3-1-1', noi: 'đồng bộ' },
      ] },
    ],
    // Bỏ Sổ doanh thu, thay bằng tồn kho và xuất kho do bán hàng sinh ra, PhuongXT chốt 15/10/2026 (T262)
    ra: { ten: 'Báo cáo', nut: [
      { ten: 'Báo cáo xuất nhập tồn', icon: 'box', di: 'kho/5-2-3' },
      { ten: 'Tổng hợp xuất kho', icon: 'cashout', di: 'kho/5-2-11' },
      { ten: 'Chi tiết xuất kho', icon: 'cashout', di: 'kho/5-2-12' },
    ] },
  },
  // Gói Free dùng sơ đồ bước theo kỳ (mẫu C, T367): đơn POS -> thu tiền -> doanh thu (T459 bỏ bước trừ kho nguyên liệu)
  buocKyFree: [
    {
      ten: 'Bán hàng qua POS',
      moTa: 'Đơn bán từ máy thu ngân FABi tự động chuyển thành chứng từ.',
      ghiChu: 'Đơn bán từ máy tính tiền FABi tự động về phần mềm, không cần gõ lại.',
      nut: [
        // bỏ ô Đơn POS từ FABi, chỉ còn Xuất bán POS (T460)
        { ten: 'Xuất bán POS', icon: 'cart', di: 'ban-hang/3-1-1', chieu: 'ra', moTa: 'Chứng từ bán hàng tự động đồng bộ' },
      ],
    },
    {
      ten: 'Thu tiền bán hàng',
      moTa: 'Ghi nhận tiền khách trả tại quán bằng tiền mặt hoặc chuyển khoản.',
      nut: [
        { ten: 'Thu tiền mặt', icon: 'cashin', di: 'tien/2-1-1/moi?loai=thu', taoMoi: 'tien/2-1-1/moi?loai=thu', moTa: 'Tiền mặt khách trả tại quầy' },
        { ten: 'Thu ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=bc', taoMoi: 'tien/2-1-1/moi?loai=bc', moTa: 'Khách chuyển khoản hoặc quét mã QR' },
      ],
    },
    {
      ten: 'Doanh thu bán hàng',
      moTa: 'Theo dõi tổng doanh thu bán món theo ngày, tháng.',
      ghiChu: 'Doanh thu tổng hợp tự động từ các hoá đơn bán thành công.',
      // Hai báo cáo bán hàng của gói Free (T458); bỏ bước Xuất kho nguyên liệu, xem ở phân hệ Kho (T459)
      nut: [
        { ten: 'Tổng hợp bán hàng', icon: 'book', di: 'ban-hang/3-2-7', moTa: 'Doanh thu từng mặt hàng trong kỳ' },
        { ten: 'Bảng kê chi tiết bán hàng', icon: 'doc', di: 'ban-hang/3-2-8', moTa: 'Từng món bán theo hoá đơn, kênh bán' },
      ],
    },
  ],
  baoCao: ['3-2-5', '3-2-2', '3-2-4', 'thue/6-2-2'],
  danhMuc: ['danh-muc/1-2', 'danh-muc/1-5', 'danh-muc/1-14'],
  tienIch: ['tien-ich/11-7'],   // bỏ 11.1, 11.2 (T100)
}
