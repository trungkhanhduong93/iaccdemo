// Form chứng từ mở toàn màn hình như AMIS: che sidebar và thanh tab, chân form có Huỷ, Lưu, Lưu và thêm. Esc để đóng.
import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { moneyD } from './format'

/** Đóng form: quay về màn trước trong app; mở thẳng bằng đường dẫn thì về danh sách */
export function useDong(ve: string) {
  const nav = useNavigate()
  const loc = useLocation()
  return () => (loc.key !== 'default' ? nav(-1) : nav(ve))
}

/** trai: nút đứng trước tiêu đề (vd lịch sử); phai: nút đứng trước tổng tiền (vd phím tắt) */
export function FormToanMan({ icon, title, meta, loai, tong, trai, phai, onClose, foot, children }: {
  icon: string; title: ReactNode; meta?: ReactNode; loai?: ReactNode; tong?: number; trai?: ReactNode; phai?: ReactNode
  onClose: () => void; foot: ReactNode; children: ReactNode
}) {
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('.overlay')) onClose() }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [onClose])

  return (
    <div className="fsf" role="dialog" aria-modal="true">
      <header className="fsf-h">
        <span className="fsf-ic"><Icon n={icon} /></span>
        {trai}
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          {meta && <div className="ph-meta">{meta}</div>}
        </div>
        {loai}
        <span className="grow" />
        {phai}
        {tong !== undefined && <div className="fsf-tong"><small>Tổng tiền</small><b>{moneyD(tong)}</b></div>}
        <button className="icon-btn" title="Đóng (Esc)" onClick={onClose}><Icon n="x" /></button>
      </header>
      <div className="fsf-b">{children}</div>
      <footer className="fsf-f">{foot}</footer>
    </div>
  )
}
