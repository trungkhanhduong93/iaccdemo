// Màn Quy trình của phân hệ, kiểu AMIS: sơ đồ nghiệp vụ, khung Báo cáo bên phải, hàng dưới gồm danh mục liên quan, Tiện ích, Tuỳ chọn.
// Bấm ô trên sơ đồ mở thẳng form chứng từ mới (đích có /moi) hoặc màn tương ứng. Ô ngoài gói hiện mờ, có khoá và nhãn gói.
import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { NutQT, QuyTrinhDef, ScreenProps } from '../../modules/types'
import { dich, maKhoa, moDuoc, nhanTab, phanHeKhoa, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, minGoi, type Goi } from '../../app/plan'
import { Icon } from '../Icon'
import { Note, Pk } from '../Page'

const RH = 128        // chiều cao một hàng ô
const TILE = 54       // cạnh ô biểu tượng
const TOP = 8         // khoảng từ mép hàng tới ô biểu tượng

export function QuyTrinhScreen({ mod }: ScreenProps) {
  const { s, set } = useSession()
  const qt = mod.quyTrinh!
  const nut = qt.buoc.flatMap(b => [b.chinh, ...(b.tren ?? []), ...(b.duoi ?? [])])
  const mo = nut.filter(n => moNut(n, s.goi).ok).length
  // cả phân hệ ngoài gói thì mời xem thử gói thấp nhất có phân hệ này
  const khoa = phanHeKhoa(mod, s.goi)
  const thapNhat = mod.screens.filter(sc => sc.code || sc.can).map(sc => minGoi(maKhoa(sc)!))
  const can = (['F', 'S', 'M', 'A'] as Goi[]).find(g => thapNhat.includes(g))
  const coForm = nut.some(n => n.di.includes('/moi'))

  return (
    <div className="page wide qt">
      <div className="qt-top">
        <section className="card qt-card">
          <div className="qt-h">
            <h1>{qt.ten}</h1>
            <span className="sub">{coForm ? 'Bấm vào ô để mở chứng từ' : 'Bấm vào ô để mở màn hình'}</span>
            <span className="grow" />
            <span className="qt-dem">Gói {GOI[s.goi].ten} mở {mo}/{nut.length} nghiệp vụ</span>
          </div>
          {khoa && can && (
            <Note kind="warn" icon="lock">
              {mod.ten} có từ gói {GOI[can].ten}. Sơ đồ vẫn hiện để xem trước.{' '}
              <button className="btn sm" onClick={() => set({ goi: can })}>Xem thử gói {GOI[can].ten}</button>
            </Note>
          )}
          <SoDo qt={qt} goi={s.goi} />
        </section>
        <BenPhai qt={qt} modKey={mod.key} goi={s.goi} />
      </div>
      <HangDuoi qt={qt} modKey={mod.key} goi={s.goi} />
    </div>
  )
}

function moNut(n: NutQT, goi: Goi) {
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
        {o.map(({ n, c, r, so }) => {
          const x = moNut(n, goi)
          return (
            <Link key={`${c}-${r}`} to={x.path} className={`qt-n ${n.tone ?? ''} ${x.ok ? '' : 'lock'} ${r === tren ? 'chinh' : ''}`}
              style={{ left: c * CW, top: cap + r * RH, width: CW, height: RH }}
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
        })}
      </div>
    </div>
  )
}

/** Khung bên phải: 5 báo cáo hay dùng và "Tất cả báo cáo"; phân hệ không có báo cáo thì hiện ghi chú */
function BenPhai({ qt, modKey, goi }: { qt: QuyTrinhDef; modKey: string; goi: Goi }) {
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
        if (!d.sc) return null
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

/** Hàng dưới: danh mục liên quan, menu Tiện ích, Tuỳ chọn */
function HangDuoi({ qt, modKey, goi }: { qt: QuyTrinhDef; modKey: string; goi: Goi }) {
  const [mo, setMo] = useState(false)
  const muc = (di: string) => {
    const d = dich(di, modKey)
    if (!d.sc) return null
    const ok = moDuoc(d.sc, goi)
    const ma = maKhoa(d.sc)
    return { d, ok, ma, ten: nhanTab(d.sc), icon: d.mod?.icon ?? 'doc' }
  }
  return (
    <div className="card qt-foot">
      {qt.danhMuc?.length ? <span className="lbl">Danh mục</span> : null}
      {(qt.danhMuc ?? []).map(di => {
        const m = muc(di)
        if (!m) return null
        return (
          <Link key={di} to={m.d.path} className={m.ok ? '' : 'lock'}>
            <Icon n="folder" className="ic sm" />{m.ten}{!m.ok && m.ma && <Pk g={minGoi(m.ma)} o />}
          </Link>
        )
      })}
      <span className="grow" />
      {qt.tienIch?.length ? (
        <div className="dd" onMouseLeave={() => setMo(false)}>
          <button onClick={() => setMo(!mo)} aria-expanded={mo}><Icon n="grid" className="ic sm" />Tiện ích<Icon n="chevd" className="ic sm" /></button>
          <div className="dd-pop" hidden={!mo} style={{ right: 0, bottom: 'calc(100% + 4px)' }}>
            {qt.tienIch.map(di => {
              const m = muc(di)
              if (!m) return null
              return <Link key={di} to={m.d.path} className={m.ok ? '' : 'lock'}><span className="grow">{tenMan(m.d.sc!)}</span>{!m.ok && m.ma && <Pk g={minGoi(m.ma)} o />}</Link>
            })}
          </div>
        </div>
      ) : null}
      <Link to="/app/he-thong/cau-hinh"><Icon n="cog" className="ic sm" />Tuỳ chọn</Link>
    </div>
  )
}
