import { useEffect, useMemo, useState, type FC } from 'react'
import { Icon } from '../Icon'
import { fold } from '../format'

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
  apDung?: boolean
  tim?: boolean
}

export const MChon: FC<MChonProps> = ({ mo, onDong, tieuDe, ds, chon, onChon, apDung, tim }) => {
  const [tamChon, setTamChon] = useState(chon ?? '')
  const [tuKhoa, setTuKhoa] = useState('')

  useEffect(() => {
    if (mo) {
      setTamChon(chon ?? '')
      setTuKhoa('')
    }
  }, [mo, chon])

  const dsLoc = useMemo(() => {
    if (!tim || !tuKhoa.trim()) return ds
    const q = fold(tuKhoa.trim())
    return ds.filter(m => fold(m.ten).includes(q) || (m.moTa && fold(m.moTa).includes(q)))
  }, [ds, tim, tuKhoa])

  if (!mo) return null

  return (
    <div className="m-tam-overlay" onClick={onDong}>
      <div className={`m-tam-hop ${apDung ? 'm-tam-hop-apdung' : ''}`} onClick={e => e.stopPropagation()}>
        {!apDung && <div className="m-tam-keo" />}
        <div className={`m-tam-dau ${apDung ? 'm-tam-dau-apdung' : ''}`}>
          <h2 className="m-tam-tieu">{tieuDe}</h2>
          <button type="button" className="m-tam-dong-btn" onClick={onDong} aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>
        {tim && (
          <div className="m-tam-tim-wrap">
            <Icon n="search" className="ic sm m-tam-tim-ic" />
            <input
              type="text"
              className="m-tam-tim-inp"
              placeholder="Tìm kiếm"
              value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)}
            />
            {tuKhoa && (
              <button type="button" className="m-tam-tim-x" onClick={() => setTuKhoa('')} aria-label="Xoá tìm kiếm">
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        )}
        <div className="m-tam-ds">
          {dsLoc.map(m => {
            const isChon = apDung ? m.k === tamChon : m.k === chon
            return (
              <div
                key={m.k}
                className={`m-tam-dong ${isChon ? 'on' : ''}`}
                onClick={() => {
                  if (apDung) {
                    setTamChon(m.k)
                  } else {
                    onChon(m.k)
                    onDong()
                  }
                }}
              >
                <div className="m-tam-dong-nd">
                  <div className="m-tam-dong-ten">{m.ten}</div>
                  {m.moTa && <div className="m-tam-dong-mota">{m.moTa}</div>}
                </div>
                {apDung ? (
                  <div className={`m-tam-radio ${isChon ? 'on' : ''}`}>
                    {isChon && <div className="m-tam-radio-cham" />}
                  </div>
                ) : (
                  isChon && (
                    <div className="m-tam-tich">
                      <Icon n="check" className="ic sm" />
                    </div>
                  )
                )}
              </div>
            )
          })}
        </div>
        {apDung && (
          <div className="m-tam-day">
            <button type="button" className="m-tam-btn-huy" onClick={onDong}>
              Huỷ
            </button>
            <button
              type="button"
              className="m-tam-btn-apdung"
              onClick={() => {
                onChon(tamChon)
                onDong()
              }}
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
