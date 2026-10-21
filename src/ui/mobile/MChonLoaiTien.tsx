import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ThaoTacMuc } from '../../app/thaoTacNhanh'
import { MChon } from './MChon'

// Loại phiếu ngân hàng tương ứng với phiếu tiền mặt
const LOAI_NH: Record<string, string> = { thu: 'bc', chi: 'unc' }

/** Thao tác nhanh Thu tiền, Chi tiền ở trang chủ điện thoại: hỏi tiền mặt hay ngân hàng trước khi lập phiếu (T611) */
export function useChonLoaiTien() {
  const nav = useNavigate()
  const [muc, setMuc] = useState<ThaoTacMuc | null>(null)

  // Thuộc tính gắn vào ô thao tác nhanh; data-tu-mo để vùng trang chủ không tự chuyển màn (tuTrangChu.ts)
  const bam = (item: ThaoTacMuc) => !LOAI_NH[item.id] || item.khoa ? {} : {
    'data-tu-mo': '',
    onClick: (e: MouseEvent) => {
      e.preventDefault()
      setMuc(item)
    },
  }

  const laThu = muc?.id === 'thu'
  const sheet = (
    <MChon
      mo={!!muc}
      tieuDe={laThu ? 'Thu tiền vào' : 'Chi tiền từ'}
      ds={[
        { k: 'tm', ten: 'Tiền mặt', moTa: laThu ? 'Lập phiếu thu tiền mặt' : 'Lập phiếu chi tiền mặt' },
        { k: 'nh', ten: 'Tiền gửi ngân hàng', moTa: laThu ? 'Lập phiếu thu ngân hàng' : 'Lập phiếu chi ngân hàng' },
      ]}
      onChon={k => {
        if (!muc) return
        setMuc(null)
        nav(k === 'nh' ? muc.to.replace(`loai=${muc.id}`, `loai=${LOAI_NH[muc.id]}`) : muc.to, { state: { tuTrangChu: true } })
      }}
      onDong={() => setMuc(null)}
    />
  )

  return { bam, sheet }
}
