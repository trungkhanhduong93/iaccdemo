// Mở màn theo đường dẫn /app/:mod/:slug. Màn ngoài gói ra trang Nâng cấp.
import type { ComponentType } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useSession, cheDoHienTai } from './session'
import { cheDoCuaGoi } from './che-do'
import { MODULES, duongDan, hienMan, laBaoCao, maKhoa, manDau, moDuoc, tenMan, timMan, vaoBaoCao } from './registry'
import { FEATURE, FEATURES, GOI, GOIS, minGoi, type Goi } from './plan'
import type { ScreenProps } from '../modules/types'
import { Icon } from '../ui/Icon'
import { Empty, PageHead, Pk } from '../ui/Page'
import { TrungTamBaoCao } from '../modules/bao-cao/TrungTam'
import { CatalogScreen } from '../ui/generic/CatalogScreen'
import { VoucherScreen } from '../ui/generic/VoucherScreen'
import { ReportScreen } from '../ui/generic/ReportScreen'
import { ToolScreen } from '../ui/generic/ToolScreen'
import { QuyTrinhScreen } from '../ui/generic/QuyTrinhScreen'
import { BaoCaoScreen } from '../ui/generic/BaoCaoScreen'
import { ThanhChonBaoCao } from '../modules/bao-cao/ThanhChon'
import { baoCaoCuaPhanHe } from '../modules/bao-cao/cuaPhanHe'
import { CAU_HINH_BC } from '../modules/bao-cao/danh-sach'
import { useLaMobile } from '../ui/mobile/useLaMobile'
import { manMobile } from '../ui/mobile/manMobile'

const GENERIC: Record<string, ComponentType<ScreenProps>> = {
  catalog: CatalogScreen, voucher: VoucherScreen, report: ReportScreen, tool: ToolScreen, quytrinh: QuyTrinhScreen, baocao: BaoCaoScreen,
}

export function ScreenRoute() {
  const laMobile = useLaMobile()
  const { s } = useSession()
  const { mod: mk, slug } = useParams()
  const { mod, sc } = timMan(mk, slug)
  if (!mod) return <Navigate to="/app" replace />
  if (!sc) {
    // Báo cáo của phân hệ khác mà sơ đồ Quy trình nhắc tới, mở ngay trong phân hệ đang đứng (T385), vd mua-hang/5-2-3
    const ngoai = !laMobile && mod.key !== 'bao-cao' ? baoCaoCuaPhanHe(mod, s).find(x => x.slug === slug && x.goc !== mod.key) : undefined
    const modGoc = ngoai && MODULES.find(m => m.key === ngoai.goc)
    const scGoc = modGoc && modGoc.screens.find(x => x.slug === ngoai.slug)
    if (modGoc && scGoc && hienMan(scGoc, s.goi, s.cheDo, s, true) && moDuoc(scGoc, s.goi)) {
      const CN = scGoc.comp ?? GENERIC[scGoc.kind]
      return (
        <>
          <ThanhChonBaoCao sc={{ ...scGoc, goc: mod.key }} trongPhanHe={mod} />
          <CN key={mk + '/' + slug} sc={scGoc} mod={modGoc} />
        </>
      )
    }
    return <Navigate to={duongDan(mod, manDau(mod, s.goi))} replace />
  }
  // Màn chỉ có ở một số gói (sc.goi) thì gói khác ẩn hẳn: về màn đầu phân hệ, không hiện màn khoá (vd Bàn làm việc gói Free, T230)
  if (sc.goi && !sc.goi.includes(s.goi)) return <Navigate to={duongDan(mod, manDau(mod, s.goi))} replace />
  // Máy tính: tab Báo cáo của phân hệ và báo cáo mở ngay trong phân hệ, đóng báo cáo về tab Báo cáo của phân hệ đó (T384).
  // Điện thoại giữ như cũ: chuyển sang phân hệ Báo cáo
  if (mod.key !== 'bao-cao') {
    if (sc.kind === 'baocao') {
      if (laMobile) return <Navigate to={`/app/bao-cao/nhom-${mod.key}`} replace />
      return <TrungTamBaoCao key={mk + '/' + slug} sc={{ ...sc, slug: `nhom-${mod.key}` }} mod={mod} />
    }
    if (laBaoCao(sc) && laMobile) return <Navigate to={`/app/bao-cao/${sc.slug}`} replace />
  }
  const code = sc.code ?? (sc.slug.includes('-') ? sc.slug.replace(/-/g, '.') : undefined)
  const cfg = code ? CAU_HINH_BC[code] : undefined
  // Báo cáo không hiện ở gói, chế độ, cách tính thuế đang chọn (vd đang xem S2b-HKD rồi đổi sang gói Free): chặn theo đúng điều kiện ẩn hiện của danh sách (T179)
  if ((sc.goc || vaoBaoCao(sc)) && sc.comp !== TrungTamBaoCao && !hienMan(sc, s.goi, s.cheDo, s, true) && !cfg?.anTam?.includes(s.cheDo)) {
    return (
      <div className="page">
        <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} />
        <div className="card lockpage">
          <Empty title="Báo cáo không dùng với thiết lập hiện tại" sub={`Gói ${GOI[s.goi].ten}, chế độ ${cheDoHienTai(s).ngan} không có báo cáo này. Xem các báo cáo đang dùng ở Tất cả báo cáo.`}>
            <Link className="btn" to="/app/bao-cao/tat-ca">Về Tất cả báo cáo</Link>
          </Empty>
        </div>
      </div>
    )
  }
  if (cfg?.anTam?.includes(s.cheDo)) {
    return (
      <div className="page">
        <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} />
        <div className="card lockpage">
          <Empty title="Báo cáo chưa có mẫu" sub="Mẫu theo thông tư đang chờ cập nhật.">
            <Link className="btn" to="/app/bao-cao/tat-ca">Về Tất cả báo cáo</Link>
          </Empty>
        </div>
      </div>
    )
  }
  if (!moDuoc(sc, s.goi)) return <Locked code={maKhoa(sc)!} ten={tenMan(sc)} crumb={[mod.ten, sc.nhom ?? '']} quayLai={mod.key === 'bao-cao' ? '/app/bao-cao/tat-ca' : undefined} />
  const C = laMobile ? manMobile(sc, mod) : (sc.comp ?? GENERIC[sc.kind])
  if (sc.goc) {
    const modGoc = MODULES.find(m => m.key === sc.goc) ?? mod
    return (
      <>
        {!laMobile && <ThanhChonBaoCao sc={sc} />}
        <C key={mk + '/' + slug} sc={sc} mod={modGoc} />
      </>
    )
  }
  if (mod.key !== 'bao-cao' && laBaoCao(sc)) {
    return (
      <>
        <ThanhChonBaoCao sc={{ ...sc, goc: mod.key }} trongPhanHe={mod} />
        <C key={mk + '/' + slug} sc={sc} mod={mod} />
      </>
    )
  }
  return <C key={mk + '/' + slug} sc={sc} mod={mod} />
}

