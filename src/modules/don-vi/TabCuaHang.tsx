// Tab Cửa hàng FABi của trang Quản lý đơn vị kế toán (T906): mọi cửa hàng trên tài khoản FABi, đã gán, chưa gán.
// Gán cửa hàng chưa gán vào đơn vị; chuyển cửa hàng sang đơn vị khác khi cửa hàng chưa có chứng từ tạo thủ công.
// Cửa hàng lên sổ ở đơn vị nhận từ Ngày bắt đầu làm việc của đơn vị đó, không chọn riêng từng cửa hàng.
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Col, Row } from '../types'
import { dsDonVi, ngayLamViecDv, useSession } from '../../app/session'
import { GOI } from '../../app/plan'
import { CUA_HANG_FABI, chuyenCuaHang, ctThuCong, cuaHangCuaDv, cuaHangTaiKhoan, type CuaHangFabi } from '../onboarding/cua-hang-fabi'
import { Icon } from '../../ui/Icon'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { Table } from '../../ui/Table'
import { fold } from '../../ui/format'

export type LocGan = 'all' | 'da' | 'chua'

export function TabCuaHang({ duocSua, loc, onLoc }: { duocSua: boolean; loc: LocGan; onLoc: (l: LocGan) => void }) {
  const { s } = useSession()
  const [tim, setTim] = useState('')
  const [mo, setMo] = useState<{ c: CuaHangFabi; dv?: string } | null>(null)
  const dsDv = dsDonVi(s)
  const tenDv = (id?: string) => dsDv.find(d => d.id === id)?.ten
  const tuNgay = (c: CuaHangFabi, dv?: string) => !dv ? '' : (s.cnThem?.[dv] ?? []).find(x => x.id === c.id)?.tuNgay ?? ngayLamViecDv(s, dv)

  const tatCa = cuaHangTaiKhoan(s, dsDv.map(d => d.id)).map(({ c, dv }) => ({ c, dv, ct: ctThuCong(s, c, dv) }))
  const soDa = tatCa.filter(x => x.dv).length
  const list: Row[] = tatCa
    .filter(x => loc === 'all' || (loc === 'da' ? x.dv : !x.dv))
    .filter(x => !tim.trim() || fold(`${x.c.ten} ${x.c.khuVuc} ${tenDv(x.dv) ?? ''}`).includes(fold(tim.trim())))
    .map((x, i) => ({ id: x.c.id, stt: i + 1, pos: CUA_HANG_FABI.find(c => c.id === x.c.id)?.posId ?? '', ten: x.c.ten, khuVuc: x.c.khuVuc,
      tt: x.dv ? 'Đã gán' : 'Chưa gán', dv: tenDv(x.dv) ?? '', maDv: x.dv, tuNgay: tuNgay(x.c, x.dv), ct: x.ct, _c: x.c }))

  const cols: Col[] = [
    { k: 'stt', t: '#', c: true, w: 48 },
    { k: 'pos', t: 'Mã POS', w: 90, r: r => !r.id ? null : r.pos },
    { k: 'ten', t: 'Tên cửa hàng', w: 230, r: r => !r.id ? null : <b>{r.ten}</b> },
    { k: 'khuVuc', t: 'Khu vực', w: 100 },
    { k: 'tt', t: 'Trạng thái', w: 110, r: r => !r.id ? null : <span className={`qldv-tt ${r.maDv ? 'da' : 'chua'}`}>{r.tt}</span> },
    { k: 'dv', t: 'Thuộc đơn vị', w: 270, r: r => !r.id ? null : r.dv || <span className="muted">Chưa thuộc đơn vị nào</span> },
    { k: 'tuNgay', t: 'Lên sổ từ', w: 110, r: r => !r.id ? null : r.tuNgay || <span className="muted">-</span> },
    { k: 'ct', t: 'Chứng từ tạo thủ công', w: 160, num: true, r: r => !r.id ? null : r.maDv ? r.ct : <span className="muted">-</span> },
    { k: 'thaoTac', t: 'Thao tác', c: true, w: 150, dinh: 'phai', r: r => {
      if (!r.id || !duocSua) return null
      if (!r.maDv) return <button type="button" className="btn pri sm" onClick={e => { e.stopPropagation(); setMo({ c: r._c }) }}>Gán vào đơn vị</button>
      // cửa hàng đã có chứng từ tạo thủ công: nút mờ, rê chuột xem lý do (không dùng disabled để vẫn hiện chữ)
      return r.ct
        ? <button type="button" className="btn sm dsdv-tat" aria-disabled title={`Cửa hàng đã có ${r.ct} chứng từ tạo thủ công, không chuyển đơn vị được`}>Chuyển đơn vị</button>
        : <button type="button" className="btn sm" onClick={e => { e.stopPropagation(); setMo({ c: r._c, dv: r.maDv }) }}>Chuyển đơn vị</button>
    } },
  ]
  const chips: [LocGan, string][] = [['all', `Tất cả (${tatCa.length})`], ['da', `Đã gán (${soDa})`], ['chua', `Chưa gán (${tatCa.length - soDa})`]]

  return (
    <>
      <div className="ds-toolbar-figma">
        <div className="ds-tim-figma">
          <IconFigmaSearch size={16} />
          <input value={tim} placeholder="Tên cửa hàng, khu vực, đơn vị" aria-label="Tìm cửa hàng" onChange={e => setTim(e.target.value)} />
        </div>
        <div className="qldv-chip" role="group" aria-label="Lọc theo trạng thái gán">
          {chips.map(([k, nhan]) => <button key={k} type="button" className={loc === k ? 'on' : ''} aria-pressed={loc === k} onClick={() => onLoc(k)}>{nhan}</button>)}
        </div>
      </div>
      {list.length ? (
        <Table cols={cols} rows={list} motDong keDoc rowCls={r => r.maDv ? '' : 'qldv-chua-gan'} sum={{ stt: String(list.length) }} />
      ) : (
        <div className="empty" style={{ margin: 'auto' }}><b>Không có cửa hàng khớp bộ lọc</b></div>
      )}
      <div className="qldv-chan">
        <span>Đang xem <b>{list.length}</b> / {tatCa.length} cửa hàng</span>
        <span className="grow" />
        <span className="qldv-luu-y"><Icon n="info" className="ic sm" />Chỉ chuyển đơn vị được với các cửa hàng chưa có chứng từ phát sinh. Chỉ đếm chứng từ tạo thủ công, không đếm chứng từ tự sinh từ POS, FABi.</span>
      </div>
      {mo && <HopChuyen c={mo.c} tu={mo.dv} onDong={() => setMo(null)} />}
    </>
  )
}

