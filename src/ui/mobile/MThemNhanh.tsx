import { useState, type FC, type ReactNode } from 'react'
import type { Row } from '../../modules/types'
import { Icon } from '../Icon'

/** Một ô trong sheet thêm nhanh. `ngan` đặt ô này rộng 120px, cùng hàng với ô kế tiếp (như Mã, Tên ở sheet Thêm nhà cung cấp) */
export interface OThemNhanh {
  k: string
  nhan: string
  batBuoc?: boolean
  kieu?: 'text' | 'email' | 'tel' | 'chip' | 'tich'
  ds?: string[]
  goiY?: string
  ngan?: boolean
  hien?: (v: Row) => boolean
}

interface MThemNhanhProps {
  tieuDe: string
  truong: OThemNhanh[]
  dau?: Row
  chuThich?: string
  onQuayLai: () => void
  onDong: () => void
  onLuu: (v: Row) => void
}

/** Sheet thêm nhanh danh mục ngay từ phiếu, cùng bố cục sheet Thêm nhà cung cấp của phiếu mua (T604) */
export const MThemNhanh: FC<MThemNhanhProps> = ({ tieuDe, truong, dau = {}, chuThich, onQuayLai, onDong, onLuu }) => {
  const [v, setV] = useState<Row>(dau)
  const dat = (k: string, gt: unknown) => setV(c => ({ ...c, [k]: gt }))
  const hienRa = truong.filter(t => !t.hien || t.hien(v))
  const du = hienRa.every(t => !t.batBuoc || t.k === 'ma' || String(v[t.k] ?? '').trim())

  const veO = (t: OThemNhanh) => {
    if (t.kieu === 'chip') return (
      <div className="m-t600-o-nhap-f" key={t.k}>
        <label className="m-t600-lbl">{t.nhan}{t.batBuoc && <> <em>*</em></>}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {t.ds?.map(x => (
            <button key={x} type="button" className={`m-tc-dt-chip${v[t.k] === x ? ' on' : ''}`} onClick={() => dat(t.k, x)}>{x}</button>
          ))}
        </div>
      </div>
    )
    if (t.kieu === 'tich') return (
      <label key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={Boolean(v[t.k])} onChange={e => dat(t.k, e.target.checked ? 1 : 0)} />
        <span>{t.nhan}</span>
      </label>
    )
    return (
      <div className="m-t600-o-nhap-f" key={t.k}>
        <label className="m-t600-lbl">{t.nhan}{t.batBuoc && <> <em>*</em></>}</label>
        <input
          type={t.kieu ?? 'text'}
          className="m-t600-inp"
          value={String(v[t.k] ?? '')}
          onChange={e => dat(t.k, e.target.value)}
          placeholder={t.goiY}
        />
      </div>
    )
  }

  const hang: ReactNode[] = []
  for (let i = 0; i < hienRa.length; i++) {
    const t = hienRa[i]
    if (t.ngan && hienRa[i + 1]) {
      hang.push(
        <div key={t.k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
          {veO(t)}
          {veO(hienRa[i + 1])}
        </div>
      )
      i++
    } else hang.push(veO(t))
  }

  return (
    <div className="m-tam-overlay" onClick={onQuayLai}>
      <div className="m-tam-hop m-t600-sheet-85" onClick={e => e.stopPropagation()}>
        <div className="m-tam-dau">
          <button type="button" className="m-tam-dong-btn" onClick={onQuayLai} style={{ marginRight: 8, fontSize: 18 }}>‹</button>
          <h2 className="m-tam-tieu" style={{ flex: 1 }}>{tieuDe}</h2>
          <button type="button" className="m-tam-dong-btn" onClick={onDong}>
            <Icon n="x" className="ic sm" kieu="net" />
          </button>
        </div>

        <div className="m-t600-sheet-than" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hang}
          {chuThich && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{chuThich}</div>}
        </div>

        <div className="m-t600-sheet-day">
          <button type="button" className="btn sub" style={{ height: 44, borderRadius: 8, flex: 1 }} onClick={onQuayLai}>Huỷ</button>
          <button type="button" className="btn pri" style={{ height: 44, borderRadius: 8, flex: 2 }} disabled={!du} onClick={() => onLuu(v)}>
            Lưu và chọn
          </button>
        </div>
      </div>
    </div>
  )
}
