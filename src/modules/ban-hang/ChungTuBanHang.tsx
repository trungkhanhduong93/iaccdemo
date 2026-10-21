// Chứng từ bán hàng: mỗi cửa hàng một chứng từ mỗi ngày, gom từ đơn POS trên FABi. Số khớp KQKD, Tổng quan.
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, gtgtTyLe, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CHE_DO } from '../../app/che-do'
import { CUA_HANG, DAILY, HANG, cnTen, soBH } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { NutPhimTat } from '../../ui/BangPhimTat'
import { Card, Note, PageHead } from '../../ui/Page'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { BaoCaoDoRongCtx, St, Table, useDoRongCot } from '../../ui/Table'
import { dmy, fold, money, moneyD, rng } from '../../ui/format'
import { Select } from '../../ui/Dropdown'
import { PhanTrang } from '../../ui/PhanTrang'
import { useDaXoa } from '../../ui/generic/daXoa'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutExcel } from '../../ui/CongCuDs'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc, type LocCot } from '../../ui/LocCot'
import {
  BoLoc, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef,
} from '../../ui/LocNangCao'
import { HopInChungTu, type PhieuIn } from '../../ui/bao-cao/InChungTu'
import { TT_CT, tomTatTenHang } from '../../ui/generic/gen'
import { HopCotPhieu } from '../../ui/generic/BangSua'
import { DS_PTTT } from '../danh-muc/data'
import { giamThueHkd } from './giam-thue'

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

/** Dòng món của một hoá đơn FABi (T113): 1 tới 3 món, món cuối nhận phần dư; không giảm giá; thuế chia theo tiền món */
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

export { giamThueHkd }
/** GTGT theo % doanh thu không có VAT (T450): chia lại tiền các phương thức thanh toán theo tổng = doanh thu − giảm thuế GTGT (T353) */
export function ttHkd<T extends { dt: number; tm: number; ck: number; the: number; app: number }>(x: T): T {
  const cu = x.tm + x.ck + x.the + x.app || 1
  const [tm, ck, the, app] = chiaTheo(x.dt - giamThueHkd(x.dt), [x.tm / cu, x.ck / cu, x.the / cu, x.app / cu], 1)
  return { ...x, tm, ck, the, app }
}

/** Cột theo phương pháp GTGT (T163, T450): theo % doanh thu bỏ Thuế suất, Tiền thuế, luôn hiện Giảm thuế GTGT; khấu trừ luôn hiện Thuế suất, Tiền thuế */
const anTheoLoai = (an: string[], tyLe: boolean) => tyLe ? [...an.filter(k => k !== 'giamThue'), 'ts', 'thue'] : an.filter(k => k !== 'ts' && k !== 'thue')

