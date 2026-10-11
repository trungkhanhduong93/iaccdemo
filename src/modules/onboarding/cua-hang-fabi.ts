// Cửa hàng trên tài khoản FABi (dữ liệu mẫu, T138, T142): donVi là đơn vị kế toán đang dùng cửa hàng; chưa có là chưa dùng kế toán.
// Cửa hàng lên sổ thêm sau (Thêm chi nhánh từ FABi, Thêm đơn vị kế toán) lưu ở phiên: s.cnThem.
import { CHI_NHANH } from '../../data/mock'
import type { Session } from '../../app/session'

export type CuaHangFabi = { id: string; ten: string; khuVuc: string; donVi?: string }

export const CUA_HANG_FABI: CuaHangFabi[] = [
  ...CHI_NHANH.map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM', donVi: 'pm' })),
  { id: 'gn1', ten: 'Cà phê Góc Nhỏ Tân Định', khuVuc: 'TP.HCM', donVi: 'gn' },
  { id: 'q7', ten: 'Phố Mây Quận 7', khuVuc: 'TP.HCM' },
  { id: 'gv', ten: 'Phố Mây Gò Vấp', khuVuc: 'TP.HCM' },
  { id: 'hk', ten: 'Phố Mây Hoàn Kiếm', khuVuc: 'Hà Nội' },
  { id: 'cg', ten: 'Phố Mây Cầu Giấy', khuVuc: 'Hà Nội' },
]

/** Cửa hàng FABi chưa dùng kế toán ở đơn vị nào, kể cả cửa hàng đã lên sổ thêm trong phiên.
 *  Đơn vị dùng thử từ FABi (fabi) là tài khoản FABi khác: chỉ có các chi nhánh Phố Mây, chưa dùng là cửa hàng bỏ tích lúc dùng thử */
export const cuaHangChuaDung = (s: Pick<Session, 'cnThem' | 'donVi'>): CuaHangFabi[] => {
  const daDung = (id: string) => Object.values(s.cnThem ?? {}).some(ds => ds.some(x => x.id === id))
  if (s.donVi === 'fabi') return CHI_NHANH.filter(c => !(s.cnThem?.fabi ?? []).some(x => x.id === c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM' }))
  return CUA_HANG_FABI.filter(c => !c.donVi && !daDung(c.id))
}
