// Trung tâm báo cáo: gom toàn bộ sổ sách, báo cáo của mọi phân hệ chia theo nhóm
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ModuleDef, ScreenDef, ScreenProps } from '../types'
import { MODULES, apDung, hienMan, hienPhanHe, maKhoa, moDuoc, phanHeKhoa, tenMan } from '../../app/registry'
import { useSession, type Session } from '../../app/session'
import { CHE_DO } from '../../app/che-do'
import { anNgoaiGoi, minGoi } from '../../app/plan'
import { Icon, ONen } from '../../ui/Icon'
import { PageHead, Pk } from '../../ui/Page'
import { fold } from '../../ui/format'
import { ThanhLoc } from '../../ui/ThanhLoc'
import { AN_NHOM_BC, CHI_MO_TU_BC, DAU_NHOM_BC, NHOM_CONG_NO, cauHinhBC, kyHieuBC } from './danh-sach'

export interface NhomBaoCaoItem {
  mod: ModuleDef
  screens: ScreenDef[]
}

/** Tách hàm thuần gom nhóm báo cáo dùng chung cho bản máy tính và điện thoại (T182) */
export function layNhomBaoCao(s: Session): NhomBaoCaoItem[] {
  const phanHeBC = MODULES.find(m => m.key === 'bao-cao')
  const tatCaBC = phanHeBC?.screens.filter(x => x.goc) ?? []

  // Sổ, báo cáo có mẫu của thông tư đang dùng gom vào một nhóm riêng đứng đầu ở Tất cả báo cáo (T171)
  const laSoTT = (x: ScreenDef) => Boolean(kyHieuBC(x.code, s.cheDo, s))
  // Xếp theo ký hiệu mẫu như thứ tự trong thông tư: sổ (S...) trước, báo cáo tài chính (B...) sau
  const thuTuMau = (x: ScreenDef) => { const k = kyHieuBC(x.code, s.cheDo, s) ?? ''; return `${/^S/.test(k) ? 0 : 1}${k}` }
  const soTT = tatCaBC.filter(laSoTT).sort((a, b) => thuTuMau(a).localeCompare(thuTuMau(b), 'vi', { numeric: true }))
  const tenSoTT = `Sổ sách kế toán theo ${CHE_DO[s.cheDo].ngan}`

  // Công nợ nhà cung cấp, khách hàng gom vào nhóm Công nợ riêng, đứng sau nhóm Mua hàng (T217)
  const viTriCongNo = (x: ScreenDef) => NHOM_CONG_NO.ma.indexOf(x.code ?? x.slug.replace(/-/g, '.'))
  const laCongNo = (x: ScreenDef) => viTriCongNo(x) >= 0
  const nhomCongNo: NhomBaoCaoItem = { mod: NHOM_CONG_NO as unknown as ModuleDef, screens: tatCaBC.filter(laCongNo).sort((a, b) => viTriCongNo(a) - viTriCongNo(b)) }

  // Gom theo x.goc theo thứ tự phân hệ trong MODULES
  const nhomGoc: NhomBaoCaoItem[] = []
  for (const m of MODULES) {
    if (m.key === 'bao-cao') continue
    if (AN_NHOM_BC[s.goi]?.includes(m.key)) continue   // nhóm ẩn hẳn ở gói (T218)
    // Nhóm phân hệ vẫn hiện khi chưa có báo cáo (phân hệ mở được ở gói); sổ đã ở nhóm thông tư thì không lặp lại
    if (!tatCaBC.some(x => x.goc === m.key)) continue
    // phân hệ ẩn ở gói mà còn báo cáo mở được (Tổng hợp ở gói Free) thì nhóm vẫn hiện (T185)
    if ((!hienPhanHe(m, s.goi) || phanHeKhoa(m, s.goi)) && !tatCaBC.some(x => x.goc === m.key && hienMan(x, s.goi, s.cheDo, s))) continue
    // Báo cáo khai ở DAU_NHOM_BC lên đầu nhóm, còn lại giữ thứ tự màn (T219)
    const dau = DAU_NHOM_BC[m.key] ?? []
    const viTri = (x: ScreenDef) => { const i = dau.indexOf(x.code ?? x.slug.replace(/-/g, '.')); return i < 0 ? dau.length : i }
    nhomGoc.push({ mod: m, screens: tatCaBC.filter(x => x.goc === m.key && !laSoTT(x) && !laCongNo(x)).sort((a, b) => viTri(a) - viTri(b)) })
  }
  // Nhóm Công nợ chèn ngay sau Mua hàng; gói không có nhóm Mua hàng thì đứng cuối
  const iSau = nhomGoc.findIndex(g => g.mod.key === NHOM_CONG_NO.sau)
  nhomGoc.splice(iSau < 0 ? nhomGoc.length : iSau + 1, 0, nhomCongNo)

  const modSoTT = { key: 'so-sach', ten: tenSoTT, ngan: 'Sổ sách', mota: `Sổ sách và báo cáo theo ${CHE_DO[s.cheDo].ngan}` } as ModuleDef
  return [{ mod: modSoTT, screens: soTT }, ...nhomGoc]
}

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

