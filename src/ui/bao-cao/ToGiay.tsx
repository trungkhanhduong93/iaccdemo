// Tờ giấy A4 xem như bản in: tự chia trang, lặp tiêu đề cột, zoom, in đúng các trang đang xem (T47)
import {
  Children, Fragment, createContext, isValidElement, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type JSX, type ReactNode,
} from 'react'
import { createPortal, flushSync } from 'react-dom'
import { useLocation } from 'react-router-dom'
import type { Col, Row } from '../../modules/types'
import { RptTable, type KyHieuCot } from '../generic/ReportScreen'
import { Table } from '../Table'
import { Dropdown, MenuItem, MenuSep } from '../Dropdown'
import { Icon } from '../Icon'
import { fold } from '../format'
import { heSoZoom } from '../zoom'
import { PhanTrang } from '../PhanTrang'
import { chiaCot, coChuTheoKho, paddingTheoMatDo } from './chiaCot'
import { useTrangThaiLoc } from './tuyChinhBC'

export type Kho = 'doc' | 'ngang'
type CheDoXem = 'lien' | 'tung'
type Xem = { zoom: number | 'vua'; che: CheDoXem }
type BangProps = { cols: Col[]; rows: Row[]; onRow?: (r: Row) => void }
export type Khoi = { loai: 'nguyen'; el: ReactNode } | ({ loai: 'bang' } & BangProps) | { loai: 'ngat' }
/** Khổ giấy tự đặt (mm), le: trên, phải, dưới, trái. Dùng cho mẫu in chứng từ thay A4 dọc/ngang */
export type Giay = { rong: number; cao: number; le: [number, number, number, number] }

// Kết quả đo trên khung ẩn, đơn vị px CSS. Bảng: vo = viền bảng, dau = dòng tiêu đề cột, dong = từng dòng, rong = bề rộng từng cột,
// cong = dòng cộng chuyển trang (0 khi bảng không cộng chuyển)
type DoBang = { vo: number; dau: number; dong: number[]; rong: number[]; cong: number }
type Do = { dau: number; cuoi: number; khoi: (number | DoBang)[] }
type Muc = { k: 'dau' } | { k: 'cuoi' } | { k: 'khoi'; i: number } | { k: 'bang'; i: number; tu: number; den: number }

const PX = 96 / 25.4
const KHO: Record<Kho, { w: number; h: number }> = { doc: { w: 210, h: 297 }, ngang: { w: 297, h: 210 } }
const LE = { trai: 15, phai: 10, tren: 10, duoi: 14 }   // lề dưới chừa chỗ dòng "Trang x/y"
const CACH = 16                                           // khoảng cách hai trang khi xem liên tục
const DEM = 24                                            // lề trong của bàn
const MUC_ZOOM = [50, 67, 75, 90, 100, 110, 125, 150, 175, 200]

/** Tổng số trang của tờ đang vẽ, cho dòng "Sổ này có … trang" ở khối cuối */
export const SoTrangCtx = createContext(1)

const CONG_SAU = 'Cộng chuyển sang trang sau'
const CONG_TRUOC = 'Số trang trước chuyển sang'

/** Cột cộng chuyển trang có trong bảng này */
const cotCong = (kh: Khoi, congChuyen?: string[]) => kh.loai === 'bang' && congChuyen ? congChuyen.filter(k => kh.cols.some(c => c.k === k)) : []

// Số trong ô: số giữ nguyên, chữ kiểu vi-VN ('1.250.000', '7,3') đổi ra số
const soO = (v: unknown) => typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v.replace(/\./g, '').replace(',', '.')) || 0 : 0

/** Dòng cộng luỹ kế các cột cộng chuyển từ đầu bảng tới trước dòng den; bỏ dòng đầu kỳ, dòng tổng */
function dongCong(kh: Extract<Khoi, { loai: 'bang' }>, cot: string[], den: number, nhan: string): Row {
  const oChu = kh.cols.find(c => c.k === 'dienGiai' || c.k === 'dg')?.k ?? kh.cols[1]?.k ?? kh.cols[0]?.k ?? ''
  const dong: Row = { [oChu]: nhan, _b: 1 }
  const ds = kh.rows.slice(0, den).filter(r => !r._t && !r._b)
  for (const k of cot) {
    const chu = ds.some(r => typeof r[k] === 'string')
    const t = Math.round(ds.reduce((a, r) => a + soO(r[k]), 0) * 1000) / 1000
    dong[k] = chu ? (t ? t.toLocaleString('vi-VN') : '') : t
  }
  return dong
}

/** Đặt giữa hai khối trong thân: khối sau bắt đầu trang mới (In hàng loạt, mỗi phiếu một trang) */
export function NgatTrang() { return null }

/** Dòng của một trang khi xem (T157): dòng trong trang, sau đó các dòng tổng cuối bảng */
function dongTrangXem(rows: Row[], trang: number, coTrang: number): Row[] {
  const chiTiet = rows.filter(r => !r._t)
  return [...chiTiet.slice((trang - 1) * coTrang, trang * coTrang), ...rows.filter(r => r._t)]
}

