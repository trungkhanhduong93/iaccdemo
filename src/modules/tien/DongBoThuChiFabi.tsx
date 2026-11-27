// Tiện ích đồng bộ thu chi FABi: nút Đồng bộ lại nằm trên thanh công cụ bảng của mọi tab Thu chi, cạnh Excel; nhãn chưa đồng bộ vẫn bên phải thanh tab (T883).
// Nhãn vàng báo còn bao nhiêu phiếu FABi chưa vào sổ, bấm mở hộp liệt kê từng phiếu, cột Lý do kèm link xử lý. PhuongXT chốt hai lý do: PTTT chưa map quỹ, kỳ đã khoá sổ.
// data-hd: chỗ khoanh, chỗ tự bấm của Hướng dẫn nhanh Thu chi; nút Đóng hộp lý do mang hdbDong để tour tự đóng như hộp Đồng bộ (T706).
// Nút Đồng bộ lại mở hộp Đồng bộ thu chi từ FABi chọn kỳ, cửa hàng rồi lấy phiếu về, báo bao nhiêu phiếu vừa vào sổ, bao nhiêu còn chờ (T883).
// Đơn vị vừa Kết nối FABi mà phiếu còn đổ về thì báo đang đồng bộ x / y phiếu như Trang chủ (T687).
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/session'
import { Icon } from '../../ui/Icon'
import { HopDongBo } from '../../ui/HopDongBo'
import { NutDongBo } from '../../ui/CongCuDs'
import { dmy, locSo } from '../../ui/format'
import { CUA_HANG } from '../../data/mock'
import { phanDaVe, useDongBoFabi } from '../home/NhacDonViMoi'
import { batDongBoThuChi, phieuThuChiFabi, type PhieuChoFabi } from './dong-bo-fabi'

const tien = (n: number) => n.toLocaleString(locSo())
/** Ngày dd/mm/yyyy của phiếu thành Date để so với kỳ chọn */
const ngayCua = (n: string) => { const [d, m, y] = n.split('/').map(Number); return new Date(y, m - 1, d) }
/** Giờ đồng bộ theo ngày làm việc của bản mẫu (07/10/2026), giờ phút theo đồng hồ máy */
const gioNay = () => { const d = new Date(), p = (n: number) => String(n).padStart(2, '0'); return `${p(d.getHours())}:${p(d.getMinutes())} 07/10/2026` }

// Lần đồng bộ trước: lúc nào, còn bao nhiêu phiếu chờ; đồng bộ tiếp thì phiếu đã map quỹ, đã mở khoá sổ từ lần trước vào sổ.
// Dùng chung giữa nhãn trên thanh tab và nút trên thanh công cụ bảng nên giữ ở cấp module (T883)
type LanDongBo = { luc: string; cho: number }
let storeLan: LanDongBo | null = null
const lanListeners = new Set<() => void>()

function getLan(tong: number): LanDongBo {
  if (!storeLan) storeLan = { luc: gioNay(), cho: tong }
  return storeLan
}

function setLan(next: LanDongBo) {
  storeLan = next
  lanListeners.forEach(fn => fn())
}

function useLan(tong: number): [LanDongBo, (next: LanDongBo) => void] {
  const [lan, setLocal] = useState(() => getLan(tong))
  useEffect(() => {
    getLan(tong)
    const onCapNhat = () => { if (storeLan) setLocal(storeLan) }
    lanListeners.add(onCapNhat)
    return () => { lanListeners.delete(onCapNhat) }
  }, [tong])
  return [lan, setLan]
}

export function NutDongBoThuChiFabi() {
  const { s } = useSession()
  const db = useDongBoFabi()
  const [hop, setHop] = useState(false)
  const { cho, khoa } = phieuThuChiFabi(s)
  const tong = cho.length + khoa.length
  const [lan, capNhatLan] = useLan(tong)
  const ketQuaRef = useRef<{ vao: number; conCho: number }>({ vao: 0, conCho: 0 })

  if (db) return null

  return (
    <>
      <NutDongBo ten="FABi" tip="Đồng bộ thu chi từ FABi" onDongBo={() => setHop(true)} />
      {/* Chọn sẵn cửa hàng đang bật tự động đồng bộ ở Danh mục Cửa hàng (T264) */}
      {hop && (
        <HopDongBo
          tieuDe="Đồng bộ thu chi từ FABi"
          phu="Chọn kỳ và cửa hàng cần lấy phiếu thu, chi lập trên máy POS FABi về sổ quỹ."
          nhanDs="Cửa hàng đồng bộ"
          ds={CUA_HANG.map(c => ({ ma: c.id, ten: c.ten, phu: batDongBoThuChi(s, c.id) ? 'Đang tự động đồng bộ' : 'Đã tắt tự động đồng bộ' }))}
          chonSan={CUA_HANG.filter(c => batDongBoThuChi(s, c.id)).map(c => c.id)}
          nhanLamLai="Đồng bộ lại phiếu đã có"
          ghiChuLamLai="Lấy lại phiếu đã vào sổ trong kỳ, không nhân đôi"
          nutChinh="Đồng bộ ngay"
          donVi="phiếu thu chi"
          onDong={() => setHop(false)}
          onDongBo={({ tu, den, chon }) => {
            const tenChon = CUA_HANG.filter(c => chon.includes(c.id)).map(c => c.ten)
            const conCho = [...cho, ...khoa].filter(p => tenChon.includes(p.cn) && ngayCua(p.ngay) >= tu && ngayCua(p.ngay) <= den).length
            const vao = Math.max(0, lan.cho - tong)
            ketQuaRef.current = { vao, conCho }
            // Chọn đúng 1 cửa hàng là ca lỗi giả, không ghi lần đồng bộ cuối (T950)
            if (chon.length > 1) capNhatLan({ luc: gioNay(), cho: tong })
          }}
          taoKetQua={({ tu, den, chon }) => {
            const khoang = `${dmy(tu)} – ${dmy(den)}`
            if (chon.length === 1) {
              const tenCh = CUA_HANG.find(c => c.id === chon[0])?.ten ?? chon[0]
              return {
                loai: 'loi',
                tieuDe: 'Chưa đồng bộ được thu chi FABi',
                dong: 'FABi không phản hồi.',
                thongTin: [
                  ['Cửa hàng', tenCh],
                  ['Khoảng thời gian', khoang],
                ],
              }
            }
            const { vao, conCho } = ketQuaRef.current
            return {
              loai: 'ok',
              tieuDe: 'Đã đồng bộ thu chi FABi',
              dong: `Đã đồng bộ thu chi từ FABi ${chon.length} cửa hàng, ${dmy(tu)} đến ${dmy(den)}: ${vao ? `${vao} phiếu vào sổ` : 'không có phiếu mới vào sổ'}${conCho ? `, còn ${conCho} phiếu chờ` : ''}.`,
              thongTin: [
                ['Cửa hàng', `${chon.length} cửa hàng`],
                ['Khoảng thời gian', khoang],
              ],
            }
          }}
        />
      )}
    </>
  )
}