export function TrungTamBaoCao({ sc, mod }: ScreenProps) {
  // Mở ở tab Báo cáo của một phân hệ (T384): chỉ báo cáo phân hệ đó, bấm báo cáo mở ngay trong phân hệ, không có cột nhóm bên trái
  const trongPhanHe = Boolean(mod && mod.key !== 'bao-cao')
  const duongBC = (slug: string) => `/app/${trongPhanHe ? mod.key : 'bao-cao'}/${slug}`
  const { s } = useSession()
  const [q, setQ] = useState('')
  const [ghim, setGhim] = useState<string[]>(() => docGhim())
  const [tham] = useSearchParams()

  const phanHeBC = MODULES.find(m => m.key === 'bao-cao')
  const tatCaBC = phanHeBC?.screens.filter(x => x.goc) ?? []

  const nhomTatCa = layNhomBaoCao(s)
  const [nhomSoTT, ...nhomGoc] = nhomTatCa
  const soTT = nhomSoTT.screens
  const tenSoTT = nhomSoTT.mod.ten
  const chiSoTT = sc.slug === 'tat-ca' && tham.get('nhom') === 'so-sach'

  // Số báo cáo hiện được ở rail (ẩn màn theo hienMan)
  const nhomRail = nhomGoc
    .map(g => ({
      mod: g.mod,
      hienCount: g.screens.filter(x => hienMan(x, s.goi, s.cheDo, s)).length,
    }))
    .filter(g => g.hienCount > 0)   // nhóm không còn báo cáo hiện được thì ẩn cả nhóm, vd Chi phí phân bổ gói Free (T252)

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

  const manTrongNhom = nhomHienThi.flatMap(g => g.screens).filter(x => apDung(x, s.cheDo, s) && !CHI_MO_TU_BC.includes(x.code ?? ''))   // không đếm báo cáo đã bỏ (T171), báo cáo chỉ mở từ báo cáo khác (T200)
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
    .filter(g => g.screens.length > 0)   // nhóm trống ẩn luôn, trước đây không tìm kiếm thì vẫn hiện "Chưa có báo cáo" (T252)

  // Danh sách ghim và mở gần đây (chỉ hiện khi ở tab Tất cả, không tìm kiếm, có báo cáo mở được)
  const tatCaBCMap = useMemo(() => new Map(tatCaBC.map(x => [x.slug, x])), [tatCaBC])

  const { dsGhim, dsGanDay } = useMemo(() => {
    const pinned: ScreenDef[] = []
    for (const slug of ghim) {
      const item = tatCaBCMap.get(slug)
      if (item && hienMan(item, s.goi, s.cheDo, s) && moDuoc(item, s.goi)) {
        pinned.push(item)
      }
    }

    const recent: ScreenDef[] = []
    const ganDay = docGanDay()
    for (const slug of ganDay) {
      if (ghim.includes(slug)) continue
      const item = tatCaBCMap.get(slug)
      if (item && hienMan(item, s.goi, s.cheDo, s) && moDuoc(item, s.goi)) {
        recent.push(item)
        if (recent.length >= 4) break
      }
    }

    return { dsGhim: pinned, dsGanDay: recent }
  }, [ghim, tatCaBCMap, s.goi, s.cheDo, s.ppGtgt, s.ppTndn])

  const hienGhimGanDay = sc.slug === 'tat-ca' && !chiSoTT && !q.trim()   // luôn hiện, phần trống ghi Chưa có báo cáo (T256)

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
      <div className={`bc-tt${trongPhanHe ? ' bc-tt-phan-he' : ''}`}>
        {!trongPhanHe && <div className="bc-trai">
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
          {hienGhimGanDay && (   // ghim và mở gần đây nằm dưới cột nhóm, chia Đã ghim, Báo cáo gần đây (T185, T253)
            <div className="bc-quick">
              <div className="bc-quick-sec">
                <div className="bc-quick-head">Đã ghim</div>
                {dsGhim.length === 0 && <div className="bc-quick-trong">Chưa có báo cáo</div>}
                {dsGhim.map(x => {
                  const ten = tenMan(x)
                  const { loai, icon } = loaiVaIconBC(x, ten)
                  const metaText = kyHieuBC(x.code, s.cheDo, s)
                  return (
                    <Link
                      key={x.slug}
                      to={duongBC(x.slug)} state={{ hoiLoc: true }}
                      className="bc-quick-item bc-quick-pinned"
                      title={ten}
                    >
                      <ONen n={icon} kieu="nhat" co="sm" />
                      <span className="bc-quick-name">{ten}</span>
                      {metaText && <span className="bc-quick-ma">{metaText}</span>}
                      <button
                        type="button"
                        className="bc-quick-unpin"
                        onClick={e => toggleGhim(x.slug, e)}
                        title="Bỏ ghim"
                        aria-label="Bỏ ghim"
                      >
                        ★
                      </button>
                    </Link>
                  )
                })}
              </div>
              <div className="bc-quick-sec">
                <div className="bc-quick-head">Báo cáo gần đây</div>
                {dsGanDay.length === 0 && <div className="bc-quick-trong">Chưa có báo cáo</div>}
                {dsGanDay.map(x => {
                  const ten = tenMan(x)
                  const { loai, icon } = loaiVaIconBC(x, ten)
                  const metaText = kyHieuBC(x.code, s.cheDo, s)
                  return (
                    <Link
                      key={x.slug}
                      to={duongBC(x.slug)} state={{ hoiLoc: true }}
                      className="bc-quick-item"
                      title={ten}
                    >
                      <ONen n={icon} kieu="nhat" co="sm" />
                      <span className="bc-quick-name">{ten}</span>
                      {metaText && <span className="bc-quick-ma">{metaText}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>}
        <div className="bc-ds">
          {nhomKetQua.length === 0 ? (
            <div className="card">
              <div className="empty"><b>{q ? `Không có báo cáo khớp "${q}"` : 'Chưa có báo cáo'}</b></div>
            </div>
          ) : (
            nhomKetQua.map(g => (
              // Nhóm báo cáo dạng thẻ mẫu A (T271)
              <section key={g.mod.key} className="bc-nhom">
                <div className="bc-nhom-dau">
                  <ONen n={g.mod.icon || 'book'} kieu="dac" co="md" />
                  <h2>{g.mod.ten}</h2>
                  <span className="bc-nhom-dem">{g.screens.length} báo cáo</span>
                </div>
                <div className="bc-nhom-ds">
                  {g.screens.map(x => {
                    const ok = moDuoc(x, s.goi)
                    const ma = maKhoa(x)
                    const ten = tenMan(x)
                    const { loai, icon } = loaiVaIconBC(x, ten)
                    const metaText = kyHieuBC(x.code, s.cheDo, s) ?? ''   // chỉ hiện ký hiệu mẫu theo thông tư, không hiện mã tính năng (T171)
                    const isGhim = ghim.includes(x.slug)
                    return (
                      <Link
                        key={x.slug}
                        to={duongBC(x.slug)} state={{ hoiLoc: true }}
                        className={`rpt-row rpt-card${ok ? '' : ' lock'}`}
                        title={ten}
                      >
                        <ONen n={icon} kieu="nhat" co="sm" />
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
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
