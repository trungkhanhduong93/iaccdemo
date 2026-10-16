// Sơ đồ công cụ dụng cụ: chi tiền, lập thẻ chi phí phân bổ (thẻ thường hoặc thẻ dư đầu kỳ), phân bổ hằng tháng, điều chuyển, ghi giảm, kiểm kê
import type { QuyTrinhDef } from '../types'
import { MA_LY_CHO_PHAN_BO } from '../../data/mock'

// Chi tiền từ sơ đồ này mở phiếu với lý do Chi phí chờ phân bổ (mã MA_LY_CHO_PHAN_BO, T269)
export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ công cụ dụng cụ',
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
        { ten: 'Thẻ chi phí phân bổ', icon: 'grid', di: 'ccdc/8-1-1' },
        { ten: 'Thẻ CPPB dư đầu kỳ', icon: 'clock', di: 'ccdc/8-1-1' },
      ] },
    ],
    ra: { ten: 'Sổ sách, báo cáo', nut: [
      { ten: 'Bảng chi tiết phân bổ chi phí', icon: 'calendar', di: 'ccdc/bang-phan-bo' },
    ] },
  },
  baoCao: ['bang-phan-bo', '8-2-1', '8-2-2', '8-2-3', '8-2-4'],
  danhMuc: ['danh-muc/1-2', 'danh-muc/1-6', 'danh-muc/1-8'],
}
