import type { CotMau } from './mauNhapDm'
import type { DongKiem, KetQuaNhap } from './nhapDmKieu'

export interface NhapXlDangNhapProps {
  tenDm: string
  xong: number
  tong: number
  dangGhi?: DongKiem
  cot: CotMau[]
}

/** Màn Đang nhập, phần bên phải cột bước (T892, gói 5) */
export function NhapXlDangNhap(_p: NhapXlDangNhapProps) {
  return null
}

export interface NhapXlKetQuaProps {
  kq: KetQuaNhap
  tenDm: string
  tenFile: string
  cot: CotMau[]
  onTaiLoi: () => void
  onNhapKhac: () => void
  onMoDs: () => void
}

/** Bước 3 Kết quả, phần bên phải cột bước (T892, gói 5) */
export function NhapXlKetQua(_p: NhapXlKetQuaProps) {
  return null
}
