import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ThaoTacMuc } from '../../app/thaoTacNhanh'
import { Icon } from '../Icon'

// Loại phiếu ngân hàng tương ứng với phiếu tiền mặt
const LOAI_NH: Record<string, string> = { thu: 'bc', chi: 'unc' }

/** Thao tác nhanh Thu tiền, Chi tiền ở trang chủ điện thoại: hỏi tiền mặt hay ngân hàng trước khi lập phiếu (T611, T634).
 *  Sheet trượt từ đáy (T634) */
export function useChonLoaiTien() {
  const nav = useNavigate()
  const [muc, setMuc] = useState<ThaoTacMuc | null>(null)

  // Thuộc tính gắn vào ô thao tác nhanh; data-tu-mo để vùng trang chủ không tự chuyển màn (tuTrangChu.ts)
  const bam = (item: ThaoTacMuc) => !LOAI_NH[item.id] || item.khoa ? {} : {
    'data-tu-mo': '',
    onClick: (e: MouseEvent<HTMLElement>) => {
      e.preventDefault()
      setMuc(m => m?.id === item.id ? null : item)
    },
  }

  const di = (nh: boolean) => {
    if (!muc) return
    setMuc(null)
    nav(nh ? muc.to.replace(`loai=${muc.id}`, `loai=${LOAI_NH[muc.id]}`) : muc.to, { state: { tuTrangChu: true } })
  }

  const laThu = muc?.id === 'thu'
  const sheet = !muc ? null : (
    <div className="m-tam-overlay" onClick={() => setMuc(null)}>
      <div className="m-tam-hop m-t634-sheet" onClick={e => e.stopPropagation()}>
        <div className="m-tam-keo" />
        <div className="m-tam-dau">
          <h2 className="m-tam-tieu">{laThu ? 'Thu tiền' : 'Chi tiền'}</h2>
          <button type="button" className="m-tam-dong-btn" onClick={() => setMuc(null)} aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>
        <div className="m-t634-ds">
          <button type="button" className="m-t634-item" onClick={() => di(false)}>
            <div className="m-t634-ic-wrap">
              <Icon n={laThu ? 'cashin' : 'cashout'} className="ic lg" />
            </div>
            <span className="m-t634-ten">{laThu ? 'Thu tiền mặt' : 'Chi tiền mặt'}</span>
          </button>
          <button type="button" className="m-t634-item" onClick={() => di(true)}>
            <div className="m-t634-ic-wrap">
              <Icon n="bank" className="ic lg" />
            </div>
            <span className="m-t634-ten">{laThu ? 'Thu ngân hàng' : 'Chi ngân hàng'}</span>
          </button>
        </div>
      </div>
    </div>
  )

  return { bam, sheet }
}