export function HomeRedirect() {
  const { s } = useSession()
  // Gói Free không có Bàn làm việc nên mọi vai trò vào Tổng quan (T230)
  return <Navigate to={s.role === 'owner' || s.goi === 'S' ? '/app/trang-chu/tong-quan' : '/app/trang-chu/ban-lam-viec'} replace />
}

/** Trang nâng cấp khi bấm vào tính năng ngoài gói */
/** quayLai: đường dẫn nút quay lại cạnh tiêu đề, vd báo cáo, nhóm báo cáo chưa có ở gói quay về Tất cả báo cáo (T185) */
export function Locked({ code, ten, crumb, quayLai }: { code: string; ten: string; crumb: string[]; quayLai?: string }) {
  const { s, set } = useSession()
  const can = minGoi(code)
  const f = FEATURE[code]
  const goiCo = GOIS.filter(g => f?.g.includes(g))
  const them = (g: Goi) => FEATURES.filter(x => x.g.includes(g) && !x.g.includes(s.goi))
  const moi = them(can).sort((a, b) => Number(b.m === f?.m) - Number(a.m === f?.m))
  return (
    <div className="page">
      <PageHead crumb={crumb.filter(Boolean)} code={code}
        title={quayLai ? <span className="ph-quay-lai"><Link className="btn sm ghost" to={quayLai}><Icon n="chevl" className="ic sm" />Tất cả báo cáo</Link>{ten}</span> : ten} />
      <div className="card lockpage" style={{ padding: '34px 40px' }}>
        <div className="lock-ic"><Pk g={can} o /></div>
        <h1>{ten} có ở gói {goiCo.map(g => GOI[g].ten).join(', ')}</h1>
        <p>Đơn vị đang dùng gói {GOI[s.goi].ten} ({cheDoHienTai(s).soHieu}). Lên gói {GOI[can].ten} mở thêm {moi.length} tính năng, dùng {cheDoCuaGoi(can).soHieu}.</p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 20, gap: 10 }}>
          <Link className="btn acc lg" to="/app/he-thong/goi-thue-bao"><Icon n="layers" /> Nâng cấp lên {GOI[can].ten}</Link>
          <button className="btn lg" onClick={() => set({ goi: can })}>Xem thử gói {GOI[can].ten}</button>
        </div>
        <div style={{ textAlign: 'left', marginTop: 26 }}>
          <div className="panel-g" style={{ padding: '0 0 8px' }}>Gói {GOI[can].ten} mở thêm, ví dụ</div>
          <div className="grid g2" style={{ gap: 6 }}>
            {moi.slice(0, 10).map(x => {
              const m = MODULES.find(mm => mm.mod === x.m)
              const scx = m?.screens.find(z => z.code === x.c)
              return (
                <Link key={x.c} to={m && scx ? duongDan(m, scx) : '#'} className="row" style={{ color: 'var(--body)', fontSize: 13, padding: '4px 0' }}>
                  <Icon n="check" className="ic sm" /><span className="grow">{x.n}</span><small className="muted">{m?.ngan}</small>
                </Link>
              )
            })}
          </div>
        </div>
        <p style={{ fontSize: 12, marginTop: 18 }}>Bảng so sánh đủ 3 gói ở <Link to="/app/he-thong/goi-thue-bao">Hệ thống, Gói thuê bao</Link>. <Pk g={s.goi} /></p>
      </div>
    </div>
  )
}

export function NotFound() {
  return <div className="page"><div className="card"><div className="empty"><b>Không có màn này</b><Link to="/app">Về trang chủ</Link></div></div></div>
}
