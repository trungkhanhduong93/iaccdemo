// Chi phí trong tháng theo lý do chi (T230): mở từ thẻ Chi phí hoạt động ở trang chủ gói Free.
// Cộng từ phiếu chi thật (T483): phiếu chi tiền mặt, chi ngân hàng có lý do là chi phí, theo tháng, cửa hàng (chiPhiPhieu.ts),
// mỗi lý do một dòng; bấm dòng mở ngay bên dưới danh sách phiếu chi tiền mặt, ngân hàng của lý do đó, không sang phân hệ Thu chi
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { moneyD, pct } from '../../ui/format'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { chiPhiThangTuPhieu, moTaChiPhi, usePhieuChiPhi } from './chiPhiPhieu'
import { NutLapPhieuQuy } from './LichSuQuy'

export function ChiPhiThang(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { s, toast } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const phieu = usePhieuChiPhi(s)
  const { tong: cpThang, ds } = chiPhiThangTuPhieu(phieu, thang, cn ? [cn.id] : CUA_HANG.map(c => c.id))
  const [mo, setMo] = useState<string | null>(null)   // lý do đang mở danh sách phiếu

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>   {/* phần đầu, thẻ tổng cố định; danh sách cuộn riêng (T263) */}
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>
        <h1>Chi phí hoạt động {thang}/2026</h1>
        <span className="grow" />
        <NutXuatExcel onXuat={() => xuatBangExcel(`Chi phí hoạt động ${thang}/2026`, cn ? cn.ten : 'Tất cả cửa hàng',
          [{ t: 'Lý do chi', rong: 32 }, { t: 'Số phiếu', so: true }, { t: 'Tiền mặt', so: true }, { t: 'Ngân hàng', so: true }, { t: 'Số tiền', so: true }, { t: 'Tỷ lệ chi phí tháng', rong: 18 }],
          ds.map(x => [x.ly, x.so, x.tm, x.nh, x.v, pct(cpThang ? x.v / cpThang : 0)]), ['Tổng chi phí trong tháng', ds.reduce((a, x) => a + x.so, 0), '', '', cpThang, '']).catch(() => toast('Không xuất được file Excel'))} />
        {/* Chọn chi tiền mặt hay chi ngân hàng như Lịch sử quỹ (T447), không mặc định tiền mặt (T483) */}
        <NutLapPhieuQuy chieu="chi" tatCa tienMat className="btn primary"><Icon n="plus" className="ic sm" />Lập phiếu chi</NutLapPhieuQuy>
      </div>
      <div className="cpt-tong">
        <span>Tổng chi phí trong tháng{cn ? ` · ${cn.ten}` : ''}<small className="nvl-phu">Cộng các phiếu chi tiền mặt, ngân hàng có lý do nghiệp vụ là chi phí</small></span>
        <b>{moneyD(cpThang)}</b>
      </div>
      <div className="cpt-cuon"><div className="cpt-ds">
        {ds.map(x => {
          const { icon, phu } = moTaChiPhi(x)
          const dangMo = mo === x.ly
          return (
            <div key={x.ly} className={`cpt-nhom${dangMo ? ' mo' : ''}`}>
              <button type="button" className="cpt-dong" aria-expanded={dangMo} onClick={() => setMo(dangMo ? null : x.ly)} title={dangMo ? 'Thu gọn' : `Xem phiếu chi ${x.ly.toLowerCase()}`}>
                <span className="cpt-ic"><Icon n={icon} /></span>
                <span className="cpt-ten"><b>{x.ly}</b><small>{phu}</small></span>
                <span className="cpt-so"><b>{moneyD(x.v)}</b><small>{pct(cpThang ? x.v / cpThang : 0)} chi phí tháng</small></span>
                <Icon n={dangMo ? 'chevd' : 'chevr'} className="ic sm cpt-mui" />
              </button>
              {dangMo && (
                <div className="cpt-phieu">
                  <table className="tbl">
                    <thead><tr>
                      <th>Ngày</th><th>Số phiếu</th><th>Loại</th>{!cn && <th>Cửa hàng</th>}<th>Đối tượng</th><th>Diễn giải</th><th className="num">Số tiền</th>
                    </tr></thead>
                    <tbody>
                      {x.phieu.map(p => (
                        <tr key={p.id}>
                          <td>{p.ngay}</td><td className="code"><Link className="ds-link-so" to={`/app/tien/2-1-1/${p.id}`} title="Mở chứng từ">{p.so}</Link></td><td>{p.nhom === 'nh' ? 'Chi ngân hàng' : 'Chi tiền mặt'}</td>
                          {!cn && <td>{p.cn}</td>}<td>{p.doiTuong}</td><td>{p.dienGiai}</td><td className="num">{moneyD(p.tien)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr>
                      <td colSpan={cn ? 5 : 6}>Cộng {x.so} phiếu{x.tm && x.nh ? ` · tiền mặt ${moneyD(x.tm)}, ngân hàng ${moneyD(x.nh)}` : ''}</td><td className="num">{moneyD(x.v)}</td>
                    </tr></tfoot>
                  </table>
                </div>
              )}
            </div>
          )
        })}
        {!ds.length && <p className="muted cpt-trong">Tháng {thang}/2026 chưa có phiếu chi nào có lý do là chi phí.</p>}
      </div></div>
    </div>
  )
}