export function DongBoThuChiFabi() {
  const { s } = useSession()
  const db = useDongBoFabi()
  const [mo, setMo] = useState(false)
  const { cho, khoa } = phieuThuChiFabi(s)
  const tong = cho.length + khoa.length
  const [lan] = useLan(tong)

  return (
    <div className="dbtc-tab">
      {db
        ? <span className="dbtc-trang" role="status"><Icon n="refresh" className="ic sm db-quay" />Đang đồng bộ {Math.round(db.tc * phanDaVe(db.t))} / {db.tc} phiếu thu chi</span>
        : tong
          ? <button type="button" className="dbtc-cho" data-hd="chuaDb" title={`Lần đồng bộ cuối ${lan.luc}. Bấm xem lý do từng phiếu`} onClick={() => setMo(true)}>
              <Icon n="alert" className="ic sm" /><b>{tong}</b> phiếu thu chi chưa đồng bộ
            </button>
          : <span className="dbtc-trang xong" role="status" title={`Lần đồng bộ cuối ${lan.luc}`}><Icon n="check" className="ic sm" />Đã đồng bộ hết</span>}
      {mo && <HopPhieuCho cho={cho} khoa={khoa} goiS={s.goi !== 'PR'} onDong={() => setMo(false)} />}
    </div>
  )
}

/** Một bảng mọi phiếu chờ, cột Nguyên nhân kèm link xử lý (PhuongXT 30/10/2026: bỏ chia nhóm, lý do để dạng cột).
 *  Cột Mã phiếu FABi, Lý do nghiệp vụ (thu là Thu khác, chi là Chi phí khác như T699) thêm ở T706 */
function HopPhieuCho({ cho, khoa, goiS, onDong }: { cho: PhieuChoFabi[]; khoa: PhieuChoFabi[]; goiS: boolean; onDong: () => void }) {
  const ds = [...cho, ...khoa]
  const xuLy = { map: { ly: 'Chưa map quỹ', nhan: 'Map quỹ', to: '/app/danh-muc/1-12' }, khoa: { ly: 'Kỳ đã khoá sổ', nhan: 'Mở khoá sổ', to: goiS ? '/app/he-thong/khoa-so' : '/app/tong-hop/10-1-6' } }
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop dbtc-hop" role="dialog" aria-modal="true" aria-label="Phiếu thu, chi FABi chưa đồng bộ">
        <div className="ds-hop-dau"><b>Phiếu thu, chi FABi chưa đồng bộ ({ds.length})</b><span className="grow" /><NutDongBoThuChiFabi />
          <button type="button" className="btn ghost sm" data-hd="hdbDong" title="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button></div>
        <div className="dbtc-than" data-hd="hdbLyDo">
          <table className="dbtc-bang">
            <thead><tr><th>Mã phiếu FABi</th><th>Ngày</th><th>Cửa hàng</th><th>Loại</th><th>PTTT</th><th>Diễn giải</th><th>Lý do</th><th className="r">Số tiền</th><th>Nguyên nhân</th></tr></thead>
            <tbody>
              {ds.map((p, i) => (
                <tr key={i}>
                  <td className="code">{p.ma}</td>
                  <td>{p.ngay} <small className="muted">{p.gio}</small></td>
                  <td>{p.cn}</td>
                  <td><span className={`chip ${p.kieu === 'thu' ? 'ok' : 'warn'}`}>{p.kieu === 'thu' ? 'Thu' : 'Chi'}</span></td>
                  <td>{p.pttt}</td>
                  <td>{p.dienGiai}</td>
                  <td>{p.kieu === 'thu' ? 'Thu khác' : 'Chi phí khác'}</td>
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