/** Dòng món của chứng từ: hoá đơn FABi lấy món của đơn, chứng từ gộp chia doanh thu theo cơ cấu món */
export function dongCuaPhieu(x: NgayPOS) {
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

// ── Cách đồng bộ bán hàng FABi (T113): mỗi hoá đơn một chứng từ, hoặc tổng hợp theo kênh mỗi ngày, cửa hàng ──
type NgayPOS = (typeof DAILY)[number]
/** Một chứng từ Xuất bán POS: số liệu của phần doanh thu ngày mà chứng từ gánh; loai 'don' là một hoá đơn FABi */
export type XPos = NgayPOS & { kenh: string; gio: string; loai: 'don' | 'kenh'; seed: string }
const KENH: [string, string][] = [['tq', 'Tại quán'], ['mv', 'Mang về'], ['app', 'App giao đồ ăn']]
const KT_FABI = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
/** Số hoá đơn FABi 12 ký tự, cố định theo hạt giống */
export function soFabi(seed: string) {
  const r = rng(seed)
  return Array.from({ length: 12 }, () => KT_FABI[Math.floor(r() * KT_FABI.length)]).join('')
}
/** Chia doanh thu ngày cho các phần theo tỷ lệ; phần cuối nhận số dư để cộng lại đúng số ngày */
export function chiaTheo(tong: number, ty: number[], tron = 1000) {
  const s = ty.reduce((a, b) => a + b, 0) || 1
  let con = tong
  return ty.map((t, i) => {
    if (i === ty.length - 1) return con
    const v = Math.round(tong * t / s / tron) * tron
    con -= v
    return v
  })
}
/** Khách lấy hoá đơn GTGT trên đơn POS (mẫu, T613) */
const KHACH_VAT = [
  { ten: 'HỘ KINH DOANH NGUYỄN THỊ MAI TRANG 83', diaChi: '16 Tuệ Tĩnh, Phường Hai Bà Trưng, Thành phố Hà Nội', mst: '001183043719', nguoiMua: 'Nguyễn Văn An' },
  { ten: 'CÔNG TY TNHH THƯƠNG MẠI MINH PHÁT', diaChi: '25 Lý Thường Kiệt, Phường Cửa Nam, Thành phố Hà Nội', mst: '0108765432', nguoiMua: 'Trần Thu Hà' },
  { ten: 'CÔNG TY CỔ PHẦN TRUYỀN THÔNG SAO VIỆT', diaChi: '88 Láng Hạ, Phường Láng, Thành phố Hà Nội', mst: '0105123987', nguoiMua: 'Lê Minh Quân' },
]
/** Thông tin đơn POS của một hoá đơn FABi (T613): số đơn trên bill theo thứ tự trong ngày; khoảng một phần ba đơn khách lấy hoá đơn GTGT */
export function donPosCua(x: XPos) {
  const r = rng(`hd-${x.seed}`)
  const soDon = String(Number(x.seed.split('-').pop()) + 1).padStart(4, '0')
  if (x.loai !== 'don' || r() > 0.35) return { soDon, khach: null, hoaDon: null }
  const khach = KHACH_VAT[Math.floor(r() * KHACH_VAT.length)]
  const nam = String(x.date.getFullYear()).slice(2)
  const maTraCuu = `MANAGER_${1000000 + Math.floor(r() * 9000000)}${Array.from({ length: 10 }, () => KT_FABI[Math.floor(r() * KT_FABI.length)]).join('')}`
  return { soDon, khach, hoaDon: { so: String(1 + Math.floor(r() * 9999)).padStart(8, '0'), kyHieu: `1C${nam}TPM`, ngay: dmy(x.date), maTraCuu } }
}
/** Tổng hợp theo kênh: tại quán, mang về chia phần thu tại quầy 70/30; app giao đồ ăn theo tiền app */
export function theoKenh(x: NgayPOS): XPos[] {
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
export function theoDon(x: NgayPOS): XPos[] {
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
  const tyLe = gtgtTyLe(s)
  const tatCa = useMemo(() => DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().flatMap(x => theoDon(x).reverse())   // đồng bộ FABi chỉ kéo chi tiết, mỗi hoá đơn một chứng từ (T247)
   
    .map((x, i) => ({
      id: String(i), so: soFabi(`fabi-${x.seed}`), ngay: `${dmy(x.date)} ${x.gio}`, thang: x.date.getMonth() + 1, cn: cnTen(x.cn), x, kenh: x.kenh,
      dienGiai: x.loai === 'don' ? `Hoá đơn FABi ${x.kenh.toLowerCase()} ${x.gio} ngày ${dmy(x.date).slice(0, 5)}` : `Doanh thu ${x.kenh.toLowerCase()} ${x.don} đơn POS ngày ${dmy(x.date).slice(0, 5)}`,
      doiTuong: donPosCua(x).khach?.ten ?? 'Khách lẻ POS',
      tenHang: tomTatTenHang(monCua(x).map(m => m.ten)), _tenHangDu: [...new Set(monCua(x).map(m => m.ten))].join(', '),   // cột Diễn giải là tên món trong phiếu (T286)
      // GTGT theo % doanh thu: không tiền thuế, tổng tiền = doanh thu − giảm thuế GTGT (T163)
      tien: x.dt, thue: tyLe ? 0 : x.vat, giamThue: tyLe ? giamThueHkd(x.dt) : 0, tong: tyLe ? x.dt - giamThueHkd(x.dt) : x.dt + x.vat, nguon: 'FABi', tt: i < 3 ? 'nhap' : 'ghi',
      ngayTao: `${dmy(x.date)} 23:30`, nguoiTao: 'Hệ thống',   // tạo khi đồng bộ FABi cuối ngày (T132)
    })), [tyLe])
  const rows = useMemo(() => tatCa.filter(r => !laDaXoa(r.id)), [tatCa, ban])
  if (id === 'moi') return <Navigate to={duongDan(mod, sc)} replace />   // không lập tay Xuất bán POS (T52)
  if (id) return <ChiTiet sc={sc} mod={mod} row={rows.find(r => r.id === id) ?? rows[0]} />
  return <DanhSach sc={sc} mod={mod} rows={rows} />
}

/** Cột cố định hai đầu, không ẩn, không kéo đổi thứ tự */
const COT_CO_DINH = new Set(['stt', 'ngay', 'so'])
/** Cột lọc bằng cách chọn trong danh sách giá trị */
const COT_CHON = new Set(['cn', 'nguon', 'kenh'])

/** Giá trị các ô lọc ngoài và trong Bộ lọc nâng cao. Chuỗi rỗng là tất cả */
interface GtLoc { thoiGian: KhoangNgay; tim: string; cn: string; nguon: string; kh: string; kenh: string; pttt: string; hang: string; tonKho: string }
const locMacDinh = (): GtLoc => ({ thoiGian: thangMacDinh(), tim: '', cn: '', nguon: '', kh: '', kenh: '', pttt: '', hang: '', tonKho: '' })
/** Món của chứng từ để lọc theo hàng hoá, theo dõi tồn kho; nhớ lại để không tính lại mỗi lần lọc */
const MON_CUA = new WeakMap<object, { ma: string; ten: string; tonKho: boolean }[]>()
function monCua(x: NgayPOS) {
  let ds = MON_CUA.get(x)
  if (!ds) { ds = dongCuaPhieu(x).map(d => ({ ma: d.ma, ten: d.ten, tonKho: Boolean(d.tonKho) })); MON_CUA.set(x, ds) }
  return ds
}
/** Phương thức thanh toán của chứng từ theo số tiền thu được (T116, T137) */
export const PTTT: [keyof NgayPOS, string][] = [
  ['tm', DS_PTTT.find(p => p.ma === 'TM')?.ten ?? 'Tiền mặt'],
  ['ck', DS_PTTT.find(p => p.ma === 'CK')?.ten ?? 'Chuyển khoản, QR'],
  ['the', DS_PTTT.find(p => p.ma === 'THE')?.ten ?? 'Thẻ'],
  ['app', DS_PTTT.find(p => p.ma === 'APP')?.ten ?? 'App giao đồ ăn'],
]
export const ptttCua = (x: NgayPOS) => PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t)

function DanhSach({ sc, mod, rows }: ScreenProps & { rows: Row[] }) {
  const { s, toast } = useSession()
  const tyLe = gtgtTyLe(s)
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)
  const kieu = kieuGhiSo(s.cheDo)
  const ghi = kieu !== 'khong'
  // Cửa hàng chọn trên thanh trên (QD17): lọc theo cửa hàng đó, bỏ cột và ô lọc cửa hàng
  const cnChon = cuaHangHienTai(s)

  const tenTT = (r: Row) => r.tt === 'nhap' && ghi ? 'Chưa ghi sổ' : 'Đã ghi sổ'
  const cotSo = useMemo(() => {
    const m = new Map<string, boolean>()
    return (k: string) => { if (!m.has(k)) m.set(k, typeof rows.find(r => r[k] !== undefined && r[k] !== '' && r[k] !== null)?.[k] === 'number'); return m.get(k)! }
  }, [rows])
  const kieuCot = (k: string): KieuLoc =>
    k === 'ngay' ? 'ngay' : COT_CHON.has(k) ? 'chon' : k === 'tien' || k === 'thue' || k === 'tong' || cotSo(k) ? 'so' : 'chon'   // cột chữ lọc kiểu chọn (T466)
  const chuCot = (k: string, r: Row): string => {
    if (k === 'tt') return tenTT(r)
    const v = r[k]
    return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '')
  }
  const layLuaChon = (k: string) => dsGiaTri(rows, r => chuCot(k, r))   // chỉ tính khi mở ô lọc (T466)

  // Ô lọc: giá trị nháp, bấm Lọc mới áp dụng (T41)
  const apLoc = () => { loc0.loc(); setTrang(1) }
  const chonO = (k: 'cn' | 'nguon' | 'kh' | 'kenh' | 'pttt' | 'hang' | 'tonKho', ten: string, ds: [string, string][]) => (
    <Select className="ds-o-sel" value={nhap[k]} aria-label={ten} onChange={e => dat(k, e.target.value)}>
      <option value="">Tất cả</option>
      {ds.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </Select>
  )
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    {
      k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()), o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số, diễn giải" title="Tìm theo số chứng từ, diễn giải" aria-label="Tìm kiếm"
        onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />,
    },
    ...(cnChon ? [] : [{ k: 'cn', ten: 'Cửa hàng', coGiaTri: Boolean(nhap.cn), o: chonO('cn', 'Cửa hàng', CUA_HANG.map(c => [c.id, c.ten])) }]),
    // Khách hàng, kênh bán, phương thức thanh toán; lựa chọn lấy từ chính các chứng từ (T116)
    { k: 'kh', ten: 'Khách hàng', coGiaTri: Boolean(nhap.kh), o: chonO('kh', 'Khách hàng', [...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].map(v => [v, v])) },
    { k: 'kenh', ten: 'Kênh bán', coGiaTri: Boolean(nhap.kenh), o: chonO('kenh', 'Kênh bán', [...new Set(rows.map(r => String(r.kenh ?? '')).filter(Boolean))].map(v => [v, v])) },
    // Lọc theo phương thức thanh toán: mỗi chứng từ là một hoá đơn FABi (T116, T247)
    { k: 'pttt', ten: 'Phương thức thanh toán', coGiaTri: Boolean(nhap.pttt), o: chonO('pttt', 'Phương thức thanh toán', PTTT.map(([, t]) => [t, t])) },
    // Hàng hoá có trong chứng từ; Theo dõi tồn kho: chứng từ có món theo dõi hoặc có món không theo dõi tồn kho (T118)
    { k: 'hang', ten: 'Hàng hoá', coGiaTri: Boolean(nhap.hang), o: chonO('hang', 'Hàng hoá', HANG.map(h => [h.ma, `${h.ma} - ${h.ten}`])) },
    { k: 'tonKho', ten: 'Theo dõi tồn kho', coGiaTri: Boolean(nhap.tonKho), o: chonO('tonKho', 'Theo dõi tồn kho', [['co', 'Có theo dõi tồn kho'], ['khong', 'Không theo dõi tồn kho']]) },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'cn'])

  // Lọc theo các ô đã áp dụng, cửa hàng trên thanh trên, hàng lọc từng cột; chip trạng thái lọc sau cùng để đếm số trên chip
  const truocTT = rows.filter(r => {
    const d = r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay)
    if (!trongKhoang(d, ap.thoiGian)) return false
    if (cnChon && r.x?.cn !== cnChon.id) return false
    if (ap.cn && r.x?.cn !== ap.cn) return false
    if (ap.nguon && r.nguon !== ap.nguon) return false
    if (ap.kh && r.doiTuong !== ap.kh) return false
    if (ap.kenh && r.kenh !== ap.kenh) return false
    if (ap.hang && !monCua(r.x).some(m => m.ma === ap.hang)) return false
    if (ap.tonKho && !monCua(r.x).some(m => m.tonKho === (ap.tonKho === 'co'))) return false
    if (ap.pttt && !ptttCua(r.x).includes(ap.pttt)) return false
    if (ap.tim.trim() && !fold(`${r.so} ${r.dienGiai} ${r._tenHangDu}`).includes(fold(ap.tim.trim()))) return false
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? d : undefined)) return false
    }
    return true
  })
  // Bỏ chip trạng thái ghi sổ: dải đối soát đơn POS thay cho phần lọc này (T118)
  const list = truocTT
  const [activeId, setActiveId] = useState<string>(() => list[0]?.id ?? '')

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
    { k: 'stt', t: 'STT', w: 46, c: true, dinh: 'trai' },
    { k: 'ngay', t: 'Ngày', w: 100, dinh: 'trai' },
    {
      k: 'so',
      t: 'Số chứng từ',
      cls: 'code',
      w: 150,
      dinh: 'trai',
      r: r => (
        <button
          type="button"
          className="ds-link-so"
          title={String(r.so ?? '')}
          onClick={e => {
            e.stopPropagation()
            nav(`${path}/${r.id}`)
          }}
        >
          {r.so}
        </button>
      ),
    },
    // T286: Diễn giải là tên món trong phiếu, diễn giải cũ đổi tên Ghi chú
    { k: 'tenHang', t: 'Diễn giải', w: 260, r: r => <span title={String(r._tenHangDu ?? '')}>{r.tenHang}</span> },
    { k: 'dienGiai', t: 'Ghi chú' },
    { k: 'kenh', t: 'Kênh bán', w: 140 },   // T113
    ...(cnChon ? [] : [{ k: 'cn', t: 'Cửa hàng', cls: 'dim' } as Col]),
    { k: 'tien', t: 'Doanh thu trước thuế', num: true, w: 160 },
    tyLe ? { k: 'giamThue', t: 'Giảm thuế GTGT', num: true, w: 130 } : { k: 'thue', t: 'Tiền thuế', num: true, w: 120 },   // T163
    // bỏ cột Nguồn: Xuất bán POS chỉ có nguồn FABi (T115)
    { k: 'ngayTao', t: 'Ngày tạo', w: 140 }, { k: 'nguoiTao', t: 'Người tạo', w: 130 },   // T132
    { k: 'tong', t: 'Tổng tiền', num: true, w: 120, dinh: 'phai' },   // Tổng tiền là cột cuối (T48), cố định bên phải (T239)
  ]
  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn (T41)
  const cot = useCotDs(path, cols, COT_CO_DINH)

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="voucher-split">
        <section className="card voucher-top">
          {/* Thanh công cụ: hàng 1 BoLoc chiNutPheu, hàng 2 Tuỳ chỉnh cột và Excel bên phải (T351, T511) */}
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
              ngoaiRieng={{
                tim: (
                  <div key="tim" className="ds-tim-figma">
                    <IconFigmaSearch size={16} />
                    <input
                      value={nhap.tim}
                      placeholder="Số, diễn giải"
                      title="Tìm theo số chứng từ, diễn giải"
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
          </div>
          <div className="ds-hang-trang-thai">
            <div className="ds-toolbar-phai ds-cong-cu-h2">
              <NutExcel
                onNhap={() => toast('Nhập chứng từ bán hàng từ file Excel')}
                onXuat={() => toast(`Đã xuất ${list.length} chứng từ ra Excel`)}
              />
              <NutTuyChinhCot
                cols={cot.colsDu}
                an={cot.an}
                coDinh={COT_CO_DINH}
                macDinh={cot.macDinh}
                dongBang={cot.dongBang}
                onLuu={cot.luu}
                onDoRongTuDong={cot.datDoRongTuDong}
              />
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
                loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['stt']),
                  kieu: c => kieuCot(c.k), layLuaChon }}
                onRow={r => setActiveId(r.id)}
                onDbl={r => nav(`${path}/${r.id}`)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' && ghi ? 'chua-ghi' : '',
                ].filter(Boolean).join(' ')}
                sum={{ ngay: 'Tổng trang', tien: sum('tien'), thue: sum('thue'), giamThue: sum('giamThue'), tong: sum('tong') }}
              />
              <PhanTrang
                tong={list.length}
                tongCong={{ tien: tongDs('tien'), thue: tongDs('thue'), giamThue: tongDs('giamThue'), tong: tongDs('tong') }}
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
                onClick={() => { loc0.xoaHet(); setLocCot({}); setTrang(1) }}
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
          <div className="ct-panel" style={{ display: 'none' }} aria-hidden="true" />
        </section>

      </div>
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

