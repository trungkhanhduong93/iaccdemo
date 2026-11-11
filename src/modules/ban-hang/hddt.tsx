// Xuất hoá đơn điện tử từ chứng từ bán hàng lập tay gói Plus (T763): thiết lập ở Cấu hình kế toán, popup xem trước rồi phát hành
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '../../ui/Icon'
import type { Row } from '../types'
import { gtgtTyLe, type Session } from '../../app/session'
import { CUA_HANG, DON_VI, HOM_NAY, KHACH, NHAN_VIEN } from '../../data/mock'
import { Select } from '../../ui/Dropdown'
import { Note } from '../../ui/Page'
import { dmy, docSoTien, money } from '../../ui/format'
import { useDongEsc } from '../../ui/LocNangCao'
import { ONgay } from '../../ui/ChonNgay'
import { apKhoPhieu, laDaXoa, suaPhieu, xoaPhieu } from '../../ui/generic/daXoa'
import { ttNghiepVu, type Dong } from '../../ui/generic/gen'

/** Nhà cung cấp hoá đơn điện tử: chỉ kết nối iPOS Invoice (QD106), có thêm nhà cung cấp thì thêm lại ô chọn */
export const NCC_HDDT = 'iPOS Invoice'
/** Tên người mua mặc định khi khách không lấy hoá đơn */
export const KHACH_LE_HD = 'Bán cho người tiêu dùng'

/** Mẫu số, ký hiệu riêng của một cửa hàng; để trống thì theo khai báo chung */
export interface KyHieuCh { mau: '' | '1' | '2'; kyHieu: string }

/** Thiết lập xuất hoá đơn điện tử của một đơn vị (T784) */
export interface CauHinhHddt {
  bat: boolean
  tk: string
  mk: string
  daKetNoi: boolean
  tenKhachLe: string                     // người mua trên hoá đơn khi khách không lấy hoá đơn
  mau: '1' | '2'                         // mẫu số chung: 1 hoá đơn GTGT, 2 hoá đơn bán hàng
  kyHieu: string                         // ký hiệu chung 6 ký tự, vd C26TAA
  cuaHang: Record<string, KyHieuCh>      // mẫu số, ký hiệu theo cửa hàng
  guiEmail: boolean                      // luôn gửi hoá đơn qua email cho người mua có email: mặc định của HĐĐT, không có ô tích
}

/** Ký hiệu chung mặc định: C (có mã của cơ quan thuế) + 2 số cuối năm + T + AA */
const KY_HIEU_MAC_DINH = `C${String(HOM_NAY.getFullYear()).slice(2)}TAA`

/** Mẫu số gợi ý theo phương pháp thuế: khấu trừ dùng hoá đơn GTGT (1), tính theo % doanh thu dùng hoá đơn bán hàng (2) */
export const mauSoHd = (s: Session): '1' | '2' => (gtgtTyLe(s) ? '2' : '1')
const TEN_MAU = { 1: 'Hoá đơn GTGT', 2: 'Hoá đơn bán hàng' } as const

export function cauHinhHddt(s: Session): CauHinhHddt {
  const da = (s.hddt?.[s.donVi] ?? {}) as Partial<Omit<CauHinhHddt, 'kyHieu'>> & { kyHieu?: unknown }
  const mau = mauSoHd(s)
  // Bản mẫu giả lập đơn vị đã khai báo, kết nối xong để demo bấm Xuất hoá đơn điện tử là thấy màn phát hành (T763).
  // Cửa hàng thứ hai giả lập ký hiệu máy tính tiền, các cửa hàng sau để trống để thấy dòng theo khai báo chung
  const goc: CauHinhHddt = {
    bat: true, tk: 'phomay_hddt', mk: 'matkhau-mau', daKetNoi: true, tenKhachLe: KHACH_LE_HD, mau, kyHieu: KY_HIEU_MAC_DINH,
    guiEmail: true,
    cuaHang: Object.fromEntries(CUA_HANG.map((c, i): [string, KyHieuCh] => [c.id, i === 0 ? { mau, kyHieu: KY_HIEU_MAC_DINH }
      : i === 1 ? { mau, kyHieu: KY_HIEU_MAC_DINH.slice(0, 3) + 'MAB' } : { mau: '', kyHieu: '' }])),
  }
  // Bản lưu trước T784 có kyHieu là bảng theo cửa hàng: bỏ, dùng mặc định
  const { kyHieu, ...con } = da
  // Mẫu số luôn theo phương pháp tính thuế, kể cả bản lưu trước T787 đã chọn mẫu số khác (QD107)
  const cuaHang = Object.fromEntries(Object.entries({ ...goc.cuaHang, ...con.cuaHang }).map(([id, ch]): [string, KyHieuCh] => [id, { ...ch, mau: '' }]))
  return { ...goc, ...con, ...(typeof kyHieu === 'string' ? { kyHieu } : {}), mau, cuaHang, guiEmail: true }
}

/** Ký hiệu 6 ký tự; chữ thứ 4 là loại hoá đơn, M là hoá đơn khởi tạo từ máy tính tiền */
const KY_HIEU_DUNG = /^[CK]\d{2}[TDLMNBGHX][A-Z]{2}$/
/** Ký hiệu đầy đủ trên popup phát hành: mẫu số 1 hoặc 2 rồi 6 ký tự ký hiệu */
const KY_HIEU_DU = /^[12][CK]\d{2}[TDLMNBGHX][A-Z]{2}$/
/** Ký hiệu máy tính tiền: chữ M ở vị trí thứ 4 của ký hiệu, nhận cả ký hiệu có mẫu số đứng trước */
export const laMayTinhTien = (k: string) => (k.length === 7 ? k[4] : k[3]) === 'M'

/** Mẫu số + ký hiệu dùng khi xuất cho một cửa hàng, vd 1C26TAA; ô nào của cửa hàng để trống thì lấy khai báo chung */
export function kyHieuXuat(h: CauHinhHddt, cnId: string): string {
  const ch = h.cuaHang[cnId]
  return (ch?.mau || h.mau) + (ch?.kyHieu.trim() || h.kyHieu)
}

/** Lỗi thiết lập trước khi lưu, không lỗi trả null */
export function loiHddt(h: CauHinhHddt): string | null {
  if (!h.bat) return null
  if (!h.tk.trim() || !h.mk) return `Nhập tài khoản, mật khẩu kết nối ${NCC_HDDT}`
  if (!h.tenKhachLe.trim()) return 'Nhập tên người mua khi khách không lấy hoá đơn'
  if (!KY_HIEU_DUNG.test(h.kyHieu)) return `Ký hiệu chung chưa đúng: 6 ký tự, vd ${KY_HIEU_MAC_DINH}`
  for (const c of CUA_HANG) {
    const k = h.cuaHang[c.id]?.kyHieu ?? ''
    if (k && !KY_HIEU_DUNG.test(k)) return `Ký hiệu hoá đơn của ${c.ten} chưa đúng: 6 ký tự, vd ${KY_HIEU_MAC_DINH}, hoặc để trống`
  }
  return null
}

