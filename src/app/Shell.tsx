// Khung sau đăng nhập theo bố cục AMIS: sidebar (tìm nhanh, thêm nhanh, phân hệ lớn) · thanh trên · thanh tab ngang các màn trong phân hệ · nội dung
import { Fragment, useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from './session'
import { MODULES, dich, duongDan, hienPhanHe, manDau, maKhoa, moDuoc, phanHeKhoa } from './registry'
import { GOI, anNgoaiGoi, minGoi } from './plan'
import type { ModuleDef } from '../modules/types'
import { Icon } from '../ui/Icon'
import { Logo, DauLogo } from '../ui/Logo'
import { Pk } from '../ui/Page'
import { Dropdown, MenuHead, MenuItem } from '../ui/Dropdown'
import { Topbar } from './Topbar'
import { ModuleTabs } from './ModuleTabs'
import { CommandPalette } from './CommandPalette'

/** Nút Thêm nhanh đầu sidebar, chia theo phân hệ: tên, biểu tượng, đích (mở thẳng form chứng từ mới) */
const THEM_NHANH: [string, [string, string, string][]][] = [
  ['Tiền', [['Phiếu thu', 'cashin', 'tien/2-1-1/moi?loai=thu'], ['Phiếu chi', 'cashout', 'tien/2-1-1/moi?loai=chi'],
    ['Chuyển quỹ', 'swap', 'tien/2-1-1/moi?loai=cq']]],
  ['Bán hàng', [['Bán hàng ngoài POS', 'cart', 'ban-hang/3-1-1/moi'], ['Hoá đơn bán hàng', 'receipt', 'ban-hang/3-1-2/moi'],
    ['Hàng bán trả lại', 'back', 'ban-hang/3-1-4/moi']]],
  ['Mua hàng', [['Phiếu mua hàng', 'truck', 'mua-hang/4-1-1/moi'], ['Trả lại hàng mua', 'back', 'mua-hang/4-1-4/moi']]],
  ['Kho', [['Phiếu xuất huỷ', 'trash', 'kho/5-1-2-3/moi'], ['Phiếu kiểm kê kho', 'clipboard', 'kho/5-1-10/moi'],
    ['Điều chuyển kho', 'swap', 'kho/5-1-4/moi']]],
  ['Tổng hợp', [['Chứng từ tổng hợp', 'doc', 'tong-hop/10-1-1/moi']]],
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
      <Sidebar mod={mod} onSearch={() => setPalette(true)} />
      <Topbar />
      <ModuleTabs mod={mod} />
      <main className="main"><Outlet /></main>
      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  )
}

function Sidebar({ mod, onSearch }: { mod: ModuleDef; onSearch: () => void }) {
  const { s, set } = useSession()

  return (
    <nav className="sidebar" aria-label="Phân hệ">
      <Link to="/app" className="sb-brand" title="IACC Cloud"><Logo nen="toi" cao={34} /><DauLogo size={34} /></Link>
      <div className="sb-tim">
        <button type="button" className="sb-tim-btn" onClick={onSearch} title="Tìm màn hình, chứng từ, báo cáo (Ctrl K)">
          <Icon n="search" className="ic sm" /><span>Tìm kiếm…</span><span className="kbd">Ctrl K</span>
        </button>
      </div>
      <div className="sb-add">
        <Dropdown btnClass="sb-add-btn" title="Thêm nhanh chứng từ" popClass="pop-qadd" width={500}
          label={<><Icon n="plus" className="ic sm" /><span>Thêm nhanh</span></>}>
          <MenuHead right={<small className="mh-n">Mở thẳng form chứng từ mới</small>}>Thêm nhanh chứng từ</MenuHead>
          <div className="qadd">
            {THEM_NHANH.map(([nhom, tatCa]) => {
              // Gói Free chỉ hiện chứng từ trong gói (QD22)
              const ds = tatCa.filter(([, , di]) => { const d = dich(di); return !anNgoaiGoi(s.goi) || !d.sc || moDuoc(d.sc, s.goi) })
              return ds.length > 0 && (
              <div key={nhom} className="qadd-g">
                <div className="qadd-h">{nhom}</div>
                {ds.map(([ten, icon, di]) => {
                  const d = dich(di)
                  const ok = !d.sc || moDuoc(d.sc, s.goi)
                  const ma = d.sc && maKhoa(d.sc)
                  return <MenuItem key={di} to={d.path} icon={icon} lock={!ok} right={!ok && ma ? <Pk g={minGoi(ma)} o /> : undefined}>{ten}</MenuItem>
                })}
              </div>
              )
            })}
          </div>
        </Dropdown>
      </div>
      <div className="sb-nav">
        {MODULES.filter(m => hienPhanHe(m, s.goi)).map(m => {
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
