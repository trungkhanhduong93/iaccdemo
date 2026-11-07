// Đăng nhập, quên mật khẩu
import { useState, useEffect, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { NGUOI_DUNG } from '../../data/mock'
import { Logo } from '../../ui/Logo'
import { Dropdown, MenuItem } from '../../ui/Dropdown'
import slide1 from '../../assets/dang-nhap/slide-1.webp'
import slide2 from '../../assets/dang-nhap/slide-2.webp'
import slide3 from '../../assets/dang-nhap/slide-3.webp'
import slide4 from '../../assets/dang-nhap/slide-4.webp'

const SLIDES = [
  {
    img: slide1,
    alt: 'Minh hoạ báo cáo đồng bộ lên đám mây',
    tieuDe: 'Doanh thu bán hàng đồng bộ tức thời',
    moTa: 'Hoá đơn POS đồng bộ về kế toán tự động, chi tiết. Bạn chỉ cần kiểm tra lại báo cáo doanh thu.',
  },
  {
    img: slide2,
    alt: 'Minh hoạ danh sách việc đã tích',
    tieuDe: 'Biểu đồ quản trị ngay tại Trang chủ',
    moTa: 'Kết quả kinh doanh, dòng tiền, công nợ và hao hụt ngay tại Trang chủ. Biểu đồ trực quan theo thời gian thực.',
  },
  {
    img: slide3,
    alt: 'Minh hoạ máy tính kế toán và biểu đồ tăng',
    tieuDe: 'Sổ sách, báo cáo theo chế độ kế toán',
    moTa: 'Sổ quỹ, sổ ngân hàng, báo cáo tài chính theo TT58, TT133, TT99. Xem theo từng cửa hàng hoặc gộp cả chuỗi.',
  },
  {
    img: slide4,
    alt: 'Minh hoạ nhân viên kiểm hàng trong kho',
    tieuDe: 'Quản trị kho hàng chuyên biệt cho F&B',
    moTa: 'Nhập, xuất, chế biến, điều chuyển, kiểm kê theo từng kho. Tất cả nghiệp vụ đều thiết kế riêng cho kế toán ngành F&B.',
  },
]

export type MaNgonNgu = 'vi' | 'en' | 'ko' | 'zh'

export function CoNgonNgu({ ma }: { ma: MaNgonNgu }) {
  const clipId = useId()
  if (ma === 'vi') {
    return (
      <svg className="auth-nn-co" width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="14" rx="2" fill="#DA251D" />
        <polygon
          points="10,2.8 11.2,5.8 14.2,5.9 11.8,7.7 12.7,10.6 10,8.8 7.3,10.6 8.2,7.7 5.8,5.9 8.8,5.8"
          fill="#FFFF00"
        />
        <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      </svg>
    )
  }
  if (ma === 'en') {
    return (
      <svg className="auth-nn-co" width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <rect width="20" height="14" rx="2" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect width="20" height="14" fill="#FFFFFF" />
          <rect y="0" width="20" height="2" fill="#B22234" />
          <rect y="4" width="20" height="2" fill="#B22234" />
          <rect y="8" width="20" height="2" fill="#B22234" />
          <rect y="12" width="20" height="2" fill="#B22234" />
          <rect width="9" height="8" fill="#3C3B6E" />
          <circle cx="2.5" cy="2.5" r="0.6" fill="#FFFFFF" />
          <circle cx="6.5" cy="2.5" r="0.6" fill="#FFFFFF" />
          <circle cx="4.5" cy="4" r="0.6" fill="#FFFFFF" />
          <circle cx="2.5" cy="5.5" r="0.6" fill="#FFFFFF" />
          <circle cx="6.5" cy="5.5" r="0.6" fill="#FFFFFF" />
        </g>
        <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      </svg>
    )
  }
  if (ma === 'ko') {
    return (
      <svg className="auth-nn-co" width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="14" rx="2" fill="#FFFFFF" />
        <path d="M7,7a3,3 0 0 1 6,0a1.5,1.5 0 0 1-3,0a1.5,1.5 0 0 0-3,0z" fill="#CD2E3A" />
        <path d="M7,7a3,3 0 0 0 6,0a1.5,1.5 0 0 1-3,0a1.5,1.5 0 0 0-3,0z" fill="#0047A0" />
        <g stroke="#111827" strokeWidth="0.6">
          <line x1="2.5" y1="4.2" x2="4.2" y2="2.5" />
          <line x1="3.2" y1="4.9" x2="4.9" y2="3.2" />
          <line x1="3.9" y1="5.6" x2="5.6" y2="3.9" />
          <line x1="17.5" y1="4.2" x2="15.8" y2="2.5" />
          <line x1="16.8" y1="4.9" x2="15.1" y2="3.2" />
          <line x1="16.1" y1="5.6" x2="14.4" y2="3.9" />
          <line x1="2.5" y1="9.8" x2="4.2" y2="11.5" />
          <line x1="3.2" y1="9.1" x2="4.9" y2="10.8" />
          <line x1="3.9" y1="8.4" x2="5.6" y2="10.1" />
          <line x1="17.5" y1="9.8" x2="15.8" y2="11.5" />
          <line x1="16.8" y1="9.1" x2="15.1" y2="10.8" />
          <line x1="16.1" y1="8.4" x2="14.4" y2="10.1" />
        </g>
        <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      </svg>
    )
  }
  return (
    <svg className="auth-nn-co" width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
      <rect width="20" height="14" rx="2" fill="#EE1C25" />
      <polygon
        points="4.5,1.8 5.2,3.6 7,3.7 5.5,4.9 6.1,6.6 4.5,5.5 2.9,6.6 3.5,4.9 2,3.7 3.8,3.6"
        fill="#FFFF00"
      />
      <polygon points="8.5,1.2 8.8,1.9 9.5,1.9 8.9,2.4 9.1,3 8.5,2.6 7.9,3 8.1,2.4 7.5,1.9 8.2,1.9" fill="#FFFF00" />
      <polygon points="10,2.7 10.3,3.4 11,3.4 10.4,3.9 10.6,4.5 10,4.1 9.4,4.5 9.6,3.9 9,3.4 9.7,3.4" fill="#FFFF00" />
      <polygon points="10,4.7 10.3,5.4 11,5.4 10.4,5.9 10.6,6.5 10,6.1 9.4,6.5 9.6,5.9 9,5.4 9.7,5.4" fill="#FFFF00" />
      <polygon points="8.5,6.2 8.8,6.9 9.5,6.9 8.9,7.4 9.1,8 8.5,7.6 7.9,8 8.1,7.4 7.5,6.9 8.2,6.9" fill="#FFFF00" />
      <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    </svg>
  )
}

const DS_NGON_NGU = [
  { ma: 'vi', ten: 'Tiếng Việt' },
  { ma: 'en', ten: 'English' },
  { ma: 'ko', ten: '한국어' },
  { ma: 'zh', ten: '中文' },
] as const

export function ChonNgonNgu() {
  const [nn, setNn] = useState<MaNgonNgu>('vi')

  return (
    <div className="auth-nn">
      <Dropdown
        btnClass="auth-nn-nut"
        title="Ngôn ngữ"
        align="end"
        popClass="auth-nn-pop"
        width={180}
        label={
          <>
            <CoNgonNgu ma={nn} />
            <svg
              className="auth-nn-ten"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </>
        }
      >
        {dong => (
          <>
            {DS_NGON_NGU.map(item => (
              <MenuItem
                key={item.ma}
                on={item.ma === nn}
                icon={<CoNgonNgu ma={item.ma} />}
                onClick={() => {
                  setNn(item.ma)
                  dong()
                }}
              >
                {item.ten}
              </MenuItem>
            ))}
          </>
        )}
      </Dropdown>
    </div>
  )
}

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
      <svg
        aria-hidden="true"
        width="576"
        height="900"
        className="auth-bg-nghieng"
      >
        <defs>
          <linearGradient id="auth-nghieng" x1="0.33" y1="0" x2="0.67" y2="1">
            <stop offset="0" stopColor="#0560A6" stopOpacity="0.2" />
            <stop offset="1" stopColor="#0560A6" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect
          x="-250"
          y="-330"
          width="560"
          height="560"
          rx="124"
          transform="rotate(20 40 0)"
          fill="url(#auth-nghieng)"
        />
      </svg>
      <div className="auth-bg-sang" aria-hidden="true" />
      <div className="auth-bg-cam" aria-hidden="true" />
      <div className="auth-bg-luoi" aria-hidden="true">
        <svg aria-hidden="true" width="100%" height="100%">
          <defs>
            <pattern
              id="auth-o-kho"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
              x="-14"
              y="-10"
            >
              <rect
                x="9"
                y="9"
                width="82"
                height="82"
                rx="20"
                fill="none"
                stroke="#0560A6"
                strokeOpacity="0.14"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-o-kho)" />
        </svg>
      </div>

      <div className="auth-hinh">
        {SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.img}
            alt={s.alt}
            className={`auth-slide${i === slide ? ' on' : ''}`}
          />
        ))}
      </div>
      <div className="auth-bong" aria-hidden="true" />
      <div className="auth-slide-chu">
        <h2>{SLIDES[slide].tieuDe}</h2>
        <p>{SLIDES[slide].moTa}</p>
      </div>
      <div className="auth-day">
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
          <ChonNgonNgu />
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
          <ChonNgonNgu />
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
