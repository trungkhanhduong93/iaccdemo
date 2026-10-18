// Sơ đồ nghiệp vụ tiền kiểu hội tụ: số dư đầu kỳ, thu tiền, chi tiền (tiền mặt và ngân hàng), chuyển quỹ, đối chiếu công nợ, phân bổ chi phí chuỗi cùng đổ về sổ sách quỹ
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ thu chi',
  buoc: [],
  hoiTu: {
    lan: [
      // Gói Free khai số dư tiền ở Thu chi, gói khác ở Tổng hợp 10.1.3; mỗi gói chỉ thấy một ô (T141)
      { ten: 'Số dư đầu kỳ', tone: 'info', nut: [
        { ten: 'Số dư ban đầu', icon: 'db', di: 'tien/so-du-ban-dau' },
        { ten: 'Số dư ban đầu', icon: 'db', di: 'tong-hop/10-1-3' },
      ] },
      { ten: 'Thu tiền', tone: 'ok', nut: [
        { ten: 'Thu tiền mặt', icon: 'cashin', di: 'tien/2-1-1/moi?loai=thu' },
        { ten: 'Thu ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=bc' },
      ] },
      { ten: 'Chi tiền', tone: 'err', nut: [
        { ten: 'Chi tiền mặt', icon: 'cashout', di: 'tien/2-1-1/moi?loai=chi' },
        { ten: 'Chi ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=unc' },
      ] },
      { ten: 'Chuyển quỹ', tone: 'info', nut: [
        { ten: 'Chuyển quỹ', icon: 'swap', di: 'tien/2-1-1/moi?loai=cq' },
      ] },
      { ten: 'Đối chiếu công nợ', tone: 'ad', nut: [
        { ten: 'Biên bản đối chiếu công nợ', icon: 'scale', di: 'tien/2-1-2/moi' },
      ] },
      { ten: 'Phân bổ chi phí chuỗi', tone: 'st', nut: [
        { ten: 'Phân bổ chi phí chuỗi', icon: 'layers', di: 'tien/2-1-3' },
      ] },
    ],
    ra: { ten: 'Sổ sách, báo cáo', nut: [
      { ten: 'Sổ quỹ tiền mặt', icon: 'wallet', di: 'tien/2-2-1' },
      { ten: 'Sổ ngân hàng', icon: 'bank', di: 'tien/2-2-3' },
      { ten: 'Sổ công nợ', icon: 'users', di: 'tien/2-2-5' },
      { ten: 'Sổ tài khoản', icon: 'book', di: 'tien/2-2-2' },
      { ten: 'Sổ nhật ký', icon: 'doc', di: 'tien/2-2-4' },
    ] },
  },
  // Gói Free (T262): sổ quỹ, sổ ngân hàng và Công nợ nhà cung cấp
  raFree: { ten: 'Sổ sách, báo cáo', nut: [
    { ten: 'Sổ quỹ tiền mặt', icon: 'wallet', di: 'tien/2-2-1' },
    { ten: 'Sổ ngân hàng', icon: 'bank', di: 'tien/2-2-3' },
    { ten: 'Công nợ nhà cung cấp', icon: 'users', di: 'mua-hang/4-2-3' },
  ] },
  // Gói Free mẫu C bước theo kỳ (T366)
  moTaFree: 'Đi từ trái sang phải theo một kỳ kế toán: khai số đầu, ghi phiếu hằng ngày, đối chiếu sổ, xem báo cáo.',
  buocKyFree: [
    {
      ten: 'Khởi tạo',
      moTa: 'Làm một lần khi bắt đầu dùng phần mềm.',
      nut: [
        { ten: 'Số dư ban đầu', icon: 'db', di: 'tien/so-du-ban-dau' },
      ],
      ghiChu: 'Tồn quỹ tiền mặt, số dư tài khoản ngân hàng và công nợ nhà cung cấp đầu kỳ.',
    },
    {
      ten: 'Ghi nhận hằng ngày',
      moTa: 'Mỗi khoản tiền vào, ra là một phiếu. Bấm + để lập nhanh.',
      rong: true,
      nut: [
        { ten: 'Thu tiền mặt', icon: 'cashin', di: 'tien/2-1-1/moi?loai=thu', chieu: 'vao', taoMoi: 'tien/2-1-1/moi?loai=thu' },
        { ten: 'Thu ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=bc', chieu: 'vao', taoMoi: 'tien/2-1-1/moi?loai=bc' },
        { ten: 'Chi tiền mặt', icon: 'cashout', di: 'tien/2-1-1/moi?loai=chi', chieu: 'ra', taoMoi: 'tien/2-1-1/moi?loai=chi' },
        { ten: 'Chi ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=unc', chieu: 'ra', taoMoi: 'tien/2-1-1/moi?loai=unc' },
        { ten: 'Chuyển quỹ nội bộ', moTa: 'Nộp, rút tiền mặt', icon: 'swap', di: 'tien/2-1-1/moi?loai=cq', chieu: 'noi', taoMoi: 'tien/2-1-1/moi?loai=cq', rong: true },
      ],
    },
    {
      ten: 'Đối chiếu sổ',
      moTa: 'Cuối ngày, cuối tháng so tồn sổ với tiền thực tế, sao kê.',
      nut: [
        { ten: 'Sổ quỹ tiền mặt', icon: 'wallet', di: 'tien/2-2-1' },
        { ten: 'Sổ tiền gửi ngân hàng', icon: 'bank', di: 'tien/2-2-3' },
      ],
    },
    {
      ten: 'Công nợ, báo cáo',
      moTa: 'Xem còn nợ ai bao nhiêu và các báo cáo của kỳ.',
      nut: [
        { ten: 'Công nợ nhà cung cấp', icon: 'users', di: 'mua-hang/4-2-3' },
      ],
    },
  ],
  baoCao: ['2-2-1', '2-2-3', '2-2-5', '2-2-2', '2-2-4'],
  danhMuc: ['danh-muc/1-12', 'danh-muc/1-5', 'danh-muc/1-16'],
  tienIch: ['tien-ich/11-8', 'tien-ich/11-10', 'tien-ich/11-11'],
}
