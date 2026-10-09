// Tờ giấy A4 xem như bản in: tự chia trang, lặp tiêu đề cột, zoom, in đúng các trang đang xem (T47)
import {
  Children, Fragment, createContext, isValidElement, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type JSX, type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import type { Col, Row } from '../../modules/types'
import { RptTable, type KyHieuCot } from '../generic/ReportScreen'
import { Dropdown, MenuItem, MenuSep } from '../Dropdown'
import { Icon } from '../Icon'
import { heSoZoom } from '../zoom'

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

export function ToGiay({ dau, than, cuoi, khoMacDinh, kyHieuCot, congChuyen, giay, anSoTrang, onKho, layHtmlRef }: {
  dau: ReactNode; than: ReactNode; cuoi?: ReactNode; khoMacDinh: Kho
  kyHieuCot?: KyHieuCot     // hàng ký hiệu cột A, B, 1, 2 dưới tiêu đề mọi bảng
  congChuyen?: string[]     // sổ: cột cộng chuyển trang
  giay?: Giay               // khổ riêng của mẫu in: bỏ chọn Dọc/Ngang, không lưu khổ
  anSoTrang?: boolean       // ẩn dòng "Trang x/y"
  onKho?: (k: Kho) => void  // báo khổ giấy đang chọn cho khung ngoài xuất file
  layHtmlRef?: { current: (() => string) | null } // ref lấy HTML các trang thật
}): JSX.Element {
  const path = useLocation().pathname
  const [kho, setKho] = useState<Kho>(() => docKho(path) ?? khoMacDinh)
  const [xem, setXem] = useState<Xem>(docXem)
  const [d, setD] = useState<Do | null>(null)
  const [trang, setTrang] = useState(0)
  const [oTrang, setOTrang] = useState('1')
  const [rongBan, setRongBan] = useState(0)
  const [dangIn, setDangIn] = useState(false)
  const ban = useRef<HTMLDivElement>(null)
  const khungDo = useRef<HTMLDivElement>(null)
  const xuatHtmlRef = useRef<HTMLDivElement>(null)
  const pv = 'bcg' + useId().replace(/[^a-zA-Z0-9]/g, '')

  useEffect(() => { onKho?.(kho) }, [kho, onKho])

  useEffect(() => {
    if (layHtmlRef) {
      layHtmlRef.current = () => {
        const trangs = xuatHtmlRef.current?.querySelectorAll('.bc-trang')
        if (trangs && trangs.length > 0) {
          return Array.from(trangs).map(el => el.outerHTML).join('\n')
        }
        const banTrang = ban.current?.querySelectorAll('.bc-trang:not(.bc-cho)')
        return Array.from(banTrang ?? []).map(el => el.outerHTML).join('\n')
      }
    }
  })

  const khoi = useMemo(() => tachKhoi(than), [than])
  const tongDong = khoi.reduce((a, k) => a + (k.loai === 'bang' ? k.rows.length : 0), 0)
  const kt = giay ? { w: giay.rong, h: giay.cao } : KHO[kho]
  const le = giay ? { tren: giay.le[0], phai: giay.le[1], duoi: giay.le[2], trai: giay.le[3] } : LE
  const wPx = kt.w * PX, hPx = kt.h * PX
  const buoc = hPx + CACH

  // Đổi báo cáo: lấy khổ đã chọn của báo cáo đó
  useEffect(() => { setKho(docKho(path) ?? khoMacDinh) }, [path, khoMacDinh])

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
  useLayoutEffect(() => { doLai() }, [than, kho, dau, cuoi, kyHieuCot, congChuyen?.join(), kt.w, le.trai, le.phai])
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
  }, [])

  const hNoiDung = (kt.h - le.tren - le.duoi) * PX - 1      // chừa 1px cho sai số làm tròn
  const trangDs = useMemo(() => khopDo(d, khoi) ? chiaTrang(d, khoi, hNoiDung, !!cuoi) : [], [d, khoi, hNoiDung, cuoi])
  const N = Math.max(1, trangDs.length)
  const tr = Math.min(trang, N - 1)

  // Zoom bằng transform: CSS zoom bắt trình duyệt dàn lại cả trang mỗi lần đổi (LedgerStudio đo 4–5 giây), transform chỉ vẽ lại
  const zVua = rongBan > 0 ? Math.max(0.2, Math.min(1, (rongBan - 2 * DEM) / wPx)) : 1
  const z = xem.zoom === 'vua' ? zVua : xem.zoom / 100

  const doiXem = (p: Partial<Xem>) => setXem(x => { const n = { ...x, ...p }; ghi('bc-xem', JSON.stringify(n)); return n })
  const doiKho = (k: Kho) => { setKho(k); ghi(`bc-kho:${path}`, k) }

  const trRef = useRef(tr)
  trRef.current = tr
  useEffect(() => { setOTrang(String(tr + 1)) }, [tr])
  // Đổi zoom, đổi chế độ xem: giữ trang đang xem
  useLayoutEffect(() => {
    if (xem.che === 'lien' && ban.current) ban.current.scrollTop = DEM + trRef.current * buoc * z
  }, [z, xem.che, buoc])

  const toi = (i: number) => {
    const j = Math.max(0, Math.min(N - 1, i))
    setTrang(j)
    if (xem.che === 'lien' && ban.current) ban.current.scrollTop = DEM + j * buoc * z
  }
  const cuon = () => {
    const e = ban.current
    if (!e || xem.che !== 'lien') return
    const cuoiBan = e.scrollTop + e.clientHeight >= e.scrollHeight - 2
    setTrang(cuoiBan ? N - 1 : Math.max(0, Math.min(N - 1, Math.floor((e.scrollTop - DEM + e.clientHeight / 3) / (buoc * z)))))
  }

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
        <RptTable cols={kh.cols} rows={rows} onRow={kh.onRow} kyHieuCot={kyHieuCot} />
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

  // Cột bảng trên trang thật giữ đúng bề rộng đo trên bảng đủ dòng, để dòng xuống hàng y như lúc đo
  const css = khopDo(d, khoi) ? khoi.map((kh, i) => {
    const m = d.khoi[i]
    if (kh.loai !== 'bang' || typeof m === 'number' || !m.rong.length) return ''
    return `.${pv} .bc-bang-${i} .rpt{table-layout:fixed}`
      + m.rong.map((w, c) => `.${pv} .bc-bang-${i} .rpt th:nth-child(${c + 1}){width:${w.toFixed(2)}px!important;box-sizing:border-box}`).join('')
  }).join('') : ''

  const lien = xem.che === 'lien'
  const hienTat = lien ? trangDs.map((_, i) => veTrang(i, N > 30 && Math.abs(i - tr) > 2)) : [veTrang(tr, false)]
  const caoSizer = lien ? (N * buoc - CACH) * z : hPx * z
  const pct = Math.round(z * 100)
  const nho = () => doiXem({ zoom: [...MUC_ZOOM].reverse().find(m => m < pct) ?? MUC_ZOOM[0] })
  const to = () => doiXem({ zoom: MUC_ZOOM.find(m => m > pct) ?? MUC_ZOOM[MUC_ZOOM.length - 1] })

  return (
    <SoTrangCtx.Provider value={N}>
      <div className="bc-giay">
        {css && <style>{css}</style>}
        <div className="bc-ban" ref={ban} onScroll={cuon}>
          <div className="bc-sizer" style={{ width: wPx * z, height: caoSizer }}>
            <div className={`bc-ds-trang ${pv}`} style={{ width: wPx, transform: `scale(${z})` }}>
              {hienTat}
            </div>
          </div>
        </div>

        <div className="bc-thanh">
          <div className="bc-thanh-nhom">
            <button type="button" className="icon-btn sm" title="Trang đầu" aria-label="Trang đầu" disabled={tr <= 0} onClick={() => toi(0)}><Net d="M12 7l-5 5 5 5M18 7l-5 5 5 5" /></button>
            <button type="button" className="icon-btn sm" title="Trang trước" aria-label="Trang trước" disabled={tr <= 0} onClick={() => toi(tr - 1)}><Icon n="chevl" className="ic sm" /></button>
            <input className="bc-o-trang" value={oTrang} aria-label="Số trang" inputMode="numeric"
              onChange={e => setOTrang(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => { if (e.key === 'Enter') { const v = Number(oTrang); if (v) toi(v - 1); else setOTrang(String(tr + 1)) } }}
              onBlur={() => setOTrang(String(tr + 1))} />
            <span className="bc-thanh-nhan">/ {N}</span>
            <button type="button" className="icon-btn sm" title="Trang sau" aria-label="Trang sau" disabled={tr >= N - 1} onClick={() => toi(tr + 1)}><Icon n="chevr" className="ic sm" /></button>
            <button type="button" className="icon-btn sm" title="Trang cuối" aria-label="Trang cuối" disabled={tr >= N - 1} onClick={() => toi(N - 1)}><Net d="M6 7l5 5-5 5M12 7l5 5-5 5" /></button>
            {!giay && <span className="bc-thanh-dem">{tongDong.toLocaleString('vi-VN')} dòng</span>}
          </div>

          <div className="bc-thanh-nhom">
            {!giay && (
              <>
                <span className="bc-thanh-nhan">Khổ</span>
                <div className="seg">
                  <button type="button" className={kho === 'doc' ? 'on' : ''} onClick={() => doiKho('doc')}>Dọc</button>
                  <button type="button" className={kho === 'ngang' ? 'on' : ''} onClick={() => doiKho('ngang')}>Ngang</button>
                </div>
              </>
            )}
            <span className="bc-thanh-nhan">Xem</span>
            <div className="seg">
              <button type="button" className={lien ? 'on' : ''} onClick={() => doiXem({ che: 'lien' })}>Liên tục</button>
              <button type="button" className={!lien ? 'on' : ''} onClick={() => doiXem({ che: 'tung' })}>Từng trang</button>
            </div>
          </div>

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
            <button type="button" className="icon-btn sm" title="In" aria-label="In" onClick={() => setDangIn(true)}><Icon n="printer" className="ic sm" /></button>
          </div>
        </div>

        {/* Khung đo ẩn: ngoài khối transform, cùng bề rộng và lớp CSS với trang thật */}
        <div className="bc-do" aria-hidden inert>
          <div ref={khungDo} className="paper bc-trang-do" style={{ width: `${kt.w}mm`, padding: kieuTrang.padding }}>
            <div className="bc-khoi" data-do="dau">{dau}</div>
            {khoi.map((kh, i) => (
              <div key={i} className="bc-khoi" data-do={i}>
                {kh.loai === 'bang'
                  ? <RptTable cols={kh.cols} rows={cotCong(kh, congChuyen).length ? [...kh.rows, dongCong(kh, cotCong(kh, congChuyen), kh.rows.length, CONG_SAU)] : kh.rows} kyHieuCot={kyHieuCot} />
                  : kh.loai === 'nguyen' ? kh.el : null}
              </div>
            ))}
            {cuoi && <div className="bc-khoi" data-do="cuoi">{cuoi}</div>}
          </div>
        </div>

        {dangIn && createPortal(<div className={`bc-in-goc ${pv}`}>{trangDs.map((_, i) => veTrang(i, false))}</div>, document.body)}

        {/* Khung HTML xuất: chứa đủ các trang thật, không transform, không khung đo, không ô giữ chỗ */}
        <div ref={xuatHtmlRef} style={{ display: 'none' }} aria-hidden inert>
          {trangDs.map((_, i) => veTrang(i, false))}
        </div>
      </div>
    </SoTrangCtx.Provider>
  )
}
