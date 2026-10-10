// Màn Quy trình của phân hệ, kiểu AMIS: sơ đồ nghiệp vụ, khung Báo cáo bên phải, hàng dưới gồm danh mục liên quan, Tiện ích, Tuỳ chọn.
// Bấm ô trên sơ đồ mở thẳng form chứng từ mới (đích có /moi) hoặc màn tương ứng. Ô ngoài gói hiện mờ, có khoá và nhãn gói.
import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CotQT, LanQT, NutQT, QuyTrinhDef, ScreenProps } from '../../modules/types'
import { MODULES, anPhanHeGoi, dich, hienMan, maKhoa, moDuoc, nhanTab, phanHeKhoa, tenMan } from '../../app/registry'
import { useSession, type Session } from '../../app/session'
import { GOI, GOIS, anNgoaiGoi, minGoi, type Goi } from '../../app/plan'
import type { CheDo } from '../../app/che-do'
import { Icon } from '../Icon'
import { Note, Pk } from '../Page'
import { Dropdown, MenuHead, MenuItem } from '../Dropdown'
import { heSoZoom } from '../zoom'

const RH = 128        // chiều cao một hàng ô
const TILE = 54       // cạnh ô biểu tượng
const TOP = 8         // khoảng từ mép hàng tới ô biểu tượng

export function QuyTrinhScreen({ mod }: ScreenProps) {
  const { s, set } = useSession()
  const an = anNgoaiGoi(s.goi)
  // Gói Free bỏ ô ngoài gói, làn trống, bước trống (QD22)
  const hien = (n: NutQT) => !an || moNut(n, s.goi).ok
  const goc0 = mod.quyTrinh!
  // Gói Free có sơ đồ hội tụ riêng thì thay sơ đồ chung (T98)
  const goc: QuyTrinhDef = s.goi === 'F' && goc0.hoiTuFree ? { ...goc0, buoc: [], hoiTu: goc0.hoiTuFree } : goc0
  // Gói Free có sơ đồ luồng theo cột thì thay sơ đồ chung (T123)
  const luongRa = s.goi === 'F' && goc0.luongFree && goc0.luongFreeRa ? { ...goc0.luongFreeRa, nut: goc0.luongFreeRa.nut.filter(hien) } : null
  const luong = s.goi === 'F' && goc0.luongFree ? goc0.luongFree.map(c => ({ ...c, nut: c.nut.filter(hien) })).filter(c => c.nut.length) : null
  const qt: QuyTrinhDef = {
    ...goc,
    buoc: goc.buoc.filter(b => hien(b.chinh)).map(b => ({ ...b, tren: b.tren?.filter(hien), duoi: b.duoi?.filter(hien) })),
    hoiTu: goc.hoiTu && {
      lan: goc.hoiTu.lan.map(l => ({ ...l, nut: l.nut.filter(hien) })).filter(l => l.nut.length > 0),
      ra: { ...goc.hoiTu.ra, nut: goc.hoiTu.ra.nut.filter(hien) },
    },
  }
  const nut = [...(luong ? luong.flatMap(c => c.nut) : qt.buoc.flatMap(b => [b.chinh, ...(b.tren ?? []), ...(b.duoi ?? [])])),
    ...(qt.hoiTu ? [...qt.hoiTu.lan, qt.hoiTu.ra].flatMap(l => l.nut) : []), ...(luongRa?.nut ?? [])]
  const mo = nut.filter(n => moNut(n, s.goi).ok).length
  // cả phân hệ ngoài gói thì mời xem thử gói thấp nhất có phân hệ này
  const khoa = phanHeKhoa(mod, s.goi)
  const thapNhat = mod.screens.filter(sc => sc.code || sc.can).map(sc => minGoi(maKhoa(sc)!))
  const can = GOIS.find(g => thapNhat.includes(g))
  const coForm = nut.some(n => n.di.includes('/moi'))

  return (
    <div className="page wide qt">
      <div className={`qt-top ${qt.hoiTu || luongRa ? 'mot-cot' : ''}`}>
        <section className="card qt-card">
          <div className="qt-h">
            <h1>{qt.ten}</h1>
            <span className="sub">{coForm ? 'Bấm vào ô để mở chứng từ' : 'Bấm vào ô để mở màn hình'}</span>
            <span className="grow" />
            {!an && <span className="qt-dem">Gói {GOI[s.goi].ten} mở {mo}/{nut.length} nghiệp vụ</span>}
          </div>
          {s.goi === 'F' && goc0.moTaFree && <p className="qt-mo-ta">{goc0.moTaFree}</p>}
          {khoa && can && (
            <Note kind="warn" icon="lock">
              {mod.ten} có từ gói {GOI[can].ten}. Sơ đồ vẫn hiện để xem trước.{' '}
              <button className="btn sm" onClick={() => set({ goi: can })}>Xem thử gói {GOI[can].ten}</button>
            </Note>
          )}
          {qt.hoiTu ? <SoDoHoiTu lan={qt.hoiTu.lan} ra={qt.hoiTu.ra} goi={s.goi} modKey={mod.key} />
            : luong ? <SoDoLuong cot={luong} ra={luongRa} goi={s.goi} modKey={mod.key} /> : <SoDo qt={qt} goi={s.goi} />}
        </section>
        {/* Sơ đồ hội tụ đã có khối sổ sách, báo cáo ở cuối nên bỏ khung Báo cáo bên phải để khỏi trùng */}
        {!qt.hoiTu && !luongRa && <BenPhai qt={qt} modKey={mod.key} goi={s.goi} cheDo={s.cheDo} session={s} />}
      </div>
      <HangDuoi qt={qt} modKey={mod.key} goi={s.goi} cheDo={s.cheDo} session={s} />
    </div>
  )
}

