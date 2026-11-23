// Quản lý đơn vị kế toán (T904, T906): trang của tài khoản FABi, không thuộc đơn vị nào, đường dẫn /don-vi.
// Tab Đơn vị kế toán: MST, tên, địa chỉ, cửa hàng, loại hình, gói. Tab Cửa hàng FABi: mọi cửa hàng, đã gán, chưa gán.
// Chủ doanh nghiệp (chủ tài khoản FABi) sửa đơn vị, gán, chuyển, bớt cửa hàng; vai trò khác chỉ xem.
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import type { Col, Row } from '../types'
import { donViHienTai, dsDonVi, loaiHinhDv, ngayLamViecDv, useSession, type CnThem } from '../../app/session'
import { GOI } from '../../app/plan'
import { CUA_HANG_FABI, cuaHangChuaDung, cuaHangCuaDv, cuaHangTaiKhoan, ctThuCong, type CuaHangFabi } from '../onboarding/cua-hang-fabi'
import { useThemDonVi } from '../onboarding/OnboardFabi'
import { useBanPhieu } from '../../ui/generic/daXoa'
import { Icon } from '../../ui/Icon'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { Logo } from '../../ui/Logo'
import { Table } from '../../ui/Table'
import { Dropdown, MenuHead, MenuItem } from '../../ui/Dropdown'
import { Note, Pk } from '../../ui/Page'
import { fold } from '../../ui/format'
import { TabCuaHang, type LocGan } from './TabCuaHang'

export const TEN_LOAI = { hkd: 'Hộ kinh doanh', dn: 'Doanh nghiệp' }

export function QuanLyDonVi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  useBanPhieu()   // phiếu lập trong phiên đổi số chứng từ tạo thủ công
  if (!s.loggedIn) return <Navigate to="/dang-nhap" replace />
  const tab = sp.get('tab') === 'cua-hang' ? 'cua-hang' : 'don-vi'
  const loc = (['da', 'chua'].includes(sp.get('loc') ?? '') ? sp.get('loc') : 'all') as LocGan
  const moTab = (t: 'don-vi' | 'cua-hang', l?: LocGan) => setSp(t === 'cua-hang' ? { tab: t, ...(l && l !== 'all' ? { loc: l } : {}) } : {}, { replace: true })
  const dsDv = dsDonVi(s)
  const tatCa = cuaHangTaiKhoan(s, dsDv.map(d => d.id))
  const soDaGan = tatCa.filter(x => x.dv).length
  const dvMo = donViHienTai(s)
  const viet = s.ten.split(' ').slice(-2).map(x => x[0]).join('')
  const duocSua = s.role === 'owner'

  return (
    <div className="qldv">
      <header className="qldv-dau">
        <Logo cao={30} />
        <span className="qldv-vach" />
        <span className="qldv-tk"><small>Tài khoản FABi</small><b>{s.email}</b></span>
        <span className="grow" />
        <button type="button" className="btn" onClick={() => nav('/app')}><Icon n="chevl" className="ic sm" />Quay lại {dvMo.ten}</button>
        <span className="avatar" title={s.ten}>{viet}</span>
      </header>
      <main className="qldv-than">
        <div className="qldv-tieu-de">
          <div>
            <h1>Quản lý đơn vị kế toán</h1>
            <p className="muted">Tài khoản FABi của {s.ten} · {dsDv.length} đơn vị · {soDaGan} cửa hàng. Mỗi đơn vị có sổ sách, gói dịch vụ riêng.</p>
          </div>
          <span className="grow" />
          <span className={`qldv-quyen${duocSua ? '' : ' xem'}`}><Icon n={duocSua ? 'edit' : 'eye'} className="ic sm" />
            {duocSua ? 'Chủ doanh nghiệp: được sửa' : 'Chỉ xem. Chủ doanh nghiệp (chủ tài khoản FABi) mới được sửa'}</span>
        </div>
        <section className="card qldv-bang">
          <nav className="qldv-tab" aria-label="Nội dung quản lý">
            <button type="button" className={tab === 'don-vi' ? 'on' : ''} aria-current={tab === 'don-vi' ? 'page' : undefined} onClick={() => moTab('don-vi')}>Đơn vị kế toán ({dsDv.length})</button>
            <button type="button" className={tab === 'cua-hang' ? 'on' : ''} aria-current={tab === 'cua-hang' ? 'page' : undefined} onClick={() => moTab('cua-hang')}>Cửa hàng FABi ({tatCa.length})</button>
          </nav>
          {tab === 'don-vi'
            ? <TabDonVi duocSua={duocSua} soChuaGan={tatCa.length - soDaGan} onXemChuaGan={() => moTab('cua-hang', 'chua')}
                onVao={id => { const d = dsDv.find(x => x.id === id)!; set({ donVi: d.id, goi: d.goi, cuaHang: 'all' }); nav('/app') }} />
            : <TabCuaHang duocSua={duocSua} loc={loc} onLoc={l => moTab('cua-hang', l)} />}
        </section>
      </main>
    </div>
  )
}

