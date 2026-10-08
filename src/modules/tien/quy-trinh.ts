// Sơ đồ nghiệp vụ tiền kiểu hội tụ: thu tiền, chi tiền (tiền mặt và ngân hàng), chuyển quỹ, đối chiếu công nợ, phân bổ chi phí chuỗi cùng đổ về sổ sách quỹ
import type { QuyTrinhDef } from '../types'

export const quyTrinh: QuyTrinhDef = {
  ten: 'Nghiệp vụ tiền',
  buoc: [],
  hoiTu: {
    lan: [
      { ten: 'Thu tiền', nut: [
        { ten: 'Thu tiền mặt', icon: 'cashin', di: 'tien/2-1-1/moi?loai=thu' },
        { ten: 'Thu qua ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=bc' },
      ] },
      { ten: 'Chi tiền', nut: [
        { ten: 'Chi tiền mặt', icon: 'cashout', di: 'tien/2-1-1/moi?loai=chi' },
        { ten: 'Chi qua ngân hàng', icon: 'bank', di: 'tien/2-1-1/moi?loai=unc' },
      ] },
      { ten: 'Chuyển quỹ', nut: [
        { ten: 'Chuyển quỹ', icon: 'swap', di: 'tien/2-1-1/moi?loai=cq' },
      ] },
      { ten: 'Đối chiếu công nợ', nut: [
        { ten: 'Biên bản đối chiếu công nợ', icon: 'scale', di: 'tien/2-1-2/moi' },
      ] },
      { ten: 'Phân bổ chi phí chuỗi', nut: [
        { ten: 'Phân bổ chi phí chuỗi', icon: 'layers', di: 'tien/2-1-3' },
      ] },
    ],
    ra: { ten: 'Sổ sách, báo cáo', nut: [
      { ten: 'Sổ quỹ tiền mặt', icon: 'book', di: 'tien/2-2-1' },
      { ten: 'Sổ ngân hàng', icon: 'bank', di: 'tien/2-2-3' },
      { ten: 'Sổ công nợ', icon: 'users', di: 'tien/2-2-5' },
      { ten: 'Sổ tài khoản', icon: 'book', di: 'tien/2-2-2' },
      { ten: 'Sổ nhật ký', icon: 'doc', di: 'tien/2-2-4' },
    ] },
  },
  baoCao: ['2-2-1', '2-2-3', '2-2-5', '2-2-2', '2-2-4'],
  danhMuc: ['danh-muc/1-12', 'danh-muc/1-5', 'danh-muc/1-16'],
  tienIch: ['tien-ich/11-8', 'tien-ich/11-10', 'tien-ich/11-11'],
}
