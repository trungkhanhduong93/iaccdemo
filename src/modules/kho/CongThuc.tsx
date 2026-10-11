// Công thức chế biến (9.1.3) và công thức sơ chế (5.1.5) theo iPOS Inventory (T152).
// Danh sách gộp ô: mỗi nguyên vật liệu một dòng con trong cột Công thức, các cột khác gộp theo công thức; cột Trạng thái là công tắc.
// Form chi tiết: Thông tin chung và bảng nguyên vật liệu thành phần (chế biến) hoặc nguyên vật liệu đích (sơ chế)
import { Fragment, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { HANG, HANG_SX, KHO, NVL } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { ChonKhoangNgay, ONgay, docNgay, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { BoLoc, ChipTrangThai, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type Chip, type OLocDef } from '../../ui/LocNangCao'
import { money } from '../../ui/format'
import { suaPhieu, themPhieu, useDaXoa } from '../../ui/generic/daXoa'
import { DaiGiaiThich } from './PhieuSanXuat'
import {
  CONG_THUC_CB, CONG_THUC_SC, TT_CONG_THUC, hangCua, soLuong, tenKhoAd, tron3, apDungKho,
  type CongThucCb, type CongThucSc, type NvlCongThuc, type TtCongThuc,
} from './san-xuat'

type LoaiCt = 'cb' | 'sc'
const MAN: Record<LoaiCt, string> = { cb: 'kho/9-1-3', sc: 'kho/5-1-5' }
const KENH = ['Tại quán', 'Mang về', 'GrabFood', 'ShopeeFood']
const KHO_BEP = KHO.filter(k => k !== 'Kho tổng')
/** Hàng làm thành phẩm của công thức chế biến: món và bán thành phẩm; nguyên vật liệu chọn trong NVL và hàng sơ chế */
const DS_SP = [...HANG.filter(h => !h.tonKho), ...HANG_SX.filter(h => h.nhom === 'Bán thành phẩm' || h.nhom.startsWith('Món'))]
const DS_NVL = [...NVL, ...HANG_SX.filter(h => !h.nhom.startsWith('Món'))]
const mucHang = (ds: { ma: string; ten: string }[]) => ds.map(h => ({ v: h.ma, t: `${h.ten} - ${h.ma}` }))

/** Công thức của màn: mẫu, công thức lưu trong phiên, áp nội dung đã sửa (bật tắt, sửa form) */
function useDsCongThuc(loai: LoaiCt): Row[] {
  const { phieuMoi, apSua } = useDaXoa(MAN[loai])
  const [mau] = useState<Row[]>(() => (loai === 'cb' ? CONG_THUC_CB : CONG_THUC_SC).map(c => ({ ...c })))
  return [...phieuMoi, ...mau].map(apSua)
}

const nvlCua = (c: Row): NvlCongThuc[] => (c.nvl ?? c.dich ?? []) as NvlCongThuc[]
/** Tên hiện kiểu IVT: tên, mã mờ phía sau */
const TenMa = ({ ma }: { ma: string }) => <span className="sx-ten">{hangCua(ma)?.ten ?? ma}<small> - {ma}</small></span>

export function CongThucScreen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loai: LoaiCt = sc.slug === '5-1-5' ? 'sc' : 'cb'
  const ds = useDsCongThuc(loai)
  if (id !== undefined) return <FormCongThuc key={id} sc={sc} mod={mod} loai={loai} ct={id === 'moi' ? undefined : ds.find(c => c.id === id)} soCt={ds.length} />
  return <DsCongThuc sc={sc} mod={mod} loai={loai} ds={ds} />
}

// ── Danh sách ──

interface GtLoc { ngay: KhoangNgay; sp: string; nvl: string; kho: string }
const locMacDinh = (): GtLoc => ({ ngay: { tu: new Date(2026, 0, 1), den: new Date(2026, 11, 31) }, sp: '', nvl: '', kho: '' })
const COT_CO_DINH = new Set(['stt'])

function DsCongThuc({ sc, mod, loai, ds }: ScreenProps & { loai: LoaiCt; ds: Row[] }) {
  const { toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cb = loai === 'cb'
  const khoaSp = cb ? 'spMa' : 'gocMa'
  const [chip, setChip] = useState<string>('on')
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const nhanSp = cb ? 'Sản phẩm' : 'Nguyên vật liệu gốc'
  const nhanNvl = cb ? 'Nguyên vật liệu' : 'Nguyên vật liệu đích'

  const dsSp = [...new Set(ds.map(c => String(c[khoaSp])))].map(ma => ({ v: ma, t: `${hangCua(ma)?.ten ?? ma} - ${ma}` }))
  const dsNvl = [...new Set(ds.flatMap(c => nvlCua(c).map(n => n.ma)))].map(ma => ({ v: ma, t: `${hangCua(ma)?.ten ?? ma} - ${ma}` }))
  const chonO = (k: 'sp' | 'nvl' | 'kho', ten: string, mucs: { v: string; t: string }[]) => (
    <Select className="ds-o-sel" value={nhap[k]} aria-label={ten} onChange={e => dat(k, e.target.value)} ds={[{ v: '', t: 'Tất cả' }, ...mucs]} />
  )
  const apLoc = () => { loc0.loc(); setTrang(1) }
  const oLoc: OLocDef[] = [
    { k: 'ngay', ten: 'Ngày áp dụng', o: <ChonKhoangNgay align="end" value={nhap.ngay} onChange={k => dat('ngay', k)} /> },
    { k: 'sp', ten: nhanSp, o: chonO('sp', nhanSp, dsSp) },
    { k: 'nvl', ten: nhanNvl, o: chonO('nvl', nhanNvl, dsNvl) },
    { k: 'kho', ten: 'Kho áp dụng', o: chonO('kho', 'Kho áp dụng', KHO_BEP.map(k => ({ v: k, t: k }))) },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['sp', 'nvl', 'kho'])   // Ngày áp dụng nằm trong Bộ lọc nâng cao cho vừa thanh công cụ

  const truocChip = ds.filter(c =>
    trongKhoang(docNgay(String(c.ngay)), ap.ngay) && (!ap.sp || c[khoaSp] === ap.sp) && (!ap.nvl || nvlCua(c).some(n => n.ma === ap.nvl))
    && (!ap.kho || apDungKho(c.kho as string[], ap.kho)))
  const chips: Chip[] = TT_CONG_THUC.map(([k, ten, mau]) => ({ k, ten, mau, so: truocChip.filter(c => c.tt === k).length }))
  const list = chip ? truocChip.filter(c => c.tt === chip) : truocChip
  const trangHt = Math.min(trang, Math.max(1, Math.ceil(list.length / coTrang)))
  const batDau = (trangHt - 1) * coTrang
  const trangNay = list.slice(batDau, batDau + coTrang)

  // Bật tắt công thức ngay trên danh sách; công thức nháp bật lên là đang hoạt động
  const doiTt = (c: Row) => {
    const moi: TtCongThuc = c.tt === 'on' ? 'off' : 'on'
    suaPhieu(MAN[loai], String(c.id), { tt: moi })
    toast(`${moi === 'on' ? 'Đã bật' : 'Đã tắt'} công thức ${cb ? c.ma : hangCua(String(c.gocMa))?.ten ?? ''}`)
  }

  // Cột để tuỳ chỉnh ẩn hiện, thứ tự; cột Công thức chia hai cột con Tên nguyên vật liệu, Số lượng
  const cols: Col[] = [
    { k: 'stt', t: '#', w: 50, c: true },
    ...(cb ? [{ k: 'ma', t: 'Mã công thức', w: 110 }, { k: 'sp', t: 'Tên sản phẩm', w: 190 }, { k: 'dvt', t: 'Đơn vị tính', w: 90 },
      { k: 'ngay', t: 'Ngày áp dụng', w: 110 }, { k: 'kenh', t: 'Kênh áp dụng', w: 140 }]
      : [{ k: 'sp', t: 'Tên nguyên vật liệu gốc', w: 240 }]),
    { k: 'ct', t: 'Công thức' },
    ...(cb ? [] : [{ k: 'ngay', t: 'Ngày áp dụng', w: 110 }]),
    { k: 'kho', t: 'Kho áp dụng', w: 140 },
    { k: 'tt', t: 'Trạng thái', w: 90, c: true },
  ]
  const cot = useCotDs(path, cols, COT_CO_DINH)

  const o = (c: Row, k: string): React.ReactNode => {
    const ma = String(c[khoaSp])
    if (k === 'ma') return <span className="code">{c.ma}</span>
    if (k === 'sp') return <TenMa ma={ma} />
    if (k === 'dvt') return hangCua(ma)?.dvt
    if (k === 'ngay') return c.ngay
    if (k === 'kenh') return (c.kenh as string[]).join(', ')
    if (k === 'kho') return tenKhoAd(c.kho as string[])
    if (k === 'tt') return (
      <button type="button" role="switch" aria-checked={c.tt === 'on'} aria-label={c.tt === 'on' ? 'Tắt công thức' : 'Bật công thức'}
        className={`ds-ct${c.tt === 'on' ? ' on' : ''}`} onClick={e => { e.stopPropagation(); doiTt(c) }}><i /></button>
    )
    return null
  }

  return (
    <div className="page page-voucher page-dm">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <DaiGiaiThich soChe={!cb} />
      <div className="dm-khung">
        <section className="card dm-bang">
          <div className="ds-thanh">
            <ChipTrangThai ds={chips} chon={chip} onChon={k => { setChip(c => (c === k ? '' : k)); setTrang(1) }} />
            <div className="ds-thanh-phai">
              <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap}
                onLoc={apLoc} onXoaHet={loc0.xoaNhap} />
              <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
                onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
              <NutExcel onNhap={() => toast('Nhập công thức từ Excel')} onXuat={() => toast(`Đã xuất ${list.length} công thức ra Excel`)} />
              <NutThemMoiSplit toMoi={`${path}/moi`} />
            </div>
          </div>
          {list.length ? <>
            <div className="tbl-wrap">
              <table className="tbl sx-ct-bang">
                <thead>
                  <tr>
                    {cot.colsHien.map(c => c.k === 'ct'
                      ? <th key={c.k} className="c" colSpan={2}>Công thức</th>
                      : <th key={c.k} rowSpan={2} className={c.c ? 'c' : undefined} style={c.w ? { width: c.w } : undefined}>{c.t}</th>)}
                  </tr>
                  <tr>
                    {cot.colsHien.some(c => c.k === 'ct') && <><th style={{ minWidth: 200 }}>{cb ? 'Tên nguyên vật liệu' : 'Tên nguyên vật liệu đích'}</th><th className="num" style={{ width: 100 }}>Số lượng</th></>}
                  </tr>
                </thead>
                <tbody>
                  {trangNay.map((c, i) => {
                    const nvl = nvlCua(c)
                    const n = Math.max(1, nvl.length)
                    return (
                      <Fragment key={String(c.id)}>
                        {Array.from({ length: n }, (_, j) => (
                          <tr key={j} className={`click${j === n - 1 ? ' sx-cuoi-nhom' : ''}`} onClick={() => nav(`${path}/${c.id}`)}>
                            {cot.colsHien.map(col => col.k === 'ct'
                              ? <Fragment key={col.k}>
                                <td>{nvl[j] ? <TenMa ma={nvl[j].ma} /> : ''}</td>
                                <td className="num">{nvl[j] ? `${soLuong(nvl[j].sl)} ${hangCua(nvl[j].ma)?.dvt ?? ''}` : ''}</td>
                              </Fragment>
                              : j === 0 && <td key={col.k} rowSpan={n} className={`sx-gop${col.c ? ' c' : ''}`}>{col.k === 'stt' ? batDau + i + 1 : o(c, col.k)}</td>)}
                          </tr>
                        ))}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <PhanTrang tong={list.length} trang={trangHt} coTrang={coTrang} dsCoTrang={CO_TRANG_DM}
              onTrang={setTrang} onCoTrang={ct => { setCoTrang(ct); setTrang(1) }} />
          </> : (
            <div className="empty">
              <b>Không có công thức khớp bộ lọc</b>
              <button type="button" className="btn sm empty-btn" onClick={() => { loc0.xoaHet(); setChip(''); setTrang(1) }}>Xoá bộ lọc</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ── Form chi tiết ──

/** Ô số: gõ số thô, rời ô hiện kiểu Việt Nam */
function OSo({ val, onChange, w }: { val: number; onChange: (v: number) => void; w?: number }) {
  const [focus, setFocus] = useState(false)
  const [str, setStr] = useState(String(val))
  useEffect(() => { if (!focus) setStr(String(val)) }, [val, focus])
  return (
    <input type="text" className="inp sm num" style={w ? { width: w } : undefined} value={focus ? str : soLuong(val)} inputMode="decimal"
      onFocus={() => { setFocus(true); setStr(val ? String(val) : '') }}
      onChange={e => setStr(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))}
      onBlur={() => { setFocus(false); onChange(tron3(parseFloat(str) || 0)) }} />
  )
}

/** Chọn nhiều kho áp dụng: chip có nút bỏ, ô chọn thêm; không chọn kho nào là mọi kho */
function ChonNhieuKho({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const con = KHO_BEP.filter(k => !value.includes(k))
  return (
    <div className="sx-nhieu">
      {value.length ? value.map(k => (
        <span key={k} className="chip info">{k}
          <button type="button" className="sx-bo" aria-label={`Bỏ ${k}`} onClick={() => onChange(value.filter(x => x !== k))}><Icon n="x" className="ic sm" /></button>
        </span>
      )) : <span className="dim">Tất cả các kho</span>}
      {con.length > 0 && <Select className="inp sm" value="" aria-label="Thêm kho áp dụng" onChange={e => e.target.value && onChange([...value, e.target.value])}
        ds={[{ v: '', t: 'Thêm kho' }, ...con.map(k => ({ v: k, t: k }))]} />}
    </div>
  )
}

function FormCongThuc({ sc, mod, loai, ct, soCt }: ScreenProps & { loai: LoaiCt; ct?: Row; soCt: number }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const viTri = useLocation()
  const path = duongDan(mod, sc)
  const dong = useDong(path)
  const cb = loai === 'cb'
  // Sao chép: mở form mới điền sẵn từ công thức đang xem, mã mới, trạng thái nháp
  const goc = ct ?? (viTri.state as { saoChep?: Row } | null)?.saoChep
  const moi = !ct
  const maMoi = `${cb ? 'CTCB' : 'CTSC'}${String(soCt + 1).padStart(3, '0')}`
  const [ma] = useState(String(ct?.ma ?? maMoi))
  const [tt, setTt] = useState<TtCongThuc>((ct?.tt as TtCongThuc | undefined) ?? 'nhap')
  const [sp, setSp] = useState(String(goc?.[cb ? 'spMa' : 'gocMa'] ?? ''))
  const [ngay, setNgay] = useState(String(goc?.ngay ?? '07/10/2026'))
  const [kenh, setKenh] = useState<string[]>((goc?.kenh as string[] | undefined) ?? (cb ? ['Tại quán', 'Mang về'] : []))
  const [kho, setKho] = useState<string[]>((goc?.kho as string[] | undefined) ?? [])
  const [moTa, setMoTa] = useState(String(goc?.moTa ?? ''))
  const [nvl, setNvl] = useState<NvlCongThuc[]>(() => (goc ? nvlCua(goc).map(n => ({ ...n })) : []))
  const hSp = hangCua(sp)
  const doiNvl = (i: number, p: Partial<NvlCongThuc>) => setNvl(ds => ds.map((n, j) => (j === i ? { ...n, ...p } : n)))
  const chiPhi = (n: NvlCongThuc) => Math.round(n.sl * (hangCua(n.ma)?.gia ?? 0))
  const tongCp = nvl.reduce((a, n) => a + chiPhi(n), 0)
  // Tỉ lệ thu hồi của công thức sơ chế: cộng số lượng đích cùng đơn vị tính với NVL gốc
  const thuHoi = nvl.filter(n => hangCua(n.ma)?.dvt === hSp?.dvt).reduce((a, n) => a + n.sl, 0)

  function luu() {
    const thieu = !sp ? (cb ? 'Chọn sản phẩm' : 'Chọn nguyên vật liệu gốc') : !ngay ? 'Nhập ngày áp dụng' : !nvl.length ? (cb ? 'Thêm nguyên vật liệu thành phần' : 'Thêm nguyên vật liệu đích') : ''
    if (thieu) { toast(thieu); return }
    const nd: Row = cb
      ? { ma, spMa: sp, ngay, kenh, kho, moTa, tt, nvl } satisfies Omit<CongThucCb, 'id'>
      : { ma, gocMa: sp, ngay, kho, moTa, tt, dich: nvl } satisfies Omit<CongThucSc, 'id'>
    if (moi) themPhieu(MAN[loai], { id: `moi-${Date.now()}`, ...nd }, s.ten)
    else suaPhieu(MAN[loai], String(ct.id), nd)
    toast(`Đã lưu công thức ${hSp?.ten ?? ''}`)
    nav(path, { replace: true })
  }

  const dauRow = (nhan: string, batBuoc: boolean, o: React.ReactNode, cot2?: [string, boolean, React.ReactNode]) => (
    <div className={`sx-tt-dong${cot2 ? ' doi' : ''}`}>
      <label>{nhan}{batBuoc && <em> *</em>}</label>
      <div>{o}</div>
      {cot2 && <><label>{cot2[0]}{cot2[1] && <em> *</em>}</label><div>{cot2[2]}</div></>}
    </div>
  )
  const dsSp = mucHang(cb ? DS_SP : DS_NVL)

  return (
    <FormToanMan icon="book" onClose={dong} title={cb ? 'Chi tiết công thức chế biến' : 'Chi tiết công thức sơ chế'}
      giua={<span className={`fsf-tt ${moi ? 'moi' : 'xem'}`}>{moi ? 'Thêm mới' : tt === 'nhap' ? 'Nháp' : 'Mới nhất'}</span>}
      foot={<>
        <button type="button" className="btn" onClick={dong}>Huỷ</button>
        <span className="grow" />
        {!moi && <button type="button" className="btn" onClick={() => nav(`${path}/moi`, { state: { saoChep: { ...ct, kho, kenh, moTa, ngay, nvl, dich: nvl } } })}>
          <Icon n="copy" className="ic sm" />Sao chép
        </button>}
        <button type="button" className="btn pri" onClick={luu}>Lưu lại</button>
      </>}>
      <div className="sx-ct-form">
        <section className="card sx-khoi">
          <div className="sx-khoi-dau">
            <b>Thông tin chung</b>
            <label className="row sx-bat">
              <span className="dim">{tt === 'on' ? 'Đang hoạt động' : tt === 'nhap' ? 'Nháp' : 'Không hoạt động'}</span>
              <button type="button" role="switch" aria-checked={tt === 'on'} aria-label="Bật tắt công thức" className={`ds-ct${tt === 'on' ? ' on' : ''}`}
                onClick={() => setTt(x => (x === 'on' ? 'off' : 'on'))}><i /></button>
            </label>
          </div>
          <div className="sx-tt">
            {cb && dauRow('Mã công thức', false, <input className="inp code" readOnly value={ma} />)}
            {dauRow(cb ? 'Sản phẩm' : 'Nguyên vật liệu gốc', true,
              <ChonDanhMuc dm={cb ? 'hang' : 'nvl'} nhan={cb ? 'sản phẩm' : 'nguyên vật liệu'} coMa trong="Chọn" value={sp} onChange={setSp} ds={dsSp} />)}
            {dauRow('Đơn vị tính', true, <input className="inp" readOnly value={hSp?.dvt ?? ''} placeholder="Theo hàng đã chọn" />,
              ['Ngày áp dụng', true, <ONgay value={ngay} onChange={setNgay} title="Công thức dùng cho phiếu từ ngày này" />])}
            {cb && dauRow('Kênh áp dụng', false, (
              <div className="sx-nhieu">
                {KENH.map(k => (
                  <button key={k} type="button" className={`chip${kenh.includes(k) ? ' info' : ''} sx-kenh`} aria-pressed={kenh.includes(k)}
                    onClick={() => setKenh(x => (x.includes(k) ? x.filter(y => y !== k) : [...x, k]))}>{k}</button>
                ))}
              </div>
            ))}
            {dauRow('Kho áp dụng', false, <ChonNhieuKho value={kho} onChange={setKho} />)}
            {dauRow('Mô tả', false, <textarea className="inp sx-mota" rows={2} value={moTa} onChange={e => setMoTa(e.target.value)} placeholder="Ghi chú cách làm, hao hụt" />)}
          </div>
        </section>

        <section className="card sx-khoi">
          <div className="sx-khoi-dau">
            <b>{cb ? 'Nguyên vật liệu thành phần' : 'Danh sách nguyên vật liệu đích'}</b>
            {!cb && hSp && nvl.length > 0 && <span className="dim">Thu hồi {soLuong(thuHoi)} {hSp.dvt} trên 1 {hSp.dvt} gốc, hao hụt {soLuong(Math.max(0, tron3(1 - thuHoi)) * 100)}%</span>}
            <button type="button" className="btn sm ghost" onClick={() => setNvl(ds => [...ds, { ma: '', sl: 0, ...(cb ? { tang: 0, giam: 0 } : {}) }])}>
              <Icon n="plus" className="ic sm" />{cb ? 'Thêm NVL' : 'Thêm NVL đích'}
            </button>
          </div>
          <div className="tbl-wrap">
            <table className="tbl bang-sua">
              <thead>
                <tr>
                  <th className="dim c" style={{ width: 40 }}>#</th>
                  <th style={{ width: 230 }}>{cb ? 'Mã NVL' : 'Mã NVL đích'}</th>
                  <th style={{ minWidth: 180 }}>{cb ? 'Tên NVL' : 'Tên NVL đích'}</th>
                  <th style={{ width: 90 }}>Đơn vị tính</th>
                  <th className="num" style={{ width: 110 }}>Số lượng</th>
                  {cb && <><th className="num" style={{ width: 110 }}>Đơn giá</th><th className="num" style={{ width: 110 }}>Chi phí</th>
                    <th className="num" style={{ width: 120 }}>Mức tăng tối đa (%)</th><th className="num" style={{ width: 120 }}>Mức giảm tối đa (%)</th></>}
                  <th style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {nvl.map((n, i) => {
                  const h = hangCua(n.ma)
                  return (
                    <tr key={i}>
                      <td className="dim c">{i + 1}</td>
                      <td><ChonDanhMuc dm="nvl" nhan="nguyên vật liệu" coMa chiMa className="inp sm" trong="Chọn" value={n.ma}
                        ds={mucHang(DS_NVL.filter(x => x.ma !== sp))} onChange={v => doiNvl(i, { ma: v })} /></td>
                      <td>{h?.ten}</td>
                      <td>{h?.dvt}</td>
                      <td className="num"><OSo val={n.sl} onChange={v => doiNvl(i, { sl: v })} /></td>
                      {cb && <>
                        <td className="num">{money(h?.gia ?? 0)}</td>
                        <td className="num">{money(chiPhi(n))}</td>
                        <td className="num"><OSo val={n.tang ?? 0} onChange={v => doiNvl(i, { tang: v })} /></td>
                        <td className="num"><OSo val={n.giam ?? 0} onChange={v => doiNvl(i, { giam: v })} /></td>
                      </>}
                      <td className="c">
                        <button type="button" className="icon-btn sm" title="Xoá dòng" onClick={() => setNvl(ds => ds.filter((_, j) => j !== i))}><Icon n="trash" className="ic sm" /></button>
                      </td>
                    </tr>
                  )
                })}
                {!nvl.length && <tr><td colSpan={cb ? 10 : 6} className="sx-trong">Chưa có nguyên vật liệu. Bấm {cb ? 'Thêm NVL' : 'Thêm NVL đích'} để thêm.</td></tr>}
              </tbody>
              <tfoot>
                <tr className="sum">
                  <td colSpan={6}>{cb ? 'Tổng chi phí' : `Tổng: ${nvl.length}`}</td>
                  {cb && <><td className="num">{money(tongCp)}</td><td colSpan={3} /></>}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>
    </FormToanMan>
  )
}
