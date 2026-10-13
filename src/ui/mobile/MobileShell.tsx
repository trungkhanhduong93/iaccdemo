import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { dsChiNhanh, useSession } from '../../app/session'
import { CHI_NHANH } from '../../data/mock'
import { tenMan, timMan } from '../../app/registry'
import { ghiGanDay } from '../../app/CommandPalette'
import { OnboardFabi } from '../../modules/onboarding/OnboardFabi'
import { Icon } from '../Icon'
import { Dropdown, MenuHead, MenuItem, MenuSep } from '../Dropdown'
import { Logo } from '../Logo'
import { ThanhDuoi, tabDangChon } from './ThanhDuoi'

function laManGoc(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, '')
  return (
    p === '/app' ||
    p === '/app/trang-chu/tong-quan' ||
    p === '/app/trang-chu/ban-lam-viec' ||
    p === '/app/nghiep-vu' ||
    p === '/app/bao-cao/tat-ca' ||
    p === '/app/khac'
  )
}

function layTieuDe(pathname: string): string {
  if (pathname === '/app' || pathname === '/app/') return 'Trang chủ'
  if (pathname.startsWith('/app/nghiep-vu')) return 'Nghiệp vụ'
  if (pathname.startsWith('/app/khac')) return 'Khác'
  const parts = pathname.split('/').filter(Boolean)
  const modKey = parts[1]
  const slug = parts[2]
  if (!modKey) return 'Trang chủ'
  const { mod, sc } = timMan(modKey, slug)
  if (sc) return tenMan(sc)
  if (mod) return mod.ten
  return 'IACC Cloud'
}

function layNhanCn(c?: { id: string; ten: string; ngan?: string }): string {
  if (!c) return 'Tất cả'
  return c.ngan ?? c.ten
}

export function MobileShell() {
  const { s, set } = useSession()
  const loc = useLocation()
  const nav = useNavigate()

  // Ghi lịch sử màn vừa mở cho hộp tìm Ctrl K (T80)
  useEffect(() => {
    if (s.loggedIn) ghiGanDay(loc.pathname)
  }, [loc.pathname, s.loggedIn])

  if (!s.loggedIn) return <Navigate to="/dang-nhap" replace />

  const dsCnRaw = dsChiNhanh(s)
  const dsCn = dsCnRaw.length ? dsCnRaw : CHI_NHANH
  const cn = dsCn.find(c => c.id === s.chiNhanh)

  const laGoc = laManGoc(loc.pathname)
  const laTrangChu = tabDangChon(loc.pathname) === 'trang-chu'
  const tieuDe = layTieuDe(loc.pathname)

  return (
    <div className="m-app">
      <header className="m-thanh-tren">
        <div className="m-thanh-tren-trai">
          {!laGoc && (
            <button
              type="button"
              className="m-nut-back"
              onClick={() => nav(-1)}
              title="Quay lại"
            >
              <Icon n="chevl" className="ic sm" />
            </button>
          )}
        </div>
        <h1 className="m-thanh-tren-tieu-de">
          {laTrangChu ? <Logo cao={30} nen="sang" /> : tieuDe}
        </h1>
        <div className="m-thanh-tren-phai">
          <Dropdown
            btnClass="m-cn-btn"
            align="end"
            width={280}
            title="Chọn chi nhánh làm việc"
            label={
              <>
                <Icon n="store" className="ic sm" />
                <span className="m-cn-nhan">{layNhanCn(cn)}</span>
                <Icon n="chevd" className="ic sm" />
              </>
            }
          >
            {dong => (
              <>
                <MenuHead right={<small className="mh-n">{dsCn.length} chi nhánh</small>}>Chi nhánh làm việc</MenuHead>
                <MenuItem on={!cn} icon="layers" desc="Chỉ xem gộp, chưa lập chứng từ" onClick={() => { set({ chiNhanh: 'all' }); dong() }}>
                  Tất cả chi nhánh
                </MenuItem>
                <MenuSep />
                {dsCn.map(c => (
                  <MenuItem key={c.id} on={c.id === s.chiNhanh} icon="store" onClick={() => { set({ chiNhanh: c.id }); dong() }}>
                    {c.ten}
                  </MenuItem>
                ))}
              </>
            )}
          </Dropdown>
        </div>
      </header>

      <main className="m-than">
        <Outlet />
      </main>

      <ThanhDuoi />
      <OnboardFabi />
    </div>
  )
}
