// Màn tiện ích, chức năng chạy theo lệnh: mô tả, nút chạy, cài đặt, nhật ký lần chạy
import { useState } from 'react'
import type { ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { Icon } from '../Icon'
import { Card, PageHead } from '../Page'
import { Table } from '../Table'

export function ToolScreen({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const ten = tenMan(sc)
  const cfg = sc.tool ?? { mota: `${ten} cho kỳ kế toán đang chọn.`, nut: 'Thực hiện' }
  const [chay, setChay] = useState(false)
  const nk = cfg.nhatKy ?? [
    ['30/09/2026 17:42', `${ten}, kỳ 9/2026`, 'Xong'],
    ['31/08/2026 18:05', `${ten}, kỳ 8/2026`, 'Xong'],
  ]
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={ten} code={sc.code}>
        <button className="btn pri" disabled={chay} onClick={() => { setChay(true); setTimeout(() => { setChay(false); toast(`${cfg.nut}: xong`) }, 1200) }}>
          <Icon n={chay ? 'refresh' : 'play'} className="ic sm" />{chay ? 'Đang chạy…' : cfg.nut}
        </button>
      </PageHead>
      <div className="grid g-21" style={{ alignItems: 'start' }}>
        <div className="stack">
          <Card title="Mô tả"><p style={{ fontSize: 13.5 }}>{cfg.mota}</p></Card>
          <Card title="Lần chạy gần đây" pad={false}>
            <Table cols={[{ k: 'luc', t: 'Thời điểm', w: 150 }, { k: 'nd', t: 'Nội dung' }, { k: 'kq', t: 'Kết quả', r: r => <span className={`stt ${r.kq === 'Xong' ? 'ok' : r.kq.startsWith('Lỗi') ? 'err' : 'warn'}`}>{r.kq}</span> }]}
              rows={nk.map(([luc, nd, kq]) => ({ luc, nd, kq }))} />
          </Card>
        </div>
        <Card title="Cài đặt">
          <div className="stack" style={{ gap: 12 }}>
            {(cfg.caiDat ?? [['Kỳ áp dụng', 'Tháng 9/2026'], ['Chi nhánh', 'Tất cả chi nhánh']]).map(([l, v]) => (
              <div className="f" key={l}><label>{l}</label><input className="inp" defaultValue={v} /></div>
            ))}
            <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Đã lưu cài đặt')}>Lưu cài đặt</button>
          </div>
        </Card>
      </div>
    </div>
  )
}
