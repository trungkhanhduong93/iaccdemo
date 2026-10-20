// Số chứng từ trên báo cáo bấm mở chứng từ chi tiết (T201): dò số trong phiếu mẫu của mọi màn chứng từ, ra đường dẫn /app/<phân hệ>/<màn>/<id>
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row } from '../../modules/types'
import { MODULES } from '../../app/registry'
import { DAILY } from '../../data/mock'
import { soFabi, theoDon } from '../../modules/ban-hang/ChungTuBanHang'
import { chungTu } from './gen'
import { gopLoai } from './VoucherScreen'

let BANG: Map<string, string> | undefined
const POS: { so: string; to: string }[] = []   // phiếu Xuất bán POS, cho mã hoá đơn FABi tự sinh của sổ

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
  // Xuất bán POS 3.1.1 (màn riêng, không có voucher): id là thứ tự trong danh sách, mỗi hoá đơn một chứng từ như ChungTuBanHang (T247)
  DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().flatMap(x => theoDon(x).reverse()).forEach((x, i) => {
    const so = soFabi(`fabi-${x.seed}`)
    if (!BANG!.has(so)) BANG!.set(so, `/app/ban-hang/3-1-1/${i}`)
    POS.push({ so, to: `/app/ban-hang/3-1-1/${i}` })
  })
  return BANG
}

const MAU_SO = /^([A-Z]+)(\d{4})(?:-(\w+))?$/
/** Tiền tố số của sổ không có màn chứng từ riêng: phiếu nhập PN mở phiếu nhập kho NK, nhập mua NM mở phiếu mua hàng MH, phiếu xuất PX mở phiếu xuất kho XK, bán hàng BH mở hoá đơn bán hàng */
const TIEN_TO_KHAC: Record<string, string[]> = { PN: ['NK'], NM: ['MH'], PX: ['XK', 'XB'], BH: ['BH', 'HDB'] }
let THEO_LOAI: Map<string, { so: string; to: string }[]> | undefined

/** Phiếu thật theo loại (tiền tố số) và tháng (YYMM), xếp theo số */
function theoLoai(): Map<string, { so: string; to: string }[]> {
  if (THEO_LOAI) return THEO_LOAI
  THEO_LOAI = new Map()
  for (const [so, to] of bangSo()) {
    const m = MAU_SO.exec(so)
    if (!m) continue
    const k = m[1] + m[2]
    THEO_LOAI.set(k, [...(THEO_LOAI.get(k) ?? []), { so, to }])
  }
  for (const ds of THEO_LOAI.values()) ds.sort((x, y) => x.so.localeCompare(y.so))
  return THEO_LOAI
}

/** Phiếu mở được theo số. Số có trong phiếu mẫu thì mở đúng phiếu đó. Số sổ tự đánh (vd PT2609-0002 của sổ ngân hàng, BH2609-01 của bộ sổ TT58)
 *  thì lấy phiếu thật cùng loại, cùng tháng theo thứ tự (phiếu thứ 2 của PT tháng 9/2026), ô hiện số phiếu thật; PhuongXT chọn cách này 14/10/2026 (T201) */
export function phieuTheoSo(so: unknown): { so: string; to: string } | undefined {
  if (typeof so !== 'string' || !so) return undefined
  const to = bangSo().get(so)
  if (to) return { so, to }
  // bộ sổ hộ kinh doanh TT152 ghi số dạng PT000001/9/2026: đổi về tiền tố, tháng YYMM, thứ tự
  const hkd = /^([A-Z]+)(\d+)\/(\d{1,2})\/\d{2}(\d{2})$/.exec(so)
  // Sổ quỹ tiền mặt ghi số ngắn dạng PT09-001 (tháng, thứ tự): coi là năm 2026 (T491)
  const ngan = /^([A-Z]+)(\d{2})-(\d+)$/.exec(so)
  const m = hkd ? [so, hkd[1], hkd[4] + hkd[3].padStart(2, '0'), hkd[2]] : ngan ? [so, ngan[1], '26' + ngan[2], ngan[3]] : MAU_SO.exec(so)
  // mã hoá đơn FABi 12 ký tự tự sinh (sổ doanh thu hộ kinh doanh): lấy một phiếu Xuất bán POS theo mã ký tự
  if (!m && /^[A-Z0-9]{12}$/.test(so) && POS.length) return POS[[...so].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100003, 7) % POS.length]
  if (!m) return undefined
  const ds = (TIEN_TO_KHAC[m[1]] ?? [m[1]]).map(t => theoLoai().get(t + m[2])).find(x => x?.length)
  if (!ds) return undefined
  // đuôi số (0002, 01) là thứ tự; đuôi chữ (L, DV) hoặc không đuôi thì lấy theo mã ký tự
  const duoi = m[3] ?? ''
  const thuTu = /^\d+$/.test(duoi) ? Number(duoi) - 1 : [...duoi].reduce((a, c) => a + c.charCodeAt(0), 0)
  return ds[thuTu % ds.length]
}
export const duongPhieu = (so: unknown) => phieuTheoSo(so)?.to

/** Ô số chứng từ: có phiếu thì là liên kết mở phiếu (hiện số của phiếu mở ra), không thì giữ chữ */
export function SoChungTu({ so }: { so: unknown }): ReactNode {
  const p = phieuTheoSo(so)
  return p ? <Link className="ds-link-so" to={p.to} onClick={e => e.stopPropagation()} title="Mở chứng từ">{p.so}</Link> : (so as ReactNode)
}

/** Cột số chứng từ của báo cáo (so, soCt, soHieu, soHd; bỏ cột đếm số phiếu) */
const COT_SO = new Set(['so', 'soCt', 'soHieu', 'soHd'])
export const laCotSo = (c: Col) => COT_SO.has(c.k) && !c.num && !c.r

/** Gắn liên kết mở chứng từ cho cột số chứng từ; dòng tổng, dòng nhóm giữ chữ */
export const ganMoPhieu = (cols: Col[]): Col[] =>
  cols.map(c => laCotSo(c) ? { ...c, r: (x: Row) => x._t || x._nhom ? x[c.k] : <SoChungTu so={x[c.k]} /> } : c)
