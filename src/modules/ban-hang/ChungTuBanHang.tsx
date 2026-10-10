// Chứng từ bán hàng: mỗi chi nhánh một chứng từ mỗi ngày, gom từ đơn POS trên FABi. Số khớp KQKD, Tổng quan.
import { useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { chiNhanhHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHE_DO } from '../../app/che-do'
import { CHI_NHANH, DAILY, HANG, cnTen, soBH } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead } from '../../ui/Page'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { St, Table } from '../../ui/Table'
import { dmy, fold, money, moneyD, rng } from '../../ui/format'
import { Popover, Select } from '../../ui/Dropdown'
import { PhanTrang } from '../../ui/PhanTrang'
import { useDaXoa, xoaPhieu } from '../../ui/generic/daXoa'
import { ChonKhoangNgay, docNgay, thangNay, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutExcel } from '../../ui/CongCuDs'
import { dangLoc, khopLoc, type GiaTriLoc, type KieuLoc } from '../../ui/LocCot'
import {
  BoLoc, ChipTrangThai, NutHangLoat, NutTuyChinhCot, cotChon, dsChipTT, khopChipTT, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef,
} from '../../ui/LocNangCao'
import { HopInChungTu, type PhieuIn } from '../../ui/bao-cao/InChungTu'
import { TT_CT } from '../../ui/generic/gen'
import { DaiTong } from '../../ui/generic/ChungTuForm'
import { HopCotPhieu } from '../../ui/generic/BangSua'
import { HopDongBo } from '../../ui/HopDongBo'

/** Bán hàng ngoài POS: tiệc mang về, khách công ty đặt trước. Lập tay, không qua FABi; là tab Bán hàng 3.1.7 từ gói Plus (T52) */
export const NGOAI_POS: VoucherCfg = {
  prefix: 'BH', doiTuong: 'kh', nhan: 'Khách hàng', them: 'Thêm phiếu bán hàng', dong: 'hang', tien: [0, 0], nguon: 'tay', soPhieu: 80, soTT58: 'Sổ doanh thu bán hàng hoá, dịch vụ',
  dienGiai: ['Bán tiệc mang về cho khách công ty', 'Bán set quà Trung thu'], noCo: [['1111', '5111', 'Doanh thu'], ['1111', '33311', 'Thuế GTGT đầu ra'], ['632', '152', 'Giá vốn']],
}

const TY_LE = [0.21, 0.09, 0.12, 0.14, 0.07, 0.15, 0.1, 0.09, 0.03]   // cơ cấu doanh thu theo món trong HANG

/** Giảm giá theo món trên đơn POS (mẫu): tỷ lệ theo vị trí món trong HANG */
const GIAM = [0, 0, 0.1, 0, 0.05, 0, 0, 0.1, 0]

/** Dòng món của chứng từ có giảm giá (T102): đơn giá là giá món trong danh mục, thành tiền = số lượng × đơn giá,
 *  tiền giảm đúng tỷ lệ khuyến mãi. Tổng tiền các dòng cộng lại vẫn bằng doanh thu ngày: phần chênh dồn vào món cuối
 *  (món vốn nhận phần dư khi chia doanh thu theo món) */
function dongMonGiam(dt: number, vat: number) {
  const ds = dongMon(dt).map((d, i) => {
    const r = GIAM[i] ?? 0
    if (!r) return { ...d, thanh: d.tien, giam: 0, pt: 0, ghiChu: '' }
    // món khuyến mãi: số lượng tính lại để doanh thu sau giảm sát doanh thu của món
    const sl = Math.max(1, Math.round(d.tien / (d.gia * (1 - r))))
    const thanh = sl * d.gia
    const giam = Math.round(thanh * r / 100) * 100
    const tien = thanh - giam
    return { ...d, sl, thanh, giam, tien, thue: Math.round(tien * d.ts / 100), pt: r * 100, ghiChu: 'Khuyến mãi giờ vàng' }
  })
  const cuoi = ds[ds.length - 1]
  const lech = dt - ds.reduce((a, d) => a + d.tien, 0)
  cuoi.tien += lech
  cuoi.thanh += lech
  cuoi.thue = Math.round(cuoi.tien * cuoi.ts / 100)
  // Thuế từng món cộng lại bằng thuế GTGT của ngày (T103): phần lệch làm tròn dồn vào món có thuế lớn nhất
  const lon = ds.reduce((a, d) => (d.thue > a.thue ? d : a), ds[0])
  lon.thue += vat - ds.reduce((a, d) => a + d.thue, 0)
  // Các khoản của đơn POS theo từng món (T106); dữ liệu mẫu bằng 0. Bảng không có cột Tổng tiền, tổng ở dải đáy
  // Doanh thu trước thuế = thành tiền − giảm giá − chiết khấu + phí dịch vụ + phí vận chuyển; cộng lại bằng doanh thu ngày
  return ds.map(d => {
    const o = { ptCk: 0, ck: 0, ptPhiDv: 0, phiDv: 0, giamThue: 0, phiVc: 0 }
    return { ...d, ...o, dtTruocThue: d.thanh - d.giam - o.ck + o.phiDv + o.phiVc }
  })
}

