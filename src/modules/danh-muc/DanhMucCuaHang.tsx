// Danh mục cửa hàng (T142): cửa hàng của đơn vị và cửa hàng lên sổ thêm từ cửa hàng FABi.
// Thêm cửa hàng từ FABi: chỉ chọn cửa hàng chưa dùng kế toán, lên sổ từ ngày bắt đầu năm tài chính của đơn vị, có thể mở ngay màn Số dư ban đầu để khai quỹ tiền của cửa hàng mới.
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { congTyCn, donViHienTai, dsDonVi, ngayDauNam, useSession, type CnThem, type Session } from '../../app/session'
import { CUA_HANG, DON_VI, khoaSoDenCua, type KyKhoa } from '../../data/mock'
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
import { useDongEsc } from '../../ui/LocNangCao'
import { ThongBao } from '../../ui/ThongBao'
import { batDongBoThuChi, datDongBoThuChi, phieuThuChiFabi } from '../tien/dong-bo-fabi'
import { DI_DOI_CACH_NVL } from '../home/chi-phi-nvl'
import { ODinhMuc, dinhMucCh, datDinhMucCh } from './dinh-muc-cua-hang'

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
  ].filter(r => !daRoiCty(s, String(r.id))), [coSan, them, standard, s.cnCongTy, s.donVi])   // eslint-disable-line react-hooks/exhaustive-deps

  const colsGoc: Col[] = useMemo(() => [
    { k: 'ma', t: 'Mã', cls: 'code', w: 100 },
    { k: 'posId', t: 'POS ID', cls: 'code' },
    { k: 'ten', t: 'Tên cửa hàng', w: 220, r: r => <>
      <button type="button" className="ds-link-so" title="Xem chi tiết cửa hàng" onClick={e => { e.stopPropagation(); setXem(r) }}>{r.ten}</button>
      {r.moi && <span className="chip info" style={{ marginLeft: 8 }}>Mới lên sổ</span>}</> },
    // Công ty của cửa hàng: tên, MST của đơn vị đang mở (T285), hoặc công ty chọn lại ở hộp chi tiết (T711)
    { k: 'cty', t: 'Công ty', w: 300, r: (r: Row) => {
      const c = congTyCn(s, String(r.id)); return <span className="dmcn-cty"><span>{c.ten}</span>{c.mst && <small>MST {c.mst}</small>}</span> } },
    { k: 'kv', t: 'Khu vực', cls: 'dim' },
    { k: 'kho', t: 'Kho', cls: 'dim', r: r => <>{r.kho}{standard && <span className="chip" style={{ marginLeft: 8 }}>Mặc định</span>}</> },
    { k: 'nguon', t: 'Nguồn', cls: 'dim' },
    // Cách tính chi phí NVL chung cả công ty, chọn ở Thông tin đơn vị, không còn theo cửa hàng (T767)
    // Định mức theo cửa hàng, nhập % ngay tại bảng (T938)
    // Chỉ gói Plus, Pro
    ...(s.goi !== 'S' ? [
      { k: 'dmNvl', t: 'Định mức chi phí NVL (%)', w: 190, r: (r: Row) => <ODinhMuc cn={String(r.id)} ten={String(r.ten)} k="nvl" /> },
      { k: 'dmHaoHut', t: 'Định mức hao hụt (%)', w: 170, r: (r: Row) => <ODinhMuc cn={String(r.id)} ten={String(r.ten)} k="haoHut" /> },
    ] : []),
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
        Phương pháp tính chi phí NVL dùng chung cả công ty, đổi ở <Link to={DI_DOI_CACH_NVL}>Thông tin đơn vị</Link>.</Note>}
      {cho.length > 0 && <Note kind="warn" icon="alert">{cho.length} phiếu thu, chi từ FABi đang chờ vì phương thức thanh toán chưa map quỹ
        ({[...new Set(cho.map(x => `${x.pttt} · ${x.cn}`))].join('; ')}). <Link to="/app/danh-muc/1-12">Map ở Danh mục Quỹ tiền</Link></Note>}
      <section className="card dm-bang">
        <Table cols={cot.colsHien} doRong={cot.doRong} rows={rowsTrang} />
        <PhanTrang tong={rowsLoc.length} trang={trangHt} coTrang={coTrang} dsCoTrang={CO_TRANG_DM}
          onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
      </section>
      {mo && <HopThemCuaHang onDong={() => setMo(false)} onLenSo={lenSo} />}
      {xem && <HopChiTietCn r={xem} onDong={() => setXem(null)} onDoiCty={(cn, ten, cty) => setDoiCty({ cn, ten, cty })} />}
      {doiCty && <HopDoiCty x={doiCty} onDong={() => setDoiCty(null)} onXong={() => { setDoiCty(null); setXem(null) }} />}
    </div>
  )
}

