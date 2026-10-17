import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { MODULES, nhanTab, timMan, vaoBaoCao } from '../../app/registry'
import { ghiGanDay } from '../../app/CommandPalette'
import { OnboardFabi } from '../../modules/onboarding/OnboardFabi'
import { Icon } from '../Icon'
import { Dropdown, MenuHead, MenuItem, MenuSep } from '../Dropdown'
import { ThanhDuoi } from './ThanhDuoi'
import { MBaoCaoLoc } from './MBaoCaoLoc'

function laManGoc(pathname: string, search = ''): boolean {
  if (pathname === '/app/nghiep-vu' && search.includes('m=')) return false
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

function layTieuDe(pathname: string, search = ''): string {
  if (pathname === '/app' || pathname === '/app/') return 'Trang chủ'
  if (pathname.startsWith('/app/nghiep-vu')) {
    if (search.includes('m=')) {
      const sp = new URLSearchParams(search)
      const mk = sp.get('m')
      const mod = MODULES.find(m => m.key === mk)
      if (mod) return mod.ten
    }
    return 'Nghiệp vụ'
  }
  if (pathname.startsWith('/app/khac')) return 'Khác'
  const parts = pathname.split('/').filter(Boolean)
  const modKey = parts[1]
  const slug = parts[2]
  if (!modKey) return 'Trang chủ'
  if (modKey === 'kho' && (slug === '5-1-1' || slug === '5-1-2-4')) return 'Nhập xuất khác'
  if (modKey === 'ccdc' && slug === '8-1-1') return 'Danh sách thẻ chi phí'
  const { mod, sc } = timMan(modKey, slug)
  if (sc) return nhanTab(sc)
  if (mod) return mod.ten
  return 'IACC Cloud'
}

// Màn cấp 2 (xem, sửa phiếu, xem báo cáo) ẩn thanh tab, nút quay lại đủ để thoát (T223)
function laBaoCao(pathname: string): boolean {
  const [, modKey, slug] = pathname.split('/').filter(Boolean)
  if (modKey === 'bao-cao') return Boolean(slug) && slug !== 'tat-ca' && !slug.startsWith('nhom-')
  const { sc } = timMan(modKey, slug)
  // Màn custom chỉ tính là báo cáo khi vào Trung tâm báo cáo; trang chủ cũng là custom, cần giữ thanh dưới (T281)
  return sc?.kind === 'report' || sc?.kind === 'baocao' || (sc?.kind === 'custom' && vaoBaoCao(sc))
}

function laXemPhieu(pathname: string): boolean {
  return pathname.split('/').filter(Boolean).length >= 4
}

// Màn có thanh nút Lập phiếu riêng ở đáy: ẩn thanh dưới như màn cấp 2 (T292)
const CAP_HAI_CO_NUT = ['/app/trang-chu/lich-su-quy', '/app/trang-chu/chi-phi-thang']

// Chip cửa hàng chỉ có nghĩa ở danh sách, báo cáo; trang chủ có chip riêng (T223)
function coChipCn(pathname: string): boolean {
  if (laXemPhieu(pathname)) return false
  const [, modKey, slug] = pathname.split('/').filter(Boolean)
  if (!slug) return false
  return !['bao-cao', 'danh-muc', 'he-thong'].includes(modKey) || laBaoCao(pathname)
}

function layNhanCn(c?: { id: string; ten: string; ngan?: string }): string {
  if (!c) return 'Tất cả'
  return c.ngan ?? c.ten
}

export function MobileShell() {
  const { s, set } = useSession()
  const loc = useLocation()
  const nav = useNavigate()
  const [moLocBc, setMoLocBc] = useState(false)

  // Ghi lịch sử màn vừa mở cho hộp tìm Ctrl K (T80)
  useEffect(() => {
    if (s.loggedIn) ghiGanDay(loc.pathname)
  }, [loc.pathname, s.loggedIn])

  if (!s.loggedIn) return <Navigate to="/dang-nhap" replace />

  const dsCnRaw = dsCuaHang(s)
  const dsCn = dsCnRaw.length ? dsCnRaw : CUA_HANG
  const cn = dsCn.find(c => c.id === s.cuaHang)

  const laGoc = laManGoc(loc.pathname, loc.search)
  const laTrangChu =
    loc.pathname === '/app' ||
    loc.pathname === '/app/' ||
    loc.pathname === '/app/trang-chu/tong-quan' ||
    loc.pathname === '/app/trang-chu/ban-lam-viec'
  const tieuDe = layTieuDe(loc.pathname, loc.search)
  const capHai = laXemPhieu(loc.pathname) || laBaoCao(loc.pathname) || CAP_HAI_CO_NUT.includes(loc.pathname)
  const parts = loc.pathname.split('/').filter(Boolean)
  const currentSc = timMan(parts[1], parts[2])?.sc

  const quayLai = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1)
    } else if (loc.pathname === '/app/nghiep-vu' && loc.search.includes('m=')) {
      nav('/app/nghiep-vu', { replace: true })
    } else if (loc.pathname.startsWith('/app/trang-chu/')) {
      const sp = new URLSearchParams(loc.search)
      const th = sp.get('thang')
      nav(th ? `/app/trang-chu/tong-quan?thang=${th}` : '/app/trang-chu/tong-quan', { replace: true })
    } else {
      nav('/app/trang-chu/tong-quan', { replace: true })
    }
  }

  return (
    <div className={`m-app${capHai ? ' m-cap-2' : ''}`}>
      {!laTrangChu && (
        <header className="m-thanh-tren">
          <div className="m-thanh-tren-trai">
            {!laGoc && (
              <button
                type="button"
                className="m-nut-back"
                onClick={quayLai}
                title="Quay lại"
                aria-label="Quay lại"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" vectorEffect="non-scaling-stroke" />
                </svg>
              </button>
            )}
          </div>
          <h1 className="m-thanh-tren-tieu-de">
            {tieuDe}
          </h1>
          <div className="m-thanh-tren-phai">
            {laBaoCao(loc.pathname) ? (
              <button
                type="button"
                className="m-thanh-tren-nut-loc"
                onClick={() => setMoLocBc(true)}
                title="Bộ lọc báo cáo"
                aria-label="Bộ lọc báo cáo"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14" vectorEffect="non-scaling-stroke" /><line x1="4" y1="10" x2="4" y2="3" vectorEffect="non-scaling-stroke" />
                  <line x1="12" y1="21" x2="12" y2="12" vectorEffect="non-scaling-stroke" /><line x1="12" y1="8" x2="12" y2="3" vectorEffect="non-scaling-stroke" />
                  <line x1="20" y1="21" x2="20" y2="16" vectorEffect="non-scaling-stroke" /><line x1="20" y1="12" x2="20" y2="3" vectorEffect="non-scaling-stroke" />
                  <line x1="1" y1="14" x2="7" y2="14" vectorEffect="non-scaling-stroke" /><line x1="9" y1="8" x2="15" y2="8" vectorEffect="non-scaling-stroke" /><line x1="17" y1="16" x2="23" y2="16" vectorEffect="non-scaling-stroke" />
                </svg>
              </button>
            ) : coChipCn(loc.pathname) ? (
              <Dropdown
                btnClass="m-cn-btn"
                align="end"
                width={280}
                title="Chọn cửa hàng làm việc"
                label={
                  <>
                    <Icon n="cuahang" className="ic sm" />
                    <span className="m-cn-nhan">{layNhanCn(cn)}</span>
                    <Icon n="chevd" className="ic sm" />
                  </>
                }
              >
                {dong => (
                  <>
                    <MenuHead right={<small className="mh-n">{dsCn.length} cửa hàng</small>}>Cửa hàng làm việc</MenuHead>
                    <MenuItem on={!cn} icon="layers" desc="Chỉ xem gộp, chưa lập chứng từ" onClick={() => { set({ cuaHang: 'all' }); dong() }}>
                      Tất cả cửa hàng
                    </MenuItem>
                    <MenuSep />
                    {dsCn.map(c => (
                      <MenuItem key={c.id} on={c.id === s.cuaHang} icon="cuahang" onClick={() => { set({ cuaHang: c.id }); dong() }}>
                        {c.ten}
                      </MenuItem>
                    ))}
                  </>
                )}
              </Dropdown>
            ) : null}
          </div>
        </header>
      )}

      <main className="m-than">
        <Outlet />
      </main>

      {!capHai && <ThanhDuoi />}
      <OnboardFabi />

      {moLocBc && (
        <MBaoCaoLoc
          mo={moLocBc}
          onDong={() => setMoLocBc(false)}
          path={loc.pathname}
          sc={currentSc}
        />
      )}
    </div>
  )
}
