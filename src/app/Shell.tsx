import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './session'
import { MODULES, duongDan, hienPhanHe, manDau, phanHeKhoa } from './registry'
import { GOI } from './plan'
import type { ModuleDef } from '../modules/types'
import { Icon } from '../ui/Icon'
import { Logo, DauLogo } from '../ui/Logo'
import { Topbar } from './Topbar'
import { ModuleTabs } from './ModuleTabs'
import { CommandPalette } from './CommandPalette'
import { SidebarFlyout } from './SidebarFlyout'
import { heSoZoom } from '../ui/zoom'

export function Shell() {
  const { s } = useSession()
  const loc = useLocation()
  const [palette, setPalette] = useState(false)

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p) }
      if (e.key === 'Escape') setPalette(false)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  if (!s.loggedIn) return <Navigate to="/dang-nhap" replace />
  const modKey = loc.pathname.split('/')[2]
  const mod = MODULES.find(m => m.key === modKey) ?? MODULES[0]

  return (
    <div className={`shell${s.thuGon ? ' gon' : ''}`}>
      <Sidebar mod={mod} />
      <Topbar onSearch={() => setPalette(true)} />
      <ModuleTabs mod={mod} />
      <main className="main"><Outlet /></main>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  )
}

function Sidebar({ mod }: { mod: ModuleDef }) {
  const { s, set } = useSession()
  const loc = useLocation()
  const sbRef = useRef<HTMLElement>(null)
  const timerRef = useRef<number | null>(null)
  const [hovered, setHovered] = useState<{ mod: ModuleDef; top: number } | null>(null)

  // Đóng flyout khi đổi trang
  useEffect(() => {
    setHovered(null)
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

  return (
    <nav ref={sbRef} className="sidebar" aria-label="Phân hệ">
      <Link to="/app/he-thong/goi-thue-bao" className="sb-brand" title={`Đang dùng gói ${GOI[s.goi].ten}. Bấm để xem gói thuê bao`}>
        <span className="sb-brand-wrap">
          <Logo nen="toi" cao={30} />
          <span className={`pk-ivt ${s.goi === 'PR' ? 'pro' : GOI[s.goi].cls}`}>{GOI[s.goi].ten}</span>
        </span>
        <DauLogo size={32} />
      </Link>
      <div className="sb-nav">
        {MODULES.filter(m => hienPhanHe(m, s.goi)).map(m => {
          const khoa = phanHeKhoa(m, s.goi)
          return (
            <Fragment key={m.key}>
              {m.key === 'danh-muc' && <div className="sb-sep" />}
              <Link to={duongDan(m, manDau(m, s.goi))}
                className={`${m.key === mod.key ? 'on' : ''} ${khoa ? 'lock' : ''}`}
                title={khoa ? `${m.ten}: chưa có trong gói ${GOI[s.goi].ten}` : m.ten}
                onMouseEnter={e => onEnterItem(m, e.currentTarget)}
                onMouseLeave={onLeaveItem}
              >
                <Icon n={m.icon} /><span>{m.ngan}</span>{khoa && <Icon n="lock" className="ic sm lk" />}
              </Link>
            </Fragment>
          )
        })}
      </div>
      <div className="sb-foot">
        <button onClick={() => set({ thuGon: !s.thuGon })} title={s.thuGon ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}>
          <Icon n={s.thuGon ? 'chevr' : 'chevl'} /><span>Thu gọn</span>
        </button>
      </div>
      {hovered && (
        <SidebarFlyout
          mod={hovered.mod}
          top={hovered.top}
          onClose={() => setHovered(null)}
          onMouseEnter={onEnterFlyout}
          onMouseLeave={onLeaveFlyout}
        />
      )}
    </nav>
  )
}

