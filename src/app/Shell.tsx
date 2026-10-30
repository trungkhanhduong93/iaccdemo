import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from './session'
import { MODULES, duongDan, hienPhanHe, manDau, phanHeKhoa, tenPhanHe } from './registry'
import { GOI, GOIS, type Goi } from './plan'
import type { ModuleDef } from '../modules/types'
import { Icon } from '../ui/Icon'
import { FigmaChevThuGonIcon, FigmaDuotoneIcon, FigmaLogoAccounting, FigmaSearchIcon } from '../ui/FigmaIcon'
import { Logo, DauLogo } from '../ui/Logo'
import { Pk } from '../ui/Page'
import { Topbar } from './Topbar'
import { ModuleTabs } from './ModuleTabs'
import { CommandPalette, ghiGanDay } from './CommandPalette'
import { SidebarFlyout, ThaoTacNhanhFlyout } from './SidebarFlyout'
import { heSoZoom } from '../ui/zoom'
import { OnboardFabi } from '../modules/onboarding/OnboardFabi'

import { ChonCuaHangTruoc, laDuongDanTaoPhieu } from '../ui/ChonCuaHangTruoc'

const minGoiPhanHe = (m: ModuleDef): Goi => GOIS.find(g => !phanHeKhoa(m, g)) ?? 'PR'

export function Shell() {
  const { s, set } = useSession()
  const loc = useLocation()
  const nav = useNavigate()
  const [palette, setPalette] = useState(false)

  // T418: Chặn tạo mới chứng từ/phiếu khi đang ở Tất cả cửa hàng
  const [dichDen, setDichDen] = useState<string | null>(null)

  const moChonCuaHang = Boolean(dichDen)

  useEffect(() => {
    if (s.cuaHang !== 'all') return
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.('a')
      if (!target) return
      if (target.classList.contains('qt-n') || target.closest('.qt-n, .quy-trinh-so-do')) return
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
  }

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p) }
      if (e.key === 'Escape') setPalette(false)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  // Lịch sử màn vừa mở cho hộp tìm Ctrl K (T80)
  useEffect(() => { if (s.loggedIn) ghiGanDay(loc.pathname) }, [loc.pathname, s.loggedIn])

  if (!s.loggedIn) return <Navigate to="/dang-nhap" replace />
  const modKey = loc.pathname.split('/')[2]
  const mod = MODULES.find(m => m.key === modKey) ?? MODULES[0]

  return (
    <div className={`shell${s.thuGon ? ' gon' : ''}`}>
      <Sidebar mod={mod} onSearch={() => setPalette(true)} />
      <Topbar />
      <ModuleTabs mod={mod} />
      <main className="main"><Outlet /></main>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
      <OnboardFabi />
      <ChonCuaHangTruoc
        mo={moChonCuaHang}
        laMobile={false}
        onDong={handleDongChon}
        onChon={handleChonCuaHang}
      />
    </div>
  )
}

