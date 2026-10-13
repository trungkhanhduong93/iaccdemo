import { Link } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'

export function MChiMayTinh(_props?: Partial<ScreenProps>) {
  return (
    <div className="m-chi-may-tinh">
      <p>Màn này chưa có trên điện thoại. Mở trên máy tính để dùng.</p>
      <Link to="/app/nghiep-vu" className="btn acc">
        Về Nghiệp vụ
      </Link>
    </div>
  )
}
