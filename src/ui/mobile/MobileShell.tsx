import { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { MODULES, nhanTab, timMan, vaoBaoCao } from '../../app/registry'
import { ghiGanDay } from '../../app/CommandPalette'
import { OnboardFabi } from '../../modules/onboarding/OnboardFabi'
import { Icon } from '../Icon'
import { Dropdown, MenuHead, MenuItem, MenuSep } from '../Dropdown'
import { tabDangChon, ThanhDuoi } from './ThanhDuoi'
import { MBaoCaoLoc } from './MBaoCaoLoc'
import { kyHieuBC } from '../../modules/bao-cao/danh-sach'
import type { Session } from '../../app/session'
import { ChonCuaHangTruoc, laDuongDanTaoPhieu } from '../ChonCuaHangTruoc'

function manGocCuaTab(pathname: string): string {
  const tab = tabDangChon(pathname)
  switch (tab) {
    case 'trang-chu':
      return '/app/trang-chu/tong-quan'
    case 'nghiep-vu':
      return '/app/nghiep-vu'
    case 'bao-cao':
      return '/app/bao-cao/tat-ca'
    case 'khac':
      return '/app/khac'
  }
}

function laManGoc(pathname: string, search = ''): boolean {
  if (pathname === '/app/nghiep-vu' && search.includes('m=')) return false
  if (pathname === '/app/bao-cao/tat-ca' && search.includes('nhom=')) return false
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

function layTieuDe(pathname: string, search = '', s?: Session): string {
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
  if (sc) {
    if (s && s.cheDo === 'TT152' && sc.code) {
      const kh = kyHieuBC(sc.code, s.cheDo, s)
      if (kh && kh.endsWith('-HKD')) return `Báo cáo ${kh}`
    }
    return nhanTab(sc)
  }
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

// Màn con của Khác (Danh mục, Thiết lập) ẩn thanh dưới trên điện thoại (T377)
function laManConKhac(pathname: string): boolean {
  const [, modKey, slug] = pathname.split('/').filter(Boolean)
  if (modKey === 'danh-muc' && slug) return true
  if (modKey === 'he-thong' && slug) return true
  if (modKey === 'tong-hop' && (slug === '10-1-6' || slug === 'khoa-so')) return true
  return false
}

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

  // T418: Chặn tạo mới chứng từ/phiếu khi đang ở Tất cả cửa hàng
  const [dichDen, setDichDen] = useState<string | null>(null)
  const trangTruocRef = useRef<string>('/app/trang-chu/tong-quan')

  useEffect(() => {
    if (!laDuongDanTaoPhieu(loc.pathname, loc.search)) {
      trangTruocRef.current = loc.pathname + loc.search
    }
  }, [loc.pathname, loc.search])

  const dangTaoPhieuTrenUrl = laDuongDanTaoPhieu(loc.pathname, loc.search) && s.cuaHang === 'all'
  const moChonCuaHang = Boolean(dichDen) || dangTaoPhieuTrenUrl

  useEffect(() => {
    if (s.cuaHang !== 'all') return
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href) return
      const pathWithSearch = href.replace(/^#/, '')
      const [p, q = ''] = pathWithSearch.split('?')
      if (laDuongDanTaoPhieu(p, q ? `?${q}` : '')) {
        e.preventDefault()
        e.stopPropagation()
        setDichDen(pathWithSearch)
      }
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [s.cuaHang])

  const handleChonCuaHang = (idCuaHang: string) => {
    set({ cuaHang: idCuaHang })
    if (dichDen) {
      const target = dichDen
      setDichDen(null)
      nav(target)
    }
  }

  const handleDongChon = () => {
    setDichDen(null)
    if (dangTaoPhieuTrenUrl) {
      const luiVe = trangTruocRef.current && !laDuongDanTaoPhieu(trangTruocRef.current)
        ? trangTruocRef.current
        : loc.pathname.replace(/\/moi(\/.*)?$/, '') || '/app/trang-chu/tong-quan'
      nav(luiVe, { replace: true })
    }
  }

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
  const laNghiepVuGoc = loc.pathname === '/app/nghiep-vu' && !loc.search.includes('m=')
  const tieuDe = layTieuDe(loc.pathname, loc.search, s)
  const capHai =
    laXemPhieu(loc.pathname) ||
    laBaoCao(loc.pathname) ||
    CAP_HAI_CO_NUT.includes(loc.pathname) ||
    laManConKhac(loc.pathname)
  const parts = loc.pathname.split('/').filter(Boolean)
  const currentSc = timMan(parts[1], parts[2])?.sc

  const quayLai = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1)
    } else if (loc.pathname === '/app/nghiep-vu' && loc.search.includes('m=')) {
      nav('/app/nghiep-vu', { replace: true })
    } else if (loc.pathname === '/app/bao-cao/tat-ca' && loc.search.includes('nhom=')) {
      nav('/app/bao-cao/tat-ca', { replace: true })
    } else if (loc.pathname.startsWith('/app/trang-chu/')) {
      const sp = new URLSearchParams(loc.search)
      const th = sp.get('thang')
      nav(th ? `/app/trang-chu/tong-quan?thang=${th}` : '/app/trang-chu/tong-quan', { replace: true })
    } else {
      nav(manGocCuaTab(loc.pathname), { replace: true })
    }
  }

  return (
    <div className={`m-app${capHai ? ' m-cap-2' : ''}`}>
      {!laTrangChu && !laNghiepVuGoc && (
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
          <div className="m-thanh-tren-phai" id="m-thanh-tren-phai-slot">
            {laBaoCao(loc.pathname) ? (
              <button
                type="button"
                className="m-thanh-tren-nut-loc"
                onClick={() => setMoLocBc(true)}
                title="Bộ lọc báo cáo"
                aria-label="Bộ lọc báo cáo"
              >
                <Icon n="filter" className="ic" />
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

      <ChonCuaHangTruoc
        mo={moChonCuaHang}
        laMobile={true}
        onDong={handleDongChon}
        onChon={handleChonCuaHang}
      />
    </div>
  )
}
