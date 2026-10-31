import { useEffect, useRef, useState, useSyncExternalStore, type FC } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession, cuaHangHienTai } from '../../app/session'
import { MODULES, dich, moDuoc, nhanTab, timMan } from '../../app/registry'
import type { ModuleDef, ScreenDef, NutQT } from '../../modules/types'
import { Icon } from '../Icon'
import { boPhieuMoi } from '../generic/daXoa'
import { datTourChay, dongFormTren, formTren, ngheForm, phieuTour, soLanLuu } from '../huongDanForm'
import {
  dsTour,
  docXem,
  ghiXem,
  khopNut,
  layHuongDan,
  luongCua,
  manDangMo,
  timCho,
  trongForm,
  type BuocTour,
  type HuongDanMan,
} from '../HuongDanNhanh'

// Bỏ các bước web khỏi tour và danh sách Làm nhanh của điện thoại (T703)
function layHuongDanDt(mod: ModuleDef, sc: ScreenDef | undefined, s: Parameters<typeof layHuongDan>[2]): HuongDanMan | undefined {
  const hd = layHuongDan(mod, sc, s)
  if (!hd) return undefined
  return { ...hd, buoc: hd.buoc.filter(b => !b.web) }
}

const CHU_CN = 'Thanh trên đang xem Tất cả cửa hàng nên phiếu mới hỏi lập cho cửa hàng nào. Bấm tên một cửa hàng để chọn.'
const coKhung = (e: Element) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }

/** Tìm phiếu vừa lưu trong bảng danh sách điện thoại */
function timPhieuVua(so: string): Element | undefined {
  return [...document.querySelectorAll('.m-mh-dong, .m-ds-dong-phieu, [data-hd="bang"] button, .m-tc-danh-sach button, .main table.tbl tbody tr')]
    .find(e => coKhung(e) && !!e.textContent?.includes(so))
}

/** Chỗ khoanh của bước tour trên điện thoại */
function choTourDt(hd: HuongDanMan, x: BuocTour, form: HTMLElement | null, so?: string): DOMRect | null {
  const o = x.k === 'buoc' ? hd.buoc[x.n].o : undefined
  let r: DOMRect | null = null
  if (x.k === 'cn') {
    const el = form?.querySelector('.chon-cn') ?? document.querySelector('.ccht-m-hop, .chon-cn')
    r = el && coKhung(el) ? el.getBoundingClientRect() : null
  } else if (x.k === 'vua') {
    const el = so ? timPhieuVua(so) : undefined
    r = el && coKhung(el) ? el.getBoundingClientRect() : timCho('bang', form)
  } else if (o) {
    r = timCho(o, form)
  }
  if (!r) return null
  const top = Math.max(r.top, 6)
  const bottom = Math.min(r.bottom, window.innerHeight - 6)
  const height = Math.max(10, bottom - top)
  return new DOMRect(r.left, top, r.width, height)
}

function timPhanTuCho(k: string, form: HTMLElement | null): Element | null {
  const rieng = [...(form ?? document).querySelectorAll(`[data-hd="${k}"]`)].find(e => {
    const r = e.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  })
  if (rieng) return rieng
  if (k === 'cn') return document.querySelector('.ccht-m-hop, .chon-cn')
  if (form) return null
  if (k === 'tab') return document.querySelector('.m-tc-tabs, .mtabs-in')
  if (k === 'loc') return document.querySelector('.m-tc-loc-bar, .ds-toolbar-figma')
  if (k === 'bang') return document.querySelector('.m-mh-ds-nhom, .m-tc-danh-sach, .m-so-dong, .tbl-wrap')
  return null
}

/** Cuộn khung chứa để chỗ khoanh vào tầm nhìn, không cuộn lệch ngang cả trang */
function cuonToiCho(el: unknown) {
  if (!(el instanceof Element) || !el.isConnected) return
  const r = el.getBoundingClientRect()
  const H = window.innerHeight
  if (r.top < 60 || r.bottom > H - 60) {
    el.scrollIntoView({ block: 'center', inline: 'nearest' })
  }
  const goc = document.scrollingElement
  if (goc && goc.scrollLeft) goc.scrollLeft = 0
  document.querySelectorAll<HTMLElement>('.m-than, .m-tc-man, body').forEach(k => {
    if (k.scrollLeft) k.scrollLeft = 0
  })
}

