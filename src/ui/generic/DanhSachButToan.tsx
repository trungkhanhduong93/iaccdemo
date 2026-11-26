// Danh sách chứng từ tổng hợp bản Pro (10.1.1): liệt kê bút toán hạch toán của mọi chứng từ, mỗi cặp Nợ/Có hai dòng.
// Dòng đứng ở tài khoản Nợ ghi Số tiền nợ, dòng đứng ở tài khoản Có ghi Số tiền có; mỗi dòng lưu thêm tính chất định khoản DEB (Nợ) hoặc CRD (Có).
import { useMemo, useState } from 'react'
import type { Col, ModuleDef, Row, ScreenDef, ScreenProps } from '../../modules/types'
import { MODULES, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { bosungDinhKhoan } from '../../modules/tien/dinh-khoan-pro'
import { Table } from '../Table'
import { PhanTrang } from '../PhanTrang'
import { NutExcel } from '../CongCuDs'
import { IconFigmaSliders, IconExcel } from '../IconFigma'
import { BoLoc, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef } from '../LocNangCao'
import { buildGroupedData } from '../virtual'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../LocCot'
import { ChonHaiCot, type MucHaiCot } from '../ChonHaiCot'
import { IconFigmaSearch } from '../IconFigma'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { fold, money } from '../format'
import { TAI_KHOAN } from '../../modules/danh-muc/data'
import { tinhButToan } from '../mobile/butToan'
import { chungTu, dongCua, type Dong } from './gen'
import { theoLoai } from './nhom'
import { gopLoai } from './VoucherScreen'

export type TinhChat = 'DEB' | 'CRD'
export interface DongButToan {
  id: string; ngay: string; so: string; loaiCt: string; doiTuong: string; dienGiai: string
  tk: string; tenTk: string; tkDoiUng: string
  dtNo: string; dtCo: string; cvNo: string; cvCo: string; tpNo: string; tpCo: string; vtNo: string; vtCo: string   // chi tiết hai bên của cặp
  tinhChat: TinhChat; no: number; co: number
}

const tenTk = (so: string) => TAI_KHOAN.find(t => t.so === so)?.ten ?? ''
type ChiTiet = Pick<DongButToan, 'dtNo' | 'dtCo' | 'cvNo' | 'cvCo' | 'tpNo' | 'tpCo' | 'vtNo' | 'vtCo'>
const TRONG: ChiTiet = { dtNo: '', dtCo: '', cvNo: '', cvCo: '', tpNo: '', tpCo: '', vtNo: '', vtCo: '' }
/** Chi tiết đi kèm hai bên của dòng: đối tượng, công việc, thành phẩm, vật tư hàng hoá */
const chiTietDong = (d: Dong): ChiTiet => ({ dtNo: d.dtNo ?? '', dtCo: d.dtCo ?? '', cvNo: d.cvNo ?? '', cvCo: d.cvCo ?? '', tpNo: d.tpNo ?? '', tpCo: d.tpCo ?? '', vtNo: d.vtNo ?? '', vtCo: d.vtCo ?? '' })

/** Hai dòng của một cặp hạch toán: Nợ rồi Có */
function capDong(goc: Omit<DongButToan, 'tk' | 'tenTk' | 'tkDoiUng' | keyof ChiTiet | 'tinhChat' | 'no' | 'co' | 'id'>, id: string, no: string, co: string, tien: number, ct: ChiTiet = TRONG): DongButToan[] {
  const cn = /^(131|331)/   // tài khoản công nợ chưa chọn đối tượng thì lấy đối tượng đầu phiếu
  ct = { ...ct, dtNo: ct.dtNo || (cn.test(no) ? goc.doiTuong : ''), dtCo: ct.dtCo || (cn.test(co) ? goc.doiTuong : '') }
  return [
    { ...goc, id: `${id}-N`, tk: no, tenTk: tenTk(no), tkDoiUng: co, ...ct, tinhChat: 'DEB', no: tien, co: 0 },
    { ...goc, id: `${id}-C`, tk: co, tenTk: tenTk(co), tkDoiUng: no, ...ct, tinhChat: 'CRD', no: 0, co: tien },
  ]
}

/** Gom bút toán của mọi chứng từ ở mọi phân hệ */
export function gomButToan(s: Parameters<typeof bosungDinhKhoan>[2] & { cheDo: Parameters<typeof tinhButToan>[7] }): DongButToan[] {
  const out: DongButToan[] = []
  const duyet = (mod: ModuleDef, sc: ScreenDef) => {
    const cfg = sc.voucher
    if (!cfg || cfg.kiemKe || cfg.dieuChinh) return
    const ma = sc.code ?? sc.slug
    const rows: Row[] = [...(cfg.phieuThem?.(s as never) ?? []), ...(cfg.rowsMau ? cfg.rowsMau() : cfg.loai ? gopLoai(cfg, ma) : chungTu(cfg, ma))]
    for (const r of rows) {
      const cfgR = theoLoai(cfg, r.loai)
      let ds: Dong[] = (r._dong as Dong[] | undefined) ?? dongCua(cfgR, `${ma}-${r.id}`)
      if (mod.key === 'tien') ds = bosungDinhKhoan(ds, r, s)
      const goc = { ngay: String(r.ngay ?? ''), so: String(r.so ?? ''), loaiCt: String(r.tenLoai ?? sc.ten ?? tenMan(sc)), doiTuong: String(r.doiTuong ?? ''), dienGiai: String(r.dienGiai ?? '') }
      const dsRieng = ds.filter(d => d.tkNo && d.tkCo)
      if (dsRieng.length) {
        dsRieng.forEach((d, i) => out.push(...capDong(goc, `${mod.key}-${ma}-${r.id}-${i}`, String(d.tkNo), String(d.tkCo), Number(d.tien) || 0, chiTietDong(d))))
        continue
      }
      const bt = tinhButToan(cfgR, ds, Number(r.tong ?? r.tien) || 0, 0, Number(r.thue) || 0, goc.doiTuong, String(r.cn ?? ''), s.cheDo, mod.key === 'mua-hang' ? 'mua' : 'ban')
      for (let i = 0; i + 1 < bt.length; i += 2) out.push(...capDong(goc, `${mod.key}-${ma}-${r.id}-${i / 2}`, bt[i].so, bt[i + 1].so, bt[i].tien))
    }
  }
  for (const m of MODULES) for (const sc of m.screens) duyet(m, sc)
  return out
}

const COLS: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 100 },
  { k: 'so', t: 'Số chứng từ', w: 120 },
  { k: 'loaiCt', t: 'Loại chứng từ', w: 150 },
  { k: 'dienGiai', t: 'Diễn giải', w: 240 },
  { k: 'tk', t: 'Tài khoản', w: 90 },
  { k: 'tkDoiUng', t: 'TK đối ứng', w: 90 },
  { k: 'no', t: 'Số tiền nợ', num: true, w: 120, r: r => (r.no ? money(r.no) : '') },
  { k: 'co', t: 'Số tiền có', num: true, w: 120, r: r => (r.co ? money(r.co) : '') },
  { k: 'dtNo', t: 'Đối tượng nợ', w: 150 },
  { k: 'dtCo', t: 'Đối tượng có', w: 150 },
  { k: 'cvNo', t: 'Công việc nợ', w: 130 },
  { k: 'cvCo', t: 'Công việc có', w: 130 },
  { k: 'tpNo', t: 'Thành phẩm nợ', w: 130 },
  { k: 'tpCo', t: 'Thành phẩm có', w: 130 },
  { k: 'vtNo', t: 'VTHH nợ', w: 150 },
  { k: 'vtCo', t: 'VTHH có', w: 150 },
  { k: 'tinhChat', t: 'Tính chất', c: true, w: 80 },
]
interface GtLoc { thoiGian: KhoangNgay; tim: string; so: string; tk: string[]; tkDoiUng: string[]; doiTuong: string[]; cv: string[]; tp: string[]; vt: string[]; loaiCt: string[] }
const locMacDinh = (): GtLoc => ({ thoiGian: thangMacDinh(), tim: '', so: '', tk: [], tkDoiUng: [], doiTuong: [], cv: [], tp: [], vt: [], loaiCt: [] })
const NGAY = (r: Row) => String(r.ngay).split(' ')[0]
const CO_DINH = new Set(['ngay', 'so'])
const COT_CONG = ['no', 'co']
const BO_GOM = new Set(['so', 'dienGiai', 'no', 'co'])
const chuCot = (k: string, r: Row): string => { const v = r[k]; return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '') }
const kieuCot = (k: string): KieuLoc => k === 'ngay' ? 'ngay' : k === 'no' || k === 'co' ? 'so' : 'chon'
const congCot = (ds: Row[]) => Object.fromEntries(COT_CONG.map(k => [k, ds.reduce((a, r) => a + (Number(r[k]) || 0), 0)]))

