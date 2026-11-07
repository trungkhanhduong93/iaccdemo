// Xuất hoá đơn điện tử từ chứng từ bán hàng lập tay gói Plus (T763): thiết lập ở Cấu hình kế toán, popup xem trước rồi phát hành
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { Row } from '../types'
import { gtgtTyLe, type Session } from '../../app/session'
import { CUA_HANG, HOM_NAY, KHACH } from '../../data/mock'
import { Select } from '../../ui/Dropdown'
import { Note } from '../../ui/Page'
import { dmy, money } from '../../ui/format'
import { useDongEsc } from '../../ui/LocNangCao'
import { suaPhieu } from '../../ui/generic/daXoa'

/** Nhà cung cấp hoá đơn điện tử kết nối được (dữ liệu giả, chưa nối thật) */
export const NCC_HDDT = ['VNPT Invoice', 'Viettel S-Invoice', 'MISA meInvoice', 'BKAV eHoadon', 'EasyInvoice']

/** Thiết lập xuất hoá đơn điện tử của một đơn vị */
export interface CauHinhHddt {
  bat: boolean
  ncc: string
  tk: string
  mk: string
  daKetNoi: boolean
  kyHieu: Record<string, string>       // ký hiệu 6 ký tự theo cửa hàng, vd C26TAA; mẫu số 1 hoặc 2 theo phương pháp thuế
  guiEmail: boolean
}

/** Ký hiệu mặc định cửa hàng thứ i: C (có mã của cơ quan thuế) + 2 số cuối năm + T + AA, AB, AC… */
const kyHieuMacDinh = (i: number) => `C${String(HOM_NAY.getFullYear()).slice(2)}T${String.fromCharCode(65 + Math.floor(i / 26))}${String.fromCharCode(65 + (i % 26))}`

export function cauHinhHddt(s: Session): CauHinhHddt {
  const da = s.hddt?.[s.donVi]
  const goc: CauHinhHddt = { bat: false, ncc: NCC_HDDT[0], tk: '', mk: '', daKetNoi: false, kyHieu: {}, guiEmail: true }
  const ch = { ...goc, ...da }
  return { ...ch, kyHieu: Object.fromEntries(CUA_HANG.map((c, i) => [c.id, ch.kyHieu[c.id] ?? kyHieuMacDinh(i)])) }
}

/** Mẫu số theo phương pháp thuế: khấu trừ dùng hoá đơn GTGT (1), tính theo % doanh thu dùng hoá đơn bán hàng (2) */
export const mauSoHd = (s: Session) => (gtgtTyLe(s) ? '2' : '1')
export const tenLoaiHd = (s: Session) => (gtgtTyLe(s) ? 'Hoá đơn bán hàng' : 'Hoá đơn giá trị gia tăng')

const KY_HIEU_DUNG = /^C\d{2}[TDLMNBGHX][A-Z]{2}$/
/** Lỗi thiết lập trước khi lưu, không lỗi trả null */
export function loiHddt(h: CauHinhHddt): string | null {
  if (!h.bat) return null
  if (!h.tk.trim() || !h.mk) return 'Nhập tài khoản, mật khẩu kết nối hoá đơn điện tử'
  for (const c of CUA_HANG) {
    const k = h.kyHieu[c.id] ?? ''
    if (!KY_HIEU_DUNG.test(k)) return `Ký hiệu hoá đơn của ${c.ten} chưa đúng: 6 ký tự, vd ${kyHieuMacDinh(0)}`
  }
  return null
}

