// Chi phí trong tháng theo lý do chi trên điện thoại (T240): mở từ thẻ Chi phí trong tháng ở trang chủ Free.
// Cùng số liệu với bản web, dạng dòng kiểu app: cộng từ phiếu chi thật có lý do là chi phí (T483).
// Danh sách thu chi điện thoại không chia tab Tiền mặt, Ngân hàng nên mỗi dòng mở danh sách lọc lý do, tháng là đủ phiếu
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD, pct } from '../format'
import { chiPhiThangTuPhieu, moTaChiPhi, usePhieuChiPhi } from '../../modules/home/chiPhiPhieu'

export function MChiPhiThang(_: ScreenProps) {
  const { s } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const phieu = usePhieuChiPhi(s)
  const { tong: cpThang, ds: dsCp } = chiPhiThangTuPhieu(phieu, thang, cn ? [cn.id] : CUA_HANG.map(c => c.id))
  const thangStr = `2026-${String(thang).padStart(2, '0')}`
  const ds = dsCp.map(x => ({ ...x, ...moTaChiPhi(x) }))

  return (
    <div className="m-free-cpt">
      <div className="m-free-cpt-tong-the">
        <div className="m-free-cpt-tong-nhan">
          Tổng chi phí trong tháng {thang}/2026{cn ? ` · ${cn.ten}` : ''}
          <small className="m-free-cpt-tong-phu">Cộng các phiếu chi tiền mặt, ngân hàng có lý do nghiệp vụ là chi phí</small>
        </div>
        <div className="m-free-cpt-tong-so">{moneyD(cpThang)}</div>
      </div>

      <div className="m-free-cpt-ds">
        {ds.map(x => (
          <Link
            key={x.ly}
            to={`/app/tien/2-1-1?lyDo=${encodeURIComponent(x.ly)}&thang=${encodeURIComponent(thangStr)}`}
            className="m-free-cpt-dong"
            title={`Xem phiếu chi ${x.ly.toLowerCase()}`}
          >
            <div className="m-free-cpt-ic">
              <Icon n={x.icon} className="ic sm" />
            </div>
            <div className="m-free-cpt-info">
              <div className="m-free-cpt-ten">{x.ly}</div>
              <div className="m-free-cpt-phu">{x.phu}</div>
            </div>
            <div className="m-free-cpt-so">
              <div className="m-free-cpt-tien">{moneyD(x.v)}</div>
              <div className="m-free-cpt-phantram">{pct(cpThang ? x.v / cpThang : 0)} chi phí</div>
            </div>
            <Icon n="chevr" className="ic sm m-free-cpt-mui" />
          </Link>
        ))}
        {!ds.length && <p className="m-free-cpt-phu">Tháng {thang}/2026 chưa có phiếu chi nào có lý do là chi phí.</p>}
      </div>

      <div className="m-free-day-nut">
        <Link to="/app/tien/2-1-1/moi?loai=chi" className="m-free-nut-chinh">
          <Icon n="plus" className="ic sm" />
          <span>Lập phiếu chi</span>
        </Link>
      </div>
    </div>
  )
}
