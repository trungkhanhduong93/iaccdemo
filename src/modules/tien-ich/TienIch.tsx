// Tiện ích có màn riêng: đồng bộ dữ liệu, hoá đơn đầu vào, duyệt chứng từ, cảnh báo, nhật ký thao tác
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Col, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { DONG_BO, NCC } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Kpi, Note, PageHead } from '../../ui/Page'
import { St, Table } from '../../ui/Table'
import { between, k, pad, pick, rng } from '../../ui/format'
import { Select } from '../../ui/Dropdown'

export function DongBo({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const [tu, setTu] = useState(true)
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip ok"><span className="pulse" />Đang chạy theo lịch</span>}>
        <button className="btn pri" onClick={() => toast('Đã tải 188 đơn mới từ FABi')}><Icon n="refresh" className="ic sm" />Tải ngay</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi icon="pos" l="Đơn POS hôm nay" v="1.894" d="3 chi nhánh, tới 14:20" />
        <Kpi icon="check" l="Đã vào sổ" v="1.892" d="99,9%" />
        <Kpi icon="alert" l="Lỗi chờ xử lý" v="2" d={<Link to="/app/trang-chu/ban-lam-viec">Xem trên Bàn làm việc</Link>} />
        <Kpi icon="clock" l="Lần chạy sau" v="14:35" d="Mỗi 15 phút" />
      </div>
      <div className="grid g-21" style={{ alignItems: 'start' }}>
        <Card title="Nhật ký đồng bộ" sub="Chạy lại không nhân đôi dữ liệu" pad={false}>
          <Table cols={[{ k: 'luc', t: 'Lúc', w: 100 }, { k: 'nguon', t: 'Nguồn' }, { k: 'loai', t: 'Dữ liệu' }, { k: 'pham', t: 'Phạm vi', cls: 'dim' }, { k: 'lay', t: 'Lấy về', num: true }, { k: 'vao', t: 'Vào sổ', num: true },
            { k: 'loi', t: 'Lỗi', num: true, r: r => r.loi ? <b style={{ color: 'var(--red)' }}>{r.loi}</b> : <span className="muted">0</span> }, { k: 'ai', t: 'Chạy bởi', cls: 'dim' }]} rows={DONG_BO} />
        </Card>
        <Card title="Cài đặt đồng bộ">
          <div className="stack" style={{ gap: 12 }}>
            <div className="seg"><button className={tu ? 'on' : ''} onClick={() => setTu(true)}>Tự động theo lịch</button><button className={!tu ? 'on' : ''} onClick={() => setTu(false)}>Bấm tải khi cần</button></div>
            {tu ? <>
              <div className="f"><label>Đơn bán FABi</label><Select className="inp"><option>Mỗi 15 phút</option><option>Theo ca</option><option>Cuối ngày 23:30</option></Select></div>
              <div className="f"><label>Phiếu kho iPOS Inventory</label><Select className="inp"><option>Mỗi giờ</option><option>Cuối ngày</option></Select></div>
            </> : <div className="f"><label>Khoảng ngày</label><input className="inp" defaultValue="01/10/2026 – 07/10/2026" /></div>}
            <div className="f"><label>Gom chứng từ bán hàng</label><Select className="inp"><option>Mỗi chi nhánh một chứng từ mỗi ngày</option><option>Mỗi ca một chứng từ</option></Select></div>
            <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Đã lưu cài đặt đồng bộ')}>Lưu cài đặt</button>
          </div>
        </Card>
      </div>
    </div>
  )
}

const TT_HD: Record<string, [string, string]> = { ok: ['ok', 'Hợp lệ, chờ hạch toán'], ht: ['dim', 'Đã hạch toán'], huy: ['err', 'Người bán đã huỷ'], mst: ['err', 'Sai mã số thuế người mua'], trung: ['warn', 'Trùng hoá đơn đã nhận'] }