/** Thẻ Hoá đơn điện tử ở Cấu hình kế toán */
export function TheCauHinhHddt({ s, h, dat, toast }: { s: Session; h: CauHinhHddt; dat: (h: CauHinhHddt) => void; toast: (m: string) => void }) {
  const kiemTra = () => {
    if (!h.tk.trim() || !h.mk) { toast('Nhập tài khoản, mật khẩu trước khi kiểm tra kết nối'); return }
    dat({ ...h, daKetNoi: true }); toast(`Kết nối ${h.ncc} thành công`)
  }
  return (
    <div className="ch-hd" data-hd="hddt">
      <label className="ch-gv-bat"><input type="checkbox" className="bat-tat" checked={h.bat} onChange={e => dat({ ...h, bat: e.target.checked })} />
        Xuất hoá đơn điện tử từ chứng từ bán hàng</label>
      {h.bat && <>
        {/* Lưới 2 cột cân: nhà cung cấp, loại hoá đơn; tài khoản, mật khẩu; kiểm tra kết nối */}
        <div className="ch-hd-luoi">
          <div className="f"><label>Nhà cung cấp hoá đơn điện tử</label>
            <Select className="inp" value={h.ncc} aria-label="Nhà cung cấp hoá đơn điện tử" onChange={e => dat({ ...h, ncc: e.target.value, daKetNoi: false })}
              ds={NCC_HDDT.map(v => ({ v, t: v }))} /></div>
          <div className="f"><label>Loại hoá đơn</label><input className="inp" readOnly value={`${tenLoaiHd(s)} (mẫu số ${mauSoHd(s)})`} title="Theo phương pháp tính thuế GTGT của đơn vị" /></div>
          <div className="f"><label>Tài khoản</label>
            <input className="inp" value={h.tk} aria-label="Tài khoản" autoComplete="off" onChange={e => dat({ ...h, tk: e.target.value, daKetNoi: false })} /></div>
          <div className="f"><label>Mật khẩu</label>
            <input className="inp" type="password" value={h.mk} aria-label="Mật khẩu" autoComplete="new-password" onChange={e => dat({ ...h, mk: e.target.value, daKetNoi: false })} /></div>
          <div className="ch-hd-kn">
            <button type="button" className="btn sm" onClick={kiemTra}>Kiểm tra kết nối</button>
            {h.daKetNoi ? <span className="chip ok">Đã kết nối</span> : <span className="chip">Chưa kiểm tra</span>}
          </div>
        </div>
        <div className="ch-hd-kh">
          <div className="ch-gv-dong ch-gv-dau"><span>Cửa hàng</span><span>Ký hiệu hoá đơn</span></div>
          {CUA_HANG.map(c => (
            <div key={c.id} className="ch-gv-dong">
              <span>{c.ten}</span>
              <input className="inp" value={h.kyHieu[c.id] ?? ''} maxLength={6} aria-label={`Ký hiệu hoá đơn ${c.ten}`}
                onChange={e => dat({ ...h, kyHieu: { ...h.kyHieu, [c.id]: e.target.value.toUpperCase() } })} />
            </div>
          ))}
        </div>
        <label className="ch-hd-mail"><input type="checkbox" checked={h.guiEmail} onChange={e => dat({ ...h, guiEmail: e.target.checked })} />
          Gửi hoá đơn cho người mua qua email sau khi phát hành</label>
      </>}
      <Note kind="gray">{h.bat
        ? <>Ký hiệu lấy theo thông báo phát hành đã gửi cơ quan thuế. Chứng từ bán hàng lập tay, nhập Excel có nút <b>Xuất hoá đơn điện tử</b>; hoá đơn FABi xuất tại máy POS.</>
        : 'Chưa bật: chứng từ bán hàng không xuất được hoá đơn điện tử từ phần mềm kế toán.'}</Note>
    </div>
  )
}

/** Hoá đơn đã phát hành gắn trên chứng từ */
export interface HdDaXuat { mau: string; kyHieu: string; so: string; ngay: string; ma: string }
export const hdCua = (r: Row) => r._hd as HdDaXuat | undefined
export const tenHd = (h: HdDaXuat) => `${h.mau}${h.kyHieu} số ${h.so}`

let soHdCuoi = 128   // số hoá đơn đã cấp trong phiên, tăng dần như nhà cung cấp trả về
const maCqt = (i: number) => `M${String(HOM_NAY.getFullYear()).slice(2)}-${(0x3a7f21 + i * 7919).toString(16).toUpperCase()}`

