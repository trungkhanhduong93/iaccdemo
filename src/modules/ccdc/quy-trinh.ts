// Sơ đồ công cụ dụng cụ: mua, ghi tăng, phân bổ hằng tháng, điều chuyển, ghi giảm, kiểm kê
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ công cụ dụng cụ',
  buoc: [
    { chinh: { ten: 'Mua công cụ dụng cụ', icon: 'truck', di: 'mua-hang/4-1-1/moi' } },
    { chinh: { ten: 'Ghi tăng CCDC', icon: 'tool', di: 'ccdc/8-1-2/moi?loai=tang' },
      duoi: [{ ten: 'CCDC, chi phí trả trước', icon: 'grid', di: 'ccdc/8-1-1' }] },
    { chinh: { ten: 'Phân bổ hằng tháng', icon: 'calendar', di: 'ccdc/8-2-3' } },
    { chinh: { ten: 'Điều chuyển CCDC', icon: 'swap', di: 'ccdc/8-1-2/moi?loai=dc' },
      duoi: [{ ten: 'Ghi giảm CCDC', icon: 'trash', di: 'ccdc/8-1-2/moi?loai=giam' }] },
    { chinh: { ten: 'Kiểm kê CCDC', icon: 'clipboard', di: 'ccdc/8-1-3/moi' } },
  ],
  baoCao: ['8-2-1', '8-2-2', '8-2-3', '8-2-4'],
  danhMuc: ['danh-muc/1-6', 'danh-muc/1-8'],
}