export function HoaDonDauVao({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const r = rng('hddv')
  const rows = Array.from({ length: 23 }, (_, i) => {
    const n = pick(r, NCC), tien = k(between(r, 0.8e6, 36e6)), d = 7 - Math.floor(i / 4)
    const tt = i === 2 ? 'huy' : i === 6 ? 'mst' : i === 9 || i === 15 ? 'trung' : i === 12 ? 'huy' : i < 18 ? 'ok' : 'ht'
    return { id: i, so: `C26T${n.ma.slice(-2)}${pad(1200 + i * 7, 6)}`, ngay: `${pad(Math.max(1, d))}/10/2026`, ban: n.ten, mst: n.mst, tien, thue: Math.round(tien * 0.08), tt }
  })
  const cols: Col[] = [{ k: 'chk', t: '', w: 34, r: () => <input type="checkbox" /> }, { k: 'so', t: 'Số hoá đơn', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'ban', t: 'Người bán' }, { k: 'mst', t: 'MST người bán', cls: 'dim' },
    { k: 'tien', t: 'Tiền hàng', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tt', t: 'Kiểm tra', r: x => <St k={TT_HD[x.tt][0]}>{TT_HD[x.tt][1]}</St> }]
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">Lưu trữ 10 năm</span>}>
        <button className="btn" onClick={() => toast('Đã tải 23 hoá đơn từ iPOS Invoice')}><Icon n="refresh" className="ic sm" />Tải từ iPOS Invoice</button>
        <button className="btn pri" onClick={() => toast('Đã hạch toán 13 hoá đơn hợp lệ')}><Icon n="check" className="ic sm" />Hạch toán hoá đơn hợp lệ</button>
      </PageHead>
      <Note icon="filein">Hoá đơn tải về được kiểm tra trạng thái trên hệ thống thuế, mã số thuế người mua, trùng lặp. Sau đó khớp với phiếu mua hàng nếu có.</Note>
      <section className="card" style={{ marginTop: 14 }}><Table cols={cols} rows={rows} rowCls={x => ['huy', 'mst'].includes(x.tt) ? 'bad' : ''} /></section>
    </div>
  )
}

export function DuyetChungTu({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const [cap, setCap] = useState(1)
  const r = rng('duyet' + cap)
  const rows = Array.from({ length: cap === 1 ? 12 : 5 }, (_, i) => ({
    so: `${pick(r, ['PC', 'MH', 'NVK'])}2610-${pad(120 + i * 3, 4)}`, ngay: `${pad(7 - (i % 6))}/10/2026`, loai: pick(r, ['Phiếu chi', 'Phiếu mua hàng', 'Chứng từ tổng hợp']),
    nguoi: pick(r, ['Lê Quốc Bảo', 'Phạm Ngọc Lan']), tien: k(between(r, 1.2e6, 64e6)),
  }))
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        <button className="btn">Trả lại</button>
        <button className="btn pri" onClick={() => toast(`Đã duyệt ${rows.length} chứng từ cấp ${cap}`)}><Icon n="check" className="ic sm" />Duyệt hàng loạt</button>
      </PageHead>
      <section className="card">
        <div className="tabs">
          <button className={cap === 1 ? 'on' : ''} onClick={() => setCap(1)}>Cấp 1: duyệt vào sổ<span className="n">12</span></button>
          <button className={cap === 2 ? 'on' : ''} onClick={() => setCap(2)}>Cấp 2: duyệt khoá chứng từ<span className="n">5</span></button>
        </div>
        <Table cols={[{ k: 'chk', t: '', w: 34, r: () => <input type="checkbox" defaultChecked /> }, { k: 'so', t: 'Số chứng từ', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'loai', t: 'Loại' },
          { k: 'nguoi', t: 'Người lập' }, { k: 'tien', t: 'Số tiền', num: true }]} rows={rows} />
      </section>
    </div>
  )
}

export function CanhBao({ sc, mod }: ScreenProps) {
  const ds: [string, string, string, string, string][] = [
    ['err', 'alert', 'Công nợ quá hạn 30 ngày', '4 khách công ty, tổng 86.400.000 đ. Lâu nhất 47 ngày: Công ty CP Du lịch Biển Xanh.', '/app/tien/2-2-5'],
    ['err', 'receipt', 'Hoá đơn đầu vào bị người bán huỷ', '2 hoá đơn đã nhận, 1 hoá đơn đã hạch toán cần điều chỉnh.', '/app/tien-ich/11-4'],
    ['warn', 'box', 'Tồn kho âm', 'Thịt bò thăn −2,4 kg, Bánh phở tươi −6 kg tại Kho bếp Lê Lợi.', '/app/kho/5-2-4'],
    ['warn', 'scale', 'Doanh thu lệch hoá đơn', 'Ngày 03/10 chi nhánh Lê Lợi lệch 85.000 đ.', '/app/tien-ich/11-7'],
    ['warn', 'flask', 'Giá vốn vượt định mức', 'Phở bò tái tháng 9: giá vốn 41% doanh thu, định mức 36%.', '/app/kho/5-2-6'],
    ['info', 'percent', 'Sắp đến hạn nộp tờ khai GTGT quý 3', 'Hạn 30/10/2026.', '/app/thue/6-2-3'],
  ]
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">Gửi email cho kế toán trưởng lúc 08:00 hằng ngày</span>} />
      <Card title="Cảnh báo đang mở" sub={`${ds.length} cảnh báo`} pad={false}>
        {ds.map(([kk, ic, b, s, to]) => (
          <div className="task" key={b}>
            <span className={`task-ic ${kk}`}><Icon n={ic} /></span>
            <span className="task-b"><b>{b}</b><span>{s}</span></span>
            <Link className="btn sm" to={to}>Xem</Link>
          </div>
        ))}
      </Card>
    </div>
  )
}

export function NhatKyThaoTac({ sc, mod }: ScreenProps) {
  const r = rng('nhatky')
  const viec = ['Sửa phiếu chi PC2610-0241', 'Ghi sổ 3 chứng từ bán hàng', 'Xoá phiếu nháp MH2610-0118', 'Khoá sổ kỳ 8/2026', 'Đổi tài khoản doanh thu nhóm Đồ uống', 'Đăng nhập', 'Xuất Excel sổ quỹ tiền mặt', 'Duyệt cấp 1 phiếu chi PC2610-0236']
  const rows = Array.from({ length: 22 }, (_, i) => ({ luc: `${pad(7 - Math.floor(i / 5))}/10/2026 ${pad(16 - (i % 9))}:${pad(Math.floor(r() * 59))}`, ai: pick(r, ['Trần Thu Hà', 'Lê Quốc Bảo', 'Phạm Ngọc Lan']), viec: pick(r, viec), ip: `113.161.${Math.floor(r() * 200)}.${Math.floor(r() * 250)}` }))
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">Nhật ký không sửa, không xoá được</span>} />
      <section className="card">
        <Table cols={[{ k: 'luc', t: 'Thời điểm', w: 150 }, { k: 'ai', t: 'Người làm' }, { k: 'viec', t: 'Thao tác' }, { k: 'ip', t: 'Địa chỉ IP', cls: 'dim' }]} rows={rows} />
      </section>
    </div>
  )
}
