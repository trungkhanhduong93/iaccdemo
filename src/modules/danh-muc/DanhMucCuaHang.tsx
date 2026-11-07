// Danh mục cửa hàng (T142): cửa hàng của đơn vị và cửa hàng lên sổ thêm từ cửa hàng FABi.
// Thêm cửa hàng từ FABi: chỉ chọn cửa hàng chưa dùng kế toán, lên sổ từ ngày bắt đầu năm tài chính của đơn vị, có thể mở ngay màn Số dư ban đầu để khai quỹ tiền của cửa hàng mới.
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { congTyCn, donViHienTai, dsDonVi, ngayDauNam, useSession, type CnThem, type Session } from '../../app/session'
import { CUA_HANG, DON_VI } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { NutTuyChinhCot, useCotDs, BoLoc, useLocNhap, useCauHinhLoc, type OLocDef } from '../../ui/LocNangCao'
import { NutDongBo } from '../../ui/CongCuDs'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { fold } from '../../ui/format'
import { cuaHangChuaDung } from '../onboarding/cua-hang-fabi'
import { DsCuaHang } from '../onboarding/OnboardFabi'
import { Select } from '../../ui/Dropdown'
import { HopXacNhan, useDongEsc } from '../../ui/LocNangCao'
import { batDongBoThuChi, datDongBoThuChi, phieuThuChiFabi } from '../tien/dong-bo-fabi'
import { DI_DOI_CACH_NVL } from '../home/chi-phi-nvl'

/** Cột luôn hiện, không ẩn được ở Tuỳ chỉnh cột (T148) */
const COT_CO_DINH = new Set(['ma', 'ten'])