/** Đo chiều cao bong bóng sau khi vẽ, để đặt vị trí không tràn màn */
function useCaoBong() {
  const [cao, setCao] = useState(200)
  const ref = (el: HTMLDivElement | null) => { if (el && Math.abs(el.offsetHeight - cao) > 2) setCao(el.offsetHeight) }
  return [cao, ref] as const
}

/** Đi tiếp vẽ dọc 3 ô (Bước trước, Đang ở, Bước sau) theo QD89 */
function MDiTiepDoc({ qtMod, khoa, s, onChon }: { qtMod: ModuleDef; khoa: string[]; s: any; onChon: () => void }) {
  const ds = luongCua(qtMod.quyTrinh!, s)
  if (!ds.length) return null
  const iDang = ds.findIndex(b => b.nut.some(n => khopNut(n, khoa)))
  if (iDang < 0) return null

  const dang = ds[iDang]
  const truoc = dang.song ? undefined : ds[iDang - 1]
  const sauDo = dang.song ? ds.find(b => !b.song) : ds[iDang + 1]

  const oTruoc = truoc?.nut[0]
  const oDang = dang.nut[0]
  const oSau = sauDo?.nut[0]

  const link = (nhan: string, n?: NutQT, dangO?: boolean) => {
    if (!n) return null
    const d = n.di ? dich(n.di) : undefined
    const content = (
      <div className={`m-hdn-luong-o${dangO ? ' dang' : ''}`}>
        <small>{nhan}</small>
        <b>{n.ten}</b>
      </div>
    )
    if (d?.path && (!d.sc || moDuoc(d.sc, s.goi))) {
      return (
        <Link to={d.path} onClick={onChon} style={{ textDecoration: 'none' }}>
          {content}
        </Link>
      )
    }
    return content
  }

  return (
    <div className="m-hdn-luong">
      {truoc && link('BƯỚC TRƯỚC', oTruoc, false)}
      {truoc && (
        <div className="m-hdn-luong-mui">
          <Icon n="chevd" className="ic sm" />
        </div>
      )}
      {link('ĐANG Ở', oDang, true)}
      {sauDo && (
        <div className="m-hdn-luong-mui">
          <Icon n="chevd" className="ic sm" />
        </div>
      )}
      {sauDo && link('BƯỚC SAU', oSau, false)}
    </div>
  )
}

// ── Quản lý trạng thái tour điện thoại tập trung (sống qua chuyển route trong phân hệ) ──
export interface TourStateDt {
  mod: ModuleDef
  sc: ScreenDef
  goc: { path: string; cuaHang: string; hoiCn: boolean }
  i: number
}

let tourHienTai: TourStateDt | null = null
const dsNgheTour = new Set<() => void>()
const baoTour = () => dsNgheTour.forEach(f => f())
export const ngheTourDt = (f: () => void) => { dsNgheTour.add(f); return () => { dsNgheTour.delete(f) } }
export const layTourDt = () => tourHienTai

export function batDauTourDt(mod: ModuleDef, sc: ScreenDef, goc: { path: string; cuaHang: string; hoiCn: boolean }) {
  tourHienTai = { mod, sc, goc, i: 0 }
  baoTour()
}

export function doiBuocTourDt(i: number) {
  if (!tourHienTai) return
  tourHienTai = { ...tourHienTai, i }
  baoTour()
}

export function ketThucTourDt() {
  tourHienTai = null
  baoTour()
}

export interface MNutHuongDanProps {
  mod?: ModuleDef | string
  sc?: ScreenDef | string
}

