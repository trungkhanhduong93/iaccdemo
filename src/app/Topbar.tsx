// Thanh trên: đơn vị kế toán, tìm nhanh, kỳ kế toán, trạng thái đồng bộ, ô "Xem thử" đổi gói và vai trò
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { donViHienTai, useSession } from './session'
import { GOI, GOIS } from './plan'
import { DON_VI, KY_MO, ROLE, type Role } from '../data/mock'
import { Icon } from '../ui/Icon'
import { Pk } from '../ui/Page'

export function Topbar({ onSearch }: { onSearch: () => void }) {
  const { s, set } = useSession()
  const nav = useNavigate()
  const dv = donViHienTai(s)
  const [menu, setMenu] = useState<'' | 'dv' | 'user' | 'demo'>('')
  const ten = s.ten.split(' ').slice(-2).map(x => x[0]).join('')

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      <button className="dv-btn" onClick={() => setMenu(menu === 'dv' ? '' : 'dv')} title="Đổi đơn vị kế toán">
        <span className="dv-av">{dv.viettat}</span>
        <span style={{ minWidth: 0 }}><b>{dv.ten}</b><small>MST {dv.mst} · {GOI[s.goi].cheDoNgan}</small></span>
        <Icon n="chevd" className="ic sm" />
      </button>
      {menu === 'dv' && (
        <div className="menu-pop" style={{ left: 12 }} onMouseLeave={() => setMenu('')}>
          {DON_VI.map(d => (
            <button key={d.id} onClick={() => { set({ donVi: d.id, goi: d.goi }); setMenu(''); nav('/app') }}>
              <span className="dv-av">{d.viettat}</span>
              <span className="grow"><b style={{ color: 'var(--ink)' }}>{d.ten}</b><br /><small className="muted">MST {d.mst}</small></span>
              <Pk g={d.goi} />
            </button>
          ))}
          <button onClick={() => nav('/khoi-tao')}><Icon n="plus" /> Thêm đơn vị kế toán</button>
        </div>
      )}

      <button className="search" onClick={onSearch}>
        <Icon n="search" className="ic sm" /><span>Tìm màn hình, chứng từ, báo cáo…</span><span className="kbd">Ctrl K</span>
      </button>
      <span className="grow" />

      <span className="ky" title="Kỳ kế toán đang mở"><i />Kỳ {KY_MO.thang}/{KY_MO.nam}</span>
      <span className="sync" title="Đồng bộ FABi theo lịch mỗi 15 phút"><span className="pulse" /><span>FABi <b>14:20</b></span></span>

      <div className="dd" onMouseLeave={() => setMenu(menu === 'demo' ? '' : menu)}>
        <button className="demo" onClick={() => setMenu(menu === 'demo' ? '' : 'demo')} aria-expanded={menu === 'demo'}
          title="Chỉ có ở bản mẫu: đổi gói và vai trò để xem giao diện thay đổi">
          <span>Xem thử</span><Pk g={s.goi} /><b>{ROLE[s.role]}</b><Icon n="chevd" className="ic sm" />
        </button>
        <div className="dd-pop demo-pop" hidden={menu !== 'demo'}>
          <div className="dd-g">Gói thuê bao</div>
          <div className="seg">
            {GOIS.map(g => (
              <button key={g} className={`${s.goi === g ? 'on' : ''} ${GOI[g].cls}`} onClick={() => set({ goi: g })}>{GOI[g].ten}</button>
            ))}
          </div>
          <div className="dd-g">Vai trò</div>
          <select className="sel-mini" value={s.role} onChange={e => { set({ role: e.target.value as Role }); setMenu(''); nav('/app') }} aria-label="Vai trò">
            {(Object.keys(ROLE) as Role[]).map(r => <option key={r} value={r}>{ROLE[r]}</option>)}
          </select>
        </div>
      </div>

      <button className="icon-btn" title="Thông báo" onClick={() => nav('/app/tien-ich/11-6')}><Icon n="bell" /><span className="dot" /></button>
      <button className="avatar" onClick={() => setMenu(menu === 'user' ? '' : 'user')} title={s.ten}>{ten}</button>
      {menu === 'user' && (
        <div className="menu-pop" style={{ right: 12 }} onMouseLeave={() => setMenu('')}>
          <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--line-2)', marginBottom: 4 }}>
            <b style={{ color: 'var(--ink)' }}>{s.ten}</b><br /><small className="muted">{s.email} · {ROLE[s.role]}</small>
          </div>
          <button onClick={() => { setMenu(''); nav('/app/he-thong/goi-thue-bao') }}><Icon n="layers" /> Gói thuê bao</button>
          <button onClick={() => { setMenu(''); nav('/chon-don-vi') }}><Icon n="swap" /> Đổi đơn vị kế toán</button>
          <button onClick={() => { setMenu(''); nav('/app/he-thong/nguoi-dung') }}><Icon n="users" /> Người dùng</button>
          <button onClick={() => { set({ loggedIn: false }); nav('/dang-nhap') }}><Icon n="logout" /> Đăng xuất</button>
        </div>
      )}
    </header>
  )
}