/** Hộp Chuyển đơn vị (cửa hàng đã gán) hoặc Gán vào đơn vị (cửa hàng chưa gán): chọn đơn vị nhận, ngày lên sổ theo đơn vị nhận */
function HopChuyen({ c, tu, onDong }: { c: CuaHangFabi; tu?: string; onDong: () => void }) {
  const { s, set, toast } = useSession()
  const [den, setDen] = useState('')
  const dsDv = dsDonVi(s).filter(d => d.id !== tu)
  const tenTu = dsDonVi(s).find(d => d.id === tu)?.ten
  const dvDen = dsDv.find(d => d.id === den)
  const ngay = den ? ngayLamViecDv(s, den) : ''
  const tieuDe = tu ? 'Chuyển đơn vị' : 'Gán vào đơn vị'

  const xacNhan = () => {
    if (!dvDen) return
    set({
      ...chuyenCuaHang(s, c, tu, den, ngay),
      // đang làm việc ở cửa hàng vừa chuyển đi thì về xem tất cả cửa hàng
      ...(tu === s.donVi && s.cuaHang === c.id ? { cuaHang: 'all' } : {}),
    })
    toast(`${tu ? 'Đã chuyển' : 'Đã gán'} ${c.ten} vào ${dvDen.ten}, lên sổ từ ${ngay}`)
    onDong()
  }

  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }} onKeyDown={e => { if (e.key === 'Escape') onDong() }}>
      <div className="ds-hop qldv-hop" role="dialog" aria-modal="true" aria-label={`${tieuDe} - ${c.ten}`}>
        <div className="ds-hop-dau"><b>{tieuDe}</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong} autoFocus><Icon n="x" className="ic sm" /></button></div>
        <div className="dsdv-than">
          <div className="qldv-the-ch">
            <b>{c.ten}</b><small className="muted"> · {c.khuVuc}</small>
            <div className="muted">{tenTu ? <>Đang thuộc <b className="qldv-dam">{tenTu}</b></> : 'Chưa thuộc đơn vị nào'}</div>
            {tu && <div className="qldv-ok"><Icon n="check" className="ic sm" />Chưa có chứng từ tạo thủ công, chuyển được</div>}
          </div>
          <div className="qldv-chon-dv" role="radiogroup" aria-label={tu ? 'Chuyển sang đơn vị' : 'Gán vào đơn vị'}>
            <b>{tu ? 'Chuyển sang đơn vị' : 'Gán vào đơn vị'} <span className="req">*</span></b>
            {dsDv.map(d => (
              <button key={d.id} type="button" role="radio" aria-checked={den === d.id} className={den === d.id ? 'on' : ''} onClick={() => setDen(d.id)}>
                <span className="qldv-radio" />
                <span className="dv-av">{d.viettat}</span>
                <span className="grow"><b>{d.ten}</b><small className="muted">
                  {d.mst ? `MST ${d.mst}` : 'Chưa khai MST'} · {cuaHangCuaDv(s, d.id).length} cửa hàng · {GOI[d.goi].ten} · Làm việc từ {ngayLamViecDv(s, d.id)}</small></span>
              </button>
            ))}
          </div>
          <div className="qldv-ngay">
            <span className="muted">Lên sổ ở đơn vị {tu ? 'mới' : 'nhận'} từ ngày</span>
            <div><span className={`qldv-ngay-o${ngay ? '' : ' trong'}`}>{ngay || 'Chọn đơn vị'}</span>
              <small className="muted">Theo Ngày bắt đầu làm việc của đơn vị nhận (Hệ thống, Thông tin đơn vị). Không chọn riêng từng cửa hàng.</small></div>
          </div>
          {dvDen && (
            <div className="qldv-tom-tat">
              <span>{c.ten}: {tenTu ? <><b>{tenTu}</b> → </> : ''}<b>{dvDen.ten}</b></span>
              <span>Từ ngày {ngay}, Xuất bán POS, thu tiền bán hàng và thu chi từ FABi của cửa hàng đồng bộ về đơn vị {tu ? 'mới' : 'này'}.{tu ? ' Chứng từ tự sinh đã có giữ ở đơn vị cũ.' : ''}</span>
            </div>
          )}
        </div>
        <div className="dsdv-chan">
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <button type="button" className={`btn pri${dvDen ? '' : ' dsdv-tat'}`} aria-disabled={!dvDen} onClick={xacNhan}>{tieuDe}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
