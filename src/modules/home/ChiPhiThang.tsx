// Chi phí trong tháng theo lý do chi (T230): mở từ thẻ Chi phí hoạt động ở trang chủ gói Free.
// Cộng từ phiếu chi thật (T483): phiếu chi tiền mặt, chi ngân hàng có lý do là chi phí, theo tháng, cửa hàng (chiPhiPhieu.ts),
// mỗi lý do một dòng; bấm dòng mở danh sách Thu chi lọc đúng lý do, tháng nên tổng danh sách bằng số trên dòng.
// Lý do có phiếu ở cả tiền mặt và ngân hàng thì dòng có hai liên kết Tiền mặt, Ngân hàng
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { moneyD, pct } from '../../ui/format'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { chiPhiThangTuPhieu, linkChiPhi, moTaChiPhi, usePhieuChiPhi } from './chiPhiPhieu'

export function ChiPhiThang(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { s, toast } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const phieu = usePhieuChiPhi(s)
  const { tong: cpThang, ds } = chiPhiThangTuPhieu(phieu, thang, cn ? [cn.id] : CUA_HANG.map(c => c.id))

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>   {/* phần đầu, thẻ tổng cố định; danh sách cuộn riêng (T263) */}
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>
        <h1>Chi phí hoạt động {thang}/2026</h1>
        <span className="grow" />
        <NutXuatExcel onXuat={() => xuatBangExcel(`Chi phí hoạt động ${thang}/2026`, cn ? cn.ten : 'Tất cả cửa hàng',
          [{ t: 'Lý do chi', rong: 32 }, { t: 'Số phiếu', so: true }, { t: 'Tiền mặt', so: true }, { t: 'Ngân hàng', so: true }, { t: 'Số tiền', so: true }, { t: 'Tỷ lệ chi phí tháng', rong: 18 }],
          ds.map(x => [x.ly, x.so, x.tm, x.nh, x.v, pct(cpThang ? x.v / cpThang : 0)]), ['Tổng chi phí trong tháng', ds.reduce((a, x) => a + x.so, 0), '', '', cpThang, '']).catch(() => toast('Không xuất được file Excel'))} />
        <Link to="/app/tien/2-1-1/moi?loai=chi" className="btn primary"><Icon n="plus" className="ic sm" />Lập phiếu chi</Link>
      </div>
      <div className="cpt-tong">
        <span>Tổng chi phí trong tháng{cn ? ` · ${cn.ten}` : ''}<small className="nvl-phu">Cộng các phiếu chi tiền mặt, ngân hàng có lý do nghiệp vụ là chi phí</small></span>
        <b>{moneyD(cpThang)}</b>
      </div>
      <div className="cpt-cuon"><div className="cpt-ds">
        {ds.map(x => {
          const { icon, phu } = moTaChiPhi(x)
          const hai = x.tm > 0 && x.nh > 0
          const than = <>
            <span className="cpt-ic"><Icon n={icon} /></span>
            <span className="cpt-ten"><b>{x.ly}</b><small>{phu}</small>
              {hai && <span className="cpt-tach">
                <Link to={linkChiPhi(x.ly, thang, 'tm')}>Tiền mặt {moneyD(x.tm)} ›</Link>
                <Link to={linkChiPhi(x.ly, thang, 'nh')}>Ngân hàng {moneyD(x.nh)} ›</Link>
              </span>}
            </span>
            <span className="cpt-so"><b>{moneyD(x.v)}</b><small>{pct(cpThang ? x.v / cpThang : 0)} chi phí tháng</small></span>
          </>
          return hai
            ? <div key={x.ly} className="cpt-dong cpt-dong-hai">{than}</div>
            : <Link key={x.ly} to={linkChiPhi(x.ly, thang, x.nh > 0 ? 'nh' : 'tm')} className="cpt-dong" title={`Xem phiếu chi ${x.ly.toLowerCase()}`}>
                {than}<Icon n="chevr" className="ic sm cpt-mui" />
              </Link>
        })}
        {!ds.length && <p className="muted cpt-trong">Tháng {thang}/2026 chưa có phiếu chi nào có lý do là chi phí.</p>}
      </div></div>
    </div>
  )
}