/** Dòng món của một hoá đơn FABi (T107): 1 tới 3 món, món cuối nhận phần dư; không giảm giá; thuế chia theo tiền món */
function dongMonDon(x: XPos) {
  const r = rng(`mon-${x.seed}`)
  const k = 1 + Math.floor(r() * 3)
  const chon: typeof HANG = []
  while (chon.length < k) { const h = HANG[Math.floor(r() * HANG.length)]; if (!chon.includes(h)) chon.push(h) }
  let con = x.dt
  const ds = chon.map((h, i) => {
    let sl = 1 + Math.floor(r() * 2), tien = sl * h.gia
    if (i === chon.length - 1 || tien >= con) { tien = con; sl = Math.max(1, Math.round(con / h.gia)) }
    con -= tien
    return { h, sl, tien }
  }).filter(d => d.tien > 0)
  const thue = chiaTheo(x.vat, ds.map(d => d.tien), 1)
  return ds.map((d, i) => ({
    ...d.h, stt: i + 1, sl: d.sl, tien: d.tien, thanh: d.tien, giam: 0, pt: 0, ghiChu: '', thue: thue[i],
    ptCk: 0, ck: 0, ptPhiDv: 0, phiDv: 0, giamThue: 0, phiVc: 0, dtTruocThue: d.tien,
  }))
}

/** Dòng món của chứng từ: hoá đơn FABi lấy món của đơn, chứng từ gộp chia doanh thu theo cơ cấu món */
function dongCuaPhieu(x: NgayPOS) {
  return (x as XPos).loai === 'don' ? dongMonDon(x as XPos) : dongMonGiam(x.dt, x.vat)
}

function dongMon(dt: number) {
  let con = dt
  return HANG.map((h, i) => {
    const tien = i === HANG.length - 1 ? con : Math.round(dt * TY_LE[i] / h.gia) * h.gia
    con -= tien
    const sl = Math.max(1, Math.round(tien / h.gia))
    return { ...h, sl, tien, thue: Math.round(tien * h.ts / 100), stt: i + 1 }
  })
}

// ── Cách đồng bộ bán hàng FABi (T107): mỗi hoá đơn một chứng từ, hoặc tổng hợp theo kênh mỗi ngày, chi nhánh ──
type NgayPOS = (typeof DAILY)[number]
/** Một chứng từ Xuất bán POS: số liệu của phần doanh thu ngày mà chứng từ gánh; loai 'don' là một hoá đơn FABi */
export type XPos = NgayPOS & { kenh: string; gio: string; loai: 'don' | 'kenh'; seed: string }
const KENH: [string, string][] = [['tq', 'Tại quán'], ['mv', 'Mang về'], ['app', 'App giao đồ ăn']]
const KT_FABI = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
/** Số hoá đơn FABi 12 ký tự, cố định theo hạt giống */
function soFabi(seed: string) {
  const r = rng(seed)
  return Array.from({ length: 12 }, () => KT_FABI[Math.floor(r() * KT_FABI.length)]).join('')
}
/** Chia doanh thu ngày cho các phần theo tỷ lệ; phần cuối nhận số dư để cộng lại đúng số ngày */
function chiaTheo(tong: number, ty: number[], tron = 1000) {
  const s = ty.reduce((a, b) => a + b, 0) || 1
  let con = tong
  return ty.map((t, i) => {
    if (i === ty.length - 1) return con
    const v = Math.round(tong * t / s / tron) * tron
    con -= v
    return v
  })
}
/** Tổng hợp theo kênh: tại quán, mang về chia phần thu tại quầy 70/30; app giao đồ ăn theo tiền app */
function theoKenh(x: NgayPOS): XPos[] {
  const tt = x.tm + x.ck + x.the + x.app || 1
  const ty = [(1 - x.app / tt) * 0.7, (1 - x.app / tt) * 0.3, x.app / tt]
  const dt = chiaTheo(x.dt, ty), vat = chiaTheo(x.vat, ty, 1), don = chiaTheo(x.don, ty, 1), gv = chiaTheo(x.gv, ty)
  const quay = x.tm + x.ck + x.the || 1
  return KENH.map(([ma, ten], i) => {
    const tien = dt[i] + vat[i]
    const app = ma === 'app' ? tien : 0
    const [tm, ck, the] = ma === 'app' ? [0, 0, 0] : chiaTheo(tien, [x.tm / quay, x.ck / quay, x.the / quay])
    return { ...x, dt: dt[i], vat: vat[i], don: don[i], gv: gv[i], tm, ck, the, app, kenh: ten, gio: '23:30', loai: 'kenh' as const, seed: `${x.cn}-${dmy(x.date)}-${ma}` }
  }).filter(p => p.dt > 0)
}
/** Chi tiết: mỗi đơn POS một hoá đơn; giờ trải từ 09:00 tới 22:00, kênh và phương thức theo tỷ lệ của ngày */
function theoDon(x: NgayPOS): XPos[] {
  const r = rng(`don-${x.cn}-${dmy(x.date)}`)
  const n = Math.max(1, x.don)
  const w = Array.from({ length: n }, () => 0.4 + r())
  const dt = chiaTheo(x.dt, w), vat = chiaTheo(x.vat, w, 1), gv = chiaTheo(x.gv, w)
  const tt = x.tm + x.ck + x.the + x.app || 1
  return dt.map((d, i) => {
    const p = r() * tt
    const pt = p < x.app ? 'app' : p < x.app + x.tm ? 'tm' : p < x.app + x.tm + x.ck ? 'ck' : 'the'
    const kenh = pt === 'app' ? 'App giao đồ ăn' : r() < 0.7 ? 'Tại quán' : 'Mang về'
    const phut = 9 * 60 + Math.floor((i + r()) * 13 * 60 / n)
    const tien = d + vat[i]
    return {
      ...x, dt: d, vat: vat[i], gv: gv[i], don: 1, tm: pt === 'tm' ? tien : 0, ck: pt === 'ck' ? tien : 0, the: pt === 'the' ? tien : 0, app: pt === 'app' ? tien : 0,
      kenh, gio: `${String(Math.floor(phut / 60)).padStart(2, '0')}:${String(phut % 60).padStart(2, '0')}`, loai: 'don' as const, seed: `${x.cn}-${dmy(x.date)}-${i}`,
    }
  })
}