/** Tách thân báo cáo thành khối: RptTable là bảng (cắt được theo dòng), phần tử khác là khối nguyên */
export function tachKhoi(than: ReactNode): Khoi[] {
  const out: Khoi[] = []
  Children.toArray(than).forEach(x => {
    if (isValidElement<{ children?: ReactNode }>(x) && x.type === Fragment) { out.push(...tachKhoi(x.props.children)); return }
    if (isValidElement(x) && x.type === NgatTrang) { out.push({ loai: 'ngat' }); return }
    if (isValidElement<BangProps>(x) && x.type === RptTable) { out.push({ loai: 'bang', cols: x.props.cols, rows: x.props.rows, onRow: x.props.onRow }); return }
    out.push({ loai: 'nguyen', el: x })
  })
  return out
}

function docXem(): Xem {
  try {
    const x = JSON.parse(localStorage.getItem('bc-xem') ?? '') as Partial<Xem>
    return { zoom: typeof x.zoom === 'number' && x.zoom >= 50 && x.zoom <= 200 ? x.zoom : 'vua', che: x.che === 'tung' ? 'tung' : 'lien' }
  } catch {
    return { zoom: 'vua', che: 'lien' }
  }
}

function docKho(path: string): Kho | null {
  try {
    const v = localStorage.getItem(`bc-kho:${path}`)
    return v === 'doc' || v === 'ngang' ? v : null
  } catch {
    return null
  }
}

const DS_CO_TRANG_BANG = [100, 200, 500]

function docDongTrang(): number {
  try {
    const v = Number(localStorage.getItem('bc-dong-trang'))
    return DS_CO_TRANG_BANG.includes(v) ? v : 100
  } catch {
    return 100
  }
}

type CheXem = 'to-in' | 'bang-du-lieu'

function ghi(khoa: string, v: string) {
  try { localStorage.setItem(khoa, v) } catch { /* trình duyệt chặn lưu thì dùng mặc định lần sau */ }
}

// Chiều cao thật theo px CSS, giữ phần lẻ để cộng dồn nhiều dòng không lệch. html bị zoom nên chia heSoZoom() (docs/BAY.md)
const cao = (e: Element, z: number) => e.getBoundingClientRect().height / z

function doKhung(goc: HTMLElement, khoi: Khoi[], congChuyen?: string[]): Do | null {
  const z = heSoZoom()
  const o = (k: string) => goc.querySelector<HTMLElement>(`:scope > [data-do="${k}"]`)
  const dau = o('dau')
  if (!dau) return null
  const cuoi = o('cuoi')
  const ds: (number | DoBang)[] = []
  for (let i = 0; i < khoi.length; i++) {
    const e = o(String(i))
    if (!e) return null
    const tb = e.querySelector('table')
    if (khoi[i].loai !== 'bang' || !tb) { ds.push(cao(e, z)); continue }
    const thead = tb.tHead
    const dong = [...tb.tBodies[0]?.rows ?? []].map(r => cao(r, z))
    // khung đo vẽ thêm một dòng cộng chuyển cuối bảng (số lớn nhất) để đo chiều cao và bề rộng cột
    const cong = cotCong(khoi[i], congChuyen).length ? dong.pop() ?? 0 : 0
    const hDau = thead ? cao(thead, z) : 0
    const rong = [...thead?.rows[0]?.cells ?? []].map(c => c.getBoundingClientRect().width / z)
    ds.push({ vo: Math.max(0, cao(e, z) - hDau - cong - dong.reduce((a, x) => a + x, 0)), dau: hDau, dong, rong, cong })
  }
  return { dau: cao(dau, z), cuoi: cuoi ? cao(cuoi, z) : 0, khoi: ds }
}

/**
 * Xếp tham lam từ trên xuống. Khối nguyên không cắt: hết chỗ thì sang trang mới, cao hơn cả trang thì nằm riêng một trang.
 * Bảng cắt theo dòng, mỗi trang lặp dòng tiêu đề cột, cần chỗ cho tiêu đề + 1 dòng mới bắt đầu.
 * Dòng tổng cuối bảng không đứng một mình đầu trang: kéo theo một dòng trước nó. Ô ký nằm trọn trang cuối.
 * Sổ cộng chuyển trang: đoạn bảng nối từ trang trước chừa một dòng "Số trang trước chuyển sang", đoạn chưa hết bảng chừa một dòng "Cộng chuyển sang trang sau".
 */