/** Thẻ Hoá đơn điện tử ở Cấu hình kế toán (T784): mỗi khối một khung con: kết nối iPOS Invoice, thông tin mặc định, mẫu số và ký hiệu theo cửa hàng */
export function TheCauHinhHddt({ s, h, dat, toast }: { s: Session; h: CauHinhHddt; dat: (h: CauHinhHddt) => void; toast: (m: string) => void }) {
  const kiemTra = () => {
    if (!h.tk.trim() || !h.mk) { toast('Nhập tài khoản, mật khẩu trước khi kiểm tra kết nối'); return }
    dat({ ...h, daKetNoi: true }); toast(`Kết nối ${NCC_HDDT} thành công`)
  }
  const mau = mauSoHd(s)   // mẫu số theo phương pháp tính thuế, không cho chọn (QD107, T787)
  const chung = h.mau + h.kyHieu
  const datCh = (id: string, p: Partial<KyHieuCh>) => dat({ ...h, cuaHang: { ...h.cuaHang, [id]: { ...(h.cuaHang[id] ?? { mau: '', kyHieu: '' }), ...p } } })
  return (
    <div className="ch-hd" data-hd="hddt">
      <label className="ch-gv-bat"><input type="checkbox" className="bat-tat" checked={h.bat} onChange={e => dat({ ...h, bat: e.target.checked })} />
        Xuất hoá đơn điện tử từ chứng từ bán hàng</label>
      {h.bat && <>
        <div className="ch-hd-khoi">
          <h4>Kết nối {NCC_HDDT}</h4>
          <div className="ch-hd-luoi">
            <div className="f"><label>Tài khoản <em className="req">*</em></label>
              <input className="inp" value={h.tk} aria-label="Tài khoản" autoComplete="off" onChange={e => dat({ ...h, tk: e.target.value, daKetNoi: false })} /></div>
            <div className="f"><label>Mật khẩu <em className="req">*</em></label>
              <input className="inp" type="password" value={h.mk} aria-label="Mật khẩu" autoComplete="new-password" onChange={e => dat({ ...h, mk: e.target.value, daKetNoi: false })} /></div>
            <div className="ch-hd-kn">
              <button type="button" className="btn sm" onClick={kiemTra}>Kiểm tra kết nối</button>
              {h.daKetNoi ? <span className="chip ok">Đã kết nối</span> : <span className="chip">Chưa kiểm tra</span>}
            </div>
          </div>
        </div>
        <div className="ch-hd-khoi">
          <h4>Thông tin mặc định</h4>
          <div className="ch-hd-luoi ba">
            <div className="f"><label>Tên người mua khi khách không lấy hoá đơn</label>
              <input className="inp" value={h.tenKhachLe} aria-label="Tên người mua khi khách không lấy hoá đơn" placeholder={KHACH_LE_HD}
                onChange={e => dat({ ...h, tenKhachLe: e.target.value })} /></div>
            <div className="f"><label>Mẫu số</label>
              <input className="inp" readOnly value={`${mau} · ${TEN_MAU[mau]}`} aria-label="Mẫu số" title="Theo phương pháp tính thuế khai ở Hệ thống: khấu trừ là 1, trực tiếp theo % doanh thu là 2" /></div>
            <div className="f"><label>Ký hiệu chung</label>
              <input className="inp code" value={h.kyHieu} maxLength={6} aria-label="Ký hiệu chung" placeholder={KY_HIEU_MAC_DINH}
                onChange={e => dat({ ...h, kyHieu: e.target.value.toUpperCase().replace(/\s/g, '') })} /></div>
          </div>
          {/* Giảm thuế trên hoá đơn theo thẻ Giảm thuế GTGT cùng màn; gửi email cho người mua là mặc định của HĐĐT, không có ô tích ở đây */}
        </div>
        <div className="ch-hd-khoi">
          <h4>Mẫu số, ký hiệu theo cửa hàng</h4>
          <div className="ch-hd-bang">
            <div className="ch-hd-dong dau"><span>Cửa hàng</span><span>Mẫu số</span><span>Ký hiệu</span><span>Đang dùng khi xuất</span></div>
            {CUA_HANG.map(c => {
              const ch = h.cuaHang[c.id] ?? { mau: '', kyHieu: '' }
              const trong = !ch.kyHieu.trim()
              const dung = kyHieuXuat(h, c.id)
              return (
                <div key={c.id} className="ch-hd-dong">
                  <span>{c.ten}</span>
                  <span>{mau}</span>
                  <input className="inp code" value={ch.kyHieu} maxLength={6} placeholder="Trống" aria-label={`Ký hiệu hoá đơn ${c.ten}`}
                    onChange={e => datCh(c.id, { kyHieu: e.target.value.toUpperCase().replace(/\s/g, '') })} />
                  {trong
                    ? <span className="dim">Theo khai báo chung ({chung})</span>
                    : <span className="ch-hd-dung"><b className="code">{dung}</b>{laMayTinhTien(dung) && <span className="chip warn">Máy tính tiền</span>}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </>}
      <Note kind="gray">{h.bat
        ? <>Ký hiệu lấy theo thông báo phát hành trên phần mềm hoá đơn điện tử. Mẫu số theo phương pháp tính thuế: khấu trừ là 1, trực tiếp theo % doanh thu là 2. Ký hiệu chỉ là mặc định, khi phát hành vẫn sửa được. Ký hiệu có chữ M ở vị trí thứ 4 (vd C26MAB) là hoá đơn khởi tạo từ máy tính tiền.</>
        : 'Chưa bật: chứng từ bán hàng không xuất được hoá đơn điện tử từ phần mềm kế toán.'}</Note>
    </div>
  )
}

/** Hoá đơn đã phát hành gắn trên chứng từ */
/** Hoá đơn đã cấp số: mẫu số, ký hiệu, số, ngày, mã CQT; từ T785 có thêm mã tra cứu, người mua, tiền trên hoá đơn nhà cung cấp trả về */
export interface HdDaXuat {
  mau: string; kyHieu: string; so: string; ngay: string; ma: string
  traCuu?: string; nguoiMua?: string; truoc?: number; thue?: number; tong?: number
}
export const hdCua = (r: Row) => r._hd as HdDaXuat | undefined
export const tenHd = (h: HdDaXuat) => `${h.mau}${h.kyHieu} số ${h.so}`

// ── Hoá đơn thay thế, huỷ bán, hoá đơn điều chỉnh ở màn xuất bán (QD107, T787) ──
export type LoaiCt = 'XBAN' | 'HDTHAYTHE' | 'HUYBAN' | 'HDDIEUCHINH'
export const TEN_LOAI_CT: Record<LoaiCt, string> = { XBAN: 'Bán hàng', HDTHAYTHE: 'Hoá đơn thay thế', HUYBAN: 'Huỷ bán', HDDIEUCHINH: 'Hoá đơn điều chỉnh' }
export const TIEN_TO_CT: Record<LoaiCt, string> = { XBAN: 'BH', HDTHAYTHE: 'HDTT', HUYBAN: 'HBH', HDDIEUCHINH: 'HDDC' }
export const loaiCtCua = (r?: Row): LoaiCt => (r?._loaiCt as LoaiCt | undefined) ?? 'XBAN'
/** Hoá đơn thay thế, điều chỉnh: lưu là dự thảo, phát hành sau */
export const laHdMoiCua = (r?: Row) => ['HDTHAYTHE', 'HDDIEUCHINH'].includes(loaiCtCua(r))
/** Chứng từ liên quan: id, số, loại */
export interface CtLq { id: string; so: string; loai: LoaiCt }
/** Hoá đơn gốc lưu kèm hoá đơn thay thế, điều chỉnh, huỷ bán: chứng từ gốc và đủ thông tin hoá đơn */
export interface HdGoc { id: string; so: string; hd: HdDaXuat }
export const hdGocCua = (r?: Row) => r?._hdGoc as HdGoc | undefined
/** Hoá đơn thay thế, điều chỉnh, huỷ bán lập từ chứng từ này, còn chưa xoá */
export const dsHdMoiCon = (man: string, r?: Row) => ((r?._dsHdMoi as CtLq[] | undefined) ?? []).filter(c => !laDaXoa(man, c.id))
/** Chứng từ mẫu có sẵn của màn (hoá đơn thay thế, điều chỉnh mẫu, T795): màn chứng từ bán hàng đăng ký, tránh nạp vòng giữa hai file */
const ctMau = new Map<string, () => Row[]>()
export const dkCtMau = (man: string, f: () => Row[]) => { ctMau.set(man, f) }
/** Chứng từ hoá đơn thay thế, điều chỉnh: lập trong phiên hoặc có sẵn trong dữ liệu mẫu */
const ctMoi = (man: string, id: string) => apKhoPhieu(man, ctMau.get(man)?.() ?? []).find(x => String(x.id) === id)
/** Hoá đơn gốc bị thay thế, điều chỉnh khi hoá đơn mới đã phát hành */
export function ttHdGoc(man: string, r: Row): 'Bị thay thế' | 'Bị điều chỉnh' | null {
  const da = dsHdMoiCon(man, r).map(c => ctMoi(man, c.id)).filter((x): x is Row => Boolean(x && hdCua(x)))
  return da.some(x => loaiCtCua(x) === 'HDTHAYTHE') ? 'Bị thay thế' : da.some(x => loaiCtCua(x) === 'HDDIEUCHINH') ? 'Bị điều chỉnh' : null
}
/** Hoá đơn thay thế còn dự thảo của hoá đơn gốc */
export const thayTheNhap = (man: string, r: Row) => dsHdMoiCon(man, r).find(c => c.loai === 'HDTHAYTHE' && !hdCua(ctMoi(man, c.id) ?? {}))
/** Hoá đơn thay thế hoặc điều chỉnh còn dự thảo của hoá đơn gốc (T795) */
export const hdMoiNhap = (man: string, r: Row) => dsHdMoiCon(man, r).find(c => (c.loai === 'HDTHAYTHE' || c.loai === 'HDDIEUCHINH') && !hdCua(ctMoi(man, c.id) ?? {}))
/** Lý do không lập được hoá đơn thay thế, điều chỉnh cho chứng từ, lập được thì null */
export function lyDoKhongLap(man: string, r: Row, loai: 'tt' | 'dc'): string | null {
  if (!hdCua(r)) return 'Chỉ lập với hoá đơn đã phát hành'
  // Điều chỉnh chỉ cho hoá đơn gốc (kể cả đã bị điều chỉnh); thay thế cho hoá đơn gốc chưa bị điều chỉnh hoặc hoá đơn thay thế (dinhlanphuongipacc 11/11/2026)
  const l = loaiCtCua(r)
  if (loai === 'dc' && l === 'HDTHAYTHE') return 'Hoá đơn thay thế không được điều chỉnh'
  if (loai === 'dc' && l !== 'XBAN') return 'Chỉ điều chỉnh hoá đơn gốc'
  if (loai === 'tt' && l !== 'XBAN' && l !== 'HDTHAYTHE') return 'Chỉ thay thế hoá đơn gốc hoặc hoá đơn thay thế'
  const tt = ttHdGoc(man, r)
  if (tt === 'Bị thay thế') return 'Hoá đơn đã bị thay thế, chỉ xem'
  if (loai === 'tt' && tt === 'Bị điều chỉnh') return 'Hoá đơn đã bị điều chỉnh, không được thay thế'
  const nhap = loai === 'tt' ? thayTheNhap(man, r) : undefined
  return nhap ? `Đang có hoá đơn thay thế dự thảo ${nhap.so}` : null
}
/** Số chứng từ kế tiếp theo tiền tố và tháng hiện tại, vd HDTT2610-0001 */
export function soCtMoi(rows: Row[], tienTo: string) {
  const dau = `${tienTo}${String(HOM_NAY.getFullYear()).slice(2)}${String(HOM_NAY.getMonth() + 1).padStart(2, '0')}-`
  const max = rows.reduce((a, r) => (String(r.so).startsWith(dau) ? Math.max(a, Number(String(r.so).slice(dau.length)) || 0) : a), 0)
  return `${dau}${String(max + 1).padStart(4, '0')}`
}
/** Đổi dấu tiền trên dòng hàng: huỷ bán, điều chỉnh giảm ghi âm; người dùng nhập số dương, phần mềm tự đổi dấu */
const TIEN_DONG = ['gia', 'tien', 'thanh', 'giam', 'ck', 'phiDv', 'phiVc', 'thue', 'dtTruocThue', 'giamThue']
export const dauDong = (ds: Dong[], dau: 1 | -1): Dong[] => ds.map(d => {
  const x: Record<string, unknown> = { ...d }
  for (const k of TIEN_DONG) { const v = x[k]; if (typeof v === 'number' && v && Math.sign(v) !== dau) x[k] = -v }
  return x as unknown as Dong
})
/** Bỏ các trường riêng của chứng từ gốc khi chép sang chứng từ mới */
function chepGoc(goc: Row): Row {
  const bo = ['id', 'so', '_hd', '_soHd', '_dsHdMoi', '_ctTt', '_dsTt', '_dsTra', '_huyBan', '_hdTt', '_hdGoc', '_loaiCt', '_lyDoHd', '_dcLoai', '_tienHd',
    '_ngayTao', '_nguoiTao', 'ngayTao', 'nguoiTao', 'hddt', 'ttPh', 'tenLoaiCt', 'thamChieu', 'stt']
  return Object.fromEntries(Object.entries(goc).filter(([k]) => !bo.includes(k))) as Row
}
/** Mẫu điền sẵn form hoá đơn thay thế, điều chỉnh: chép y nguyên chứng từ gốc kể cả thuế; ngày chứng từ, ngày hoá đơn là hôm nay */
export function mauTuGoc(goc: Row, loai: 'HDTHAYTHE' | 'HDDIEUCHINH'): Row {
  const hd = hdCua(goc)!
  return { ...chepGoc(goc), ngay: dmy(HOM_NAY), _loaiCt: loai, _hdGoc: { id: String(goc.id), so: String(goc.so), hd }, _ngayHd: dmy(HOM_NAY), _kyHieuHd: hd.mau + hd.kyHieu }
}
/** Huỷ bán sinh kèm hoá đơn thay thế: y hệt chứng từ gốc, ghi âm, ngày theo hoá đơn thay thế */
export function huyBanTu(goc: Row, id: string, so: string, ngay: string, hdGoc: HdGoc, hdTt: CtLq): Row {
  const am = (k: string) => -(Number(goc[k]) || 0)
  return { ...chepGoc(goc), id, so, ngay, thang: Number(ngay.split('/')[1]) || 10, nguon: 'tay', tt: 'ghi', _loaiCt: 'HUYBAN', _hdGoc: hdGoc, _hdTt: hdTt,
    _dong: dauDong((goc._dong as Dong[] | undefined) ?? [], -1), tien: am('tien'), thue: am('thue'), tong: am('tong'),
    dienGiai: `Do thay thế hoá đơn ${hdGoc.hd.so}`, _ghiChu: `Do thay thế hoá đơn ${hdGoc.hd.so}` }
}
/** Xoá hoá đơn thay thế, điều chỉnh dự thảo: thay thế thì xoá luôn huỷ bán; chứng từ gốc tự trở lại bình thường */
export function xoaCtHd(man: string, r: Row, ai: string) {
  const hb = r._huyBan as CtLq | undefined
  xoaPhieu(man, [{ id: String(r.id), so: String(r.so) }, ...(hb ? [{ id: hb.id, so: hb.so }] : [])], ai)
}

/** Địa chỉ, email nhận hoá đơn của khách công ty (dữ liệu giả); khách lẻ để trống */
const NGUOI_MUA: Record<string, [string, string]> = {
  KH001: ['25 Nguyễn Thị Minh Khai, phường Sài Gòn, TP.HCM', 'ketoan@saoviet.vn'],
  KH002: ['118 Trần Phú, phường Nha Trang, Khánh Hoà', 'hoadon@bienxanh.vn'],
  KH003: ['9 Hạ Long, phường Hồng Gai, Quảng Ninh', 'vp@halongtech.vn'],
  KH004: ['42 Võ Văn Tần, phường Xuân Hoà, TP.HCM', 'ketoan@anhduong-event.vn'],
  GRAB: ['268 Tô Hiến Thành, phường Diên Hồng, TP.HCM', 'hoadon.grabfood@iacc-demo.vn'],
}

let soHdCuoi = 128   // số hoá đơn đã cấp trong phiên, tăng dần như nhà cung cấp trả về
const maCqt = (i: number) => `M${String(HOM_NAY.getFullYear()).slice(2)}-${(0x3a7f21 + i * 7919).toString(16).toUpperCase()}`
/** Mã tra cứu hoá đơn nhà cung cấp trả về, 10 ký tự */
const maTraCuu = (i: number) => `PM${(i * 104729 + 2821109907).toString(36).toUpperCase().slice(-8)}`

/** Thông tin khách hàng trên hoá đơn: công ty (MST, tên đơn vị, mã đơn vị quan hệ ngân sách) hoặc cá nhân (CCCD, số hộ chiếu) */
export interface TtKhach { loai: 'cty' | 'cn'; mst: string; tenDv: string; cccd: string; tenNm: string; diaChi: string; sdt: string; email: string; maQhns: string; hoChieu: string }
export const KHACH_TRONG: TtKhach = { loai: 'cn', mst: '', tenDv: '', cccd: '', tenNm: '', diaChi: '', sdt: '', email: '', maQhns: '', hoChieu: '' }

/** Khách lẻ: khách KL trong danh mục hoặc tên có chữ "khách lẻ" */
export const laKhachLe = (ten: string) => KHACH.find(x => x.ten === ten)?.ma === 'KL' || /khách lẻ/i.test(ten)
/** Khách công ty: có mã số thuế trong danh mục */
export const laKhachCty = (ten: string) => Boolean(KHACH.find(x => x.ten === ten)?.mst)

/** Người mua mặc định theo khách: công ty lấy MST, địa chỉ, email trong danh mục, tên người mua là người giao dịch; cá nhân lấy tên khách */
export function khachTheoTen(ten: string, nguoiGd: string): TtKhach {
  const kh = KHACH.find(x => x.ten === ten)
  const tt = kh ? NGUOI_MUA[kh.ma] : undefined
  if (kh?.mst) return { ...KHACH_TRONG, loai: 'cty', mst: kh.mst.replace(/\s/g, ''), tenDv: ten, tenNm: nguoiGd, diaChi: tt?.[0] ?? '', email: tt?.[1] ?? '' }
  return { ...KHACH_TRONG, tenNm: laKhachLe(ten) ? '' : ten }
}
/** Người mua của chứng từ: lấy bản đã lưu ở form, chưa có thì theo khách */
function khachMacDinh(r: Row): TtKhach {
  const da = r._khachHd as TtKhach | undefined
  return da ? { ...KHACH_TRONG, ...da } : khachTheoTen(String(r.doiTuong ?? ''), String(r._nguoiGiao ?? ttNghiepVu(r).nguoi ?? NHAN_VIEN[0].ten))
}
/** Chứng từ ghi người mua không lấy hoá đơn: lấy theo form, chưa lưu thì khách lẻ là không lấy */
const khongLayCua = (r: Row) => (r._khongLayHd !== undefined ? Boolean(r._khongLayHd) : laKhachLe(String(r.doiTuong ?? '')))

/** Người mua là người tiêu dùng không lấy hoá đơn: cá nhân, tên đúng tên khai báo (vd "Bán cho người tiêu dùng") */
const laNguoiTieuDung = (k: TtKhach, tenKl: string) => k.loai === 'cn' && k.tenNm.trim() === tenKl && !k.diaChi && !k.sdt && !k.cccd && !k.hoChieu && !k.email
/** Người mua điền sẵn ở popup Xuất HĐĐT: không lấy hoá đơn thì Cá nhân, tên người mua theo khai báo */
const khachPopup = (r: Row, tenKl: string): TtKhach => (khongLayCua(r) ? { ...KHACH_TRONG, tenNm: tenKl } : khachMacDinh(r))
/** Tra cứu mã số thuế (giả lập): khách trong danh mục trả tên, địa chỉ đã có; MST 10 hoặc 13 số khác trả một đơn vị mẫu; sai dạng trả null */
function traCuuMst(mst: string): { tenDv: string; diaChi: string } | null {
  const so = mst.replace(/[\s-]/g, '')
  const kh = KHACH.find(x => x.mst.replace(/\s/g, '') === so)
  if (kh) return { tenDv: kh.ten, diaChi: NGUOI_MUA[kh.ma]?.[0] ?? '' }
  return /^\d{10}(\d{3})?$/.test(so) ? { tenDv: `Công ty TNHH Thương mại Dịch vụ ${so.slice(-3)}`, diaChi: `${Number(so.slice(-2)) + 1} Nguyễn Huệ, phường Sài Gòn, TP.HCM` } : null
}
/** Ô bắt buộc còn trống của người mua, đủ thì null */
export const thieuKhach = (k: TtKhach): string | null => k.loai === 'cty'
  ? (!k.tenDv.trim() ? 'Thiếu tên đơn vị' : !k.diaChi.trim() ? 'Thiếu địa chỉ' : null)
  : (!k.tenNm.trim() ? 'Thiếu tên người mua' : null)
const tenCty = (k: TtKhach) => (k.loai === 'cty' ? k.tenDv : '')

/** Người mua in trên hoá đơn, một dòng: công ty là tên đơn vị · MST · người mua hàng; cá nhân là tên người mua */
export function nguoiMuaMotDong(k: TtKhach, khongLay: boolean, tenKl: string): string {
  if (khongLay) return tenKl
  return k.loai === 'cty' ? [k.tenDv, k.mst && `MST ${k.mst}`, k.tenNm].filter(Boolean).join(' · ') : k.tenNm
}

/** Cấu hình dùng khi phát hành: bản mẫu luôn giả lập đã khai báo đủ, đã kết nối (T763) */
function cauHinhPhatHanh(s: Session): CauHinhHddt {
  const daLuu = cauHinhHddt(s)
  return { ...daLuu, bat: true, daKetNoi: true, tk: daLuu.tk || 'phomay_hddt', mk: daLuu.mk || 'matkhau-mau' }
}
/** Mẫu số + ký hiệu của chứng từ theo cửa hàng, vd 1C26TAA */
const kyHieuCua = (h: CauHinhHddt, r: Row) => kyHieuXuat(h, String(r._cnId ?? CUA_HANG.find(c => c.ten === r.cn)?.id ?? ''))
/** Mẫu số + ký hiệu mặc định theo tên cửa hàng lập chứng từ (form lập tay, T785) */
export const kyHieuTheoCh = (s: Session, tenCh: string) => kyHieuXuat(cauHinhHddt(s), CUA_HANG.find(c => c.ten === tenCh)?.id ?? '')

/** Ký hiệu đã khai báo ở Cấu hình kế toán để chọn trên chứng từ: khai báo chung rồi từng cửa hàng, kèm mô tả */
export function dsKyHieu(h: CauHinhHddt): { v: string; t: string }[] {
  const ds = new Map<string, string[]>()
  const them = (v: string, nhan: string) => ds.set(v, [...(ds.get(v) ?? []), nhan])
  them(h.mau + h.kyHieu, 'khai báo chung')
  for (const c of CUA_HANG) { const ch = h.cuaHang[c.id]; if (ch?.kyHieu.trim() || ch?.mau) them(kyHieuXuat(h, c.id), c.ten) }
  return [...ds].map(([v, nhan]) => ({ v, t: `${TEN_MAU[v[0] as '1' | '2'] ?? 'Hoá đơn'}${laMayTinhTien(v) ? ' máy tính tiền' : ''} · ${nhan.join(', ')}` }))
}
/** Ký hiệu đầy đủ đúng dạng 7 ký tự, vd 1C26TAA */
export const kyHieuDung = (k: string) => KY_HIEU_DU.test(k)

/** Tiền trên hoá đơn: trước thuế, thuế (mẫu 2 là giảm trừ thuế), tổng */
export interface TienHd { truoc: number; thue: number; tong: number }

/** Cấp số hoá đơn mới rồi ghi vào chứng từ: ô Số hoá đơn, Ký hiệu, Ngày hoá đơn, MST hoặc CCCD, địa chỉ ở đầu phiếu đổi theo */
function ghiHd(man: string, id: string, mau: string, kyHieu: string, ngay: string, k: TtKhach, khongLay: boolean, tenKl: string, tien?: TienHd): HdDaXuat {
  soHdCuoi += 1
  const kIn: TtKhach = khongLay ? { ...KHACH_TRONG, tenNm: tenKl } : k
  const hd: HdDaXuat = {
    mau, kyHieu, so: String(soHdCuoi).padStart(8, '0'), ngay, ma: maCqt(soHdCuoi), traCuu: maTraCuu(soHdCuoi),
    nguoiMua: nguoiMuaMotDong(k, khongLay, tenKl), ...tien,
  }
  suaPhieu(man, id, {
    _hd: hd, _soHd: hd.so, _kyHieuHd: hd.mau + hd.kyHieu, _ngayHd: hd.ngay, _khachHd: kIn, _khongLayHd: khongLay,
    ...(khongLay ? {} : { _mst: k.loai === 'cty' ? k.mst : k.cccd, ...(k.diaChi ? { _diaChi: k.diaChi } : {}) }),
  })
  return hd
}
/** Tiền hoá đơn của chứng từ trong danh sách: tổng trừ thuế là trước thuế */
const tienCua = (r: Row): TienHd => { const tong = Number(r.tong) || 0, thue = Number(r.thue) || 0; return { truoc: tong - thue, thue, tong } }

/** Hoá đơn có sẵn của chứng từ lập tay mẫu (T786): id chứng từ mẫu và số hoá đơn, để menu Hoá đơn điện tử có dòng xem ngay.
 *  Cửa hàng thứ hai dùng ký hiệu máy tính tiền như khai báo mẫu ở cauHinhHddt */
const HD_MAU: Record<string, number> = { 'tay-0': 124, 'tay-1': 52, 'tay-6': 123, 'tay-8': 122, 'tay-9': 121,   // tay-6, 8, 9 thêm ở T790, số theo thứ tự ngày
  'tay-10': 119, 'tay-11': 120, 'tay-12': 125, 'tay-13': 126, 'tay-tt1': 127, 'tay-dc1': 128 }   // gốc, hoá đơn thay thế, điều chỉnh mẫu (T795)
/** Số hoá đơn có sẵn của chứng từ mẫu, chưa có thì undefined */
export const soHdMau = (id: string): number | undefined => HD_MAU[id]
/** Ký hiệu hoá đơn mẫu theo cửa hàng: cửa hàng thứ hai dùng ký hiệu máy tính tiền */
const kyHieuMau = (r: Row) => (CUA_HANG.findIndex(c => c.ten === r.cn) === 1 ? KY_HIEU_MAC_DINH.slice(0, 3) + 'MAB' : KY_HIEU_MAC_DINH)
export function hdMau(r: Row, tien: TienHd, tyLe: boolean): Row {
  const mau = tyLe ? '2' : '1'
  // Hoá đơn thay thế, điều chỉnh mẫu (T795): mẫu số, ký hiệu hoá đơn gốc theo gói; dự thảo lấy tiền, ký hiệu như form lập
  const g = hdGocCua(r)
  if (g && !g.hd.mau) r = { ...r, _hdGoc: { ...g, hd: { ...g.hd, mau, kyHieu: kyHieuMau(r), ma: maCqt(Number(g.hd.so)), traCuu: maTraCuu(Number(g.hd.so)) } } }
  if (laHdMoiCua(r) && !r._hd) r = { ...r, _kyHieuHd: r._kyHieuHd ?? mau + kyHieuMau(r), _tienHd: r._tienHd ?? tien, _khachHd: r._khachHd ?? khachMacDinh(r) }
  const n = HD_MAU[String(r.id)]
  if (n === undefined || r._hd) return r
  const k = khachMacDinh(r), khongLay = khongLayCua(r)
  const kyHieu = kyHieuMau(r)
  const hd: HdDaXuat = { mau, kyHieu, so: String(n).padStart(8, '0'), ngay: String(r.ngay).split(' ')[0], ma: maCqt(n), traCuu: maTraCuu(n),
    nguoiMua: nguoiMuaMotDong(k, khongLay, KHACH_LE_HD), ...tien }
  return { ...r, _hd: hd, _soHd: hd.so, _kyHieuHd: hd.mau + hd.kyHieu, _ngayHd: hd.ngay, _khachHd: khongLay ? { ...KHACH_TRONG, tenNm: KHACH_LE_HD } : k, _khongLayHd: khongLay,
    ...(khongLay ? {} : { _mst: k.loai === 'cty' ? k.mst : k.cccd, ...(k.diaChi ? { _diaChi: k.diaChi } : {}) }) }
}

/** Phát hành hoá đơn cho chứng từ vừa lưu ở form lập tay (T785): Lưu và phát hành */
export function phatHanhHd(s: Session, man: string, id: string, kyHieu7: string, ngay: string, k: TtKhach, khongLay: boolean, tien: TienHd): HdDaXuat {
  return ghiHd(man, id, kyHieu7[0], kyHieu7.slice(1), ngay, k, khongLay, cauHinhHddt(s).tenKhachLe || KHACH_LE_HD, tien)
}
/** Phát hành hoá đơn thay thế, điều chỉnh đang dự thảo theo thông tin đã lưu (menu ⋯ ở danh sách hoá đơn điện tử, T787) */
export function phatHanhNhap(s: Session, man: string, r: Row): HdDaXuat {
  const k: TtKhach = { ...KHACH_TRONG, ...(r._khachHd as Partial<TtKhach> | undefined) }
  return phatHanhHd(s, man, String(r.id), String(r._kyHieuHd ?? ''), String(r._ngayHd ?? ''), k, Boolean(r._khongLayHd), (r._tienHd as TienHd | undefined) ?? tienCua(r))
}

/** Một dòng nhãn bên trái, ô nhập bên phải như bảng */
function Dong({ nhan, phu, bb, loi, children }: { nhan: string; phu?: string; bb?: boolean; loi?: boolean; children: ReactNode }) {
  const tieuDe = <>{nhan}{bb && <em>*</em>}</>
  return <div className={`hddt-o${loi ? ' loi' : ''}`}>
    {phu ? <span className="co-phu"><span>{tieuDe}</span><small>{phu}</small></span> : <span>{tieuDe}</span>}
    <div>{children}</div>
  </div>
}

/** Chọn Cá nhân, Công ty và các ô thông tin khách hàng trên hoá đơn (QD106).
 *  Cá nhân: tên người mua, địa chỉ, số điện thoại, CCCD, số hộ chiếu, email; Công ty: MST (không bắt buộc), tên đơn vị, địa chỉ, tên người mua hàng, email, mã QHNS */
export function FormKhach({ k, dat, daThu, chiXem }: { k: TtKhach; dat: (p: Partial<TtKhach>) => void; daThu: boolean; chiXem?: boolean }) {
  const [traMst, setTraMst] = useState<{ loi: boolean; tb: string } | null>(null)   // kết quả tra cứu MST (T785)
  const tra = () => {
    const kq = traCuuMst(k.mst)
    if (!kq) { setTraMst({ loi: true, tb: k.mst.trim() ? `Không tìm thấy mã số thuế ${k.mst.trim()}` : 'Nhập mã số thuế để tra cứu' }); return }
    dat(kq); setTraMst(null)   // tra được thì điền luôn, không hiện thông báo
  }
  const o = (key: keyof TtKhach, nhan: string, goiY: string, bb = false) => (
    <Dong nhan={nhan} bb={bb && !chiXem} loi={!chiXem && daThu && bb && !String(k[key]).trim()}>
      <input className="hddt-inp" value={String(k[key])} placeholder={chiXem ? '' : goiY} aria-label={nhan} readOnly={chiXem}
        onChange={e => dat({ [key]: e.target.value })} />
    </Dong>
  )
  return <>
    <div className="hddt-kh">
      <b>Thông tin khách hàng</b>
      <label><input type="radio" name="hddt-loai" checked={k.loai === 'cn'} disabled={chiXem} onChange={() => dat({ loai: 'cn' })} />Cá nhân</label>
      <label><input type="radio" name="hddt-loai" checked={k.loai === 'cty'} disabled={chiXem} onChange={() => dat({ loai: 'cty', ...(k.tenNm === KHACH_LE_HD ? { tenNm: '' } : {}) })} />Công ty</label>
    </div>
    <div className="hddt-bang">
      {k.loai === 'cty' ? <>
        {/* Kính lúp cuối ô Mã số thuế: tra cứu MST, trả về tên đơn vị, địa chỉ (T785) */}
        <Dong nhan="Mã số thuế" loi={traMst?.loi}>
          <span className="hddt-mst">
            <input className="hddt-inp" value={k.mst} placeholder={chiXem ? '' : 'Nhập mã số thuế'} aria-label="Mã số thuế" readOnly={chiXem}
              onChange={e => { dat({ mst: e.target.value }); setTraMst(null) }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); tra() } }} />
            {!chiXem && <button type="button" className="icon-btn" title="Tra cứu mã số thuế, lấy tên đơn vị, địa chỉ" aria-label="Tra cứu mã số thuế" onClick={tra}>
              <Icon n="search" className="ic sm" /></button>}
          </span>
        </Dong>
        {o('tenDv', 'Tên đơn vị', 'Nhập tên đơn vị', true)}
        {o('diaChi', 'Địa chỉ', 'Nhập địa chỉ', true)}
        {o('tenNm', 'Tên người mua hàng', 'Nhập tên người mua hàng')}
        {o('email', 'Email nhận hoá đơn', 'Nhập email')}
        {o('maQhns', 'Mã đơn vị QHNS', 'Nhập mã đơn vị quan hệ ngân sách')}
      </> : <>
        {o('tenNm', 'Tên người mua', 'Nhập tên người mua', true)}
        {o('diaChi', 'Địa chỉ', 'Nhập địa chỉ')}
        {o('sdt', 'Số điện thoại', 'Nhập số điện thoại')}
        {o('cccd', 'Căn cước công dân', 'Nhập căn cước công dân')}
        {o('hoChieu', 'Số hộ chiếu', 'Nhập số hộ chiếu')}
        {o('email', 'Email nhận hoá đơn', 'Nhập email')}
      </>}
    </div>
    {k.loai === 'cty' && traMst && <small className={`hddt-tra${traMst.loi ? ' loi' : ''}`}>{traMst.tb}</small>}
  </>
}

/** Khung popup phát hành: tiêu đề, nút đóng, thân, chân */
export function Vo({ rong, hep, lop, tieuDe = 'Xuất hoá đơn điện tử', onDong, chan, children }: { rong?: boolean; hep?: boolean; lop?: string; tieuDe?: ReactNode; onDong: () => void; chan?: ReactNode; children: ReactNode }) {
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className={`ds-hop hddt-hop${rong ? ' rong' : ''}${hep ? ' hep' : ''}${lop ? ` ${lop}` : ''}`} role="dialog" aria-modal="true" aria-label={typeof tieuDe === 'string' ? tieuDe : 'Hoá đơn điện tử'}>
        <div className="ds-hop-dau"><b>{tieuDe}</b><span className="grow" />
          <button type="button" className="icon-btn" aria-label="Đóng" title="Đóng" onClick={onDong}>×</button></div>
        <div className="hddt-than">{children}</div>
        {chan && <div className="hddt-chan">{chan}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Popup Thông tin hoá đơn mở từ link Thay đổi thông tin VAT ở form lập tay (T785): Ngày hoá đơn và Mẫu số - Ký hiệu cùng một dòng,
 *  dưới là Thông tin khách hàng Cá nhân hoặc Công ty. Người mua không lấy hoá đơn thì điền sẵn Cá nhân, tên theo khai báo */
export function HopNguoiMua({ h, k0, khongLay, ngay0, kyHieu0, onDong, onDongY }: {
  h: CauHinhHddt; k0: TtKhach; khongLay: boolean; ngay0: string; kyHieu0: string; onDong: () => void
  onDongY: (x: { k: TtKhach; khongLay: boolean; ngay: string; kyHieu: string }) => void
}) {
  useDongEsc(onDong)
  const tenKl = h.tenKhachLe || KHACH_LE_HD
  const [k, setK] = useState<TtKhach>(() => (khongLay ? { ...KHACH_TRONG, tenNm: tenKl } : k0))
  const [ngay, setNgay] = useState(ngay0)
  const [kyHieu, setKyHieu] = useState(kyHieu0)
  const [daThu, setDaThu] = useState(false)
  const dongY = () => {
    if (!ngay || !KY_HIEU_DU.test(kyHieu) || thieuKhach(k)) { setDaThu(true); return }
    onDongY({ k, khongLay: laNguoiTieuDung(k, tenKl), ngay, kyHieu }); onDong()
  }
  return (
    <Vo hep tieuDe="Thông tin hoá đơn" onDong={onDong} chan={<>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn pri" onClick={dongY}>Đồng ý</button>
    </>}>
      <div className="hddt-bang hddt-hai">
        <Dong nhan="Ngày hoá đơn" bb loi={daThu && !ngay}>
          <ONgay value={ngay} onChange={setNgay} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn" />
        </Dong>
        <Dong nhan="Mẫu số - Ký hiệu" bb loi={daThu && !KY_HIEU_DU.test(kyHieu)}>
          <OKyHieu h={h} id="vat" value={kyHieu} onChange={setKyHieu} />
        </Dong>
      </div>
      <FormKhach k={k} dat={p => setK(x => ({ ...x, ...p }))} daThu={daThu} />
    </Vo>
  )
}

/** Hoá đơn điện tử lấy từ nhà cung cấp (T789): chưa kết nối, hoặc thông tin hoá đơn chưa khớp (thiếu mã CQT, số, ký hiệu sai)
 *  thì không lấy được bản hoá đơn, không tải PDF, XML. Trả lý do, lấy được thì null */
function loiLayHd(s: Session, hd: HdDaXuat): string | null {
  const h = cauHinhHddt(s)
  if (!h.bat || !h.daKetNoi) return `Chưa kết nối ${NCC_HDDT} nên không lấy được hoá đơn. Kết nối ở Cấu hình kế toán, thẻ Hoá đơn điện tử`
  if (!/^\d{8}$/.test(hd.so) || !KY_HIEU_DU.test(hd.mau + hd.kyHieu) || (hd.kyHieu[0] === 'C' && !hd.ma))
    return `Thông tin hoá đơn số ${hd.so} chưa khớp với ${NCC_HDDT} nên không lấy được bản hoá đơn`
  return null
}

/** Thông tin đủ của hoá đơn đã xuất để xem (T789): tiền, người mua, người bán, dòng hàng của chứng từ */
function ttXemHd(s: Session, r: Row, hd: HdDaXuat) {
  const h = cauHinhHddt(s)
  const tien = { ...tienCua(r), ...(hd.truoc !== undefined ? { truoc: hd.truoc, thue: hd.thue ?? 0, tong: hd.tong ?? 0 } : {}) }
  const mau2 = hd.mau === '2'
  // Mẫu 2: tiền thuế trên hoá đơn bằng 0, giảm trừ thuế lấy theo chứng từ, cộng tiền hàng là tổng cộng giảm trừ
  const giamTru = mau2 ? Number(r.giamThue) || tien.thue : 0
  const congHang = mau2 ? tien.tong + giamTru : tien.truoc
  const khongLay = khongLayCua(r)
  const k: TtKhach = khongLay ? { ...KHACH_TRONG, tenNm: h.tenKhachLe || KHACH_LE_HD } : khachMacDinh(r)
  const dong = ((r._dong as Dong[] | undefined) ?? []).filter(d => d.ten)
  return {
    h, tien, mau2, giamTru, congHang, khongLay, k, dong,
    ts: tien.truoc ? Math.round((tien.thue / tien.truoc) * 100) : 0,
    giamCk: dong.reduce((a, d) => a + (d.giam || 0) + (d.ck || 0), 0),
    phiDv: dong.reduce((a, d) => a + (d.phiDv || 0), 0),
    dv: DON_VI.find(d => d.id === s.donVi) ?? DON_VI[0],
    tenMau: TEN_MAU[mau2 ? 2 : 1],
  }
}
type TtXem = ReturnType<typeof ttXemHd>
const boCach = (v: string) => v.replace(/\s/g, '')
const ngayChu = (d: string) => { const [n, t, y] = d.split('/'); return `Ngày ${n} tháng ${t} năm ${y}` }

/** Mã QR tra cứu giả lập: 3 ô định vị ở góc, phần còn lại sinh theo số hoá đơn */
function MaQr({ so }: { so: string }) {
  const n = 21
  let hat = Number(so) || 1
  const o: ReactNode[] = []
  const goc = (r: number, c: number): number => {
    for (const [gr, gc] of [[0, 0], [0, 14], [14, 0]]) {
      const dr = r - gr, dc = c - gc
      if (dr >= 0 && dr < 7 && dc >= 0 && dc < 7) return dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) ? 1 : 0
      if (dr >= -1 && dr <= 7 && dc >= -1 && dc <= 7) return 0
    }
    return -1
  }
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    hat = (hat * 9301 + 49297) % 233280
    const g = goc(r, c)
    if (g === 1 || (g === -1 && hat / 233280 > 0.52)) o.push(<rect key={r * n + c} x={c} y={r} width={1.02} height={1.02} />)
  }
  return <svg className="hdx-qr" viewBox="-1 -1 23 23" role="img" aria-label="Mã QR tra cứu hoá đơn">{o}</svg>
}

/** Bản thể hiện hoá đơn điện tử như nhà cung cấp trả về (T789): khung viền, người bán, tiêu đề, ký hiệu, số, mã CQT,
 *  người mua, bảng hàng có hàng số cột, tổng, bằng chữ, mã QR, chữ ký số người bán */
function BanHd({ hd, t }: { hd: HdDaXuat; t: TtXem }) {
  const { k, dv, mau2, tien } = t
  const cty = k.loai === 'cty' && !t.khongLay
  const coTs = !mau2
  const soCot = coTs ? 7 : 6
  return (
    <div className="hdx-giay">
      <div className="hdx-vien"><div className="hdx-vien2">
        <div className="hdx-ban">
          <div className="hdx-logo">{dv.viettat}</div>
          <div>
            <b className="hdx-ten-ban">{dv.ten}</b>
            <div>Mã số thuế: <b className="hdx-mst">{boCach(dv.mst)}</b></div>
            <div>Địa chỉ: {dv.diaChi}</div>
          </div>
        </div>
        <div className="hdx-tieu">
          <span />
          <div className="hdx-tieu-giua">
            <b>{t.tenMau.toUpperCase().replace('GTGT', 'GIÁ TRỊ GIA TĂNG')}</b>
            <i>(Bản thể hiện của hoá đơn điện tử)</i>
            <i>{ngayChu(hd.ngay)}</i>
            {hd.ma && <span>Mã của cơ quan thuế: <b className="code">{hd.ma}</b></span>}
          </div>
          <div className="hdx-so">
            <span>Ký hiệu: <b className="code">{hd.kyHieu}</b></span>
            <span>Số: <b className="code do">{hd.so}</b></span>
          </div>
        </div>
        <div className="hdx-mua">
          <div><span>Họ tên người mua hàng:</span><b>{k.tenNm}</b></div>
          {cty && <div><span>Tên đơn vị:</span><b>{k.tenDv.toUpperCase()}</b></div>}
          <div><span>Mã số thuế:</span><b className="hdx-mst">{cty ? k.mst : ''}</b>
            {cty ? <><span>Mã ĐV QHNS:</span><b className="hep">{k.maQhns}</b></> : <><span>CCCD:</span><b className="hep">{k.cccd}</b></>}</div>
          <div><span>Địa chỉ:</span><b>{k.diaChi}</b></div>
          <div><span>Hình thức thanh toán:</span><b>TM/CK</b><span>Đồng tiền:</span><b className="hep">VND</b></div>
        </div>
        <table className="hdx-bh">
          <thead>
            <tr><th>STT</th><th>Tên hàng hoá, dịch vụ</th><th>Đơn vị tính</th><th>Số lượng</th><th>Đơn giá</th>{coTs && <th>Thuế suất</th>}<th>Thành tiền</th></tr>
            <tr className="cs"><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td>{coTs && <td>6</td>}<td>{coTs ? '7 = 4 x 5' : '6 = 4 x 5'}</td></tr>
          </thead>
          <tbody>
            {t.dong.map((d, i) => (
              <tr key={i}><td className="g">{i + 1}</td><td>{d.ten}</td><td className="g">{d.dvt}</td><td className="num">{money(d.sl)}</td>
                <td className="num">{money(d.gia)}</td>{coTs && <td className="g">{d.ts}%</td>}<td className="num">{money(d.tien)}</td></tr>
            ))}
            {t.giamCk > 0 && <tr><td className="g">{t.dong.length + 1}</td><td><i>Chiết khấu thương mại</i></td><td /><td /><td />{coTs && <td />}<td className="num">-{money(t.giamCk)}</td></tr>}
            {t.phiDv > 0 && <tr><td className="g">{t.dong.length + (t.giamCk > 0 ? 2 : 1)}</td><td><i>Phí dịch vụ</i></td><td /><td /><td />{coTs && <td />}<td className="num">{money(t.phiDv)}</td></tr>}
            <tr className="trong"><td colSpan={soCot} /></tr>
            <tr><td colSpan={soCot - 1} className="phai">Cộng tiền hàng:</td><td className="num b">{money(t.congHang)}</td></tr>
            {mau2
              ? <tr><td colSpan={soCot - 1} className="phai">Giảm trừ thuế (20% mức tỷ lệ % để tính thuế GTGT):</td><td className="num b">-{money(t.giamTru)}</td></tr>
              : <tr><td colSpan={3}>Thuế suất GTGT: <b>{t.ts}%</b></td><td colSpan={soCot - 4} className="phai">Tiền thuế GTGT:</td><td className="num b">{money(tien.thue)}</td></tr>}
            <tr><td colSpan={soCot - 1} className="phai b">Tổng tiền thanh toán:</td><td className="num b">{money(tien.tong)}</td></tr>
            <tr><td colSpan={soCot}>Số tiền viết bằng chữ: <i className="b">{docSoTien(tien.tong)}.</i></td></tr>
          </tbody>
        </table>
        <div className="hdx-ky">
          <div><b>NGƯỜI MUA HÀNG</b><i>(Chữ ký số (nếu có))</i></div>
          <div className="hdx-qr-o"><MaQr so={hd.so} /><small>Quét để tra cứu</small></div>
          <div><b>NGƯỜI BÁN HÀNG</b><i>(Chữ ký điện tử, chữ ký số)</i>
            <div className="hdx-dau"><Icon n="check" className="ic" />
              <span><b>Signature Valid</b><br />Ký bởi: {dv.ten.toUpperCase()}<br />Ký ngày: {hd.ngay}</span></div>
          </div>
        </div>
        <div className="hdx-chan-giay">
          Tra cứu hoá đơn tại trang tra cứu của {NCC_HDDT}{hd.traCuu && <> · Mã tra cứu: <b className="code">{hd.traCuu}</b></>}<br />
          <i>(Cần kiểm tra, đối chiếu khi lập, giao, nhận hoá đơn)</i>
        </div>
      </div></div>
    </div>
  )
}

/** Popup xem hoá đơn đã xuất (T785, T789): mở từ ô Số hoá đơn trên form, cột Trạng thái xuất HĐĐT ở danh sách, menu Hoá đơn điện tử.
 *  Mở thẳng bản hoá đơn nhà cung cấp trả về; nút quay lại sang Thông tin hoá đơn điện tử (số, ký hiệu, ngày, thông tin VAT, tiền) */
export function HopXemHd({ s, r, hd, onDong, toast }: { s: Session; r: Row; hd: HdDaXuat; onDong: () => void; toast: (m: string) => void }) {
  // Bấm số hoá đơn, mắt xem: mở thẳng bản hoá đơn điện tử; lấy không được từ nhà cung cấp thì mở thông tin hoá đơn (T789)
  const [xemBan, setXemBan] = useState(() => !loiLayHd(s, hd))
  const [dangIn, setDangIn] = useState(false)
  useDongEsc(onDong)
  const t = ttXemHd(s, r, hd)
  const { k, tien, mau2 } = t
  const loi = loiLayHd(s, hd)
  /** Thao tác cần bản hoá đơn từ nhà cung cấp: lấy không được thì báo lý do */
  const layNcc = (lam: () => void) => () => (loi ? toast(loi) : lam())
  // In: chỉ in vùng hoá đơn, xong thì bỏ lớp in khỏi body
  useEffect(() => {
    if (!dangIn) return
    document.body.classList.add('in-hdx')
    const xong = () => setDangIn(false)
    window.addEventListener('afterprint', xong)
    const r1 = requestAnimationFrame(() => window.print())
    return () => { cancelAnimationFrame(r1); window.removeEventListener('afterprint', xong); document.body.classList.remove('in-hdx') }
  }, [dangIn])
  const daGuiMail = t.h.guiEmail && !t.khongLay && Boolean(k.email)
  // Popup thông tin: tiêu đề chung, số hoá đơn nằm ở dải dưới; bản hoá đơn: ghi ký hiệu, số
  const tieuDe = (ban: boolean) => <>{ban ? <>Hoá đơn điện tử <span className="code">{hd.mau}{hd.kyHieu}</span> số <span className="code hdx-do">{hd.so}</span></> : 'Thông tin hoá đơn điện tử'}
    <span className="ph-tt da">Hợp lệ</span>{!ban && daGuiMail && <span className="ph-tt hdx-mail">Đã gửi email</span>}</>
  const nutTai = <>
    <button type="button" className="xp-btn-outline" onClick={layNcc(() => toast(`Đã tải PDF hoá đơn số ${hd.so}`))}><Icon n="download" className="ic sm" />Tải PDF</button>
    <button type="button" className="xp-btn-outline" onClick={layNcc(() => toast(`Đã tải XML hoá đơn số ${hd.so}`))}><Icon n="download" className="ic sm" />Tải XML</button>
  </>

  if (xemBan) return (
    <Vo lop="hdx hdx-xem-ban" tieuDe={<><button type="button" className="xp-btn-outline xp-btn-ic" title="Quay lại thông tin hoá đơn" aria-label="Quay lại thông tin hoá đơn"
      onClick={() => setXemBan(false)}><Icon n="chevl" className="ic sm" /></button>{tieuDe(true)}</>} onDong={onDong} chan={<>
      {nutTai}
      <button type="button" className="xp-btn-outline" onClick={() => toast(`Đã tạo link chia sẻ PDF hoá đơn số ${hd.so}`)}><Icon n="link" className="ic sm" />Chia sẻ PDF</button>
      <span className="grow" />
      <button type="button" className="xp-btn-outline" onClick={onDong}>Đóng</button>
      <button type="button" className="xp-btn-sua" onClick={() => setDangIn(true)}><Icon n="printer" className="ic sm" />In hoá đơn</button>
    </>}>
      <div className="hdx-nen-giay"><BanHd hd={hd} t={t} /></div>
    </Vo>
  )

  // Thông tin nào trống thì ẩn cả dòng
  const o = (nhan: string, gt: ReactNode, lop = '') => (gt ? <><span>{nhan}</span><b className={lop}>{gt}</b></> : null)
  return (
    <Vo lop="hdx" tieuDe={tieuDe(false)} onDong={onDong} chan={<>
      {nutTai}
      <span className="grow" />
      <button type="button" className="xp-btn-outline" onClick={onDong}>Đóng</button>
      <button type="button" className="xp-btn-sua" onClick={layNcc(() => setXemBan(true))}><Icon n="eye" className="ic sm" />Xem hoá đơn điện tử</button>
    </>}>
      <div className="hdx-tom ba">
        <div><span>Số hoá đơn</span><b className="code hdx-do">{hd.so}</b></div>
        <div><span>Mẫu số - Ký hiệu</span><b><span className="code">{hd.mau}{hd.kyHieu}</span> <small>· {t.tenMau}</small></b></div>
        <div><span>Ngày hoá đơn</span><b>{hd.ngay}</b></div>
      </div>
      <section className="hdx-the">
        <h4>Thông tin VAT trên hoá đơn <span className="ph-tt">{k.loai === 'cty' ? 'Công ty' : 'Cá nhân'}</span></h4>
        {t.khongLay
          ? <div className="hdx-luoi">{o('Tên người mua', k.tenNm)}{o('Ghi chú', 'Người mua không lấy hoá đơn')}</div>
          : <div className="hdx-hai-cot">
            <div className="hdx-luoi">
              {k.loai === 'cty' ? <>{o('Tên đơn vị', k.tenDv)}{o('Mã số thuế', k.mst && <span className="code">{k.mst}</span>)}</>
                : <>{o('Tên người mua', k.tenNm)}{o('Căn cước công dân', k.cccd)}</>}
              {o('Địa chỉ', k.diaChi)}
            </div>
            <div className="hdx-luoi">
              {k.loai === 'cty' ? <>{o('Người mua hàng', k.tenNm)}{o('Email nhận hoá đơn', k.email)}{o('Mã ĐV QHNS', k.maQhns)}</>
                : <>{o('Số điện thoại', k.sdt)}{o('Email nhận hoá đơn', k.email)}{o('Số hộ chiếu', k.hoChieu)}</>}
            </div>
          </div>}
      </section>
      <section className="hdx-the">
        <h4>Tiền hoá đơn</h4>
        {/* Khấu trừ: thuế suất trên hoá đơn đã là mức giảm, không có giảm trừ thuế (QD106); tiền thuế luôn hiện, giảm trừ thuế chỉ mẫu 2 (hoá đơn bán hàng) và khác 0 */}
        <div className="hdx-so-tien">
          <div><span>Tổng tiền trước thuế</span><b>{money(t.congHang)}</b></div>
          <div><span>Tiền thuế{!mau2 && ` (${t.ts}%)`}</span><b>{money(mau2 ? 0 : tien.thue)}</b></div>
          {mau2 && t.giamTru !== 0 && <div><span>Giảm trừ thuế</span><b>-{money(t.giamTru)}</b></div>}
          <div className="tong"><span>Tổng tiền hoá đơn</span><b>{money(tien.tong)}</b></div>
        </div>
      </section>
    </Vo>
  )
}

/** Popup phát hành hoá đơn điện tử: từ form một chứng từ thì nhập thông tin khách hàng; từ danh sách thì bảng mỗi chứng từ một dòng (T765, T785) */
export function HopXuatHddt({ s, man, ds, onDong, toast, nhieu }: { s: Session; man: string; ds: Row[]; onDong: () => void; toast: (m: string) => void; nhieu?: boolean }) {
  // Giữ danh sách lúc mở: phát hành xong chứng từ đổi trạng thái nhưng popup vẫn hiện đủ để xem kết quả
  const [goc] = useState(ds)
  const duoc = goc.filter(r => r.nguon !== 'FABi' && !hdCua(r) && loaiCtCua(r) === 'XBAN')   // hoá đơn thay thế, điều chỉnh phát hành ở form; huỷ bán không xuất (T787)
  const boQua = goc.length - duoc.length
  // Nút Xuất HĐĐT trên danh sách (nhieu) luôn mở bảng: ngày, mẫu số - ký hiệu, thông tin VAT từng chứng từ; dòng nào bấm Thay đổi mới mở form VAT.
  // Link Xuất trên một dòng, nút ở chân form mở thẳng form Xuất HĐĐT của chứng từ đó (T785)
  if (duoc.length > 1 || (nhieu && duoc.length)) return <HopHangLoat s={s} man={man} ds={duoc} boQua={boQua} onDong={onDong} />
  return <HopMot s={s} man={man} r={duoc[0]} boQua={boQua} onDong={onDong} toast={toast} />
}

function HopMot({ s, man, r, boQua, onDong, toast }: { s: Session; man: string; r?: Row; boQua: number; onDong: () => void; toast: (m: string) => void }) {
  useDongEsc(onDong)
  const h = cauHinhPhatHanh(s)
  const [ngay, setNgay] = useState(dmy(HOM_NAY))
  const [kyHieu, setKyHieu] = useState(r ? kyHieuCua(h, r) : '')   // gồm mẫu số, vd 1C26TAA; mặc định theo Cấu hình kế toán, sửa tay được
  const tenKl = h.tenKhachLe || KHACH_LE_HD
  // Khách không lấy hoá đơn (khách lẻ): điền sẵn Cá nhân, tên người mua theo khai báo, vd "Bán cho người tiêu dùng"; sửa được
  const [k, setK] = useState<TtKhach>(() => (r ? khachPopup(r, tenKl) : KHACH_TRONG))
  const [daThu, setDaThu] = useState(false)   // bấm Xuất HĐĐT rồi mới tô đỏ ô bắt buộc còn trống
  const dat = (p: Partial<TtKhach>) => setK(x => ({ ...x, ...p }))
  if (!r) return <Vo onDong={onDong}><Note kind="warn">Các chứng từ đã chọn đều đã có hoá đơn hoặc là hoá đơn FABi xuất tại máy POS.</Note></Vo>
  const kyHieuSai = !KY_HIEU_DU.test(kyHieu)
  const phatHanh = () => {
    if (!ngay || kyHieuSai || thieuKhach(k)) { setDaThu(true); toast(kyHieuSai ? 'Ký hiệu hoá đơn gồm 7 ký tự, vd 1C26TAA' : 'Nhập đủ các ô có dấu *'); return }
    const khongLay = laNguoiTieuDung(k, tenKl)
    const hd = ghiHd(man, String(r.id), kyHieu[0], kyHieu.slice(1), ngay, k, khongLay, tenKl, tienCua(r))
    toast(`Đã xuất hoá đơn ${tenHd(hd)}${h.guiEmail && !khongLay && k.email ? `, đã gửi ${k.email}` : ''}`)
    onDong()
  }
  return (
    // Popup Xuất HĐĐT (T785): Ngày hoá đơn và Mẫu số - Ký hiệu cùng một dòng, dưới là Thông tin khách hàng Cá nhân hoặc Công ty
    <Vo hep tieuDe={<>Xuất hoá đơn điện tử · <span className="code">{r.so}</span></>} onDong={onDong} chan={<>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn pri" onClick={phatHanh}>Xuất HĐĐT</button>
    </>}>
      <div className="hddt-bang hddt-hai">
        <Dong nhan="Ngày hoá đơn" bb loi={daThu && !ngay}>
          <ONgay value={ngay} onChange={setNgay} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn" />
        </Dong>
        <Dong nhan="Mẫu số - Ký hiệu" bb loi={daThu && kyHieuSai}>
          <OKyHieu h={h} value={kyHieu} onChange={setKyHieu} />
        </Dong>
      </div>
      <FormKhach k={k} dat={dat} daThu={daThu} />
      <div className="hddt-tong"><span>Tổng tiền thanh toán</span><b>{money(Number(r.tong) || 0)}</b></div>
      {boQua > 0 && <Note kind="gray">Bỏ qua {boQua} chứng từ đã có hoá đơn hoặc là hoá đơn FABi.</Note>}
    </Vo>
  )
}

/** Ô Mẫu số - Ký hiệu: chọn trong danh sách ký hiệu đã khai báo hoặc gõ tay (gõ để lọc) */
export function OKyHieu({ h, value, onChange, className = 'hddt-inp code', id }: { h: CauHinhHddt; value: string; onChange: (v: string) => void; className?: string; id?: string }) {
  const ds = dsKyHieu(h)
  const dsId = `hddt-kh-${id ?? 'chung'}`
  return <>
    <input className={className} value={value} maxLength={7} placeholder="Gõ để lọc ký hiệu" aria-label="Mẫu số - Ký hiệu" list={dsId}
      title="Gồm mẫu số và ký hiệu, vd 1C26TAA; mặc định theo cửa hàng, cửa hàng không khai báo thì theo khai báo chung"
      onChange={e => onChange(e.target.value.toUpperCase().replace(/\s/g, ''))} />
    <datalist id={dsId}>{ds.map(x => <option key={x.v} value={x.v}>{x.t}</option>)}</datalist>
  </>
}

/** Kết quả phát hành một chứng từ: có hoá đơn hoặc lý do lỗi nhà cung cấp trả về */
interface Kq { hd?: HdDaXuat; loi?: string }
/** Người mua của một dòng trong popup xuất nhiều: thông tin khách và ô tích không lấy hoá đơn */
interface NguoiMuaDong { k: TtKhach; khongLay: boolean }

/** Ô người mua trên hoá đơn ở popup xuất nhiều: thông tin nào có thì hiện, không có thì ẩn (T785) */
function ONguoiMua({ nm, tenKl }: { nm: NguoiMuaDong; tenKl: string }) {
  const { k, khongLay } = nm
  if (khongLay) return <b>{tenKl}</b>
  const dong = k.loai === 'cty'
    ? [k.mst && `MST ${k.mst}`, k.diaChi, k.tenNm && `Người mua: ${k.tenNm}`, k.email]
    : [k.diaChi, k.sdt && `SĐT ${k.sdt}`, k.cccd && `CCCD ${k.cccd}`, k.hoChieu && `Hộ chiếu ${k.hoChieu}`, k.email]
  const ten = k.loai === 'cty' ? k.tenDv : k.tenNm
  return <>{ten ? <b>{ten}</b> : <b className="ph-loi">{thieuKhach(k)}</b>}{dong.filter(Boolean).map(x => <small key={String(x)}>{x}</small>)}</>
}

/** Phát hành hàng loạt (T765, T785): mỗi chứng từ một dòng, sửa ngày hoá đơn, ký hiệu từng dòng hoặc áp dụng cho tất cả,
 *  người mua hiện đủ thông tin, Sửa mở popup Thông tin hoá đơn; gửi lần lượt có tiến trình, bảng kết quả, phát hành lại dòng lỗi */
function HopHangLoat({ s, man, ds, boQua, onDong }: { s: Session; man: string; ds: Row[]; boQua: number; onDong: () => void }) {
  const h = cauHinhPhatHanh(s)
  const tenKl = h.tenKhachLe || KHACH_LE_HD
  const id = (r: Row) => String(r.id)
  const [buoc, setBuoc] = useState<'kt' | 'dang' | 'xong'>('kt')
  const [sua, setSua] = useState<{ id: string; nm: NguoiMuaDong; ngay: string; kyHieu: string; daThu: boolean } | null>(null)   // đang sửa thông tin hoá đơn của một chứng từ
  const dong = useCallback(() => { if (sua) setSua(null); else if (buoc !== 'dang') onDong() }, [buoc, onDong, sua])
  useDongEsc(dong)
  const [ngayChung, setNgayChung] = useState(dmy(HOM_NAY))
  const [kyChung, setKyChung] = useState('')   // trống là theo cửa hàng của từng chứng từ
  const [rieng, setRieng] = useState<Record<string, { ngay?: string; kyHieu?: string }>>({})   // ngày, ký hiệu sửa riêng từng dòng
  const [nm, setNm] = useState<Record<string, NguoiMuaDong>>(() => Object.fromEntries(ds.map(r => [id(r), { k: khachMacDinh(r), khongLay: khongLayCua(r) }])))
  const [kq, setKq] = useState<Record<string, Kq>>({})
  const [hang, setHang] = useState<string[]>([])   // chứng từ gửi trong lượt này, theo thứ tự
  const [daGui, setDaGui] = useState(0)
  const daLoi = useRef(false)   // giả lập nhà cung cấp trả lỗi một lần để có dòng phát hành lại

  const ngayCua = (r: Row) => rieng[id(r)]?.ngay ?? ngayChung
  const kyCua = (r: Row) => rieng[id(r)]?.kyHieu ?? (kyChung || kyHieuCua(h, r))
  const loiCua = (r: Row) => (!ngayCua(r) ? 'Thiếu ngày hoá đơn' : !KY_HIEU_DU.test(kyCua(r)) ? 'Ký hiệu chưa đúng' : nm[id(r)].khongLay ? null : thieuKhach(nm[id(r)].k))
  const sanSang = ds.filter(r => !loiCua(r))
  const thieu = ds.length - sanSang.length
  const gui = (ids: string[]) => { setHang(ids); setDaGui(0); setBuoc('dang') }
  const datRieng = (r: Row, p: { ngay?: string; kyHieu?: string }) => setRieng(x => ({ ...x, [id(r)]: { ...x[id(r)], ...p } }))

  useEffect(() => {
    if (buoc !== 'dang') return
    if (daGui >= hang.length) { setBuoc('xong'); return }
    const t = setTimeout(() => {
      const ma = hang[daGui]
      const r = ds.find(x => id(x) === ma)!
      // Lượt từ 3 hoá đơn trở lên: hoá đơn cuối bị trả lỗi một lần, gửi lại thì được
      if (!daLoi.current && hang.length >= 3 && daGui === hang.length - 1) {
        daLoi.current = true
        setKq(x => ({ ...x, [ma]: { loi: `${NCC_HDDT} không phản hồi, chưa cấp số hoá đơn` } }))
      } else {
        const kh7 = rieng[ma]?.kyHieu ?? (kyChung || kyHieuCua(h, r))
        const hd = ghiHd(man, ma, kh7[0], kh7.slice(1), rieng[ma]?.ngay ?? ngayChung, nm[ma].k, nm[ma].khongLay, tenKl, tienCua(r))
        setKq(x => ({ ...x, [ma]: { hd } }))
      }
      setDaGui(n => n + 1)
    }, 300)
    return () => clearTimeout(t)
  }, [buoc, daGui, hang, ds, h, man, ngayChung, kyChung, rieng, nm, tenKl])

  // Popup Thông tin hoá đơn của một chứng từ: Ngày hoá đơn và Mẫu số - Ký hiệu cùng một dòng, dưới là người mua; Đồng ý thì lưu luôn vào chứng từ
  if (sua) {
    const r = ds.find(x => id(x) === sua.id)!
    const datK = (p: Partial<TtKhach>) => setSua(x => (x ? { ...x, nm: { ...x.nm, k: { ...x.nm.k, ...p } } } : x))
    const luu = () => {
      if (!sua.ngay || !KY_HIEU_DU.test(sua.kyHieu) || thieuKhach(sua.nm.k)) { setSua({ ...sua, daThu: true }); return }
      const moi: NguoiMuaDong = { k: sua.nm.k, khongLay: laNguoiTieuDung(sua.nm.k, tenKl) }
      setNm(x => ({ ...x, [sua.id]: moi }))
      datRieng(r, { ngay: sua.ngay, kyHieu: sua.kyHieu })
      suaPhieu(man, sua.id, { _khachHd: moi.k, _khongLayHd: moi.khongLay })
      setSua(null)
    }
    return (
      <Vo hep tieuDe={<>Thông tin hoá đơn · <span className="code">{r.so}</span></>} onDong={() => setSua(null)} chan={<>
        <button type="button" className="btn" onClick={() => setSua(null)}>Huỷ</button>
        <button type="button" className="btn pri" onClick={luu}>Đồng ý</button>
      </>}>
        <div className="hddt-bang hddt-hai">
          <Dong nhan="Ngày hoá đơn" bb loi={sua.daThu && !sua.ngay}>
            <ONgay value={sua.ngay} onChange={v => setSua(x => (x ? { ...x, ngay: v } : x))} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn" />
          </Dong>
          <Dong nhan="Mẫu số - Ký hiệu" bb loi={sua.daThu && !KY_HIEU_DU.test(sua.kyHieu)}>
            <OKyHieu h={h} id="sua" value={sua.kyHieu} onChange={v => setSua(x => (x ? { ...x, kyHieu: v } : x))} />
          </Dong>
        </div>
        <FormKhach k={sua.nm.k} dat={datK} daThu={sua.daThu} />
      </Vo>
    )
  }

  if (buoc !== 'kt') {
    const dsKq = ds.filter(r => kq[id(r)])
    const loi = dsKq.filter(r => kq[id(r)].loi)
    const ok = dsKq.length - loi.length
    const chuaGui = ds.length - dsKq.length
    const chan = buoc === 'xong' && <>
      {loi.length > 0 && <button type="button" className="btn" onClick={() => gui(loi.map(id))}>Xuất lại {loi.length} dòng lỗi</button>}
      <button type="button" className="btn pri" onClick={onDong}>Đóng</button>
    </>
    return (
      <Vo rong onDong={dong} chan={chan}>
        {buoc === 'dang' ? (
          <div className="ph-tien">
            <span>Đang xuất {Math.min(daGui + 1, hang.length)}/{hang.length} hoá đơn qua {NCC_HDDT}</span>
            <div className="ph-thanh"><i style={{ width: `${Math.round((daGui / hang.length) * 100)}%` }} /></div>
          </div>
        ) : (
          <Note kind={loi.length ? 'warn' : ''} icon={loi.length ? 'info' : 'check'}>
            Đã xuất {ok} hoá đơn{loi.length ? `, ${loi.length} hoá đơn lỗi chưa được cấp số` : ''}
            {chuaGui ? `. ${chuaGui} chứng từ thiếu thông tin vẫn chưa xuất` : ''}.
          </Note>
        )}
        <div className="hddt-ds hddt-kq">
          <div className="hddt-dong hddt-dau"><span>Số chứng từ</span><span>Công ty</span><span>Người mua</span><span>Tổng tiền</span><span>Kết quả</span></div>
          {dsKq.map(r => {
            const x = kq[id(r)]
            const { k, khongLay } = nm[id(r)]
            const ten = khongLay ? tenKl : k.tenNm
            return (
              <div key={id(r)} className="hddt-dong">
                <span className="code">{r.so}</span><span title={tenCty(k)}>{khongLay ? '' : tenCty(k)}</span><span title={ten}>{ten}</span>
                <span className="num">{money(Number(r.tong) || 0)}</span>
                {x.hd ? <span className="ph-ok" title={`Mã cơ quan thuế ${x.hd.ma}`}>Đã xuất {tenHd(x.hd)}</span>
                  : <span className="ph-loi" title={x.loi}>{x.loi}</span>}
              </div>
            )
          })}
        </div>
      </Vo>
    )
  }

  const cong = (f: (t: TienHd) => number) => sanSang.reduce((a, r) => a + f(tienCua(r)), 0)
  return (
    <Vo rong tieuDe={`Xuất hoá đơn điện tử · ${ds.length} chứng từ`} onDong={onDong} chan={<>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn pri" disabled={!sanSang.length} onClick={() => gui(sanSang.map(id))}>
        Xuất hoá đơn
      </button>
    </>}>
      <div className="hddt-bang hddt-hai">
        <Dong nhan="Ngày hoá đơn" phu="Áp dụng cho tất cả" bb loi={!ngayChung}>
          <ONgay value={ngayChung} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn áp dụng cho tất cả"
            onChange={v => { setNgayChung(v); setRieng(x => Object.fromEntries(Object.entries(x).map(([k, o]) => [k, { ...o, ngay: undefined }]))) }} />
        </Dong>
        <Dong nhan="Ký hiệu" phu="Áp dụng cho tất cả">
          <Select className="hddt-inp" value={kyChung} aria-label="Ký hiệu áp dụng cho tất cả"
            onChange={e => { setKyChung(e.target.value); setRieng(x => Object.fromEntries(Object.entries(x).map(([k, o]) => [k, { ...o, kyHieu: undefined }]))) }}
            ds={[{ v: '', t: 'Theo cửa hàng của chứng từ' }, ...dsKyHieu(h).map(x => ({ v: x.v, t: `${x.v} · ${x.t}` }))]} />
        </Dong>
      </div>
      {thieu > 0 && <Note kind="warn">{thieu} chứng từ thiếu thông tin. Bấm Thay đổi ở dòng đó để bổ sung, chứng từ thiếu thông tin chưa được xuất.</Note>}
      <div className="hddt-ds hddt-lo">
        <div className="hddt-dong hddt-dau">
          <span>Số chứng từ</span><span>Ngày hoá đơn</span><span>Mẫu số · Ký hiệu</span><span>Người mua trên hoá đơn</span>
          <span className="num">Trước thuế</span><span className="num">Tiền thuế</span><span className="num">Tổng tiền</span>
        </div>
        {ds.map(r => {
          const t = tienCua(r)
          const loi = loiCua(r)
          return (
            <div key={id(r)} className={`hddt-dong${loi ? ' thieu' : ''}`}>
              <span className="code">{r.so}</span>
              <span><ONgay value={ngayCua(r)} onChange={v => datRieng(r, { ngay: v })} inputClassName="hddt-inp nho" ariaLabel={`Ngày hoá đơn ${r.so}`} /></span>
              <span><OKyHieu h={h} id={id(r)} className="hddt-inp nho code" value={kyCua(r)} onChange={v => datRieng(r, { kyHieu: v })} /></span>
              <span className="hddt-nm">
                <span className="hddt-nm-tt"><ONguoiMua nm={nm[id(r)]} tenKl={tenKl} /></span>
                <button type="button" className="ph-nut" onClick={() => setSua({ id: id(r), nm: { ...nm[id(r)], k: nm[id(r)].khongLay ? { ...KHACH_TRONG, tenNm: tenKl } : { ...nm[id(r)].k } }, ngay: ngayCua(r), kyHieu: kyCua(r), daThu: Boolean(loi) })}>Thay đổi</button>
              </span>
              <span className="num">{money(t.truoc)}</span><span className="num">{money(t.thue)}</span><span className="num">{money(t.tong)}</span>
            </div>
          )
        })}
        <div className="hddt-dong hddt-cong">
          <span>Cộng</span><span /><span /><span />
          <span className="num">{money(cong(t => t.truoc))}</span><span className="num">{money(cong(t => t.thue))}</span><span className="num">{money(cong(t => t.tong))}</span>
        </div>
      </div>
      <Note kind="gray">Mỗi chứng từ một hoá đơn. Bấm Thay đổi ở dòng nào thì mở Thông tin hoá đơn của chứng từ đó; Đồng ý thì lưu luôn vào chứng từ.
        {boQua > 0 ? ` Bỏ qua ${boQua} chứng từ đã xuất hoá đơn hoặc là hoá đơn FABi.` : ''}</Note>
    </Vo>
  )
}
