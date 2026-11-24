// Thẻ kho một mặt hàng, một kho (T157, T412). Mở từ mã hàng trên báo cáo xuất nhập tồn: đường dẫn mang ?ma=&kho=&ky= nên thẻ lọc sẵn đúng hàng, kho, kỳ
import { useLayoutEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { KHO } from '../../data/mock'
import { PageHead } from '../../ui/Page'
import { ReportPaper, ReportToolbar, RptTable } from '../../ui/generic/ReportScreen'
import { SoChungTu } from '../../ui/generic/SoChungTu'
import { datKyNhap, useTrangThaiLoc, xemBaoCao } from '../../ui/bao-cao/tuyChinhBC'
import { Select } from '../../ui/Dropdown'
import { LocO } from '../../ui/ThanhLoc'
import { HANG_XNT, theKho } from './data'

export function TheKho({ sc, mod }: ScreenProps) {
  const [q] = useSearchParams()
  const path = useLocation().pathname
  const tt = useTrangThaiLoc(path)
  const { s } = useSession()
  const cn = cuaHangHienTai(s)
  // Gói Free mỗi cửa hàng một kho: lọc Kho đi theo cửa hàng đang chọn (T412)
  const dsKho = useMemo(() => cn ? cn.kho : KHO, [cn])

  const [ky, setKy] = useState(() => q.get('ky') ?? tt.daXem.ky ?? '9')
  const [kho, setKho] = useState(() => {
    const qKho = q.get('kho')
    return qKho && KHO.includes(qKho) ? qKho : ''
  })
  const [ma, setMa] = useState(() => HANG_XNT.find(h => h.ma === q.get('ma'))?.ma ?? '')

  // Kỳ trên đường dẫn ghi vào bộ lọc đã xem trước khi thanh lọc chạy, nếu không thanh lọc kéo kỳ về kỳ xem lần trước
  const [san, setSan] = useState(!q.get('ky'))
  useLayoutEffect(() => {
    const k = q.get('ky')
    const kKho = q.get('kho')
    const kMa = q.get('ma')
    if (kKho && KHO.includes(kKho)) setKho(kKho)
    if (kMa && HANG_XNT.some(h => h.ma === kMa)) setMa(kMa)
    if (k) { datKyNhap(path, k); xemBaoCao(path); setKy(k); setSan(true) }
  }, [q, path])

  // Kho và Mặt hàng bắt buộc chọn mới xem được thẻ kho; chưa chọn thì chưa dựng thẻ
  const daChon = Boolean(kho && ma)
  const the = useMemo(() => daChon ? theKho(Number(ky), kho, ma) : null, [ky, kho, ma, daChon])
  const cols = useMemo(() => (the?.cols ?? []).map(c => {
    if (c.k === 'soNhap' || c.k === 'soXuat') {
      return { ...c, r: (x: Row) => x?.[c.k] ? <SoChungTu so={x[c.k]} /> : null }
    }
    return c
  }), [the])
  const ten = tenMan(sc)
  const oKho = (
    <Select className="inp" value={kho} onChange={e => setKho(e.target.value)}>
      <option value="">Chọn kho</option>
      {dsKho.map(k => <option key={k}>{k}</option>)}
    </Select>
  )
  const oMa = (
    <Select className="inp" value={ma} onChange={e => setMa(e.target.value)}>
      <option value="">Chọn mặt hàng</option>
      {HANG_XNT.map(h => <option key={h.ma} value={h.ma}>{h.ten}</option>)}
    </Select>
  )
  return (
    <div className="page page-report">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={ten} code={sc.code} />
      <section className="report">
        {san && (
          <ReportToolbar ky={ky} setKy={setKy} oBatBuoc={[
            { k: 'kho', ten: 'Kho', o: oKho, coGiaTri: Boolean(kho) },
            { k: 'matHang', ten: 'Mặt hàng', o: oMa, coGiaTri: Boolean(ma) },
          ]}>
            <LocO nhan="Kho">{oKho}</LocO>
            <LocO nhan="Mặt hàng">{oMa}</LocO>
          </ReportToolbar>
        )}
        {the ? (
          <ReportPaper title={ten} sub={`${the.hang.ma} - ${the.hang.ten} (${the.hang.dvt}) · ${kho} · Tháng ${ky}/2026`}>
            <RptTable cols={cols} rows={the.rows} />
          </ReportPaper>
        ) : (
          <div className="bc-xem bc-cho-loc"><span>Chọn Kho và Mặt hàng để xem thẻ kho</span></div>
        )}
      </section>
    </div>
  )
}
