// Xuất hoá đơn điện tử từ chứng từ bán hàng lập tay gói Plus (T763): thiết lập ở Cấu hình kế toán, popup xem trước rồi phát hành
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Row } from '../types'
import { gtgtTyLe, type Session } from '../../app/session'
import { CUA_HANG, HOM_NAY, KHACH, NHAN_VIEN } from '../../data/mock'
import { Select } from '../../ui/Dropdown'
import { Note } from '../../ui/Page'
import { dmy, money } from '../../ui/format'
import { useDongEsc } from '../../ui/LocNangCao'
import { ONgay } from '../../ui/ChonNgay'
import { suaPhieu } from '../../ui/generic/daXoa'
import { ttNghiepVu } from '../../ui/generic/gen'

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
  giamThue: boolean                      // ghi giảm thuế GTGT theo nghị quyết đang khai ở thẻ Giảm thuế GTGT
  cuaHang: Record<string, KyHieuCh>      // mẫu số, ký hiệu theo cửa hàng
  guiEmail: boolean
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
    giamThue: true, guiEmail: true,
    cuaHang: Object.fromEntries(CUA_HANG.map((c, i): [string, KyHieuCh] => [c.id, i === 0 ? { mau, kyHieu: KY_HIEU_MAC_DINH }
      : i === 1 ? { mau, kyHieu: KY_HIEU_MAC_DINH.slice(0, 3) + 'MAB' } : { mau: '', kyHieu: '' }])),
  }
  // Bản lưu trước T784 có kyHieu là bảng theo cửa hàng: bỏ, dùng mặc định
  const { kyHieu, ...con } = da
  return { ...goc, ...con, ...(typeof kyHieu === 'string' ? { kyHieu } : {}), cuaHang: { ...goc.cuaHang, ...con.cuaHang } }
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

/** Thẻ Hoá đơn điện tử ở Cấu hình kế toán (T784): kết nối iPOS Invoice, thông tin mặc định, mẫu số và ký hiệu theo cửa hàng.
 *  nq: nghị quyết giảm thuế GTGT đang khai, null khi chưa có nghị quyết nào đang bật */
