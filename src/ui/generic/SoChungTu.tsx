// Số chứng từ trên báo cáo bấm mở chứng từ chi tiết (T201): dò số trong phiếu mẫu của mọi màn chứng từ, ra đường dẫn /app/<phân hệ>/<màn>/<id>
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row } from '../../modules/types'
import { MODULES } from '../../app/registry'
import { DAILY } from '../../data/mock'
import { soFabi, theoKenh } from '../../modules/ban-hang/ChungTuBanHang'
import { chungTu } from './gen'
import { gopLoai } from './VoucherScreen'

let BANG: Map<string, string> | undefined

/** Bảng số chứng từ → đường dẫn, dựng một lần khi cần; cùng hạt giống với danh sách chứng từ nên số trùng phiếu đang có */
function bangSo(): Map<string, string> {
  if (BANG) return BANG
  BANG = new Map()
  for (const m of MODULES) {
    if (m.key === 'bao-cao') continue
    for (const sc of m.screens) {
      const cfg = sc.voucher
      if (!cfg) continue
      const seed = sc.code ?? sc.slug
      const rows = [...(cfg.phieuThem?.() ?? []), ...(cfg.rowsMau ? cfg.rowsMau() : cfg.loai ? gopLoai(cfg, seed) : chungTu(cfg, seed))]
      for (const r of rows) {
        const so = String(r.so ?? '')
        if (so && !BANG.has(so)) BANG.set(so, `/app/${m.key}/${sc.slug}/${r.id}`)
      }
    }
  }
  // Xuất bán POS 3.1.1 (màn riêng, không có voucher): id là thứ tự trong danh sách khi đồng bộ tổng hợp theo kênh, như ChungTuBanHang
  DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().flatMap(theoKenh).forEach((x, i) => {
    const so = soFabi(`fabi-${x.seed}`)
    if (!BANG!.has(so)) BANG!.set(so, `/app/ban-hang/3-1-1/${i}`)
  })
  return BANG
}

/** Đường dẫn mở chứng từ theo số; số không có trong phiếu mẫu (số sinh riêng cho sổ) thì không có */
export const duongPhieu = (so: unknown): string | undefined => typeof so === 'string' && so ? bangSo().get(so) : undefined

/** Ô số chứng từ: có phiếu thì là liên kết mở phiếu, không thì giữ chữ */
export function SoChungTu({ so }: { so: unknown }): ReactNode {
  const to = duongPhieu(so)
  return to ? <Link className="ds-link-so" to={to} onClick={e => e.stopPropagation()} title="Mở chứng từ">{String(so)}</Link> : (so as ReactNode)
}

/** Cột số chứng từ của báo cáo (so, soCt, soHieu, soHd; bỏ cột đếm số phiếu) */
const COT_SO = new Set(['so', 'soCt', 'soHieu', 'soHd'])
export const laCotSo = (c: Col) => COT_SO.has(c.k) && !c.num && !c.r

/** Gắn liên kết mở chứng từ cho cột số chứng từ; dòng tổng, dòng nhóm giữ chữ */
export const ganMoPhieu = (cols: Col[]): Col[] =>
  cols.map(c => laCotSo(c) ? { ...c, r: (x: Row) => x._t || x._nhom ? x[c.k] : <SoChungTu so={x[c.k]} /> } : c)
