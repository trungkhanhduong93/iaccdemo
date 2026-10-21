import { useRef, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ThaoTacMuc } from '../../app/thaoTacNhanh'
import { MenuItem, Popover } from '../Dropdown'

// Loại phiếu ngân hàng tương ứng với phiếu tiền mặt
const LOAI_NH: Record<string, string> = { thu: 'bc', chi: 'unc' }

/** Thao tác nhanh Thu tiền, Chi tiền ở trang chủ điện thoại: hỏi tiền mặt hay ngân hàng trước khi lập phiếu (T611).
 *  Menu nổi dưới ô thao tác, giống nút Lập phiếu thu ở Tất cả quỹ (NutLapPhieuQuy) */
export function useChonLoaiTien() {
  const nav = useNavigate()
  const [muc, setMuc] = useState<ThaoTacMuc | null>(null)
  const oBam = useRef<HTMLElement | null>(null)

  // Thuộc tính gắn vào ô thao tác nhanh; data-tu-mo để vùng trang chủ không tự chuyển màn (tuTrangChu.ts)
  const bam = (item: ThaoTacMuc) => !LOAI_NH[item.id] || item.khoa ? {} : {
    'data-tu-mo': '',
    onClick: (e: MouseEvent<HTMLElement>) => {
      e.preventDefault()
      oBam.current = e.currentTarget
      setMuc(m => m?.id === item.id ? null : item)
    },
  }

  const di = (nh: boolean) => {
    if (!muc) return
    setMuc(null)
    nav(nh ? muc.to.replace(`loai=${muc.id}`, `loai=${LOAI_NH[muc.id]}`) : muc.to, { state: { tuTrangChu: true } })
  }

  const laThu = muc?.id === 'thu'
  const sheet = (
    <Popover anchor={oBam} open={!!muc} onClose={() => setMuc(null)} className="pop-lap-phieu" width={220}>
      <MenuItem icon={laThu ? 'cashin' : 'cashout'} onClick={() => di(false)}>{laThu ? 'Thu tiền mặt' : 'Chi tiền mặt'}</MenuItem>
      <MenuItem icon="bank" onClick={() => di(true)}>{laThu ? 'Thu ngân hàng' : 'Chi ngân hàng'}</MenuItem>
    </Popover>
  )

  return { bam, sheet }
}
