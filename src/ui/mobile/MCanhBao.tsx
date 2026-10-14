import { type FC } from 'react'
import { Link, Navigate } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { DS_CANH_BAO } from '../../modules/tien-ich/TienIch'
import { Icon } from '../Icon'

export const MCanhBao: FC<ScreenProps> = () => {
  return (
    <div className="m-cb">
      {/* Banner thông báo */}
      <div className="m-cb-meta">
        <Icon n="mail" className="ic sm" />
        <span>Gửi email cho kế toán trưởng lúc 08:00 hằng ngày</span>
      </div>

      {/* Danh sách thẻ cảnh báo */}
      <div className="m-cb-ds">
        {DS_CANH_BAO.map(([kk, ic, b, s, to]) => (
          <Link key={b} to={to} className="m-cb-the">
            <div className="m-cb-the-trai">
              <span className={`m-cb-cham ${kk}`}>
                <Icon n={ic} className="ic sm" />
              </span>
            </div>
            <div className="m-cb-the-phai">
              <div className="m-cb-the-dau">
                <span className="m-cb-ten">{b}</span>
                <Icon n="chevr" className="ic sm muted" />
              </div>
              <p className="m-cb-mota">{s}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

/** Chuyển thẳng về trang chủ cho 11.16 Dashboard trên điện thoại */
export const MChuyenTrangChu: FC<ScreenProps> = () => {
  return <Navigate to="/app/trang-chu/tong-quan" replace />
}
