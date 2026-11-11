// Trang Xem tất cả thông báo trên web (T803): lọc theo thời gian, loại, thẻ; chọn nhiều để đánh dấu đã đọc, chưa đọc
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Select } from '../../ui/Dropdown'
import { fold } from '../../ui/format'
import { CongTac, D, NoiDung, Sv } from './chung'
import { HopCaiDat } from './ThanhTren'
import { BIEU_TUONG, DS_LOAI, DS_THE, DS_THONG_BAO, useThongBao, type TheTb } from './data'

const DS_CHIP: { id: 'all' | TheTb; ten: string }[] = [{ id: 'all', ten: 'Tất cả' }, ...DS_THE]

export function TatCaThongBao() {
  const tb = useThongBao()
  const [ngay, setNgay] = useState('7')
  const [the, setThe] = useState<'all' | TheTb>('all')
  const [loai, setLoai] = useState('all')
  const [chiMoi, setChiMoi] = useState(false)
  const [q, setQ] = useState('')
  const [chon, setChon] = useState<Record<string, boolean>>({})
  const [moCaiDat, setMoCaiDat] = useState(false)

  const tu = fold(q.trim())
  const trongKy = DS_THONG_BAO.filter(n => n.ago < +ngay)
  const nen = trongKy.filter(n => (loai === 'all' || n.loai === loai) && (!chiMoi || tb.chuaDoc(n)) && (!tu || fold(`${n.tieuDe} ${n.nd}`).includes(tu)))
  const ds = nen.filter(n => the === 'all' || n.the === the)
  const idChon = ds.filter(n => chon[n.id]).map(n => n.id)
  const chonHet = ds.length > 0 && idChon.length === ds.length
  const danhDau = (daDoc: boolean) => { tb.danhDau(idChon, daDoc); setChon({}) }

  return (
    <div className="tb-trang">
      <div className="tb-trang-dau">
        <div className="grow">
          <h1>Thông báo</h1>
          <p>{trongKy.length} thông báo trong {ngay} ngày qua, {trongKy.filter(tb.chuaDoc).length} chưa đọc</p>
        </div>
        <button type="button" className="tb-btn" onClick={tb.docHet}><Sv d={D.docHet} c={16} net={2} />Đánh dấu đọc hết</button>
        <button type="button" className="tb-btn" onClick={() => setMoCaiDat(true)}><Sv d={D.thanhTruot} c={16} />Cài đặt thông báo</button>
      </div>

      <section className="tb-bang">
        <div className="tb-bang-loc">
          <label className="tb-o-tim rong"><Sv d={D.tim} c={16} net={2} />
            <input type="search" placeholder="Tìm số chứng từ, hàng hóa, nhà cung cấp" aria-label="Tìm thông báo" value={q} onChange={e => setQ(e.target.value)} />
          </label>
          <Select aria-label="Thời gian" style={{ width: 150 }} value={ngay} onChange={e => { setNgay(e.target.value); setChon({}) }}
            ds={[{ v: '7', t: '7 ngày qua' }, { v: '14', t: '14 ngày qua' }, { v: '30', t: '30 ngày qua' }]} />
          <Select aria-label="Loại thông báo" style={{ width: 190 }} value={loai} onChange={e => { setLoai(e.target.value); setChon({}) }}
            ds={[{ v: 'all', t: 'Tất cả loại' }, ...DS_LOAI.map(l => ({ v: l.id, t: l.ten }))]} />
        </div>

        <div className="tb-bang-the">
          <div className="tb-chip-ds" role="tablist" aria-label="Thẻ thông báo">
            {DS_CHIP.map(c => (
              <button key={c.id} type="button" role="tab" aria-selected={the === c.id} className={`tb-chip ${c.id}${the === c.id ? ' on' : ''}`}
                onClick={() => { setThe(c.id); setChon({}) }}>
                <i /><span>{c.ten}</span><em>{nen.filter(n => c.id === 'all' || n.the === c.id).length}</em>
              </button>
            ))}
          </div>
          <span className="grow" />
          <CongTac bat={chiMoi} onDoi={() => setChiMoi(v => !v)} nhan="Chỉ hiện chưa đọc" truoc="Chỉ hiện chưa đọc" />
        </div>

        {idChon.length > 0 && (
          <div className="tb-bang-chon">
            <b>Đã chọn {idChon.length}</b>
            <button type="button" onClick={() => danhDau(true)}>Đánh dấu đã đọc</button>
            <button type="button" onClick={() => danhDau(false)}>Đánh dấu chưa đọc</button>
            <span className="grow" />
            <button type="button" className="phu" onClick={() => setChon({})}>Bỏ chọn</button>
          </div>
        )}

        <div className="tb-bang-cuon">
          <div className="tb-bang-luoi" role="table" aria-label="Danh sách thông báo">
            <div className="tb-bang-hang dau" role="row">
              <span className="o-tich" role="columnheader">
                <input type="checkbox" aria-label="Chọn tất cả" checked={chonHet} onChange={() => setChon(chonHet ? {} : Object.fromEntries(ds.map(n => [n.id, true])))} />
              </span>
              <span role="columnheader">Thời gian</span><span role="columnheader">Thẻ</span><span role="columnheader">Loại</span>
              <span role="columnheader">Nội dung</span><span className="phai" role="columnheader">Thao tác</span>
            </div>
            {ds.map(n => {
              const moi = tb.chuaDoc(n), bt = BIEU_TUONG[n.k]
              return (
                <div key={n.id} className={`tb-bang-hang${chon[n.id] ? ' chon' : ''}${moi ? ' moi' : ''}`} role="row">
                  <span className="o-tich" role="cell">
                    <input type="checkbox" aria-label={`Chọn ${n.tieuDe}`} checked={!!chon[n.id]} onChange={() => setChon(c => ({ ...c, [n.id]: !c[n.id] }))} />
                  </span>
                  <span className="o-luc" role="cell"><b>{n.ngay}</b>{n.gio}</span>
                  <span role="cell"><span className={`tb-nhan ${n.the}`}>{DS_THE.find(t => t.id === n.the)?.ten}</span></span>
                  <span className="o-loai" role="cell"><span style={{ color: bt.mau }}><Sv d={bt.d} c={14} net={2} /></span>{DS_LOAI.find(l => l.id === n.loai)?.ten}</span>
                  <button type="button" className="o-nd" role="cell" title={moi ? 'Bấm để đánh dấu đã đọc' : undefined} onClick={() => tb.danhDau([n.id])}>
                    <span className="o-nd-tieu">{moi && <i className="tb-cham" aria-label="Chưa đọc" />}<span>{n.tieuDe}</span></span>
                    <span className="o-nd-chu"><NoiDung nd={n.nd} /></span>
                  </button>
                  <span className="phai" role="cell">
                    {n.viec && n.di && <Link className="tb-dong-viec" to={n.di} onClick={() => tb.danhDau([n.id])}>{n.viec} ›</Link>}
                  </span>
                </div>
              )
            })}
            {!ds.length && <div className="tb-trong lon">Không có thông báo khớp bộ lọc.</div>}
          </div>
        </div>

        <div className="tb-bang-chan">{ds.length ? `Hiện 1–${ds.length} / ${ds.length} thông báo` : 'Không có thông báo'}</div>
      </section>

      {moCaiDat && <HopCaiDat onDong={() => setMoCaiDat(false)} />}
    </div>
  )
}
