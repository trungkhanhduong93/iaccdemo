// Chi phí trong tháng theo lý do chi trên điện thoại (T240): mở từ thẻ Chi phí trong tháng ở trang chủ Free.
// Cùng số liệu với bản web, dạng dòng kiểu app
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG, LY_CHI_PHI } from '../../data/mock'
import { Icon } from '../Icon'
import { moneyD, pct } from '../format'
import { tinhToanTongQuan } from '../../modules/home/chiSo'

export function MChiPhiThang(_: ScreenProps) {
  const { s } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const d = tinhToanTongQuan(thang === 10 ? 'thang-nay' : 'thang-truoc', cn ? [cn.id] : CUA_HANG.map(c => c.id), s.cheDo, thang)
  const cpThang = d.cpHoatDong - d.cpPhanBo
  const cp = (ten: string) => d.coCauCp.find(x => x.l === ten)?.v ?? 0
  const luong = cp('Lương nhân sự')
  const matBang = cp('Thuê mặt bằng')
  const ds = [
    { ly: 'Thanh toán tiền lương', phu: 'Lương nhân viên bếp, phục vụ, quản lý', v: luong, icon: 'users' },
    { ly: 'Chi tiền thuê nhà', phu: 'Thuê mặt bằng các cửa hàng', v: matBang, icon: 'cuahang' },
    { ly: 'Chi phí khác', phu: 'Điện, nước, gas, chi khác, chi phí tài chính', v: cpThang - luong - matBang, icon: 'cashout' },
  ].filter(x => x.v !== 0 && LY_CHI_PHI.includes(x.ly)).sort((a, b) => b.v - a.v)

  return (
    <div className="m-free-cpt">
      <div className="m-free-cpt-tong-the">
        <div className="m-free-cpt-tong-nhan">
          Tổng chi phí trong tháng {thang}/2026{cn ? ` · ${cn.ten}` : ''}
          <small className="m-free-cpt-tong-phu">Các khoản chi tiền có lý do nghiệp vụ là chi phí</small>
        </div>
        <div className="m-free-cpt-tong-so">{moneyD(cpThang)}</div>
      </div>

      <div className="m-free-cpt-ds">
        {ds.map(x => (
          <Link
            key={x.ly}
            to="/app/tien/2-1-1"
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
