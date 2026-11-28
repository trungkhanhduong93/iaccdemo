// Danh sách chứng từ tổng hợp bản Pro (10.1.1): liệt kê bút toán hạch toán của mọi chứng từ, mỗi cặp Nợ/Có hai dòng.
// Dòng đứng ở tài khoản Nợ ghi Số tiền nợ, dòng đứng ở tài khoản Có ghi Số tiền có; mỗi dòng lưu thêm tính chất định khoản DEB (Nợ) hoặc CRD (Có).
import { useLayoutEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apKhoPhieu, suaPhieu } from './daXoa'
import { ThongBao } from '../ThongBao'
import { Select } from '../Dropdown'
import type { Col, ModuleDef, Row, ScreenDef, ScreenProps } from '../../modules/types'
import { MODULES, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { bosungDinhKhoan, tkChiPhiCuaLy } from '../../modules/tien/dinh-khoan-pro'
import { Note } from '../Page'
import { Table } from '../Table'
import { heThongTk, locTkChiTiet } from '../../modules/danh-muc/he-thong-tk'
import { PhanTrang } from '../PhanTrang'
import { NutExcel } from '../CongCuDs'
import { IconFigmaSliders, IconExcel } from '../IconFigma'
import { BoLoc, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef } from '../LocNangCao'
import { buildGroupedData } from '../virtual'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc } from '../LocCot'
import { ChonHaiCot, type MucHaiCot } from '../ChonHaiCot'
import { IconFigmaSearch } from '../IconFigma'
import { ChonKhoangNgay, ONgay, dmy, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { fold, money } from '../format'
import { TAI_KHOAN } from '../../modules/danh-muc/data'
import { tinhButToan } from '../mobile/butToan'
import { chungTu, dongCua, type Dong } from './gen'
import { theoLoai } from './nhom'
import { gopLoai } from './VoucherScreen'
import { butToanMua, tkPhieuMua, tkPhieuSua } from './tk-mua'
import { tkTheoCheDo } from '../../modules/tong-hop/so-cai'

export type TinhChat = 'DEB' | 'CRD'
export interface DongButToan {
  id: string; to: string; ngay: string; so: string; loaiCt: string; doiTuong: string; dienGiai: string; ghiChu: string
  tk: string; tenTk: string; tkDoiUng: string
  dt: string; dtDu: string; cv: string; cvDu: string; tp: string; tpDu: string; vt: string; vtDu: string   // chi tiết ăn theo Tài khoản (dt, cv, tp, vt) và theo TK đối ứng (…Du)
  tinhChat: TinhChat; no: number; co: number
}

const tenTk = (so: string) => TAI_KHOAN.find(t => t.so === so)?.ten ?? ''
type ChiTiet = { dtNo: string; dtCo: string; cvNo: string; cvCo: string; tpNo: string; tpCo: string; vtNo: string; vtCo: string }   // chi tiết theo bên Nợ, bên Có của dòng định khoản
const TRONG: ChiTiet = { dtNo: '', dtCo: '', cvNo: '', cvCo: '', tpNo: '', tpCo: '', vtNo: '', vtCo: '' }
/** Chi tiết đi kèm hai bên của dòng: đối tượng, công việc, thành phẩm, vật tư hàng hoá */
const chiTietDong = (d: Dong): ChiTiet => ({ dtNo: d.dtNo ?? '', dtCo: d.dtCo ?? '', cvNo: d.cvNo ?? '', cvCo: d.cvCo ?? '', tpNo: d.tpNo ?? '', tpCo: d.tpCo ?? '', vtNo: d.vtNo ?? '', vtCo: d.vtCo ?? '' })

/** Hai dòng của một cặp hạch toán: Nợ rồi Có */
function capDong(goc: Omit<DongButToan, 'tk' | 'tenTk' | 'tkDoiUng' | 'dt' | 'dtDu' | 'cv' | 'cvDu' | 'tp' | 'tpDu' | 'vt' | 'vtDu' | 'tinhChat' | 'no' | 'co' | 'id'>, id: string, no: string, co: string, tien: number, ct: ChiTiet = TRONG): DongButToan[] {
  const cn = /^(131|331)/   // tài khoản công nợ chưa chọn đối tượng thì lấy đối tượng đầu phiếu
  ct = { ...ct, dtNo: ct.dtNo || (cn.test(no) ? goc.doiTuong : ''), dtCo: ct.dtCo || (cn.test(co) ? goc.doiTuong : '') }
  const nSo = { dt: ct.dtNo, dtDu: ct.dtCo, cv: ct.cvNo, cvDu: ct.cvCo, tp: ct.tpNo, tpDu: ct.tpCo, vt: ct.vtNo, vtDu: ct.vtCo }   // dòng Nợ: chi tiết bên Nợ, đối ứng là bên Có
  const cSo = { dt: ct.dtCo, dtDu: ct.dtNo, cv: ct.cvCo, cvDu: ct.cvNo, tp: ct.tpCo, tpDu: ct.tpNo, vt: ct.vtCo, vtDu: ct.vtNo }
  return [
    { ...goc, id: `${id}-N`, tk: no, tenTk: tenTk(no), tkDoiUng: co, ...nSo, tinhChat: 'DEB', no: tien, co: 0 },
    { ...goc, id: `${id}-C`, tk: co, tenTk: tenTk(co), tkDoiUng: no, ...cSo, tinhChat: 'CRD', no: 0, co: tien },
  ]
}

type SPhien = Parameters<typeof bosungDinhKhoan>[2] & { cheDo: Parameters<typeof tinhButToan>[7] }
interface PhieuGoc { mod: ModuleDef; sc: ScreenDef; r: Row; ma: string; cfgR: ReturnType<typeof theoLoai>; ds: Dong[]; goc: Omit<DongButToan, 'id' | 'tk' | 'tenTk' | 'tkDoiUng' | 'dt' | 'dtDu' | 'cv' | 'cvDu' | 'tp' | 'tpDu' | 'vt' | 'vtDu' | 'tinhChat' | 'no' | 'co'> }

/** Duyệt mọi chứng từ ở mọi phân hệ, kèm dòng chi tiết đã bổ sung Nợ, Có (thu chi) */
function duyetPhieu(s: SPhien, cb: (p: PhieuGoc) => void, boPcTuSinh = false) {
  const layRows = (mod: ModuleDef, sc: ScreenDef, cfg: NonNullable<ScreenDef['voucher']>, ma: string): Row[] =>
    apKhoPhieu(`${mod.key}/${sc.slug}`, [...(cfg.phieuThem?.(s as never) ?? []), ...(cfg.rowsMau ? cfg.rowsMau() : cfg.loai ? gopLoai(cfg, ma) : chungTu(cfg, ma))])
  // Phiếu mua trả tiền ngay: bút toán nằm ở chính phiếu mua (Nợ Tk kho, Có quỹ tiền), phiếu chi tự sinh kèm không liệt kê lần nữa
  const pcTuSinh = new Set<string>()
  if (boPcTuSinh) for (const mod of MODULES) if (mod.key === 'mua-hang') for (const sc of mod.screens) {
    const cfg = sc.voucher
    if (!cfg || (cfg.prefix !== 'MH' && cfg.prefix !== 'HDM')) continue
    for (const r of layRows(mod, sc, cfg, sc.code ?? sc.slug)) {
      const id = (r._ctTt as { id?: string } | undefined)?.id
      if (id && r._httt && r._httt !== 'congno') pcTuSinh.add(id)
    }
  }
  for (const mod of MODULES) for (const sc of mod.screens) {
    const cfg = sc.voucher
    if (!cfg || cfg.kiemKe || cfg.dieuChinh) continue
    const ma = sc.code ?? sc.slug
    const rows: Row[] = layRows(mod, sc, cfg, ma)   // gồm phiếu lập trong phiên, bỏ phiếu đã xoá, áp phần đã sửa
    for (const r of rows) {
      if (mod.key === 'tien' && pcTuSinh.has(String(r.id))) continue
      if (r._chiKeKhai) continue   // dòng kê khai mua vào sinh kèm phiếu chi: bút toán thuế đã nằm ở phiếu chi
      const cfgR = theoLoai(cfg, r.loai)
      let ds: Dong[] = (r._dong as Dong[] | undefined) ?? dongCua(cfgR, `${ma}-${r.id}`)
      if (mod.key === 'tien') ds = bosungDinhKhoan(ds, r, s)
      const goc = { to: `/app/${mod.key}/${sc.slug}/${r.id}`, ngay: String(r.ngay ?? ''), so: String(r.so ?? ''), loaiCt: String(r.tenLoai ?? sc.ten ?? tenMan(sc)), doiTuong: String(r.doiTuong ?? ''), dienGiai: String(r.dienGiai ?? ''), ghiChu: String(r._ghiChu ?? '') }
      cb({ mod, sc, r, ma, cfgR, ds, goc })
    }
  }
}

/** Quy tắc Chuyển mã tài khoản đã xác nhận trong phiên: áp lên danh sách bút toán (phiếu mẫu dựng từ mẫu hạch toán không có dòng để sửa) */
export interface QuyTacChuyen { tu: string; sang: string; tuNgay: Date; denNgay: Date; loaiCt: string[] }   // loaiCt rỗng: mọi loại chứng từ
const QUY_TAC: QuyTacChuyen[] = []
const trongQt = (ngay: string, q: QuyTacChuyen, loaiCt = '') => trongKhoang(docNgay(ngay.split(' ')[0]), { tu: q.tuNgay, den: q.denNgay }) && (q.loaiCt.length === 0 || q.loaiCt.includes(loaiCt))
function apQuyTac(out: DongButToan[]): DongButToan[] {
  if (!QUY_TAC.length) return out
  return out.map(d => QUY_TAC.reduce((x, q) => !trongQt(x.ngay, q, x.loaiCt) ? x : {
    ...x, ...(x.tk === q.tu ? { tk: q.sang, tenTk: tenTk(q.sang) } : {}), ...(x.tkDoiUng === q.tu ? { tkDoiUng: q.sang } : {}),
  }, d))
}

/** Phiếu mua hàng, hoá đơn mua có dòng hàng: bút toán sinh theo từng dòng hàng */
const muaSinhButToan = (modKey: string, prefix: string, ds: Dong[]) => modKey === 'mua-hang' && (prefix === 'MH' || prefix === 'HDM') && ds.length > 0

/** Gom bút toán của mọi chứng từ ở mọi phân hệ */
export function gomButToan(s: SPhien): DongButToan[] {
  const out: DongButToan[] = []
  // Phiếu mua trả ngay sinh kèm phiếu chi: bút toán chỉ ghi một lần, ở phiếu mua (Nợ Tk kho, Có Tk thanh toán).
  // Dòng Tk kho lấy số phiếu mua; các dòng còn lại lấy thông tin phiếu chi (ngày, loại, diễn giải, số chứng từ). Phiếu chi tự sinh không ghi thêm
  const thongTinTt = new Map<string, { so: string; ngay: string; loaiCt: string; dienGiai: string; ghiChu: string; to: string }>()
  const ctTtMua = new Set<string>()
  duyetPhieu(s, ({ mod, r, cfgR, ds, goc }) => {
    if (mod.key === 'tien') thongTinTt.set(String(r.id), { so: goc.so, ngay: goc.ngay, loaiCt: goc.loaiCt, dienGiai: goc.dienGiai, ghiChu: goc.ghiChu, to: goc.to })
    else if (muaSinhButToan(mod.key, cfgR.prefix, ds) && r._httt !== 'congno') { const id = (r._ctTt as { id?: string } | undefined)?.id; if (id) ctTtMua.add(id) }
  })
  duyetPhieu(s, ({ mod, sc, r, ma, cfgR, ds, goc }) => {
    if (mod.key === 'tien' && ctTtMua.has(String(r.id))) return
    const dsRieng = ds.filter(d => d.tkNo && d.tkCo)
    // Phiếu mua hàng, hoá đơn mua: bút toán theo từng dòng hàng (Tk kho, Tk thuế, Tk thanh toán, chi phí vận chuyển).
    // Số chứng từ: dòng Nợ Tk kho là số phiếu mua; thanh toán luôn thì các bên còn lại là số chứng từ thanh toán (phiếu chi, uỷ nhiệm chi)
    if (muaSinhButToan(mod.key, cfgR.prefix, ds) && !dsRieng.length) {
      const httt = (r._httt as 'congno' | 'tienmat' | 'chuyenkhoan' | undefined) ?? 'congno'
      const ctTt = r._ctTt as { id?: string; so?: string } | undefined
      const tkPhieu = tkPhieuMua(r, httt, String(r._quy ?? ''))   // Tk thanh toán, Tk thuế user đã sửa ở đầu phiếu (T964)
      const bt = butToanMua(ds, tkPhieu.tt, { khongKho: cfgR.khongKho, dvVc: String(r._dvVc ?? ''), soMua: goc.so, soTt: ctTt?.so, soChuaCo: goc.so, thanhToanNgay: httt !== 'congno', tkThue: tkPhieu.thue, tkCpGoiY: cfgR.khongKho ? tkChiPhiCuaLy(String(r._lyDo ?? ''), s) : undefined })
      const tt = ctTt?.id ? thongTinTt.get(ctTt.id) : undefined
      const gocTt = tt ? { ngay: tt.ngay, loaiCt: tt.loaiCt, dienGiai: tt.dienGiai, ghiChu: tt.ghiChu, to: tt.to } : {}
      bt.forEach((b, i) => {
        const [n, c] = capDong(goc, `${mod.key}-${ma}-${r.id}-${i}`, tkTheoCheDo(b.no, s.cheDo).so, tkTheoCheDo(b.co, s.cheDo).so, b.tien, b.dt ? { ...TRONG, dtCo: b.dt } : TRONG)
        const laTt = (so: string) => so !== goc.so   // khác số phiếu mua là số chứng từ thanh toán
        const dg = b.thue ? `Thuế GTGT - ${b.dg}` : b.dg   // diễn giải theo tên hàng, dòng thuế thêm Thuế GTGT
        out.push({ ...n, ...(laTt(b.soNo) ? gocTt : {}), dienGiai: dg, so: b.soNo }, { ...c, ...(laTt(b.soCo) ? gocTt : {}), dienGiai: dg, so: b.soCo })
      })
      return
    }
    if (dsRieng.length) {
      dsRieng.forEach((d, i) => out.push(...capDong({ ...goc, ghiChu: d.ghiChu || goc.ghiChu }, `${mod.key}-${ma}-${r.id}-${i}`, String(d.tkNo), String(d.tkCo), Number(d.tien) || 0, chiTietDong(d))))
    } else {
      const bt = tinhButToan(cfgR, ds, Number(r.tong ?? r.tien) || 0, 0, Number(r.thue) || 0, goc.doiTuong, String(r.cn ?? ''), s.cheDo, mod.key === 'mua-hang' ? 'mua' : 'ban', undefined, mod.key === 'mua-hang' && ['MSC', 'TLN', 'CPM', 'BSHD'].includes(cfgR.prefix) ? tkPhieuMua(r, (r._httt as 'congno' | 'tienmat' | 'chuyenkhoan' | undefined) ?? 'congno', String(r._quy ?? '')) : tkPhieuSua(r))   // T966: phiếu mua phụ mặc định theo hình thức thanh toán
      for (let i = 0; i + 1 < bt.length; i += 2) out.push(...capDong(goc, `${mod.key}-${ma}-${r.id}-${i / 2}`, bt[i].so, bt[i + 1].so, bt[i].tien))
    }
    // Phiếu chi có hoá đơn: mỗi dòng kê khai thêm cặp thuế, Nợ TK thuế, Có tài khoản Có của dòng chi tiết
    if (r._coHd) (r._kkHd as { tkThue: string; tkDu: string; thue: number }[] | undefined)?.forEach((k, i) => {
      if (k.tkThue && k.tkDu && k.thue > 0) out.push(...capDong(goc, `${mod.key}-${ma}-${r.id}-t${i}`, k.tkThue, k.tkDu, k.thue))
    })
  }, true)
  // Ngày mới nhất lên đầu; sort ổn định nên cặp Nợ, Có và thứ tự phân hệ trong cùng ngày giữ nguyên
  const ms = (d: DongButToan) => docNgay(d.ngay.split(' ')[0])?.getTime() ?? 0
  return apQuyTac(out.sort((a, b) => ms(b) - ms(a)))
}

/** Chuyển mã tài khoản: đổi tài khoản từ → sang trên các chứng từ trong khoảng ngày. Phiếu có dòng Nợ, Có lưu riêng được sửa thẳng, mọi phiếu được ghi thành quy tắc áp lên danh sách. Trả về số chứng từ đã đổi */
export function chuyenMaTaiKhoan(s: SPhien, q: QuyTacChuyen): number {
  const da = new Set<string>()
  duyetPhieu(s, ({ mod, sc, r, ds, goc }) => {
    if (!trongQt(goc.ngay, q, goc.loaiCt)) return
    const thay = (x?: string) => (x === q.tu ? q.sang : x)
    if (ds.some(d => d.tkNo === q.tu || d.tkCo === q.tu)) {
      suaPhieu(`${mod.key}/${sc.slug}`, String(r.id), { _dong: ds.map(d => ({ ...d, tkNo: thay(d.tkNo), tkCo: thay(d.tkCo) })) })
      da.add(goc.to)
    }
  })
  QUY_TAC.push(q)
  return da.size
}

const COLS_GOC: Col[] = [
  { k: 'ngay', t: 'Ngày', w: 100 },
  { k: 'so', t: 'Số chứng từ', w: 120, cls: 'code', r: r => r.to ? <Link className="ds-link-so" to={r.to} onClick={e => e.stopPropagation()} title="Mở chứng từ gốc">{r.so}</Link> : r.so },
  { k: 'loaiCt', t: 'Loại chứng từ', w: 150 },
  { k: 'dienGiai', t: 'Diễn giải', w: 240 },
  { k: 'tk', t: 'Tài khoản', w: 90 },
  { k: 'tkDoiUng', t: 'TK đối ứng', w: 90 },
  { k: 'no', t: 'Số tiền nợ', num: true, w: 130, r: r => (r.no ? money(r.no) : '') },
  { k: 'co', t: 'Số tiền có', num: true, w: 130, r: r => (r.co ? money(r.co) : '') },
  { k: 'dt', t: 'Đối tượng', w: 150 },
  { k: 'dtDu', t: 'Đối tượng đ/ứ', w: 150 },
  { k: 'cv', t: 'Công việc', w: 130 },
  { k: 'cvDu', t: 'Công việc đ/ứ', w: 130 },
  { k: 'tp', t: 'Thành phẩm', w: 130 },
  { k: 'tpDu', t: 'Thành phẩm đ/ứ', w: 130 },
  { k: 'vt', t: 'VTHH', w: 130 },
  { k: 'vtDu', t: 'VTHH đ/ứ', w: 130 },
  { k: 'ghiChu', t: 'Ghi chú', w: 200 },
  { k: 'tinhChat', t: 'Tính chất', c: true, w: 80 },
]
const COLS: Col[] = COLS_GOC.map(c => ({ ...c, wCung: true }))   // rộng đúng w: gõ lọc, đổi trang không làm cột đổi độ rộng; người dùng kéo giãn thì giữ độ rộng đã kéo
interface GtLoc { thoiGian: KhoangNgay; tim: string; so: string; tk: string[]; tkDoiUng: string[]; doiTuong: string[]; cv: string[]; tp: string[]; vt: string[]; loaiCt: string[] }
const locMacDinh = (): GtLoc => ({ thoiGian: thangMacDinh(), tim: '', so: '', tk: [], tkDoiUng: [], doiTuong: [], cv: [], tp: [], vt: [], loaiCt: [] })
const NGAY = (r: Row) => String(r.ngay).split(' ')[0]
const CO_DINH = new Set(['ngay', 'so'])
const COT_CONG = ['no', 'co']
const BO_GOM = new Set(['so', 'dienGiai', 'no', 'co'])
const chuCot = (k: string, r: Row): string => { const v = r[k]; return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '') }
const kieuCot = (k: string): KieuLoc => k === 'ngay' ? 'ngay' : k === 'no' || k === 'co' ? 'so' : 'chon'
const congCot = (ds: Row[]) => Object.fromEntries(COT_CONG.map(k => [k, ds.reduce((a, r) => a + (Number(r[k]) || 0), 0)]))

