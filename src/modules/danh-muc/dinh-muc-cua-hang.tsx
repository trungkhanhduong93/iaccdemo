// Định mức theo cửa hàng ở Danh mục cửa hàng (T938): định mức chi phí NVL (% trên doanh thu), định mức hao hụt (%).
import { useState } from 'react'
import { useSession, type Session } from '../../app/session'

export type KhoaDinhMuc = 'nvl' | 'haoHut'

type SDm = Pick<Session, 'donVi' | 'dinhMucCh'>

/** Định mức đã đặt của cửa hàng; chưa đặt thì undefined */
export const dinhMucCh = (s: SDm, cn: string, k: KhoaDinhMuc): number | undefined => s.dinhMucCh?.[s.donVi]?.[cn]?.[k]

/** Phần phiên cần lưu khi đổi định mức; giá trị undefined là xoá định mức */
export const datDinhMucCh = (s: SDm, cn: string, k: KhoaDinhMuc, v: number | undefined): Partial<Session> =>
  ({ dinhMucCh: { ...s.dinhMucCh, [s.donVi]: { ...s.dinhMucCh?.[s.donVi], [cn]: { ...s.dinhMucCh?.[s.donVi]?.[cn], [k]: v } } } })

/** Ô nhập % định mức, lưu khi rời ô hoặc nhấn Enter. Số từ 0 đến 100, để trống là xoá */
export function ODinhMuc({ cn, ten, k }: { cn: string; ten: string; k: KhoaDinhMuc }) {
  const { s, set, toast } = useSession()
  const goc = dinhMucCh(s, cn, k)
  const [nhap, setNhap] = useState<string | null>(null)
  const nhan = k === 'nvl' ? 'định mức chi phí NVL' : 'định mức hao hụt'
  const luu = () => {
    if (nhap === null) return
    const t = nhap.trim().replace(',', '.')
    const v = t === '' ? undefined : Number(t)
    setNhap(null)
    if (v !== undefined && (!Number.isFinite(v) || v < 0 || v > 100)) { toast(`${nhan[0].toUpperCase()}${nhan.slice(1)} phải từ 0 đến 100%`); return }
    if (v === goc) return
    set(datDinhMucCh(s, cn, k, v))
    toast(v === undefined ? `Đã xoá ${nhan} của ${ten}` : `Đã đặt ${nhan} của ${ten} là ${v}%`)
  }
  return (
    <span className="dmcn-dm" onClick={e => e.stopPropagation()}>
      <input className="inp" inputMode="decimal" placeholder="Chưa đặt" aria-label={`${nhan[0].toUpperCase()}${nhan.slice(1)} ${ten} (%)`}
        value={nhap ?? (goc === undefined ? '' : String(goc))} onChange={e => setNhap(e.target.value)} onBlur={luu}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setNhap(null) }} />
      <small>%</small>
    </span>
  )
}