/** Popup xuất hoá đơn điện tử: một chứng từ (sửa được thông tin người mua) hoặc nhiều chứng từ đã chọn ở danh sách */
export function HopXuatHddt({ s, man, ds, onDong, toast }: { s: Session; man: string; ds: Row[]; onDong: () => void; toast: (m: string) => void }) {
  useDongEsc(onDong)
  const h = cauHinhHddt(s)
  const mau = mauSoHd(s)
  const duoc = ds.filter(r => r.nguon !== 'FABi' && !hdCua(r))
  const boQua = ds.length - duoc.length
  const mot = ds.length === 1 && duoc.length === 1 ? duoc[0] : undefined
  const kh = mot ? KHACH.find(k => k.ten === mot.doiTuong) : undefined
  const [nm, setNm] = useState({ ten: String(mot?.doiTuong ?? ''), mst: kh?.mst ?? '', diaChi: '', email: '' })
  const chuaSan = !h.bat || !h.daKetNoi
  const kyHieuCua = (r: Row) => h.kyHieu[String(r._cnId ?? '')] ?? Object.values(h.kyHieu)[0]
  const phatHanh = () => {
    const ngay = dmy(HOM_NAY)
    for (const r of duoc) {
      soHdCuoi += 1
      const hd: HdDaXuat = { mau, kyHieu: kyHieuCua(r), so: String(soHdCuoi).padStart(8, '0'), ngay, ma: maCqt(soHdCuoi) }
      suaPhieu(man, String(r.id), { _hd: hd, ...(mot ? { _nguoiMuaHd: nm } : {}) })
    }
    toast(duoc.length === 1 ? `Đã phát hành hoá đơn ${mau}${kyHieuCua(duoc[0])} số ${String(soHdCuoi).padStart(8, '0')}${h.guiEmail && nm.email ? `, đã gửi ${nm.email}` : ''}`
      : `Đã phát hành ${duoc.length} hoá đơn điện tử qua ${h.ncc}`)
    onDong()
  }
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop hddt-hop" role="dialog" aria-modal="true" aria-label="Xuất hoá đơn điện tử">
        <div className="ds-hop-dau"><b>Xuất hoá đơn điện tử</b></div>
        <div className="hddt-than">
          {chuaSan ? (
            <Note kind="warn">{!h.bat ? 'Đơn vị chưa bật xuất hoá đơn điện tử.' : `Chưa kiểm tra kết nối ${h.ncc}.`} Vào <Link to="/app/he-thong/cau-hinh" onClick={onDong}>Cấu hình kế toán</Link> để thiết lập.</Note>
          ) : !duoc.length ? (
            <Note kind="warn">Các chứng từ đã chọn đều đã có hoá đơn hoặc là hoá đơn FABi xuất tại máy POS.</Note>
          ) : <>
            <div className="hddt-tt">
              <span>Nhà cung cấp</span><b>{h.ncc}</b>
              <span>Loại hoá đơn</span><b>{tenLoaiHd(s)} (mẫu số {mau})</b>
              <span>Ngày hoá đơn</span><b>{dmy(HOM_NAY)}</b>
              {mot && <><span>Ký hiệu</span><b>{mau}{kyHieuCua(mot)}</b></>}
            </div>
            {mot ? (
              <div className="form-grid">
                <div className="f c2"><label>Tên người mua</label><input className="inp" value={nm.ten} aria-label="Tên người mua" onChange={e => setNm({ ...nm, ten: e.target.value })} /></div>
                <div className="f"><label>Mã số thuế</label><input className="inp" value={nm.mst} aria-label="Mã số thuế người mua" placeholder="Khách lẻ để trống" onChange={e => setNm({ ...nm, mst: e.target.value })} /></div>
                <div className="f"><label>Email nhận hoá đơn</label><input className="inp" type="email" value={nm.email} aria-label="Email nhận hoá đơn" onChange={e => setNm({ ...nm, email: e.target.value })} /></div>
                <div className="f c2"><label>Địa chỉ</label><input className="inp" value={nm.diaChi} aria-label="Địa chỉ người mua" onChange={e => setNm({ ...nm, diaChi: e.target.value })} /></div>
                <div className="f c2 hddt-tong"><span>Tổng tiền thanh toán</span><b>{money(Number(mot.tong) || 0)}</b></div>
              </div>
            ) : (
              <div className="hddt-ds">
                <div className="hddt-dong hddt-dau"><span>Số chứng từ</span><span>Người mua</span><span>Ký hiệu</span><span>Tổng tiền</span></div>
                {duoc.map(r => (
                  <div key={String(r.id)} className="hddt-dong">
                    <span className="code">{r.so}</span><span title={String(r.doiTuong ?? '')}>{r.doiTuong}</span><span>{mau}{kyHieuCua(r)}</span><span className="num">{money(Number(r.tong) || 0)}</span>
                  </div>
                ))}
                <div className="hddt-dong hddt-cong"><span>Cộng {duoc.length} hoá đơn</span><span /><span /><span className="num">{money(duoc.reduce((a, r) => a + (Number(r.tong) || 0), 0))}</span></div>
              </div>
            )}
            {boQua > 0 && <Note kind="gray">Bỏ qua {boQua} chứng từ đã có hoá đơn hoặc là hoá đơn FABi.</Note>}
          </>}
        </div>
        <div className="ds-chan">
          <span className="grow" />
          <button type="button" className="btn" onClick={onDong}>{chuaSan || !duoc.length ? 'Đóng' : 'Huỷ'}</button>
          {!chuaSan && duoc.length > 0 && <button type="button" className="btn pri" autoFocus onClick={phatHanh}>Phát hành</button>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