export function DanhSachButToan({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const path = `/app/${mod.key}/${sc.slug}`
  const tatCa = useMemo(() => gomButToan(s), [s.donVi, s.cheDo, s.goi, s.dongBoThuChi, s.mapPttt])   // eslint-disable-line react-hooks/exhaustive-deps
  const loc0 = useLocNhap(locMacDinh, `ds:${path}`)
  const { nhap, dat, ap } = loc0
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(50)
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [nhomCols, setNhomCols] = useState<string[]>([])
  const [expandMap, setExpandMap] = useState<Map<string, boolean>>(() => new Map())
  const cot = useCotDs(path, COLS, CO_DINH)
  const tenCotMap = useMemo(() => Object.fromEntries(cot.colsDu.map(c => [c.k, c.t || c.k])), [cot.colsDu])
  const dsCotGom = useMemo(() => new Set(cot.colsDu.filter(c => !BO_GOM.has(c.k)).map(c => c.k)), [cot.colsDu])

  const ds = useMemo(() => {
    const tk = fold(ap.tim), so = fold(ap.so)
    const co = (g: string[], ...v: string[]) => g.length === 0 || v.some(x => x && g.includes(x))
    return tatCa.filter(d => {
      const r = d as unknown as Row
      if (!trongKhoang(docNgay(NGAY(r)), ap.thoiGian)) return false
      if (tk && !fold(`${d.so} ${d.loaiCt} ${d.dienGiai} ${d.tk} ${d.tkDoiUng} ${d.doiTuong} ${d.dtNo} ${d.dtCo}`).includes(tk)) return false
      if (so && !fold(d.so).includes(so)) return false
      if (!co(ap.tk, d.tk) || !co(ap.tkDoiUng, d.tkDoiUng) || !co(ap.loaiCt, d.loaiCt)) return false
      if (!co(ap.doiTuong, d.dtNo, d.dtCo) || !co(ap.cv, d.cvNo, d.cvCo) || !co(ap.tp, d.tpNo, d.tpCo) || !co(ap.vt, d.vtNo, d.vtCo)) return false
      for (const [k, g] of Object.entries(locCot)) {
        if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? docNgay(NGAY(r)) : undefined)) return false
      }
      return true
    })
  }, [tatCa, ap, locCot])
  const luaChon = (f: (d: DongButToan) => string[]): MucHaiCot[] => [...new Set(tatCa.flatMap(f).filter(Boolean))].sort().map(v => ({ v }))
  const dsTk = useMemo(() => [...new Set(tatCa.map(d => d.tk))].sort().map((v): MucHaiCot => ({ v, t: tenTk(v), ma: v })), [tatCa])
  const dsLoaiCt = useMemo(() => luaChon(d => [d.loaiCt]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsDt = useMemo(() => luaChon(d => [d.dtNo, d.dtCo]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsCv = useMemo(() => luaChon(d => [d.cvNo, d.cvCo]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsTp = useMemo(() => luaChon(d => [d.tpNo, d.tpCo]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsVt = useMemo(() => luaChon(d => [d.vtNo, d.vtCo]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const chon = (k: 'tk' | 'tkDoiUng' | 'doiTuong' | 'cv' | 'tp' | 'vt' | 'loaiCt', ten: string, ds: MucHaiCot[]) => (
    <ChonHaiCot chip ds={ds} value={nhap[k]} onChange={v => dat(k, v)} nhan={ten} goiY={`Chọn ${ten.toLowerCase()}`} btnClass="ds-o-sel" />
  )
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    { k: 'tim', ten: 'Tìm kiếm', o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số, diễn giải, tài khoản" aria-label="Tìm kiếm" onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} /> },
    { k: 'so', ten: 'Số chứng từ', coGiaTri: Boolean(nhap.so), o: <input className="ds-o-inp" value={nhap.so} placeholder="Số chứng từ" aria-label="Số chứng từ" onChange={e => dat('so', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} /> },
    { k: 'loaiCt', ten: 'Loại chứng từ', coGiaTri: nhap.loaiCt.length > 0, o: chon('loaiCt', 'Loại chứng từ', dsLoaiCt) },
    { k: 'tk', ten: 'Tài khoản', coGiaTri: nhap.tk.length > 0, o: chon('tk', 'Tài khoản', dsTk) },
    { k: 'tkDoiUng', ten: 'TK đối ứng', coGiaTri: nhap.tkDoiUng.length > 0, o: chon('tkDoiUng', 'TK đối ứng', dsTk) },
    { k: 'doiTuong', ten: 'Đối tượng', coGiaTri: nhap.doiTuong.length > 0, o: chon('doiTuong', 'Đối tượng', dsDt) },
    { k: 'cv', ten: 'Công việc', coGiaTri: nhap.cv.length > 0, o: chon('cv', 'Công việc', dsCv) },
    { k: 'tp', ten: 'Thành phẩm', coGiaTri: nhap.tp.length > 0, o: chon('tp', 'Thành phẩm', dsTp) },
    { k: 'vt', ten: 'VTHH', coGiaTri: nhap.vt.length > 0, o: chon('vt', 'VTHH', dsVt) },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim'])
  const apLoc = () => { loc0.loc(); setTrang(1) }
  const soTrang = Math.max(1, Math.ceil(ds.length / coTrang))
  const trangHt = Math.min(trang, soTrang)
  const trangs = useMemo(() => ds.slice((trangHt - 1) * coTrang, trangHt * coTrang), [ds, trangHt, coTrang])
  const hien = useMemo(() => nhomCols.length === 0 ? trangs : buildGroupedData(ds, nhomCols, COT_CONG, tenCotMap, expandMap), [ds, trangs, nhomCols, tenCotMap, expandMap])
  const doiNhom = (id: string) => {
    expandMap.set(id, !(expandMap.has(id) ? expandMap.get(id) : true))
    setExpandMap(new Map(expandMap))
  }
  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <section className="card voucher-top">
        <div className="ds-toolbar-figma">
          <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap} onLoc={apLoc} onXoaHet={loc0.xoaHet} chiNutPheu
            ngoaiRieng={{ tim: (
              <div key="tim" className="ds-tim-figma">
                <IconFigmaSearch size={16} />
                <input value={nhap.tim} placeholder="Số, diễn giải, tài khoản" aria-label="Tìm kiếm" onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />
              </div>) }} />
          <div className="ds-toolbar-phai">
            <span className="muted" style={{ fontSize: 12 }}>{ds.length} dòng bút toán</span>
            <NutExcel label={<IconExcel />} onNhap={() => undefined} onXuat={() => undefined} />
            <NutTuyChinhCot icon={<IconFigmaSliders />} cols={cot.colsDu} an={cot.an} coDinh={CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
              gom={{ duoc: dsCotGom, ds: nhomCols, dat: setNhomCols }} onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
          </div>
        </div>
        {ds.length ? (
          <>
            <Table cols={cot.colsHien} rows={hien} motDong keDoc doRong={cot.doRong} onToggleGroup={doiNhom}
              loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set<string>(), kieu: c => kieuCot(c.k), layLuaChon: k => dsGiaTri(tatCa as unknown as Row[], r => chuCot(k, r)) }}
              sum={{ ngay: String(nhomCols.length ? ds.length : trangs.length), ...congCot(nhomCols.length ? ds : trangs) }} />
            <PhanTrang tong={ds.length} tongCong={congCot(ds)} trang={trangHt} coTrang={coTrang} dsCoTrang={[50, 100, 200]} onTrang={setTrang} onCoTrang={c => { setCoTrang(c); setTrang(1) }} />
          </>
        ) : <div className="empty"><b>Không có bút toán khớp bộ lọc</b></div>}
      </section>
    </div>
  )
}
