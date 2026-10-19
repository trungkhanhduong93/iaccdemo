// Chi phí hoạt động trang chủ gói Free cộng từ phiếu chi thật (T483): phiếu chi tiền mặt, chi ngân hàng của Thu chi
// đúng như danh sách 2.1.1 (phiếu mẫu, phiếu lập thêm, đã sửa, bỏ phiếu đã xoá), lý do được tích là chi phí, theo tháng của ngày phiếu, cửa hàng.
// (trừ Chi phí chờ phân bổ). Bấm từng lý do ở màn Chi phí hoạt động hiện ngay danh sách phiếu của lý do đó nên số luôn khớp
import { useMemo } from 'react'
import type { Session } from '../../app/session'
import tien from '../tien'
import { CUA_HANG, LY_CHI_PHI } from '../../data/mock'
import { gopLoai, lyDoThuChi } from '../../ui/generic/VoucherScreen'
import { apKhoPhieu, useBanPhieu } from '../../ui/generic/daXoa'

export interface PhieuChiPhi {
  id: string; so: string; ngay: string; thang: number; nam: number; cn: string; doiTuong: string; dienGiai: string
  ly: string; tien: number; nhom: 'tm' | 'nh'
}
export interface DongChiPhi { ly: string; v: number; so: number; tm: number; nh: number; phieu: PhieuChiPhi[] }

/** Phiếu chi có lý do là chi phí của Thu chi, như danh sách đang thấy */
export function phieuChiPhi(s: Session): PhieuChiPhi[] {
  const sc = tien.screens.find(x => x.slug === '2-1-1')   // lấy thẳng phân hệ, không qua registry để khỏi vòng nạp với trang chủ
  const cfg = sc?.voucher
  if (!sc || !cfg) return []
  const goc = [...(cfg.phieuThem?.(s) ?? []), ...gopLoai(cfg, sc.code ?? sc.slug)]
  return apKhoPhieu(`${tien.key}/${sc.slug}`, goc)
    .filter(r => r.loai === 'chi' || r.loai === 'unc')
    .map(r => {
      const ngay = String(r.ngay ?? '').split(' ')[0]
      const [, thang, nam] = ngay.split('/').map(Number)
      return {
        id: String(r.id), so: String(r.so ?? ''), ngay, thang, nam, cn: String(r.cn ?? ''), doiTuong: String(r.doiTuong ?? ''), dienGiai: String(r.dienGiai ?? ''),
        ly: lyDoThuChi(cfg, r), tien: Number(r.tong ?? r.tien ?? 0), nhom: r.loai === 'unc' ? 'nh' as const : 'tm' as const,
      }
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
    const d = theoLy.get(p.ly) ?? { ly: p.ly, v: 0, so: 0, tm: 0, nh: 0, phieu: [] }
    d.v += p.tien; d.so++; d[p.nhom] += p.tien; d.phieu.push(p)
    theoLy.set(p.ly, d)
  }
  const ngaySo = (x: string) => x.split('/').reverse().join('')
  const dsLy = [...theoLy.values()].sort((a, b) => b.v - a.v)
  for (const d of dsLy) d.phieu.sort((a, b) => ngaySo(b.ngay).localeCompare(ngaySo(a.ngay)) || b.so.localeCompare(a.so))   // mới nhất ở đầu
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