/** Nút bóng đèn 36px thanh trên và các header điện thoại (T675, QD89) */
export const MNutHuongDan: FC<MNutHuongDanProps> = ({ mod: propMod, sc: propSc }) => {
  const { s } = useSession()
  const loc = useLocation()

  const [, locModKey, locSlug] = loc.pathname.split('/').filter(Boolean)
  const modKey = typeof propMod === 'string' ? propMod : propMod?.key ?? locModKey
  const slug = typeof propSc === 'string' ? propSc : propSc?.slug ?? locSlug
  const tm = timMan(modKey, slug)
  const mod = typeof propMod === 'object' ? propMod : tm.mod
  const currentSc = typeof propSc === 'object' ? propSc : tm.sc
  const sc = currentSc ?? (mod ? manDangMo(mod, slug, s) : undefined)

  const hd = mod && sc ? layHuongDanDt(mod, sc, s) : undefined
  const khoaXem = `${s.email}|${sc?.goc ?? mod?.key}/${sc?.slug ?? slug ?? ''}`
  const [daXem, setDaXem] = useState(() => docXem().includes(khoaXem))

  useEffect(() => {
    setDaXem(docXem().includes(khoaXem))
  }, [khoaXem])

  if (!mod || mod.key === 'trang-chu' || !sc || !hd) return null

  const batDau = () => {
    ghiXem(khoaXem)
    setDaXem(true)
    batDauTourDt(mod, sc, {
      path: loc.pathname + loc.search,
      cuaHang: s.cuaHang,
      hoiCn: !cuaHangHienTai(s),
    })
  }

  return (
    <button
      type="button"
      className={`m-bulb-hdn${daXem ? '' : ' moi'}`}
      title="Hướng dẫn màn này"
      aria-label="Hướng dẫn màn này"
      onClick={batDau}
    >
      <Icon n="bong-den" className="ic" />
    </button>
  )
}