/** Trạng thái danh sách giữ qua lần mở chứng từ gốc: đóng chứng từ về đúng trang, lọc cột, gom nhóm, vị trí cuộn như lúc rời đi; dữ liệu vẫn dựng lại */
const GIU = new Map<string, { trang: number; coTrang: number; locCot: Record<string, GiaTriLoc>; nhomCols: string[]; expandMap: Map<string, boolean>; cuon: { x: number; y: number } }>()

export function DanhSachButToan({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const [phienBan, setPhienBan] = useState(0)   // tăng sau khi Chuyển mã tài khoản để dựng lại danh sách
  const path = `/app/${mod.key}/${sc.slug}`
  const tatCa = useMemo(() => gomButToan(s), [s.donVi, s.cheDo, s.goi, s.dongBoThuChi, s.mapPttt, phienBan])   // eslint-disable-line react-hooks/exhaustive-deps
  const loc0 = useLocNhap(locMacDinh, `ds:${path}`)
  const { nhap, dat, ap } = loc0
  const giu = GIU.get(path)
  const [trang, setTrang] = useState(giu?.trang ?? 1)
  const [coTrang, setCoTrang] = useState(giu?.coTrang ?? 50)
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>(giu?.locCot ?? {})
  const [nhomCols, setNhomCols] = useState<string[]>(giu?.nhomCols ?? [])
  const [expandMap, setExpandMap] = useState<Map<string, boolean>>(() => giu?.expandMap ?? new Map())
  const cuonHt = () => { const w = document.querySelector<HTMLElement>('.page-voucher .tbl-wrap'); return { x: w?.scrollLeft ?? 0, y: w?.scrollTop ?? 0 } }
  GIU.set(path, { trang, coTrang, locCot, nhomCols, expandMap, cuon: GIU.get(path)?.cuon ?? { x: 0, y: 0 } })
  // Rời màn (mở chứng từ gốc) thì nhớ vị trí cuộn; về lại thì cuộn về chỗ cũ
  useLayoutEffect(() => () => { const g = GIU.get(path); if (g) g.cuon = cuonHt() }, [path])   // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const c = GIU.get(path)?.cuon, w = document.querySelector<HTMLElement>('.page-voucher .tbl-wrap')
    if (c && w) { w.scrollLeft = c.x; w.scrollTop = c.y }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps
  const cot = useCotDs(path, COLS, CO_DINH)
  const tenCotMap = useMemo(() => Object.fromEntries(cot.colsDu.map(c => [c.k, c.t || c.k])), [cot.colsDu])
  const dsCotGom = useMemo(() => new Set(cot.colsDu.filter(c => !BO_GOM.has(c.k)).map(c => c.k)), [cot.colsDu])

  const ds = useMemo(() => {
    const tk = fold(ap.tim), so = fold(ap.so)
    const co = (g: string[], ...v: string[]) => g.length === 0 || v.some(x => x && g.includes(x))
    return tatCa.filter(d => {
      const r = d as unknown as Row
      if (!trongKhoang(docNgay(NGAY(r)), ap.thoiGian)) return false
      if (tk && !fold(`${d.so} ${d.loaiCt} ${d.dienGiai} ${d.tk} ${d.tkDoiUng} ${d.doiTuong} ${d.dt} ${d.dtDu} ${d.ghiChu}`).includes(tk)) return false
      if (so && !fold(d.so).includes(so)) return false
      if (!co(ap.tk, d.tk) || !co(ap.tkDoiUng, d.tkDoiUng) || !co(ap.loaiCt, d.loaiCt)) return false
      if (!co(ap.doiTuong, d.dt, d.dtDu) || !co(ap.cv, d.cv, d.cvDu) || !co(ap.tp, d.tp, d.tpDu) || !co(ap.vt, d.vt, d.vtDu)) return false
      for (const [k, g] of Object.entries(locCot)) {
        if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? docNgay(NGAY(r)) : undefined)) return false
      }
      return true
    })
  }, [tatCa, ap, locCot])
  const luaChon = (f: (d: DongButToan) => string[]): MucHaiCot[] => [...new Set(tatCa.flatMap(f).filter(Boolean))].sort().map(v => ({ v }))
  // Pro: sau khi thiết lập lại hệ thống tài khoản, chứng từ còn dùng tài khoản tổng hợp thì cảnh báo như danh sách Thu chi
  const tkTongHop = useMemo(() => {
    const he = heThongTk(s.cheDo), chiTiet = new Set(locTkChiTiet(he, s.goi).map(x => x.so)), cha = new Set(he.filter(x => x.laCha).map(x => x.so))
    const so = new Set<string>(), tk = new Set<string>()
    for (const d of tatCa) {
      if (!trongKhoang(docNgay(d.ngay.split(' ')[0]), ap.thoiGian)) continue   // chỉ tính chứng từ trong kỳ đang xem, khớp với dòng trên lưới
      for (const x of [d.tk, d.tkDoiUng]) if (!chiTiet.has(x) && cha.has(x)) { so.add(d.to); tk.add(x) }
    }
    return { so: so.size, tk: [...tk] }
  }, [tatCa, s.cheDo, s.goi, ap.thoiGian])
  const dsTk = useMemo(() => [...new Set(tatCa.map(d => d.tk))].sort().map((v): MucHaiCot => ({ v, t: tenTk(v), ma: v })), [tatCa])
  const dsLoaiCt = useMemo(() => luaChon(d => [d.loaiCt]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsDt = useMemo(() => luaChon(d => [d.dt, d.dtDu]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsCv = useMemo(() => luaChon(d => [d.cv, d.cvDu]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsTp = useMemo(() => luaChon(d => [d.tp, d.tpDu]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsVt = useMemo(() => luaChon(d => [d.vt, d.vtDu]), [tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
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
  // Chuyển mã tài khoản: Từ tài khoản chọn cả tài khoản tổng hợp, Sang tài khoản chỉ tài khoản chi tiết
  const [ct, setCt] = useState<{ tu: string; sang: string; tuNgay: string; denNgay: string; loaiCt: string[] } | null>(null)
  const [hoiCt, setHoiCt] = useState(false)
  const heTk = useMemo(() => heThongTk(s.cheDo), [s.cheDo])
  const dsTu = useMemo(() => heTk.map(x => ({ v: x.so, t: x.so })), [heTk])
  const dsSang = useMemo(() => locTkChiTiet(heTk, 'PR').map(x => ({ v: x.so, t: x.so })), [heTk])
  // Khoảng ngày mặc định: từ phát sinh đầu tiên đến phát sinh cuối cùng của tài khoản chọn (không có thì theo kỳ đang lọc)
  const khoangCuaTk = (tu: string) => {
    const co = tatCa.filter(d => d.tk === tu || d.tkDoiUng === tu)
    const trongKy = co.filter(d => trongKhoang(docNgay(d.ngay.split(' ')[0]), ap.thoiGian))   // ưu tiên kỳ đang xem
    const ng = (trongKy.length ? trongKy : co).map(d => docNgay(NGAY(d as unknown as Row)).getTime())
    return trongKy.length ? { tuNgay: dmy(ap.thoiGian.tu), denNgay: dmy(ap.thoiGian.den) } : ng.length ? { tuNgay: dmy(new Date(Math.min(...ng))), denNgay: dmy(new Date(Math.max(...ng))) } : { tuNgay: dmy(ap.thoiGian.tu), denNgay: dmy(ap.thoiGian.den) }
  }
  const moChuyen = () => { const tu = tkTongHop.tk[0] ?? ''; setCt({ tu, sang: '', ...khoangCuaTk(tu), loaiCt: [] }) }
  const quyTac = ct && ct.tu && ct.sang && ct.tu !== ct.sang && ct.tuNgay && ct.denNgay && docNgay(ct.tuNgay) <= docNgay(ct.denNgay) ? { tu: ct.tu, sang: ct.sang, tuNgay: docNgay(ct.tuNgay), denNgay: docNgay(ct.denNgay), loaiCt: ct.loaiCt } : null
  const anhHuong = useMemo(() => {
    if (!quyTac) return { phieu: 0, dong: 0 }
    const dongKhop = tatCa.filter(d => (d.tk === quyTac.tu || d.tkDoiUng === quyTac.tu) && trongQt(d.ngay, quyTac, d.loaiCt))
    return { phieu: new Set(dongKhop.map(d => d.to)).size, dong: dongKhop.length }
  }, [quyTac?.tu, quyTac?.tuNgay, quyTac?.denNgay, quyTac?.loaiCt, tatCa])   // eslint-disable-line react-hooks/exhaustive-deps
  const thucHienChuyen = () => {
    if (!quyTac) return
    chuyenMaTaiKhoan(s, quyTac)
    setPhienBan(v => v + 1); setHoiCt(false); setCt(null)
    toast(`Đã chuyển tài khoản ${quyTac.tu} sang ${quyTac.sang}`, { phu: `${anhHuong.phieu} chứng từ, ${anhHuong.dong} dòng bút toán` })
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
          {tkTongHop.so > 0 && (
            <div className="ds-canh-bao-dong" title={`${tkTongHop.so} chứng từ đang dùng tài khoản tổng hợp (${tkTongHop.tk.join(', ')}). Mở chứng từ, chọn tài khoản chi tiết rồi lưu lại.`}>
              <Note kind="warn" icon="alert">
                <span className="ds-cb-chu">{tkTongHop.so} chứng từ đang dùng tài khoản tổng hợp ({tkTongHop.tk.join(', ')}). Mở chứng từ, chọn tài khoản chi tiết rồi lưu lại.</span>
                <button type="button" className="btn sm" onClick={moChuyen}>Chuyển tài khoản</button>
              </Note>
            </div>
          )}
          <div className="ds-toolbar-phai">
            <NutExcel label={<IconExcel />} onNhap={() => undefined} onXuat={() => undefined} />
            <NutTuyChinhCot icon={<IconFigmaSliders />} cols={cot.colsDu} an={cot.an} coDinh={CO_DINH} macDinh={cot.macDinh} dongBang={cot.dongBang}
              gom={{ duoc: dsCotGom, ds: nhomCols, dat: setNhomCols }} onLuu={cot.luu} onDoRongTuDong={cot.datDoRongTuDong} />
          </div>
        </div>
        <Table cols={cot.colsHien} rows={hien} motDong keDoc doRong={cot.doRong} onToggleGroup={doiNhom}
          loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set<string>(), kieu: c => kieuCot(c.k), layLuaChon: k => dsGiaTri(tatCa as unknown as Row[], r => chuCot(k, r)) }}
          sum={{ ngay: String(nhomCols.length ? ds.length : trangs.length), ...congCot(nhomCols.length ? ds : trangs) }} />
        <PhanTrang tong={ds.length} tongCong={congCot(ds)} trang={trangHt} coTrang={coTrang} dsCoTrang={[50, 100, 200]} onTrang={setTrang} onCoTrang={c => { setCoTrang(c); setTrang(1) }} />
        {ds.length === 0 && <div className="ds-trong-luoi">Không có bút toán khớp bộ lọc. Bỏ điều kiện lọc ở thanh lọc hoặc trên tiêu đề cột để xem lại dữ liệu.</div>}
      </section>
      {ct && !hoiCt && (
        <ThongBao loai="thongTin" nhan="Chuyển mã tài khoản" tieuDe="Chuyển mã tài khoản"
          moTa="Chuyển mã tài khoản vào các chứng từ đã phát sinh trong kỳ."
          nut={{ ten: 'Chuyển', tat: !quyTac || anhHuong.dong === 0, onClick: () => setHoiCt(true) }} nutPhu="Huỷ bỏ" onDong={() => setCt(null)}>
          <div className="ds-chuyen-tk" style={{ display: 'grid', gap: 10, textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Từ tài khoản<Select value={ct.tu} ds={[{ v: '', t: 'Chọn' }, ...dsTu]} onChange={e => setCt({ ...ct, tu: e.target.value, ...khoangCuaTk(e.target.value) })} aria-label="Từ tài khoản" /></label>
              <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Sang tài khoản<Select value={ct.sang} ds={[{ v: '', t: 'Chọn' }, ...dsSang]} onChange={e => setCt({ ...ct, sang: e.target.value })} aria-label="Sang tài khoản" /></label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Từ ngày<ONgay value={ct.tuNgay} onChange={v => setCt({ ...ct, tuNgay: v })} ariaLabel="Từ ngày" /></label>
              <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Đến ngày<ONgay value={ct.denNgay} onChange={v => setCt({ ...ct, denNgay: v })} ariaLabel="Đến ngày" /></label>
            </div>
            {quyTac && anhHuong.dong === 0 && <div style={{ fontSize: 12, color: '#b45309' }}>Không có chứng từ nào dùng tài khoản {quyTac.tu} trong khoảng ngày và loại chứng từ đã chọn.</div>}
            <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Loại chứng từ
              <ChonHaiCot chip ds={dsLoaiCt} value={ct.loaiCt} onChange={v => setCt({ ...ct, loaiCt: v })} nhan="Loại chứng từ" goiY="Tất cả loại chứng từ" btnClass="ds-o-sel" />
            </label>
          </div>
        </ThongBao>
      )}
      {ct && hoiCt && quyTac && (
        <ThongBao loai="canhBao" nhan="Chuyển mã tài khoản" tieuDe="Bạn có chắc chắn muốn chuyển tài khoản không?"
          moTa={`Đổi tài khoản ${quyTac.tu} sang ${quyTac.sang} trên các chứng từ từ ${ct.tuNgay} đến ${ct.denNgay}, ${ct.loaiCt.length ? `loại ${ct.loaiCt.join(', ')}` : 'mọi loại chứng từ'}.`}
          anhHuong={[{ nhan: 'Chứng từ ảnh hưởng', gt: String(anhHuong.phieu), mau: 'vang' }, { nhan: 'Dòng bút toán', gt: String(anhHuong.dong), mau: 'vang' }]}
          nut={{ ten: 'Xác nhận', onClick: thucHienChuyen }} nutPhu={{ ten: 'Huỷ bỏ', onClick: () => setHoiCt(false) }} onDong={() => setHoiCt(false)} />
      )}
    </div>
  )
}
