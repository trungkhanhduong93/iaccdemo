// Tiện ích đồng bộ thu chi FABi (T691), nằm bên phải thanh tab phân hệ Thu chi để rõ là đồng bộ cả tiền mặt lẫn ngân hàng, không riêng tab nào (PhuongXT 30/10/2026).
// Nhãn vàng báo còn bao nhiêu phiếu FABi chưa vào sổ, bấm mở hộp liệt kê từng phiếu, cột Lý do kèm link xử lý. PhuongXT chốt hai lý do: PTTT chưa map quỹ, kỳ đã khoá sổ.
// Nút Đồng bộ mở hộp Đồng bộ thu chi từ FABi chọn kỳ, cửa hàng rồi lấy phiếu về, báo bao nhiêu phiếu vừa vào sổ, bao nhiêu còn chờ.
// Đơn vị vừa Kết nối FABi mà phiếu còn đổ về thì báo đang đồng bộ x / y phiếu như Trang chủ (T687).
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { HopDongBo } from '../../ui/HopDongBo'
import { dmy } from '../../ui/format'
import { CUA_HANG } from '../../data/mock'
import { phanDaVe, useDongBoFabi } from '../home/NhacDonViMoi'
import { batDongBoThuChi, phieuThuChiFabi, type PhieuChoFabi } from './dong-bo-fabi'

const tien = (n: number) => n.toLocaleString('vi-VN')
/** Ngày dd/mm/yyyy của phiếu thành Date để so với kỳ chọn */
const ngayCua = (n: string) => { const [d, m, y] = n.split('/').map(Number); return new Date(y, m - 1, d) }
/** Giờ đồng bộ theo ngày làm việc của bản mẫu (07/10/2026), giờ phút theo đồng hồ máy */
const gioNay = () => { const d = new Date(), p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())} 07/10/2026` }

export function DongBoThuChiFabi() {
  const { s, toast } = useSession()
  const db = useDongBoFabi()
  const [mo, setMo] = useState(false)
  const { cho, khoa } = phieuThuChiFabi(s)
  const tong = cho.length + khoa.length
  // Lần đồng bộ trước: lúc nào, còn bao nhiêu phiếu chờ; đồng bộ tiếp thì phiếu đã map quỹ, đã mở khoá sổ từ lần trước vào sổ
  const [lan, setLan] = useState(() => ({ luc: gioNay(), cho: tong }))
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
      phu="Chọn kỳ và cửa hàng cần lấy phiếu thu, chi lập trên máy POS FABi về sổ quỹ."
      nhanDs="Cửa hàng đồng bộ"
      ds={CUA_HANG.map(c => ({ ma: c.id, ten: c.ten, phu: batDongBoThuChi(s, c.id) ? 'Đang tự động đồng bộ' : 'Đã tắt tự động đồng bộ' }))}
      chonSan={CUA_HANG.filter(c => batDongBoThuChi(s, c.id)).map(c => c.id)}
      nhanLamLai="Đồng bộ lại phiếu đã có"
      ghiChuLamLai="Lấy lại phiếu đã vào sổ trong kỳ, không nhân đôi"
      nutChinh="Đồng bộ ngay"
      onDong={() => setHop(false)}
      onDongBo={({ tu, den, chon }) => {
        setHop(false)
        const tenChon = CUA_HANG.filter(c => chon.includes(c.id)).map(c => c.ten)
        const conCho = [...cho, ...khoa].filter(p => tenChon.includes(p.cn) && ngayCua(p.ngay) >= tu && ngayCua(p.ngay) <= den).length
        const vao = Math.max(0, lan.cho - tong)
        setLan({ luc: gioNay(), cho: tong })
        toast(`Đã đồng bộ thu chi từ FABi ${chon.length} cửa hàng, ${dmy(tu)} đến ${dmy(den)}: ${vao ? `${vao} phiếu vào sổ` : 'không có phiếu mới vào sổ'}${conCho ? `, còn ${conCho} phiếu chờ` : ''}`)
      }}
    />
  )

  return (
    <div className="dbtc-tab">
      {db
        ? <span className="dbtc-trang" role="status"><Icon n="refresh" className="ic sm db-quay" />Đang đồng bộ {Math.round(db.tc * phanDaVe(db.t))} / {db.tc} phiếu thu chi</span>
        : tong
          ? <button type="button" className="dbtc-cho" title={`Lần đồng bộ cuối ${lan.luc}. Bấm xem lý do từng phiếu`} onClick={() => setMo(true)}>
              <Icon n="alert" className="ic sm" /><b>{tong}</b> phiếu thu chi chưa đồng bộ
            </button>
          : <span className="dbtc-trang xong" role="status" title={`Lần đồng bộ cuối ${lan.luc}`}><Icon n="check" className="ic sm" />Đã đồng bộ hết</span>}
      {!db && nutDongBo}
      {hopDongBo}
      {mo && <HopPhieuCho cho={cho} khoa={khoa} goiS={s.goi === 'S'} nutDongBo={nutDongBo} onDong={() => setMo(false)} />}
    </div>
  )
}

/** Một bảng mọi phiếu chờ, cột Lý do kèm link xử lý (PhuongXT 30/10/2026: bỏ chia nhóm, lý do để dạng cột) */
function HopPhieuCho({ cho, khoa, goiS, nutDongBo, onDong }: { cho: PhieuChoFabi[]; khoa: PhieuChoFabi[]; goiS: boolean; nutDongBo: React.ReactNode; onDong: () => void }) {
  const ds = [...cho, ...khoa]
  const xuLy = { map: { ly: 'Chưa map quỹ', nhan: 'Map quỹ', to: '/app/danh-muc/1-12' }, khoa: { ly: 'Kỳ đã khoá sổ', nhan: 'Mở khoá sổ', to: goiS ? '/app/he-thong/khoa-so' : '/app/tong-hop/10-1-6' } }
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop dbtc-hop" role="dialog" aria-modal="true" aria-label="Phiếu thu, chi FABi chưa đồng bộ">
        <div className="ds-hop-dau"><b>Phiếu thu, chi FABi chưa đồng bộ ({ds.length})</b><span className="grow" />{nutDongBo}
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button></div>
        <div className="dbtc-than">
          <table className="dbtc-bang">
            <thead><tr><th>Ngày</th><th>Cửa hàng</th><th>Loại</th><th>PTTT</th><th>Diễn giải</th><th className="r">Số tiền</th><th>Lý do</th></tr></thead>
            <tbody>
              {ds.map((p, i) => (
                <tr key={i}>
                  <td>{p.ngay} <small className="muted">{p.gio}</small></td>
                  <td>{p.cn}</td>
                  <td><span className={`chip ${p.kieu === 'thu' ? 'ok' : 'warn'}`}>{p.kieu === 'thu' ? 'Thu' : 'Chi'}</span></td>
                  <td>{p.pttt}</td>
                  <td>{p.dienGiai}</td>
                  <td className="r">{tien(p.tien)}</td>
                  <td className="dbtc-ly">{xuLy[p.lyDo].ly} <Link to={xuLy[p.lyDo].to}>{xuLy[p.lyDo].nhan}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  )
}
