import type { FC } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { Icon } from '../Icon'

// Số dư ban đầu trên điện thoại: hai mục như menu Nghiệp vụ, bấm vào mở đúng màn khai báo.
// Dư quỹ tiền mở Danh mục Quỹ tiền (QD61, khai số dư ngay ở danh mục), Tồn kho ban đầu mở màn Kho 5.1.12
// (khai tồn từng kho của cửa hàng đang chọn).
const MUC: { ten: string; to: string; icon: string }[] = [
  { ten: 'Tồn kho ban đầu', to: '/app/kho/5-1-12', icon: 'box' },
  { ten: 'Dư quỹ tiền', to: '/app/danh-muc/1-12', icon: 'wallet' },
]

export const MSoDuBanDau: FC<ScreenProps> = () => (
  <div className="m-sdb-khung">
    <div className="m-t498-nv-nhom">
      <div className="m-t498-nv-card">
        {MUC.map((m, i) => (
          <div key={m.to} className="m-t498-nv-item-wrap">
            <Link to={m.to} className="m-t498-nv-item">
              <div className="m-t498-nv-item-ic">
                <Icon n={m.icon} kieu="khoi" className="ic" />
              </div>
              <span className="m-t498-nv-item-ten">{m.ten}</span>
              <Icon n="chevr" className="ic sm m-t498-nv-mui" />
            </Link>
            {i < MUC.length - 1 && <div className="m-t498-nv-divider" />}
          </div>
        ))}
      </div>
    </div>
  </div>
)