function moNut(n: NutQT, goi: Goi) {
  if (!n.di) return { path: '', sc: undefined, ok: true, ma: undefined }   // ô chỉ để xem, vd nguồn FABi (T100)
  const d = dich(n.di)
  const ok = !d.sc || moDuoc(d.sc, goi)
  return { ...d, ok, ma: d.sc ? maKhoa(d.sc) : undefined }
}

/** Vẽ sơ đồ: mỗi bước là một cột, ô chính nằm trên trục ngang, ô phụ treo trên hoặc dưới ô chính */
function SoDo({ qt, goi }: { qt: QuyTrinhDef; goi: Goi }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(900)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const cot = qt.buoc.length
  const tren = Math.max(0, ...qt.buoc.map(b => b.tren?.length ?? 0))
  const duoi = Math.max(0, ...qt.buoc.map(b => b.duoi?.length ?? 0))
  const cap = qt.buoc.some(b => b.ten) ? 26 : 0
  const CW = Math.max(108, Math.min(190, Math.floor(w / cot)))
  const W = CW * cot
  const H = cap + (tren + 1 + duoi) * RH
  const cx = (c: number) => c * CW + CW / 2
  const ty = (r: number) => cap + r * RH + TOP + TILE / 2          // tâm ô biểu tượng hàng r
  const nhanDuoi = (r: number) => cap + r * RH + RH - 12            // dưới nhãn hàng r

  const o: { n: NutQT; c: number; r: number; so?: number }[] = []
  const duong: string[] = []
  qt.buoc.forEach((b, c) => {
    o.push({ n: b.chinh, c, r: tren, so: qt.danhSo ? c + 1 : undefined })
    ;(b.tren ?? []).forEach((n, i) => o.push({ n, c, r: tren - 1 - i }))
    ;(b.duoi ?? []).forEach((n, i) => o.push({ n, c, r: tren + 1 + i }))
    // nối dọc trong cột: từ dưới nhãn ô trên tới đỉnh ô dưới
    const hang = [...(b.tren ?? []).map((_, i) => tren - 1 - i), tren, ...(b.duoi ?? []).map((_, i) => tren + 1 + i)].sort((a, z) => a - z)
    for (let i = 0; i + 1 < hang.length; i++) duong.push(`M${cx(c)} ${nhanDuoi(hang[i])}V${ty(hang[i + 1]) - TILE / 2 - 2}`)
  })
  const truc: string[] = []
  for (let c = 0; c + 1 < cot; c++) truc.push(`M${cx(c) + TILE / 2 + 8} ${ty(tren)}H${cx(c + 1) - TILE / 2 - 12}`)

  return (
    <div className="qt-so" ref={ref}>
      <div className="qt-canvas" style={{ width: W, height: H }}>
        <svg className="qt-lines" width={W} height={H} aria-hidden>
          <defs>
            <marker id="qt-mui" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5L1 9z" /></marker>
          </defs>
          {truc.map(d => <path key={d} d={d} className="truc" markerEnd="url(#qt-mui)" />)}
          {duong.map(d => <path key={d} d={d} className="nhanh" />)}
        </svg>
        {qt.buoc.map((b, c) => b.ten && <div key={c} className="qt-cap" style={{ left: c * CW, width: CW }}>{b.ten}</div>)}
        {o.map(({ n, c, r, so }) => (
          <ONut key={`${c}-${r}`} n={n} goi={goi} chinh={r === tren} so={so}
            style={{ left: c * CW, top: cap + r * RH, width: CW, height: RH }} />
        ))}
      </div>
    </div>
  )
}