function NoiDungTab({ x, tab, kieu, an: an0 = AN_POS_MAC_DINH, tyLe = false, hienLoc = false }: { x: (typeof DAILY)[number]; tab: string; kieu: ReturnType<typeof kieuGhiSo>; an?: string[]; tyLe?: boolean; hienLoc?: boolean }) {
  const an = anTheoLoai(an0, tyLe)
  const dong0 = dongCuaPhieu(x)
  const doRong = useDoRongCot(`xuat-ban-pos:${tab}`)   // kéo giãn cột, nhớ riêng từng tab (T618)
  // GTGT theo % doanh thu: giảm thuế GTGT của phiếu chia cho các món theo doanh thu trước thuế (T163)
  const giam = tyLe ? chiaTheo(giamThueHkd(x.dt), dong0.map(d => d.dtTruocThue), 1) : []
  const dong = tyLe ? dong0.map((d, i) => ({ ...d, giamThue: giam[i] })) : dong0
  const ht = [
    { dg: 'Thu tiền mặt', no: '1111', co: tyLe ? '5111' : '5111, 33311', tien: x.tm },
    { dg: 'Thu chuyển khoản, QR, thẻ', no: '1121', co: tyLe ? '5111' : '5111, 33311', tien: x.ck + x.the },
    { dg: 'Phải thu app giao đồ ăn', no: '131', co: tyLe ? '5111' : '5111, 33311', tien: x.app },
    { dg: 'Giá vốn xuất bán theo định lượng', no: '632', co: '152', tien: x.gv },
  ]
  const rowsSo = [
    { so: 'Sổ doanh thu bán hàng hoá, dịch vụ', tien: x.dt },
    { so: 'Sổ theo dõi thuế GTGT', tien: x.vat },
    { so: 'Sổ tiền mặt', tien: x.tm },
    { so: 'Sổ tiền gửi ngân hàng', tien: x.ck + x.the },
  ]
  const colsCt = ([
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
            // Theo danh mục hàng hoá: tích là mặt hàng theo dõi tồn kho, chỉ xem; cột cuối, cố định phải (T114)
            { k: 'tonKho', t: 'Theo dõi tồn kho', c: true, w: 120, dinh: 'phai', r: r => <input type="checkbox" className="o-tich-xem" checked={Boolean(r.tonKho)} readOnly tabIndex={-1} aria-label="Theo dõi tồn kho" /> },
          ] as Col[]).filter(c => !an.includes(c.k))
  // Lọc hàng bán (T383): bấm phễu sau tab mới hiện hàng lọc như danh sách; tổng cộng vẫn cộng mọi dòng
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})
  useEffect(() => { if (!hienLoc) setGtLoc({}) }, [hienLoc])
  const kieuCt = (c: Col): KieuLoc => c.num ? 'so' : 'chon'   // cột chữ lọc kiểu chọn (T466)
  const giaTri = (r: (typeof dong)[number], k: string) => (r as unknown as Record<string, unknown>)[k]
  const locCt: LocCot | undefined = hienLoc ? { gt: gtLoc, dat: (k, g) => setGtLoc(t => ({ ...t, [k]: g })), bo: new Set(['stt', 'tonKho']), kieu: kieuCt,
    layLuaChon: k => dsGiaTri(dong, r => String(giaTri(r, k) ?? '')) } : undefined
  const dongLoc = !hienLoc ? dong : dong.filter(r => colsCt.every(c => !dangLoc(gtLoc[c.k])
    || khopLoc(kieuCt(c), gtLoc[c.k], String(giaTri(r, c.k) ?? ''), typeof giaTri(r, c.k) === 'number' ? giaTri(r, c.k) as number : undefined)))
  return (
    <BaoCaoDoRongCtx.Provider value={doRong}>
      {tab === 'ct' && (
        <Table
          cols={colsCt}
          loc={locCt}
          rows={dongLoc}
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
    </BaoCaoDoRongCtx.Provider>
  )
}

/** Chứng từ Xuất bán POS (T102): vẽ theo form chung IACC, đủ thông tin như chi tiết đơn POS của iFaster.
 *  Phiếu đồng bộ từ FABi, chỉ xem: không sửa, trả hàng, huỷ ở đây */
function ChiTiet({ sc, mod, row }: ScreenProps & { row: Row }) {
  const { s, toast } = useSession()
  const dong0 = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState('ct')
  const [moLoc, setMoLoc] = useState(false)   // hàng lọc của bảng Hàng bán (T383)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  // Cột ẩn của bảng Hàng bán, nhớ trên máy người dùng; chưa chỉnh thì ẩn Giảm thuế GTGT, Phí vận chuyển (T106)
  const khoaCot = 'iacc-cot-phieu:ban-hang/3-1-1'
  const [anCot, setAnCot] = useState<string[]>(() => {
    try { const v = JSON.parse(localStorage.getItem(khoaCot) ?? 'null'); return Array.isArray(v) ? v : AN_POS_MAC_DINH } catch { return AN_POS_MAC_DINH }
  })
  // Cột thuế theo loại hình đơn vị, cố định nên không có trong Tuỳ chỉnh giao diện (T163)
  const tyLe = gtgtTyLe(s)
  const cotChinh = tyLe ? ['ts', 'thue', 'giamThue'] : ['ts', 'thue']
  const [hopCot, setHopCot] = useState(false)
  const doiAnCot = (an: string[]) => {
    setAnCot(an)
    try { localStorage.setItem(khoaCot, JSON.stringify(an)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
  }
  const x = tyLe ? ttHkd(row.x) : row.x
  const kieu = kieuGhiSo(s.cheDo)
  // Chân phiếu dạng phép tính (T613), cộng từ đúng các dòng Hàng bán nên khớp dòng Tổng cộng của lưới
  const cong = (k: 'thanh' | 'giam' | 'ck' | 'phiDv' | 'phiVc' | 'dtTruocThue') => dongCuaPhieu(x).reduce((a, d) => a + d[k], 0)
  const dtTinhThue = cong('dtTruocThue'), phiVc = cong('phiVc')
  // GTGT theo % doanh thu: tổng thanh toán = doanh thu − giảm thuế GTGT, không cộng tiền thuế (T163); khấu trừ cộng thuế GTGT
  const giamThue = tyLe ? giamThueHkd(x.dt) : 0
  const tong = tyLe ? dtTinhThue - giamThue : dtTinhThue + x.vat
  const phepTinh: [string, string, number][] = [
    ['', 'Tiền hàng', cong('thanh')], ['−', 'Giảm giá', cong('giam')], ['−', 'Chiết khấu', cong('ck')], ['+', 'Phí dịch vụ', cong('phiDv')],
    ...(phiVc ? [['+', 'Phí vận chuyển', phiVc] as [string, string, number]] : []),
  ]
  const dp = donPosCua(x as XPos)
  const [daChep, setDaChep] = useState(false)
  const chepMa = (ma: string) => {
    navigator.clipboard?.writeText(ma).then(() => toast('Đã chép mã tra cứu'), () => toast('Trình duyệt chặn sao chép, chọn mã rồi chép tay'))
    setDaChep(true)
    setTimeout(() => setDaChep(false), 1500)
  }
  const pttt = PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t).join(', ')
  const kenh = (x as XPos).kenh ?? (x.app > 0 ? 'Tại quán, Mang về, App giao đồ ăn' : 'Tại quán, Mang về')
  // In: bảng kê lấy đúng các món của chứng từ, không sinh dòng giả
  const moIn = () => setPhieuIn([{
    sc, row, cfg: NGOAI_POS,
    dong: dongCuaPhieu(x).map(d => ({ stt: d.stt, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, gia: d.gia, tien: d.tien, thue: d.thue, ts: d.ts })),
  }])
  // Phiếu đồng bộ xong từ FABi ghi "Đã đồng bộ" thay cho "Đã ghi sổ" (T613)
  const [cTt, tTt] = kieu === 'khong' || row.tt === 'ghi' ? ['ok', 'Đã đồng bộ'] : TT_CT[row.tt] ?? ['warn', 'Chưa ghi sổ']
  return (
    <FormToanMan icon={mod.icon} iconNet onClose={dong0} title="Xuất bán POS"
      footClass="fsf-f-xem fsf-f-pos"
      giua={<span className="fsf-tt xem">Chi tiết phiếu <b>{row.so}</b></span>}
      meta={<><St k={cTt}>{tTt}</St><span className="src">FABi</span><span className="chip info"><Icon n="cuahang" className="ic sm" />{row.cn}</span></>}
      // Tuỳ chỉnh giao diện: nút vuông nhỏ ở góc trên phải như form chứng từ khác (T297)
      phai={<>
        <button type="button" className={`nut-vuong ds-nut-cot${hopCot ? ' on' : ''}`} onClick={() => setHopCot(true)}
          title="Tuỳ chỉnh giao diện: bật tắt cột bảng Hàng bán" aria-label="Tuỳ chỉnh giao diện"><Icon n="chinh" className="ic sm" /></button>
        {/* Phiếu POS chỉ xem: phím tắt chỉ có Esc đóng (T297) */}
        <NutPhimTat ds={[['Đóng form', 'Esc']]} />
      </>}
      foot={<>
        <div className="xp-footer-trai">
          <button type="button" className="xp-btn-in" onClick={moIn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C14.0261 11.8595 13.687 12 13.3333 12H12" />
              <path d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
              <path d="M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z" />
            </svg>
            <span>In phiếu</span>
          </button>
        </div>
        {/* Dải phép tính giữa nút In phiếu và Đóng; màn hẹp lên hàng riêng (T613) */}
        <div className="pos-phep">
          {phepTinh.map(([dau, nhan, so]) => (
            <span key={nhan} className="pos-phep-cum">
              {dau && <span className="pos-phep-dau">{dau}</span>}
              <span className="pos-phep-o"><small>{nhan}</small><b>{money(so)}</b></span>
            </span>
          ))}
          <span className="pos-phep-cum">
            <span className="pos-phep-dau">=</span>
            <span className="pos-phep-o nen"><small>Doanh thu tính thuế</small><b>{money(dtTinhThue)}</b></span>
          </span>
          <span className="pos-phep-cum">
            <span className="pos-phep-dau">{tyLe ? '−' : '+'}</span>
            <span className="pos-phep-o"><small>{tyLe ? 'Giảm trừ thuế' : 'Thuế GTGT'}</small><b>{money(tyLe ? giamThue : x.vat)}</b></span>
          </span>
          <span className="pos-phep-cum">
            <span className="pos-phep-dau">=</span>
            <span className="pos-phep-o tong"><small>Tổng thanh toán</small><b>{moneyD(tong)}</b></span>
          </span>
        </div>
        <div className="xp-footer-phai">
          <button type="button" className="xp-btn-outline" onClick={dong0}>
            Đóng (Esc)
          </button>
        </div>
      </>}>
      <div className="stack ct-co-dinh" style={{ gap: 14 }}>
        <p className="pos-nhac"><Icon n="info" className="ic sm" />Chứng từ đồng bộ từ FABi: không sửa, trả hàng, xoá trên phiếu này. Sửa đơn trên FABi rồi đồng bộ lại.</p>
        {/* Đầu phiếu 3 cụm theo bảng B canvas (T613): Đơn hàng POS, Thông tin khách hàng, Hoá đơn; ghi chú dòng dưới cùng */}
        <section className="card pos-dau3">
          <div className="pd-cum">
            <div className="pd-tieu">ĐƠN HÀNG POS</div>
            <div className="pd-luoi">
              <div><small>Mã đơn POS</small><b className="code">{row.so}</b></div>
              <div><small>Số đơn POS</small><b className="code">{dp.soDon}</b></div>
              <div><small>Cửa hàng</small><b title={String(row.cn)}>{row.cn}</b></div>
              <div><small>Kênh bán hàng</small><b title={kenh}>{kenh}</b></div>
              {/* Hoá đơn có một cách thanh toán; chứng từ tổng hợp theo kênh gộp nhiều cách nên bỏ (T116) */}
              {(x as XPos).loai === 'don' && <div><small>Phương thức thanh toán</small><b title={pttt}>{pttt}</b></div>}
              <div><small>Thời gian xuất</small><b>{dmy(x.date)} {(x as XPos).gio ?? '23:30'}</b></div>
            </div>
          </div>
          <div className="pd-cum">
            <div className="pd-tieu">THÔNG TIN KHÁCH HÀNG</div>
            <div><small>Khách hàng</small><b className="pd-khach">{dp.khach?.ten ?? 'Khách lẻ POS'}</b></div>
            {dp.khach && <>
              <div><small>Địa chỉ</small><span>{dp.khach.diaChi}</span></div>
              <div className="pd-luoi">
                <div><small>Mã số thuế</small><b className="code">{dp.khach.mst}</b></div>
                <div><small>Người mua hàng</small><b>{dp.khach.nguoiMua}</b></div>
              </div>
            </>}
          </div>
          <div className="pd-cum pd-hd">
            <div className="pd-tieu">HOÁ ĐƠN</div>
            {dp.hoaDon ? (
              <div className="pd-luoi">
                <div><small>Số hoá đơn</small><b className="code">{dp.hoaDon.so}</b></div>
                <div><small>Ký hiệu</small><b className="code">{dp.hoaDon.kyHieu}</b></div>
                <div><small>Ngày hoá đơn</small><b>{dp.hoaDon.ngay}</b></div>
                <div><small>Ngày chứng từ</small><b>{dmy(x.date)}</b></div>
                <div className="pd-c2"><small>Mã tra cứu</small>
                  <span className="pd-ma">
                    <b className="code">{dp.hoaDon.maTraCuu}</b>
                    <button type="button" className={`pd-chep${daChep ? ' da' : ''}`} onClick={() => chepMa(dp.hoaDon!.maTraCuu)}
                      title={daChep ? 'Đã chép mã tra cứu' : 'Sao chép mã tra cứu'} aria-label="Sao chép mã tra cứu">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></svg>
                    </button>
                  </span>
                </div>
              </div>
            ) : (
              <div className="pd-luoi">
                <div><small>Ngày chứng từ</small><b>{dmy(x.date)}</b></div>
                <div className="pd-c2"><small className="pd-trong">Khách không lấy hoá đơn GTGT</small></div>
              </div>
            )}
          </div>
          <div className="pd-ghichu"><small>Ghi chú</small><span title={String(row.dienGiai)}>{row.dienGiai}</span></div>
        </section>
        <section className="card ct-than-card">
          <div className="tabs">
            {[['ct', 'Hàng bán'], ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ']].filter(([k]) => k !== 'ht' || kieu !== 'khong').map(([k, l]) => <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
            {/* Phễu lọc ngay sau tab cuối như phiếu chung (T383) */}
            <button type="button" className={`ct-nut-loc${moLoc ? ' on' : ''}`} aria-pressed={moLoc} title={moLoc ? 'Ẩn bộ lọc hàng bán' : 'Lọc hàng bán'} aria-label="Lọc hàng bán"
              onClick={() => { if (!moLoc) setTab('ct'); setMoLoc(v => !v) }}><Icon n="filter" className="ic sm" /></button>
          </div>
          <div className="ct-than"><NoiDungTab x={x} tab={tab} kieu={kieu} an={anCot} tyLe={tyLe} hienLoc={moLoc} /></div>
        </section>
      </div>
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
      {hopCot && <HopCotPhieu ds={COT_POS.filter(([k]) => !cotChinh.includes(k))} an={anCot} macDinh={AN_POS_MAC_DINH} onDoi={doiAnCot} onDong={() => setHopCot(false)} />}
    </FormToanMan>
  )
}
