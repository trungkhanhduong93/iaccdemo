// Đăng nhập, quên mật khẩu
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { Logo, DauLogo } from '../../ui/Logo'

export function AuthBrand() {
  const nodes: [string, string, string][] = [['pos', 'FABi', 'Đơn bán, ca, thanh toán'], ['box', 'iPOS Inventory', 'Phiếu kho, định lượng'], ['receipt', 'Hoá đơn điện tử', 'Đầu ra, đầu vào']]
  return (
    <div className="auth-l">
      <div className="brand"><Logo nen="toi" cao={40} /></div>
      <h1>Doanh thu FABi tự vào sổ.<br /><em>Không nhập tay đơn POS.</em></h1>
      <p>Phần mềm kế toán trên web cho chuỗi F&B. Đồng bộ FABi, iPOS Inventory, hoá đơn điện tử. Sổ sách, báo cáo theo TT58, TT133, TT99.</p>
      <div className="hub">
        <div className="hub-col">
          {nodes.map(([ic, b, s]) => <div className="hub-n" key={b}><Icon n={ic} /><span><b>{b}</b><small>{s}</small></span></div>)}
        </div>
        <div className="hub-c"><DauLogo size={34} style={{ display: 'block' }} />IACC Cloud</div>
        <div className="hub-col">
          <div className="hub-n"><Icon n="bank" /><span><b>Thuế, ngân hàng</b><small>Kết nối trực tiếp</small></span></div>
          <div className="hub-n"><Icon n="chart" /><span><b>Sổ sách, báo cáo</b><small>Theo thông tư</small></span></div>
        </div>
      </div>
      <p style={{ fontSize: 12, marginTop: 28, color: '#8fa1c4' }}>iPOS.vn · Bản mẫu giao diện, dữ liệu giả</p>
    </div>
  )
}

export function Login() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [email, setEmail] = useState(s.email)
  const [mk, setMk] = useState('')
  const [loi, setLoi] = useState('')
  const vao = () => {
    if (!email.trim()) return setLoi('Nhập email hoặc số điện thoại.')
    if (mk.length < 6) return setLoi('Mật khẩu có ít nhất 6 ký tự.')
    set({ loggedIn: true, email })
    nav('/chon-don-vi')
  }
  return (
    <div className="auth">
      <AuthBrand />
      <div className="auth-r">
        <form className="auth-box" onSubmit={e => { e.preventDefault(); vao() }}>
          <h2>Đăng nhập</h2>
          <p>Dùng tài khoản IACC Cloud hoặc tài khoản iPOS đang dùng cho FABi.</p>
          <div className="stack" style={{ gap: 14 }}>
            <div className="f"><label>Email hoặc số điện thoại</label><input className="inp" value={email} onChange={e => { setEmail(e.target.value); setLoi('') }} placeholder="vd: ketoan@congty.vn" /></div>
            <div className="f">
              <label className="row">Mật khẩu<span className="grow" /><Link to="/quen-mat-khau" style={{ fontWeight: 600 }}>Quên mật khẩu?</Link></label>
              <input className="inp" type="password" value={mk} onChange={e => { setMk(e.target.value); setLoi('') }} placeholder="Ít nhất 6 ký tự" />
              {loi && <small style={{ color: 'var(--red)' }}>{loi}</small>}
            </div>
            <label className="row" style={{ fontSize: 13 }}><input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập trên máy này</label>
            <button className="btn pri lg" type="submit">Đăng nhập</button>
          </div>
          <div className="or">hoặc</div>
          <button type="button" className="btn lg" style={{ width: '100%' }} onClick={() => { set({ loggedIn: true }); nav('/chon-don-vi') }}>
            <Icon n="key" className="ic sm" />
            Đăng nhập bằng tài khoản iPOS
          </button>
          <p style={{ marginTop: 22, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            Chưa có tài khoản? <Link to="/khoi-tao" style={{ fontWeight: 600 }}>Dùng thử gói Free</Link>
          </p>
          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--faint)', textAlign: 'center' }}>Bản mẫu: gõ mật khẩu bất kỳ từ 6 ký tự.</p>
        </form>
      </div>
    </div>
  )
}

export function QuenMatKhau() {
  const [gui, setGui] = useState(false)
  return (
    <div className="auth">
      <AuthBrand />
      <div className="auth-r">
        <div className="auth-box">
          <h2>Đặt lại mật khẩu</h2>
          {gui ? (
            <>
              <p>Đã gửi liên kết đặt lại mật khẩu tới email. Liên kết dùng được trong 30 phút.</p>
              <Link className="btn pri lg" style={{ width: '100%' }} to="/dang-nhap">Về trang đăng nhập</Link>
            </>
          ) : (
            <>
              <p>Nhập email đăng ký. Hệ thống gửi liên kết đặt lại mật khẩu.</p>
              <div className="stack" style={{ gap: 14 }}>
                <div className="f"><label>Email</label><input className="inp" placeholder="vd: ketoan@congty.vn" /></div>
                <button className="btn pri lg" onClick={() => setGui(true)}>Gửi liên kết</button>
                <Link to="/dang-nhap" className="btn ghost">Quay lại đăng nhập</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
