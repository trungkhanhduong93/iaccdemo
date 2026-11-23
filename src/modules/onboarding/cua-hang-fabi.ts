// Cửa hàng trên tài khoản FABi (dữ liệu mẫu, T138, T142): donVi là đơn vị kế toán đang dùng cửa hàng; chưa có là chưa dùng kế toán.
// Cửa hàng lên sổ thêm sau (Thêm cửa hàng từ FABi, Thêm đơn vị kế toán) lưu ở phiên: s.cnThem.
import { CUA_HANG } from '../../data/mock'
import type { CnThem, Session } from '../../app/session'
import { demPhieuMoiCuaHang } from '../../ui/generic/daXoa'

export type CuaHangFabi = { id: string; ten: string; khuVuc: string; donVi?: string; posId?: string }   // posId: mã cửa hàng trên POS FABi, cửa hàng nào cũng có (T906)

export const CUA_HANG_FABI: CuaHangFabi[] = [
  ...CUA_HANG.map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM', donVi: 'pm', posId: c.posId })),
  { id: 'gn1', ten: 'Cà phê Góc Nhỏ Tân Định', khuVuc: 'TP.HCM', donVi: 'gn', posId: '30001' },
  // Chuỗi Trà Lá: vài cửa hàng mẫu cho màn Danh sách đơn vị (T904), chưa có số liệu chứng từ
  { id: 'tl1', ten: 'Trà Lá Nguyễn Văn Linh', khuVuc: 'TP.HCM', donVi: 'tl', posId: '20001' },
  { id: 'tl2', ten: 'Trà Lá Phú Mỹ Hưng', khuVuc: 'TP.HCM', donVi: 'tl', posId: '20002' },
  { id: 'tl3', ten: 'Trà Lá Thủ Đức', khuVuc: 'TP.HCM', donVi: 'tl', posId: '20003' },
  { id: 'q7', ten: 'Phố Mây Quận 7', khuVuc: 'TP.HCM', posId: '10004' },
  { id: 'gv', ten: 'Phố Mây Gò Vấp', khuVuc: 'TP.HCM', posId: '10005' },
  { id: 'hk', ten: 'Phố Mây Hoàn Kiếm', khuVuc: 'Hà Nội', posId: '10006' },
  { id: 'cg', ten: 'Phố Mây Cầu Giấy', khuVuc: 'Hà Nội', posId: '10007' },
]

/** Cửa hàng FABi chưa dùng kế toán ở đơn vị nào, kể cả cửa hàng đã lên sổ thêm trong phiên.
 *  Đơn vị dùng thử từ FABi (fabi) là tài khoản FABi khác: chỉ có các cửa hàng Phố Mây, chưa dùng là cửa hàng bỏ tích lúc dùng thử */
export const cuaHangChuaDung = (s: Pick<Session, 'cnThem' | 'donVi' | 'cnBo'>): CuaHangFabi[] => {
  const daDung = (id: string) => Object.values(s.cnThem ?? {}).some(ds => ds.some(x => x.id === id))
  if (s.donVi === 'fabi') return CUA_HANG.filter(c => !(s.cnThem?.fabi ?? []).some(x => x.id === c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM' }))
  return CUA_HANG_FABI.filter(c => (!c.donVi || daBo(s, c)) && !daDung(c.id)).map(({ donVi: _, ...c }) => c)
}

/** Cửa hàng có sẵn của đơn vị mẫu đã bớt ở màn Danh sách đơn vị (T904) */
const daBo = (s: Pick<Session, 'cnBo'>, c: CuaHangFabi) => Boolean(c.donVi && s.cnBo?.[c.donVi]?.includes(c.id))

/** Cửa hàng FABi đang thuộc một đơn vị: cửa hàng có sẵn trừ cửa hàng đã bớt, cộng cửa hàng lên sổ thêm (T904) */
export const cuaHangCuaDv = (s: Pick<Session, 'cnThem' | 'cnBo'>, dv: string): CuaHangFabi[] => [
  ...CUA_HANG_FABI.filter(c => c.donVi === dv && !daBo(s, c)),
  ...(s.cnThem?.[dv] ?? []).map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc, donVi: dv })),
]

/** Số chứng từ tạo thủ công mẫu của cửa hàng có sẵn ở đơn vị mẫu (T906): không gồm Xuất bán POS, thu tiền bán hàng, thu chi từ FABi */
const CT_TAY_MAU: Record<string, number> = { q1: 128, q5: 74, td: 96, gn1: 64, tl1: 42, tl2: 17, tl3: 0 }

/** Số chứng từ tạo thủ công của cửa hàng ở đơn vị đang giữ nó: số mẫu (cửa hàng có sẵn của đơn vị mẫu) cộng phiếu lập tay trong phiên.
 *  Cửa hàng có chứng từ tạo thủ công thì không chuyển, không bớt khỏi đơn vị được (T906) */
export const ctThuCong = (s: Pick<Session, 'cnThem'>, c: CuaHangFabi, dv: string | undefined) => {
  if (!dv) return 0
  const coSan = CUA_HANG_FABI.some(x => x.id === c.id && x.donVi === dv) && !Object.values(s.cnThem ?? {}).some(ds => ds.some(x => x.id === c.id))
  return (coSan ? CT_TAY_MAU[c.id] ?? 0 : 0) + demPhieuMoiCuaHang(c.id, c.ten)
}

/** Mọi cửa hàng trên tài khoản FABi kèm đơn vị đang giữ (không có là chưa gán) (T906) */
export const cuaHangTaiKhoan = (s: Pick<Session, 'cnThem' | 'cnBo'>, dsDv: string[]): { c: CuaHangFabi; dv?: string }[] =>
  CUA_HANG_FABI.map(c => ({ c: { id: c.id, ten: c.ten, khuVuc: c.khuVuc }, dv: dsDv.find(d => cuaHangCuaDv(s, d).some(x => x.id === c.id)) }))

/** Chuyển cửa hàng từ đơn vị tu sang đơn vị den (bỏ tu là gán cửa hàng chưa gán; bỏ den là bớt ra). Trả phần phiên cần đổi (T906).
 *  Cửa hàng có sẵn của đơn vị mẫu: bớt thì ghi vào cnBo, về lại thì xoá khỏi cnBo; cửa hàng khác ghi ở cnThem với ngày lên sổ */
export function chuyenCuaHang(s: Pick<Session, 'cnThem' | 'cnBo'>, c: CuaHangFabi, tu: string | undefined, den: string | undefined, tuNgay: string): Pick<Session, 'cnThem' | 'cnBo'> {
  const cnThem = { ...s.cnThem }, cnBo = { ...s.cnBo }
  const coSanCua = (dv: string) => CUA_HANG_FABI.some(x => x.id === c.id && x.donVi === dv)
  if (tu) {
    if (coSanCua(tu)) cnBo[tu] = [...(cnBo[tu] ?? []).filter(x => x !== c.id), c.id]
    cnThem[tu] = (cnThem[tu] ?? []).filter(x => x.id !== c.id)
  }
  if (den) {
    if (coSanCua(den)) cnBo[den] = (cnBo[den] ?? []).filter(x => x !== c.id)
    else cnThem[den] = [...(cnThem[den] ?? []).filter(x => x.id !== c.id), { id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay } satisfies CnThem]
  }
  return { cnThem, cnBo }
}
