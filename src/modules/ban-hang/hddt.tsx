// Xuất hoá đơn điện tử từ chứng từ bán hàng lập tay gói Plus (T763): thiết lập ở Cấu hình kế toán, popup xem trước rồi phát hành
import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Row } from '../types'
import { gtgtTyLe, type Session } from '../../app/session'
import { CUA_HANG, HOM_NAY, KHACH } from '../../data/mock'
import { Select } from '../../ui/Dropdown'
import { Note } from '../../ui/Page'
import { dmy, money } from '../../ui/format'
import { useDongEsc } from '../../ui/LocNangCao'
import { ONgay } from '../../ui/ChonNgay'
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
  // Bản mẫu giả lập đơn vị đã khai báo, kết nối xong để demo bấm Xuất hoá đơn điện tử là thấy màn phát hành (T763)
  const goc: CauHinhHddt = { bat: true, ncc: NCC_HDDT[0], tk: 'phomay_hddt', mk: 'matkhau-mau', daKetNoi: true, kyHieu: {}, guiEmail: true }
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

/** Thông tin khách hàng trên hoá đơn: công ty (MST, tên đơn vị, mã đơn vị quan hệ ngân sách) hoặc cá nhân (CCCD, số hộ chiếu) */
interface TtKhach { loai: 'cty' | 'cn'; mst: string; tenDv: string; cccd: string; tenNm: string; diaChi: string; sdt: string; email: string; maQhns: string; hoChieu: string; ghiChu: string }

/** Một dòng nhãn bên trái, ô nhập bên phải như bảng */
function Dong({ nhan, bb, loi, children }: { nhan: string; bb?: boolean; loi?: boolean; children: ReactNode }) {
  return <div className={`hddt-o${loi ? ' loi' : ''}`}><span>{nhan}{bb && <em>*</em>}</span><div>{children}</div></div>
}

