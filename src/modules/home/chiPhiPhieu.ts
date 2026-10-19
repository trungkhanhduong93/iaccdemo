// Chi phí hoạt động trang chủ gói Free cộng từ phiếu chi thật (T483): phiếu chi tiền mặt, chi ngân hàng của Thu chi
// đúng như danh sách 2.1.1 (phiếu mẫu, phiếu lập thêm, đã sửa, bỏ phiếu đã xoá), lý do được tích là chi phí, theo tháng của ngày phiếu, cửa hàng.
// (trừ Chi phí chờ phân bổ). Bấm từng lý do ở màn Chi phí hoạt động mở danh sách lọc đúng lý do, tháng nên số luôn khớp
import { useMemo } from 'react'
import type { Session } from '../../app/session'
import tien from '../tien'
import { CUA_HANG, LY_CHI_PHI } from '../../data/mock'
import { gopLoai, lyDoThuChi } from '../../ui/generic/VoucherScreen'
import { apKhoPhieu, useBanPhieu } from '../../ui/generic/daXoa'

export interface PhieuChiPhi { thang: number; nam: number; cn: string; ly: string; tien: number; nhom: 'tm' | 'nh' }
export interface DongChiPhi { ly: string; v: number; so: number; tm: number; nh: number }

/** Phiếu chi có lý do là chi phí của Thu chi, như danh sách đang thấy */
export function phieuChiPhi(s: Session): PhieuChiPhi[] {
  const sc = tien.screens.find(x => x.slug === '2-1-1')   // lấy thẳng phân hệ, không qua registry để khỏi vòng nạp với trang chủ
  const cfg = sc?.voucher
  if (!sc || !cfg) return []
  const goc = [...(cfg.phieuThem?.(s) ?? []), ...gopLoai(cfg, sc.code ?? sc.slug)]
  return apKhoPhieu(`${tien.key}/${sc.slug}`, goc)
    .filter(r => r.loai === 'chi' || r.loai === 'unc')
    .map(r => {
      const [, thang, nam] = String(r.ngay ?? '').split(' ')[0].split('/').map(Number)
      return { thang, nam, cn: String(r.cn ?? ''), ly: lyDoThuChi(cfg, r), tien: Number(r.tong ?? r.tien ?? 0), nhom: r.loai === 'unc' ? 'nh' as const : 'tm' as const }
    })
    // Chi phí chờ phân bổ là khoản trả trước, vào chi phí dần qua dòng Chi phí phân bổ, khấu hao nên không cộng ở đây
    .filter(p => LY_CHI_PHI.includes(p.ly) && p.ly !== 'Chi phí chờ phân bổ')
}

/** Chi phí hoạt động một tháng của các cửa hàng (id), chia theo lý do, lý do lớn nhất ở đầu */
export function chiPhiThangTuPhieu(ds: PhieuChiPhi[], thang: number, cnIds: string[], nam = 2026): { tong: number; ds: DongChiPhi[] } {
  const ten = new Set(CUA_HANG.filter(c => cnIds.includes(c.id)).map(c => c.ten))
  const theoLy = new Map<string, DongChiPhi>()
  for (const p of ds) {
    if (p.thang !== thang || p.nam !== nam || !ten.has(p.cn)) continue
    const d = theoLy.get(p.ly) ?? { ly: p.ly, v: 0, so: 0, tm: 0, nh: 0 }
    d.v += p.tien; d.so++; d[p.nhom] += p.tien
    theoLy.set(p.ly, d)
  }
  const dsLy = [...theoLy.values()].sort((a, b) => b.v - a.v)
  return { tong: dsLy.reduce((a, d) => a + d.v, 0), ds: dsLy }
}

/** Phiếu chi phí của phiên, tính lại khi lập, sửa, xoá phiếu hoặc đổi đồng bộ FABi */
export function usePhieuChiPhi(s: Session): PhieuChiPhi[] {
  const ban = useBanPhieu()
  return useMemo(() => phieuChiPhi(s), [s.donVi, s.dongBoThuChi, s.mapPttt, ban])   // eslint-disable-line react-hooks/exhaustive-deps
}

const MO_TA: Record<string, [string, string]> = {
  'Thanh toán tiền lương': ['users', 'Lương nhân viên bếp, phục vụ, quản lý'],
  'Chi tiền thuê nhà': ['cuahang', 'Thuê mặt bằng các cửa hàng'],
}
/** Biểu tượng, dòng phụ của một lý do chi phí: mô tả (nếu có) và số phiếu chi */
export const moTaChiPhi = (d: DongChiPhi) => ({ icon: MO_TA[d.ly]?.[0] ?? 'cashout', phu: [MO_TA[d.ly]?.[1], `${d.so} phiếu chi`].filter(Boolean).join(' · ') })
/** Danh sách Thu chi lọc đúng lý do, tháng, ở tab Tiền mặt hoặc Ngân hàng */
export const linkChiPhi = (ly: string, thang: number, nhom: 'tm' | 'nh') =>
  `/app/tien/2-1-1?nhom=${nhom}&lyDo=${encodeURIComponent(ly)}&thang=2026-${String(thang).padStart(2, '0')}`
