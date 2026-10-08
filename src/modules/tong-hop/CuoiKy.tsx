// Cuối kỳ: kiểm tra số liệu, khoá sổ. Kỳ đã khoá thì không sửa chứng từ, muốn sửa phải mở khoá có ghi lý do.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { coTrongGoi } from '../../app/plan'
import { KY_KHOA_SO } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead } from '../../ui/Page'
import { St, Table } from '../../ui/Table'

const KIEM: [string, string, string, string][] = [
  ['ok', 'Doanh thu FABi khớp sổ', 'Đủ 30/30 ngày, 3 chi nhánh', '/app/tien-ich/11-7'],
  ['ok', 'Hoá đơn bán ra khớp doanh thu', '90 hoá đơn tổng hợp, lệch 0 đ', '/app/thue/6-2-2'],
  ['warn', 'Tồn kho âm', '2 mặt hàng tại Kho bếp Lê Lợi, cần nhập bổ sung phiếu mua ngày 28/09', '/app/kho/5-2-4'],
  ['ok', 'Chứng từ chưa ghi sổ', '0 chứng từ', '/app/tong-hop/10-1-1'],
  ['err', 'Hoá đơn đầu vào chưa hạch toán', '5 hoá đơn tháng 9, tổng 18.420.000 đ', '/app/tien-ich/11-4'],
  ['ok', 'Tài sản bằng nguồn vốn', 'Bảng cân đối kế toán cân', '/app/tong-hop/10-2-2'],
  ['ok', 'Tiền mặt không âm', '3 quỹ tiền mặt, ngày nào cũng dương', '/app/tien/2-2-1'],
]

export function KiemTraCuoiKy({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">Kỳ {KY_KHOA_SO.thang}/{KY_KHOA_SO.nam}</span>}>
        <button className="btn pri" onClick={() => toast('Đã kiểm tra lại 7 mục')}><Icon n="refresh" className="ic sm" />Kiểm tra lại</button>
      </PageHead>
      <Card title="Kết quả kiểm tra" sub="Lúc 07/10/2026 09:30 · 5 đạt, 1 cảnh báo, 1 lỗi" pad={false}>
        {KIEM.map(([k, b, sub, to]) => (
          <div className="task" key={b}>
            <span className={`task-ic ${k}`}><Icon n={k === 'ok' ? 'check' : 'alert'} /></span>
            <span className="task-b"><b>{b}</b><span>{sub}</span></span>
            <St k={k}>{k === 'ok' ? 'Đạt' : k === 'warn' ? 'Cảnh báo' : 'Cần xử lý'}</St>
            <Link className="btn sm" to={to}>Xem</Link>
          </div>
        ))}
      </Card>
    </div>
  )
}

export function KhoaSo({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const [khoa, setKhoa] = useState(false)
  const coKiem = coTrongGoi('10.1.4', s.goi), coKc = coTrongGoi('10.1.5', s.goi)
  const buoc: [string, string, string, boolean][] = [
    ['done', 'Đồng bộ đủ dữ liệu bán hàng tháng 9', '30/30 ngày từ FABi', true],
    ['done', 'Đối soát doanh thu với sổ', 'Khớp 100%', true],
    ['now', 'Tính giá vốn cuối kỳ', 'Chưa chạy bản chính thức', true],
    ['', 'Phân bổ CCDC, chi phí trả trước', '6 khoản phân bổ', true],
    ['', 'Kiểm tra cuối kỳ', coKiem ? '1 lỗi, 1 cảnh báo' : 'Có từ gói Plus', coKiem],
    ['', 'Kết chuyển lãi lỗ', coKc ? 'Kết chuyển 632, 642, 511 sang 911' : 'Có từ gói Plus', coKc],
  ]
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        {khoa ? <button className="btn" onClick={() => { setKhoa(false); toast('Đã mở khoá kỳ 9/2026') }}><Icon n="lock" className="ic sm" />Mở khoá kỳ</button>
          : <button className="btn acc" onClick={() => { setKhoa(true); toast('Đã khoá sổ kỳ 9/2026') }}><Icon n="lock" className="ic sm" />Khoá sổ kỳ 9/2026</button>}
      </PageHead>
      <div className="grid g-21" style={{ alignItems: 'start' }}>
        <Card title={`Các bước khoá sổ tháng ${KY_KHOA_SO.thang}/${KY_KHOA_SO.nam}`}>
          {buoc.map(([st, b, sub, ok]) => (
            <div className={`check ${khoa ? 'done' : st}`} key={b} style={ok ? undefined : { opacity: .55 }}>
              <span className="box">{(khoa || st === 'done') && <Icon n="check" className="ic sm" />}</span>
              <b>{b}</b><small className="muted">{sub}</small>
            </div>
          ))}
        </Card>
        <div className="stack">
          {khoa ? <Note kind="ok" icon="lock">Kỳ 9/2026 đã khoá lúc 07/10/2026. Chứng từ trong kỳ không sửa được. Sai sót phát hiện sau thì lập bút toán điều chỉnh ở kỳ đang mở.</Note>
            : <Note kind="warn" icon="alert">Khoá sổ khi chưa làm đủ các bước thì báo cáo tài chính kỳ 9 có thể sai. Vẫn khoá được, hệ thống ghi lại người khoá và thời điểm.</Note>}
          <Card title="Lịch sử khoá sổ" pad={false}>
            <Table cols={[{ k: 'ky', t: 'Kỳ' }, { k: 'viec', t: 'Thao tác' }, { k: 'ai', t: 'Người làm' }, { k: 'luc', t: 'Lúc' }]} rows={[
              ...(khoa ? [{ ky: '9/2026', viec: 'Khoá sổ', ai: s.ten, luc: '07/10/2026' }] : []),
              { ky: '8/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '05/09/2026' }, { ky: '7/2026', viec: 'Mở khoá, lý do: bổ sung hoá đơn điện', ai: 'Trần Thu Hà', luc: '12/08/2026' },
              { ky: '7/2026', viec: 'Khoá sổ', ai: 'Trần Thu Hà', luc: '06/08/2026' }]} />
          </Card>
        </div>
      </div>
    </div>
  )
}