/** Một ô trên sơ đồ: biểu tượng, nhãn; ngoài gói thì mờ, có khoá và nhãn gói thấp nhất */
function ONut({ n, goi, chinh, so, style }: { n: NutQT; goi: Goi; chinh?: boolean; so?: number; style?: React.CSSProperties }) {
  const x = moNut(n, goi)
  if (!n.di) return (
    <span className={`qt-n tinh ${n.tone ?? ''} ${chinh ? 'chinh' : ''}`} style={style}>
      <span className="qt-tile"><Icon n={n.icon} className="ic lg" />{so && <i className="qt-so-buoc">{so}</i>}</span>
      <span className="qt-l">{n.ten}</span>
    </span>
  )
  return (
    <Link to={x.path} className={`qt-n ${n.tone ?? ''} ${x.ok ? '' : 'lock'} ${chinh ? 'chinh' : ''}`} style={style}
      title={x.ok ? `Mở ${n.ten.toLowerCase()}` : `${n.ten}: có ở gói ${GOI[minGoi(x.ma!)].ten}`}>
      <span className="qt-tile">
        <Icon n={n.icon} className="ic lg" />
        {so && <i className="qt-so-buoc">{so}</i>}
        {!x.ok && <i className="qt-khoa"><Icon n="lock" className="ic sm" /></i>}
      </span>
      <span className="qt-l">{n.ten}</span>
      {!x.ok && x.ma && <Pk g={minGoi(x.ma)} o />}
    </Link>
  )
}

const BO = 10         // bán kính góc bo ở hai đầu trục gom
const MUI = 8         // chiều dài mũi tên vào khối Sổ sách, cao 10

/** Sơ đồ luồng chạy từ trên xuống (T123): mỗi tầng (CotQT) một hàng ô; ô tầng trên nối tới mọi ô tầng dưới qua một trục ngang,
 *  nên gộp (mua hàng, bán hàng thành tồn hệ thống) và tách nhánh (kiểm kê ra thiếu, thừa) đều vẽ được. Tầng cuối gộp lại, rẽ phải vào khối kết quả */
