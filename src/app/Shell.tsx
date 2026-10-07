// Khung sau đăng nhập theo bố cục AMIS: sidebar phân hệ lớn · thanh trên · thanh tab ngang các màn trong phân hệ · nội dung
import { Fragment, useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './session'
import { MODULES, dich, duongDan, manDau, maKhoa, moDuoc, phanHeKhoa } from './registry'
import { GOI, minGoi } from './plan'
import type { ModuleDef } from '../modules/types'
import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'
import { Pk } from '../ui/Page'
import { Topbar } from './Topbar'
import { ModuleTabs } from './ModuleTabs'
import { CommandPalette } from './CommandPalette'

/** Nút Thêm nhanh đầu sidebar: tên, biểu tượng, đích (mở thẳng form chứng từ mới) */
const THEM_NHANH: [string, string, string][] = [
  ['Phiếu thu', 'cashin', 'tien/2-1-1/moi?loai=thu'],
  ['Phiếu chi', 'cashout', 'tien/2-1-1/moi?loai=chi'],
  ['Bán hàng ngoài POS', 'cart', 'ban-hang/3-1-1/moi'],
  ['Hoá đơn bán hàng', 'receipt', 'ban-hang/3-1-2/moi'],
  ['Phiếu mua hàng', 'truck', 'mua-hang/4-1-1/moi'],
  ['Phiếu xuất huỷ', 'trash', 'kho/5-1-2-3/moi'],
  ['Phiếu kiểm kê kho', 'clipboard', 'kho/5-1-10/moi'],
  ['Chứng từ tổng hợp', 'doc', 'tong-hop/10-1-1/moi'],
]

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
  const [mo, setMo] = useState(false)
  useEffect(() => setMo(false), [loc.pathname, loc.search])

  return (
    <nav className="sidebar" aria-label="Phân hệ">
      <Link to="/app" className="sb-brand" title="IACC Cloud"><Logo size={34} /><span>IACC Cloud</span></Link>
      <div className="sb-add" onMouseLeave={() => setMo(false)}>
        <button className="sb-add-btn" onClick={() => setMo(!mo)} aria-expanded={mo} title="Thêm nhanh chứng từ">
          <Icon n="plus" className="ic sm" /><span>Thêm nhanh</span>
        </button>
        <div className="dd-pop sb-menu" hidden={!mo}>
          <div className="dd-g">Thêm nhanh chứng từ</div>
          {THEM_NHANH.map(([ten, icon, di]) => {
            const d = dich(di)
            const ok = !d.sc || moDuoc(d.sc, s.goi)
            const ma = d.sc && maKhoa(d.sc)
            return (
              <Link key={di} to={d.path} className={ok ? '' : 'lock'}>
                <Icon n={icon} className="ic sm" />{ten}{!ok && ma && <Pk g={minGoi(ma)} o />}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="sb-nav">
        {MODULES.map(m => {
          const khoa = phanHeKhoa(m, s.goi)
          return (
            <Fragment key={m.key}>
              {m.key === 'he-thong' && <div className="sb-sep" />}
              <Link to={duongDan(m, manDau(m, s.goi))} className={`${m.key === mod.key ? 'on' : ''} ${khoa ? 'lock' : ''}`}
                title={khoa ? `${m.ten}: chưa có trong gói ${GOI[s.goi].ten}` : m.ten}>
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
    </nav>
  )
}