/** Cửa hàng đã xoá khỏi công ty (lưu '') hoặc chuyển sang công ty khác: không còn trong danh mục của đơn vị đang mở (T946) */
const daRoiCty = (s: Session, cn: string) => { const v = s.cnCongTy?.[s.donVi]?.[cn]; return v !== undefined && v !== s.donVi }

/** Cửa hàng mẫu đã khoá sổ kỳ nào từ ngày bắt đầu năm tài chính thì chưa xoá, chuyển được (T946).
 *  Cửa hàng mới lên sổ chưa có kỳ khoá */
const khoaSoCn = (s: Session, cn: string): KyKhoa | null => {
  if (!CUA_HANG.some(c => c.id === cn)) return null
  const k = khoaSoDenCua(cn)
  const [, m, y] = ngayDauNam(s).split('/').map(Number)
  return k.nam * 100 + k.thang >= y * 100 + m ? k : null
}

/** Hỏi xác nhận xoá cửa hàng khỏi công ty (cty rỗng) hoặc chuyển sang công ty khác (T946).
 *  Cả hai luôn xoá mọi chứng từ đã phát sinh của cửa hàng ở công ty cũ, không có ô tích chọn (bản mẫu chỉ báo, chưa xoá thật). */
function HopDoiCty({ x, onDong, onXong }: { x: { cn: string; ten: string; cty: string }; onDong: () => void; onXong: () => void }) {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const cu = congTyCn(s, x.cn)
  const moi = x.cty ? dsDonVi(s).find(d => d.id === x.cty) : undefined
  const xoa = !x.cty
  const khoa = khoaSoCn(s, x.cn)
  if (khoa) return (
    <ThongBao loai="chan" nhan={xoa ? 'Không xoá được' : 'Không chuyển được'}
      tieuDe="Cửa hàng đã khoá sổ"
      moTa={<><b>{x.ten}</b> đã khoá sổ đến tháng {khoa.thang}/{khoa.nam}. Xoá hay chuyển công ty sẽ xoá chứng từ trong kỳ đã khoá, nên chưa làm được.</>}
      buoc={['Mở khoá sổ các kỳ của cửa hàng ở Khoá sổ kế toán.', `Quay lại đây ${xoa ? 'xoá cửa hàng khỏi công ty' : 'chuyển công ty'}.`]}
      nut={{ ten: 'Mở Khoá sổ kế toán', onClick: () => { onXong(); nav('/app/tong-hop/10-1-6') } }}
      onDong={onDong} />
  )
  const xacNhan = () => {
    set({ cnCongTy: { ...s.cnCongTy, [s.donVi]: { ...s.cnCongTy?.[s.donVi], [x.cn]: x.cty } } })
    onXong()
    toast((xoa ? `Đã xoá ${x.ten} khỏi ${cu.ten}.` : `Đã chuyển ${x.ten} sang ${moi?.ten}.`) + ` Đã xoá chứng từ của cửa hàng ở ${cu.ten}.`)
  }
  return (
    <ThongBao loai={xoa ? 'xoa' : 'canhBao'} nhan={xoa ? 'Xoá khỏi công ty' : 'Chuyển công ty'}
      tieuDe={xoa ? 'Xoá cửa hàng khỏi công ty?' : 'Chuyển sang công ty khác?'}
      moTa={xoa ? <>Cửa hàng <b>{x.ten}</b> sẽ không còn thuộc <b>{cu.ten}</b>.</> : <>Cửa hàng <b>{x.ten}</b></>}
      duKien={xoa ? undefined : [{ nhan: 'Từ', gt: cu.ten }, { nhan: 'Sang', gt: moi?.ten ?? '' }]}
      onDong={onDong}
      nut={{ ten: xoa ? 'Xoá cửa hàng và dữ liệu' : 'Chuyển và xoá dữ liệu', onClick: xacNhan }}>
      <ul className="dmcn-hq">
        <li className="dmcn-hq-do">Mọi chứng từ đã phát sinh của {x.ten} ở {cu.ten} sẽ bị xoá vĩnh viễn, không khôi phục được.</li>
        {xoa ? <>
          <li>Từ nay không nhập thêm phát sinh cho cửa hàng này được nữa.</li>
          <li>Thu chi FABi của cửa hàng ngừng đồng bộ.</li>
        </> : <>
          <li>Phát sinh mới của cửa hàng ghi vào {moi?.ten}.</li>
          <li>Thu chi FABi đồng bộ về công ty mới từ lúc chuyển.</li>
        </>}
      </ul>
    </ThongBao>
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
  const ctyGoc = dv.id
  // Công ty chọn nháp trong hộp: undefined là chưa đổi, '' là bỏ trống (T946)
  const [ctyNhap, setCtyNhap] = useState<string | undefined>(undefined)
  const ctyHien = ctyNhap ?? ctyGoc
  const doiCtyNhap = ctyHien !== ctyGoc
  const bat = batDongBoThuChi(s, id)
  // Định mức nhập nháp trong hộp, bấm Lưu mới ghi (T938)
  const [dm, setDm] = useState({ nvl: String(dinhMucCh(s, id, 'nvl') ?? ''), haoHut: String(dinhMucCh(s, id, 'haoHut') ?? '') })
  const coDm = s.goi !== 'S'   // định mức chỉ có ở gói Plus, Pro
  const doiDm = coDm && (dm.nvl !== String(dinhMucCh(s, id, 'nvl') ?? '') || dm.haoHut !== String(dinhMucCh(s, id, 'haoHut') ?? ''))
  // Lưu: ghi định mức; công ty đổi thì hỏi xác nhận, xong thì đóng hộp vì cửa hàng rời danh mục (T946)
  const luu = () => {
    let vua: Partial<Session> = {}
    if (doiDm) {
      const so = (t: string) => { const x = t.trim().replace(',', '.'); return x === '' ? undefined : Number(x) }
      const a = so(dm.nvl), b = so(dm.haoHut)
      const sai = (v: number | undefined) => v !== undefined && (!Number.isFinite(v) || v < 0 || v > 100)
      if (sai(a) || sai(b)) { toast('Định mức phải từ 0 đến 100%'); return }
      const p1 = datDinhMucCh(s, id, 'nvl', a)
      vua = { ...p1, ...datDinhMucCh({ ...s, ...p1 }, id, 'haoHut', b) }
    }
    if (doiDm) { set(vua); toast(`Đã lưu định mức của ${r.ten}`) }
    if (doiCtyNhap) { onDoiCty(id, String(r.ten), ctyHien); return }
    onDong()
  }
  const dong: [string, React.ReactNode][] = [
    ['Mã', <span className="code">{r.ma}</span>],
    ['POS ID', <span className="code">{r.posId}</span>],
    ['Tên cửa hàng', r.ten],
    // Nút X bỏ trống công ty, chọn công ty khác là chuyển. Chỉ là nháp, bấm Lưu mới hỏi xác nhận ở HopDoiCty (T946).
    ['Công ty', (
      <span className="dmcn-cty-o">
        <Select className="inp dmcn-nvl" value={ctyHien} aria-label={`Công ty của ${r.ten}`}
          ds={[...(ctyHien === '' ? [{ v: '', t: '— Chưa thuộc công ty nào —' }] : []), ...dsDonVi(s).map(d => ({ v: d.id, t: d.ten }))]}
          onChange={e => { if (e.target.value) setCtyNhap(e.target.value) }} />
        {ctyHien !== '' && <button type="button" className="dmcn-cty-x" title="Bỏ trống công ty (xoá cửa hàng khỏi công ty)" aria-label={`Bỏ trống công ty của ${r.ten}`}
          onClick={() => setCtyNhap('')}><Icon n="x" className="ic sm" /></button>}
      </span>
    )],
    ['Mã số thuế', dv.mst ? <span className="code">{dv.mst}</span> : '—'],
    ['Khu vực', r.kv],
    ['Kho', r.kho],
    ['Nguồn', r.nguon],
    ...(coDm ? [
      ['Định mức chi phí NVL', <span className="dmcn-dm"><input className="inp" inputMode="decimal" placeholder="Chưa đặt" aria-label="Định mức chi phí NVL (%)"
        value={dm.nvl} onChange={e => setDm(x => ({ ...x, nvl: e.target.value }))} /><small>%</small></span>],
      ['Định mức hao hụt', <span className="dmcn-dm"><input className="inp" inputMode="decimal" placeholder="Chưa đặt" aria-label="Định mức hao hụt (%)"
        value={dm.haoHut} onChange={e => setDm(x => ({ ...x, haoHut: e.target.value }))} /><small>%</small></span>],
    ] as [string, React.ReactNode][] : []),
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
        <div className="ds-chan"><button type="button" className="btn" onClick={onDong}>{doiDm || doiCtyNhap ? 'Huỷ' : 'Đóng'}</button>
          <button type="button" className="btn pri" disabled={!doiDm && !doiCtyNhap} onClick={luu}>Lưu</button></div>
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
