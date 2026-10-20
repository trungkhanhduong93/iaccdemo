// Sơ đồ công cụ dụng cụ: chi tiền, lập thẻ chi phí phân bổ (thẻ thường hoặc thẻ dư đầu kỳ), phân bổ hằng tháng, điều chuyển, ghi giảm, kiểm kê
import type { QuyTrinhDef } from '../types'
import { MA_LY_CHO_PHAN_BO } from '../../data/mock'

// Chi tiền từ sơ đồ này mở phiếu với lý do Chi phí chờ phân bổ (mã MA_LY_CHO_PHAN_BO, T269)
export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ chi phí trả trước cần phân bổ',   // T287
  buoc: [
    { chinh: { ten: 'Chi tiền mặt', icon: 'cashout', di: `tien/2-1-1/moi?loai=chi&ly=${MA_LY_CHO_PHAN_BO}` },
      tren: [{ ten: 'Chi ngân hàng', icon: 'bank', di: `tien/2-1-1/moi?loai=unc&ly=${MA_LY_CHO_PHAN_BO}` }] },
    { chinh: { ten: 'Thẻ chi phí phân bổ', icon: 'grid', di: 'ccdc/8-1-1' },
      tren: [{ ten: 'Thẻ CPPB dư đầu kỳ', icon: 'clock', di: 'ccdc/8-1-1' }],
      duoi: [{ ten: 'Ghi tăng CCDC', icon: 'tool', di: 'ccdc/8-1-2/moi?loai=tang' }] },
    { chinh: { ten: 'Phân bổ hằng tháng', icon: 'calendar', di: 'ccdc/8-2-3' } },
    { chinh: { ten: 'Điều chuyển CCDC', icon: 'swap', di: 'ccdc/8-1-2/moi?loai=dc' },
      duoi: [{ ten: 'Ghi giảm CCDC', icon: 'trash', di: 'ccdc/8-1-2/moi?loai=giam' }] },
    { chinh: { ten: 'Kiểm kê CCDC', icon: 'clipboard', di: 'ccdc/8-1-3/moi' } },
  ],
  // Gói Free (T267): sơ đồ hội tụ như Thu chi, Mua hàng; các làn nghiệp vụ đổ về Sổ sách, báo cáo
  hoiTuFree: {
    lan: [
      { ten: 'Chi tiền', tone: 'err', nut: [
        { ten: 'Chi tiền mặt', icon: 'cashout', di: `tien/2-1-1/moi?loai=chi&ly=${MA_LY_CHO_PHAN_BO}` },
        { ten: 'Chi ngân hàng', icon: 'bank', di: `tien/2-1-1/moi?loai=unc&ly=${MA_LY_CHO_PHAN_BO}` },
      ] },
      { ten: 'Thẻ chi phí phân bổ', tone: 'info', nut: [
        { ten: 'Thẻ chi phí phân bổ', icon: 'phanbo', di: 'ccdc/8-1-1' },
        { ten: 'Thẻ CPPB dư đầu kỳ', icon: 'clock', di: 'ccdc/8-1-1' },
      ] },
    ],
    ra: { ten: 'Sổ sách, báo cáo', nut: [
      { ten: 'Bảng chi tiết phân bổ chi phí', icon: 'calendar', di: 'ccdc/bang-phan-bo' },
    ] },
  },
  // Gói Free (T368): sơ đồ bước theo kỳ (mẫu C), ưu tiên trên hoiTuFree
  buocKyFree: [
    {
      ten: 'Khởi tạo đầu kỳ',
      moTa: 'Khai báo các khoản mua từ trước còn phân bổ.',
      ghiChu: 'Công cụ dụng cụ hoặc tiền nhà, phí dịch vụ trả trước khi dùng phần mềm.',
      nut: [
        // Mở thẳng form ghi tăng đầu kỳ (T514)
        { ten: 'Thẻ CPPB dư đầu kỳ', icon: 'clock', di: 'ccdc/8-1-1?moi=dau', moTa: 'Khoản chi từ trước khi dùng phần mềm' },
      ],
    },
    {
      ten: 'Chi tiền trả trước',
      moTa: 'Lập phiếu chi cho các khoản dùng nhiều tháng.',
      ghiChu: 'Tiền thuê mặt bằng, mua sắm công cụ dụng cụ trả một lần dùng dài hạn.',
      nut: [
        // Hai ô nhỏ chung 1 hàng (T514)
        { ten: 'Chi tiền mặt', icon: 'cashout', di: `tien/2-1-1/moi?loai=chi&ly=${MA_LY_CHO_PHAN_BO}`, taoMoi: `tien/2-1-1/moi?loai=chi&ly=${MA_LY_CHO_PHAN_BO}`, nho: true },
        { ten: 'Chi ngân hàng', icon: 'bank', di: `tien/2-1-1/moi?loai=unc&ly=${MA_LY_CHO_PHAN_BO}`, taoMoi: `tien/2-1-1/moi?loai=unc&ly=${MA_LY_CHO_PHAN_BO}`, nho: true },
      ],
      // Khoản chưa chi tiền: tạo thẻ thẳng, không qua phiếu chi (T514)
      nhom: [{
        ten: 'Chưa chi tiền cần ghi nhận chi phí trả trước',
        moTa: 'Các khoản chi phí phân bổ thanh toán sau',
        nut: [{ ten: 'Thẻ chi phí phân bổ', icon: 'phanbo', di: 'ccdc/8-1-1?moi=the', moTa: 'Ghi nhận khoản chưa thanh toán' }],
      }],
    },
    {
      ten: 'Theo dõi thẻ chi phí',
      moTa: 'Ghi nhận và chia đều chi phí vào từng tháng.',
      ghiChu: 'Mỗi khoản chi trả trước tạo một thẻ để hệ thống tự chia theo số kỳ.',
      nut: [
        { ten: 'Quản lý thẻ chi phí phân bổ', icon: 'phanbo', di: 'ccdc/8-1-1', moTa: 'Danh sách thẻ, lịch phân bổ' },   // T514
      ],
    },
    {
      ten: 'Báo cáo phân bổ',
      moTa: 'Xem chi phí tính vào mỗi kỳ và giá trị còn lại.',
      ghiChu: 'Theo dõi số tiền đã tính vào chi phí hằng tháng để nắm lãi lỗ thực tế.',
      nut: [
        { ten: 'Bảng chi tiết phân bổ chi phí', icon: 'calendar', di: 'ccdc/bang-phan-bo', moTa: 'Chi tiết số tiền phân bổ theo tháng' },
      ],
    },
  ],
  baoCao: ['bang-phan-bo', '8-2-1', '8-2-2', '8-2-3', '8-2-4'],
  danhMuc: ['danh-muc/1-2', 'danh-muc/1-6', 'danh-muc/1-8'],
}
