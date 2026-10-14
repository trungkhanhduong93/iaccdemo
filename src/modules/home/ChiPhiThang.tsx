// Chi phí trong tháng theo lý do chi (T230): mở từ thẻ Chi phí trong tháng ở trang chủ gói Free.
// Chia chi phí trong tháng theo cơ cấu chi phí, gọi tên theo danh mục Lý do chi, nên cộng lại đúng bằng số trên thẻ:
// Chi trả lương (lương nhân sự), Chi phí thuê nhà (thuê mặt bằng), Chi phí khác (điện nước gas, chi khác, chi phí tài chính)
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { CHI_NHANH, LY_CHI_PHI } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { moneyD, pct } from '../../ui/format'
import { tinhToanTongQuan } from './chiSo'

export function ChiPhiThang(_: ScreenProps) {
  const { s } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = chiNhanhHienTai(s)
  const d = tinhToanTongQuan(thang === 10 ? 'thang-nay' : 'thang-truoc', cn ? [cn.id] : CHI_NHANH.map(c => c.id), s.cheDo, thang)
  const cpThang = d.cpHoatDong - d.cpPhanBo
  const cp = (ten: string) => d.coCauCp.find(x => x.l === ten)?.v ?? 0
  const luong = cp('Lương nhân sự'), matBang = cp('Thuê mặt bằng')
  const ds = [
    { ly: 'Chi trả lương', phu: 'Lương nhân viên bếp, phục vụ, quản lý', v: luong, icon: 'users' },
    { ly: 'Chi phí thuê nhà', phu: 'Thuê mặt bằng các chi nhánh', v: matBang, icon: 'store' },
    { ly: 'Chi phí khác', phu: 'Điện, nước, gas, chi khác, chi phí tài chính', v: cpThang - luong - matBang, icon: 'cashout' },
  ].filter(x => x.v !== 0 && LY_CHI_PHI.includes(x.ly)).sort((a, b) => b.v - a.v)   // chỉ lý do được tích là chi phí (T231)

  return (
    <div className="page">
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>
        <h1>Chi phí trong tháng {thang}/2026</h1>
        <span className="grow" />
        <Link to="/app/tien/2-1-1/moi?loai=chi" className="btn primary"><Icon n="plus" className="ic sm" />Lập phiếu chi</Link>
      </div>
      <div className="cpt-tong">
        <span>Tổng chi phí trong tháng{cn ? ` · ${cn.ten}` : ''}</span>
        <b>{moneyD(cpThang)}</b>
      </div>
      <div className="cpt-ds">
        {ds.map(x => (
          <Link key={x.ly} to="/app/tien/2-1-1" className="cpt-dong" title={`Xem phiếu chi ${x.ly.toLowerCase()}`}>
            <span className="cpt-ic"><Icon n={x.icon} /></span>
            <span className="cpt-ten"><b>{x.ly}</b><small>{x.phu}</small></span>
            <span className="cpt-so"><b>{moneyD(x.v)}</b><small>{pct(cpThang ? x.v / cpThang : 0)} chi phí tháng</small></span>
            <Icon n="chevr" className="ic sm cpt-mui" />
          </Link>
        ))}
      </div>
    </div>
  )
}
