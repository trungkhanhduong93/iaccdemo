// Chọn đơn vị kế toán: một tài khoản làm cho nhiều mã số thuế (tính năng 11.13)
import { Navigate, useNavigate } from 'react-router-dom'
import { dsDonVi, useSession } from '../../app/session'
import { cheDoCuaGoi } from '../../app/che-do'
import { KY_MO } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Logo } from '../../ui/Logo'
import { Pk } from '../../ui/Page'
import { useThemDonVi } from '../onboarding/OnboardFabi'

export function ChonDonVi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const themDv = useThemDonVi()
  if (!s.loggedIn) return <Navigate to="/dang-nhap" replace />
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 640 }}>
        <div className="brand" style={{ color: 'var(--ink)', marginBottom: 28 }}><Logo cao={40} /></div>
        <h2 style={{ fontSize: 24, color: 'var(--ink)', fontWeight: 800 }}>Chọn đơn vị kế toán</h2>
        <p className="muted" style={{ margin: '6px 0 20px' }}>Tài khoản {s.email} làm việc ở {dsDonVi(s).length} đơn vị. Mỗi đơn vị có sổ sách, gói thuê bao riêng.</p>
        <div className="stack" style={{ gap: 10 }}>
          {dsDonVi(s).map(d => (
            <button key={d.id} className="dv-card" onClick={() => { set({ donVi: d.id, goi: d.goi }); nav('/app') }}>
              <span className="dv-av">{d.viettat}</span>
              <span className="grow">
                <b style={{ color: 'var(--ink)', fontSize: 15 }}>{d.ten}</b><br />
                <small className="muted">{d.mst ? `MST ${d.mst}` : 'Chưa khai MST'} · {cheDoCuaGoi(d.goi).soHieu} · {d.diem} điểm bán · Kỳ {KY_MO.thang}/{KY_MO.nam} đang mở</small>
              </span>
              <Pk g={d.goi} />
              <Icon n="chevr" />
            </button>
          ))}
          <button className="dv-card" style={{ borderStyle: 'dashed', color: 'var(--blue)' }} onClick={themDv}>
            <span className="dv-av" style={{ background: 'var(--soft)' }}><Icon n="plus" /></span>
            <b>Thêm đơn vị kế toán</b>
          </button>
        </div>
        <p style={{ marginTop: 22, fontSize: 13 }}><button className="btn ghost" onClick={() => { set({ loggedIn: false }); nav('/dang-nhap') }}><Icon n="logout" className="ic sm" />Đăng xuất</button></p>
      </div>
    </div>
  )
}