function SoDoLuong({ cot, ra, goi, modKey }: { cot: CotQT[]; ra: LanQT | null; goi: Goi; modKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [ve, setVe] = useState<{ w: number; h: number; d: string; mui: string[]; chu: { x: number; y: number; t: string }[] } | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const doLai = () => {
      const zoom = heSoZoom()
      const g = el.getBoundingClientRect()
      const hop = (n: Element) => {
        const r = n.getBoundingClientRect()
        return { l: (r.left - g.left) / zoom, r: (r.right - g.left) / zoom, t: (r.top - g.top) / zoom, b: (r.bottom - g.top) / zoom, x: Math.round((r.left + r.width / 2 - g.left) / zoom), y: Math.round((r.top + r.height / 2 - g.top) / zoom) }
      }
      const tang = [...el.querySelectorAll(':scope > .qt-lg-than > .qt-lg-hang')].map(h => [...h.querySelectorAll(':scope > .qt-n')].map(hop))
      const p: string[] = [], mui: string[] = [], chu: { x: number; y: number; t: string }[] = []
      for (let i = 1; i < tang.length; i++) {
        const tren = tang[i - 1], duoi = tang[i]
        if (!tren.length || !duoi.length) continue
        const ay = Math.round(Math.max(...tren.map(o => o.b)) + 16)            // trục ngang gần tầng trên, để đoạn vào ô dưới đủ chỗ ghi chữ
        const xs = [...tren, ...duoi].map(o => o.x)
        tren.forEach(o => p.push(`M${o.x} ${Math.round(o.b)}V${ay}`))
        if (Math.min(...xs) !== Math.max(...xs)) p.push(`M${Math.min(...xs)} ${ay}H${Math.max(...xs)}`)
        duoi.forEach((o, j) => {
          const y = Math.round(o.t) - 2
          p.push(`M${o.x} ${ay}V${y - MUI + 2}`)
          mui.push(`M${o.x - 5} ${y - MUI}L${o.x} ${y}L${o.x + 5} ${y - MUI}Z`)
          const t = cot[i].nut[j]?.noi ?? cot[i].noi
          if (t) chu.push({ x: o.x + 8, y: Math.round((ay + y - MUI) / 2) + 4, t })
        })
      }
      // Tầng cuối gộp xuống trục, chạy sang phải rồi lên ngang tâm khối kết quả, rẽ vào
      const raEl = el.querySelector(':scope > .qt-ht-ra')
      const cuoi = tang[tang.length - 1]
      if (raEl && cuoi?.length) {
        const rr = hop(raEl)
        const ay = Math.round(Math.max(...cuoi.map(o => o.b)) + 16)
        const dinh = Math.round(rr.l) - 2
        const ax = Math.round((Math.max(...cuoi.map(o => o.r)) + dinh) / 2)
        cuoi.forEach(o => p.push(`M${o.x} ${Math.round(o.b)}V${ay}`))
        p.push(`M${Math.min(...cuoi.map(o => o.x))} ${ay}H${ax}V${rr.y}H${dinh - MUI + 2}`)
        mui.push(`M${dinh - MUI} ${rr.y - 5}L${dinh} ${rr.y}L${dinh - MUI} ${rr.y + 5}Z`)
      }
      setVe({ w: Math.round(g.width / zoom), h: Math.round(g.height / zoom), d: p.join(''), mui, chu })
    }
    const ro = new ResizeObserver(doLai)
    ro.observe(el)
    doLai()
    window.addEventListener('resize', doLai)
    return () => { ro.disconnect(); window.removeEventListener('resize', doLai) }
  }, [cot, ra, goi])

  return (
    <div className="qt-so">
      <div className="qt-ht qt-lg" ref={ref}>
        {ve && (
          <svg className="qt-ht-svg" width={ve.w} height={ve.h} aria-hidden>
            <path d={ve.d} />
            {ve.mui.map((m, i) => <path key={i} d={m} className="mui" />)}
            {ve.chu.map((c, i) => <text key={i} x={c.x} y={c.y} className="qt-lg-chu">{c.t}</text>)}
          </svg>
        )}
        <div className="qt-lg-than">
          {cot.map((c, i) => (
            <div key={i} className="qt-lg-hang">
              {c.nut.map(n => <NutNgang key={n.di || n.ten} n={n} goi={goi} />)}
            </div>
          ))}
        </div>
        {/* Khối kết quả bên phải sơ đồ, cùng kiểu khối Sổ sách của sơ đồ hội tụ */}
        {ra && (
          <div className="qt-ht-ra">
            <div className="qt-ht-dau"><span className="qt-ht-ic"><Icon n="book" className="ic" /></span>{ra.ten}</div>
            {ra.nut.map(n => <NutNgang key={n.di} n={n} goi={goi} dong />)}
            <Link to={`/app/${modKey}/bao-cao`} className="qt-ht-all">Tất cả báo cáo<Icon n="arrow" className="ic sm" /></Link>
          </div>
        )}
      </div>
    </div>
  )
}

