// Tiện ích đồng bộ thu chi FABi (T691, T697), nằm bên phải thanh tab phân hệ Thu chi.
// Nút Đồng bộ mở hộp Đồng bộ thu chi từ FABi chọn kỳ, loại phiếu (phiếu thu, phiếu chi), cửa hàng rồi lấy phiếu về.
// Đơn vị vừa Kết nối FABi mà phiếu còn đổ về thì báo đang đồng bộ x / y phiếu như Trang chủ (T687).
import { useState } from 'react'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { HopDongBo } from '../../ui/HopDongBo'
import { dmy } from '../../ui/format'
import { CUA_HANG } from '../../data/mock'
import { phanDaVe, useDongBoFabi } from '../home/NhacDonViMoi'
import { batDongBoThuChi } from './dong-bo-fabi'

export function DongBoThuChiFabi() {
  const { s, toast } = useSession()
  const db = useDongBoFabi()
  const [hop, setHop] = useState(false)
  const nutDongBo = (
    <button type="button" className="btn sm" title="Đồng bộ thu chi từ FABi" onClick={() => setHop(true)}>
      <Icon n="refresh" className="ic sm" />Đồng bộ
    </button>
  )
  // Chọn sẵn cửa hàng đang bật tự động đồng bộ ở Danh mục Cửa hàng (T264)
  const hopDongBo = hop && (
    <HopDongBo
      tieuDe="Đồng bộ thu chi từ FABi"
      phu="Chọn kỳ, cửa hàng và loại phiếu cần lấy từ máy POS FABi về sổ quỹ."
      nhanDs="Cửa hàng đồng bộ"
      ds={CUA_HANG.map(c => ({ ma: c.id, ten: c.ten, phu: batDongBoThuChi(s, c.id) ? 'Đang tự động đồng bộ' : 'Đã tắt tự động đồng bộ' }))}
      chonSan={CUA_HANG.filter(c => batDongBoThuChi(s, c.id)).map(c => c.id)}
      coLoaiPhieu
      nhanLamLai="Đồng bộ lại phiếu đã có"
      ghiChuLamLai="Lấy lại phiếu đã vào sổ trong kỳ, không nhân đôi"
      nutChinh="Đồng bộ ngay"
      onDong={() => setHop(false)}
      onDongBo={({ tu, den, chon, lamLai, loaiThu, loaiChi }) => {
        setHop(false)
        const loai = loaiThu && loaiChi ? 'phiếu thu, chi' : loaiThu ? 'phiếu thu' : 'phiếu chi'
        toast(`Đang đồng bộ ${loai} ${chon.length} cửa hàng, ${dmy(tu)} đến ${dmy(den)}${lamLai ? ', lấy lại cả chứng từ đã có' : ''}`)
      }}
    />
  )

  return (
    <div className="dbtc-tab">
      {db && (
        <span className="dbtc-trang" role="status">
          <Icon n="refresh" className="ic sm db-quay" />
          Đang đồng bộ {Math.round(db.tc * phanDaVe(db.t))} / {db.tc} phiếu thu chi
        </span>
      )}
      {!db && nutDongBo}
      {hopDongBo}
    </div>
  )
}
