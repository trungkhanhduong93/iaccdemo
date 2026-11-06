// Công thức chế biến (9.1.3) và công thức sơ chế (5.1.5) theo iPOS Inventory (T152).
// Danh sách gộp ô: mỗi nguyên vật liệu một dòng con trong cột Công thức, các cột khác gộp theo công thức; cột Trạng thái là công tắc.
// Form chi tiết: Thông tin chung và bảng nguyên vật liệu thành phần (chế biến) hoặc nguyên vật liệu đích (sơ chế).
// T156: form chi tiết là trang toàn màn như IVT, thanh trên có nút đóng, tiêu đề, nhãn phiên bản, Sao chép, Lưu lại
import { Fragment, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG, HANG, HANG_SX, NVL } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { CO_TRANG_DM, PhanTrang } from '../../ui/PhanTrang'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { ChonKhoangNgay, ONgay, docNgay, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { useDong } from '../../ui/FormToanMan'
import { ThemHangLoat } from '../../ui/generic/ThemHangLoat'
import { BoLoc, ChipTrangThai, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type Chip, type OLocDef } from '../../ui/LocNangCao'
import { suaPhieu, themPhieu, useDaXoa } from '../../ui/generic/daXoa'
import { ChonNhieu, quyDoiTuDanhMuc } from '../danh-muc/QuyDoiDvt'
import {
  CONG_THUC_CB, CONG_THUC_SC, TT_CONG_THUC, hangCua, soLuong, tenCuaHangAd, tron3, apDungCuaHang,
  type CongThucCb, type CongThucSc, type NvlCongThuc, type TtCongThuc,
} from './san-xuat'

type LoaiCt = 'cb' | 'sc'
const MAN: Record<LoaiCt, string> = { cb: 'kho/9-1-3', sc: 'kho/5-1-5' }
export const KENH = ['Tại quán', 'Mang về', 'GrabFood', 'ShopeeFood']
/** Hàng làm thành phẩm của công thức chế biến: món và bán thành phẩm; nguyên vật liệu chọn trong NVL và hàng sơ chế */
export const DS_SP = [...HANG.filter(h => !h.tonKho), ...HANG_SX.filter(h => h.nhom === 'Bán thành phẩm' || h.nhom.startsWith('Món'))]
export const DS_NVL = [...NVL, ...HANG_SX.filter(h => !h.nhom.startsWith('Món'))]
const mucHang = (ds: { ma: string; ten: string }[]) => ds.map(h => ({ v: h.ma, t: `${h.ten} - ${h.ma}` }))

/** Công thức của màn: mẫu, công thức lưu trong phiên, áp nội dung đã sửa (bật tắt, sửa form) */
export function useDsCongThuc(loai: LoaiCt): Row[] {
  const { phieuMoi, apSua } = useDaXoa(MAN[loai])
  const [mau] = useState<Row[]>(() => (loai === 'cb' ? CONG_THUC_CB : CONG_THUC_SC).map(c => ({ ...c })))
  return [...phieuMoi, ...mau].map(apSua)
}

export const nvlCua = (c: Row): NvlCongThuc[] => (c.nvl ?? c.dich ?? []) as NvlCongThuc[]
/** Tên hiện kiểu IVT: tên, mã mờ phía sau */
const TenMa = ({ ma }: { ma: string }) => <span className="sx-ten">{hangCua(ma)?.ten ?? ma}<small> - {ma}</small></span>

export function CongThucScreen({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const loai: LoaiCt = sc.slug === '5-1-5' ? 'sc' : 'cb'
  const ds = useDsCongThuc(loai)
  // Thêm, sửa mở panel bên phải như form Hàng hoá, Đối tượng; danh sách vẫn hiện phía sau
  return <>
    <DsCongThuc sc={sc} mod={mod} loai={loai} ds={ds} />
    {id !== undefined && <FormCongThuc key={id} sc={sc} mod={mod} loai={loai} ct={id === 'moi' ? undefined : ds.find(c => c.id === id)} soCt={ds.length} />}
  </>
}

// ── Danh sách ──

interface GtLoc { ngay: KhoangNgay; sp: string; nvl: string; cuaHang: string; kenh: string }
const locMacDinh = (): GtLoc => ({ ngay: { tu: new Date(2026, 0, 1), den: new Date(2026, 11, 31) }, sp: '', nvl: '', cuaHang: '', kenh: '' })
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
  const chonO = (k: 'sp' | 'nvl' | 'cuaHang' | 'kenh', ten: string, mucs: { v: string; t: string }[]) => (
    <Select className="ds-o-sel" value={nhap[k]} aria-label={ten} onChange={e => dat(k, e.target.value)} ds={[{ v: '', t: 'Tất cả' }, ...mucs]} />
  )
  const apLoc = () => { loc0.loc(); setTrang(1) }
  const oLoc: OLocDef[] = [
    { k: 'ngay', ten: 'Ngày áp dụng', coGiaTri: true, o: <ChonKhoangNgay value={nhap.ngay} onChange={k => dat('ngay', k)} /> },
    { k: 'sp', ten: nhanSp, coGiaTri: Boolean(nhap.sp), o: chonO('sp', nhanSp, dsSp) },
    { k: 'nvl', ten: nhanNvl, coGiaTri: Boolean(nhap.nvl), o: chonO('nvl', nhanNvl, dsNvl) },
    { k: 'cuaHang', ten: 'Cửa hàng áp dụng', coGiaTri: Boolean(nhap.cuaHang), o: chonO('cuaHang', 'Cửa hàng áp dụng', CUA_HANG.map(c => ({ v: c.ten, t: c.ten }))) },
    // T724: công thức chế biến lọc theo kênh áp dụng; công thức để trống kênh là mọi kênh nên luôn hiện
    ...(cb ? [{ k: 'kenh', ten: 'Kênh áp dụng', coGiaTri: Boolean(nhap.kenh), o: chonO('kenh', 'Kênh áp dụng', KENH.map(k => ({ v: k, t: k }))) }] : []),
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), cb ? ['sp', 'nvl', 'cuaHang', 'kenh'] : ['sp', 'nvl', 'cuaHang'])   // Ngày áp dụng nằm trong Bộ lọc nâng cao cho vừa thanh công cụ

  const truocChip = ds.filter(c =>
    trongKhoang(docNgay(String(c.ngay)), ap.ngay) && (!ap.sp || c[khoaSp] === ap.sp) && (!ap.nvl || nvlCua(c).some(n => n.ma === ap.nvl))
    && (!ap.cuaHang || apDungCuaHang(c.cuaHang as string[], ap.cuaHang))
    && (!cb || !ap.kenh || !((c.kenh as string[] | undefined)?.length) || (c.kenh as string[]).includes(ap.kenh)))
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
    { k: 'cuaHang', t: 'Cửa hàng áp dụng', w: 160 },
    { k: 'tt', t: 'Trạng thái', w: 90, c: true },
  ]
  const cot = useCotDs(path, cols, COT_CO_DINH)

  const o = (c: Row, k: string): React.ReactNode => {
    const ma = String(c[khoaSp])
    if (k === 'ma') return <span className="code">{c.ma}</span>
    if (k === 'sp') return <TenMa ma={ma} />
    if (k === 'dvt') return String(c.dvt || hangCua(ma)?.dvt || '')
    if (k === 'ngay') return c.ngay
    if (k === 'kenh') return (c.kenh as string[]).join(', ') || 'Tất cả kênh'   // để trống là mọi kênh (T156)
    if (k === 'cuaHang') return tenCuaHangAd(c.cuaHang as string[])
    if (k === 'tt') return (
      <button type="button" role="switch" aria-checked={c.tt === 'on'} aria-label={c.tt === 'on' ? 'Tắt công thức' : 'Bật công thức'}
        className={`ds-ct${c.tt === 'on' ? ' on' : ''}`} onClick={e => { e.stopPropagation(); doiTt(c) }}><i /></button>
    )
    return null
  }

  return (
    <div className="page page-voucher page-dm">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="dm-khung">
        <section className="card dm-bang">
          <div className="ds-toolbar-figma">
            <BoLoc
              ds={oLoc}
              cauHinh={cauHinhLoc}
              datCauHinh={datCauHinhLoc}
              dangLoc={loc0.dangLoc}
              khacNhap={loc0.khacNhap}
              onLoc={apLoc}
              onXoaHet={loc0.xoaNhap}
              chiNutPheu
            />
            <div className="ds-toolbar-phai">
              <NutThemMoiSplit toMoi={`${path}/moi`} />
            </div>
          </div>
          <div className="ds-hang-trang-thai">
            <ChipTrangThai ds={chips} chon={chip} onChon={k => { setChip(c => (c === k ? '' : k)); setTrang(1) }} />
            <div className="ds-toolbar-phai ds-cong-cu-h2">
              <NutExcel onNhap={() => toast('Nhập công thức từ Excel')} onXuat={() => toast(`Đã xuất ${list.length} công thức ra Excel`)} />
              <NutTuyChinhCot cols={cot.colsDu} an={cot.an} coDinh={COT_CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
                onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
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
  const [tt, setTt] = useState<TtCongThuc>((ct?.tt as TtCongThuc | undefined) ?? 'on')
  const [sp, setSp] = useState(String(goc?.[cb ? 'spMa' : 'gocMa'] ?? ''))
  const [dvt, setDvt] = useState(String(goc?.dvt ?? ''))
  const [ngay, setNgay] = useState(String(goc?.ngay ?? '07/10/2026'))
  const [kenh, setKenh] = useState<string[]>((goc?.kenh as string[] | undefined) ?? (cb ? ['Tại quán', 'Mang về'] : []))
  const [cuaHang, setCuaHang] = useState<string[]>((goc?.cuaHang as string[] | undefined) ?? [])
  const [moTa, setMoTa] = useState(String(goc?.moTa ?? ''))
  const [nvl, setNvl] = useState<NvlCongThuc[]>(() => (goc ? nvlCua(goc).map(n => ({ ...n })) : []))
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [tich, setTich] = useState<Set<number>>(() => new Set())   // dòng đang tích ở bảng nguyên vật liệu thành phần (T156)
  const hSp = hangCua(sp)
  // ĐVT: ĐVT chính của hàng, có quy đổi (danh mục Quy đổi ĐVT) thì chọn lại được
  const dsDvt = hSp ? [hSp.dvt, ...quyDoiTuDanhMuc(hSp.ten, hSp.dvt).map(q => q.dv)] : []
  const dvtHien = dvt && dsDvt.includes(dvt) ? dvt : hSp?.dvt ?? ''
  const doiNvl = (i: number, p: Partial<NvlCongThuc>) => setNvl(ds => ds.map((n, j) => (j === i ? { ...n, ...p } : n)))
  // Tỉ lệ thu hồi của công thức sơ chế: cộng số lượng đích cùng đơn vị tính với NVL gốc
  const thuHoi = nvl.filter(n => hangCua(n.ma)?.dvt === hSp?.dvt).reduce((a, n) => a + n.sl, 0)
  const xoaDong = (ds: number[]) => { setNvl(x => x.filter((_, j) => !ds.includes(j))); setTich(new Set()) }
  const tieuDe = cb ? 'Chi tiết công thức chế biến' : 'Chi tiết công thức sơ chế'

  // Esc đóng panel; đang mở hộp khác (thêm overlay) thì để hộp tự đóng
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape' && document.querySelectorAll('.overlay').length <= 1) dong() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [dong])

  function luu() {
    const thieu = !sp ? (cb ? 'Chọn sản phẩm' : 'Chọn nguyên vật liệu gốc') : !ngay ? 'Nhập ngày áp dụng' : !nvl.length ? (cb ? 'Thêm nguyên vật liệu thành phần' : 'Thêm nguyên vật liệu đích') : ''
    if (thieu) { toast(thieu); return }
    const nd: Row = cb
      ? { ma, spMa: sp, dvt: dvtHien, ngay, kenh, cuaHang, moTa, tt, nvl } satisfies Omit<CongThucCb, 'id'>
      : { ma, gocMa: sp, dvt: dvtHien, ngay, cuaHang, moTa, tt, dich: nvl } satisfies Omit<CongThucSc, 'id'>
    if (moi) themPhieu(MAN[loai], { id: `moi-${Date.now()}`, ...nd }, s.ten)
    else suaPhieu(MAN[loai], String(ct.id), nd)
    toast(`Đã lưu công thức ${hSp?.ten ?? ''}`)
    nav(path, { replace: true })
  }

  // Ô nhập theo lưới form danh mục chung (pn-luoi): nhãn trên, ô dưới
  const o = (nhan: string, batBuoc: boolean, el: React.ReactNode, dai?: boolean, haiCot?: boolean) => (
    <div className={`f${dai ? ' pn-hang-dai' : ''}`} style={haiCot ? { gridColumn: 'span 2' } : undefined}>
      <label>{nhan} {batBuoc && <em>*</em>}</label>
      {el}
    </div>
  )
  const dsSp = mucHang(cb ? DS_SP : DS_NVL)
  const nhanThem = cb ? 'Thêm NVL' : 'Thêm NVL đích'

  const tenCt = cb ? 'công thức chế biến' : 'công thức sơ chế'
  return (
    <>
      <div className="overlay" onClick={dong} />
      <aside className="pn-hop sx-ct-pn" role="dialog" aria-modal="true" aria-label={tieuDe}>
        <div className="pn-dau">
          <div>
            <h3>{moi ? `Thêm ${tenCt}` : `Sửa ${tenCt}`}</h3>
            <small className="muted">{moi ? 'Định lượng nguyên vật liệu cho một đơn vị sản phẩm' : [ma, hSp?.ten].filter(Boolean).join(' - ')}</small>
          </div>
          <button type="button" className="icon-btn" title="Đóng (Esc)" aria-label="Đóng" onClick={dong}><Icon n="x" /></button>
        </div>
        <div className="pn-than">
          <div className="pn-khoi mo">
            <div className="pn-khoi-dau">
              <span>Thông tin chung</span>
            </div>
            <div className="pn-khoi-than">
              <div className="pn-luoi">
                {o(cb ? 'Sản phẩm' : 'Nguyên vật liệu gốc', true,
                  <ChonDanhMuc dm={cb ? 'hang' : 'nvl'} nhan={cb ? 'sản phẩm' : 'nguyên vật liệu'} coMa trong="Chọn" value={sp} onChange={setSp} ds={dsSp} />, false, true)}
                {o('Đơn vị tính', true, dsDvt.length > 1
                  ? <Select className="inp" aria-label="Đơn vị tính" value={dvtHien} onChange={e => setDvt(e.target.value)} ds={dsDvt.map(d => ({ v: d, t: d }))} />
                  : <input className="inp" readOnly value={dvtHien} placeholder="Theo hàng đã chọn" />)}
                {o('Ngày áp dụng', true, <ONgay value={ngay} onChange={setNgay} title="Công thức dùng cho phiếu từ ngày này" />)}
                {o('Cửa hàng áp dụng', false, (
                  <ChonNhieu nhan="Cửa hàng áp dụng" tenDm="cửa hàng" goiY="Để trống nếu áp dụng cho mọi cửa hàng" value={cuaHang} onChange={setCuaHang}
                    ds={CUA_HANG.map(c => ({ v: c.ten, t: c.ten, phu: `Mã: ${c.id.toUpperCase()}` }))} />
                ))}
                {cb && o('Kênh áp dụng', false, (
                  <ChonNhieu nhan="Kênh áp dụng" tenDm="kênh bán" goiY="Để trống nếu áp dụng cho mọi kênh" value={kenh} onChange={setKenh}
                    ds={KENH.map(k => ({ v: k, t: k }))} />
                ))}
                {o('Mô tả', false, <textarea className="inp" rows={2} value={moTa} onChange={e => setMoTa(e.target.value)} placeholder="Nhập mô tả" />, true)}
              </div>
            </div>
          </div>

          <div className="pn-khoi mo">
            <div className="pn-khoi-dau">
              <span>{cb ? 'Nguyên vật liệu thành phần' : 'Danh sách nguyên vật liệu đích'}</span>
              {/* Các nút dồn sát phải, cạnh nhau */}
              <span className="row" style={{ gap: 8 }}>
                {!cb && hSp && nvl.length > 0 && <span className="dim">Thu hồi {soLuong(thuHoi)} {hSp.dvt} trên 1 {hSp.dvt} gốc, hao hụt {soLuong(Math.max(0, tron3(1 - thuHoi)) * 100)}%</span>}
                {cb && tich.size > 0 && <button type="button" className="btn sm sx-xoa-chon" onClick={() => xoaDong([...tich])}>
                  <Icon n="trash" className="ic sm" />Xoá {tich.size} dòng
                </button>}
                <button type="button" className="btn sm ghost sx-them-nvl" onClick={() => setMoHangLoat(true)}>
                  <Icon n="plus" className="ic sm" />Thêm hàng loạt
                </button>
                <button type="button" className="btn sm ghost sx-them-nvl" onClick={() => setNvl(ds => [...ds, { ma: '', sl: 0 }])}>
                  <Icon n="plus" className="ic sm" />{nhanThem}
                </button>
              </span>
              {moHangLoat && (
                // Thêm hàng loạt như phiếu kiểm kê (T465): mỗi nguyên vật liệu đã tích thành một dòng, số lượng nhập sau
                <ThemHangLoat
                  ds={DS_NVL.filter(h => h.ma !== sp).map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, loai: 'Nguyên vật liệu' }))}
                  daCo={nvl.map(n => n.ma)}
                  onDong={() => setMoHangLoat(false)}
                  onXacNhan={ds => setNvl(cu => [...cu.filter(n => n.ma), ...ds.map(h => ({ ma: h.ma, sl: 0 }))])}
                />
              )}
            </div>
            <div className="pn-khoi-than bang-sua">
              <div className="tbl-wrap">
              <table className="tbl sx-nvl-bang">
                <thead>
                  <tr>
                    {cb && <th className="c" style={{ width: 40 }}>
                      <input type="checkbox" aria-label="Chọn tất cả nguyên vật liệu" checked={nvl.length > 0 && tich.size === nvl.length}
                        onChange={e => setTich(e.target.checked ? new Set(nvl.map((_, i) => i)) : new Set())} />
                    </th>}
                    <th className="c" style={{ width: 44 }}>#</th>
                    <th style={{ width: 150 }}>{cb ? 'Mã nguyên vật liệu' : 'Mã nguyên vật liệu đích'}</th>
                    <th style={{ minWidth: 180 }}>{cb ? 'Tên nguyên vật liệu' : 'Tên nguyên vật liệu đích'}</th>
                    <th style={{ width: 80 }}>Đơn vị tính</th>
                    <th className="num" style={{ width: 90 }}>Số lượng</th>
                    <th style={{ width: 48 }} />
                  </tr>
                </thead>
                <tbody>
                  {nvl.map((n, i) => {
                    const h = hangCua(n.ma)
                    return (
                      <tr key={i}>
                        {cb && <td className="c">
                          <input type="checkbox" aria-label={`Chọn dòng ${i + 1}`} checked={tich.has(i)}
                            onChange={() => setTich(t => { const m = new Set(t); if (m.has(i)) m.delete(i); else m.add(i); return m })} />
                        </td>}
                        <td className="c">{i + 1}</td>
                        <td><ChonDanhMuc dm="nvl" nhan="nguyên vật liệu" coMa chiMa className="inp sm" trong="Chọn" value={n.ma}
                          ds={mucHang(DS_NVL.filter(x => x.ma !== sp))} onChange={v => doiNvl(i, { ma: v })} /></td>
                        <td>{h?.ten}</td>
                        <td>{h?.dvt}</td>
                        <td className="num"><OSo val={n.sl} onChange={v => doiNvl(i, { sl: v })} /></td>
                        <td className="c">
                          <button type="button" className="icon-btn sm sx-xoa" title="Xoá dòng" aria-label={`Xoá dòng ${i + 1}`} onClick={() => xoaDong([i])}><Icon n="x" className="ic sm" /></button>
                        </td>
                      </tr>
                    )
                  })}
                  {!nvl.length && <tr><td colSpan={cb ? 7 : 6} className="sx-trong">Chưa có nguyên vật liệu. Bấm {nhanThem} để thêm.</td></tr>}
                </tbody>
                <tfoot>
                  <tr className="sum">
                    <td colSpan={cb ? 3 : 2}>Tổng: {nvl.length}</td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              </table>
              </div>
            </div>
          </div>

          {/* Trạng thái ở khối cuối như form Hàng hoá, Đối tượng */}
          <div className="pn-khoi mo">
            <div className="pn-khoi-dau"><span>Trạng thái</span></div>
            <div className="pn-khoi-than">
              <div className="pn-luoi">
                <div className="f pn-hang-dai">
                  <label className="row pn-tich">
                    <input type="checkbox" className="bat-tat" checked={tt === 'on'} onChange={e => setTt(e.target.checked ? 'on' : 'off')} />
                    Đang sử dụng
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pn-chan">
          {!moi && <button type="button" className="btn" onClick={() => nav(`${path}/moi`, { state: { saoChep: { ...ct, dvt: dvtHien, cuaHang, kenh, moTa, ngay, nvl, dich: nvl } } })}>
            <Icon n="copy" className="ic sm" />Sao chép
          </button>}
          {!moi && <span className="grow" />}
          <button type="button" className="btn" onClick={dong}>Huỷ</button>
          <button type="button" className="btn pri" onClick={luu}>Lưu</button>
        </div>
      </aside>
    </>
  )
}