export function ChungTuBanHang({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const { s } = useSession()
  const { ban, laDaXoa } = useDaXoa(`${mod.key}/${sc.slug}`)
  const cach = s.dongBoFabi ?? 'kenh'
  const tatCa = useMemo(() => DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().flatMap(x => (cach === 'chiTiet' ? theoDon(x).reverse() : theoKenh(x)))
    .map((x, i) => ({
      id: String(i), so: soFabi(`fabi-${x.seed}`), ngay: `${dmy(x.date)} ${x.gio}`, thang: x.date.getMonth() + 1, cn: cnTen(x.cn), x, kenh: x.kenh,
      dienGiai: x.loai === 'don' ? `Hoá đơn FABi ${x.kenh.toLowerCase()} ${x.gio} ngày ${dmy(x.date).slice(0, 5)}` : `Doanh thu ${x.kenh.toLowerCase()} ${x.don} đơn POS ngày ${dmy(x.date).slice(0, 5)}`,
      doiTuong: 'Khách lẻ POS',
      tien: x.dt, thue: x.vat, tong: x.dt + x.vat, nguon: 'FABi', tt: i < 3 ? 'nhap' : x.cn === 'q5' && x.date.getDate() === 5 && x.date.getMonth() === 9 && i % 7 === 0 ? 'loi' : 'ghi',
    })), [cach])
  const rows = useMemo(() => tatCa.filter(r => !laDaXoa(r.id)), [tatCa, ban])
  if (id === 'moi') return <Navigate to={duongDan(mod, sc)} replace />   // không lập tay Xuất bán POS (T52)
  if (id) return <ChiTiet sc={sc} mod={mod} row={rows.find(r => r.id === id) ?? rows[0]} />
  return <DanhSach sc={sc} mod={mod} rows={rows} />
}

/** Cột cố định hai đầu, không ẩn, không kéo đổi thứ tự */
const COT_CO_DINH = new Set(['chk', 'stt', 'ngay', 'so'])
/** Cột lọc bằng cách chọn trong danh sách giá trị */
const COT_CHON = new Set(['cn', 'nguon', 'kenh'])

/** Giá trị các ô lọc ngoài và trong Bộ lọc nâng cao. Chuỗi rỗng là tất cả */
interface GtLoc { thoiGian: KhoangNgay; tim: string; cn: string; nguon: string; kh: string; kenh: string; pttt: string }
const locMacDinh = (): GtLoc => ({ thoiGian: thangNay(), tim: '', cn: '', nguon: '', kh: '', kenh: '', pttt: '' })
/** Phương thức thanh toán của chứng từ theo số tiền thu được (T110) */
const PTTT: [keyof NgayPOS, string][] = [['tm', 'Tiền mặt'], ['ck', 'Chuyển khoản, QR'], ['the', 'Thẻ'], ['app', 'App giao đồ ăn']]
const ptttCua = (x: NgayPOS) => PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t)

