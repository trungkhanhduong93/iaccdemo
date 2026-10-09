// Chế độ kế toán (thông tư) của đơn vị. Gói quyết định mở tính năng nào; chế độ quyết định mẫu sổ, báo cáo, chứng từ, tài khoản (QD31).
import type { Goi } from './plan'

export type CheDo = 'TT152' | 'TT58' | 'TT133' | 'TT99'
export const CHE_DOS: CheDo[] = ['TT152', 'TT58', 'TT133', 'TT99']

export interface CheDoDef {
  ma: CheDo
  soHieu: string          // vd 'TT133/2016/TT-BTC'
  ngan: string            // nhãn ngắn: 'TT133'
  ten: string             // tên chế độ
  ngayBanHanh?: string    // dd/MM/yyyy; thiếu là chưa đối chiếu văn bản gốc
  hauTo: string           // hậu tố ký hiệu mẫu: '-HKD', '-DNSN', '-DNN', '-DN'
  kieuGhiSo: 'khong' | 'so' | 'noco'
  choDuyet: boolean       // ký hiệu mẫu chưa được kế toán trưởng duyệt (T04)
}

export const CHE_DO: Record<CheDo, CheDoDef> = {
  TT152: { ma: 'TT152', soHieu: 'TT152/2025/TT-BTC', ngan: 'TT152', ten: 'Chế độ kế toán hộ kinh doanh, cá nhân kinh doanh', ngayBanHanh: '31/12/2025', hauTo: '-HKD', kieuGhiSo: 'khong', choDuyet: true },
  TT58: { ma: 'TT58', soHieu: 'TT58/2026/TT-BTC', ngan: 'TT58', ten: 'Chế độ kế toán doanh nghiệp siêu nhỏ', ngayBanHanh: '25/05/2026', hauTo: '-DNSN', kieuGhiSo: 'so', choDuyet: true },
  TT133: { ma: 'TT133', soHieu: 'TT133/2016/TT-BTC', ngan: 'TT133', ten: 'Chế độ kế toán doanh nghiệp nhỏ và vừa', ngayBanHanh: '26/08/2016', hauTo: '-DNN', kieuGhiSo: 'noco', choDuyet: true },
  TT99: { ma: 'TT99', soHieu: 'TT99/2025/TT-BTC', ngan: 'TT99', ten: 'Chế độ kế toán doanh nghiệp', hauTo: '-DN', kieuGhiSo: 'noco', choDuyet: true },
}

/** Chế độ mặc định khi chọn gói */
export const CHE_DO_MAC_DINH: Record<Goi, CheDo> = { F: 'TT152', S: 'TT58', PL: 'TT133', PR: 'TT99' }
/** Cặp gói và chế độ cho phép chọn (Trum chốt 09/10/2026) */
export const CHE_DO_HOP_LE: Record<Goi, CheDo[]> = { F: ['TT152'], S: ['TT58'], PL: ['TT133', 'TT99'], PR: ['TT99', 'TT133'] }

/** Chế độ hợp lệ với gói thì giữ, không thì về mặc định của gói */
export function chuanHoaCheDo(goi: Goi, cd: unknown): CheDo {
  return CHE_DO_HOP_LE[goi].includes(cd as CheDo) ? cd as CheDo : CHE_DO_MAC_DINH[goi]
}
/** Chế độ mặc định của một gói, dùng khi chỉ biết gói (bảng so sánh gói, danh sách đơn vị) */
export const cheDoCuaGoi = (g: Goi) => CHE_DO[CHE_DO_MAC_DINH[g]]
