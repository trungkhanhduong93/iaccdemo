// Bộ nhận diện Logo vector cho 4 gói: Free, Standard, Plus, Pro (T119)
// Giữ nguyên dải màu nhận diện cốt lõi, phối gradient cao cấp, viền phản quang và biểu tượng vector riêng biệt
import type { CSSProperties } from 'react'
import { GOI, type Goi } from '../app/plan'

interface GoiLogoProps {
  g: Goi
  size?: number
  variant?: 'icon' | 'badge' | 'full'
  glow?: boolean
  className?: string
  style?: CSSProperties
}

/** Biểu tượng Vector SVG riêng cho từng gói */
export function GoiIconSvg({ g, size = 36, glow = false }: { g: Goi; size?: number; glow?: boolean }) {
  const gid = `gl-${g}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`gl-svg gl-${g.toLowerCase()}${glow ? ' gl-glow' : ''}`}
      aria-hidden="true"
    >
      <defs>
        {/* Gradient nền và viền từng gói */}
        {g === 'F' && (
          <>
            <linearGradient id={`${gid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="55%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id={`${gid}-st`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
          </>
        )}
        {g === 'S' && (
          <>
            <linearGradient id={`${gid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b5e56" />
              <stop offset="50%" stopColor="#0f8f84" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
            <linearGradient id={`${gid}-st`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
            </linearGradient>
          </>
        )}
        {g === 'PL' && (
          <>
            <linearGradient id={`${gid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f4ba3" />
              <stop offset="50%" stopColor="#1b6fe0" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id={`${gid}-st`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </>
        )}
        {g === 'PR' && (
          <>
            <linearGradient id={`${gid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#784d0b" />
              <stop offset="50%" stopColor="#b1852b" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id={`${gid}-st`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.22" />
            </linearGradient>
          </>
        )}
        {/* Bóng đổ nhẹ cho glyph bên trong */}
        <filter id={`${gid}-sh`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Khung huy hiệu squircle bo mềm với gradient và viền specular ánh gương */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12"
        fill={`url(#${gid}-bg)`}
        stroke={`url(#${gid}-st)`}
        strokeWidth="1.5"
      />

      {/* Biểu tượng đặc trưng theo từng gói */}
      {g === 'F' && (
        <g filter={`url(#${gid}-sh)`}>
          {/* Mầm vươn lên / Cánh lá thanh khiết — tượng trưng cho khởi đầu tinh gọn, 0 đ */}
          <path
            d={
              "M24 13 C18 16 15 22.5 16.5 28.5 " +
              "C17.8 33 21.5 35.5 24 35.5 " +
              "C24 29 24 21 24 13 Z"
            }
            fill="#ffffff"
            fillOpacity="0.96"
          />
          <path
            d={
              "M24 20 C29 20 33 23 33 27.5 " +
              "C33 31.5 29.5 34.5 24.8 35.5 " +
              "C24.8 30 24.5 24 24 20 Z"
            }
            fill="#ffffff"
            fillOpacity="0.75"
          />
          <circle cx="24" cy="34.5" r="1.5" fill="#ffffff" />
        </g>
      )}

      {g === 'S' && (
        <g filter={`url(#${gid}-sh)`}>
          {/* Chiếc khiên chuẩn hoá 2 nửa vát cạnh kèm checkmark — chuẩn mực kế toán DN siêu nhỏ */}
          <path
            d="M24 12 L33 15.5 V23.5 C33 29.5 29.2 34.5 24 36.5 V12 Z"
            fill="#ffffff"
            fillOpacity="0.95"
          />
          <path
            d="M24 12 L15 15.5 V23.5 C15 29.5 18.8 34.5 24 36.5 V12 Z"
            fill="#ffffff"
            fillOpacity="0.75"
          />
          <path
            d="M20.5 23.5 L23 26 L27.5 21"
            stroke="#0b5e56"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      )}

      {g === 'PL' && (
        <g filter={`url(#${gid}-sh)`}>
          {/* Ngôi sao tăng trưởng 4 cánh kết hợp dấu cộng — bứt phá đa điểm bán, Nợ/Có chuyên sâu */}
          <path
            d={
              "M24 11 C24 17 20 21 14 24 " +
              "C20 27 24 31 24 37 " +
              "C24 31 28 27 34 24 " +
              "C28 21 24 17 24 11 Z"
            }
            fill="#ffffff"
            fillOpacity="0.96"
          />
          <circle cx="24" cy="24" r="3.2" fill="#38bdf8" />
          <circle cx="33.5" cy="14.5" r="1.8" fill="#ffffff" fillOpacity="0.85" />
          <circle cx="14.5" cy="33.5" r="1.5" fill="#ffffff" fillOpacity="0.7" />
        </g>
      )}

      {g === 'PR' && (
        <g filter={`url(#${gid}-sh)`}>
          {/* Vương miện kim cương 5 đỉnh hoàng gia — đỉnh cao chuỗi lớn không giới hạn */}
          <path
            d="M14 30 L16 19 L21.5 24 L24 15 L26.5 24 L32 19 L34 30 Z"
            fill="#ffffff"
            fillOpacity="0.96"
          />
          <rect x="14" y="32" width="20" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.96" />
          <circle cx="24" cy="14" r="1.8" fill="#fef08a" />
          <circle cx="16" cy="18" r="1.4" fill="#fef08a" />
          <circle cx="32" cy="18" r="1.4" fill="#fef08a" />
          {/* Vát cạnh đa diện tăng chiều sâu kim hoàn */}
          <polygon points="24,18 21.5,24 26.5,24" fill="#b45309" fillOpacity="0.32" />
          <polygon points="16,21 14,30 20,30 21.5,24" fill="#78350f" fillOpacity="0.22" />
          <polygon points="32,21 34,30 28,30 26.5,24" fill="#78350f" fillOpacity="0.22" />
        </g>
      )}
    </svg>
  )
}

/** Component Logo gói linh hoạt: chỉ icon, badge có chữ, hoặc khối đầy đủ */
export function GoiLogo({ g, size = 36, variant = 'icon', glow = false, className = '', style }: GoiLogoProps) {
  const p = GOI[g]
  if (!p) return null

  if (variant === 'badge') {
    return (
      <span className={`gl-badge gl-b-${g.toLowerCase()} ${className}`} style={style}>
        <GoiIconSvg g={g} size={Math.round(size * 0.72)} glow={glow} />
        <span className="gl-badge-ten">{p.ten}</span>
      </span>
    )
  }

  if (variant === 'full') {
    return (
      <div className={`gl-full gl-f-${g.toLowerCase()} ${className}`} style={style}>
        <GoiIconSvg g={g} size={size} glow={glow} />
        <div className="gl-full-info">
          <b className="gl-full-ten">{p.ten}</b>
          <span className="gl-full-mota">{p.mota}</span>
        </div>
      </div>
    )
  }

  return (
    <span className={`gl-wrap ${className}`} style={{ display: 'inline-flex', ...style }}>
      <GoiIconSvg g={g} size={size} glow={glow} />
    </span>
  )
}