function DanhSach({ sc, mod, rows }: ScreenProps & { rows: Row[] }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const [chipTT, setChipTT] = useState('all')
  const [moDongBo, setMoDongBo] = useState(false)   // hộp Đồng bộ hoá đơn từ POS (T111)
  const [chon, setChon] = useState<Set<string>>(new Set())
  const [moHangLoat, setMoHangLoat] = useState(false)
  const [moGhiChu, setMoGhiChu] = useState(false)
  const nutGhiChu = useRef<HTMLButtonElement>(null)
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)
  const [tabPanel, setTabPanel] = useState('ct')
  const [panelMo, setPanelMo] = useState(false)
  const kieu = kieuGhiSo(s.cheDo)
  const ghi = kieu !== 'khong'
  // Chi nhánh chọn trên thanh trên (QD17): lọc theo chi nhánh đó, bỏ cột và ô lọc chi nhánh
  const cnChon = chiNhanhHienTai(s)

  const tenTT = (r: Row) => r.tt === 'loi' && ghi ? 'Lệch đối soát' : r.tt === 'nhap' && ghi ? 'Chưa ghi sổ' : 'Đã ghi sổ'
  const kieuCot = (k: string): KieuLoc =>
    k === 'ngay' ? 'ngay' : COT_CHON.has(k) ? 'chon' : k === 'tien' || k === 'thue' || k === 'tong' ? 'so' : 'chu'
  const chuCot = (k: string, r: Row): string => {
    if (k === 'tt') return tenTT(r)
    const v = r[k]
    return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '')
  }
  const luaChon = useMemo(() => Object.fromEntries([...COT_CHON].map(k => [k, [...new Set(rows.map(r => chuCot(k, r)).filter(Boolean))]])), [rows, ghi])

  // Ô lọc: giá trị nháp, bấm Lọc mới áp dụng (T41)
  const apLoc = () => { loc0.loc(); setTrang(1) }
  const chonO = (k: 'cn' | 'nguon' | 'kh' | 'kenh' | 'pttt', ten: string, ds: [string, string][]) => (
    <Select className="ds-o-sel" value={nhap[k]} aria-label={ten} onChange={e => dat(k, e.target.value)}>
      <option value="">Tất cả</option>
      {ds.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </Select>
  )
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay align="end" value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    {
      k: 'tim', ten: 'Tìm kiếm', o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số, diễn giải" title="Tìm theo số chứng từ, diễn giải" aria-label="Tìm kiếm"
        onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />,
    },
    ...(cnChon ? [] : [{ k: 'cn', ten: 'Chi nhánh', o: chonO('cn', 'Chi nhánh', CHI_NHANH.map(c => [c.id, c.ten])) }]),
    // Khách hàng, kênh bán, phương thức thanh toán; lựa chọn lấy từ chính các chứng từ (T110)
    { k: 'kh', ten: 'Khách hàng', o: chonO('kh', 'Khách hàng', [...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].map(v => [v, v])) },
    { k: 'kenh', ten: 'Kênh bán', o: chonO('kenh', 'Kênh bán', [...new Set(rows.map(r => String(r.kenh ?? '')).filter(Boolean))].map(v => [v, v])) },
    // Tổng hợp theo kênh gộp nhiều cách thanh toán nên không lọc theo phương thức (T110)
    ...((s.dongBoFabi ?? 'kenh') === 'chiTiet' ? [{ k: 'pttt', ten: 'Phương thức thanh toán', o: chonO('pttt', 'Phương thức thanh toán', PTTT.map(([, t]) => [t, t])) }] : []),
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'cn'])

  // Lọc theo các ô đã áp dụng, chi nhánh trên thanh trên, hàng lọc từng cột; chip trạng thái lọc sau cùng để đếm số trên chip
  const truocTT = rows.filter(r => {
    const d = r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay)
    if (!trongKhoang(d, ap.thoiGian)) return false
    if (cnChon && r.x?.cn !== cnChon.id) return false
    if (ap.cn && r.x?.cn !== ap.cn) return false
    if (ap.nguon && r.nguon !== ap.nguon) return false
    if (ap.kh && r.doiTuong !== ap.kh) return false
    if (ap.kenh && r.kenh !== ap.kenh) return false
    if (ap.pttt && !ptttCua(r.x).includes(ap.pttt)) return false
    if (ap.tim.trim() && !fold(`${r.so} ${r.dienGiai}`).includes(fold(ap.tim.trim()))) return false
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? d : undefined)) return false
    }
    return true
  })
  const chips = dsChipTT(truocTT, ghi, 'Lệch đối soát')
  const list = truocTT.filter(r => khopChipTT(chipTT, r.tt, ghi))
  const selectedRows = useMemo(() => list.filter(r => chon.has(r.id)), [list, chon])
  const [activeId, setActiveId] = useState<string>(() => list[0]?.id ?? '')
  const activeRow = list.find(r => r.id === activeId) ?? list[0]

  // Phân trang
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const trangHienTai = Math.min(trang, soTrang)
  const pagedRows = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return list.slice(batDau, batDau + coTrang).map((r, i): Row => ({ ...r, stt: batDau + i + 1 }))
  }, [list, trangHienTai, coTrang])

  const sum = (k: string) => pagedRows.reduce((a, r) => a + r[k], 0)
  const tongDs = (k: string) => list.reduce((a, r) => a + (r as Row)[k], 0)
  const cols: Col[] = [
    cotChon(list, chon, setChon, () => setMoHangLoat(true)),
    { k: 'stt', t: 'STT', w: 60, c: true, dinh: 'trai' },
    { k: 'ngay', t: 'Ngày', w: 100, dinh: 'trai' },
    { k: 'so', t: 'Số chứng từ', cls: 'code', w: 150, dinh: 'trai' },
    { k: 'dienGiai', t: 'Diễn giải' },
    { k: 'kenh', t: 'Kênh bán', w: 140 },   // T107
    ...(cnChon ? [] : [{ k: 'cn', t: 'Chi nhánh', cls: 'dim' } as Col]),
    { k: 'tien', t: 'Doanh thu chưa thuế', num: true, w: 160 }, { k: 'thue', t: 'Thuế GTGT', num: true, w: 120 },
    // bỏ cột Nguồn: Xuất bán POS chỉ có nguồn FABi (T109)
    { k: 'tong', t: 'Tổng tiền', num: true, w: 120 },   // Tổng tiền là cột cuối (T48)
  ]
  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn (T41)
  const cot = useCotDs(path, cols, COT_CO_DINH)

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className={`voucher-split${panelMo ? '' : ' gon-ct'}`}>
        <section className="card voucher-top">
          {/* Thanh công cụ: chip trạng thái bên trái; ô lọc, phễu, Lọc, Tuỳ chỉnh cột, Excel, Hàng loạt, Thêm mới | ⌄ (T43) */}
          <div className="ds-thanh">
            <div className="ds-chips-wrap">
              {ghi && <ChipTrangThai ds={chips} chon={chipTT} onChon={k => { setChipTT(k); setTrang(1) }} />}
              <button
                ref={nutGhiChu}
                type="button"
                className="icon-btn sm ds-ghi-chu-fabi"
                title="Đơn POS trên FABi tự gom thành một chứng từ cho mỗi chi nhánh mỗi ngày. Đơn huỷ, trả hàng sau khi chốt ca được điều chỉnh vào chứng từ cùng ngày, không tạo chứng từ trùng."
                aria-label="Ghi chú FABi"
                onClick={() => setMoGhiChu(v => !v)}
              >
                <Icon n="info" className="ic sm" />
              </button>
              <Popover anchor={nutGhiChu} open={moGhiChu} onClose={() => setMoGhiChu(false)} width={320}>
                <div style={{ padding: '10px 14px', fontSize: 13, lineHeight: 1.45, color: 'var(--ink)' }}>
                  <b>Ghi chú FABi</b>
                  <p style={{ margin: '6px 0 0', color: 'var(--body)' }}>
                    Đơn POS trên FABi tự gom thành một chứng từ cho mỗi chi nhánh mỗi ngày. Đơn huỷ, trả hàng sau khi chốt ca được điều chỉnh vào chứng từ cùng ngày, không tạo chứng từ trùng.
                  </p>
                </div>
              </Popover>
            </div>
            <div className="ds-thanh-phai">
              {/* Cách đồng bộ FABi đang dùng, bấm để đổi ở Cấu hình (T107) */}
              <Link className="chip info" to="/app/he-thong/cau-hinh" title={`Đồng bộ FABi ${(s.dongBoFabi ?? 'kenh') === 'chiTiet' ? 'chi tiết theo hoá đơn' : 'tổng hợp theo kênh'}; đổi ở Hệ thống, Cấu hình kế toán`}>
                <Icon n="refresh" className="ic sm" />{(s.dongBoFabi ?? 'kenh') === 'chiTiet' ? 'Chi tiết' : 'Tổng hợp'}
              </Link>
              <BoLoc ds={oLoc} cauHinh={cauHinhLoc} datCauHinh={datCauHinhLoc} dangLoc={loc0.dangLoc} khacNhap={loc0.khacNhap}
                onLoc={apLoc} onXoaHet={loc0.xoaNhap} />
              <NutTuyChinhCot
                cols={cot.colsDu}
                an={cot.an}
                coDinh={COT_CO_DINH}
                macDinh={cot.macDinh}
                dongBang={cot.dongBang}
                onLuu={cot.luu}
                onDoRongTuDong={cot.datDoRongTuDong}
              />
              <NutExcel
                onNhap={() => toast('Nhập chứng từ bán hàng từ file Excel')}
                onXuat={() => toast(`Đã xuất ${list.length} chứng từ ra Excel`)}
              />
              <NutHangLoat
                selectedRows={selectedRows}
                ghi={ghi}
                onBoChon={() => setChon(new Set())}
                onXoa={ids => xoaPhieu(`${mod.key}/${sc.slug}`, ids.map(id => ({ id, so: String(rows.find(r => String(r.id) === id)?.so ?? '') })), s.ten)}
                open={moHangLoat}
                onOpenChange={setMoHangLoat}
              />
              {/* Xuất bán POS chỉ đổ về từ phần mềm bán hàng, không thêm mới bằng tay (T52) */}
              <button type="button" className="btn pri" onClick={() => setMoDongBo(true)} title="Đồng bộ hoá đơn từ POS">
                <Icon n="refresh" className="ic sm" />Đồng bộ POS
              </button>
            </div>
          </div>
          {list.length ? (
            <>
              <Table
                cols={cot.colsHien}
                rows={pagedRows}
                motDong
                keDoc
                doRong={cot.doRong}
                loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['chk', 'stt']),
                  kieu: c => kieuCot(c.k), luaChon }}
                onRow={r => setActiveId(r.id)}
                onDbl={r => nav(`${path}/${r.id}`)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' && ghi ? 'chua-ghi' : '',
                  r.tt === 'loi' && ghi ? 'bad' : '',
                ].filter(Boolean).join(' ')}
                sum={{ stt: 'Tổng trang', tien: sum('tien'), thue: sum('thue'), tong: sum('tong') }}
              />
              <PhanTrang
                tong={list.length}
                tongCong={{ tien: tongDs('tien'), thue: tongDs('thue'), tong: tongDs('tong') }}
                trang={trangHienTai}
                coTrang={coTrang}
                onTrang={setTrang}
                onCoTrang={ct => { setCoTrang(ct); setTrang(1) }}
              />
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Không có chứng từ khớp bộ lọc</b>
              <button
                type="button"
                className="btn sm"
                style={{ marginTop: 10 }}
                onClick={() => { loc0.xoaHet(); setChipTT('all'); setLocCot({}); setTrang(1) }}
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
        </section>

        <section className={`card ct-panel voucher-bottom${panelMo ? '' : ' gon'}`}>
          {activeRow ? (
            panelMo ? (
              <>
                <div className="voucher-bottom-h">
                  <div className="row" style={{ gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                    <Icon n="doc" className="ic sm" />
                    <b style={{ whiteSpace: 'nowrap' }}>Chi tiết {activeRow.so}</b>
                    <span className="dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      ({activeRow.ngay}) — {activeRow.dienGiai}
                    </span>
                  </div>
                  <div className="tabs" style={{ margin: 0, flex: 'none' }}>
                    {[
                      ['ct', 'Hàng bán'],
                      ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'],
                      ['tt', 'Thanh toán'],
                      ['goc', 'Đơn POS gốc'],
                    ].filter(([k]) => k !== 'ht' || kieu !== 'khong').map(([k, l]) => (   // gói Free không có tab Ghi sổ (T82)
                      <button
                        key={k}
                        type="button"
                        className={tabPanel === k ? 'on' : ''}
                        onClick={() => setTabPanel(k)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn sm"
                    style={{ flex: 'none', marginLeft: 8 }}
                    onClick={() => nav(`${duongDan(mod, sc)}/${activeRow.id}`)}
                    title="Mở form toàn màn hình (hoặc đúp chuột vào dòng)"
                  >
                    <Icon n="eye" className="ic sm" />Xem chi tiết
                  </button>
                  <button
                    type="button"
                    className="btn sm ghost"
                    style={{ flex: 'none', marginLeft: 4 }}
                    onClick={() => setPanelMo(false)}
                    title="Thu gọn màn hình chi tiết"
                  >
                    <Icon n="chevd" className="ic sm" />Thu gọn
                  </button>
                </div>
                <div className="voucher-bottom-b">
                  <NoiDungTab x={activeRow.x} tab={tabPanel === 'ht' && kieu === 'khong' ? 'ct' : tabPanel} kieu={kieu} />
                </div>
              </>
            ) : (
              <div
                className="voucher-bottom-h"
                onClick={() => setPanelMo(true)}
                title="Bấm để mở rộng màn hình chi tiết chứng từ"
                style={{ cursor: 'pointer' }}
              >
                <div className="row" style={{ gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                  <Icon n="doc" className="ic sm" />
                  <b style={{ whiteSpace: 'nowrap' }}>Chi tiết {activeRow.so}</b>
                  <span className="dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ({activeRow.ngay}) — {activeRow.dienGiai}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn sm ghost"
                  style={{ flex: 'none', marginLeft: 8 }}
                  onClick={e => { e.stopPropagation(); setPanelMo(true) }}
                  title="Mở màn hình chi tiết chứng từ"
                >
                  <Icon n="chevu" className="ic sm" />Mở chi tiết
                </button>
              </div>
            )
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Chọn một chứng từ ở bảng trên để xem chi tiết</b>
            </div>
          )}
        </section>
      </div>
      {/* Đồng bộ hoá đơn từ POS (T111): khoảng thời gian, chi nhánh (mặc định chi nhánh đang chọn), bỏ qua hoá đơn đã đồng bộ */}
      {moDongBo && (
        <HopDongBo
          tieuDe="Đồng bộ hoá đơn từ POS"
          phu="Chọn khoảng thời gian và chi nhánh cần lấy hoá đơn từ FABi về Xuất bán POS."
          nhanDs="Chi nhánh đồng bộ"
          ds={CHI_NHANH.map(c => ({ ma: c.id, ten: c.ten, phu: `FB-${c.id.toUpperCase()}-01` }))}
          chonSan={cnChon ? [cnChon.id] : []}
          nhanLamLai="Bỏ qua hoá đơn đã đồng bộ"
          ghiChuLamLai="Chỉ lấy hoá đơn còn thiếu, thừa, bị xoá hoặc sửa trên FABi"
          lamLaiMacDinh
          nutChinh="Đồng bộ ngay"
          onDong={() => setMoDongBo(false)}
          onDongBo={({ tu, den, chon, lamLai }) => {
            setMoDongBo(false)
            const ngay = Math.max(1, Math.round((den.getTime() - tu.getTime()) / 864e5) + 1)
            toast(lamLai
              ? `Đã đồng bộ ${chon.length * 3 + 2} hoá đơn thiếu, thừa, xoá, sửa của ${chon.length} chi nhánh, ${dmy(tu)} đến ${dmy(den)}`
              : `Đã đồng bộ lại ${chon.length * ngay * 104} hoá đơn của ${chon.length} chi nhánh, ${dmy(tu)} đến ${dmy(den)}`)
          }}
        />
      )}
    </div>
  )
}

/** Cột bật tắt được của bảng Hàng bán Xuất bán POS (T106); Giảm thuế GTGT, Phí vận chuyển ẩn sẵn, cần thì bật ở Tuỳ chỉnh giao diện */
const COT_POS: [string, string][] = [
  ['ma', 'Mã hàng'], ['dvt', 'ĐVT'], ['sl', 'Số lượng'], ['gia', 'Đơn giá'], ['thanh', 'Thành tiền'], ['pt', 'Giảm giá (%)'], ['giam', 'Tiền giảm giá'],
  ['ptCk', '% CK'], ['ck', 'Tiền CK'], ['ptPhiDv', '% Phí dịch vụ'], ['phiDv', 'Phí dịch vụ'], ['giamThue', 'Giảm thuế GTGT'], ['phiVc', 'Phí vận chuyển'],
  ['dtTruocThue', 'Doanh thu trước thuế'], ['ts', 'Thuế suất'], ['thue', 'Tiền thuế'], ['tonKho', 'Theo dõi tồn kho'],
]
const AN_POS_MAC_DINH = ['giamThue', 'phiVc']

function NoiDungTab({ x, tab, kieu, an = AN_POS_MAC_DINH }: { x: (typeof DAILY)[number]; tab: string; kieu: ReturnType<typeof kieuGhiSo>; an?: string[] }) {
  const dong = dongCuaPhieu(x)
  const ht = [
    { dg: 'Thu tiền mặt', no: '1111', co: '5111, 33311', tien: x.tm },
    { dg: 'Thu chuyển khoản, QR, thẻ', no: '1121', co: '5111, 33311', tien: x.ck + x.the },
    { dg: 'Phải thu app giao đồ ăn', no: '131', co: '5111, 33311', tien: x.app },
    { dg: 'Giá vốn xuất bán theo định lượng', no: '632', co: '152', tien: x.gv },
  ]
  const rowsSo = [
    { so: 'Sổ doanh thu bán hàng hoá, dịch vụ', tien: x.dt },
    { so: 'Sổ theo dõi thuế GTGT', tien: x.vat },
    { so: 'Sổ tiền mặt', tien: x.tm },
    { so: 'Sổ tiền gửi ngân hàng', tien: x.ck + x.the },
  ]
  return (
    <>
      {tab === 'ct' && (
        <Table
          cols={([
            // Thông tin hàng hoá đứng yên bên trái khi cuộn ngang (T106)
            { k: 'stt', t: '#', w: 40, cls: 'dim', dinh: 'trai' },
            { k: 'ma', t: 'Mã hàng', cls: 'code', w: 90, dinh: 'trai' },
            { k: 'ten', t: 'Hàng hoá', w: 200, dinh: 'trai' },
            { k: 'dvt', t: 'ĐVT', w: 70, dinh: 'trai' },
            { k: 'sl', t: 'Số lượng', num: true, w: 90 },
            { k: 'gia', t: 'Đơn giá', num: true, w: 110 },
            { k: 'thanh', t: 'Thành tiền', num: true, w: 120 },
            { k: 'pt', t: 'Giảm giá (%)', num: true, w: 100, r: r => r.pt ? `${r.pt}%` : '' },
            { k: 'giam', t: 'Tiền giảm giá', num: true, w: 120 },
            // Các khoản của đơn POS đưa lên bảng chi tiết (T106)
            { k: 'ptCk', t: '% CK', num: true, w: 70, r: r => r.ptCk ? `${r.ptCk}%` : '' },
            { k: 'ck', t: 'Tiền CK', num: true, w: 110 },
            { k: 'ptPhiDv', t: '% Phí dịch vụ', num: true, w: 110, r: r => r.ptPhiDv ? `${r.ptPhiDv}%` : '' },
            { k: 'phiDv', t: 'Phí dịch vụ', num: true, w: 110 },
            { k: 'giamThue', t: 'Giảm thuế GTGT', num: true, w: 125 },
            { k: 'phiVc', t: 'Phí vận chuyển', num: true, w: 120 },
            { k: 'dtTruocThue', t: 'Doanh thu trước thuế', num: true, w: 150 },
            { k: 'ts', t: 'Thuế suất', num: true, w: 80, r: r => `${r.ts}%` },
            { k: 'thue', t: 'Tiền thuế', num: true, w: 110 },
            // Theo danh mục hàng hoá: tích là mặt hàng theo dõi tồn kho, chỉ xem; cột cuối, cố định phải (T108)
            { k: 'tonKho', t: 'Theo dõi tồn kho', c: true, w: 120, dinh: 'phai', r: r => <input type="checkbox" className="o-tich-xem" checked={Boolean(r.tonKho)} readOnly tabIndex={-1} aria-label="Theo dõi tồn kho" /> },
          ] as Col[]).filter(c => !an.includes(c.k))}
          rows={dong}
          sum={{
            ten: `Tổng cộng (${dong.length} dòng)`,   // nhãn ở cột Hàng hoá để cột # cố định không giãn (T106)
            ...Object.fromEntries((['sl', 'thanh', 'giam', 'ck', 'phiDv', 'giamThue', 'phiVc', 'dtTruocThue', 'thue'] as const)
              .map(k => [k, dong.reduce((a, r) => a + r[k], 0)])),
          }}
        />
      )}
      {tab === 'ht' && (
        <div style={{ padding: 14 }}>
          {kieu === 'khong' && <Note kind="gray">Gói Free không hạch toán. Doanh thu vào báo cáo kết quả kinh doanh, tiền mặt vào sổ quỹ.</Note>}
          {kieu === 'so' && (
            <>
              <Note icon="book">{CHE_DO.TT58.soHieu}: ghi vào sổ doanh thu và sổ tiền, không dùng tài khoản.</Note>
              <div style={{ marginTop: 10 }}>
                <Table
                  cols={[{ k: 'so', t: 'Ghi vào sổ' }, { k: 'tien', t: 'Số tiền', num: true }]}
                  rows={rowsSo}
                  sum={{ so: `Tổng cộng (${rowsSo.length} dòng)`, tien: rowsSo.reduce((a, r) => a + r.tien, 0) }}
                />
              </div>
            </>
          )}
          {kieu === 'noco' && (
            <Table
              cols={[{ k: 'dg', t: 'Diễn giải' }, { k: 'no', t: 'TK Nợ', cls: 'code' }, { k: 'co', t: 'TK Có', cls: 'code' }, { k: 'tien', t: 'Số tiền', num: true }]}
              rows={ht}
              sum={{ dg: `Doanh thu ${moneyD(x.dt)} · thuế ${moneyD(x.vat)}`, tien: x.tm + x.ck + x.the + x.app + x.gv }}
            />
          )}
        </div>
      )}
      {tab === 'tt' && (
        <Table
          cols={[{ k: 'ht', t: 'Hình thức' }, { k: 'tien', t: 'Số tiền', num: true }]}
          rows={[
            { ht: 'Tiền mặt', tien: x.tm },
            { ht: 'Chuyển khoản, QR', tien: x.ck },
            { ht: 'Thẻ', tien: x.the },
            { ht: 'GrabFood, ShopeeFood', tien: x.app },
          ]}
          sum={{ ht: 'Tổng', tien: x.tm + x.ck + x.the + x.app }}
        />
      )}
      {tab === 'goc' && (
        <Table
          cols={[{ k: 'ca', t: 'Ca' }, { k: 'gio', t: 'Giờ chốt' }, { k: 'don', t: 'Số đơn', num: true }, { k: 'tn', t: 'Thu ngân' }]}
          rows={[
            { ca: 'Ca sáng', gio: '14:00', don: Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' },
            { ca: 'Ca tối', gio: '22:30', don: x.don - Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' },
          ]}
          sum={{ ca: 'Tổng: 2 ca', don: x.don }}
        />
      )}
    </>
  )
}

/** Chứng từ Xuất bán POS (T102): vẽ theo form chung IACC, đủ thông tin như chi tiết đơn POS của iFaster.
 *  Phiếu đồng bộ từ FABi, chỉ xem: không sửa, trả hàng, huỷ ở đây */
function ChiTiet({ sc, mod, row }: ScreenProps & { row: Row }) {
  const { s, toast } = useSession()
  const dong0 = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState('ct')
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  // Cột ẩn của bảng Hàng bán, nhớ trên máy người dùng; chưa chỉnh thì ẩn Giảm thuế GTGT, Phí vận chuyển (T106)
  const khoaCot = 'iacc-cot-phieu:ban-hang/3-1-1'
  const [anCot, setAnCot] = useState<string[]>(() => {
    try { const v = JSON.parse(localStorage.getItem(khoaCot) ?? 'null'); return Array.isArray(v) ? v : AN_POS_MAC_DINH } catch { return AN_POS_MAC_DINH }
  })
  const [hopCot, setHopCot] = useState(false)
  const doiAnCot = (an: string[]) => {
    setAnCot(an)
    try { localStorage.setItem(khoaCot, JSON.stringify(an)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
  }
  const x = row.x
  const kieu = kieuGhiSo(s.cheDo)
  // phiếu giảm giá áp cho cả đơn nên ở dải đáy; chiết khấu đã thành cột trên dòng; dữ liệu mẫu bằng 0 (T106)
  const phieuGiam = 0
  const tong = x.dt + x.vat - phieuGiam
  const pttt = [['Tiền mặt', x.tm], ['Chuyển khoản, QR', x.ck], ['Thẻ', x.the], ['App giao đồ ăn', x.app]].filter(([, v]) => Number(v) > 0).map(([t]) => t).join(', ')
  const kenh = (x as XPos).kenh ?? (x.app > 0 ? 'Tại quán, Mang về, App giao đồ ăn' : 'Tại quán, Mang về')
  // In: bảng kê lấy đúng các món của chứng từ, không sinh dòng giả
  const moIn = () => setPhieuIn([{
    sc, row, cfg: NGOAI_POS,
    dong: dongCuaPhieu(x).map(d => ({ stt: d.stt, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, tien: d.tien, thue: d.thue, ts: d.ts })),
  }])
  const [cTt, tTt] = kieu === 'khong' ? ['ok', 'Đã đồng bộ'] : TT_CT[row.tt] ?? ['warn', 'Chưa ghi sổ']
  return (
    <FormToanMan icon={mod.icon} onClose={dong0} title="Xuất bán POS"
      // Phần tổng thành dải cố định ở đáy form, cuộn bảng vẫn thấy (T104); khoản bằng 0 hiện mờ cho gọn
      // các khoản theo món đã lên bảng chi tiết; dải đáy còn khoản của cả đơn và Tổng tiền (T106)
      day={<DaiTong tong={tong} muc={[]} tren={[['Phiếu giảm giá', phieuGiam ? -phieuGiam : 0]]} />}   // Phiếu giảm giá thành hàng ngay trên Tổng tiền
      giua={<span className="fsf-tt xem">Chi tiết phiếu <b>{row.so}</b></span>}
      meta={<><St k={cTt}>{tTt}</St><span className="src">FABi</span><span className="chip info"><Icon n="store" className="ic sm" />{row.cn}</span></>}
      foot={<>
        <span className="grow" />
        <button type="button" className="btn sm" onClick={() => setHopCot(true)} title="Bật tắt cột bảng Hàng bán"><Icon n="chinh" className="ic sm" />Tuỳ chỉnh giao diện</button>
        <button type="button" className="btn sm" onClick={moIn}><Icon n="printer" className="ic sm" />In</button>
        <button type="button" className="btn sm" onClick={dong0}>Đóng (Esc)</button>
      </>}>
      <div className="stack ct-co-dinh" style={{ gap: 14 }}>
        <p className="pos-nhac"><Icon n="info" className="ic sm" />Chứng từ đồng bộ từ FABi: không sửa, trả hàng, xoá trên phiếu này. Sửa đơn trên FABi rồi đồng bộ lại.</p>
        {/* Đầu phiếu chỉ xem nên dạng thông tin gọn: nhãn nhỏ, giá trị, 4 cột × 2 hàng, để bảng chi tiết rộng hơn (T106) */}
        <section className="card pos-dau">
          <div><small>Khách hàng</small><b>Khách lẻ POS</b></div>
          {/* Hoá đơn có một cách thanh toán; chứng từ tổng hợp theo kênh gộp nhiều cách nên bỏ (T110) */}
          {(x as XPos).loai === 'don' && <div><small>Phương thức thanh toán</small><b title={pttt}>{pttt}</b></div>}
          <div><small>Ngày chứng từ</small><b>{dmy(x.date)}</b></div>
          <div><small>{(x as XPos).loai === 'don' ? 'Số chứng từ (số hoá đơn FABi)' : 'Số chứng từ'}</small><b className="code">{row.so}</b></div>
          <div><small>Kênh bán hàng</small><b title={kenh}>{kenh}</b></div>
          <div><small>Thời gian xuất</small><b>{dmy(x.date)} {(x as XPos).gio ?? '23:30'}</b></div>
          <div className="c2"><small>Ghi chú</small><b title={String(row.dienGiai)}>{row.dienGiai}</b></div>
        </section>
        <section className="card ct-than-card">
          <div className="tabs">
            {[['ct', 'Hàng bán'], ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ']].filter(([k]) => k !== 'ht' || kieu !== 'khong').map(([k, l]) => <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          <div className="ct-than"><NoiDungTab x={x} tab={tab} kieu={kieu} an={anCot} /></div>
        </section>
        {row.tt === 'loi' && <Note kind="err" icon="alert">Doanh thu trên FABi lớn hơn sổ 1.250.000 đ. <Link to="/app/tien-ich/11-7">Mở đối soát</Link></Note>}
      </div>
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
      {hopCot && <HopCotPhieu ds={COT_POS} an={anCot} macDinh={AN_POS_MAC_DINH} onDoi={doiAnCot} onDong={() => setHopCot(false)} />}
    </FormToanMan>
  )
}
