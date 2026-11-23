// Danh sách đơn vị kế toán của tài khoản (T904): mở từ Xem tất cả đơn vị ở thanh trên.
// Chủ doanh nghiệp (chủ tài khoản FABi) sửa tên, MST, địa chỉ, thêm, bớt cửa hàng FABi; vai trò khác chỉ xem.
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { dsDonVi, loaiHinhDv, useSession, type CnThem } from '../../app/session'
import { HOM_NAY } from '../../data/mock'
import { CUA_HANG_FABI, cuaHangChuaDung, cuaHangCuaDv, type CuaHangFabi } from '../onboarding/cua-hang-fabi'
import { Icon } from '../../ui/Icon'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { Table } from '../../ui/Table'
import { PhanTrang } from '../../ui/PhanTrang'
import { Dropdown, MenuHead, MenuItem } from '../../ui/Dropdown'
import { Note, Pk } from '../../ui/Page'
import { GOI } from '../../app/plan'
import { dmy, fold } from '../../ui/format'

const TEN_LOAI = { hkd: 'Hộ kinh doanh', dn: 'Doanh nghiệp' }

export function DanhSachDonVi({ sc }: ScreenProps) {
  const { s, set } = useSession()
  const nav = useNavigate()
  const duocSua = s.role === 'owner'   // chỉ Chủ doanh nghiệp (FABi Owner) được sửa
  const [tim, setTim] = useState('')
  const [chon, setChon] = useState(s.donVi)
  const [mo, setMo] = useState<string | null>(null)
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)

  const rows: Row[] = useMemo(() => dsDonVi(s).map(d => {
    const ch = cuaHangCuaDv(s, d.id)
    return { id: d.id, mst: d.mst, ten: d.ten, diaChi: d.diaChi, loai: TEN_LOAI[loaiHinhDv(s, d)], goi: d.goi, tenGoi: GOI[d.goi].ten, soCh: ch.length, cuaHang: ch.map(c => c.ten).join(', ') }
  }), [s])
  const list = rows.filter(r => !tim.trim() || fold(`${r.mst} ${r.ten} ${r.diaChi} ${r.cuaHang} ${r.tenGoi}`).includes(fold(tim.trim())))
  const trangHt = Math.min(trang, Math.max(1, Math.ceil(list.length / coTrang)))
  const dsTrang = list.slice((trangHt - 1) * coTrang, trangHt * coTrang).map((r, i) => ({ ...r, stt: (trangHt - 1) * coTrang + i + 1 }))

  const cols: Col[] = [
    { k: 'stt', t: '#', c: true, w: 48 },
    { k: 'mst', t: 'Mã số thuế', w: 130, r: r => !r.id ? null : r.mst || <span className="muted">Chưa khai</span> },
    { k: 'ten', t: 'Tên đơn vị', w: 260, r: r => !r.id ? null : <span className="dsdv-ten"><b title={r.ten}>{r.ten}</b>{r.id === s.donVi && <span className="dsdv-dang">Đang làm việc</span>}</span> },   // nhãn nhỏ sau tên, tên dài thì cắt tên, nhãn vẫn hiện
    { k: 'diaChi', t: 'Địa chỉ', w: 280 },
    { k: 'cuaHang', t: 'Danh sách cửa hàng', w: 300, r: r => !r.id ? r.cuaHang : r.soCh ? <span className="dsdv-ds-ch" title={r.cuaHang}><span className="dsdv-so-ch" title={`${r.soCh} cửa hàng`}>{r.soCh}</span><span className="dsdv-ten-ch">{r.cuaHang}</span></span> : <span className="muted">Chưa có cửa hàng</span> },
    { k: 'loai', t: 'Loại hình', w: 130 },
    { k: 'tenGoi', t: 'Gói dịch vụ', w: 120, r: r => !r.id ? null : <Pk g={r.goi} /> },   // gói đơn vị đang dùng, đổi ở Gói thuê bao
    { k: 'thaoTac', t: 'Thao tác', c: true, w: 120, dinh: 'phai', r: r => !r.id ? null : (
      <span className="dsdv-tt">
        <button type="button" className="btn ghost sm" title={duocSua ? 'Sửa thông tin đơn vị' : 'Xem thông tin đơn vị'} onClick={e => { e.stopPropagation(); setMo(r.id) }}>
          <Icon n={duocSua ? 'edit' : 'eye'} className="ic sm" />
        </button>
        {/* Dòng đơn vị đang mở vẫn có nút cho thẳng hàng, nút mờ; không dùng disabled để rê chuột vẫn hiện chữ giải thích */}
        <button type="button" className={`btn ghost sm${r.id === s.donVi ? ' dsdv-tat' : ''}`} aria-disabled={r.id === s.donVi}
          title={r.id === s.donVi ? 'Đang làm việc ở đơn vị này' : 'Chuyển sang làm việc ở đơn vị này'}
          onClick={e => { e.stopPropagation(); if (r.id === s.donVi) return; const d = dsDonVi(s).find(x => x.id === r.id)!; set({ donVi: d.id, goi: d.goi, cuaHang: 'all' }); nav('/app') }}>
          <Icon n="swap" className="ic sm" />
        </button>
      </span>
    ) },
  ]

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{sc.ten}</h1>
      <div className="voucher-split">
        <section className="card voucher-top">
          <div className="ds-toolbar-figma">
            <div className="ds-tim-figma">
              <IconFigmaSearch size={16} />
              <input value={tim} placeholder="MST, tên, địa chỉ, cửa hàng" aria-label="Tìm đơn vị" onChange={e => { setTim(e.target.value); setTrang(1) }} />
            </div>
            <span className="grow" />
            {!duocSua && <span className="dsdv-chi-xem"><Icon n="info" className="ic sm" />Chỉ chủ doanh nghiệp (chủ tài khoản FABi) được sửa đơn vị</span>}
          </div>
          {list.length ? (
            <>
              <Table cols={cols} rows={dsTrang} motDong keDoc onRow={r => setChon(r.id)} onDbl={r => setMo(r.id)}
                rowCls={r => r.id === chon ? 'dang-chon' : ''} sum={{ stt: String(dsTrang.length), cuaHang: `${list.reduce((a, r) => a + r.soCh, 0)} cửa hàng` }} />
              <PhanTrang tong={list.length} trang={trangHt} coTrang={coTrang} onTrang={setTrang} onCoTrang={c => { setCoTrang(c); setTrang(1) }} />
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Không có đơn vị khớp từ tìm</b>
              <button type="button" className="btn sm" style={{ marginTop: 10 }} onClick={() => setTim('')}>Xoá từ tìm</button>
            </div>
          )}
        </section>
      </div>
      {mo && <HopDonVi id={mo} duocSua={duocSua} onDong={() => setMo(null)} />}
    </div>
  )
}

