// Phân hệ Hệ thống: không có trong Excel tính năng, gói nào cũng mở (trừ nhật ký thao tác)
import type { ModuleDef } from '../types'
import { CauHinh, GoiThueBao, NguoiDung, PhanQuyen, ThongTinDonVi } from './HeThong'
import { NhatKyThaoTac } from '../tien-ich/TienIch'

const heThong: ModuleDef = {
  key: 'he-thong', ten: 'Hệ thống', ngan: 'Hệ thống', icon: 'cog',
  mota: 'Người dùng, phân quyền, gói thuê bao, cấu hình',
  screens: [
    { slug: 'nguoi-dung', ten: 'Người dùng', nhom: 'Quản trị', kind: 'custom', comp: NguoiDung },
    { slug: 'phan-quyen', ten: 'Vai trò và phân quyền', nhom: 'Quản trị', kind: 'custom', comp: PhanQuyen },
    { slug: 'nhat-ky', ten: 'Nhật ký thao tác', nhom: 'Quản trị', can: ['X2'], kind: 'custom', comp: NhatKyThaoTac },
    { slug: 'goi-thue-bao', ten: 'Gói thuê bao', nhom: 'Thuê bao', kind: 'custom', comp: GoiThueBao },
    { slug: 'thong-tin', ten: 'Thông tin đơn vị', nhom: 'Cài đặt', kind: 'custom', comp: ThongTinDonVi },
    { slug: 'cau-hinh', ten: 'Cấu hình kế toán', nhom: 'Cài đặt', kind: 'custom', comp: CauHinh },
  ],
}
export default heThong
