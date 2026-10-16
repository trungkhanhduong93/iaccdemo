import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../Icon'

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

  const TABS = [
    { key: 'trang-chu', nhan: 'Trang chủ', to: '/app', icon: 'home' },
    { key: 'nghiep-vu', nhan: 'Nghiệp vụ', to: '/app/nghiep-vu', icon: 'nghiepvu' },
    { key: 'bao-cao', nhan: 'Báo cáo', to: '/app/bao-cao/tat-ca', icon: 'chart' },
    { key: 'khac', nhan: 'Khác', to: '/app/khac', icon: 'more' },
  ] as const

  return (
    <nav className="m-thanh-duoi">
      {TABS.map(t => {
        const on = tabHienTai === t.key
        return (
          <Link key={t.key} to={t.to} className={`m-tab${on ? ' on' : ''}`}>
            <span className="m-tab-ic">
              <Icon n={t.icon} className="ic lg" kieu={on ? 'khoi' : 'net'} />
            </span>
            <span className="m-tab-nhan">{t.nhan}</span>
          </Link>
        )
      })}
    </nav>
  )
}
