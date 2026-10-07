// Đối soát tự động: mặc định chỉ hiện dòng lệch; bấm dòng mở chi tiết, nguyên nhân nghi ngờ, chứng từ gốc, cách xử lý
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CHI_NHANH, LECH, cnTen } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Kpi, Note, PageHead } from '../../ui/Page'
import { St, Table } from '../../ui/Table'
import { moneyD } from '../../ui/format'
import { Select } from '../../ui/Dropdown'

const CAP = ['Tất cả', 'FABi ↔ Sổ', 'Sổ ↔ Hoá đơn', 'Sổ ↔ Tiền']

export function DoiSoat({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const [cap, setCap] = useState('Tất cả')
  const [tatCa, setTatCa] = useState(false)
  const [mo, setMo] = useState<Row | null>(null)
  const [xong, setXong] = useState<string[]>([])
  const ds = LECH.map(l => ({ ...l, tt: xong.includes(l.id) ? 'xong' : l.tt, lech: l.nguonV - l.soV, cnT: cnTen(l.cn) }))
  const list = ds.filter(l => (cap === 'Tất cả' || l.cap === cap) && (tatCa || l.tt !== 'xong'))
  const cols: Col[] = [
    { k: 'ngay', t: 'Ngày', w: 96 }, { k: 'cap', t: 'Cặp đối soát' }, { k: 'cnT', t: 'Chi nhánh', cls: 'dim' },
    { k: 'nguonV', t: 'Theo nguồn', num: true }, { k: 'soV', t: 'Theo sổ', num: true },
    { k: 'lech', t: 'Lệch', num: true, r: r => <b style={{ color: r.lech === 0 ? 'var(--green)' : 'var(--red)' }}>{r.lech > 0 ? '+' : ''}{r.lech.toLocaleString('vi-VN')}</b> },
    { k: 'nghi', t: 'Nguyên nhân nghi ngờ' },
    { k: 'tt', t: 'Trạng thái', r: r => r.tt === 'xong' ? <St k="ok">Đã xử lý</St> : r.tt === 'xem' ? <St k="warn">Đang xem</St> : <St k="err">Chưa xử lý</St> },
  ]
  const conLai = ds.filter(l => l.tt !== 'xong').length
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">Chạy tự động 23:45 hằng ngày</span>}>
        <button className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        <button className="btn pri" onClick={() => toast('Đã đối soát lại 01/09–07/10: 3 dòng lệch')}><Icon n="refresh" className="ic sm" />Đối soát lại</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi icon="pos" l="FABi ↔ Sổ, số ngày khớp" v="110/111" d={<span className="down">1 ngày chi nhánh lệch</span>} />
        <Kpi icon="receipt" l="Sổ ↔ Hoá đơn, số ngày khớp" v="110/111" d={<span className="down">1 ngày chi nhánh lệch</span>} />
        <Kpi icon="bank" l="Sổ ↔ Tiền, số ngày khớp" v="110/111" d={<span className="down">1 ngày chi nhánh lệch</span>} />
        <Kpi icon="scale" l="Ngưỡng chặn ghi sổ" v="500.000" unit="đ" d="Lệch lớn hơn ngưỡng thì chờ kế toán duyệt" />
      </div>
      <section className="card">
        <div className="tabs">
          {CAP.map(c => <button key={c} className={cap === c ? 'on' : ''} onClick={() => setCap(c)}>{c}<span className={`n ${c === 'Tất cả' && conLai ? 'err' : ''}`}>{c === 'Tất cả' ? conLai : ds.filter(l => l.cap === c && l.tt !== 'xong').length}</span></button>)}
        </div>
        <div className="filters">
          <label className="fld"><Icon n="calendar" className="ic sm" />Từ<b>01/09/2026</b>đến<b>07/10/2026</b></label>
          <label className="fld">Chi nhánh<Select><option>Tất cả</option>{CHI_NHANH.map(c => <option key={c.id}>{c.ten}</option>)}</Select></label>
          <span className="grow" />
          <label className="row" style={{ fontSize: 13 }}><input type="checkbox" checked={tatCa} onChange={e => setTatCa(e.target.checked)} /> Hiện cả dòng đã khớp</label>
        </div>
        {list.length ? <Table cols={cols} rows={list} onRow={setMo} rowCls={r => r.tt === 'moi' ? 'bad' : ''} />
          : <div className="empty"><b>Không còn dòng lệch</b>Mọi cặp đối soát đã khớp trong khoảng ngày đang chọn.</div>}
      </section>

      {mo && (
        <>
          <div className="overlay" style={{ padding: 0 }} onClick={() => setMo(null)} />
          <aside className="drawer">
            <div className="drawer-h">
              <div className="grow"><h3 style={{ color: 'var(--ink)', fontSize: 16 }}>{mo.cap} · {mo.ngay}</h3><small className="muted">{mo.cnT}</small></div>
              <button className="icon-btn" onClick={() => setMo(null)}><Icon n="x" /></button>
            </div>
            <div className="drawer-b">
              <div className="grid g3">
                <div><small className="muted">{mo.nguon}</small><div style={{ fontWeight: 700, color: 'var(--ink)' }}>{moneyD(mo.nguonV)}</div></div>
                <div><small className="muted">Trên sổ</small><div style={{ fontWeight: 700, color: 'var(--ink)' }}>{moneyD(mo.soV)}</div></div>
                <div><small className="muted">Lệch</small><div style={{ fontWeight: 700, color: mo.lech ? 'var(--red)' : 'var(--green)' }}>{moneyD(mo.lech)}</div></div>
              </div>
              <Note kind={mo.lech ? 'warn' : 'ok'} icon="sparkle">Nguyên nhân nghi ngờ: {mo.nghi}.</Note>
              <div>
                <div className="panel-g" style={{ padding: '0 0 6px' }}>Chứng từ liên quan</div>
                <Link className="btn sm" to="/app/ban-hang/3-1-1"><Icon n="doc" className="ic sm" />{mo.ct}</Link>
              </div>
              <div className="f"><label>Ghi chú xử lý</label><textarea className="inp" rows={3} placeholder="vd: Đã tải lại ca 2 từ FABi, khớp" /></div>
            </div>
            <div className="drawer-f">
              <button className="btn" onClick={() => toast('Đã tạo bút toán điều chỉnh nháp')}>Tạo bút toán điều chỉnh</button>
              <button className="btn pri" onClick={() => { setXong(x => [...x, mo.id]); setMo(null); toast('Đã đánh dấu đã xử lý') }}>Đánh dấu đã xử lý</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
