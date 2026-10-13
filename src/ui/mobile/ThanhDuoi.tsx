import { Link, useLocation } from 'react-router-dom'
import raw1 from '../../assets/ivt/ic_navigation_tab_1_v2.svg?raw'
import raw2 from '../../assets/ivt/ic_navigation_tab_2_v2.svg?raw'
import raw3 from '../../assets/ivt/ic_navigation_tab_3_v2.svg?raw'
import raw4 from '../../assets/ivt/ic_navigation_tab_4_v2.svg?raw'

const svg1 = raw1.replace(/#1A1A1A/gi, 'currentColor')
const svg2 = raw2.replace(/#1A1A1A/gi, 'currentColor')
const svg3 = raw3.replace(/#1A1A1A/gi, 'currentColor')
const svg4 = raw4.replace(/#1A1A1A/gi, 'currentColor')

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
    { key: 'trang-chu', nhan: 'Trang chủ', to: '/app', svg: svg1 },
    { key: 'nghiep-vu', nhan: 'Nghiệp vụ', to: '/app/nghiep-vu', svg: svg2 },
    { key: 'bao-cao', nhan: 'Báo cáo', to: '/app/bao-cao/tat-ca', svg: svg3 },
    { key: 'khac', nhan: 'Khác', to: '/app/khac', svg: svg4 },
  ] as const

  return (
    <nav className="m-thanh-duoi">
      {TABS.map(t => {
        const on = tabHienTai === t.key
        return (
          <Link key={t.key} to={t.to} className={`m-tab${on ? ' on' : ''}`}>
            <span className="m-tab-ic" dangerouslySetInnerHTML={{ __html: t.svg }} />
            <span className="m-tab-nhan">{t.nhan}</span>
          </Link>
        )
      })}
    </nav>
  )
}