/** Sơ đồ hội tụ: mỗi làn một hàng thấp xếp dọc bên trái, đường nối từ từng làn gom về khối kết quả bên phải */
function SoDoHoiTu({ lan, ra, goi, modKey }: { lan: LanQT[]; ra: LanQT; goi: Goi; modKey: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [ve, setVe] = useState<{ w: number; h: number; d: string; mui: string } | null>(null)
  // Đo vị trí thật của làn, nút cuối mỗi làn, cột gom, khối Sổ sách rồi vẽ toàn bộ đường nối bằng một SVG.
  // Đo lại khi lưới đổi cỡ, khi dãy nút đổi bề rộng (đổi gói, phông tải xong).
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const doLai = () => {
      const zoom = heSoZoom()
      const g = el.getBoundingClientRect()
      const lanEl = [...el.querySelectorAll<HTMLElement>(':scope > .qt-ht-lan > .qt-lan')]
      const gom = el.querySelector<HTMLElement>(':scope > .qt-ht-gom')
      const raEl = el.querySelector<HTMLElement>(':scope > .qt-ht-ra')
      if (!lanEl.length || !gom || !raEl) { setVe(null); return }
      const dau = lanEl.map(l => {
        const r = l.getBoundingClientRect()
        const cuoi = l.querySelector('.qt-lan-nut')?.lastElementChild?.getBoundingClientRect()
        return { x: Math.round(((cuoi ? cuoi.right : r.left) - g.left) / zoom + 12), y: Math.round((r.top + r.height / 2 - g.top) / zoom) }
      })
      const gr = gom.getBoundingClientRect(), rr = raEl.getBoundingClientRect()
      const ax = Math.round((gr.left + gr.width / 2 - g.left) / zoom)
      const dinh = Math.round((rr.left - g.left) / zoom - 2)        // mũi tên dừng cách mép trái khối Sổ sách 2px
      const p: string[] = []
      let y: number
      if (dau.length === 1) {
        y = dau[0].y
        p.push(`M${dau[0].x} ${y}`)
      } else {
        const a = dau[0], z = dau[dau.length - 1]
        // làn đầu rẽ xuống trục, trục chạy xuống, rẽ ra làn cuối: một nét liền, bo hai góc
        p.push(`M${a.x} ${a.y}H${ax - BO}A${BO} ${BO} 0 0 1 ${ax} ${a.y + BO}V${z.y - BO}A${BO} ${BO} 0 0 1 ${ax - BO} ${z.y}H${z.x}`)
        // làn giữa nhập thẳng vào trục
        dau.slice(1, -1).forEach(l => p.push(`M${l.x} ${l.y}H${ax}`))
        const tam = Math.round((rr.top + rr.height / 2 - g.top) / zoom)
        y = tam >= a.y + BO && tam <= z.y - BO ? tam : Math.round((a.y + z.y) / 2)
        p.push(`M${ax} ${y}`)
      }
      // đoạn vào khối Sổ sách chui vào trong mũi tên 2px để không hở khe
      p.push(`H${dinh - MUI + 2}`)
      setVe({ w: Math.round(g.width / zoom), h: Math.round(g.height / zoom), d: p.join(''), mui: `M${dinh - MUI} ${y - 5}L${dinh} ${y}L${dinh - MUI} ${y + 5}Z` })
    }
    const ro = new ResizeObserver(doLai)
    ro.observe(el)
    el.querySelectorAll('.qt-lan-nut, .qt-ht-ra').forEach(x => ro.observe(x))
    doLai()
    window.addEventListener('resize', doLai)
    return () => { ro.disconnect(); window.removeEventListener('resize', doLai) }
  }, [lan, ra, goi])

  return (
    <div className="qt-so">
      <div className="qt-ht" ref={ref}>
        {ve && (
          <svg className="qt-ht-svg" width={ve.w} height={ve.h} aria-hidden>
            <path d={ve.d} />
            <path d={ve.mui} className="mui" />
          </svg>
        )}
        <div className="qt-ht-lan">
          {lan.map(l => (
            <div key={l.ten} className={`qt-lan qt-ht-${l.tone ?? 'info'}`}>
              <div className="qt-lan-ten" title={l.ten}>
                <span className="qt-ht-ic"><Icon n={l.icon ?? l.nut[0].icon} className="ic" /></span>
                <span className="qt-ht-t">{l.ten}</span>
              </div>
              <div className="qt-lan-nut">{l.nut.map(n => (
                <Fragment key={n.di || n.ten}>
                  {/* Ô nối tiếp ô trước trong làn: mũi tên có chữ nhỏ, mờ (T98) */}
                  {n.noi && <span className="qt-ht-noi" aria-hidden><small>{n.noi}</small><i /></span>}
                  <NutNgang n={n} goi={goi} />
                </Fragment>
              ))}</div>
            </div>
          ))}
        </div>
        <div className="qt-ht-gom" />
        <div className="qt-ht-ra">
          <div className="qt-ht-dau"><span className="qt-ht-ic"><Icon n="book" className="ic" /></span>{ra.ten}</div>
          {ra.nut.map(n => <NutNgang key={n.di} n={n} goi={goi} dong />)}
          <Link to={`/app/${modKey}/bao-cao`} className="qt-ht-all">Tất cả báo cáo<Icon n="arrow" className="ic sm" /></Link>
        </div>
      </div>
    </div>
  )
}

