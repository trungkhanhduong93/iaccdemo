import type { FC } from 'react'
import { Icon } from '../Icon'

export interface MChonMuc {
  k: string
  ten: string
  moTa?: string
}

export interface MChonProps {
  mo: boolean
  onDong: () => void
  tieuDe: string
  ds: MChonMuc[]
  chon?: string
  onChon: (k: string) => void
}

export const MChon: FC<MChonProps> = ({ mo, onDong, tieuDe, ds, chon, onChon }) => {
  if (!mo) return null

  return (
    <div className="m-tam-overlay" onClick={onDong}>
      <div className="m-tam-hop" onClick={e => e.stopPropagation()}>
        <div className="m-tam-keo" />
        <div className="m-tam-dau">
          <h2 className="m-tam-tieu">{tieuDe}</h2>
          <button type="button" className="m-tam-dong-btn" onClick={onDong} aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>
        <div className="m-tam-ds">
          {ds.map(m => {
            const isChon = m.k === chon
            return (
              <div
                key={m.k}
                className={`m-tam-dong ${isChon ? 'on' : ''}`}
                onClick={() => {
                  onChon(m.k)
                  onDong()
                }}
              >
                <div className="m-tam-dong-nd">
                  <div className="m-tam-dong-ten">{m.ten}</div>
                  {m.moTa && <div className="m-tam-dong-mota">{m.moTa}</div>}
                </div>
                {isChon && (
                  <div className="m-tam-tich">
                    <Icon n="check" className="ic sm" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