/** Hộp xem, sửa một đơn vị: tên, MST, địa chỉ, cửa hàng. Thêm, bớt cửa hàng chỉ đổi trên hộp, bấm Lưu mới áp dụng */
function HopDonVi({ id, duocSua, onDong }: { id: string; duocSua: boolean; onDong: () => void }) {
  const { s, set, toast } = useSession()
  const dv = dsDonVi(s).find(d => d.id === id)!
  const [f, setF] = useState({ ten: dv.ten, mst: dv.mst, diaChi: dv.diaChi })
  const [ds, setDs] = useState<CuaHangFabi[]>(() => cuaHangCuaDv(s, id))
  const goc = cuaHangCuaDv(s, id)
  // Cửa hàng thêm được: chưa gán đơn vị nào, cộng cửa hàng vừa bớt trên hộp, trừ cửa hàng vừa thêm
  const trong = [...cuaHangChuaDung({ ...s, donVi: id }), ...goc.filter(c => !ds.some(x => x.id === c.id))]
    .filter((c, i, a) => !ds.some(x => x.id === c.id) && a.findIndex(x => x.id === c.id) === i)
  const loai = TEN_LOAI[loaiHinhDv(s, dv)]

  const luu = () => {
    const ten = f.ten.trim(), mst = f.mst.trim(), diaChi = f.diaChi.trim()
    if (!ten) return toast('Tên đơn vị không được để trống', { loai: 'loi' })
    const so = mst.replace(/[\s-]/g, '')
    if (mst && !/^\d{10}(\d{3})?$/.test(so)) return toast('Mã số thuế gồm 10 hoặc 13 chữ số', { loai: 'loi' })
    if (mst && dsDonVi(s).some(d => d.id !== id && d.mst.replace(/[\s-]/g, '') === so)) return toast('Mã số thuế đã dùng ở đơn vị khác', { loai: 'loi' })
    if (!ds.length) return toast('Đơn vị cần ít nhất một cửa hàng', { loai: 'loi' })
    // Cửa hàng có sẵn của đơn vị mẫu bớt thì ghi vào cnBo; cửa hàng còn lại ngoài danh sách có sẵn ghi vào cnThem
    const coSan = CUA_HANG_FABI.filter(c => c.donVi === id)
    const bo = coSan.filter(c => !ds.some(x => x.id === c.id)).map(c => c.id)
    const cuThem = s.cnThem?.[id] ?? []
    const them: CnThem[] = ds.filter(c => !coSan.some(x => x.id === c.id))
      .map(c => cuThem.find(x => x.id === c.id) ?? { id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay: dmy(HOM_NAY) })
    const soThem = ds.filter(c => !goc.some(x => x.id === c.id)).length
    const soBo = goc.filter(c => !ds.some(x => x.id === c.id)).length
    set({
      ttDv: { ...s.ttDv, [id]: { ...s.ttDv?.[id], ten, mst, diaChi } },
      cnThem: { ...s.cnThem, [id]: them },
      cnBo: { ...s.cnBo, [id]: bo },
      // đang làm việc ở cửa hàng vừa bớt thì về xem tất cả cửa hàng
      ...(id === s.donVi && !ds.some(c => c.id === s.cuaHang) && s.cuaHang !== 'all' ? { cuaHang: 'all' } : {}),
    })
    toast(`Đã lưu đơn vị ${ten}${soThem ? `, thêm ${soThem} cửa hàng` : ''}${soBo ? `, bớt ${soBo} cửa hàng` : ''}`)
    onDong()
  }

  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }} onKeyDown={e => { if (e.key === 'Escape') onDong() }}>
      <div className="ds-hop dsdv-hop" role="dialog" aria-modal="true" aria-label={`Thông tin đơn vị - ${dv.ten}`}>
        <div className="ds-hop-dau"><b>{duocSua ? 'Sửa đơn vị' : 'Thông tin đơn vị'}</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong} autoFocus><Icon n="x" className="ic sm" /></button></div>
        <div className="dsdv-than">
          <div className="form-grid">
            <div className="f c2"><label>Mã số thuế</label><input className="inp" readOnly={!duocSua} value={f.mst} placeholder="Chưa khai mã số thuế" onChange={e => setF({ ...f, mst: e.target.value })} /></div>
            <div className="f"><label>Loại hình</label><input className="inp" readOnly value={loai} title="Đổi loại hình ở Hệ thống, Thông tin đơn vị" /></div>
            <div className="f"><label>Gói dịch vụ</label><input className="inp" readOnly value={GOI[dv.goi].ten} title="Gói đơn vị đang dùng, đổi ở Hệ thống, Gói thuê bao" /></div>
            <div className="f c4"><label>Tên đơn vị <span className="req">*</span></label><input className="inp" readOnly={!duocSua} value={f.ten} onChange={e => setF({ ...f, ten: e.target.value })} /></div>
            <div className="f c4"><label>Địa chỉ</label><input className="inp" readOnly={!duocSua} value={f.diaChi} onChange={e => setF({ ...f, diaChi: e.target.value })} /></div>
          </div>
          <div className="dsdv-ch-dau"><b>Cửa hàng ({ds.length})</b><span className="grow" />
            {duocSua && (
              <Dropdown btnClass="btn sm" align="end" width={300} label={<><Icon n="plus" className="ic sm" />Thêm cửa hàng</>}>
                {dong => <>
                  <MenuHead>Cửa hàng FABi chưa dùng kế toán</MenuHead>
                  {trong.length ? trong.map(c => (
                    <MenuItem key={c.id} icon="cuahang" desc={c.khuVuc} onClick={() => { setDs(x => [...x, c]); dong() }}>{c.ten}</MenuItem>
                  )) : <div className="dsdv-trong muted">Mọi cửa hàng FABi đã thuộc một đơn vị. Bớt cửa hàng ở đơn vị khác trước.</div>}
                </>}
              </Dropdown>
            )}
          </div>
          <ul className="dsdv-ch">
            {ds.map(c => (
              <li key={c.id}>
                <Icon n="cuahang" className="ic sm" /><span className="grow"><b>{c.ten}</b><small className="muted"> · {c.khuVuc}</small>
                  {!goc.some(x => x.id === c.id) && <span className="chip dsdv-moi">Mới thêm</span>}</span>
                {duocSua && <button type="button" className="btn ghost sm" title="Bớt cửa hàng khỏi đơn vị" onClick={() => setDs(x => x.filter(y => y.id !== c.id))}><Icon n="x" className="ic sm" /></button>}
              </li>
            ))}
            {!ds.length && <li className="muted">Chưa có cửa hàng</li>}
          </ul>
          {duocSua
            ? <Note>Bớt cửa hàng thì chứng từ đã lập giữ nguyên. Cửa hàng về danh sách cửa hàng FABi chưa dùng kế toán, gán được cho đơn vị khác.</Note>
            : <Note>Chỉ chủ doanh nghiệp (chủ tài khoản FABi) được sửa thông tin và cửa hàng của đơn vị.</Note>}
        </div>
        <div className="dsdv-chan">
          <button type="button" className="btn" onClick={onDong}>{duocSua ? 'Huỷ' : 'Đóng'}</button>
          {duocSua && <button type="button" className="btn pri" onClick={luu}>Lưu</button>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
