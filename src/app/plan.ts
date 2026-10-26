// Gói, chế độ kế toán và danh sách 120 tính năng.
// features.json sinh từ Excel bằng tools/xuat_tinh_nang.py — đừng sửa tay.
import data from './features.json'

export type Goi = 'S' | 'PL' | 'PR'
export const GOIS: Goi[] = ['S', 'PL', 'PR']
/** Gói đang mở bán: khởi tạo chỉ cho chọn các gói này, Gói thuê bao gắn nhãn Sắp ra mắt cho gói khác (T663). Mở bán thêm gói thì thêm vào đây */
export const GOI_MO: Goi[] = ['S']

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
    if (ch === 'F' && !ds.includes('S')) ds.push('S')
    else if (ch === 'S' && !ds.includes('PL')) ds.push('PL')
    else if ((ch === 'M' || ch === 'A') && !ds.includes('PR')) ds.push('PR')
  }
  return ds
}

/** Bổ sung theo sheet Roadmap khi Excel chưa sinh lại features.json: mã tính năng -> các gói có tính năng.
 *  Trum gộp vào Excel và chạy lại tools/xuat_tinh_nang.py rồi thì xoá dòng tương ứng (việc T26). */
const THEO_ROADMAP: Record<string, Goi[]> = {
  '1.12': ['S', 'PL', 'PR'],    // Danh mục quỹ tiền mở cho gói Standard, theo Roadmap 08/10/2026
  '2.2.3': ['S', 'PL', 'PR'],   // Sổ ngân hàng mở cho gói Standard, PhuongXT chốt 08/10/2026
  '7.2.1': ['PL', 'PR'],             // Mở báo cáo TSCĐ cho Plus (S4b-DNSN, TT58) và Pro
  '7.2.2': ['PR'],             // Mở báo cáo TSCĐ cho Pro, Trum chốt 09/10/2026 (T47 câu 11)
  // Gói Free: Bán hàng chỉ có Xuất bán POS 3.1.1; ẩn Tổng hợp (giữ Báo cáo kết quả kinh doanh 10.2.3, xem ở phân hệ Báo cáo);
  // Kho chỉ còn Kiểm kê 5.1.10 và Báo cáo xuất nhập tồn 5.2.3; mở Mua hàng. PhuongXT chốt 09/10/2026 (T52)
  '5.2.4': ['PL', 'PR'],
  '4.1.1': ['S', 'PL', 'PR'],
  '4.2.1': ['S', 'PL', 'PR'],    // Chi tiết mua hàng mở cho gói Standard, PhuongXT chốt (T63)
  '4.2.2': ['PL', 'PR'],    // Tổng hợp mua hàng mở cho gói Standard (T63); gói Standard ẩn tạm, PhuongXT chốt 15/10/2026 (T251)
  // Bộ báo cáo hộ kinh doanh theo iFaster, Trum chốt 10/10/2026 (T97)
  '3.2.5': ['S', 'PL', 'PR'],
  '2.2.5': ['S', 'PL', 'PR'],
  '5.2.1': ['S', 'PL', 'PR'],   // Thẻ kho mở cho gói Standard để bấm hàng hoá ở Xuất nhập tồn mở thẻ kho, PhuongXT chốt 14/10/2026 (T211)
  '10.1.3': ['PL', 'PR'],   // Số dư ban đầu mở cho Plus: tiền, công nợ, tồn kho, PhuongXT chốt 11/10/2026 (T141)
}

