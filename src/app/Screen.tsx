// Mở màn theo đường dẫn /app/:mod/:slug. Màn ngoài gói ra trang Nâng cấp.
import type { ComponentType } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useSession, cheDoHienTai } from './session'
import { cheDoCuaGoi } from './che-do'
import { MODULES, duongDan, maKhoa, manDau, moDuoc, tenMan, timMan } from './registry'
import { FEATURE, FEATURES, GOI, GOIS, minGoi, type Goi } from './plan'
import type { ScreenProps } from '../modules/types'
import { Icon } from '../ui/Icon'
import { PageHead, Pk } from '../ui/Page'
import { CatalogScreen } from '../ui/generic/CatalogScreen'
import { VoucherScreen } from '../ui/generic/VoucherScreen'
import { ReportScreen } from '../ui/generic/ReportScreen'
import { ToolScreen } from '../ui/generic/ToolScreen'
import { QuyTrinhScreen } from '../ui/generic/QuyTrinhScreen'
import { BaoCaoScreen } from '../ui/generic/BaoCaoScreen'

const GENERIC: Record<string, ComponentType<ScreenProps>> = {
  catalog: CatalogScreen, voucher: VoucherScreen, report: ReportScreen, tool: ToolScreen, quytrinh: QuyTrinhScreen, baocao: BaoCaoScreen,
}

export function ScreenRoute() {
  const { s } = useSession()
  const { mod: mk, slug } = useParams()
  const { mod, sc } = timMan(mk, slug)
  if (!mod) return <Navigate to="/app" replace />
  if (!sc) return <Navigate to={duongDan(mod, manDau(mod, s.goi))} replace />
  if (!moDuoc(sc, s.goi)) return <Locked code={maKhoa(sc)!} ten={tenMan(sc)} crumb={[mod.ten, sc.nhom ?? '']} />
  const C = sc.comp ?? GENERIC[sc.kind]
  return <C key={mk + '/' + slug} sc={sc} mod={mod} />
}

export function HomeRedirect() {
  const { s } = useSession()
  return <Navigate to={s.role === 'owner' ? '/app/trang-chu/tong-quan' : '/app/trang-chu/ban-lam-viec'} replace />
}

/** Trang nâng cấp khi bấm vào tính năng ngoài gói */
export function Locked({ code, ten, crumb }: { code: string; ten: string; crumb: string[] }) {
  const { s, set } = useSession()
  const can = minGoi(code)
  const f = FEATURE[code]
  const goiCo = GOIS.filter(g => f?.g.includes(g))
  const them = (g: Goi) => FEATURES.filter(x => x.g.includes(g) && !x.g.includes(s.goi))
  const moi = them(can).sort((a, b) => Number(b.m === f?.m) - Number(a.m === f?.m))
  return (
    <div className="page">
      <PageHead crumb={crumb.filter(Boolean)} title={ten} code={code} />
      <div className="card lockpage" style={{ padding: '34px 40px' }}>
        <div className="lock-ic"><Icon n="lock" className="ic lg" /></div>
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
        <p style={{ fontSize: 12, marginTop: 18 }}>Bảng so sánh đủ 4 gói ở <Link to="/app/he-thong/goi-thue-bao">Hệ thống, Gói thuê bao</Link>. <Pk g={s.goi} /></p>
      </div>
    </div>
  )
}

export function NotFound() {
  return <div className="page"><div className="card"><div className="empty"><b>Không có màn này</b><Link to="/app">Về trang chủ</Link></div></div></div>
}
