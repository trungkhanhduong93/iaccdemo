// Sổ quỹ tiền mặt theo từng quỹ chi nhánh. Thu bán hàng lấy đúng tiền mặt từng ngày trên FABi.
import { useMemo, useState } from 'react'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHI_NHANH, DAILY } from '../../data/mock'
import { dsTkTheoCheDo } from '../tong-hop/so-cai'
import { PageHead } from '../../ui/Page'
import { ReportPaper, ReportToolbar, RptTable } from '../../ui/generic/ReportScreen'
import { between, dmy, k, pad, pick, rng } from '../../ui/format'
import { Select } from '../../ui/Dropdown'
import { LocO } from '../../ui/ThanhLoc'

export function SoQuy({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const [ky, setKy] = useState('9')
  const [cn, setCn] = useState(CHI_NHANH[0].id)
  const thang = Number(ky)
  const noco = kieuGhiSo(s.cheDo) === 'noco'
  const so = useMemo(() => {
    const r = rng('soquy' + cn + thang)
    const mo = k(between(r, 38e6, 52e6))
    let du = mo, pt = 0, pc = 0, tn = 0, tc = 0
    const rows: Row[] = []
    for (const x of DAILY.filter(d => d.cn === cn && d.date.getMonth() + 1 === thang)) {
      const ngay = dmy(x.date)
      du += x.tm; tn += x.tm
      rows.push({ ngay, thu: `PT${pad(thang)}-${pad(++pt, 3)}`, dg: `Thu tiền mặt bán hàng ngày ${ngay.slice(0, 5)}`, tk: dsTkTheoCheDo('5111, 33311', s.cheDo), no: x.tm, du })
      const chi: [string, string, number][] = []
      if (x.date.getDate() % 2 === 0) chi.push(['Nộp tiền bán hàng vào Vietcombank', '1121', k(du - between(r, 12e6, 18e6))])
      if (r() < 0.45) chi.push(pick(r, [['Chi mua rau, củ tại chợ', '152', k(between(r, 0.6e6, 2.4e6))], ['Chi tiền gas', '6421', k(between(r, 1.2e6, 2.8e6))],
        ['Chi tạm ứng nhân viên bếp', '141', 2_000_000], ['Chi sửa máy lạnh', '6422', k(between(r, 0.8e6, 1.6e6))]] as [string, string, number][]))
      for (const [dg, tk, v] of chi) {
        if (v <= 0) continue
        du -= v; tc += v
        rows.push({ ngay, chi: `PC${pad(thang)}-${pad(++pc, 3)}`, dg, tk: dsTkTheoCheDo(tk, s.cheDo), co: v, du })
      }
    }
    return { mo, rows, tn, tc, cuoi: du }
  }, [cn, thang, s.cheDo])

  const cols: Col[] = [
    { k: 'ngay', t: 'Ngày chứng từ', w: 100 }, { k: 'thu', t: 'Số phiếu thu', cls: 'code' }, { k: 'chi', t: 'Số phiếu chi', cls: 'code' }, { k: 'dg', t: 'Diễn giải' },
    ...(noco ? [{ k: 'tk', t: 'TK đối ứng', c: true } as Col] : []),
    { k: 'no', t: 'Thu', num: true }, { k: 'co', t: 'Chi', num: true }, { k: 'du', t: 'Tồn', num: true },
  ]
  const ten = CHI_NHANH.find(c => c.id === cn)!.ngan
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} />
      <section className="report">
        <ReportToolbar ky={ky} setKy={setKy}>
          <LocO nhan="Quỹ"><Select className="inp" value={cn} onChange={e => setCn(e.target.value)}>{CHI_NHANH.map(c => <option key={c.id} value={c.id}>Quỹ tiền mặt {c.ngan}</option>)}</Select></LocO>
        </ReportToolbar>
        <ReportPaper title="Sổ quỹ tiền mặt" sub={`Quỹ tiền mặt ${ten} · Tháng ${thang}/2026`}>
          <RptTable cols={cols} rows={[{ dg: 'Số tồn đầu kỳ', du: so.mo, _b: 1 }, ...so.rows, { dg: 'Cộng phát sinh trong kỳ', no: so.tn, co: so.tc, _t: 1 }, { dg: 'Số tồn cuối kỳ', du: so.cuoi, _t: 1 }]} />
        </ReportPaper>
      </section>
    </div>
  )
}
