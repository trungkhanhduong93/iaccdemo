// Đăng nhập, quên mật khẩu
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { NGUOI_DUNG } from '../../data/mock'
import { Logo } from '../../ui/Logo'
import slide1 from '../../assets/dang-nhap/slide-1.webp'
import slide2 from '../../assets/dang-nhap/slide-2.webp'
import slide3 from '../../assets/dang-nhap/slide-3.webp'
import slide4 from '../../assets/dang-nhap/slide-4.webp'

const SLIDES = [
  {
    img: slide1,
    alt: 'Màn Xuất bán POS',
    tieuDe: 'Doanh thu FABi tự vào sổ',
    moTa: 'Đơn POS từ FABi về sổ theo từng hoá đơn, không nhập tay. Kế toán chỉ kiểm tra và xử lý đơn lỗi.',
  },
  {
    img: slide2,
    alt: 'Màn Bàn làm việc',
    tieuDe: 'Việc trong ngày nằm trên một màn',
    moTa: 'Bàn làm việc gom đơn lỗi, hoá đơn chờ hạch toán, công nợ quá hạn, hạn nộp tờ khai và tiến độ khoá sổ.',
  },
  {
    img: slide3,
    alt: 'Màn Sổ quỹ tiền mặt',
    tieuDe: 'Sổ sách, báo cáo theo chế độ kế toán',
    moTa: 'Sổ quỹ, sổ ngân hàng, báo cáo tài chính theo TT58, TT133, TT99. Xem theo từng cửa hàng hoặc gộp cả chuỗi.',
  },
  {
    img: slide4,
    alt: 'Màn Kiểm kê kho',
    tieuDe: 'Kho theo từng cửa hàng',
    moTa: 'Nhập, xuất, điều chuyển, kiểm kê theo từng kho. Đồng bộ với iPOS Inventory.',
  },
]

export function AuthBrand() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide(s => (s + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slide])

  return (
    <div className="auth-l">
      {SLIDES.map((s, i) => (
        <img
          key={i}
          src={s.img}
          alt={s.alt}
          className={`auth-slide${i === slide ? ' on' : ''}`}
        />
      ))}
      <div className="auth-phu" />
      <div className="auth-slide-chu">
        <h2>{SLIDES[slide].tieuDe}</h2>
        <p>{SLIDES[slide].moTa}</p>
      </div>
      <div className="auth-day">
        <div className="auth-cham">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === slide ? 'on' : undefined}
              onClick={() => setSlide(i)}
              aria-label={`Slide ${i + 1}`}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="auth-nuts">
          <button
            type="button"
            className="auth-nut-truoc"
            onClick={() => setSlide((slide + SLIDES.length - 1) % SLIDES.length)}
            aria-label="Slide trước"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="auth-nut-sau"
            onClick={() => setSlide((slide + 1) % SLIDES.length)}
            aria-label="Slide sau"
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function Login() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [email, setEmail] = useState(s.email)
  const [mk, setMk] = useState('')
  const [hienMk, setHienMk] = useState(false)
  const [loi, setLoi] = useState('')

  const vao = () => {
    if (!email.trim()) return setLoi('Nhập email hoặc số điện thoại.')
    if (mk.length < 6) return setLoi('Mật khẩu có ít nhất 6 ký tự.')
    // Vai trò, tên theo tài khoản người dùng; email lạ thì vào vai trò kế toán trưởng
    const nd = NGUOI_DUNG.find(u => u.email === email.trim().toLowerCase())
    set({ loggedIn: true, email, role: nd?.role ?? 'ktt', dvMoi: undefined, ...(nd ? { ten: nd.ten } : {}) }) // đăng nhập thường chỉ còn 3 đơn vị mẫu, bỏ đơn vị dùng thử từ FABi
    nav('/chon-don-vi')
  }

  return (
    <div className="auth">
      <AuthBrand />
      <div className="auth-r">
        <header className="auth-top">
          <Logo cao={36} />
        </header>
        <div className="auth-giua">
          <form className="auth-box" onSubmit={e => { e.preventDefault(); vao() }}>
            <h1>Đăng nhập</h1>
            <div className="auth-note">
              Dùng tài khoản iPOS Accounting hoặc tài khoản <b>FABi</b> để đăng nhập
            </div>

            <div className="auth-inputs">
              <div>
                <label htmlFor="tk" className="auth-sr-only">Email hoặc số điện thoại</label>
                <input
                  id="tk"
                  type="text"
                  className="inp"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setLoi('') }}
                  placeholder="Nhập email hoặc số điện thoại"
                  autoComplete="username"
                  aria-label="Email hoặc số điện thoại"
                />
              </div>
              <div style={{ position: 'relative' }}>
                <label htmlFor="mk" className="auth-sr-only">Mật khẩu</label>
                <input
                  id="mk"
                  className="inp auth-inp-mk"
                  type={hienMk ? 'text' : 'password'}
                  value={mk}
                  onChange={e => { setMk(e.target.value); setLoi('') }}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  aria-label="Mật khẩu"
                />
                <button
                  type="button"
                  className="auth-mat"
                  onClick={() => setHienMk(!hienMk)}
                  aria-label={hienMk ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {hienMk ? (
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.9" />
                      <path d="M6.5 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10.4 10.4 0 0 0 5.4-1.5" />
                      <path d="M3 3l18 18" />
                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {loi && <p role="alert" className="auth-loi">{loi}</p>}

            <div className="auth-hang-nho">
              <label>
                <input type="checkbox" defaultChecked />
                Nhớ đăng nhập
              </label>
              <Link to="/quen-mat-khau" className="auth-lk-cam">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="btn pri auth-nut-chinh">Đăng nhập</button>

            <Link to="/khoi-tao-fabi" className="auth-fabi">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 4h6v6" />
                <path d="M20 4l-9 9" />
                <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
              Thử mở từ FABi
            </Link>

            <div className="auth-ke" />

            <p className="auth-dk">
              Bạn chưa có tài khoản? <Link to="/khoi-tao-fabi">Đăng ký sử dụng ngay</Link>
            </p>

            <p className="auth-mau-ghi-chu">Bản mẫu: gõ mật khẩu bất kỳ từ 6 ký tự.</p>
          </form>
        </div>
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
        <header className="auth-top">
          <Logo cao={36} />
        </header>
        <div className="auth-giua">
          <div className="auth-box">
            <h1>Đặt lại mật khẩu</h1>
            {!gui ? (
              <div>
                <div className="auth-note">
                  Nhập email đăng ký. Hệ thống gửi liên kết đặt lại mật khẩu.
                </div>
                <div>
                  <label htmlFor="tk-quen" className="auth-sr-only">Email</label>
                  <input
                    id="tk-quen"
                    className="inp"
                    placeholder="Nhập email"
                    aria-label="Email"
                  />
                </div>
                <button
                  type="button"
                  className="btn pri auth-nut-chinh"
                  style={{ marginTop: 16 }}
                  onClick={() => setGui(true)}
                >
                  Gửi liên kết
                </button>
              </div>
            ) : (
              <div className="auth-thanh-cong">
                Đã gửi liên kết đặt lại mật khẩu tới email. Liên kết dùng được trong 30 phút.
              </div>
            )}
            <Link to="/dang-nhap" className="auth-nut-ve">
              Về trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