function Sidebar({ mod, onSearch }: { mod: ModuleDef; onSearch: () => void }) {
  const { s, set } = useSession()
  const loc = useLocation()
  const sbRef = useRef<HTMLElement>(null)
  const timerRef = useRef<number | null>(null)
  const [hovered, setHovered] = useState<{ mod: ModuleDef; top: number } | null>(null)
  // T273: Bảng nổi Thao tác nhanh
  const [ttnOpen, setTtnOpen] = useState(false)
  const [ttnTop, setTtnTop] = useState(0)
  const ttnTimerRef = useRef<number | null>(null)
  useEffect(() => () => {
    if (ttnTimerRef.current) window.clearTimeout(ttnTimerRef.current)
  }, [])

  // Đóng flyout khi đổi trang
  useEffect(() => {
    setHovered(null)
    setTtnOpen(false)
  }, [loc.pathname])

  const onEnterItem = (m: ModuleDef, el: HTMLElement) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const sbRect = sbRef.current?.getBoundingClientRect()
    const itemRect = el.getBoundingClientRect()
    const z = heSoZoom()
    const relTop = sbRect ? (itemRect.top - sbRect.top) / z : 0
    setHovered({ mod: m, top: relTop })
  }

  const onLeaveItem = () => {
    timerRef.current = window.setTimeout(() => {
      setHovered(null)
    }, 180)
  }

  const onEnterFlyout = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const onLeaveFlyout = () => {
    timerRef.current = window.setTimeout(() => {
      setHovered(null)
    }, 180)
  }

  // T273: Thao tác nhanh flyout
  const onEnterTtn = (el: HTMLElement) => {
    if (ttnTimerRef.current) {
      window.clearTimeout(ttnTimerRef.current)
      ttnTimerRef.current = null
    }
    const sbRect = sbRef.current?.getBoundingClientRect()
    const itemRect = el.getBoundingClientRect()
    const z = heSoZoom()
    const relTop = sbRect ? (itemRect.top - sbRect.top) / z : 0
    setTtnTop(relTop)
    setTtnOpen(true)
  }

  const onLeaveTtn = () => {
    ttnTimerRef.current = window.setTimeout(() => {
      setTtnOpen(false)
    }, 180)
  }

  const onEnterTtnFlyout = () => {
    if (ttnTimerRef.current) {
      window.clearTimeout(ttnTimerRef.current)
      ttnTimerRef.current = null
    }
  }

  const onLeaveTtnFlyout = () => {
    ttnTimerRef.current = window.setTimeout(() => {
      setTtnOpen(false)
    }, 180)
  }

  const toggleTtn = (el: HTMLElement) => {
    if (ttnOpen) {
      setTtnOpen(false)
    } else {
      onEnterTtn(el)
    }
  }

  // Menu phụ khi rê chuột vào phân hệ tạm tắt, PhuongXT chốt 14/10/2026 (T227); bật lại thì đổi thành true
  const coMenuPhu = false
  const navGoi = useNavigate()

  return (
    <nav ref={sbRef} className="sidebar" aria-label="Phân hệ">
      {/* Bấm logo về trang chủ; bấm nhãn gói mới mở Gói thuê bao (T309) */}
      <Link to={s.role === 'owner' || s.goi === 'S' ? '/app/trang-chu/tong-quan' : '/app/trang-chu/ban-lam-viec'} className="sb-brand" title="Về trang chủ">
        <span className="sb-brand-wrap">
          <FigmaLogoAccounting />
          <span className={`pk-ivt ${s.goi === 'PR' ? 'pro' : GOI[s.goi].cls}`} role="link" tabIndex={0} title={`Đang dùng gói ${GOI[s.goi].ten}. Bấm để xem gói thuê bao`}
            onClick={e => { e.preventDefault(); e.stopPropagation(); navGoi('/app/he-thong/goi-thue-bao') }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); navGoi('/app/he-thong/goi-thue-bao') } }}>{GOI[s.goi].ten}</span>
        </span>
        <DauLogo size={32} />
      </Link>
      {/* Tìm màn hình, chứng từ, báo cáo nằm đầu thanh bên, trên Trang chủ */}
      <div className="sb-tim">
        <button type="button" className="sb-tim-btn" onClick={onSearch} title="Tìm màn hình, chứng từ, báo cáo (Ctrl K)" aria-label="Tìm kiếm">
          <FigmaSearchIcon size={16} />
          <span>Tìm kiếm…</span>
          <span className="kbd">Ctrl K</span>
        </button>
      </div>
      <div className="sb-nav">
        {/* Bỏ mục Thao tác nhanh khỏi thanh bên, trang chủ vẫn còn khối Thao tác nhanh */}
        {MODULES.filter(m => m.key !== 'thao-tac-nhanh' && hienPhanHe(m, s.goi)).map(m => {
          const khoa = phanHeKhoa(m, s.goi)
          const isTtn = m.key === 'thao-tac-nhanh'
          return (
            <Fragment key={m.key}>
              {/* Đường kẻ trên Danh mục và giữa Danh mục, Hệ thống (T53) */}
              {(m.key === 'danh-muc' || m.key === 'he-thong') && <div className="sb-sep" />}
              {isTtn ? (
                <button
                  type="button"
                  className={`sb-item-btn${ttnOpen ? ' on' : ''}`}
                  title={tenPhanHe(m, s.goi).ten}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleTtn(e.currentTarget)
                  }}
                  onMouseEnter={e => onEnterTtn(e.currentTarget)}
                  onMouseLeave={onLeaveTtn}
                >
                  <FigmaDuotoneIcon name={m.key} size={18} /><span>{tenPhanHe(m, s.goi).ngan}</span>
                </button>
              ) : (
                <Link to={duongDan(m, manDau(m, s.goi))}
                  className={`${m.key === mod.key ? 'on' : ''} ${khoa ? 'lock' : ''}`}
                  title={khoa ? `${tenPhanHe(m, s.goi).ten}: chưa có trong gói ${GOI[s.goi].ten}` : tenPhanHe(m, s.goi).ten}
                  onMouseEnter={coMenuPhu ? e => onEnterItem(m, e.currentTarget) : undefined}
                  onMouseLeave={coMenuPhu ? onLeaveItem : undefined}
                >
                  <FigmaDuotoneIcon name={m.key} size={18} /><span>{tenPhanHe(m, s.goi).ngan}</span>{khoa && <Pk g={minGoiPhanHe(m)} />}
                </Link>
              )}
            </Fragment>
          )
        })}
      </div>
      <div className="sb-foot">
        <button onClick={() => set({ thuGon: !s.thuGon })} title={s.thuGon ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}>
          <FigmaChevThuGonIcon size={18} className={`sb-chev-ic${s.thuGon ? ' rev' : ''}`} /><span>Thu gọn</span>
        </button>
      </div>
      {coMenuPhu && hovered && (
        <SidebarFlyout
          mod={hovered.mod}
          top={hovered.top}
          onClose={() => setHovered(null)}
          onMouseEnter={onEnterFlyout}
          onMouseLeave={onLeaveFlyout}
        />
      )}
      {ttnOpen && (
        <ThaoTacNhanhFlyout
          top={ttnTop}
          onClose={() => setTtnOpen(false)}
          onMouseEnter={onEnterTtnFlyout}
          onMouseLeave={onLeaveTtnFlyout}
        />
      )}
    </nav>
  )
}

