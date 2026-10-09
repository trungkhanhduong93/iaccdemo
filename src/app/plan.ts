// Gói, chế độ kế toán và danh sách 120 tính năng.
// features.json sinh từ Excel bằng tools/xuat_tinh_nang.py — đừng sửa tay.
import data from './features.json'

export type Goi = 'F' | 'S' | 'PL' | 'PR'
export const GOIS: Goi[] = ['F', 'S', 'PL', 'PR']

export interface Feature {
  c: string      // mã STT trong Excel, vd 3.1.1
  m: number      // vị trí phân hệ trong MODS
  n: string      // tên tính năng
  grp: string    // nhóm con: Chứng từ, Sổ sách, báo cáo...
  g: Goi[]       // các gói có tính năng
  gd: number     // giai đoạn phát hành
  ivt: number    // 1 = kế thừa iPOS Inventory
}

export const MODS: string[] = data.mods

/**
 * Đổi chuỗi ký tự ghép gói từ Excel (vd "SMA", "FSMA", "MA", "A") sang mảng mã gói nội bộ.
 * Lý do: features.json sinh từ Excel mang mã 1 ký tự (F, S, M, A),
 * nhưng app đã chuẩn hoá mã nội bộ thành PL (Plus) và PR (Pro).
 */
export function doiGoiTuExcel(gStr: string): Goi[] {
  const ds: Goi[] = []
  for (const ch of gStr) {
    if (ch === 'F') ds.push('F')
    else if (ch === 'S') ds.push('S')
    else if (ch === 'M') ds.push('PL')
    else if (ch === 'A') ds.push('PR')
  }
  return ds
}

/** Bổ sung theo sheet Roadmap khi Excel chưa sinh lại features.json: mã tính năng -> các gói có tính năng.
 *  Trum gộp vào Excel và chạy lại tools/xuat_tinh_nang.py rồi thì xoá dòng tương ứng (việc T26). */
const THEO_ROADMAP: Record<string, Goi[]> = {
  '1.12': ['F', 'S', 'PL', 'PR'],    // Danh mục quỹ tiền mở cho gói Free, theo Roadmap 08/10/2026
  '2.2.3': ['F', 'S', 'PL', 'PR'],   // Sổ ngân hàng mở cho gói Free, PhuongXT chốt 08/10/2026
}
export const FEATURES: Feature[] = data.feats.map(f => {
  const g = THEO_ROADMAP[f.c] ?? doiGoiTuExcel(f.g)
  return { ...f, g }
})
export const FEATURE: Record<string, Feature> = Object.fromEntries(FEATURES.map(f => [f.c, f]))

import { CHE_DO, CHE_DO_MAC_DINH, type CheDo } from './che-do'

export const GOI: Record<Goi, { ten: string; cls: string; mota: string }> = {
  F: { ten: 'Free', cls: 'fr', mota: 'Hộ kinh doanh, cửa hàng nhỏ, 1 điểm bán' },
  S: { ten: 'Standard', cls: 'st', mota: 'DN siêu nhỏ, 1 điểm bán, không dùng tài khoản' },
  PL: { ten: 'Plus', cls: 'md', mota: 'DN nhỏ và vừa, 1–10 điểm bán, Nợ/Có' },
  PR: { ten: 'Pro', cls: 'ad', mota: 'DN vừa và lớn, trên 10 điểm bán' },
}

/** Gói thấp nhất có tính năng. */
export function minGoi(code: string): Goi {
  const f = FEATURE[code]
  return (f ? (GOIS.find(g => f.g.includes(g)) ?? 'PR') : 'F') as Goi
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

/** Kiểu ghi sổ theo gói hoặc chế độ kế toán. */
export function kieuGhiSo(x: Goi | CheDo): 'khong' | 'so' | 'noco' {
  if (x in CHE_DO) return CHE_DO[x as CheDo].kieuGhiSo
  return CHE_DO[CHE_DO_MAC_DINH[x as Goi]].kieuGhiSo
}