/** Nút nằm ngang của sơ đồ hội tụ: ô biểu tượng bên trái, tên bên phải; `dong` là hàng sổ trong khối Sổ sách.
 *  Khoá theo gói giống hệt ONut, chỉ khác cách hiện. Giữ lớp qt-n để bộ kiểm tìm được ô trên sơ đồ. */
function NutNgang({ n, goi, dong }: { n: NutQT; goi: Goi; dong?: boolean }) {
  const x = moNut(n, goi)
  if (!n.di) return (
    <span className={`qt-n tinh ${dong ? 'qt-ht-dong' : 'qt-ht-nut'} ${n.tone ?? ''}`}>
      <span className="qt-ht-ic"><Icon n={n.icon} className="ic" /></span>
      <span className="qt-ht-t">{n.ten}</span>
    </span>
  )
  return (
    <Link to={x.path} className={`qt-n ${dong ? 'qt-ht-dong' : 'qt-ht-nut'} ${n.tone ?? ''} ${x.ok ? '' : 'lock'}`}
      title={x.ok ? `Mở ${n.ten.toLowerCase()}` : `${n.ten}: có ở gói ${GOI[minGoi(x.ma!)].ten}`}>
      <span className="qt-ht-ic"><Icon n={n.icon} className="ic" /></span>
      <span className="qt-ht-t">{n.ten}</span>
      {!x.ok && <Icon n="lock" className="ic sm qt-ht-khoa" />}
      {!x.ok && x.ma && <Pk g={minGoi(x.ma)} o />}
    </Link>
  )
}