/** Tab Đơn vị kế toán: bảng đơn vị, nút sửa (xem), Vào làm việc */
function TabDonVi({ duocSua, soChuaGan, onXemChuaGan, onVao }: { duocSua: boolean; soChuaGan: number; onXemChuaGan: () => void; onVao: (id: string) => void }) {
  const { s } = useSession()
  const themDv = useThemDonVi()
  const [tim, setTim] = useState('')
  const [chon, setChon] = useState(s.donVi)
  const [mo, setMo] = useState<string | null>(null)

  const rows: Row[] = useMemo(() => dsDonVi(s).map(d => {
    const ch = cuaHangCuaDv(s, d.id)
    return { id: d.id, mst: d.mst, ten: d.ten, diaChi: d.diaChi, loai: TEN_LOAI[loaiHinhDv(s, d)], goi: d.goi, tenGoi: GOI[d.goi].ten, soCh: ch.length, cuaHang: ch.map(c => c.ten).join(', ') }
  }), [s])
  const list: Row[] = rows.filter(r => !tim.trim() || fold(`${r.mst} ${r.ten} ${r.diaChi} ${r.cuaHang} ${r.tenGoi}`).includes(fold(tim.trim())))
    .map((r, i) => ({ ...r, stt: i + 1 }))

  const cols: Col[] = [
    { k: 'stt', t: '#', c: true, w: 48 },
    { k: 'mst', t: 'Mã số thuế', w: 130, r: r => !r.id ? null : r.mst || <span className="muted">Chưa khai</span> },
    // nhãn nhỏ sau tên, tên dài thì cắt tên, nhãn vẫn hiện
    { k: 'ten', t: 'Tên đơn vị', w: 270, r: r => !r.id ? null : <span className="dsdv-ten"><b title={r.ten}>{r.ten}</b>{r.id === s.donVi && <span className="dsdv-dang">Đang làm việc</span>}</span> },
    { k: 'diaChi', t: 'Địa chỉ', w: 280 },
    // số cửa hàng là nhãn tròn riêng, không lẫn số trong tên cửa hàng
    { k: 'cuaHang', t: 'Danh sách cửa hàng', w: 300, r: r => !r.id ? r.cuaHang : r.soCh
      ? <span className="dsdv-ds-ch" title={r.cuaHang}><span className="dsdv-so-ch" title={`${r.soCh} cửa hàng`}>{r.soCh}</span><span className="dsdv-ten-ch">{r.cuaHang}</span></span>
      : <span className="muted">Chưa có cửa hàng</span> },
    { k: 'loai', t: 'Loại hình', w: 130 },
    { k: 'tenGoi', t: 'Gói dịch vụ', w: 120, r: r => !r.id ? null : <Pk g={r.goi} /> },   // gói đơn vị đang dùng, đổi ở Gói thuê bao
    { k: 'thaoTac', t: 'Thao tác', c: true, w: 170, dinh: 'phai', r: r => !r.id ? null : (
      <span className="dsdv-tt">
        <button type="button" className="btn ghost sm" title={duocSua ? 'Sửa thông tin đơn vị' : 'Xem thông tin đơn vị'} onClick={e => { e.stopPropagation(); setMo(r.id) }}>
          <Icon n={duocSua ? 'edit' : 'eye'} className="ic sm" />
        </button>
        {r.id === s.donVi
          ? <span className="qldv-dang-mo">Đang mở</span>
          : <button type="button" className="btn sm qldv-vao" onClick={e => { e.stopPropagation(); onVao(r.id) }}>Vào làm việc</button>}
      </span>
    ) },
  ]

  return (
    <>
      <div className="ds-toolbar-figma">
        <div className="ds-tim-figma">
          <IconFigmaSearch size={16} />
          <input value={tim} placeholder="MST, tên, địa chỉ, cửa hàng" aria-label="Tìm đơn vị" onChange={e => setTim(e.target.value)} />
        </div>
        <span className="grow" />
        {duocSua && <button type="button" className="btn pri" onClick={themDv}><Icon n="plus" className="ic sm" />Thêm đơn vị kế toán</button>}
      </div>
      {list.length ? (
        <Table cols={cols} rows={list} motDong keDoc onRow={r => setChon(r.id)} onDbl={r => setMo(r.id)}
          rowCls={r => r.id === chon ? 'dang-chon' : ''} sum={{ stt: String(list.length), cuaHang: `${list.reduce((a, r) => a + r.soCh, 0)} cửa hàng` }} />
      ) : (
        <div className="empty" style={{ margin: 'auto' }}>
          <b>Không có đơn vị khớp từ tìm</b>
          <button type="button" className="btn sm" style={{ marginTop: 10 }} onClick={() => setTim('')}>Xoá từ tìm</button>
        </div>
      )}
      <div className="qldv-chan">
        <span>Tổng <b>{list.length}</b> đơn vị</span>
        <span className="grow" />
        {soChuaGan > 0 && <button type="button" className="qldv-canh" onClick={onXemChuaGan}><Icon n="info" className="ic sm" />{soChuaGan} cửa hàng FABi chưa gán · Xem tab Cửa hàng FABi</button>}
      </div>
      {mo && <HopDonVi id={mo} duocSua={duocSua} onDong={() => setMo(null)} />}
    </>
  )
}

