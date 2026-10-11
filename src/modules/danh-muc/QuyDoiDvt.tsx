// Khối Quy đổi đơn vị tính trong form hàng hoá, hộp thêm, sửa quy đổi và ô chọn có tìm dùng chung (T151)
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Popover } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import { fold } from '../../ui/format'
import { useSession } from '../../app/session'
import { DON_VI_TINH, QUY_DOI_DVT, TEN_DVT } from './data'

/** Một dòng quy đổi của hàng hoá. nguoc: false là 1 ĐVT chính = tl dv, true là 1 dv = tl ĐVT chính */
export interface QuyDoi { dv: string; tl: number; nguoc: boolean; apTatCa: boolean; bat: boolean }

const TAT_CA = 'Tất cả hàng hoá'
const maDvt = (ten: string) => DON_VI_TINH.find(d => d[1] === ten)?.[0] ?? ''
/** Số kiểu Việt: phẩy thập phân, tối đa 4 chữ số lẻ */
const soVn = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 4 })
/** Số đưa vào ô nhập: không chấm ngăn nghìn để đọc lại không nhầm thành số lẻ */
const soNhap = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 4, useGrouping: false })
/** Đọc số người dùng gõ, nhận cả phẩy lẫn chấm thập phân */
const docSo = (s: string) => Number(s.trim().replace(/\s/g, '').replace(',', '.'))
const dienGiai = (q: Pick<QuyDoi, 'dv' | 'tl' | 'nguoc'>, chinh: string) =>
  q.nguoc ? `1 ${q.dv} = ${soVn(q.tl)} ${chinh}` : `1 ${chinh} = ${soVn(q.tl)} ${q.dv}`

/** Dòng quy đổi lấy từ danh mục Quy đổi ĐVT (1.4): dòng của hàng này trước, rồi dòng áp cho tất cả hàng hoá có ĐVT khớp */
export function quyDoiTuDanhMuc(tenHang: string, chinh: string): QuyDoi[] {
  if (!chinh) return []
  const kq: QuyDoi[] = []
  const ds = [...QUY_DOI_DVT.filter(q => q.hang === tenHang), ...QUY_DOI_DVT.filter(q => q.hang === TAT_CA)]
  for (const q of ds) {
    if (q.goc !== chinh && q.qd !== chinh) continue
    // danh mục ghi 1 qd = tl goc: ĐVT chính là qd thì giữ chiều xuôi, là goc thì ghi chiều ngược
    const dong: QuyDoi = q.qd === chinh
      ? { dv: q.goc, tl: q.tl, nguoc: false, apTatCa: q.hang === TAT_CA, bat: true }
      : { dv: q.qd, tl: q.tl, nguoc: true, apTatCa: q.hang === TAT_CA, bat: true }
    if (!kq.some(x => x.dv === dong.dv)) kq.push(dong)
  }
  return kq
}

