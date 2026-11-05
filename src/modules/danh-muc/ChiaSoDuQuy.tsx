// Khối "Số dư theo cửa hàng" trong form Quỹ tiền (T750): quỹ áp dụng từ 2 cửa hàng thì số dư ban đầu tổng tự chia đều
// cho từng cửa hàng (tròn nghìn, phần lẻ dồn cửa hàng cuối). Sửa tay một dòng thì dòng đó giữ nguyên, phần còn lại chia cho dòng chưa sửa.
// Giá trị form _suaCn là { mã cửa hàng: số đã sửa tay }; phần chia cuối cùng tính lại từ tổng, cửa hàng áp dụng và _suaCn.
import type { ChangeEvent } from 'react'
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

export function KhoiChiaSoDu({ v, doi, xem }: { v: Record<string, any>; doi: (k: string, val: unknown) => void; xem: boolean }) {
  const ds = cnCuaQuy(v)
  const chia = chiaTheoForm(v)
  if (!chia) return <div className="csd-trong">Quỹ dùng cho một cửa hàng nên số dư ban đầu thuộc cả cửa hàng đó.</div>
  const sua: Record<string, number> = v._suaCn ?? {}
  const tong = docTien(v.soDu)
  const daChia = Object.values(chia).reduce((a, x) => a + x, 0)
  const lech = daChia - tong
  const coSua = ds.some(c => sua[c.id] !== undefined)
  const go = (id: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d-]/g, '')
    if (raw === '' || raw === '-') { const { [id]: _, ...con } = sua; doi('_suaCn', con); return }
    doi('_suaCn', { ...sua, [id]: Number(raw) })
  }
  return (
    <div className="csd">
      <p className="csd-goi-y">Nhập số dư ban đầu là tổng tiền của quỹ, hệ thống chia đều cho các cửa hàng. Sửa số của cửa hàng nào thì phần còn lại chia cho các cửa hàng chưa sửa.</p>
      <table className="csd-bang">
        <thead><tr><th>Cửa hàng</th><th className="so">Số dư ban đầu</th></tr></thead>
        <tbody>
          {ds.map(c => (
            <tr key={c.id} className={sua[c.id] !== undefined ? 'da-sua' : undefined}>
              <td>{c.ten}{sua[c.id] !== undefined && <small className="csd-nhan">Đã sửa</small>}</td>
              <td className="so">
                {xem ? money(chia[c.id]) : <input className="csd-o" inputMode="numeric" value={money(chia[c.id])} onChange={go(c.id)} aria-label={`Số dư ban đầu ${c.ten}`} />}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={lech ? 'lech' : undefined}>
            <td>Tổng đã chia{lech !== 0 && <small className="csd-lech">Lệch {money(lech)} đ</small>}</td>
            <td className="so">{money(daChia)}</td>
          </tr>
        </tfoot>
      </table>
      {!xem && coSua && <button type="button" className="csd-chia-lai" onClick={() => doi('_suaCn', {})}>Chia đều lại</button>}
    </div>
  )
}
