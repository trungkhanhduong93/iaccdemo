// Chi phí trong tháng theo lý do chi (T230): mở từ thẻ Chi phí trong tháng ở trang chủ gói Free.
// Chia chi phí trong tháng theo cơ cấu chi phí, gọi tên theo danh mục Lý do chi, nên cộng lại đúng bằng số trên thẻ:
// Thanh toán tiền lương (lương nhân sự), Chi tiền thuê nhà (thuê mặt bằng), Chi phí khác (điện nước gas, chi khác, chi phí tài chính)
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG, LY_CHI_PHI } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { moneyD, pct } from '../../ui/format'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { tinhToanTongQuan } from './chiSo'

export function ChiPhiThang(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { s, toast } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const d = tinhToanTongQuan(thang === 10 ? 'thang-nay' : 'thang-truoc', cn ? [cn.id] : CUA_HANG.map(c => c.id), s.cheDo, thang)
  const cpThang = d.cpHoatDong - d.cpPhanBo
  const cp = (ten: string) => d.coCauCp.find(x => x.l === ten)?.v ?? 0
  const luong = cp('Lương nhân sự'), matBang = cp('Thuê mặt bằng')
  const ds = [
    { ly: 'Thanh toán tiền lương', phu: 'Lương nhân viên bếp, phục vụ, quản lý', v: luong, icon: 'users' },
    { ly: 'Chi tiền thuê nhà', phu: 'Thuê mặt bằng các cửa hàng', v: matBang, icon: 'store' },
    { ly: 'Chi phí khác', phu: 'Điện, nước, gas, chi khác, chi phí tài chính', v: cpThang - luong - matBang, icon: 'cashout' },
  ].filter(x => x.v !== 0 && LY_CHI_PHI.includes(x.ly)).sort((a, b) => b.v - a.v)   // chỉ lý do được tích là chi phí (T231)

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>   {/* phần đầu, thẻ tổng cố định; danh sách cuộn riêng (T263) */}
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>
        <h1>Chi phí trong tháng {thang}/2026</h1>
        <span className="grow" />
        <NutXuatExcel onXuat={() => xuatBangExcel(`Chi phí trong tháng ${thang}/2026`, cn ? cn.ten : 'Tất cả cửa hàng',
          [{ t: 'Lý do chi', rong: 24 }, { t: 'Nội dung', rong: 44 }, { t: 'Số tiền', so: true }, { t: 'Tỷ lệ chi phí tháng', rong: 18 }],
          ds.map(x => [x.ly, x.phu, x.v, pct(cpThang ? x.v / cpThang : 0)]), ['Tổng chi phí trong tháng', '', cpThang, '']).catch(() => toast('Không xuất được file Excel'))} />
        <Link to="/app/tien/2-1-1/moi?loai=chi" className="btn primary"><Icon n="plus" className="ic sm" />Lập phiếu chi</Link>
      </div>
      <div className="cpt-tong">
        <span>Tổng chi phí trong tháng{cn ? ` · ${cn.ten}` : ''}<small className="nvl-phu">Các khoản chi tiền có lý do nghiệp vụ là chi phí</small></span>
        <b>{moneyD(cpThang)}</b>
      </div>
      <div className="cpt-cuon"><div className="cpt-ds">
        {ds.map(x => (
          <Link key={x.ly} to="/app/tien/2-1-1" className="cpt-dong" title={`Xem phiếu chi ${x.ly.toLowerCase()}`}>
            <span className="cpt-ic"><Icon n={x.icon} /></span>
            <span className="cpt-ten"><b>{x.ly}</b><small>{x.phu}</small></span>
            <span className="cpt-so"><b>{moneyD(x.v)}</b><small>{pct(cpThang ? x.v / cpThang : 0)} chi phí tháng</small></span>
            <Icon n="chevr" className="ic sm cpt-mui" />
          </Link>
        ))}
      </div></div>
    </div>
  )
}