/** Thân khối Quy đổi đơn vị tính: bảng các đơn vị quy đổi, bấm dòng để sửa, nút Thêm mới ở góc */
export function KhoiQuyDoi({ v, doi }: { v: Record<string, any>; doi: (k: string, val: unknown) => void }) {
  const chinh = String(v.dvt ?? '')
  const tenHang = String(v.ten ?? '')
  const ds: QuyDoi[] = Array.isArray(v._quyDoi) ? v._quyDoi : quyDoiTuDanhMuc(tenHang, chinh)
  const [hop, setHop] = useState<{ i: number } | null>(null)   // i = -1: thêm mới

  const luu = (q: QuyDoi) => {
    doi('_quyDoi', hop && hop.i >= 0 ? ds.map((x, j) => j === hop.i ? q : x) : [...ds, q])
    setHop(null)
  }

  return (
    <div className="qd-khoi">
      <div className="qd-thanh">
        <span className="muted">
          {chinh ? <>ĐVT chính <b>{chinh}</b> · {ds.length ? `${ds.length} đơn vị quy đổi` : 'chưa có đơn vị quy đổi'}</> : 'Chọn đơn vị tính ở khối Thông tin chung để khai quy đổi.'}
        </span>
        <button type="button" className="btn sm" disabled={!chinh} onClick={() => setHop({ i: -1 })}>
          <Icon n="plus" className="ic sm" />Thêm mới
        </button>
      </div>
      {ds.length > 0 && (
        <table className="qd-bang">
          <thead>
            <tr>
              <th>Đơn vị quy đổi</th>
              <th className="qd-so">Tỷ lệ quy đổi</th>
              <th>Diễn giải</th>
              <th>Hàng hoá áp dụng</th>
              <th className="qd-giua">Sử dụng</th>
            </tr>
          </thead>
          <tbody>
            {ds.map((q, i) => (
              <tr key={q.dv} className={q.bat ? '' : 'qd-tat'} onClick={() => setHop({ i })} title="Bấm để sửa">
                <td><b>{q.dv}</b>{maDvt(q.dv) && <small className="qd-ma">{maDvt(q.dv)}</small>}</td>
                <td className="qd-so">{soVn(q.tl)}</td>
                <td>{dienGiai(q, chinh)}</td>
                <td>{q.apTatCa ? TAT_CA : (tenHang || 'Hàng hoá này')}</td>
                <td className="qd-giua">
                  <button type="button" role="switch" aria-checked={q.bat} aria-label={`Sử dụng quy đổi ${q.dv}`}
                    className={`ds-ct${q.bat ? ' on' : ''}`}
                    onClick={e => { e.stopPropagation(); doi('_quyDoi', ds.map((x, j) => j === i ? { ...x, bat: !x.bat } : x)) }}>
                    <i />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {hop && (
        <HopQuyDoi chinh={chinh} tenHang={tenHang} sua={hop.i >= 0 ? ds[hop.i] : undefined}
          daCo={ds.filter((_, j) => j !== hop.i).map(x => x.dv)} onDong={() => setHop(null)} onLuu={luu} />
      )}
    </div>
  )
}

/** Hộp Thêm mới / Sửa quy đổi đơn vị tính */
function HopQuyDoi({ chinh, tenHang, sua, daCo, onDong, onLuu }: {
  chinh: string; tenHang: string; sua?: QuyDoi; daCo: string[]; onDong: () => void; onLuu: (q: QuyDoi) => void
}) {
  const { toast } = useSession()
  const [dv, setDv] = useState(sua?.dv ?? '')
  const [tl, setTl] = useState(sua ? soNhap(sua.tl) : '')
  const [dao, setDao] = useState(sua?.nguoc ?? false)   // true: hàng trên là đơn vị quy đổi, hàng dưới là ĐVT chính
  const [apTatCa, setApTatCa] = useState(sua?.apTatCa ?? false)
  const [loi, setLoi] = useState('')

  // Esc đóng hộp; menu ô chọn đang mở thì menu tự bắt Esc trước
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onDong() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onDong])

  const so = docSo(tl)
  const soHopLe = tl.trim() !== '' && Number.isFinite(so) && so > 0
  const tren = dao ? (dv || 'đơn vị quy đổi') : chinh
  const duoi = dao ? chinh : (dv || 'đơn vị quy đổi')

  // Đảo vị trí: đổi chiều ĐVT chính và đơn vị quy đổi, tỷ lệ thành 1/tỷ lệ
  const daoViTri = () => {
    setDao(d => !d)
    if (soHopLe) setTl(soNhap(1 / so))
  }

  const luu = () => {
    if (!dv) return setLoi('Chọn đơn vị quy đổi')
    if (dv === chinh) return setLoi('Đơn vị quy đổi phải khác ĐVT chính')
    if (daCo.includes(dv)) return setLoi(`${dv} đã có trong bảng quy đổi`)
    if (!soHopLe) return setLoi('Tỷ lệ quy đổi phải lớn hơn 0')
    onLuu({ dv, tl: so, nguoc: dao, apTatCa, bat: sua?.bat ?? true })
  }

  const oChinh = (
    <div className="f">
      <label>ĐVT chính</label>
      <input className="inp" value={chinh} readOnly tabIndex={-1} />
    </div>
  )
  const oQuyDoi = (
    <div className="f">
      <label>Đơn vị quy đổi <em>*</em></label>
      <ChonCoTim nhan="Đơn vị quy đổi" value={dv} onChange={x => { setDv(x); setLoi('') }}
        ds={TEN_DVT.map(t => ({ v: t, t, phu: `Mã: ${maDvt(t)}` }))}
        dau={(
          <>
            <button type="button" className="btn sm ghost" onClick={() => toast('Thêm đơn vị tính mới ở danh mục Đơn vị tính')}>
              <Icon n="plus" className="ic sm" />Thêm ĐVT mới
            </button>
            <button type="button" className="btn sm ghost" onClick={() => toast('Đã làm mới danh sách đơn vị tính')}>
              <Icon n="refresh" className="ic sm" />Làm mới
            </button>
          </>
        )} />
    </div>
  )
  const tieuDe = sua ? 'Sửa quy đổi đơn vị tính' : 'Thêm mới quy đổi đơn vị tính'

  return createPortal(
    <div className="overlay ds-hop-nen qd-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop qd-hop" role="dialog" aria-modal="true" aria-label={tieuDe}>
        <div className="ds-hop-dau">
          <Icon n="quydoi" className="ic" />
          <b>{tieuDe}</b>
          <span className="grow" />
          <button type="button" className="icon-btn sm" onClick={onDong} aria-label="Đóng"><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="qd-hop-than">
          <p className="muted qd-goi-y">Nhập tỷ lệ quy đổi rồi bấm {sua ? 'Lưu' : 'Thêm'}.</p>
          <div className="qd-cap">
            {dao ? oQuyDoi : oChinh}
            <button type="button" className="qd-dao" onClick={daoViTri} title="Đảo vị trí" aria-label="Đảo vị trí">
              <Icon n="swap" className="ic sm" />
            </button>
            {dao ? oChinh : oQuyDoi}
          </div>
          <div className="f">
            <label>Tỷ lệ quy đổi <em>*</em></label>
            <input className="inp pn-so" inputMode="decimal" value={tl} placeholder="Ví dụ 0,1"
              onChange={e => { setTl(e.target.value); setLoi('') }} onKeyDown={e => { if (e.key === 'Enter') luu() }} />
          </div>
          <div className={`qd-xem${soHopLe && dv ? '' : ' trong'}`}>
            <Icon n="quydoi" className="ic sm" />
            <span>1 <b>{tren}</b> = <b>{soHopLe ? soVn(so) : '…'}</b> <b>{duoi}</b></span>
          </div>
          <div className="f">
            <label>Áp dụng cho</label>
            <div className="qd-ap" role="radiogroup" aria-label="Áp dụng cho">
              <button type="button" role="radio" aria-checked={!apTatCa} className={apTatCa ? '' : 'on'} onClick={() => setApTatCa(false)}>
                Hàng hoá này{tenHang && <small>{tenHang}</small>}
              </button>
              <button type="button" role="radio" aria-checked={apTatCa} className={apTatCa ? 'on' : ''} onClick={() => setApTatCa(true)}>
                {TAT_CA}<small>Mọi hàng có ĐVT {chinh}</small>
              </button>
            </div>
          </div>
          {loi && <div className="qd-loi" role="alert"><Icon n="alert" className="ic sm" />{loi}</div>}
        </div>
        <div className="ds-chan">
          <span className="grow" />
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <button type="button" className="btn pri" onClick={luu}>{sua ? 'Lưu' : 'Thêm'}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export interface MucTim { v: string; t: string; phu?: string }

/** Ô chọn một có ô tìm: mỗi dòng tên đậm, dòng phụ mờ; dau là hàng nút ở đầu danh sách */
export function ChonCoTim({ ds, value, onChange, nhan, hienChon, dau, className = 'inp' }: {
  ds: MucTim[]
  value: string
  onChange: (v: string) => void
  nhan: string                               // tên ô, dùng cho chữ gợi ý và ô tìm
  hienChon?: (m: MucTim) => string           // chữ hiện trên ô khi đã chọn, mặc định là tên
  dau?: ReactNode
  className?: string
}) {
  const [mo, setMo] = useState(false)
  const [tim, setTim] = useState('')
  const btn = useRef<HTMLButtonElement>(null)
  const q = fold(tim.trim())
  const loc = q ? ds.filter(x => fold(`${x.v} ${x.t}`).includes(q)) : ds
  const cur = ds.find(x => x.v === value)
  const chu = cur ? (hienChon?.(cur) ?? cur.t) : value

  useEffect(() => { if (mo) setTim('') }, [mo])
  const chon = (v: string) => { onChange(v); setMo(false); btn.current?.focus() }

  return (
    <>
      <button ref={btn} type="button" className={`sel ${className}${mo ? ' open' : ''}`} title={chu || undefined}
        aria-haspopup="listbox" aria-expanded={mo} aria-label={nhan}
        onClick={() => setMo(o => !o)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setMo(true) } }}>
        <span className={`sel-v${chu ? '' : ' ct-goi-y'}`}>{chu || `Chọn ${nhan.toLowerCase()}`}</span>
        <Icon n="chevd" className="ic sm sel-c" />
      </button>
      <Popover anchor={btn} open={mo} onClose={() => setMo(false)} role="listbox" className="pop-sel pop-dm pop-tim"
        width={Math.max(280, btn.current?.offsetWidth ?? 0)}>
        <div className="dm-tim">
          <Icon n="search" className="ic sm" />
          <input value={tim} placeholder={`Tìm ${nhan.toLowerCase()}`} onChange={e => setTim(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (loc[0]) chon(loc[0].v) } }} />
        </div>
        {dau && <div className="ct-dau">{dau}</div>}
        <div className="dm-ds">
          {loc.map(o => (
            <button key={o.v} data-mi type="button" role="option" aria-selected={o.v === value} className={`mi${o.v === value ? ' on' : ''}`} onClick={() => chon(o.v)}>
              <span className="mi-t"><b>{o.t}</b>{o.phu && <small>{o.phu}</small>}</span>
              {o.v === value && <Icon n="check" className="ic sm mi-ok" />}
            </button>
          ))}
          {!loc.length && <div className="dm-trong">Không có {nhan.toLowerCase()} khớp «{tim.trim()}»</div>}
        </div>
      </Popover>
    </>
  )
}
