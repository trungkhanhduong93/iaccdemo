// Thẻ kho một mặt hàng, một kho (T157). Mở từ mã hàng trên báo cáo xuất nhập tồn: đường dẫn mang ?ma=&kho=&ky= nên thẻ lọc sẵn đúng hàng, kho, kỳ
import { useLayoutEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { KHO } from '../../data/mock'
import { PageHead } from '../../ui/Page'
import { ReportPaper, ReportToolbar, RptTable } from '../../ui/generic/ReportScreen'
import { datKyNhap, useTrangThaiLoc, xemBaoCao } from '../../ui/bao-cao/tuyChinhBC'
import { Select } from '../../ui/Dropdown'
import { LocO } from '../../ui/ThanhLoc'
import { HANG_XNT, theKho } from './data'

export function TheKho({ sc, mod }: ScreenProps) {
  const [q] = useSearchParams()
  const path = useLocation().pathname
  const tt = useTrangThaiLoc(path)
  const [ky, setKy] = useState(() => q.get('ky') ?? tt.daXem.ky ?? '9')
  const [kho, setKho] = useState(() => KHO.find(k => k === q.get('kho')) ?? KHO[1])
  const [ma, setMa] = useState(() => HANG_XNT.find(h => h.ma === q.get('ma'))?.ma ?? HANG_XNT[0].ma)
  // Kỳ trên đường dẫn ghi vào bộ lọc đã xem trước khi thanh lọc chạy, nếu không thanh lọc kéo kỳ về kỳ xem lần trước
  const [san, setSan] = useState(!q.get('ky'))
  useLayoutEffect(() => {
    const k = q.get('ky')
    if (k) { datKyNhap(path, k); xemBaoCao(path); setSan(true) }
  }, [])
  const the = useMemo(() => theKho(Number(ky), kho, ma), [ky, kho, ma])
  const ten = tenMan(sc)
  return (
    <div className="page page-report">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={ten} code={sc.code} />
      <section className="report">
        {san && (
          <ReportToolbar ky={ky} setKy={setKy}>
            <LocO nhan="Kho"><Select className="inp" value={kho} onChange={e => setKho(e.target.value)}>{KHO.map(k => <option key={k}>{k}</option>)}</Select></LocO>
            <LocO nhan="Mặt hàng"><Select className="inp" value={ma} onChange={e => setMa(e.target.value)}>{HANG_XNT.map(h => <option key={h.ma} value={h.ma}>{h.ten}</option>)}</Select></LocO>
          </ReportToolbar>
        )}
        <ReportPaper title={ten} sub={`${the.hang.ma} - ${the.hang.ten} (${the.hang.dvt}) · ${kho} · Tháng ${ky}/2026`}>
          <RptTable cols={the.cols} rows={the.rows} />
        </ReportPaper>
      </section>
    </div>
  )
}
