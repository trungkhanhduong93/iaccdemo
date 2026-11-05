// Chia số dư ban đầu của quỹ cho từng cửa hàng áp dụng (T750), dùng ở khối Theo cửa hàng của form Quỹ tiền: quỹ áp dụng từ 2 cửa hàng thì số dư ban đầu tổng tự chia đều
// cho từng cửa hàng (tròn nghìn, phần lẻ dồn cửa hàng cuối). Sửa tay một dòng thì dòng đó giữ nguyên, phần còn lại chia cho dòng chưa sửa.
// Giá trị form _suaCn là { mã cửa hàng: số đã sửa tay }; phần chia cuối cùng tính lại từ tổng, cửa hàng áp dụng và _suaCn.
import { CUA_HANG } from '../../data/mock'
import { money } from '../../ui/format'

/** Số tiền từ ô nhập: số hoặc chuỗi có dấu chấm ngăn nghìn */
export const docTien = (x: unknown): number => typeof x === 'number' ? x : Number(String(x ?? '').replace(/[^\d-]/g, '')) || 0

/** Cửa hàng áp dụng của quỹ theo giá trị form, "Tất cả" hoặc để trống là mọi cửa hàng */
export function cnCuaQuy(v: Record<string, any>) {
  const apDung = String(v.cn ?? 'Tất cả')
  return apDung === 'Tất cả' || !apDung.trim() ? CUA_HANG : CUA_HANG.filter(c => apDung.split(', ').includes(c.ten))
}

/** Chia tổng cho các cửa hàng: dòng đã sửa giữ số đã sửa, dòng chưa sửa chia đều phần còn lại, tròn nghìn, lẻ dồn dòng chưa sửa cuối */
export function chiaSoDu(tong: number, ids: string[], sua: Record<string, number> = {}): Record<string, number> {
  const tu = ids.filter(id => sua[id] === undefined)
  const con = tong - ids.reduce((a, id) => a + (sua[id] ?? 0), 0)
  const moi = tu.length ? Math.trunc(con / tu.length / 1000) * 1000 : 0
  return Object.fromEntries(ids.map(id => {
    if (sua[id] !== undefined) return [id, sua[id]]
    return [id, id === tu[tu.length - 1] ? con - moi * (tu.length - 1) : moi]
  }))
}

/** Phần chia của quỹ theo giá trị form; quỹ một cửa hàng thì không chia */
export function chiaTheoForm(v: Record<string, any>): Record<string, number> | null {
  const ds = cnCuaQuy(v)
  if (ds.length < 2) return null
  const ids = ds.map(c => c.id)
  const sua = Object.fromEntries(Object.entries((v._suaCn ?? {}) as Record<string, number>).filter(([id]) => ids.includes(id)))
  return chiaSoDu(docTien(v.soDu), ids, sua)
}

/** Lỗi chặn lưu: tổng các cửa hàng không khớp số dư ban đầu, hoặc có cửa hàng bị âm vì số sửa tay vượt tổng */
export function loiChiaSoDu(v: Record<string, any>): string | null {
  const chia = chiaTheoForm(v)
  if (!chia) return null
  const tong = docTien(v.soDu)
  const daChia = Object.values(chia).reduce((a, x) => a + x, 0)
  if (daChia !== tong) return `Số dư chia cho các cửa hàng (${money(daChia)} đ) chưa khớp số dư ban đầu (${money(tong)} đ).`
  if (tong >= 0 && Object.values(chia).some(x => x < 0)) return 'Số đã sửa ở các cửa hàng vượt số dư ban đầu, có cửa hàng bị âm. Sửa lại hoặc bấm Chia đều lại.'
  return null
}
