// Gói, chế độ kế toán và danh sách 120 tính năng.
// features.json sinh từ Excel bằng tools/xuat_tinh_nang.py — đừng sửa tay.
import data from './features.json'

export type Goi = 'F' | 'S' | 'M' | 'A'
export const GOIS: Goi[] = ['F', 'S', 'M', 'A']

export interface Feature {
  c: string      // mã STT trong Excel, vd 3.1.1
  m: number      // vị trí phân hệ trong MODS
  n: string      // tên tính năng
  grp: string    // nhóm con: Chứng từ, Sổ sách, báo cáo...
  g: string      // các gói có tính năng, vd "SMA"
  gd: number     // giai đoạn phát hành
  ivt: number    // 1 = kế thừa iPOS Inventory
}

export const MODS: string[] = data.mods
/** Bổ sung theo sheet Roadmap khi Excel chưa sinh lại features.json: mã tính năng -> các gói có tính năng.
 *  Trum gộp vào Excel và chạy lại tools/xuat_tinh_nang.py rồi thì xoá dòng tương ứng (việc T26). */
const THEO_ROADMAP: Record<string, string> = {
  '1.12': 'FSMA',    // Danh mục quỹ tiền mở cho gói Free, theo Roadmap 08/10/2026
  '2.2.3': 'FSMA',   // Sổ ngân hàng mở cho gói Free, PhuongXT chốt 08/10/2026
}
export const FEATURES: Feature[] = data.feats.map(f => THEO_ROADMAP[f.c] ? { ...f, g: THEO_ROADMAP[f.c] } : f)
export const FEATURE: Record<string, Feature> = Object.fromEntries(FEATURES.map(f => [f.c, f]))

export const GOI: Record<Goi, { ten: string; cls: string; cheDo: string; cheDoNgan: string; mota: string }> = {
  F: { ten: 'Free', cls: 'fr', cheDo: 'Chưa áp chế độ kế toán', cheDoNgan: 'Không chế độ', mota: 'Hộ kinh doanh, cửa hàng nhỏ, 1 điểm bán' },
  S: { ten: 'Starter', cls: 'st', cheDo: 'TT58/2026/TT-BTC', cheDoNgan: 'TT58', mota: 'DN siêu nhỏ, 1 điểm bán, không dùng tài khoản' },
  M: { ten: 'Medium', cls: 'md', cheDo: 'TT133/2016/TT-BTC', cheDoNgan: 'TT133', mota: 'DN nhỏ và vừa, 1–10 điểm bán, Nợ/Có' },
  A: { ten: 'Advance', cls: 'ad', cheDo: 'TT99/2025/TT-BTC', cheDoNgan: 'TT99', mota: 'DN vừa và lớn, trên 10 điểm bán' },
}

/** Gói thấp nhất có tính năng. */
export function minGoi(code: string): Goi {
  const f = FEATURE[code]
  return (f ? (GOIS.find(g => f.g.includes(g)) ?? 'A') : 'F') as Goi
}

/** Tính năng có trong gói không. Mã không có trong Excel (màn hệ thống) thì luôn dùng được. */
export function coTrongGoi(code: string | undefined, goi: Goi): boolean {
  if (!code) return true
  const f = FEATURE[code]
  return !f || f.g.includes(goi)
}

/** Cần một trong các mã để mở. */
export function coMotTrong(codes: string[], goi: Goi): boolean {
  return codes.some(c => coTrongGoi(c, goi))
}

export function demTheoGoi(goi: Goi, mod?: number) {
  const fs = FEATURES.filter(f => mod === undefined || f.m === mod)
  return { co: fs.filter(f => f.g.includes(goi)).length, tong: fs.length }
}

/** Gói Free ẩn hẳn tính năng ngoài gói thay vì hiện mờ có khoá (QD22). Gói khác vẫn hiện khoá để mời nâng cấp. */
export const anNgoaiGoi = (goi: Goi) => goi === 'F'

/** Kiểu ghi sổ theo gói: Free không hạch toán, Starter ghi sổ không tài khoản, Medium/Advance Nợ/Có. */
export function kieuGhiSo(goi: Goi): 'khong' | 'so' | 'noco' {
  return goi === 'F' ? 'khong' : goi === 'S' ? 'so' : 'noco'
}
