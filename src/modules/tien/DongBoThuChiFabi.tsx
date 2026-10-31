// Tiện ích đồng bộ thu chi FABi (T691, T697), nằm ở thanh công cụ danh sách Thu chi cạnh nút Excel (T698).
// Nút Đồng bộ mở hộp Đồng bộ thu chi từ FABi chọn kỳ, loại phiếu (phiếu thu, phiếu chi), cửa hàng rồi lấy phiếu về.
// Đơn vị vừa Kết nối FABi mà phiếu còn đổ về thì báo đang đồng bộ x / y phiếu như Trang chủ (T687).
import { useState } from 'react'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { HopDongBo } from '../../ui/HopDongBo'
import { NutDongBo } from '../../ui/CongCuDs'
import { dmy } from '../../ui/format'
import { CUA_HANG } from '../../data/mock'
import { phanDaVe, useDongBoFabi } from '../home/NhacDonViMoi'
import { batDongBoThuChi } from './dong-bo-fabi'

export function DongBoThuChiFabi({ quy = 'tm' }: { quy?: 'tm' | 'nh' }) {
  const { s, toast } = useSession()
  const db = useDongBoFabi()
  const [hop, setHop] = useState(false)
  const laNh = quy === 'nh'
  // Nút vuông cạnh nút Excel như Xuất bán POS (T698)
  const nutDongBo = <NutDongBo ten="FABi" onDongBo={() => setHop(true)} />
  // Chọn sẵn cửa hàng đang bật tự động đồng bộ ở Danh mục Cửa hàng (T264)
  const hopDongBo = hop && (
    <HopDongBo
      tieuDe="Đồng bộ thu chi từ FABi"
      phu={laNh ? 'Chọn kỳ, cửa hàng và loại phiếu cần lấy từ máy POS FABi về sổ tiền gửi ngân hàng.' : 'Chọn kỳ, cửa hàng và loại phiếu cần lấy từ máy POS FABi về sổ quỹ tiền mặt.'}
      nhanDs="Cửa hàng đồng bộ"
      ds={CUA_HANG.map(c => ({ ma: c.id, ten: c.ten, phu: batDongBoThuChi(s, c.id) ? 'Đang tự động đồng bộ' : 'Đã tắt tự động đồng bộ' }))}
      chonSan={CUA_HANG.filter(c => batDongBoThuChi(s, c.id)).map(c => c.id)}
      coLoaiPhieu
      nhanLoaiThu={laNh ? 'Thu ngân hàng' : 'Thu tiền mặt'}
      nhanLoaiChi={laNh ? 'Chi ngân hàng' : 'Chi tiền mặt'}
      nhanLamLai="Đồng bộ lại phiếu đã có"
      ghiChuLamLai="Lấy lại phiếu đã vào sổ trong kỳ, không nhân đôi"
      nutChinh="Đồng bộ ngay"
      onDong={() => setHop(false)}
      onDongBo={({ tu, den, chon, lamLai, loaiThu, loaiChi }) => {
        setHop(false)
        const duoi = laNh ? 'ngân hàng' : 'tiền mặt'
        const loai = loaiThu && loaiChi ? `phiếu thu, chi ${duoi}` : loaiThu ? `phiếu thu ${duoi}` : `phiếu chi ${duoi}`
        toast(`Đang đồng bộ ${loai} ${chon.length} cửa hàng, ${dmy(tu)} đến ${dmy(den)}${lamLai ? ', lấy lại cả chứng từ đã có' : ''}`)
      }}
    />
  )

  return (
    <>
      {db && (
        <span className="dbtc-trang" role="status">
          <Icon n="refresh" className="ic sm db-quay" />
          Đang đồng bộ {Math.round(db.tc * phanDaVe(db.t))} / {db.tc} phiếu thu chi
        </span>
      )}
      {!db && nutDongBo}
      {hopDongBo}
    </>
  )
}
