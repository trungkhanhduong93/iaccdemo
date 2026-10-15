import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { Row } from '../../modules/types'
import { Icon } from '../Icon'
import { useDongEsc } from '../LocNangCao'

/** Tạo quỹ từ trang chủ, lưu xong gợi ý lập phiếu thu, phiếu chi ngay: quỹ tiền mặt mở thu, chi tiền mặt; quỹ ngân hàng mở báo có, UNC (T250) */
export function GoiYLapPhieu({ quy, onDong }: { quy: Row; onDong: () => void }) {
  const nav = useNavigate()
  useDongEsc(onDong)
  const tienMat = quy.loai !== 'Ngân hàng'
  const mo = (loai: string) => { onDong(); nav(`/app/tien/2-1-1/moi?loai=${loai}`, { state: { tuTrangChu: true, goiYVeTrangChu: true } }) }
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop ds-hop-nho goiy-lap-phieu" role="dialog" aria-modal="true" aria-label="Đã tạo quỹ">
        <div className="ds-hop-dau"><Icon n="check" className="ic sm" /><b>Đã tạo quỹ {String(quy.ten ?? '')}</b></div>
        <p className="ds-hop-than">Bạn có muốn ghi khoản thu, chi đầu tiên vào quỹ này ngay không?</p>
        <div className="goiy-lap-phieu-nut">
          <button type="button" className="btn" autoFocus onClick={() => mo(tienMat ? 'thu' : 'bc')}>
            <Icon n="plus" className="ic sm" />{tienMat ? 'Lập phiếu thu' : 'Lập báo có'}
          </button>
          <button type="button" className="btn" onClick={() => mo(tienMat ? 'chi' : 'unc')}>
            <Icon n="plus" className="ic sm" />{tienMat ? 'Lập phiếu chi' : 'Lập UNC'}
          </button>
        </div>
        <div className="ds-chan">
          <button type="button" className="btn" onClick={onDong}>Để sau</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