/** Hộp xem, sửa một đơn vị: tên, MST, địa chỉ, cửa hàng. Thêm, bớt cửa hàng chỉ đổi trên hộp, bấm Lưu mới áp dụng.
 *  Cửa hàng đã có chứng từ tạo thủ công thì không bớt được (T906) */
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
  const soCt = (c: CuaHangFabi) => goc.some(x => x.id === c.id) ? ctThuCong(s, c, id) : 0

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
    // cửa hàng thêm mới lên sổ từ ngày bắt đầu làm việc của đơn vị (T906)
    const them: CnThem[] = ds.filter(c => !coSan.some(x => x.id === c.id))
      .map(c => cuThem.find(x => x.id === c.id) ?? { id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay: ngayLamViecDv(s, id) })
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
              <Dropdown btnClass="btn sm" align="end" width={300} label={<><Icon n="plus" className="ic sm" />Thêm cửa hàng FABi</>}>
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
            {ds.map(c => {
              const n = soCt(c)
              const moi = !goc.some(x => x.id === c.id)
              return (
                <li key={c.id}>
                  <Icon n="cuahang" className="ic sm" /><span className="grow"><b>{c.ten}</b><small className="muted"> · {c.khuVuc}</small>
                    {moi && <span className="chip dsdv-moi">Mới thêm</span>}</span>
                  {!moi && <small className="muted">{n ? `Đã có ${n} chứng từ tạo thủ công` : 'Chưa có chứng từ tạo thủ công'}</small>}
                  {duocSua && (n
                    ? <span className="qldv-khoa" title="Cửa hàng đã có chứng từ tạo thủ công, không bớt được" aria-label="Không bớt được"><Icon n="lock" className="ic sm" /></span>
                    : <button type="button" className="btn ghost sm" title="Bớt cửa hàng khỏi đơn vị" onClick={() => setDs(x => x.filter(y => y.id !== c.id))}><Icon n="x" className="ic sm" /></button>)}
                </li>
              )
            })}
            {!ds.length && <li className="muted">Chưa có cửa hàng</li>}
          </ul>
          {duocSua
            ? <Note>Chỉ bớt được các cửa hàng chưa có chứng từ phát sinh. Chỉ đếm chứng từ tạo thủ công, không đếm chứng từ tự sinh từ POS, FABi. Cửa hàng bớt ra về danh sách chưa gán.</Note>
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