/** Màn bổ sung theo thông tư chưa có trong Excel (T47, kế hoạch mục 7.3). Trum cập nhật Excel và chạy lại tools/xuat_tinh_nang.py có đủ mã thì xoá dòng tương ứng ở đây */
const BO_SUNG: (Omit<Feature, 'g'> & { g: Goi[] })[] = [
  { c: '2.2.6', m: 1, n: 'Sổ chi tiết tiền vay', grp: 'Sổ sách, báo cáo', g: ['PR'], gd: 2, ivt: 0 },
  { c: '2.2.7', m: 1, n: 'Sổ chi tiết tiền', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },
  { c: '2.2.8', m: 1, n: 'Tổng hợp quỹ tiền', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },   // gói Standard ẩn tạm (T251)
  { c: '2.2.9', m: 1, n: 'Báo cáo dòng tiền', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },   // gói Standard ẩn tạm (T251)
  { c: '3.2.5', m: 2, n: 'Sổ doanh thu bán hàng', grp: 'Sổ sách, báo cáo', g: ['S', 'PL', 'PR'], gd: 2, ivt: 0 },
  { c: '3.1.7', m: 2, n: 'Bán hàng', grp: 'Chứng từ', g: ['PR'], gd: 2, ivt: 0 },   // bán hàng lập tay ngoài POS, từ gói Pro, PhuongXT thêm (T52)
  { c: '4.2.3', m: 3, n: 'Sổ công nợ nhà cung cấp', grp: 'Sổ sách, báo cáo', g: ['S', 'PL', 'PR'], gd: 2, ivt: 0 },   // PhuongXT thêm cho gói Standard (T52)
  { c: '4.2.4', m: 3, n: 'Tổng hợp nhập', grp: 'Sổ sách, báo cáo', g: ['S', 'PL', 'PR'], gd: 2, ivt: 0 },   // PhuongXT thêm (T63)
  { c: '4.2.5', m: 3, n: 'Chi tiết nhập', grp: 'Sổ sách, báo cáo', g: ['S', 'PL', 'PR'], gd: 2, ivt: 0 },   // PhuongXT thêm (T63)
  { c: '4.2.6', m: 3, n: 'Mua hàng theo ngày', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },   // gói Standard ẩn tạm (T251)
  { c: '5.2.8', m: 4, n: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },   // gói Standard bỏ (T52)
  { c: '6.2.4', m: 5, n: 'Sổ theo dõi nghĩa vụ thuế GTGT', grp: 'Báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },
  { c: '6.2.5', m: 5, n: 'Sổ theo dõi nghĩa vụ thuế khác', grp: 'Báo cáo', g: ['S', 'PL', 'PR'], gd: 2, ivt: 0 },
  { c: '7.2.3', m: 6, n: 'Thẻ tài sản cố định', grp: 'Sổ sách, báo cáo', g: ['PR'], gd: 2, ivt: 0 },
  { c: '7.2.4', m: 6, n: 'Sổ theo dõi TSCĐ, CCDC tại nơi sử dụng', grp: 'Sổ sách, báo cáo', g: ['PR'], gd: 2, ivt: 0 },
  { c: '10.4.1', m: 9, n: 'Sổ chi tiết doanh thu, chi phí', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },
  { c: '10.4.2', m: 9, n: 'Sổ theo dõi vốn chủ sở hữu', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },
  { c: '10.4.3', m: 9, n: 'Sổ chi phí', grp: 'Sổ sách, báo cáo', g: ['PL', 'PR'], gd: 2, ivt: 0 },   // gói Standard ẩn tạm (T251)
]

const CHEN_SAU: Record<string, string[]> = {
  '2.2.5': ['2.2.6', '2.2.7', '2.2.8', '2.2.9'],
  '3.1.1': ['3.1.7'],
  '3.2.4': ['3.2.5'],
  '4.2.2': ['4.2.3', '4.2.4', '4.2.5', '4.2.6'],
  '5.2.7': ['5.2.8'],
  '6.2.3': ['6.2.4', '6.2.5'],
  '7.2.2': ['7.2.3', '7.2.4'],
  '10.3.1': ['10.4.1', '10.4.2', '10.4.3'],
}

/** Màn bỏ hẳn ở mọi gói dù có trong Excel. Trum cập nhật Excel bỏ mã rồi thì xoá dòng ở đây */
const DA_BO = new Set([
  '3.2.1', '3.2.3',   // Báo cáo bán hàng, Báo cáo doanh thu: bỏ ở mọi gói, dùng Sổ doanh thu bán hàng 3.2.5, PhuongXT chốt 10/10/2026 (T99)
  '5.2.2',            // Tổng hợp nhập xuất tồn tạm bỏ, trùng Báo cáo xuất nhập tồn 5.2.3, Trum chốt 22/10/2026 (T624)
  '11.1', '11.2',     // Tiện ích Đồng bộ bán hàng, Xuất kho theo định lượng: bỏ ở mọi gói, PhuongXT chốt 10/10/2026 (T100)
])

/** Đổi tên tính năng khi Excel chưa cập nhật. Trum sửa tên trong Excel rồi thì xoá dòng ở đây */
const DOI_TEN: Record<string, string> = {
  '5.1.10': 'Kiểm kê số lượng',                       // PhuongXT chốt 26/10/2026 (T663)
  '8.1.1': 'Quản lý chi phí phân bổ nhiều kỳ',        // PhuongXT chốt 26/10/2026 (T663)
}

function gopFeatures(): Feature[] {
  const boSungChuaCo = BO_SUNG.filter(b => !data.feats.some(f => f.c === b.c))
  const chenMap = new Map<string, Feature[]>()
  for (const [sauMa, dsMa] of Object.entries(CHEN_SAU)) {
    const items = boSungChuaCo.filter(b => dsMa.includes(b.c))
    if (items.length > 0) chenMap.set(sauMa, items)
  }
  const ds: Feature[] = []
  const daChen = new Set<string>()
  for (const f of data.feats) {
    if (DA_BO.has(f.c)) continue
    const g = THEO_ROADMAP[f.c] ?? doiGoiTuExcel(f.g)
    ds.push({ ...f, g, n: DOI_TEN[f.c] ?? f.n })
    const them = chenMap.get(f.c)
    if (them) {
      for (const b of them) {
        const bg = THEO_ROADMAP[b.c] ?? b.g
        ds.push({ ...b, g: bg })
        daChen.add(b.c)
      }
    }
  }
  for (const b of boSungChuaCo) {
    if (!daChen.has(b.c)) {
      const bg = THEO_ROADMAP[b.c] ?? b.g
      ds.push({ ...b, g: bg })
    }
  }
  return ds
}

export const FEATURES: Feature[] = gopFeatures()
export const FEATURE: Record<string, Feature> = Object.fromEntries(FEATURES.map(f => [f.c, f]))

import { CHE_DO, CHE_DO_MAC_DINH, type CheDo } from './che-do'

export const GOI: Record<Goi, { ten: string; cls: string; mota: string }> = {
  S: { ten: 'Standard', cls: 'st', mota: 'Hộ kinh doanh, cửa hàng nhỏ, không giới hạn cửa hàng, mỗi cửa hàng một kho' },
  PL: { ten: 'Plus', cls: 'md', mota: 'DN siêu nhỏ, 1 điểm bán, không dùng tài khoản' },
  PR: { ten: 'Pro', cls: 'ad', mota: 'DN vừa và lớn, trên 10 điểm bán' },
}

/** Bảng giá gói: thanh toán theo năm và theo tháng. Dùng ở màn Gói thuê bao và popup khởi tạo từ FABi (T138) */
export const GIA_GOI_NAM: Record<Goi, { gia: string; chuKy: string; ghiChu: string }> = {
  S: { gia: '0 đ', chuKy: '/ trọn đời', ghiChu: 'Miễn phí vĩnh viễn' },
  PL: { gia: '199.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán theo năm (2.388.000 đ/năm)' },
  PR: { gia: '699.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán theo năm (8.388.000 đ/năm)' },
}

export const GIA_GOI_THANG: Record<Goi, { gia: string; chuKy: string; ghiChu: string }> = {
  S: { gia: '0 đ', chuKy: '/ trọn đời', ghiChu: 'Miễn phí vĩnh viễn' },
  PL: { gia: '249.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán linh hoạt từng tháng' },
  PR: { gia: '850.000 đ', chuKy: '/ tháng', ghiChu: 'Thanh toán linh hoạt từng tháng' },
}

/** Điểm nổi bật theo từng gói cho F&B */
export const DIEM_NOI_BAT: Record<Goi, { tieuDe: string; ds: string[] }> = {
  S: {
    tieuDe: 'Hộ kinh doanh & Quán ăn nhỏ',
    ds: [
      'Sổ sách & báo cáo HKD theo TT152/2025',   // khởi tạo thêm mẫu sổ theo nhóm, nhóm 3, 4 ẩn dòng này (T663)
      'Sổ sách & báo cáo DNSN theo TT58 (S1-DNSN)',   // khởi tạo chỉ hiện với doanh nghiệp (T663)
      'Quản lý lãi lỗ đơn giản (doanh thu tự động đồng bộ từ POS FABi)',
      'Quản lý thu chi (tiện ích đồng bộ thu chi tự động từ POS FABi)',
      'Quản lý mua hàng và công nợ nhà cung cấp',
      'Quản lý hao hụt kiểm kê hàng bán thẳng',
      'Kê khai thuế',   // khởi tạo ẩn dòng này khi loại hình, nhóm, cách tính thuế chưa kê khai được ở gói (T663)
      'Miễn phí 100% trọn đời, không giới hạn cửa hàng',
    ],
  },
  PL: {
    tieuDe: 'Doanh nghiệp siêu nhỏ 1 điểm bán',
    ds: [
      'Bao gồm toàn bộ tính năng của gói Standard',
      'Bộ 11 sổ sách & BCTC tinh gọn theo TT58/2026',
      'Tự động tính thuế GTGT và TNDN theo 4 phương pháp',
      'Quản lý mua hàng, công nợ nhà cung cấp và nhập kho',
      'Theo dõi nghĩa vụ thuế GTGT và thuế khác đầy đủ',
    ],
  },
  PR: {
    tieuDe: 'Chuỗi F&B lớn trên 10 điểm bán',
    ds: [
      'Bao gồm toàn bộ tính năng của gói Plus',
      'Không giới hạn số lượng điểm bán, kho hàng và người dùng',
      'Chế độ kế toán pháp định TT99/2025 cho DN vừa và lớn',
      'Quản lý số lô, hạn sử dụng, hạch toán đa cửa hàng',
      'Báo cáo quản trị tổng hợp chuỗi đa chiều theo thời gian thực',
    ],
  },
}

/** Gói thấp nhất có tính năng. */
export function minGoi(code: string): Goi {
  const f = FEATURE[code]
  return (f ? (GOIS.find(g => f.g.includes(g)) ?? 'PR') : 'S') as Goi
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
export const anNgoaiGoi = (goi: Goi) => goi === 'S'

/** Kiểu ghi sổ theo gói hoặc chế độ kế toán. */
export function kieuGhiSo(x: Goi | CheDo): 'khong' | 'so' | 'noco' {
  if (x in CHE_DO) return CHE_DO[x as CheDo].kieuGhiSo
  return CHE_DO[CHE_DO_MAC_DINH[x as Goi]].kieuGhiSo
}

/** Kiểu ghi sổ của đơn vị đang làm việc (QD81): gói Standard không ghi sổ, kể cả doanh nghiệp chạy TT58;
 *  gói khác theo chế độ kế toán: Plus doanh nghiệp TT58 ghi thẳng vào sổ, Plus hộ kinh doanh TT152 không ghi sổ, Pro Nợ/Có */
export function kieuGhiSoDv(s: { goi: Goi; cheDo: CheDo }): ReturnType<typeof kieuGhiSo> {
  return s.goi === 'S' ? 'khong' : kieuGhiSo(s.cheDo)
}