function chiaTrang(d: Do, khoi: Khoi[], hTrang: number, coCuoi: boolean): Muc[][] {
  const ds: Muc[][] = [[{ k: 'dau' }]]
  let con = hTrang - d.dau
  const hien = () => ds[ds.length - 1]
  const moi = () => { ds.push([]); con = hTrang }
  khoi.forEach((kh, i) => {
    const m = d.khoi[i]
    if (kh.loai === 'ngat') {
      if (hien().some(x => x.k !== 'dau')) moi()
      return
    }
    if (typeof m === 'number' || kh.loai !== 'bang') {
      const h = typeof m === 'number' ? m : 0
      if (h > con && hien().length) moi()
      hien().push({ k: 'khoi', i })
      con -= h
      return
    }
    const n = m.dong.length
    const tong = (tu: number, den: number) => m.vo + m.dau + m.dong.slice(tu, den).reduce((a, x) => a + x, 0)
      + (tu > 0 ? m.cong : 0) + (den < n ? m.cong : 0)
    let dauTong = n                        // từ đây tới cuối bảng toàn dòng tổng
    while (dauTong > 0 && kh.rows[dauTong - 1]?._t) dauTong--
    if (!n) {
      if (tong(0, 0) > con && hien().length) moi()
      hien().push({ k: 'bang', i, tu: 0, den: 0 })
      con -= tong(0, 0)
      return
    }
    let tu = 0
    while (tu < n) {
      if (tong(tu, tu + 1) > con && hien().length) moi()
      let den = tu + 1
      while (den < n && tong(tu, den + 1) <= con) den++
      if (den < n && den >= dauTong && dauTong - 1 > tu) den = dauTong - 1
      hien().push({ k: 'bang', i, tu, den })
      con -= tong(tu, den)
      tu = den
      if (tu < n) moi()
    }
  })
  if (coCuoi) {
    if (d.cuoi > con && hien().length) moi()
    hien().push({ k: 'cuoi' })
  }
  return ds
}

// Kết quả đo còn khớp thân hiện tại không (thân vừa đổi thì đo lại trước khi vẽ)
const khopDo = (d: Do | null, khoi: Khoi[]): d is Do => !!d && d.khoi.length === khoi.length
  && khoi.every((kh, i) => { const m = d.khoi[i]; return kh.loai === 'bang' ? typeof m !== 'number' && m.dong.length === kh.rows.length : typeof m === 'number' })

const Net = ({ d }: { d: string }) => <svg className="ic sm" viewBox="0 0 24 24" aria-hidden><path d={d} /></svg>

