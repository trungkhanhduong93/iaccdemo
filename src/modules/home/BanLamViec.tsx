// Bàn làm việc của kế toán: luồng POS → vùng đệm → sổ → đối soát, việc cần xử lý, tiến độ khoá sổ
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { useSession } from '../../app/session'
import { coTrongGoi, kieuGhiSo, minGoi } from '../../app/plan'
import { DONG_BO, KY_KHOA_SO, LECH, daysOf } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, PageHead, Pk } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { money } from '../../ui/format'

export function BanLamViec({ sc }: ScreenProps) {
  const { s } = useSession()
  const homNay = daysOf(10, 2026).filter(x => x.date.getDate() === 7)
  const don = homNay.reduce((a, x) => a + x.don, 0)
  const loi = 2
  const lech = LECH.filter(x => x.tt !== 'xong').length
  const noco = kieuGhiSo(s.goi) === 'noco'
  const ten = s.ten.split(' ').slice(-1)[0]

  const viec: { k: string; ic: string; b: string; sub: string; nut: string; to: string; ma?: string }[] = [
    { k: 'err', ic: 'alert', b: `${loi} đơn POS chưa vào sổ`, sub: noco ? 'Nhóm món "Món mới tháng 10" chưa gắn tài khoản doanh thu' : 'Đơn huỷ sau khi chốt ca, chờ xác nhận', nut: noco ? 'Gắn tài khoản' : 'Xem đơn', to: noco ? '/app/danh-muc/1-2' : '/app/ban-hang/3-1-1' },
    { k: 'err', ic: 'scale', b: `${lech} dòng lệch đối soát`, sub: 'FABi với sổ, sổ với hoá đơn, sổ với tiền', nut: 'Xử lý', to: '/app/tien-ich/11-7', ma: '11.7' },
    { k: 'warn', ic: 'filein', b: '18 hoá đơn đầu vào chờ hạch toán, 5 hoá đơn lỗi', sub: 'Tải từ iPOS Invoice lúc 09:12 hôm nay', nut: 'Hạch toán', to: '/app/tien-ich/11-4', ma: '11.4' },
    { k: 'warn', ic: 'wallet', b: 'Công nợ quá hạn: 4 khách, 86.400.000 đ', sub: 'Quá hạn nhiều nhất 47 ngày: Công ty CP Du lịch Biển Xanh', nut: 'Xem công nợ', to: '/app/tien/2-2-5', ma: '2.2.5' },
    { k: 'warn', ic: 'box', b: 'Tồn kho âm 2 mặt hàng', sub: 'Thịt bò thăn, Bánh phở tươi tại Kho bếp Lê Lợi', nut: 'Xem tồn kho', to: '/app/kho/5-2-4', ma: '5.2.4' },
    { k: 'info', ic: 'percent', b: 'Tờ khai thuế GTGT quý 3/2026', sub: 'Hạn nộp 30/10/2026, còn 23 ngày', nut: 'Lập tờ khai', to: '/app/thue/6-2-3', ma: '6.2.3' },
    { k: 'info', ic: 'check', b: '12 chứng từ chờ duyệt cấp 1', sub: 'Phiếu chi, phiếu mua hàng do kế toán viên lập', nut: 'Duyệt', to: '/app/tien-ich/11-5', ma: '11.5' },
  ]
  const co = viec.filter(v => !v.ma || coTrongGoi(v.ma, s.goi))

  const buoc: [string, string, number, string][] = [
    ['done', 'Đồng bộ đủ 30 ngày doanh thu FABi', 1, '/app/tien-ich/11-1'],
    ['done', 'Đối soát doanh thu với sổ', 1, '/app/tien-ich/11-7'],
    ['now', 'Tính giá vốn cuối kỳ', 0, '/app/kho/5-1-7'],
    ['', 'Phân bổ CCDC, chi phí trả trước', 0, '/app/ccdc/8-1-1'],
    ['', 'Kết chuyển lãi lỗ', 0, '/app/tong-hop/10-1-5'],
    ['', 'Khoá sổ', 0, '/app/tong-hop/10-1-6'],
  ]

  return (
    <div className="page">
      <PageHead title={`Bàn làm việc của ${ten}`} meta={<><span className="chip ok">Kỳ 10/2026 đang mở</span><span className="chip warn">Khoá sổ tháng {KY_KHOA_SO.thang}: còn 4 bước</span></>}>
        <Link className="btn" to="/app/tien/2-1-1/moi"><Icon n="plus" className="ic sm" />Phiếu thu, chi</Link>
        <Link className="btn" to="/app/mua-hang/4-1-1/moi"><Icon n="plus" className="ic sm" />Phiếu mua hàng</Link>
        <Link className="btn pri" to="/app/tien-ich/11-1"><Icon n="refresh" className="ic sm" />Tải dữ liệu FABi</Link>
      </PageHead>

      <section className="card" style={{ marginBottom: 14 }}>
        <div className="card-h"><h3>Từ đơn POS tới sổ hôm nay</h3><span className="sub">07/10/2026 · 3 chi nhánh · đồng bộ mỗi 15 phút</span></div>
        <div className="flow">
          {([['pos', 'Đơn POS về', money(don), 'FABi, tới 14:20', ''], ['db', 'Vùng đệm', money(don), 'Chưa đụng vào sổ', ''],
            ['shield', 'Kiểm tra', money(don - loi), `${loi} đơn lỗi`, 'down'], ['book', 'Đã ghi sổ', money(don - loi), '3 chứng từ bán hàng', ''],
            ['scale', 'Đối soát', coTrongGoi('11.7', s.goi) ? `${lech} lệch` : '—', coTrongGoi('11.7', s.goi) ? 'FABi, hoá đơn, tiền' : 'Có từ gói Starter', lech ? 'down' : 'up']] as const).map(([ic, t, v, d, c], i) => (
            <div className="flow-s" key={t}>
              <div className="t"><Icon n={ic} className="ic sm" />{t}</div>
              <div className="v">{v}</div>
              <div className={`d ${c}`} style={c ? undefined : { color: 'var(--muted)' }}>{d}</div>
              {i < 4 && <span className="arr"><Icon n="chevr" className="ic sm" /></span>}
            </div>
          ))}
        </div>
      </section>

      <div className="grid g-21" style={{ alignItems: 'start' }}>
        <div className="stack">
          <Card title="Việc cần xử lý" sub={`${co.length} việc`} pad={false}>
            {viec.map(v => {
              const ok = !v.ma || coTrongGoi(v.ma, s.goi)
              return (
                <div className={`task ${ok ? '' : 'lock'}`} key={v.b}>
                  <span className={`task-ic ${v.k}`}><Icon n={v.ic} /></span>
                  <span className="task-b"><b>{v.b}</b><span>{v.sub}</span></span>
                  {ok ? <Link className="btn sm" to={v.to}>{v.nut}</Link> : <><Icon n="lock" className="ic sm" /><Pk g={minGoi(v.ma!)} o /></>}
                </div>
              )
            })}
          </Card>
          <Card title="Đồng bộ gần đây" act={<Link className="btn sm ghost" to="/app/tien-ich/11-1">Nhật ký đồng bộ</Link>} pad={false}>
            <Table cols={[{ k: 'luc', t: 'Lúc', w: 100 }, { k: 'nguon', t: 'Nguồn' }, { k: 'loai', t: 'Dữ liệu' }, { k: 'lay', t: 'Lấy về', num: true }, { k: 'vao', t: 'Vào sổ', num: true },
              { k: 'loi', t: 'Lỗi', num: true, r: r => r.loi ? <b style={{ color: 'var(--red)' }}>{r.loi}</b> : <span className="muted">0</span> }]} rows={DONG_BO.slice(0, 4)} />
          </Card>
        </div>
        <div className="stack">
          <Card title={`Khoá sổ tháng ${KY_KHOA_SO.thang}/${KY_KHOA_SO.nam}`} sub="2/6 bước">
            {buoc.map(([st, t, , to]) => (
              <Link to={to} className={`check ${st}`} key={t}>
                <span className="box">{st === 'done' && <Icon n="check" className="ic sm" />}</span>
                <b>{t}</b>{st === 'now' && <span className="chip info">Tiếp theo</span>}
              </Link>
            ))}
          </Card>
          <Card title="Lối tắt">
            <div className="grid g2" style={{ gap: 8 }}>
              {[['book', 'Sổ quỹ tiền mặt', '/app/tien/2-2-1'], ['box', 'Xuất nhập tồn', '/app/kho/5-2-3'], ['chart', 'Kết quả kinh doanh', '/app/tong-hop/10-2-3'],
                ['layers', 'Cân đối kế toán', '/app/tong-hop/10-2-2'], ['percent', 'Tờ khai GTGT', '/app/thue/6-2-3'], ['receipt', 'Chứng từ bán hàng', '/app/ban-hang/3-1-1']].map(([ic, t, to]) => (
                <Link key={t} to={to} className="btn" style={{ justifyContent: 'flex-start' }}><Icon n={ic} className="ic sm" />{t}</Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