/** Lớp phủ Tour Hướng dẫn nhanh điện thoại (gắn tại MobileShell, sống qua các màn trong phân hệ) */
export const MTourOverlay: FC = () => {
  const tour = useSyncExternalStore(ngheTourDt, layTourDt)
  const { s, set } = useSession()
  const loc = useLocation()
  const nav = useNavigate()

  const [o, setO] = useState<DOMRect | null>(null)
  const [doi, setDoi] = useState(false)
  const [caoBong, refBong] = useCaoBong()
  const refTiep = useRef<HTMLButtonElement>(null)
  const form = useSyncExternalStore(ngheForm, formTren)

  const chay = tour !== null
  const mod = tour?.mod
  const sc = tour?.sc
  const goc = tour?.goc
  const i = tour?.i ?? 0

  const hd = mod && sc ? layHuongDanDt(mod, sc, s) : undefined
  const ds = hd ? dsTour(hd, !!goc?.hoiCn) : []
  const x = ds[i] as BuocTour | undefined

  useEffect(() => {
    if (!chay) return
    datTourChay(true)
    return () => datTourChay(false)
  }, [chay])

  // Bám chỗ khoanh
  useEffect(() => {
    if (!chay || !hd || !x) return
    const coCho = x.k === 'cn' || x.k === 'vua' || (x.k === 'buoc' && !!hd.buoc[x.n].o)
    const bd = Date.now()
    let f = 0
    let daCuon = false

    const bam = () => {
      const el = x.k === 'cn' ? form?.querySelector('.chon-cn')
        : x.k === 'vua' ? (timPhieuVua(phieuTour().at(-1)?.so ?? '') ?? timPhanTuCho('bang', form))
        : x.k === 'buoc' && hd.buoc[x.n].o ? timPhanTuCho(hd.buoc[x.n].o!, form)
        : null
      if (el instanceof Element && el.isConnected && !daCuon) {
        daCuon = true
        cuonToiCho(el)
      }
      const r = coCho ? choTourDt(hd, x, formTren(), phieuTour().at(-1)?.so) : null
      setO(c => c && r && c.x === r.x && c.y === r.y && c.width === r.width && c.height === r.height ? c : r)
      setDoi(coCho && !r && Date.now() - bd < 1500)
      if (coCho) f = requestAnimationFrame(bam)
    }
    bam()
    return () => cancelAnimationFrame(f)
  }, [chay, i, mod?.key, sc?.slug])

  // Focus nút Tiếp / Bắt đầu
  useEffect(() => {
    if (chay && !doi) refTiep.current?.focus({ preventScroll: true })
  }, [chay, i, doi])

  // Chặn phím ngoài bong bóng
  useEffect(() => {
    if (!chay) return
    const chan = (e: KeyboardEvent) => {
      const trong = e.target instanceof Element && !!e.target.closest('.hdn-dt-tour .hdan-bong')
      if (!(e.key === 'Tab' || (trong && (e.key === 'Enter' || e.key === ' ')))) e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', chan, true)
    return () => window.removeEventListener('keydown', chan, true)
  }, [chay])

  if (!chay || !mod || !sc || !hd || !goc || !x) return null

  function ketThuc(veCu: boolean) {
    if (formTren()) dongFormTren()
    for (const p of phieuTour()) boPhieuMoi(p.man, p.id)
    if (goc && s.cuaHang !== goc.cuaHang) set({ cuaHang: goc.cuaHang })
    const duongVe = goc?.path
    ketThucTourDt()
    if (veCu && duongVe) nav(duongVe, { replace: true })
  }

  function diMoForm(n: number) {
    if (!hd || !sc) return undefined
    return hd.buoc.slice(0, n).reverse().find(y => y.di)?.di
      ?? (sc.kind === 'voucher' && !sc.voucher?.khongThem ? `${loc.pathname.split('/')[2]}/${sc.slug}/moi` : undefined)
  }

  function toi(t: number) {
    const y = ds[t]
    if (!hd || !y) return
    if (trongForm(hd, y)) {
      if (y.k === 'cn' && goc && s.cuaHang !== goc.cuaHang) set({ cuaHang: goc.cuaHang })
      const di = !formTren() && diMoForm(y.n)
      if (di) nav(`/app/${di}`)
    } else {
      if (formTren()) {
        dongFormTren()
      } else if (loc.pathname.endsWith('/moi') && goc) {
        nav(goc.path, { replace: true })
      }
    }
    doiBuocTourDt(t)
  }

  function tiep() {
    if (!hd || !x) return
    if (x.k === 'cn') {
      const nutCn = document.querySelector<HTMLElement>('.ccht-m-dong, .chon-cn-ds button, .chon-cn button')
      if (nutCn) nutCn.click()
      toi(i + 1)
      return
    }
    const luu = x.k === 'buoc' && hd.buoc[x.n].o === 'luu' ? (form ?? document).querySelector<HTMLElement>('[data-hd="luu"]') : null
    if (luu) {
      const truoc = soLanLuu()
      luu.click()
      if (soLanLuu() > truoc) {
        doiBuocTourDt(i + 1)
        return
      }
      setTimeout(() => {
        doiBuocTourDt(i + 1)
      }, 100)
      return
    }
    toi(i + 1)
  }

  const qtMod = MODULES.find(m => m.key === (hd.quyTrinh?.mod ?? (mod.key === 'bao-cao' ? sc.goc : undefined) ?? mod.key))
  const khoa = [`${sc.goc ?? mod.key}/${sc.slug}`, ...(hd.quyTrinh?.khop ?? [])]
  const tong = ds.length - 2
  const b = x.k === 'buoc' ? hd.buoc[x.n] : undefined
  const soVua = phieuTour().at(-1)?.so

  const boQua = <button type="button" className="btn ghost sm" onClick={() => ketThuc(true)}>Bỏ qua</button>
  let than: React.ReactNode = null

  if (x.k === 'dau') {
    than = (
      <>
        <div className="hdan-bong-ic"><Icon n="bong-den" className="ic" /></div>
        <small className="hdn-bong-nhan">HƯỚNG DẪN NHANH</small>
        <b>{nhanTab(sc)}</b>
        <p>{hd.muc}</p>
        <div className="hdn-bong-phude">{tong} bước, khoảng 1 phút. Tour tự mở phiếu, tự lưu phiếu mẫu, xong thì xoá phiếu mẫu.</div>
        <div className="row hdan-nut">
          {boQua}
          <span className="grow" />
          <button ref={refTiep} type="button" className="btn pri sm" onClick={() => toi(1)}>Bắt đầu</button>
        </div>
      </>
    )
  } else if (x.k === 'cuoi') {
    than = (
      <>
        <div className="hdn-bong-dau">
          <span className="hdan-bong-ic"><Icon n="check" className="ic" /></span>
          <b>Đã xem hết hướng dẫn</b>
        </div>
        {!!hd.luuY?.length && (
          <section className="hdn-muc">
            <h4>Lưu ý</h4>
            <ul className="hdn-luu">{hd.luuY.map((y, n) => <li key={n}>{y}</li>)}</ul>
          </section>
        )}
        {qtMod?.quyTrinh && (
          <section className="hdn-muc">
            <h4>Đi tiếp</h4>
            <MDiTiepDoc qtMod={qtMod} khoa={khoa} s={s} onChon={() => ketThuc(false)} />
          </section>
        )}
        <div className="row hdan-nut">
          <button type="button" className="btn sm" onClick={() => toi(i - 1)}>Quay lại</button>
          <span className="grow" />
          <button ref={refTiep} type="button" className="btn pri sm" onClick={() => ketThuc(true)}>Xong</button>
        </div>
      </>
    )
  } else {
    than = (
      <>
        <div className="hdn-bong-so">Bước {i}/{tong}</div>
        <p className="hdn-bong-chu">
          {x.k === 'cn' ? CHU_CN
            : x.k === 'vua' ? `Phiếu ${soVua ?? ''} vừa lưu nằm ở đầu danh sách. Đây là phiếu mẫu của hướng dẫn, tắt hướng dẫn thì phiếu tự xoá.`
            : (b?.dt || b?.chu)}
        </p>
        <div className="row hdan-nut">
          {boQua}
          <span className="grow" />
          {i > 1 && <button type="button" className="btn sm" onClick={() => toi(i - 1)}>Quay lại</button>}
          <button ref={refTiep} type="button" className="btn pri sm" onClick={tiep}>Tiếp</button>
        </div>
      </>
    )
  }

  // Tính toán vị trí bong bóng và mũi nhọn
  const H = window.innerHeight
  const W = window.innerWidth
  const cao = Math.min(caoBong, H * 0.7)
  const khe = 16

  let duoi = true
  let topBong = 0
  let muiLeft = 0
  let muiTop = 0

  if (o) {
    duoi = (o.bottom + khe + cao < H - 12)
    topBong = duoi ? o.bottom + khe : Math.max(12, o.top - khe - cao)
    muiLeft = Math.min(W - 34, Math.max(20, o.left + o.width / 2 - 7))
    muiTop = duoi ? topBong - 7 : topBong + cao - 7
  }

  const tourEl = (
    <div
      className="hdan hdn-tour hdn-dt-tour"
      role="dialog"
      aria-modal="true"
      aria-label={`Hướng dẫn nhanh: ${nhanTab(sc)}`}
      onClick={e => {
        if (e.target === e.currentTarget || (e.target as Element).classList.contains('hdn-tour-toi') || (e.target as Element).classList.contains('hdn-dt-tour')) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      {o ? (
        <div
          className="hdan-lo"
          style={{
            left: o.left - 5,
            top: o.top - 5,
            width: o.width + 10,
            height: o.height + 10,
          }}
        />
      ) : (
        <div className="hdan-toi hdn-tour-toi" />
      )}
      {!doi && o && (
        <div
          className={`hdn-dt-mui ${duoi ? 'tren' : 'duoi'}`}
          style={{ left: muiLeft, top: muiTop }}
        />
      )}
      {!doi && (
        <div
          ref={refBong}
          className={`hdan-bong hdn-dt-bong${o ? '' : ' giua'}${x.k === 'cuoi' ? ' cuoi' : ''}`}
          style={o ? { top: topBong } : undefined}
          data-k={x.k === 'buoc' ? b?.o ?? '' : x.k}
          data-buoc={i}
          data-tong={tong}
          aria-live="polite"
          onClickCapture={e => {
            if (e.target instanceof Element && e.target.closest('a')) ketThuc(false)
          }}
        >
          {than}
        </div>
      )}
    </div>
  )

  return createPortal(tourEl, document.body)
}
