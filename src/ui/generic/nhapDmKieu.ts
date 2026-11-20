import type { Row } from '../../modules/types'
import type { CotMau } from './mauNhapDm'

// Kiểu dùng chung của hộp Nhập Excel danh mục (T892)

export type XuLyDong = 'moi' | 'sua' | 'loi'

export interface DongKiem {
  dong: number                      // số dòng trong Excel
  xuLy: XuLyDong
  gt: Row                           // giá trị sẽ ghi (đã ép kiểu, đã gộp giá trị cũ khi cập nhật)
  chu: Record<string, string>       // chữ gốc từng ô theo k, để hiện và xuất file lỗi
  oLoi: string[]                    // k của ô lỗi
  oDoi: string[]                    // k của ô đổi so với dòng cũ (chỉ dòng cập nhật)
  lyDo: string[]                    // mọi lỗi của dòng
  maSinh?: boolean                  // mã tự sinh vì ô Mã để trống
}

export interface NhomCot { ten: string; so: number }   // tiêu đề tầng 1, so = số cột tầng 2 bên dưới

export interface KetQuaKiem {
  loiChung?: string
  tenFile: string
  cot: CotMau[]
  nhomCot: NhomCot[]
  dong: DongKiem[]
  dem: { tat: number; moi: number; sua: number; loi: number }
}

export interface KetQuaNhap { luc: Date; moi: DongKiem[]; sua: DongKiem[]; boQua: DongKiem[] }

export type PhamViTai = 'tat' | 'loc' | 'trang'

export type BaoTienDo = (xong: number, tong: number, dangGhi?: DongKiem) => void
