// Trung tâm báo cáo: gom toàn bộ sổ sách, báo cáo của mọi phân hệ chia theo nhóm
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ModuleDef, ScreenDef, ScreenProps } from '../types'
import { MODULES, apDung, hienMan, maKhoa, moDuoc, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CHE_DO } from '../../app/che-do'
import { anNgoaiGoi, minGoi } from '../../app/plan'
import { Icon } from '../../ui/Icon'
import { PageHead, Pk } from '../../ui/Page'
import { fold } from '../../ui/format'
import { ThanhLoc } from '../../ui/ThanhLoc'
import { cauHinhBC, kyHieuBC } from './danh-sach'

function docGhim(): string[] {
  try {
    const raw = localStorage.getItem('bc-ghim')
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function luuGhim(slugs: string[]) {
  try {
    localStorage.setItem('bc-ghim', JSON.stringify(slugs))
  } catch {}
}

function docGanDay(): string[] {
  try {
    const raw = localStorage.getItem('bc-gan-day')
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function loaiVaIconBC(sc: ScreenDef, ten: string): { loai: 'so' | 'bangke' | 'tokhai' | 'chart'; icon: string } {
  const kieu = sc.report?.kieu
  if (kieu === 'so' || /^(Sổ|Thẻ)/i.test(ten)) {
    return { loai: 'so', icon: 'receipt' }
  }
  if (kieu === 'bangke' || /^Bảng kê/i.test(ten)) {
    return { loai: 'bangke', icon: 'doc' }
  }
  if (/^Tờ khai/i.test(ten) || cauHinhBC(sc.code)?.loai === 'tokhai') {
    return { loai: 'tokhai', icon: 'percent' }
  }
  return { loai: 'chart', icon: 'chart' }
}

export function TrungTamBaoCao({ sc }: ScreenProps) {
  const { s } = useSession()
  const [q, setQ] = useState('')
  const [ghim, setGhim] = useState<string[]>(() => docGhim())
  const [tham] = useSearchParams()

  const phanHeBC = MODULES.find(m => m.key === 'bao-cao')
  const tatCaBC = phanHeBC?.screens.filter(x => x.goc) ?? []

  // Sổ, báo cáo có mẫu của thông tư đang dùng gom vào một nhóm riêng đứng đầu ở Tất cả báo cáo (T171)
  const laSoTT = (x: ScreenDef) => Boolean(kyHieuBC(x.code, s.cheDo, s))
  const soTT = tatCaBC.filter(laSoTT)
  const tenSoTT = `Sổ sách kế toán theo ${CHE_DO[s.cheDo].ngan}`
  const chiSoTT = sc.slug === 'tat-ca' && tham.get('nhom') === 'so-sach'

  // Gom theo x.goc theo thứ tự phân hệ trong MODULES
  const nhomGoc: { mod: ModuleDef; screens: ScreenDef[] }[] = []
  for (const m of MODULES) {
    if (m.key === 'bao-cao') continue
    const scs = tatCaBC.filter(x => x.goc === m.key && !laSoTT(x))   // sổ đã ở nhóm thông tư thì không lặp ở nhóm phân hệ
    if (scs.length > 0) {
      nhomGoc.push({ mod: m, screens: scs })
    }
  }

  // Số báo cáo hiện được ở rail (ẩn màn theo hienMan)
  const nhomRail = nhomGoc
    .map(g => ({
      mod: g.mod,
      hienCount: g.screens.filter(x => hienMan(x, s.goi, s.cheDo, s)).length,
    }))
    .filter(g => g.hienCount > 0)

  const tongHienRail = nhomRail.reduce((acc, g) => acc + g.hienCount, 0)
  const demSoTT = soTT.filter(x => hienMan(x, s.goi, s.cheDo, s)).length

  // Lọc theo sc.slug: 'tat-ca' là mọi nhóm; 'nhom-<key>' chỉ nhóm của phân hệ <key>
  const keyHienTai = sc.slug.startsWith('nhom-') ? sc.slug.slice(5) : null
  // Tất cả: nhóm sổ theo thông tư đứng đầu, rồi các nhóm phân hệ (đã bỏ sổ theo thông tư)
  const modSoTT = { key: 'so-sach', ten: tenSoTT } as ModuleDef
  const nhomHienThi = keyHienTai
    ? nhomGoc.filter(g => g.mod.key === keyHienTai)
    : chiSoTT
    ? [{ mod: modSoTT, screens: soTT }]
    : [{ mod: modSoTT, screens: soTT }, ...nhomGoc]

  const modHienTai = keyHienTai ? nhomHienThi[0]?.mod : null
  const title = modHienTai ? `Báo cáo ${modHienTai.ten}` : chiSoTT ? tenSoTT : 'Báo cáo'

  const manTrongNhom = nhomHienThi.flatMap(g => g.screens).filter(x => apDung(x, s.cheDo, s))   // không đếm báo cáo đã bỏ (T171)
  const co = manTrongNhom.filter(x => moDuoc(x, s.goi)).length
  const meta = anNgoaiGoi(s.goi) ? undefined : (
    <span className="chip">Gói đang dùng mở {co}/{manTrongNhom.length} báo cáo</span>
  )

  // Tìm kiếm không dấu theo tên, mã, mẫu
  const match = (x: ScreenDef) =>
    !q || fold(`${tenMan(x)} ${x.code ?? ''} ${kyHieuBC(x.code, s.cheDo, s) ?? ''}`).includes(fold(q))

  const nhomKetQua = nhomHienThi
    .map(g => ({
      mod: g.mod,
      screens: g.screens.filter(x => hienMan(x, s.goi, s.cheDo, s)).filter(match),
    }))
    .filter(g => g.screens.length > 0)

  // Danh sách ghim và mở gần đây (chỉ hiện khi ở tab Tất cả, không tìm kiếm, có báo cáo mở được)
  const tatCaBCMap = useMemo(() => new Map(tatCaBC.map(x => [x.slug, x])), [tatCaBC])

  const topItems = useMemo(() => {
    const pinned: { sc: ScreenDef; isGhim: boolean }[] = []
    for (const slug of ghim) {
      const item = tatCaBCMap.get(slug)
      if (item && hienMan(item, s.goi, s.cheDo, s) && moDuoc(item, s.goi)) {
        pinned.push({ sc: item, isGhim: true })
      }
    }

    const recent: { sc: ScreenDef; isGhim: boolean }[] = []
    const ganDay = docGanDay()
    for (const slug of ganDay) {
      if (ghim.includes(slug)) continue
      const item = tatCaBCMap.get(slug)
      if (item && hienMan(item, s.goi, s.cheDo, s) && moDuoc(item, s.goi)) {
        recent.push({ sc: item, isGhim: false })
        if (recent.length >= 4) break
      }
    }

    return [...pinned, ...recent]
  }, [ghim, tatCaBCMap, s.goi, s.cheDo, s.ppGtgt, s.ppTndn])

  const hienGhimGanDay = sc.slug === 'tat-ca' && !chiSoTT && !q.trim() && topItems.length > 0

  const toggleGhim = (slug: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setGhim(prev => {
      const next = prev.includes(slug) ? prev.filter(x => x !== slug) : [...prev, slug]
      luuGhim(next)
      return next
    })
  }

  return (
    <div className="page">
      <PageHead title={title} meta={meta}>
        <ThanhLoc tim={{ value: q, onChange: setQ, placeholder: 'Tìm báo cáo' }} />
      </PageHead>
      <div className="bc-tt">
        <nav className="bc-rail">
          <Link to="/app/bao-cao/tat-ca" className={sc.slug === 'tat-ca' && !chiSoTT ? 'on' : ''}>
            <Icon n="chart" />
            <span>Tất cả</span>
            <span className="bc-dem">{tongHienRail + demSoTT}</span>
          </Link>
          {demSoTT > 0 && (
            <Link to="/app/bao-cao/tat-ca?nhom=so-sach" className={chiSoTT ? 'on' : ''} title={tenSoTT}>
              <Icon n="book" />
              <span>Sổ sách {CHE_DO[s.cheDo].ngan}</span>
              <span className="bc-dem">{demSoTT}</span>
            </Link>
          )}
          {nhomRail.map(g => (
            <Link
              key={g.mod.key}
              to={`/app/bao-cao/nhom-${g.mod.key}`}
              className={sc.slug === `nhom-${g.mod.key}` ? 'on' : ''}
            >
              <Icon n={g.mod.icon} />
              <span>{g.mod.ngan}</span>
              <span className="bc-dem">{g.hienCount}</span>
            </Link>
          ))}
        </nav>
        <div className="bc-ds">
          {hienGhimGanDay && (
            <div className="bc-quick">
              <div className="bc-quick-head">Ghim và mở gần đây</div>
              <div className="bc-quick-row">
                {topItems.map(item => (
                  <Link
                    key={item.sc.slug}
                    to={`/app/bao-cao/${item.sc.slug}`}
                    className="bc-quick-chip"
                    title={tenMan(item.sc)}
                  >
                    {item.isGhim && <span className="bc-quick-star">★</span>}
                    <span className="bc-quick-text">{tenMan(item.sc)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {nhomKetQua.length === 0 ? (
            <div className="card">
              <div className="empty"><b>{q ? `Không có báo cáo khớp "${q}"` : `Báo cáo của phân hệ này nằm ở nhóm ${tenSoTT}`}</b></div>
            </div>
          ) : (
            nhomKetQua.map(g => (
              <div key={g.mod.key}>
                <div className="rpt-head">
                  <span className="rpt-head-title">{g.mod.ten}</span>
                  <span className="rpt-head-count">{g.screens.length}</span>
                  <span className="rpt-head-line" />
                </div>
                <div className="rpt-list">
                  {g.screens.map(x => {
                    const ok = moDuoc(x, s.goi)
                    const ma = maKhoa(x)
                    const ten = tenMan(x)
                    const { loai, icon } = loaiVaIconBC(x, ten)
                    const kyHieu = kyHieuBC(x.code, s.cheDo, s)
                    const code = x.code ?? ''
                    const metaText = code && kyHieu ? `${code} · ${kyHieu}` : (code || kyHieu || '')
                    const isGhim = ghim.includes(x.slug)
                    return (
                      <Link
                        key={x.slug}
                        to={`/app/bao-cao/${x.slug}`}
                        className={`rpt-row rpt-card${ok ? '' : ' lock'}`}
                        title={ten}
                      >
                        <span className={`rpt-ic rpt-ic-${loai}`}>
                          <Icon n={icon} />
                        </span>
                        <span className="rpt-name">{ten}</span>
                        {metaText && <span className="rpt-meta">{metaText}</span>}
                        {!ok && ma && <Pk g={minGoi(ma)} o />}
                        <button
                          type="button"
                          className={`rpt-ghim${isGhim ? ' on' : ''}`}
                          onClick={e => toggleGhim(x.slug, e)}
                          title={isGhim ? 'Bỏ ghim' : 'Ghim báo cáo'}
                          aria-label={isGhim ? 'Bỏ ghim' : 'Ghim báo cáo'}
                        >
                          {isGhim ? '★' : '☆'}
                        </button>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
