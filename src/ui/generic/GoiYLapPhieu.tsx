import { useNavigate } from 'react-router-dom'
import type { Row } from '../../modules/types'
import { money } from '../format'
import { ThongBao } from '../ThongBao'

/** Tạo quỹ từ trang chủ, lưu xong gợi ý lập phiếu thu, phiếu chi ngay: quỹ tiền mặt mở thu, chi tiền mặt; quỹ ngân hàng mở báo có, UNC (T250) */
export function GoiYLapPhieu({ quy, onDong }: { quy: Row; onDong: () => void }) {
  const nav = useNavigate()
  const tienMat = quy.loai !== 'Ngân hàng'
  const mo = (loai: string) => { onDong(); nav(`/app/tien/2-1-1/moi?loai=${loai}`, { state: { tuTrangChu: true, goiYVeTrangChu: true } }) }
  // Ô Tài khoản trong bản vẽ bỏ: danh mục quỹ chưa có trường tài khoản (T889)
  return (
    <ThongBao loai="xong" nhan="Đã tạo" tieuDe={`Quỹ ${String(quy.ten ?? '')}`}
      duKien={[
        { nhan: 'Mã quỹ', gt: String(quy.ma ?? '') },
        ...(quy.stk ? [{ nhan: 'Số tài khoản', gt: String(quy.stk) }] : []),
        ...(quy.soDu ? [{ nhan: 'Số dư đầu', gt: money(Number(quy.soDu)) }] : []),
      ]}
      nutThem={{ ten: 'Để sau', onClick: onDong }}
      nutPhu={{ ten: tienMat ? 'Lập phiếu chi' : 'Lập UNC', onClick: () => mo(tienMat ? 'chi' : 'unc') }}
      nut={{ ten: tienMat ? 'Lập phiếu thu' : 'Lập báo có', onClick: () => mo(tienMat ? 'thu' : 'bc') }}
      onDong={onDong}>
      <p className="tb-mota">Ghi khoản thu, chi đầu tiên vào quỹ này ngay?</p>
    </ThongBao>
  )
}