/** Khung bên phải: 5 báo cáo hay dùng và "Tất cả báo cáo"; phân hệ không có báo cáo thì hiện ghi chú */
function BenPhai({ qt, modKey, goi, cheDo, session }: { qt: QuyTrinhDef; modKey: string; goi: Goi; cheDo?: CheDo; session?: Pick<Session, 'ppGtgt' | 'ppTndn'> }) {
  if (!qt.baoCao?.length) {
    if (!qt.ghiChu) return null
    return (
      <aside className="card qt-bc">
        <h2>{qt.ghiChu.tieuDe}</h2>
        {qt.ghiChu.dong.map(([a, b, k]) => (
          <div key={a} className="qt-gc"><span className="grow">{a}</span>{k ? <span className={`stt ${k}`}>{b}</span> : <small>{b}</small>}</div>
        ))}
      </aside>
    )
  }
  return (
    <aside className="card qt-bc">
      <h2>Báo cáo</h2>
      {qt.baoCao.map(di => {
        const d = dich(di, modKey)
        if (!d.sc || !hienMan(d.sc, goi, cheDo, session)) return null
        const ok = moDuoc(d.sc, goi)
        const ma = maKhoa(d.sc)
        return (
          <Link key={di} to={d.path} className={ok ? '' : 'lock'}>
            <Icon n={d.sc.report?.kieu === 'so' ? 'book' : 'chart'} className="ic sm" />
            <span className="grow">{tenMan(d.sc)}</span>
            {!ok && ma && <Pk g={minGoi(ma)} o />}
          </Link>
        )
      })}
      <Link to={`/app/${modKey}/bao-cao`} className="all">Tất cả báo cáo<Icon n="arrow" className="ic sm" /></Link>
    </aside>
  )
}

