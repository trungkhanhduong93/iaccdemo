// Sơ đồ nghiệp vụ tiền: thu, chi trong ngày, cuối ngày nộp tiền vào ngân hàng, khớp sao kê, cuối tháng đối chiếu công nợ
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ tiền',
  buoc: [
    { chinh: { ten: 'Tiền bán hàng từ FABi', icon: 'pos', di: 'ban-hang/3-1-1', tone: 'fabi' } },
    { chinh: { ten: 'Phiếu thu', icon: 'cashin', di: 'tien/2-1-1/moi?loai=thu' },
      duoi: [{ ten: 'Thu qua ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=bc' }] },
    { chinh: { ten: 'Phiếu chi', icon: 'cashout', di: 'tien/2-1-1/moi?loai=chi' },
      duoi: [{ ten: 'Chi qua ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=unc' }] },
    { chinh: { ten: 'Nộp tiền vào ngân hàng', icon: 'upload', di: 'tien/2-1-1/moi?loai=nop' } },
    { chinh: { ten: 'Khớp sao kê ngân hàng', icon: 'refresh', di: 'tien-ich/11-8' } },
    { chinh: { ten: 'Đối chiếu công nợ', icon: 'scale', di: 'tien/2-1-2/moi' },
      duoi: [{ ten: 'Phân bổ chi phí chuỗi', icon: 'layers', di: 'tien/2-1-3' }] },
  ],
  baoCao: ['2-2-1', '2-2-3', '2-2-5', '2-2-2', '2-2-4'],
  danhMuc: ['danh-muc/1-12', 'danh-muc/1-5', 'danh-muc/1-16'],
  tienIch: ['tien-ich/11-8', 'tien-ich/11-10', 'tien-ich/11-11'],
}
