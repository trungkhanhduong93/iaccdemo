// Báo cáo xuất nhập tồn: đầu kỳ, nhập, xuất, cuối kỳ theo số lượng và giá trị. Bấm mã hàng mở thẻ kho cùng hàng, kho, kỳ (T157)
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { apDung, moDuoc, tenMan, timMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { KHO } from '../../data/mock'
import { PageHead } from '../../ui/Page'
import { ReportPaper, ReportToolbar, RptTable } from '../../ui/generic/ReportScreen'
import { xnt } from './data'
import { Select } from '../../ui/Dropdown'
import { LocO } from '../../ui/ThanhLoc'
import { useTrangThaiLoc } from '../../ui/bao-cao/tuyChinhBC'
import { docLocNguon, quaLocDong } from '../bao-cao/loc-nguon'

export function XuatNhapTon({ sc, mod }: ScreenProps) {
  const [ky, setKy] = useState('9')
  const [kho, setKho] = useState(KHO[1])
  // Hàng hoá, nhóm hàng hoá chọn ở nút phễu, lọc sau khi bấm Xem (T207)
  const daLoc = useTrangThaiLoc(useLocation().pathname).loc
  const rows = useMemo(() => { const f = docLocNguon(daLoc); return xnt(Number(ky), kho).filter(x => quaLocDong(f, x)) }, [ky, kho, daLoc])
  const sum = (k: string) => rows.reduce((a, x) => a + (x as Record<string, any>)[k], 0)
  // Mã hàng thành liên kết khi gói, thông tư đang dùng mở được thẻ kho
  const { s } = useSession()
  const the = timMan('bao-cao', '5-2-1').sc
  const coThe = Boolean(the && moDuoc(the, s.goi) && apDung(the, s.cheDo, s))
  // Bấm mã hoặc tên hàng mở thẻ kho của hàng đó (T211)
  const moThe = (ma: string, chu: string) => coThe
    ? <Link className="ds-link-so" style={{ fontSize: 'inherit' }} title="Xem thẻ kho" to={`/app/bao-cao/5-2-1?ma=${ma}&kho=${encodeURIComponent(kho)}&ky=${ky}`}>{chu}</Link>
    : chu
  const cols: Col[] = [
    { k: 'ma', t: 'Mã', cls: 'code', w: 90, r: x => x._t ? '' : moThe(String(x.ma), String(x.ma)) },
    { k: 'ten', t: 'Tên nguyên vật liệu, hàng hoá', r: x => x._t ? String(x.ten) : moThe(String(x.ma), String(x.ten)) },
    { k: 'dvt', t: 'ĐVT', c: true, w: 60 },
    { k: 'sl0', t: 'SL', num: true, nhom: 'Đầu kỳ' }, { k: 'gt0', t: 'Giá trị', num: true, nhom: 'Đầu kỳ' },
    { k: 'sln', t: 'SL', num: true, nhom: 'Nhập trong kỳ' }, { k: 'gtn', t: 'Giá trị', num: true, nhom: 'Nhập trong kỳ' },
    { k: 'slx', t: 'SL', num: true, nhom: 'Xuất trong kỳ' }, { k: 'gtx', t: 'Giá trị', num: true, nhom: 'Xuất trong kỳ' },
    { k: 'sl1', t: 'SL', num: true, nhom: 'Cuối kỳ' }, { k: 'gt1', t: 'Giá trị', num: true, nhom: 'Cuối kỳ' },
  ]
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">IACC Cloud tự tính từ phiếu kho đồng bộ</span>} />
      <section className="report">
        <ReportToolbar ky={ky} setKy={setKy}>
          <LocO nhan="Kho"><Select className="inp" value={kho} onChange={e => setKho(e.target.value)}>{KHO.map(k => <option key={k}>{k}</option>)}</Select></LocO>
        </ReportToolbar>
        <ReportPaper title="Báo cáo xuất nhập tồn" sub={`${kho} · Tháng ${ky}/2026`}>
          {/* Bảng dữ liệu RptTable (tiêu đề 2 tầng theo nhom) để màn chính hiện dạng bảng như các báo cáo khác, không phải tờ in (T308) */}
          <RptTable cols={cols} rows={[...rows as Row[], { ten: 'Tổng cộng', gt0: sum('gt0'), gtn: sum('gtn'), gtx: sum('gtx'), gt1: sum('gt1'), _t: 1 }]} />
        </ReportPaper>
      </section>
    </div>
  )
}