export function ToGiay({ dau, than, cuoi, khoMacDinh, kyHieuCot, congChuyen, giay, anSoTrang, onKho, layHtmlRef, coChu, coThayDoi: coThayDoiProp, xemTrang, dieuKienLoc, dauBang, tim }: {
  dau: ReactNode; than: ReactNode; cuoi?: ReactNode; khoMacDinh: Kho
  kyHieuCot?: KyHieuCot     // hàng ký hiệu cột A, B, 1, 2 dưới tiêu đề mọi bảng
  congChuyen?: string[]     // sổ: cột cộng chuyển trang
  giay?: Giay               // khổ riêng của mẫu in: bỏ chọn Dọc/Ngang, không lưu khổ
  anSoTrang?: boolean       // ẩn dòng "Trang x/y"
  onKho?: (k: Kho) => void  // báo khổ giấy đang chọn cho khung ngoài xuất file
  layHtmlRef?: { current: (() => string) | null } // ref lấy HTML các trang thật
  coChu?: number            // cỡ chữ bảng theo tuỳ chỉnh (px)
  coThayDoi?: boolean       // bản nháp khác đã xem (T72)
  xemTrang?: number         // báo cáo nhiều dòng (T157): tờ liền chỉ vẽ ngần ấy dòng mỗi trang kèm dòng tổng; khung đo chỉ vẽ lúc in, lấy HTML
  dieuKienLoc?: string      // điều kiện lọc đang áp, ghi trên Bảng dữ liệu (tờ in đã ghi ở đầu tờ, T179)
  dauBang?: ReactNode       // tên báo cáo, dòng phụ căn giữa trên bảng dữ liệu (T179)
  tim?: string              // chữ tìm nhanh: bảng dữ liệu chỉ giữ dòng chứa chữ này (T179)
}): JSX.Element {
  const path = useLocation().pathname
  const tt = useTrangThaiLoc(path)
  const coThayDoi = coThayDoiProp ?? tt.coThayDoi
  // Khổ đã chọn nhớ theo báo cáo và theo khổ mặc định của trường hợp đang xem, vd Sổ ngân hàng tất cả quỹ (ngang) và một quỹ (dọc) nhớ riêng (T54)
  const khoaKho = `${path}:${khoMacDinh}`
  const [kho, setKho] = useState<Kho>(() => docKho(khoaKho) ?? khoMacDinh)
  const [xem, setXem] = useState<Xem>(docXem)
  // Màn xem báo cáo hiện bảng dữ liệu; tờ in chỉ là bản xem trước khi in, mở bằng nút In (T179)
  const [moXemTruoc, setMoXemTruoc] = useState(false)
  const [d, setD] = useState<Do | null>(null)
  const [trang, setTrang] = useState(0)
  const [oTrang, setOTrang] = useState('1')
  const [rongBan, setRongBan] = useState(0)
  const [dangIn, setDangIn] = useState(false)
  const [canHtml, setCanHtml] = useState(false)
  const [trangXem, setTrangXem] = useState(1)
  const [coTrangXem, setCoTrangXem] = useState(xemTrang ?? 100)
  const ban = useRef<HTMLDivElement>(null)
  const khungDo = useRef<HTMLDivElement>(null)
  const xuatHtmlRef = useRef<HTMLDivElement>(null)
  const pv = 'bcg' + useId().replace(/[^a-zA-Z0-9]/g, '')

  useEffect(() => { onKho?.(kho) }, [kho, onKho])

  useEffect(() => {
    if (layHtmlRef) {
      layHtmlRef.current = () => {
        flushSync(() => setCanHtml(true))
        const trangs = xuatHtmlRef.current?.querySelectorAll('.bc-trang')
        let res = ''
        if (trangs && trangs.length > 0) {
          res = Array.from(trangs).map(el => el.outerHTML).join('\n')
        } else {
          const banTrang = ban.current?.querySelectorAll('.bc-trang:not(.bc-cho)')
          res = Array.from(banTrang ?? []).map(el => el.outerHTML).join('\n')
        }
        setCanHtml(false)
        return res
      }
    }
  })

  const khoiGoc = useMemo(() => tachKhoi(than), [than])
  // Xem trước, in, mẫu in: bỏ cột chỉ dành cho màn hình (vd nút Thanh toán ngay, T304)
  const boCotManHinh = moXemTruoc || dangIn || !!giay
  const khoi = useMemo(() => boCotManHinh
    ? khoiGoc.map(k => k.loai === 'bang' && k.cols.some(c => c.chiManHinh) ? { ...k, cols: k.cols.filter(c => !c.chiManHinh) } : k)
    : khoiGoc, [khoiGoc, boCotManHinh])
  const bangDau = useMemo(() => khoi.find((k): k is Extract<Khoi, { loai: 'bang' }> => k.loai === 'bang'), [khoi])
  const laBang = !giay && !!bangDau          // màn chính vẽ bảng dữ liệu; mẫu in (giay) hoặc báo cáo không có bảng vẫn vẽ tờ
  const cheXem: CheXem = laBang && !moXemTruoc ? 'bang-du-lieu' : 'to-in'
  const dongBang = useMemo(() => {
    if (!bangDau) return []
    const q = fold(tim?.trim() ?? '')
    if (!q) return bangDau.rows
    return bangDau.rows.filter(r => r._t || (!r._b && !r._nhom && bangDau.cols.some(c => fold(String(r[c.k] ?? '')).includes(q))))
  }, [bangDau, tim])
  const tongDong = khoi.reduce((a, k) => a + (k.loai === 'bang' ? k.rows.length : 0), 0)

  // Phân trang Bảng dữ liệu (T238): cắt dongBang theo trang, dòng tổng _t luôn ghim cuối mọi trang
  const [coTrangBang, setCoTrangBang] = useState(docDongTrang)
  const [trangBang, setTrangBang] = useState(1)
  const banDuLieuRef = useRef<HTMLDivElement>(null)

  const { dongBangDuLieu, dongTongBang } = useMemo(() => {
    let idx = dongBang.length
    while (idx > 0 && dongBang[idx - 1]?._t && !dongBang[idx - 1]?._nhom) {
      idx--
    }
    return {
      dongBangDuLieu: dongBang.slice(0, idx),
      dongTongBang: dongBang.slice(idx),
    }
  }, [dongBang])
  const tongDongBang = dongBangDuLieu.length
  const hienPhanTrangBang = laBang && tongDongBang > 100
  const soTrangBang = Math.max(1, Math.ceil(tongDongBang / coTrangBang))
  const trangBangHt = Math.min(trangBang, soTrangBang)

  const cuonBangLenDau = () => {
    const wrap = banDuLieuRef.current?.querySelector<HTMLElement>('.tbl-wrap')
    if (wrap) wrap.scrollTop = 0
  }

  const doiCoTrangBang = (c: number) => {
    const hopLe = DS_CO_TRANG_BANG.includes(c) ? c : 100
    setCoTrangBang(hopLe)
    setTrangBang(1)
    try { localStorage.setItem('bc-dong-trang', String(hopLe)) } catch { /* bỏ qua lỗi storage */ }
    cuonBangLenDau()
  }

  // Về trang 1 khi: đổi báo cáo, đổi ô tìm, đổi kỳ, báo cáo vẽ lại (T238)
  useEffect(() => {
    setTrangBang(1)
  }, [path, tim, tt.daXem.ky, bangDau?.rows])

  useEffect(() => {
    const onDaXem = () => setTrangBang(1)
    window.addEventListener('bc-da-xem', onDaXem)
    return () => window.removeEventListener('bc-da-xem', onDaXem)
  }, [])

  const dongBangHienThi = useMemo(() => {
    if (!hienPhanTrangBang) return dongBang
    const batDau = (trangBangHt - 1) * coTrangBang
    return [...dongBangDuLieu.slice(batDau, batDau + coTrangBang), ...dongTongBang]
  }, [hienPhanTrangBang, dongBang, dongBangDuLieu, dongTongBang, trangBangHt, coTrangBang])
  // Dòng tổng cuối bảng ghim đáy khung cuộn (T494): đo cao từng dòng từ dưới lên để nhiều dòng tổng xếp chồng, không đè nhau.
  // Dòng số dư, tồn đầu kỳ ở đầu bảng ghim ngay dưới tiêu đề cột
  const dongGhim = useMemo(() => new Set(dongTongBang), [dongTongBang])
  const dongGhimTren = useMemo(() => {
    const res = new Set<Row>()
    for (const r of dongBang) {
      if (!r._b || r._nhom || !Object.values(r).some(v => typeof v === 'string' && /đầu kỳ/i.test(v))) break
      res.add(r)
    }
    return res
  }, [dongBang])
  useLayoutEffect(() => {
    const bang = banDuLieuRef.current
    if (!bang) return
    let duoi = 0
    for (const tr of [...bang.querySelectorAll<HTMLElement>('tr.bc-dong-ghim')].reverse()) {
      tr.style.setProperty('--ghim-duoi', `${duoi}px`)
      duoi += tr.offsetHeight
    }
    let tren = bang.querySelector<HTMLElement>('.tbl thead')?.offsetHeight ?? 0
    for (const tr of bang.querySelectorAll<HTMLElement>('tr.bc-dong-ghim-tren')) {
      tr.style.setProperty('--ghim-tren', `${tren}px`)
      tren += tr.offsetHeight
    }
  }, [dongBangHienThi, coChu, kho])
  // Chia trang khi xem (T157): chỉ bảng đầu, dòng tổng cuối bảng hiện ở mọi trang và là tổng mọi trang
  const dongXem = bangDau ? bangDau.rows.filter(r => !r._t).length : 0
  const chiaXem = !!xemTrang && dongXem > coTrangXem
  const trangXemHt = Math.min(trangXem, Math.max(1, Math.ceil(dongXem / coTrangXem)))
  // Khung đo ẩn vẽ lại mọi dòng: báo cáo có xemTrang chỉ vẽ khi in hoặc lấy HTML
  const coKhungDo = !xemTrang || dangIn || canHtml
  const hienPhanTrang = !!xemTrang && cheXem === 'to-in' && dongXem > 50   // thanh phân trang đã có số dòng, bỏ chữ "N dòng"
  const maxCols = Math.max(1, ...khoi.map(k => k.loai === 'bang' ? k.cols.length : 0))
  const coChuTinh = coChu ?? coChuTheoKho(maxCols, kho)
  const padO = paddingTheoMatDo(maxCols, kho)
  const kt = giay ? { w: giay.rong, h: giay.cao } : KHO[kho]
  const le = giay ? { tren: giay.le[0], phai: giay.le[1], duoi: giay.le[2], trai: giay.le[3] } : LE
  const wPx = kt.w * PX, hPx = kt.h * PX
  const buoc = hPx + CACH

  // Đổi báo cáo: lấy khổ đã chọn của báo cáo đó
  useEffect(() => { setKho(docKho(khoaKho) ?? khoMacDinh) }, [khoaKho])

  // Đo khung ẩn: khi thân, khổ đổi, khi phông tải xong, khi khung đo đổi cỡ
  const doLai = () => {
    const goc = khungDo.current
    // lúc in, khung app bị ẩn nên khung đo không có bố cục: giữ kết quả đo cũ
    if (!goc || !goc.offsetWidth) return
    const moi = doKhung(goc, khoi, congChuyen)
    setD(cu => JSON.stringify(cu) === JSON.stringify(moi) ? cu : moi)
  }
  const doRef = useRef(doLai)
  doRef.current = doLai
  useLayoutEffect(() => { doLai() }, [than, kho, dau, cuoi, kyHieuCot, congChuyen?.join(), kt.w, le.trai, le.phai, coChuTinh, padO, coKhungDo])
  useEffect(() => {
    let song = true
    document.fonts?.ready.then(() => { if (song) doRef.current() })
    const goc = khungDo.current
    if (!goc) return
    const ro = new ResizeObserver(() => doRef.current())
    ro.observe(goc)
    return () => { song = false; ro.disconnect() }
  }, [])

  // Bề rộng bàn cho chế độ Vừa khung
  useEffect(() => {
    const e = ban.current
    if (!e) return
    const ro = new ResizeObserver(() => setRongBan(e.clientWidth))
    ro.observe(e)
    setRongBan(e.clientWidth)
    return () => ro.disconnect()
  }, [cheXem, moXemTruoc])

  const hNoiDung = (kt.h - le.tren - le.duoi) * PX - 1      // chừa 1px cho sai số làm tròn
  const trangDs = useMemo(() => khopDo(d, khoi) ? chiaTrang(d, khoi, hNoiDung, !!cuoi) : [], [d, khoi, hNoiDung, cuoi])
  const N = Math.max(1, trangDs.length)
  const tr = Math.min(trang, N - 1)

  // Zoom bằng transform: CSS zoom bắt trình duyệt dàn lại cả trang mỗi lần đổi (LedgerStudio đo 4–5 giây), transform chỉ vẽ lại
  const zVua = rongBan > 0 ? Math.max(0.2, Math.min(1, (rongBan - 2 * DEM) / wPx)) : 1
  const z = xem.zoom === 'vua' ? zVua : xem.zoom / 100

  const doiXem = (p: Partial<Xem>) => setXem(x => { const n = { ...x, ...p }; ghi('bc-xem', JSON.stringify(n)); return n })
  const doiKho = (k: Kho) => { setKho(k); ghi(`bc-kho:${khoaKho}`, k) }


  // Xem trên màn hình là một tờ liền, không chia trang (T55): đo chiều cao tờ để khung cuộn đúng theo zoom.
  // Chia trang, dòng cộng chuyển trang, số trang chỉ còn khi in và xuất file
  const toLien = useRef<HTMLDivElement>(null)
  const [caoLien, setCaoLien] = useState(hPx)
  useEffect(() => {
    const e = toLien.current
    if (!e) return
    const ro = new ResizeObserver(() => setCaoLien(e.offsetHeight))
    ro.observe(e)
    setCaoLien(e.offsetHeight)
    return () => ro.disconnect()
  }, [cheXem, moXemTruoc])

  // Nút In của thanh công cụ báo cáo mở bản xem trước; nút In trong bản xem trước mới gọi hộp in (bc-in)
  useEffect(() => {
    if (giay) return
    const mo = () => setMoXemTruoc(true)
    window.addEventListener('bc-xem-in', mo)
    return () => window.removeEventListener('bc-xem-in', mo)
  }, [giay])
  // Esc đóng bản xem trước, kể cả khi con trỏ chưa nằm trong khung; menu con (zoom) đang mở thì để menu tự đóng
  useEffect(() => {
    if (!moXemTruoc) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('.pop')) setMoXemTruoc(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [moXemTruoc])

  // In: vẽ mọi trang ra khung riêng gắn vào body, đặt khổ giấy theo khổ đang xem rồi gọi hộp in
  useEffect(() => {
    const bat = () => setDangIn(true)
    window.addEventListener('bc-in', bat)
    return () => window.removeEventListener('bc-in', bat)
  }, [])
  useEffect(() => {
    if (!dangIn) return
    document.getElementById('bc-in-kho')?.remove()
    const st = document.createElement('style')
    st.id = 'bc-in-kho'
    st.textContent = giay
      ? `@page { size: ${giay.rong}mm ${giay.cao}mm; margin: 0 }`
      : `@page { size: A4 ${kho === 'ngang' ? 'landscape' : 'portrait'}; margin: 0 }`
    document.head.appendChild(st)
    const xong = () => setDangIn(false)
    window.addEventListener('afterprint', xong)
    let r2 = 0
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => window.print()) })
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); window.removeEventListener('afterprint', xong); st.remove() }
  }, [dangIn])

  const kieuTrang: CSSProperties = { width: `${kt.w}mm`, height: `${kt.h}mm`, padding: `${le.tren}mm ${le.phai}mm ${le.duoi}mm ${le.trai}mm` }

  const veMuc = (m: Muc) => {
    if (m.k === 'dau') return <div key="dau" className="bc-khoi">{dau}</div>
    if (m.k === 'cuoi') return <div key="cuoi" className="bc-khoi">{cuoi}</div>
    const kh = khoi[m.i]
    if (kh.loai === 'nguyen') return <div key={`k${m.i}`} className="bc-khoi">{kh.el}</div>
    if (m.k !== 'bang' || kh.loai !== 'bang') return null
    const cot = cotCong(kh, congChuyen)
    const n = kh.rows.length
    const rows = cot.length ? [
      ...(m.tu > 0 ? [dongCong(kh, cot, m.tu, CONG_TRUOC)] : []),
      ...kh.rows.slice(m.tu, m.den),
      ...(m.den < n ? [dongCong(kh, cot, m.den, CONG_SAU)] : []),
    ] : kh.rows.slice(m.tu, m.den)
    return (
      <div key={`b${m.i}-${m.tu}`} className={`bc-khoi bc-bang-${m.i}`}>
        <RptTable cols={kh.cols} rows={rows} onRow={kh.onRow} kyHieuCot={kyHieuCot} colWidths={chiaCot(kh.cols, kho, kh.rows)} />
      </div>
    )
  }
  const veTrang = (i: number, choGiu: boolean) => choGiu
    ? <div key={i} className="bc-trang bc-cho" style={kieuTrang} />
    : (
      <div key={i} className="bc-trang paper" style={kieuTrang}>
        {trangDs[i]?.map(veMuc)}
        {!anSoTrang && <div className="bc-so-trang">Trang {i + 1}/{N}</div>}
      </div>
    )

  // Cột bảng trên trang thật giữ đúng bề rộng theo chiaCot để dòng xuống hàng y như lúc đo
  const css = khoi.map((kh, i) => {
    if (kh.loai !== 'bang') return ''
    const pt = chiaCot(kh.cols, kho, kh.rows)
    const coNhom = kh.cols.some(c => c.nhom)
    return `.${pv} .bc-bang-${i} .rpt{table-layout:fixed;width:100%}`
      + pt.map((w, c) => coNhom
        ? `.${pv} .bc-bang-${i} .rpt td:nth-child(${c + 1}){width:${w}%!important;box-sizing:border-box}`
        : `.${pv} .bc-bang-${i} .rpt th:nth-child(${c + 1}),.${pv} .bc-bang-${i} .rpt td:nth-child(${c + 1}){width:${w}%!important;box-sizing:border-box}`
      ).join('')
  }).join('')

  const toMotTrang = (
    <div ref={toLien} className={`bc-trang paper bc-to-lien${coThayDoi ? ' cho-cap-nhat' : ''}`} style={{ width: `${kt.w}mm`, minHeight: `${kt.h}mm`, padding: kieuTrang.padding }}>
      {coThayDoi && <div className="bc-nhac-cap-nhat">Bấm Lọc để cập nhật</div>}
      <div className="bc-khoi">{dau}</div>
      {khoi.map((kh, i) => kh.loai === 'bang'
        ? <div key={i} className={`bc-khoi bc-bang-${i}`}><RptTable cols={kh.cols} rows={chiaXem && kh === bangDau ? dongTrangXem(kh.rows, trangXemHt, coTrangXem) : kh.rows} onRow={kh.onRow} kyHieuCot={kyHieuCot} colWidths={chiaCot(kh.cols, kho, kh.rows)} /></div>
        : kh.loai === 'nguyen' ? <div key={i} className="bc-khoi">{kh.el}</div> : null)}
      {cuoi && <div className="bc-khoi">{cuoi}</div>}
    </div>
  )
  const caoSizer = caoLien * z
  const pct = Math.round(z * 100)
  const nho = () => doiXem({ zoom: [...MUC_ZOOM].reverse().find(m => m < pct) ?? MUC_ZOOM[0] })
  const to = () => doiXem({ zoom: MUC_ZOOM.find(m => m > pct) ?? MUC_ZOOM[MUC_ZOOM.length - 1] })

  return (
    <SoTrangCtx.Provider value={N}>
      <div className="bc-giay" style={{ '--bc-co-chu': `${coChuTinh}px`, '--bc-pad-o': padO } as CSSProperties}>
        {css && <style>{css}</style>}
        {laBang && bangDau ? (
          <div ref={banDuLieuRef} className={`bc-ban-du-lieu${coThayDoi ? ' cho-cap-nhat' : ''}`}>
            {coThayDoi && <div className="bc-nhac-cap-nhat">Bấm Lọc để cập nhật</div>}
            {dauBang && <div className="bc-bang-dau">{dauBang}</div>}
            {dieuKienLoc && <div className="bc-bang-dk-loc"><Icon n="filter" className="ic sm" />Điều kiện lọc: {dieuKienLoc}</div>}
            {/* Dòng nhóm, dòng cộng, dòng tổng in đậm như ở Tờ in (T179) */}
            <Table cols={bangDau.cols} rows={dongBangHienThi} onRow={bangDau.onRow} motDong keDoc virtual={false}
              rowCls={r => r._t ? (dongGhim.has(r) ? 'bc-dong-tong bc-dong-ghim' : 'bc-dong-tong') : dongGhimTren.has(r) ? 'bc-dong-dam bc-dong-ghim-tren' : r._b || r._nhom ? 'bc-dong-dam' : ''} />
          </div>
        ) : !moXemTruoc && (
          <div className="bc-ban" ref={ban}>
            <div className="bc-sizer" style={{ width: wPx * z, height: caoSizer }}>
              <div className={`bc-ds-trang ${pv}`} style={{ width: wPx, transform: `scale(${z})` }}>
                {toMotTrang}
              </div>
            </div>
          </div>
        )}

        <div className="bc-thanh">
          <div className="bc-thanh-nhom">
            {laBang ? (
              hienPhanTrangBang ? (
                <PhanTrang tong={tongDongBang} trang={trangBangHt} coTrang={coTrangBang} dsCoTrang={[100, 200, 500]}
                  onTrang={t => { setTrangBang(t); cuonBangLenDau() }} onCoTrang={doiCoTrangBang} />
              ) : (
                tongDong > 0 && <span className="bc-thanh-dem">{dongBang.length.toLocaleString('vi-VN')} dòng</span>
              )
            ) : (
              <>
                {!giay && tongDong > 0 && !hienPhanTrang && <span className="bc-thanh-dem">{tongDong.toLocaleString('vi-VN')} dòng</span>}
                {hienPhanTrang && (
                  <PhanTrang tong={dongXem} trang={trangXemHt} coTrang={coTrangXem} dsCoTrang={[50, 100, 200, 500]}
                    onTrang={t => { setTrangXem(t); ban.current?.scrollTo({ top: 0 }) }} onCoTrang={c => { setCoTrangXem(c); setTrangXem(1) }} />
                )}
              </>
            )}
          </div>
          {!laBang && !moXemTruoc && (
            <div className="bc-thanh-nhom">
              <button type="button" className="icon-btn sm" title="Thu nhỏ" aria-label="Thu nhỏ" disabled={pct <= MUC_ZOOM[0]} onClick={nho}><Net d="M6 12h12" /></button>
              <Dropdown label={`${pct}%`} btnClass="bc-zoom" title="Chọn mức zoom" align="end" width={150}>
                {dong => (
                  <>
                    {MUC_ZOOM.map(m => <MenuItem key={m} on={xem.zoom === m} onClick={() => { doiXem({ zoom: m }); dong() }}>{m}%</MenuItem>)}
                    <MenuSep />
                    <MenuItem on={xem.zoom === 'vua'} onClick={() => { doiXem({ zoom: 'vua' }); dong() }}>Vừa khung</MenuItem>
                  </>
                )}
              </Dropdown>
              <button type="button" className="icon-btn sm" title="Phóng to" aria-label="Phóng to" disabled={pct >= MUC_ZOOM[MUC_ZOOM.length - 1]} onClick={to}><Icon n="plus" className="ic sm" /></button>
              <button type="button" className={`btn sm${xem.zoom === 'vua' ? ' on' : ''}`} onClick={() => doiXem({ zoom: 'vua' })}>Vừa khung</button>
            </div>
          )}
        </div>

        {/* Xem trước khi in: tờ in theo khổ, zoom, nút In thật; mở từ nút In của thanh công cụ (T179) */}
        {moXemTruoc && createPortal(
          <div className="bc-xem-truoc" role="dialog" aria-label="Xem trước khi in">
            <div className="bc-xem-truoc-dau">
              <b>Xem trước khi in</b>
              <div className="bc-kho-nhom">
                <span className="bc-thanh-nhan">Khổ</span>
                <div className="seg bc-seg-kho bc-pill" data-chon={kho === 'doc' ? 0 : 1}>
                  <button type="button" className={kho === 'doc' ? 'on' : ''} onClick={() => doiKho('doc')}>Dọc</button>
                  <button type="button" className={kho === 'ngang' ? 'on' : ''} onClick={() => doiKho('ngang')}>Ngang</button>
                </div>
              </div>
              <span className="grow" />
              <div className="bc-thanh-nhom">
                <button type="button" className="icon-btn sm" title="Thu nhỏ" aria-label="Thu nhỏ" disabled={pct <= MUC_ZOOM[0]} onClick={nho}><Net d="M6 12h12" /></button>
                <Dropdown label={`${pct}%`} btnClass="bc-zoom" title="Chọn mức zoom" align="end" width={150}>
                  {dong => (
                    <>
                      {MUC_ZOOM.map(m => <MenuItem key={m} on={xem.zoom === m} onClick={() => { doiXem({ zoom: m }); dong() }}>{m}%</MenuItem>)}
                      <MenuSep />
                      <MenuItem on={xem.zoom === 'vua'} onClick={() => { doiXem({ zoom: 'vua' }); dong() }}>Vừa khung</MenuItem>
                    </>
                  )}
                </Dropdown>
                <button type="button" className="icon-btn sm" title="Phóng to" aria-label="Phóng to" disabled={pct >= MUC_ZOOM[MUC_ZOOM.length - 1]} onClick={to}><Icon n="plus" className="ic sm" /></button>
                <button type="button" className={`btn sm${xem.zoom === 'vua' ? ' on' : ''}`} onClick={() => doiXem({ zoom: 'vua' })}>Vừa khung</button>
              </div>
              <button type="button" className="btn sm pri" onClick={() => setDangIn(true)}><Icon n="in-gon" className="ic sm" />In</button>
              <button type="button" className="icon-btn sm" title="Đóng" aria-label="Đóng xem trước" onClick={() => setMoXemTruoc(false)}><Icon n="x" className="ic sm" /></button>
            </div>
            <div className={`bc-giay bc-xem-truoc-than`} style={{ '--bc-co-chu': `${coChuTinh}px`, '--bc-pad-o': padO } as CSSProperties}>
              {css && <style>{css}</style>}
              <div className="bc-ban" ref={ban}>
                <div className="bc-sizer" style={{ width: wPx * z, height: caoSizer }}>
                  <div className={`bc-ds-trang ${pv}`} style={{ width: wPx, transform: `scale(${z})` }}>
                    {toMotTrang}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Khung đo ẩn: ngoài khối transform, cùng bề rộng và lớp CSS với trang thật */}
        {coKhungDo && <div className="bc-do" aria-hidden inert>
          <div ref={khungDo} className={`paper bc-trang-do ${pv}`} style={{ width: `${kt.w}mm`, padding: kieuTrang.padding, '--bc-co-chu': `${coChuTinh}px`, '--bc-pad-o': padO } as CSSProperties}>
            <div className="bc-khoi" data-do="dau">{dau}</div>
            {khoi.map((kh, i) => (
              <div key={i} className={`bc-khoi bc-bang-${i}`} data-do={i}>
                {kh.loai === 'bang'
                  ? <RptTable cols={kh.cols} rows={cotCong(kh, congChuyen).length ? [...kh.rows, dongCong(kh, cotCong(kh, congChuyen), kh.rows.length, CONG_SAU)] : kh.rows} kyHieuCot={kyHieuCot} colWidths={chiaCot(kh.cols, kho, kh.rows)} />
                  : kh.loai === 'nguyen' ? kh.el : null}
              </div>
            ))}
            {cuoi && <div className="bc-khoi" data-do="cuoi">{cuoi}</div>}
          </div>
        </div>}

        {dangIn && createPortal(<div className={`bc-in-goc ${pv}`}>{trangDs.map((_, i) => veTrang(i, false))}</div>, document.body)}

        {/* Khung HTML xuất: chỉ vẽ khi cần lấy HTML để tránh vẽ gấp đôi mọi báo cáo */}
        {canHtml && (
          <div ref={xuatHtmlRef} style={{ display: 'none' }} aria-hidden inert>
            {trangDs.map((_, i) => veTrang(i, false))}
          </div>
        )}
      </div>
    </SoTrangCtx.Provider>
  )
}
