// Báo cáo xuất nhập tồn: đầu kỳ, nhập, xuất, cuối kỳ theo số lượng và giá trị. Bấm mã hàng mở thẻ kho cùng hàng, kho, kỳ (T157)
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { apDung, moDuoc, tenMan, timMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { KHO } from '../../data/mock'
import { PageHead } from '../../ui/Page'
import { ReportPaper, ReportToolbar } from '../../ui/generic/ReportScreen'
import { money } from '../../ui/format'
import { xnt } from './data'
import { Select } from '../../ui/Dropdown'
import { LocO } from '../../ui/ThanhLoc'

export function XuatNhapTon({ sc, mod }: ScreenProps) {
  const [ky, setKy] = useState('9')
  const [kho, setKho] = useState(KHO[1])
  const rows = useMemo(() => xnt(Number(ky), kho), [ky, kho])
  const sum = (k: string) => rows.reduce((a, x) => a + (x as Record<string, any>)[k], 0)
  const n = (v: number) => money(v)
  // Mã hàng thành liên kết khi gói, thông tư đang dùng mở được thẻ kho
  const { s } = useSession()
  const the = timMan('bao-cao', '5-2-1').sc
  const coThe = Boolean(the && moDuoc(the, s.goi) && apDung(the, s.cheDo))
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">IACC Cloud tự tính từ phiếu kho đồng bộ</span>} />
      <section className="report">
        <ReportToolbar ky={ky} setKy={setKy}>
          <LocO nhan="Kho"><Select className="inp" value={kho} onChange={e => setKho(e.target.value)}>{KHO.map(k => <option key={k}>{k}</option>)}</Select></LocO>
        </ReportToolbar>
        <ReportPaper title="Báo cáo xuất nhập tồn" sub={`${kho} · Tháng ${ky}/2026`}>
          <table className="rpt">
            <thead>
              <tr><th rowSpan={2}>Mã</th><th rowSpan={2}>Tên nguyên vật liệu, hàng hoá</th><th rowSpan={2}>ĐVT</th><th colSpan={2}>Đầu kỳ</th><th colSpan={2}>Nhập trong kỳ</th><th colSpan={2}>Xuất trong kỳ</th><th colSpan={2}>Cuối kỳ</th></tr>
              <tr><th>SL</th><th>Giá trị</th><th>SL</th><th>Giá trị</th><th>SL</th><th>Giá trị</th><th>SL</th><th>Giá trị</th></tr>
            </thead>
            <tbody>
              {rows.map(x => (
                <tr key={x.ma}>
                  <td className="code">{coThe ? <Link className="ds-link-so" style={{ fontSize: 'inherit' }} to={`/app/bao-cao/5-2-1?ma=${x.ma}&kho=${encodeURIComponent(kho)}&ky=${ky}`}>{x.ma}</Link> : x.ma}</td><td>{x.ten}</td><td className="c">{x.dvt}</td>
                  <td className="num">{n(x.sl0)}</td><td className="num">{n(x.gt0)}</td><td className="num">{n(x.sln)}</td><td className="num">{n(x.gtn)}</td>
                  <td className="num">{n(x.slx)}</td><td className="num">{n(x.gtx)}</td><td className="num">{n(x.sl1)}</td><td className="num">{n(x.gt1)}</td>
                </tr>
              ))}
              <tr className="t"><td /><td>Tổng cộng</td><td /><td /><td className="num">{n(sum('gt0'))}</td><td /><td className="num">{n(sum('gtn'))}</td><td /><td className="num">{n(sum('gtx'))}</td><td /><td className="num">{n(sum('gt1'))}</td></tr>
            </tbody>
          </table>
        </ReportPaper>
      </section>
    </div>
  )
}
