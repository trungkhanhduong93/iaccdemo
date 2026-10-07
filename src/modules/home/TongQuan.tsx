// Tổng quan cho chủ doanh nghiệp: doanh thu, lãi gộp, lợi nhuận, tiền, biểu đồ, cảnh báo
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { useSession } from '../../app/session'
import { coTrongGoi, minGoi } from '../../app/plan'
import { CHI_NHANH, DAILY, HOM_NAY, chiPhiThang, kqkd, tongKy } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Kpi, PageHead, Pk } from '../../ui/Page'
import { Bars, Donut, HBars, Spark } from '../../ui/Charts'
import { dm, money, pct, short } from '../../ui/format'
import { du, soCai } from '../tong-hop/so-cai'
import { Select } from '../../ui/Dropdown'

/** Cộng dồn từ ngày a tới ngày b (tính cả hai đầu) */
function cong(a: Date, b: Date) {
  const ds = DAILY.filter(x => x.date >= a && x.date <= b)
  return { dt: ds.reduce((s, x) => s + x.dt, 0), gv: ds.reduce((s, x) => s + x.gv, 0), don: ds.reduce((s, x) => s + x.don, 0) }
}

export function TongQuan({ sc }: ScreenProps) {
  const { s } = useSession()
  const [ky, setKy] = useState<'10' | '9'>('10')
  const thang = Number(ky)
  const t = tongKy(thang, 2026)
  const kq = kqkd(thang, 2026)
  const nay = thang === 10 ? cong(new Date(2026, 9, 1), HOM_NAY) : t
  const truoc = thang === 10 ? cong(new Date(2026, 8, 1), new Date(2026, 8, 7)) : tongKy(8, 2026)
  const tang = (a: number, b: number) => { const d = (a - b) / b; return <span className={d >= 0 ? 'up' : 'down'}>{d >= 0 ? '▲' : '▼'} {pct(Math.abs(d))}</span> }
  const den = thang === 10 ? HOM_NAY : new Date(2026, 8, 30)
  const ngay30 = DAILY.filter(x => x.date > new Date(den.getFullYear(), den.getMonth(), den.getDate() - 30) && x.date <= den)
  const theoNgay = [...new Set(ngay30.map(x => +x.date))].map(d => {
    const ds = ngay30.filter(x => +x.date === d)
    return { l: dm(new Date(d)), v: ds.reduce((a, x) => a + x.dt, 0), v2: ds.reduce((a, x) => a + x.gv, 0) }
  })
  const cn = CHI_NHANH.map(c => ({ l: c.ngan, v: tongKy(thang, 2026, c.id).dt }))
  const cp = chiPhiThang(thang, 2026)
  const canhBao = coTrongGoi('11.6', s.goi)
  const dongTien = coTrongGoi('10.2.4', s.goi)
  const sc0 = soCai(thang).cuoi, tm = du(sc0, '1111'), nh = du(sc0, '1121')
  const kyLabel = thang === 10 ? 'Tháng 10/2026, đến 07/10' : 'Tháng 9/2026'
  const soSanh = thang === 10 ? 'so với 01–07/09' : 'so với tháng 8'

  return (
    <div className="page">
      <PageHead title="Tổng quan" code={sc.code} meta={<span className="chip">Cập nhật 14:20 từ FABi</span>}>
        <div className="seg">
          <button className={ky === '10' ? 'on' : ''} onClick={() => setKy('10')}>Tháng này</button>
          <button className={ky === '9' ? 'on' : ''} onClick={() => setKy('9')}>Tháng 9</button>
        </div>
        <Select className="sel-mini" style={{ height: 34 }}><option>Tất cả chi nhánh</option>{CHI_NHANH.map(c => <option key={c.id}>{c.ten}</option>)}</Select>
      </PageHead>

      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi icon="receipt" l="Doanh thu chưa thuế" v={short(nay.dt)} d={<>{tang(nay.dt, truoc.dt)} {soSanh}</>} />
        <Kpi icon="pulse" l="Lãi gộp" v={short(nay.dt - nay.gv)} d={<>Biên {pct((nay.dt - nay.gv) / nay.dt)} · giá vốn {pct(nay.gv / nay.dt)}</>} />
        <Kpi icon="chart" l="Lợi nhuận trước thuế" v={short(kq.lnTruocThue)} d={<>Biên {pct(kq.lnTruocThue / kq.dtThuan)} · theo báo cáo KQKD</>} />
        <Kpi icon="wallet" l={`Tiền mặt và tiền gửi · ${thang === 10 ? 'hôm nay' : 'cuối tháng 9'}`} v={short(tm + nh)} d={<>Tiền mặt {short(tm)} · ngân hàng {short(nh)}</>} />
      </div>

      <div className="grid g-21" style={{ marginBottom: 14 }}>
        <Card title="Doanh thu 30 ngày" sub="Cột xanh: doanh thu chưa thuế · cột cam: giá vốn"
          act={<Link className="btn sm ghost" to="/app/ban-hang/3-2-3">Báo cáo doanh thu</Link>}>
          <Bars data={theoNgay} h={230} />
        </Card>
        <Card title="Doanh thu theo chi nhánh" sub={kyLabel}>
          <HBars data={cn} />
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line-2)' }} className="row">
            <span className="muted">Số đơn</span><span className="grow" /><b style={{ color: 'var(--ink)' }}>{money(nay.don)}</b>
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <span className="muted">Giá trị trung bình một đơn</span><span className="grow" /><b style={{ color: 'var(--ink)' }}>{money(nay.dt / nay.don)} đ</b>
          </div>
        </Card>
      </div>

      <div className="grid g3">
        <Card title="Cơ cấu thanh toán" sub={kyLabel}>
          <div className="row" style={{ gap: 18 }}>
            <Donut parts={[{ l: 'Tiền mặt', v: t.tm, c: '#0b2c6b' }, { l: 'Chuyển khoản, QR', v: t.ck, c: '#1b6fe0' }, { l: 'Thẻ', v: t.the, c: '#0f8f84' }, { l: 'App giao đồ ăn', v: t.app, c: '#f5871f' }]} />
            <div className="stack" style={{ gap: 7, fontSize: 12.5 }}>
              {[['Tiền mặt', t.tm, '#0b2c6b'], ['Chuyển khoản, QR', t.ck, '#1b6fe0'], ['Thẻ', t.the, '#0f8f84'], ['App giao đồ ăn', t.app, '#f5871f']].map(([l, v, c]) => (
                <div key={l as string} className="legend" style={{ display: 'block' }}><i style={{ background: c as string }} />{l} <b style={{ color: 'var(--ink)' }}>{pct((v as number) / (t.tm + t.ck + t.the + t.app), 0)}</b></div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Chi phí hoạt động" sub={kyLabel}>
          <HBars color="#6b4bd0" data={[{ l: 'Lương', v: cp.luong }, { l: 'Mặt bằng', v: cp.matBang }, { l: 'Điện, nước, gas', v: cp.dienNuoc }, { l: 'Khấu hao TSCĐ', v: cp.khauHao }, { l: 'Phân bổ CCDC', v: cp.ccdc }, { l: 'Khác', v: cp.khac }]} />
        </Card>
        {canhBao ? (
          <Card title="Cảnh báo" act={<Link className="btn sm ghost" to="/app/tien-ich/11-6">Xem hết</Link>} pad={false}>
            {[['err', 'alert', 'Công nợ quá hạn 30 ngày', '4 khách công ty · 86,4 tr', '/app/tien/2-2-5'],
              ['warn', 'box', 'Tồn kho âm', '2 mặt hàng tại Kho bếp Lê Lợi', '/app/kho/5-2-4'],
              ['warn', 'receipt', 'Hoá đơn đầu vào bị huỷ', '1 hoá đơn của An Phú, 4,2 tr', '/app/tien-ich/11-4'],
              ['info', 'scale', 'Doanh thu lệch hoá đơn', '3 dòng, chờ kế toán xử lý', '/app/tien-ich/11-7']].map(([k, ic, b, sub, to]) => (
              <Link key={b} to={to} className="task" style={{ padding: '10px 16px' }}>
                <span className={`task-ic ${k}`} style={{ width: 30, height: 30 }}><Icon n={ic} className="ic sm" /></span>
                <span className="task-b"><b>{b}</b><span>{sub}</span></span><Icon n="chevr" className="ic sm" />
              </Link>
            ))}
          </Card>
        ) : (
          <Card title="Cảnh báo">
            <div className="empty" style={{ padding: 18 }}><Icon n="lock" className="ic lg" /><b style={{ marginTop: 8 }}>Cảnh báo số liệu có ở gói Medium</b>
              Công nợ quá hạn, tồn kho âm, hoá đơn bị huỷ, doanh thu lệch hoá đơn. <Pk g={minGoi('11.6')} o /></div>
          </Card>
        )}
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <Card title="Dòng tiền 7 ngày gần nhất" sub="Thu từ bán hàng, chi mua hàng và chi phí">
          {dongTien ? (
            <div className="stack" style={{ gap: 6 }}>
              {[['Thu', 612_400_000, 'var(--green)'], ['Chi', 438_150_000, 'var(--red)']].map(([l, v, c]) => (
                <div key={l as string} className="row"><b style={{ width: 40, color: c as string }}>{l}</b><Spark values={[3, 5, 4, 6, 5, 7, 6].map((x, i) => x + (l === 'Chi' ? (i % 3) : 0))} w={260} color={c as string} /><span className="grow" /><b className="num" style={{ color: 'var(--ink)' }}>{money(v as number)} đ</b></div>
              ))}
              <div className="row" style={{ borderTop: '1px solid var(--line-2)', paddingTop: 8 }}><span className="muted">Dòng tiền thuần</span><span className="grow" /><b className="up">+{money(174_250_000)} đ</b></div>
            </div>
          ) : <div className="muted" style={{ fontSize: 13 }}><Icon n="lock" className="ic sm" /> Báo cáo lưu chuyển tiền tệ có ở gói Medium. <Pk g={minGoi('10.2.4')} o /></div>}
        </Card>
        <Card title="Món bán chạy" sub={kyLabel}>
          <HBars color="#f5871f" fmt={n => money(n) + ' phần'} data={[{ l: 'Phở bò tái', v: Math.round(nay.don * 0.42) }, { l: 'Cà phê sữa đá', v: Math.round(nay.don * 0.38) },
            { l: 'Cơm tấm sườn bì chả', v: Math.round(nay.don * 0.27) }, { l: 'Trà đào cam sả', v: Math.round(nay.don * 0.22) }, { l: 'Bún chả Hà Nội', v: Math.round(nay.don * 0.18) }]} />
        </Card>
      </div>
    </div>
  )
}