/** Khu vực bổ trợ dưới sơ đồ: Danh mục liên quan, Tiện ích phân hệ, Thiết lập & Hướng dẫn (T45) */
function HangDuoi({ qt, modKey, goi, cheDo, session }: { qt: QuyTrinhDef; modKey: string; goi: Goi; cheDo?: CheDo; session?: Pick<Session, 'ppGtgt' | 'ppTndn'> }) {
  const muc = (di: string) => {
    const d = dich(di, modKey)
    if (!d.sc || !hienMan(d.sc, goi, cheDo, session)) return null
    const ok = moDuoc(d.sc, goi)
    const ma = maKhoa(d.sc)
    return {
      d,
      ok,
      ma,
      ten: nhanTab(d.sc) || tenMan(d.sc),
      tenDayDu: tenMan(d.sc),
      code: d.sc.code,
      icon: d.sc?.icon ?? d.mod?.icon ?? 'doc',
    }
  }

  const dsDanhMuc = (qt.danhMuc ?? []).map(muc).filter(Boolean)
  const tienIchNguon = (qt.tienIch && qt.tienIch.length > 0) ? qt.tienIch : ['tien-ich/11-7', 'tien-ich/X2', 'tien-ich/11-6']
  const dsTienIch = tienIchNguon.map(muc).filter(Boolean)
  // Gói ẩn phân hệ Tiện ích (gói Free, T100) thì bỏ cột Tiện ích liên quan
  const modTi = MODULES.find(m => m.key === 'tien-ich')
  const coTienIch = !modTi || !anPhanHeGoi(modTi, goi)
  // Gói Free bỏ cột Thiết lập & Thao tác, chỉ còn Danh mục liên quan (T121)
  const coThietLap = goi !== 'F'
  const soCot = 1 + Number(coTienIch) + Number(coThietLap)

  return (
    <section className={`qt-hub-grid${soCot === 2 ? ' hai-cot' : soCot === 1 ? ' mot-cot' : ''}`} aria-label="Tiện ích và danh mục liên quan">
      {/* Cột 1: Danh mục liên quan */}
      <div className="card qt-hub-col">
        <div className="qt-hub-h">
          <span className="qt-hub-ic blue"><Icon n="folder" className="ic sm" /></span>
          <div className="qt-hub-t-wrap">
            <h2 className="qt-hub-title">Danh mục liên quan</h2>
            <span className="qt-hub-sub">Khai báo dữ liệu ban đầu</span>
          </div>
        </div>
        <div className="qt-hub-items">
          {dsDanhMuc.length ? (
            dsDanhMuc.map((m, idx) => m && (
              <Link key={m.d.path || idx} to={m.d.path} className={`qt-hub-link${m.ok ? '' : ' lock'}`}>
                <span className="qt-hub-item-ic blue"><Icon n={m.icon} className="ic sm" /></span>
                <span className="qt-hub-item-name">{m.ten}</span>
                {!m.ok && m.ma && <Pk g={minGoi(m.ma)} o />}
                <Icon n="chevr" className="ic sm qt-hub-arr" />
              </Link>
            ))
          ) : (
            <div className="qt-hub-empty">Không có danh mục riêng</div>
          )}
        </div>
        <Link to="/app/danh-muc" className="qt-hub-more">
          <span>Xem tất cả danh mục</span>
          <Icon n="arrow" className="ic sm" />
        </Link>
      </div>

      {/* Cột 2: Tiện ích & Tự động hoá */}
      {coTienIch && <div className="card qt-hub-col">
        <div className="qt-hub-h">
          <span className="qt-hub-ic orange"><Icon n="grid" className="ic sm" /></span>
          <div className="qt-hub-t-wrap">
            <h2 className="qt-hub-title">Tiện ích liên quan</h2>
            <span className="qt-hub-sub">Đồng bộ, đối soát & công cụ</span>
          </div>
        </div>
        <div className="qt-hub-items">
          {dsTienIch.map((m, idx) => m && (
            <Link key={m.d.path || idx} to={m.d.path} className={`qt-hub-link${m.ok ? '' : ' lock'}`}>
              <span className="qt-hub-item-ic orange"><Icon n={m.icon} className="ic sm" /></span>
              <div className="qt-hub-item-info">
                <span className="qt-hub-item-name">{m.tenDayDu}</span>
                {m.code && <span className="qt-hub-item-code">Mã {m.code}</span>}
              </div>
              {!m.ok && m.ma && <Pk g={minGoi(m.ma)} o />}
              <Icon n="chevr" className="ic sm qt-hub-arr" />
            </Link>
          ))}
        </div>
        <Link to="/app/tien-ich" className="qt-hub-more">
          <span>Trung tâm tiện ích</span>
          <Icon n="arrow" className="ic sm" />
        </Link>
      </div>}

      {/* Cột 3: Thiết lập & Thao tác nhanh */}
      {coThietLap && <div className="card qt-hub-col">
        <div className="qt-hub-h">
          <span className="qt-hub-ic purple"><Icon n="cog" className="ic sm" /></span>
          <div className="qt-hub-t-wrap">
            <h2 className="qt-hub-title">Thiết lập & Thao tác</h2>
            <span className="qt-hub-sub">Cấu hình tham số & phím tắt</span>
          </div>
        </div>
        <div className="qt-hub-setting-card">
          <Link to="/app/he-thong/cau-hinh" className="qt-hub-setting-link">
            <span className="qt-hub-item-ic purple"><Icon n="chinh" className="ic sm" /></span>
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <b className="qt-hub-setting-title">Tuỳ chọn hệ thống</b>
              <p className="qt-hub-setting-desc">Thiết lập tài khoản ngầm định, phương pháp ghi sổ, ngày khoá số liệu</p>
            </div>
            <Icon n="chevr" className="ic sm qt-hub-arr" />
          </Link>
        </div>
        <div className="qt-hub-tips">
          <div className="qt-tip-row">
            <kbd className="qt-kbd">Ctrl+K</kbd>
            <span>Tìm kiếm nhanh chứng từ & báo cáo</span>
          </div>
          <div className="qt-tip-row">
            <span className="qt-tip-badge">Sơ đồ</span>
            <span>Bấm vào ô để mở form lập chứng từ mới</span>
          </div>
        </div>
      </div>}
    </section>
  )
}