export function TheCauHinhHddt({ s, h, nq, dat, toast }: { s: Session; h: CauHinhHddt; nq: string | null; dat: (h: CauHinhHddt) => void; toast: (m: string) => void }) {
  const kiemTra = () => {
    if (!h.tk.trim() || !h.mk) { toast('Nhập tài khoản, mật khẩu trước khi kiểm tra kết nối'); return }
    dat({ ...h, daKetNoi: true }); toast(`Kết nối ${NCC_HDDT} thành công`)
  }
  const goiY = mauSoHd(s)
  const dsMau = (['1', '2'] as const).map(v => ({ v, t: `${v} · ${TEN_MAU[v]}${v === goiY ? ' (gợi ý)' : ''}` }))
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
            <div className="f"><label>Mẫu số chung</label>
              <Select className="inp" value={h.mau} aria-label="Mẫu số chung" onChange={e => dat({ ...h, mau: e.target.value as '1' | '2' })} ds={dsMau} /></div>
            <div className="f"><label>Ký hiệu chung</label>
              <input className="inp code" value={h.kyHieu} maxLength={6} aria-label="Ký hiệu chung" placeholder={KY_HIEU_MAC_DINH}
                onChange={e => dat({ ...h, kyHieu: e.target.value.toUpperCase().replace(/\s/g, '') })} /></div>
          </div>
          {/* Chỉ đơn vị tính GTGT theo % doanh thu mới có công tắc giảm thuế; khấu trừ ghi thẳng thuế suất đã giảm (vd 8%) trên dòng hàng nên không cần (QD106) */}
          {gtgtTyLe(s) && <label className={`ch-hd-giam${nq ? '' : ' tat'}`}>
            <input type="checkbox" className="bat-tat" checked={Boolean(nq) && h.giamThue} disabled={!nq} onChange={e => dat({ ...h, giamThue: e.target.checked })} />
            {nq ? `Áp dụng giảm thuế GTGT trên hoá đơn theo Nghị quyết ${nq} (khai ở thẻ Giảm thuế GTGT)`
              : 'Áp dụng giảm thuế GTGT trên hoá đơn: chưa có nghị quyết đang bật ở thẻ Giảm thuế GTGT'}
          </label>}
        </div>
        <div className="ch-hd-khoi">
          <h4>Mẫu số, ký hiệu theo cửa hàng</h4>
          <div className="ch-hd-bang">
            <div className="ch-hd-dong dau"><span>Cửa hàng</span><span>Mẫu số</span><span>Ký hiệu</span><span>Đang dùng khi xuất</span></div>
            {CUA_HANG.map(c => {
              const ch = h.cuaHang[c.id] ?? { mau: '', kyHieu: '' }
              const trong = !ch.mau && !ch.kyHieu.trim()
              const dung = kyHieuXuat(h, c.id)
              return (
                <div key={c.id} className="ch-hd-dong">
                  <span>{c.ten}</span>
                  <Select className="inp" value={ch.mau} aria-label={`Mẫu số ${c.ten}`} onChange={e => datCh(c.id, { mau: e.target.value as KyHieuCh['mau'] })}
                    ds={[{ v: '', t: 'Trống' }, { v: '1', t: '1' }, { v: '2', t: '2' }]} />
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
        <label className="ch-hd-mail"><input type="checkbox" checked={h.guiEmail} onChange={e => dat({ ...h, guiEmail: e.target.checked })} />
          Gửi hoá đơn cho người mua qua email sau khi phát hành</label>
      </>}
      <Note kind="gray">{h.bat
        ? <>Ký hiệu lấy theo thông báo phát hành trên phần mềm hoá đơn điện tử. Đây chỉ là mặc định: khi phát hành vẫn sửa được mẫu số, ký hiệu. Ký hiệu có chữ M ở vị trí thứ 4 (vd C26MAB) là hoá đơn khởi tạo từ máy tính tiền.</>
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

/** Phát hành hoá đơn cho chứng từ vừa lưu ở form lập tay (T785): Lưu và phát hành */
export function phatHanhHd(s: Session, man: string, id: string, kyHieu7: string, ngay: string, k: TtKhach, khongLay: boolean, tien: TienHd): HdDaXuat {
  return ghiHd(man, id, kyHieu7[0], kyHieu7.slice(1), ngay, k, khongLay, cauHinhHddt(s).tenKhachLe || KHACH_LE_HD, tien)
}

/** Một dòng nhãn bên trái, ô nhập bên phải như bảng */
function Dong({ nhan, bb, loi, children }: { nhan: string; bb?: boolean; loi?: boolean; children: ReactNode }) {
  return <div className={`hddt-o${loi ? ' loi' : ''}`}><span>{nhan}{bb && <em>*</em>}</span><div>{children}</div></div>
}

/** Chọn Cá nhân, Công ty và các ô thông tin khách hàng trên hoá đơn (QD106).
 *  Cá nhân: tên người mua, địa chỉ, số điện thoại, CCCD, số hộ chiếu, email; Công ty: MST (không bắt buộc), tên đơn vị, địa chỉ, tên người mua hàng, email, mã QHNS */
export function FormKhach({ k, dat, daThu, chiXem }: { k: TtKhach; dat: (p: Partial<TtKhach>) => void; daThu: boolean; chiXem?: boolean }) {
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
      <label><input type="radio" name="hddt-loai" checked={k.loai === 'cty'} disabled={chiXem} onChange={() => dat({ loai: 'cty' })} />Công ty</label>
    </div>
    <div className="hddt-bang">
      {k.loai === 'cty' ? <>
        {o('mst', 'Mã số thuế', 'Nhập mã số thuế')}
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
  </>
}

/** Khung popup phát hành: tiêu đề, nút đóng, thân, chân */
function Vo({ rong, hep, tieuDe = 'Phát hành hoá đơn điện tử', onDong, chan, children }: { rong?: boolean; hep?: boolean; tieuDe?: ReactNode; onDong: () => void; chan?: ReactNode; children: ReactNode }) {
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className={`ds-hop hddt-hop${rong ? ' rong' : ''}${hep ? ' hep' : ''}`} role="dialog" aria-modal="true" aria-label={typeof tieuDe === 'string' ? tieuDe : 'Hoá đơn điện tử'}>
        <div className="ds-hop-dau"><b>{tieuDe}</b><span className="grow" />
          <button type="button" className="icon-btn" aria-label="Đóng" title="Đóng" onClick={onDong}>×</button></div>
        <div className="hddt-than">{children}</div>
        {chan && <div className="hddt-chan">{chan}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Popup Thông tin xuất hoá đơn mở từ link Sửa, Xem ở ô Xuất HĐ cho của form lập tay (T785); chiXem thì chỉ đọc */
export function HopNguoiMua({ k0, chiXem, onDong, onDongY }: { k0: TtKhach; chiXem?: boolean; onDong: () => void; onDongY?: (k: TtKhach) => void }) {
  useDongEsc(onDong)
  const [k, setK] = useState(k0)
  const [daThu, setDaThu] = useState(false)
  const dongY = () => { if (thieuKhach(k)) { setDaThu(true); return } onDongY?.(k); onDong() }
  return (
    <Vo hep tieuDe="Thông tin xuất hoá đơn" onDong={onDong} chan={chiXem ? <button type="button" className="btn" onClick={onDong}>Đóng</button> : <>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn pri" onClick={dongY}>Đồng ý</button>
    </>}>
      <FormKhach k={k} dat={p => setK(x => ({ ...x, ...p }))} daThu={daThu} chiXem={chiXem} />
    </Vo>
  )
}

/** Popup xem hoá đơn đã phát hành (T785): mở từ ô Số hoá đơn trên form, cột Trạng thái xuất HĐĐT ở danh sách */
export function HopXemHd({ s, r, hd, onDong, toast }: { s: Session; r: Row; hd: HdDaXuat; onDong: () => void; toast: (m: string) => void }) {
  useDongEsc(onDong)
  const tien = { ...tienCua(r), ...(hd.truoc !== undefined ? { truoc: hd.truoc, thue: hd.thue ?? 0, tong: hd.tong ?? 0 } : {}) }
  const mau2 = hd.mau === '2'
  const ts = tien.truoc ? Math.round((tien.thue / tien.truoc) * 100) : 0
  const h = cauHinhHddt(s)
  const nguoiMua = hd.nguoiMua ?? nguoiMuaMotDong(khachMacDinh(r), khongLayCua(r), h.tenKhachLe)
  const dong = (nhan: string, gt: ReactNode, lop = '') => <><span>{nhan}</span><b className={lop}>{gt}</b></>
  return (
    <Vo hep tieuDe={<>Hoá đơn <span className="code">{hd.mau}{hd.kyHieu}</span> số <span className="code">{hd.so}</span> <span className="ph-tt da">Hợp lệ</span></>}
      onDong={onDong} chan={<>
        <button type="button" className="btn" onClick={() => toast(`Đã tải PDF hoá đơn số ${hd.so}`)}>Tải PDF</button>
        <button type="button" className="btn" onClick={() => toast(`Đã tải XML hoá đơn số ${hd.so}`)}>Tải XML</button>
        <button type="button" className="btn pri" onClick={() => toast(`Mở hoá đơn số ${hd.so} trên ${NCC_HDDT}`)}>Xem hoá đơn điện tử</button>
      </>}>
      <div className="hddt-xem">
        {dong('Ngày hoá đơn', hd.ngay)}
        {dong('Người mua', nguoiMua)}
        {dong('Tiền trước thuế', money(tien.truoc), 'num')}
        {/* Khấu trừ: thuế suất trên hoá đơn đã là mức giảm, không ghi thêm giảm thuế (QD106) */}
        {!mau2 && dong('Thuế suất', `${ts}%`)}
        {dong(mau2 ? 'Giảm trừ thuế' : 'Tiền thuế', money(tien.thue), 'num')}
        {dong('Tổng tiền thanh toán', money(tien.tong), 'num lon')}
        {dong('Mã tra cứu · Mã CQT', <span className="code">{hd.traCuu ?? '—'} · {hd.ma}</span>)}
      </div>
    </Vo>
  )
}

/** Popup phát hành hoá đơn điện tử: từ form một chứng từ thì nhập thông tin khách hàng; từ danh sách thì bảng mỗi chứng từ một dòng (T765, T785) */
export function HopXuatHddt({ s, man, ds, onDong, toast, nhieu }: { s: Session; man: string; ds: Row[]; onDong: () => void; toast: (m: string) => void; nhieu?: boolean }) {
  // Giữ danh sách lúc mở: phát hành xong chứng từ đổi trạng thái nhưng popup vẫn hiện đủ để xem kết quả
  const [goc] = useState(ds)
  const duoc = goc.filter(r => r.nguon !== 'FABi' && !hdCua(r))
  const boQua = goc.length - duoc.length
  if (duoc.length > 1 || (nhieu && duoc.length)) return <HopHangLoat s={s} man={man} ds={duoc} boQua={boQua} onDong={onDong} />
  return <HopMot s={s} man={man} r={duoc[0]} boQua={boQua} onDong={onDong} toast={toast} />
}

function HopMot({ s, man, r, boQua, onDong, toast }: { s: Session; man: string; r?: Row; boQua: number; onDong: () => void; toast: (m: string) => void }) {
  useDongEsc(onDong)
  const h = cauHinhPhatHanh(s)
  const [ngay, setNgay] = useState(dmy(HOM_NAY))
  const [kyHieu, setKyHieu] = useState(r ? kyHieuCua(h, r) : '')   // gồm mẫu số, vd 1C26TAA; mặc định theo Cấu hình kế toán, sửa tay được
  const [k, setK] = useState<TtKhach>(() => (r ? khachMacDinh(r) : KHACH_TRONG))
  const [khongLay, setKhongLay] = useState(() => (r ? khongLayCua(r) : false))
  const [daThu, setDaThu] = useState(false)   // bấm Phát hành rồi mới tô đỏ ô bắt buộc còn trống
  const dat = (p: Partial<TtKhach>) => setK(x => ({ ...x, ...p }))
  if (!r) return <Vo onDong={onDong}><Note kind="warn">Các chứng từ đã chọn đều đã có hoá đơn hoặc là hoá đơn FABi xuất tại máy POS.</Note></Vo>
  const kyHieuSai = !KY_HIEU_DU.test(kyHieu)
  const phatHanh = () => {
    if (!ngay || kyHieuSai || (!khongLay && thieuKhach(k))) { setDaThu(true); toast(kyHieuSai ? 'Ký hiệu hoá đơn gồm 7 ký tự, vd 1C26TAA' : 'Nhập đủ các ô có dấu *'); return }
    const hd = ghiHd(man, String(r.id), kyHieu[0], kyHieu.slice(1), ngay, k, khongLay, h.tenKhachLe || KHACH_LE_HD, tienCua(r))
    toast(`Đã phát hành hoá đơn ${tenHd(hd)}${h.guiEmail && !khongLay && k.email ? `, đã gửi ${k.email}` : ''}`)
    onDong()
  }
  return (
    <Vo onDong={onDong} chan={<button type="button" className="btn pri" onClick={phatHanh}>Phát hành HĐĐT</button>}>
      <div className="hddt-bang">
        <Dong nhan="Ngày hoá đơn" bb loi={daThu && !ngay}>
          <ONgay value={ngay} onChange={setNgay} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn" />
        </Dong>
        <Dong nhan="Mẫu số - Ký hiệu" bb loi={daThu && kyHieuSai}>
          <OKyHieu h={h} value={kyHieu} onChange={setKyHieu} />
        </Dong>
      </div>
      <label className="hddt-kl"><input type="checkbox" checked={khongLay} onChange={e => setKhongLay(e.target.checked)} />Người mua không lấy hoá đơn
        {khongLay && <span className="dim">, người mua trên hoá đơn là “{h.tenKhachLe}”</span>}</label>
      {!khongLay && <FormKhach k={k} dat={dat} daThu={daThu} />}
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
  if (khongLay) return <><b>{tenKl}</b><small>Không lấy hoá đơn</small></>
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
      if (!sua.ngay || !KY_HIEU_DU.test(sua.kyHieu) || (!sua.nm.khongLay && thieuKhach(sua.nm.k))) { setSua({ ...sua, daThu: true }); return }
      setNm(x => ({ ...x, [sua.id]: sua.nm }))
      datRieng(r, { ngay: sua.ngay, kyHieu: sua.kyHieu })
      suaPhieu(man, sua.id, { _khachHd: sua.nm.k, _khongLayHd: sua.nm.khongLay })
      setSua(null)
    }
    return (
      <Vo rong tieuDe={<>Thông tin hoá đơn · <span className="code">{r.so}</span></>} onDong={() => setSua(null)} chan={<>
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
        <label className="hddt-kl"><input type="checkbox" checked={sua.nm.khongLay}
          onChange={e => setSua(x => (x ? { ...x, nm: { ...x.nm, khongLay: e.target.checked } } : x))} />Người mua không lấy hoá đơn
          {sua.nm.khongLay && <span className="dim">, người mua trên hoá đơn là “{tenKl}”</span>}</label>
        {!sua.nm.khongLay && <FormKhach k={sua.nm.k} dat={datK} daThu={sua.daThu} />}
      </Vo>
    )
  }

  if (buoc !== 'kt') {
    const dsKq = ds.filter(r => kq[id(r)])
    const loi = dsKq.filter(r => kq[id(r)].loi)
    const ok = dsKq.length - loi.length
    const chuaGui = ds.length - dsKq.length
    const chan = buoc === 'xong' && <>
      {loi.length > 0 && <button type="button" className="btn" onClick={() => gui(loi.map(id))}>Phát hành lại {loi.length} dòng lỗi</button>}
      <button type="button" className="btn pri" onClick={onDong}>Đóng</button>
    </>
    return (
      <Vo rong onDong={dong} chan={chan}>
        {buoc === 'dang' ? (
          <div className="ph-tien">
            <span>Đang phát hành {Math.min(daGui + 1, hang.length)}/{hang.length} hoá đơn qua {NCC_HDDT}</span>
            <div className="ph-thanh"><i style={{ width: `${Math.round((daGui / hang.length) * 100)}%` }} /></div>
          </div>
        ) : (
          <Note kind={loi.length ? 'warn' : ''} icon={loi.length ? 'info' : 'check'}>
            Đã phát hành {ok} hoá đơn{loi.length ? `, ${loi.length} hoá đơn lỗi chưa được cấp số` : ''}
            {chuaGui ? `. ${chuaGui} chứng từ thiếu thông tin vẫn chưa phát hành` : ''}.
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
                {x.hd ? <span className="ph-ok" title={`Mã cơ quan thuế ${x.hd.ma}`}>Đã phát hành {tenHd(x.hd)}</span>
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
        Phát hành {sanSang.length} hoá đơn
      </button>
    </>}>
      <div className="hddt-bang hddt-hai">
        <Dong nhan="Ngày hoá đơn, áp dụng cho tất cả" bb loi={!ngayChung}>
          <ONgay value={ngayChung} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn áp dụng cho tất cả"
            onChange={v => { setNgayChung(v); setRieng(x => Object.fromEntries(Object.entries(x).map(([k, o]) => [k, { ...o, ngay: undefined }]))) }} />
        </Dong>
        <Dong nhan="Ký hiệu, áp dụng cho tất cả">
          <Select className="hddt-inp" value={kyChung} aria-label="Ký hiệu áp dụng cho tất cả"
            onChange={e => { setKyChung(e.target.value); setRieng(x => Object.fromEntries(Object.entries(x).map(([k, o]) => [k, { ...o, kyHieu: undefined }]))) }}
            ds={[{ v: '', t: 'Theo cửa hàng của chứng từ' }, ...dsKyHieu(h).map(x => ({ v: x.v, t: `${x.v} · ${x.t}` }))]} />
        </Dong>
      </div>
      {thieu > 0 && <Note kind="warn">{thieu} chứng từ thiếu thông tin. Bấm Sửa ở dòng đó để bổ sung, chứng từ thiếu thông tin chưa được phát hành.</Note>}
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
                <button type="button" className="ph-nut" onClick={() => setSua({ id: id(r), nm: { ...nm[id(r)], k: { ...nm[id(r)].k } }, ngay: ngayCua(r), kyHieu: kyCua(r), daThu: Boolean(loi) })}>Sửa</button>
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
      <Note kind="gray">Mỗi chứng từ một hoá đơn. Bấm Sửa ở dòng nào thì mở Thông tin hoá đơn của chứng từ đó; Đồng ý thì lưu luôn vào chứng từ.
        {boQua > 0 ? ` Bỏ qua ${boQua} chứng từ đã xuất hoá đơn hoặc là hoá đơn FABi.` : ''}</Note>
    </Vo>
  )
}
