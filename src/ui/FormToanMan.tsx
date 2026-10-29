// Form chứng từ mở toàn màn hình như AMIS: che sidebar và thanh tab, chân form có Huỷ, Lưu, Lưu và thêm. Esc để đóng.
import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { moneyD } from './format'
import { ganForm } from './huongDanForm'

/** Đóng form: quay về màn trước trong app; mở thẳng bằng đường dẫn thì về danh sách */
export function useDong(ve: string) {
  const nav = useNavigate()
  const loc = useLocation()
  return () => (loc.key !== 'default' ? nav(-1) : nav(ve))
}

/** trai: nút đứng trước tiêu đề (vd lịch sử); phai: nút đứng trước tổng tiền (vd phím tắt); tinh: bỏ hiệu ứng mở khi chuyển Trước/Sau */
export function FormToanMan({ icon, iconNode, iconNet, xem, title, meta, loai, giua, day, tong, trai, phai, tinh, onClose, foot, footClass, children }: {
  icon?: string; iconNode?: ReactNode; title: ReactNode; meta?: ReactNode; loai?: ReactNode; tong?: number; trai?: ReactNode; phai?: ReactNode; tinh?: boolean
  iconNet?: boolean  // icon nét mảnh như phiếu thu chi, dùng cho form phiếu chứng từ (T517)
  xem?: boolean      // lúc chỉ xem thì ô nhập nền trắng, chữ đậm (T518)
  giua?: ReactNode   // trạng thái phiếu ở chính giữa đầu form (T49)
  day?: ReactNode    // dải cố định ngay trên thanh nút, vd Tổng tiền (T49)
  footClass?: string
  onClose: () => void; foot: ReactNode; children: ReactNode
}) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('.overlay')) onClose() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onClose])
  // dải bước Hướng dẫn nhanh đang mở thì nổi lên form, ngay dưới thanh đầu form (T676)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => ganForm(ref.current!), [])

  return (
    <div ref={ref} className={`fsf${tinh ? ' fsf-tinh' : ''}${xem ? ' fsf-xem' : ''}`} role="dialog" aria-modal="true">
      <header className="fsf-h">
        {iconNode ? (
          iconNode
        ) : (
          <span className="fsf-ic">{icon && <Icon n={icon} kieu={iconNet ? 'net' : undefined} />}</span>
        )}
        {trai}
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          {meta && <div className="ph-meta">{meta}</div>}
        </div>
        {loai}
        {giua && <div className="fsf-giua">{giua}</div>}
        <span className="grow" />
        {phai}
        {tong !== undefined && <div className="fsf-tong"><small>Tổng tiền</small><b>{moneyD(tong)}</b></div>}
        <button className="icon-btn" title="Đóng (Esc)" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 4.5L9 9M9 9L4.5 13.5M9 9L4.5 4.5M9 9L13.5 13.5" />
          </svg>
        </button>
      </header>
      <div className="fsf-b">{children}</div>
      {day && <div className="fsf-day">{day}</div>}
      <footer className={`fsf-f${footClass ? ` ${footClass}` : ''}`}>{foot}</footer>
    </div>
  )
}