export function DanhMucCuaHang({ sc, mod }: ScreenProps) {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const [q] = useSearchParams()
  const [mo, setMo] = useState(q.get('them') === '1')
  const [xem, setXem] = useState<Row | null>(null)   // hộp chi tiết cửa hàng (T285)
  const [doiCty, setDoiCty] = useState<{ cn: string; ten: string; cty: string } | null>(null)   // chọn lại công ty, chờ xác nhận (T711)
  const dv = donViHienTai(s)   // cửa hàng thuộc công ty của đơn vị đang mở (T285)
  const them = s.cnThem?.[s.donVi] ?? []
  // đơn vị mẫu có sẵn cửa hàng mẫu; đơn vị mới tạo từ FABi chỉ có cửa hàng đã lên sổ
  const coSan = DON_VI.some(d => d.id === s.donVi)
  // Gói Free: mỗi cửa hàng tự có một kho mặc định, lấy kho đầu tiên của cửa hàng trên iPOS Inventory (T143)
  const standard = s.goi === 'S' || s.goi === 'PL'   // gói Standard, Plus: dữ liệu mẫu một kho mỗi cửa hàng
  const khoCua = (id: string, ten: string) => CUA_HANG.find(c => c.id === id)?.kho ?? [`Kho ${ten.replace(/^Phố Mây /, '')}`]
  const kho = (id: string, ten: string) => standard ? khoCua(id, ten)[0] : khoCua(id, ten).join(', ')
  const rows: Row[] = useMemo(() => [
    ...(coSan ? CUA_HANG.map(c => ({ id: c.id, ma: c.id.toUpperCase(), posId: c.posId, ten: c.ten, kv: 'TP.HCM', kho: kho(c.id, c.ten), nguon: 'FABi' })) : []),
    ...them.map((c, i) => ({ id: c.id, ma: c.id.toUpperCase(), posId: `2000${i + 1}`, ten: c.ten, kv: c.khuVuc, kho: kho(c.id, c.ten), nguon: 'FABi', moi: !c.banDau })),
  ], [coSan, them, standard])   // eslint-disable-line react-hooks/exhaustive-deps

  const colsGoc: Col[] = useMemo(() => [
    { k: 'ma', t: 'Mã', cls: 'code', w: 100 },
    { k: 'posId', t: 'POS ID', cls: 'code' },
    { k: 'ten', t: 'Tên cửa hàng', w: 220, r: r => <>
      <button type="button" className="ds-link-so" title="Xem chi tiết cửa hàng" onClick={e => { e.stopPropagation(); setXem(r) }}>{r.ten}</button>
      {r.moi && <span className="chip info" style={{ marginLeft: 8 }}>Mới lên sổ</span>}</> },
    // Công ty của cửa hàng: tên, MST của đơn vị đang mở (T285), hoặc công ty chọn lại ở hộp chi tiết (T711)
    { k: 'cty', t: 'Công ty', w: 300, r: (r: Row) => { const c = congTyCn(s, String(r.id)); return <span className="dmcn-cty"><span>{c.ten}</span>{c.mst && <small>MST {c.mst}</small>}</span> } },
    { k: 'kv', t: 'Khu vực', cls: 'dim' },
    { k: 'kho', t: 'Kho', cls: 'dim', r: r => <>{r.kho}{standard && <span className="chip" style={{ marginLeft: 8 }}>Mặc định</span>}</> },
    { k: 'nguon', t: 'Nguồn', cls: 'dim' },
    // Cách tính giá vốn NVL chung cả công ty, chọn ở Thông tin đơn vị, không còn theo cửa hàng (T767)
    // Mọi gói: bật, tắt tự động đồng bộ phiếu thu, chi lập trên FABi theo cửa hàng, (T264)
    { k: 'dongBo', t: 'Đồng bộ thu chi FABi', w: 210, r: (r: Row) => {
      const bat = batDongBoThuChi(s, String(r.id))
      return (
        <span className="dmcn-db">
          <button type="button" role="switch" aria-checked={bat} aria-label={`Tự động đồng bộ thu chi FABi ${r.ten}`} className={`ds-ct${bat ? ' on' : ''}`}
            onClick={e => { e.stopPropagation(); set(datDongBoThuChi(s, String(r.id), !bat)); toast(`${bat ? 'Đã tắt' : 'Đã bật'} đồng bộ thu chi từ FABi cho ${r.ten}`) }}><i /></button>
          <small>{bat ? 'Tự động' : 'Không đồng bộ'}</small>
        </span>
      )
    } },
  ], [standard, s, dv])   // eslint-disable-line react-hooks/exhaustive-deps
  // Phiếu thu, chi FABi của cửa hàng đang bật mà PTTT chưa map quỹ: chờ, không vào sổ (T264)
  const cho = phieuThuChiFabi(s).cho

  const cot = useCotDs('/danh-muc/cua-hang', colsGoc, COT_CO_DINH)

  // Hàng lọc danh mục cửa hàng (T511): Tìm kiếm + ô dữ liệu lặp ít (Khu vực, Nguồn)
  const loc0 = useLocNhap(() => ({
    tim: '',
    kv: '',
    nguon: '',
  }))
  const { nhap, ap, dat } = loc0
  const apLoc = () => { loc0.loc(); setTrang(1) }

  const dsKv = useMemo(() => [...new Set(rows.map(r => String(r.kv ?? '')).filter(Boolean))].sort(), [rows])
  const dsNguon = useMemo(() => [...new Set(rows.map(r => String(r.nguon ?? '')).filter(Boolean))].sort(), [rows])

  const oLoc: OLocDef[] = useMemo(() => [
    {
      k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()),
      o: <input className="ds-o-inp" value={nhap.tim} placeholder="Tìm theo mã, tên, POS ID" onChange={e => dat('tim', e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />,
    },
    ...(dsKv.length > 0 ? [{
      k: 'kv', ten: 'Khu vực', coGiaTri: Boolean(nhap.kv),
      o: (
        <Select className="ds-o-sel" value={nhap.kv} aria-label="Khu vực" onChange={e => dat('kv', e.target.value)}>
          <option value="">Tất cả</option>
          {dsKv.map(v => <option key={v} value={v}>{v}</option>)}
        </Select>
      ),
    }] : []),
    ...(dsNguon.length > 0 ? [{
      k: 'nguon', ten: 'Nguồn', coGiaTri: Boolean(nhap.nguon),
      o: (
        <Select className="ds-o-sel" value={nhap.nguon} aria-label="Nguồn" onChange={e => dat('nguon', e.target.value)}>
          <option value="">Tất cả</option>
          {dsNguon.map(v => <option key={v} value={v}>{v}</option>)}
        </Select>
      ),
    }] : []),
  ], [nhap, dsKv, dsNguon, dat])

  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc('/danh-muc/cua-hang', oLoc.map(o => o.k), ['tim', ...(dsKv.length > 0 ? ['kv'] : [])])

  const rowsLoc = useMemo(() => {
    return rows.filter(r => {
      if (ap.tim.trim() && !fold(`${r.ma} ${r.posId} ${r.ten} ${r.kho} ${r.kv}`).includes(fold(ap.tim.trim()))) return false
      if (ap.kv && r.kv !== ap.kv) return false
      if (ap.nguon && r.nguon !== ap.nguon) return false
      return true
    })
  }, [rows, ap])

  // Phân trang như danh mục khác: mặc định 50 dòng/trang (T153)
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const trangHt = Math.min(trang, Math.max(1, Math.ceil(rowsLoc.length / coTrang)))
  const rowsTrang = rowsLoc.slice((trangHt - 1) * coTrang, trangHt * coTrang)

  const lenSo = (ds: CnThem[], khaiSoDu: boolean, caiDat: Partial<Session>) => {
    set({ cnThem: { ...s.cnThem, [s.donVi]: [...them, ...ds] }, ...caiDat })   // cấu hình đồng bộ thu chi chọn lúc thêm (T264)
    setMo(false)
    toast(`Đã lên sổ ${ds.length} cửa hàng từ FABi`)
    if (khaiSoDu) nav(s.goi === 'S' ? '/app/danh-muc/1-12' : `/app/tong-hop/10-1-3?cnMoi=${ds.map(c => c.id).join(',')}`)   // gói Standard khai số dư ở Danh mục Quỹ tiền (T245)
  }

  return (
    <div className="page page-voucher page-dm">
      <PageHead
        crumb={[mod.ten]}
        title={
          <BoLoc
            ds={oLoc}
            cauHinh={cauHinhLoc}
            datCauHinh={datCauHinhLoc}
            dangLoc={loc0.dangLoc}
            khacNhap={loc0.khacNhap}
            onLoc={apLoc}
            onXoaHet={loc0.xoaNhap}
            chiNutPheu
            ngoaiRieng={{
              tim: (
                <div key="tim" className="ds-tim-figma">
                  <IconFigmaSearch size={16} />
                  <input
                    value={nhap.tim}
                    placeholder="Tìm theo mã, tên, POS ID"
                    title="Tìm theo mã, tên, POS ID"
                    aria-label="Tìm kiếm"
                    onChange={e => dat('tim', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') apLoc()
                    }}
                  />
                </div>
              ),
            }}
          />
        }
      >
        <NutDongBo ten="FABi" onDongBo={() => setMo(true)} />
      </PageHead>
      <div className="ds-hang-trang-thai">
        <div className="ds-toolbar-phai ds-cong-cu-h2">
          <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
            onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
        </div>
      </div>
      {s.goi === 'S' && <Note icon="info">Gói Standard: mỗi cửa hàng tự có một kho mặc định theo iPOS Inventory, không cần khai báo kho.
        Phương pháp giá vốn NVL dùng chung cả công ty, đổi ở <Link to={DI_DOI_CACH_NVL}>Thông tin đơn vị</Link>.</Note>}
      {cho.length > 0 && <Note kind="warn" icon="alert">{cho.length} phiếu thu, chi từ FABi đang chờ vì phương thức thanh toán chưa map quỹ
        ({[...new Set(cho.map(x => `${x.pttt} · ${x.cn}`))].join('; ')}). <Link to="/app/danh-muc/1-12">Map ở Danh mục Quỹ tiền</Link></Note>}
      <section className="card dm-bang">
        <Table cols={cot.colsHien} doRong={cot.doRong} rows={rowsTrang} />
        <PhanTrang tong={rowsLoc.length} trang={trangHt} coTrang={coTrang} dsCoTrang={CO_TRANG_DM}
          onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
      </section>
      {mo && <HopThemCuaHang onDong={() => setMo(false)} onLenSo={lenSo} />}
      {xem && <HopChiTietCn r={xem} onDong={() => setXem(null)} onDoiCty={(cn, ten, cty) => setDoiCty({ cn, ten, cty })} />}
      {doiCty && (() => {
        const cu = congTyCn(s, doiCty.cn)
        const moi = dsDonVi(s).find(d => d.id === doiCty.cty) ?? cu
        return (
          <HopXacNhan tieuDe="Chọn lại công ty của cửa hàng" nut="Chuyển sang công ty mới" onDong={() => setDoiCty(null)} onDongY={() => {
            set({ cnCongTy: { ...s.cnCongTy, [s.donVi]: { ...s.cnCongTy?.[s.donVi], [doiCty.cn]: doiCty.cty } } })
            setDoiCty(null)
            toast(`Đã chuyển ${doiCty.ten} sang ${moi.ten}`)
          }}>
            Toàn bộ số liệu của cửa hàng {doiCty.ten} (chứng từ, sổ sách, số dư, báo cáo) sẽ chuyển từ {cu.ten} sang {moi.ten}.
            Sau khi chuyển, {cu.ten} không còn số liệu của cửa hàng này. Bạn có chắc muốn chuyển?
          </HopXacNhan>
        )
      })()}
    </div>
  )
}

/** Hộp chi tiết một cửa hàng, gồm công ty (tên, MST) của đơn vị đang mở (T285).
 *  Đồng bộ thu chi FABi sửa ngay trong hộp như cột của bảng (T321).
 *  Công ty chọn lại được; chọn công ty khác thì hỏi xác nhận vì số liệu cả cửa hàng chuyển theo (T711) */
function HopChiTietCn({ r, onDong, onDoiCty }: { r: Row; onDong: () => void; onDoiCty: (cn: string, ten: string, cty: string) => void }) {
  const { s, set, toast } = useSession()
  useDongEsc(onDong)
  const id = String(r.id)
  const dv = congTyCn(s, id)
  const bat = batDongBoThuChi(s, id)
  const dong: [string, React.ReactNode][] = [
    ['Mã', <span className="code">{r.ma}</span>],
    ['POS ID', <span className="code">{r.posId}</span>],
    ['Tên cửa hàng', r.ten],
    ['Công ty', (
      <Select className="inp dmcn-nvl" value={dv.id} ds={dsDonVi(s).map(d => ({ v: d.id, t: d.ten }))} aria-label={`Công ty của ${r.ten}`}
        onChange={e => { if (e.target.value !== dv.id) onDoiCty(id, String(r.ten), e.target.value) }} />
    )],
    ['Mã số thuế', dv.mst ? <span className="code">{dv.mst}</span> : '—'],
    ['Khu vực', r.kv],
    ['Kho', r.kho],
    ['Nguồn', r.nguon],
    ['Đồng bộ thu chi FABi', (
      <span className="dmcn-db">
        <button type="button" role="switch" aria-checked={bat} aria-label={`Tự động đồng bộ thu chi FABi ${r.ten}`} className={`ds-ct${bat ? ' on' : ''}`}
          onClick={() => { set(datDongBoThuChi(s, id, !bat)); toast(`${bat ? 'Đã tắt' : 'Đã bật'} đồng bộ thu chi từ FABi cho ${r.ten}`) }}><i /></button>
        <small>{bat ? 'Tự động' : 'Không đồng bộ'}</small>
      </span>
    )],
  ]
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop dmcn-hop-ct" role="dialog" aria-modal="true" aria-label={`Chi tiết ${r.ten}`}>
        <div className="ds-hop-dau"><b>Chi tiết cửa hàng</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button></div>
        <dl className="dmcn-ct">
          {dong.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <div className="ds-chan"><button type="button" className="btn" onClick={onDong}>Đóng</button></div>
      </div>
    </div>,
    document.body,
  )
}

/** Hộp chọn cửa hàng FABi chưa dùng kế toán để lên sổ thành cửa hàng */
export function HopThemCuaHang({ onDong, onLenSo }: { onDong: () => void; onLenSo: (ds: CnThem[], khaiSoDu: boolean, caiDat: Partial<Session>) => void }) {
  const { s } = useSession()
  const ds = cuaHangChuaDung(s)
  const [chon, setChon] = useState<string[]>(() => ds.map(c => c.id))
  // Cấu hình từng cửa hàng chọn ngay lúc thêm, như cột ở Danh mục cửa hàng (T264): đồng bộ thu chi FABi
  const [cauHinh, setCauHinh] = useState<Record<string, { dongBo: boolean }>>({})
  const chCua = (id: string) => cauHinh[id] ?? { dongBo: true }
  const doiCh = (id: string, p: Partial<{ dongBo: boolean }>) => setCauHinh(x => ({ ...x, [id]: { ...chCua(id), ...p } }))
  // Gộp cấu hình đã chọn thành phần phiên cần lưu khi lên sổ
  const caiDat = () => chon.reduce<Partial<Session>>((p, id) => {
    const ch = chCua(id)
    return { ...p, ...datDongBoThuChi({ ...s, ...p }, id, ch.dongBo) }
  }, {})
  const tuNgay = ngayDauNam(s)   // cửa hàng mới lên sổ từ ngày bắt đầu năm tài chính của đơn vị
  const [khaiSoDu, setKhaiSoDu] = useState(true)
  const ok = chon.length > 0
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop dmcn-hop" role="dialog" aria-modal="true" aria-label="Thêm cửa hàng từ FABi">
        <div className="ds-hop-dau"><b>Thêm cửa hàng từ FABi</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button></div>
        <div className="dmcn-than">
          {ds.length ? <>
            <p className="muted">Chỉ hiện cửa hàng FABi chưa dùng kế toán ở đơn vị nào. Tích cửa hàng muốn lên sổ.</p>
            <DsCuaHang ds={ds} chon={chon} chinh="" doi={moi => setChon(moi)} coChinh={false} />
            {chon.length > 0 && (
              <div className="dmcn-ch">
                <div className="dmcn-ch-dau">Cấu hình cửa hàng lên sổ</div>
                <div className="dmcn-ch-dong dmcn-ch-tieu"><span>Cửa hàng</span><span>Đồng bộ thu chi FABi</span></div>
                {ds.filter(c => chon.includes(c.id)).map(c => {
                  const ch = chCua(c.id)
                  return (
                    <div key={c.id} className="dmcn-ch-dong">
                      <span className="dmcn-ch-ten">{c.ten}</span>
                      <span className="dmcn-db">
                        <button type="button" role="switch" aria-checked={ch.dongBo} aria-label={`Tự động đồng bộ thu chi FABi ${c.ten}`} className={`ds-ct${ch.dongBo ? ' on' : ''}`}
                          onClick={() => doiCh(c.id, { dongBo: !ch.dongBo })}><i /></button>
                        <small>{ch.dongBo ? 'Tự động' : 'Không đồng bộ'}</small>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
            <label className="row dmcn-tich"><input type="checkbox" className="bat-tat" checked={khaiSoDu} onChange={e => setKhaiSoDu(e.target.checked)} />
              <span>Khai số dư ban đầu cho cửa hàng mới ngay sau khi lên sổ</span></label>
          </> : <Note kind="ok" icon="check">Mọi cửa hàng trên FABi đã lên sổ kế toán.</Note>}
        </div>
        <div className="ds-chan">
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          {ds.length > 0 && <button type="button" className="btn pri" disabled={!ok}
            onClick={() => onLenSo(ds.filter(c => chon.includes(c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay })), khaiSoDu, caiDat())}>
            Lên sổ {chon.length} cửa hàng</button>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