/** Popup phát hành hoá đơn điện tử: một chứng từ (nhập thông tin khách hàng) hoặc nhiều chứng từ đã chọn ở danh sách */
export function HopXuatHddt({ s, man, ds, onDong, toast }: { s: Session; man: string; ds: Row[]; onDong: () => void; toast: (m: string) => void }) {
  useDongEsc(onDong)
  // Bản mẫu luôn giả lập đã khai báo đủ, đã kết nối: giữ nhà cung cấp, ký hiệu đã lưu, thiếu gì thì lấy giá trị mẫu (T763)
  const daLuu = cauHinhHddt(s)
  const h: CauHinhHddt = { ...daLuu, bat: true, daKetNoi: true, tk: daLuu.tk || 'phomay_hddt', mk: daLuu.mk || 'matkhau-mau' }
  const mau = mauSoHd(s)
  const duoc = ds.filter(r => r.nguon !== 'FABi' && !hdCua(r))
  const boQua = ds.length - duoc.length
  const mot = ds.length === 1 && duoc.length === 1 ? duoc[0] : undefined
  const kyHieuCua = (r: Row) => h.kyHieu[String(r._cnId ?? '')] ?? Object.values(h.kyHieu)[0]
  const dsKyHieu = [...new Set(Object.values(h.kyHieu))]
  const [ngay, setNgay] = useState(dmy(HOM_NAY))
  const [kyHieu, setKyHieu] = useState(mot ? kyHieuCua(mot) : dsKyHieu[0])
  const kh = mot ? KHACH.find(x => x.ten === mot.doiTuong) : undefined
  const tt = kh ? NGUOI_MUA[kh.ma] : undefined
  const laCty = Boolean(kh?.mst)
  const [k, setK] = useState<TtKhach>({
    loai: laCty ? 'cty' : 'cn', mst: kh?.mst.replace(/\s/g, '') ?? '', tenDv: laCty ? String(mot?.doiTuong ?? '') : '', cccd: '',
    tenNm: laCty || kh?.ma === 'KL' ? '' : String(mot?.doiTuong ?? ''), diaChi: tt?.[0] ?? '', sdt: '', email: tt?.[1] ?? '', maQhns: '', hoChieu: '', ghiChu: '',
  })
  const [daThu, setDaThu] = useState(false)   // bấm Phát hành rồi mới tô đỏ ô bắt buộc còn trống
  const dat = (p: Partial<TtKhach>) => setK(x => ({ ...x, ...p }))
  const o = (key: keyof TtKhach, nhan: string, goiY: string, bb = false) => (
    <Dong nhan={nhan} bb={bb} loi={daThu && bb && !String(k[key]).trim()}>
      <input className="hddt-inp" value={String(k[key])} placeholder={goiY} aria-label={nhan} onChange={e => dat({ [key]: e.target.value })} />
    </Dong>
  )
  const thieu = !ngay || !kyHieu || (mot ? (k.loai === 'cty' ? !k.tenDv.trim() || !k.diaChi.trim() : !k.tenNm.trim()) : false)
  const phatHanh = () => {
    if (thieu) { setDaThu(true); toast('Nhập đủ các ô có dấu *'); return }
    let cuoi = ''
    for (const r of duoc) {
      soHdCuoi += 1
      const kh1 = mot ? kyHieu : kyHieuCua(r)
      const hd: HdDaXuat = { mau, kyHieu: kh1, so: String(soHdCuoi).padStart(8, '0'), ngay, ma: maCqt(soHdCuoi) }
      cuoi = `${mau}${kh1} số ${hd.so}`
      // Ô Số hoá đơn, Ký hiệu, Ngày hoá đơn ở đầu phiếu lấy theo hoá đơn vừa phát hành; một chứng từ thì cả MST hoặc CCCD, địa chỉ khách hàng
      suaPhieu(man, String(r.id), {
        _hd: hd, _soHd: hd.so, _kyHieuHd: hd.mau + hd.kyHieu, _ngayHd: hd.ngay,
        ...(mot ? { _khachHd: k, _mst: k.loai === 'cty' ? k.mst : k.cccd, ...(k.diaChi ? { _diaChi: k.diaChi } : {}) } : {}),
      })
    }
    toast(duoc.length === 1 ? `Đã phát hành hoá đơn ${cuoi}${h.guiEmail && mot && k.email ? `, đã gửi ${k.email}` : ''}`
      : `Đã phát hành ${duoc.length} hoá đơn điện tử qua ${h.ncc}`)
    onDong()
  }
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop hddt-hop" role="dialog" aria-modal="true" aria-label="Phát hành hoá đơn điện tử">
        <div className="ds-hop-dau"><b>Phát hành hoá đơn điện tử</b><span className="grow" />
          <button type="button" className="icon-btn" aria-label="Đóng" title="Đóng" onClick={onDong}>×</button></div>
        <div className="hddt-than">
          {!duoc.length ? (
            <Note kind="warn">Các chứng từ đã chọn đều đã có hoá đơn hoặc là hoá đơn FABi xuất tại máy POS.</Note>
          ) : <>
            <div className="hddt-bang">
              <Dong nhan="Ngày hoá đơn" bb loi={daThu && !ngay}>
                <ONgay value={ngay} onChange={setNgay} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn" />
              </Dong>
              <Dong nhan="Ký hiệu hoá đơn" bb>
                {mot ? <Select className="hddt-inp" value={kyHieu} aria-label="Ký hiệu hoá đơn" onChange={e => setKyHieu(e.target.value)} ds={dsKyHieu.map(v => ({ v, t: mau + v }))} />
                  : <input className="hddt-inp" readOnly value="Theo cửa hàng của từng chứng từ" aria-label="Ký hiệu hoá đơn" />}
              </Dong>
            </div>
            {mot ? <>
              <div className="hddt-kh">
                <b>Thông tin khách hàng</b>
                <label><input type="radio" name="hddt-loai" checked={k.loai === 'cn'} onChange={() => dat({ loai: 'cn' })} />Cá nhân</label>
                <label><input type="radio" name="hddt-loai" checked={k.loai === 'cty'} onChange={() => dat({ loai: 'cty' })} />Công ty</label>
              </div>
              <div className="hddt-bang">
                {k.loai === 'cty' ? <>
                  {o('mst', 'Mã số thuế/CCCD', 'Nhập mã số thuế/CCCD')}
                  {o('tenDv', 'Tên đơn vị', 'Nhập tên đơn vị', true)}
                  {o('diaChi', 'Địa chỉ', 'Nhập địa chỉ', true)}
                  {o('tenNm', 'Tên người mua', 'Nhập tên người mua')}
                  {o('sdt', 'Số điện thoại', 'Nhập số điện thoại')}
                  {o('email', 'Email', 'Nhập email')}
                  {o('maQhns', 'Mã đơn vị quan hệ ngân sách', 'Nhập mã đơn vị quan hệ ngân sách')}
                </> : <>
                  {o('cccd', 'Căn cước công dân', 'Nhập căn cước công dân')}
                  {o('tenNm', 'Tên người mua', 'Nhập tên người mua', true)}
                  {o('diaChi', 'Địa chỉ', 'Nhập địa chỉ')}
                  {o('sdt', 'Số điện thoại', 'Nhập số điện thoại')}
                  {o('email', 'Email', 'Nhập email')}
                  {o('hoChieu', 'Số hộ chiếu', 'Nhập số hộ chiếu')}
                </>}
                <Dong nhan="Ghi chú">
                  <textarea className="hddt-inp" rows={2} value={k.ghiChu} placeholder="Nhập ghi chú (nếu có)" aria-label="Ghi chú" onChange={e => dat({ ghiChu: e.target.value })} />
                </Dong>
              </div>
              <div className="hddt-tong"><span>Tổng tiền thanh toán</span><b>{money(Number(mot.tong) || 0)}</b></div>
            </> : (
              <div className="hddt-ds">
                <div className="hddt-dong hddt-dau"><span>Số chứng từ</span><span>Khách hàng</span><span>Ký hiệu</span><span>Tổng tiền</span></div>
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
        {duoc.length > 0 && <div className="hddt-chan"><button type="button" className="btn pri" onClick={phatHanh}>Phát hành HĐĐT</button></div>}
      </div>
    </div>,
    document.body,
  )
}
