import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FigmaTabIcon } from '../FigmaIcon'

export function tabDangChon(pathname: string): 'trang-chu' | 'nghiep-vu' | 'bao-cao' | 'khac' {
  if (pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/trang-chu')) {
    return 'trang-chu'
  }
  if (pathname.startsWith('/app/bao-cao')) {
    return 'bao-cao'
  }
  if (
    pathname.startsWith('/app/khac') ||
    pathname.startsWith('/app/danh-muc') ||
    pathname.startsWith('/app/he-thong')
  ) {
    return 'khac'
  }
  return 'nghiep-vu'
}

export function ThanhDuoi() {
  const loc = useLocation()
  const tabHienTai = tabDangChon(loc.pathname)
  const [an, setAn] = useState(false)
  const lastScrollY = useRef(0)

  // Đổi màn thì luôn hiện lại thanh tab
  useEffect(() => {
    setAn(false)
    lastScrollY.current = 0
  }, [loc.pathname, loc.search])

  useEffect(() => {
    let ticking = false

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document | null
      if (!target) return

      let top = 0
      if (target === document || target === document.documentElement) {
        top = window.scrollY || document.documentElement.scrollTop || 0
      } else if ('scrollTop' in target) {
        const el = target as HTMLElement
        if (el.scrollHeight <= el.clientHeight) return
        top = el.scrollTop
      }

      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        ticking = false
        const diff = top - lastScrollY.current

        // Ở đầu trang luôn hiện
        if (top <= 8) {
          setAn(false)
        } else if (diff > 8) {
          // Lướt xuống > 8px: trượt ẩn xuống dưới
          setAn(true)
        } else if (diff < -8) {
          // Lướt lên > 8px: hiện lại ngay
          setAn(false)
        }
        lastScrollY.current = top
      })
    }

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [])

  const TABS = [
    { key: 'trang-chu', nhan: 'Trang chủ', to: '/app', icon: 'home' },
    { key: 'nghiep-vu', nhan: 'Nghiệp vụ', to: '/app/nghiep-vu', icon: 'nghiepvu' },
    { key: 'bao-cao', nhan: 'Báo cáo', to: '/app/bao-cao/tat-ca', icon: 'chart' },
    { key: 'khac', nhan: 'Khác', to: '/app/khac', icon: 'more' },
  ] as const

  const tabIndex = TABS.findIndex(t => t.key === tabHienTai)
  const activeIdx = tabIndex >= 0 ? tabIndex : 0

  return (
    <nav className={`m-thanh-duoi${an ? ' an' : ''}`}>
      <span
        className="m-thanh-duoi-pill"
        style={{ transform: `translateX(${activeIdx * 100}%)` }}
        aria-hidden="true"
      />
      {TABS.map(t => {
        const on = tabHienTai === t.key
        return (
          <Link key={t.key} to={t.to} className={`m-tab${on ? ' on' : ''}`}>
            <span className="m-tab-ic">
              <FigmaTabIcon name={t.key} active={on} className="ic lg" />
            </span>
            <span className="m-tab-nhan">{t.nhan}</span>
          </Link>
        )
      })}
    </nav>
  )
}

