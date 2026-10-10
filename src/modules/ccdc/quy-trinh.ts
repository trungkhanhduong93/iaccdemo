// Sơ đồ công cụ dụng cụ: chi tiền, lập thẻ chi phí phân bổ (thẻ thường hoặc thẻ dư đầu kỳ), phân bổ hằng tháng, điều chuyển, ghi giảm, kiểm kê
import type { QuyTrinhDef } from '../types'

// Chi tiền từ sơ đồ này mở phiếu với lý do LD17 Chi phí chờ phân bổ
export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ công cụ dụng cụ',
  buoc: [
    { chinh: { ten: 'Chi tiền mặt', icon: 'cashout', di: 'tien/2-1-1/moi?loai=chi&ly=LD17' },
      tren: [{ ten: 'Chi ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=unc&ly=LD17' }] },
    { chinh: { ten: 'Thẻ chi phí phân bổ', icon: 'grid', di: 'ccdc/8-1-1' },
      tren: [{ ten: 'Thẻ CPPB dư đầu kỳ', icon: 'clock', di: 'ccdc/8-1-1' }],
      duoi: [{ ten: 'Ghi tăng CCDC', icon: 'tool', di: 'ccdc/8-1-2/moi?loai=tang' }] },
    { chinh: { ten: 'Phân bổ hằng tháng', icon: 'calendar', di: 'ccdc/8-2-3' } },
    { chinh: { ten: 'Điều chuyển CCDC', icon: 'swap', di: 'ccdc/8-1-2/moi?loai=dc' },
      duoi: [{ ten: 'Ghi giảm CCDC', icon: 'trash', di: 'ccdc/8-1-2/moi?loai=giam' }] },
    { chinh: { ten: 'Kiểm kê CCDC', icon: 'clipboard', di: 'ccdc/8-1-3/moi' } },
  ],
  baoCao: ['8-2-1', '8-2-2', '8-2-3', '8-2-4'],
  danhMuc: ['danh-muc/1-6', 'danh-muc/1-8'],
}
