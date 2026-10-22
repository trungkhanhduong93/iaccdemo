import type { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../Icon'

export interface DongTomTat {
  nhan: string
  giaTri: ReactNode
  noiBat?: boolean
}

export interface MThanhCongProps {
  tieuDe?: string
  moTa?: string
  dsTomTat?: DongTomTat[]
  xemUrl?: string
  onXemChiTiet?: () => void
  onLapMoi?: () => void
  onDong?: () => void
}

/** Màn hình lưu thành công dùng chung cho mobile (T552, T629) */
export const MThanhCong: FC<MThanhCongProps> = ({
  tieuDe = 'Lưu phiếu thành công',
  moTa,
  dsTomTat = [],
  xemUrl,
  onXemChiTiet,
  onLapMoi,
  onDong,
}) => {
  const nav = useNavigate()

  const handleDong = () => {
    if (onDong) onDong()
  }

  const handleXem = () => {
    if (onXemChiTiet) {
      onXemChiTiet()
    } else if (xemUrl) {
      nav(xemUrl, { replace: true })
    }
  }

  return (
    <div className="m-pb-man m-tc552-man">
      <div className="m-lp-buoc m-lp-buoc-thanh-cong">
        <div className="m-lp-dau-thanh-cong">
          <button
            type="button"
            className="m-lp-btn-home"
            onClick={handleDong}
            aria-label="Về trang danh sách"
          >
            <Icon n="home" className="ic sm" kieu="net" />
          </button>
        </div>

        <div className="m-lp-thanh-cong-than m-tc552-than">
          <div className="m-lp-thanh-cong-vong m-tc552-vong">
            <Icon n="check" className="ic lg m-lp-thanh-cong-tich" kieu="net" />
          </div>

          <h2 className="m-lp-thanh-cong-tieu">{tieuDe}</h2>
          {moTa && <p className="m-lp-thanh-cong-mota">{moTa}</p>}

          {dsTomTat.length > 0 && (
            <div className="m-tc552-the-tom-tat">
              {dsTomTat.map((d, i) => (
                <div key={i} className="m-tc552-dong-tt">
                  <span className="m-tc552-nhan-tt">{d.nhan}</span>
                  <span className={`m-tc552-gt-tt ${d.noiBat ? 'noi-bat' : ''}`}>
                    {d.giaTri}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="m-tc552-nut-hang">
            {(xemUrl || onXemChiTiet) && (
              <button
                type="button"
                className="btn pri m-tc552-btn-chinh"
                onClick={handleXem}
              >
                Xem chi tiết
              </button>
            )}
            {onLapMoi && (
              <button
                type="button"
                className="btn m-tc552-btn-phu"
                onClick={onLapMoi}
              >
                Lập phiếu mới
              </button>
            )}
            {onDong && (
              <button
                type="button"
                className="btn m-tc552-btn-dong"
                onClick={handleDong}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
