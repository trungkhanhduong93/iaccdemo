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
/** Ký hiệu đầy đủ trên popup phát hành: mẫu số 1 hoặc 2 rồi 6 ký tự ký hiệu */
const KY_HIEU_DU = /^[12][CK]\d{2}[TDLMNBGHX][A-Z]{2}$/
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
interface TtKhach { loai: 'cty' | 'cn'; mst: string; tenDv: string; cccd: string; tenNm: string; diaChi: string; sdt: string; email: string; maQhns: string; hoChieu: string }

/** Thông tin người mua mặc định của chứng từ: khách công ty lấy MST, địa chỉ, email trong danh mục; tên người mua là người giao dịch */
function khachMacDinh(r: Row): TtKhach {
  const kh = KHACH.find(x => x.ten === r.doiTuong)
  const tt = kh ? NGUOI_MUA[kh.ma] : undefined
  const laCty = Boolean(kh?.mst)
  return {
    loai: laCty ? 'cty' : 'cn', mst: kh?.mst.replace(/\s/g, '') ?? '', tenDv: laCty ? String(r.doiTuong ?? '') : '', cccd: '',
    tenNm: String(r._nguoiGiao ?? ttNghiepVu(r).nguoi ?? NHAN_VIEN[0].ten), diaChi: tt?.[0] ?? '', sdt: '', email: tt?.[1] ?? '', maQhns: '', hoChieu: '',
  }
}
/** Ô bắt buộc còn trống của người mua, đủ thì null */
const thieuKhach = (k: TtKhach): string | null => k.loai === 'cty'
  ? (!k.tenDv.trim() ? 'Thiếu tên đơn vị' : !k.diaChi.trim() ? 'Thiếu địa chỉ' : null)
  : (!k.tenNm.trim() ? 'Thiếu tên người mua' : null)
const tenCty = (k: TtKhach) => (k.loai === 'cty' ? k.tenDv : '')

/** Cấu hình dùng khi phát hành: bản mẫu luôn giả lập đã khai báo đủ, đã kết nối (T763) */
function cauHinhPhatHanh(s: Session): CauHinhHddt {
  const daLuu = cauHinhHddt(s)
  return { ...daLuu, bat: true, daKetNoi: true, tk: daLuu.tk || 'phomay_hddt', mk: daLuu.mk || 'matkhau-mau' }
}
const kyHieuCua = (h: CauHinhHddt, r: Row) => h.kyHieu[String(r._cnId ?? '')] ?? Object.values(h.kyHieu)[0]

/** Cấp số hoá đơn mới rồi ghi vào chứng từ: ô Số hoá đơn, Ký hiệu, Ngày hoá đơn, MST hoặc CCCD, địa chỉ ở đầu phiếu đổi theo */
function ghiHd(man: string, r: Row, mau: string, kyHieu: string, ngay: string, k: TtKhach): HdDaXuat {
  soHdCuoi += 1
  const hd: HdDaXuat = { mau, kyHieu, so: String(soHdCuoi).padStart(8, '0'), ngay, ma: maCqt(soHdCuoi) }
  suaPhieu(man, String(r.id), {
    _hd: hd, _soHd: hd.so, _kyHieuHd: hd.mau + hd.kyHieu, _ngayHd: hd.ngay,
    _khachHd: k, _mst: k.loai === 'cty' ? k.mst : k.cccd, ...(k.diaChi ? { _diaChi: k.diaChi } : {}),
  })
  return hd
}

/** Một dòng nhãn bên trái, ô nhập bên phải như bảng */
function Dong({ nhan, bb, loi, children }: { nhan: string; bb?: boolean; loi?: boolean; children: ReactNode }) {
  return <div className={`hddt-o${loi ? ' loi' : ''}`}><span>{nhan}{bb && <em>*</em>}</span><div>{children}</div></div>
}

/** Chọn Cá nhân, Công ty và các ô thông tin khách hàng trên hoá đơn */
function FormKhach({ k, dat, daThu }: { k: TtKhach; dat: (p: Partial<TtKhach>) => void; daThu: boolean }) {
  const o = (key: keyof TtKhach, nhan: string, goiY: string, bb = false) => (
    <Dong nhan={nhan} bb={bb} loi={daThu && bb && !String(k[key]).trim()}>
      <input className="hddt-inp" value={String(k[key])} placeholder={goiY} aria-label={nhan} onChange={e => dat({ [key]: e.target.value })} />
    </Dong>
  )
  return <>
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
    </div>
  </>
}

/** Khung popup phát hành: tiêu đề, nút đóng, thân, chân */
function Vo({ rong, onDong, chan, children }: { rong?: boolean; onDong: () => void; chan?: ReactNode; children: ReactNode }) {
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className={`ds-hop hddt-hop${rong ? ' rong' : ''}`} role="dialog" aria-modal="true" aria-label="Phát hành hoá đơn điện tử">
        <div className="ds-hop-dau"><b>Phát hành hoá đơn điện tử</b><span className="grow" />
          <button type="button" className="icon-btn" aria-label="Đóng" title="Đóng" onClick={onDong}>×</button></div>
        <div className="hddt-than">{children}</div>
        {chan && <div className="hddt-chan">{chan}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Popup phát hành hoá đơn điện tử: một chứng từ thì nhập thông tin khách hàng, từ hai chứng từ thì phát hành hàng loạt (T765) */
export function HopXuatHddt({ s, man, ds, onDong, toast }: { s: Session; man: string; ds: Row[]; onDong: () => void; toast: (m: string) => void }) {
  // Giữ danh sách lúc mở: phát hành xong chứng từ đổi trạng thái nhưng popup vẫn hiện đủ để xem kết quả
  const [goc] = useState(ds)
  const duoc = goc.filter(r => r.nguon !== 'FABi' && !hdCua(r))
  const boQua = goc.length - duoc.length
  if (duoc.length > 1) return <HopHangLoat s={s} man={man} ds={duoc} boQua={boQua} onDong={onDong} />
  return <HopMot s={s} man={man} r={duoc[0]} boQua={boQua} onDong={onDong} toast={toast} />
}

function HopMot({ s, man, r, boQua, onDong, toast }: { s: Session; man: string; r?: Row; boQua: number; onDong: () => void; toast: (m: string) => void }) {
  useDongEsc(onDong)
  const h = cauHinhPhatHanh(s)
  const [ngay, setNgay] = useState(dmy(HOM_NAY))
  const [kyHieu, setKyHieu] = useState(r ? mauSoHd(s) + kyHieuCua(h, r) : '')   // gồm mẫu số, vd 1C26TAA; mặc định theo Cấu hình kế toán, sửa tay được
  const [k, setK] = useState<TtKhach>(() => (r ? khachMacDinh(r) : ({ loai: 'cn', mst: '', tenDv: '', cccd: '', tenNm: '', diaChi: '', sdt: '', email: '', maQhns: '', hoChieu: '' } as TtKhach)))
  const [daThu, setDaThu] = useState(false)   // bấm Phát hành rồi mới tô đỏ ô bắt buộc còn trống
  const dat = (p: Partial<TtKhach>) => setK(x => ({ ...x, ...p }))
  if (!r) return <Vo onDong={onDong}><Note kind="warn">Các chứng từ đã chọn đều đã có hoá đơn hoặc là hoá đơn FABi xuất tại máy POS.</Note></Vo>
  const kyHieuSai = !KY_HIEU_DU.test(kyHieu)
  const phatHanh = () => {
    if (!ngay || kyHieuSai || thieuKhach(k)) { setDaThu(true); toast(kyHieuSai ? 'Ký hiệu hoá đơn gồm 7 ký tự, vd 1C26TAA' : 'Nhập đủ các ô có dấu *'); return }
    const hd = ghiHd(man, r, kyHieu[0], kyHieu.slice(1), ngay, k)
    toast(`Đã phát hành hoá đơn ${tenHd(hd)}${h.guiEmail && k.email ? `, đã gửi ${k.email}` : ''}`)
    onDong()
  }
  return (
    <Vo onDong={onDong} chan={<button type="button" className="btn pri" onClick={phatHanh}>Phát hành HĐĐT</button>}>
      <div className="hddt-bang">
        <Dong nhan="Ngày hoá đơn" bb loi={daThu && !ngay}>
          <ONgay value={ngay} onChange={setNgay} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn" />
        </Dong>
        <Dong nhan="Ký hiệu hoá đơn" bb loi={daThu && kyHieuSai}>
          <input className="hddt-inp code" value={kyHieu} maxLength={7} placeholder="Nhập ký hiệu hoá đơn" aria-label="Ký hiệu hoá đơn"
            title="Gồm mẫu số và ký hiệu, vd 1C26TAA; mặc định theo Cấu hình kế toán" onChange={e => setKyHieu(e.target.value.toUpperCase().replace(/\s/g, ''))} />
        </Dong>
      </div>
      <FormKhach k={k} dat={dat} daThu={daThu} />
      <div className="hddt-tong"><span>Tổng tiền thanh toán</span><b>{money(Number(r.tong) || 0)}</b></div>
      {boQua > 0 && <Note kind="gray">Bỏ qua {boQua} chứng từ đã có hoá đơn hoặc là hoá đơn FABi.</Note>}
    </Vo>
  )
}

/** Kết quả phát hành một chứng từ: có hoá đơn hoặc lý do lỗi nhà cung cấp trả về */
interface Kq { hd?: HdDaXuat; loi?: string }

/** Phát hành hàng loạt (T765): kiểm tra người mua từng chứng từ, gửi lần lượt có tiến trình, bảng kết quả, phát hành lại dòng lỗi */
function HopHangLoat({ s, man, ds, boQua, onDong }: { s: Session; man: string; ds: Row[]; boQua: number; onDong: () => void }) {
  const h = cauHinhPhatHanh(s)
  const mau = mauSoHd(s)
  const id = (r: Row) => String(r.id)
  const [buoc, setBuoc] = useState<'kt' | 'dang' | 'xong'>('kt')
  const dong = useCallback(() => { if (buoc !== 'dang') onDong() }, [buoc, onDong])
  useDongEsc(dong)
  const [ngay, setNgay] = useState(dmy(HOM_NAY))
  const [kh, setKh] = useState<Record<string, TtKhach>>(() => Object.fromEntries(ds.map(r => [id(r), khachMacDinh(r)])))
  const [bo, setBo] = useState<Set<string>>(new Set())   // chứng từ bỏ chọn, để phát hành sau
  const [sua, setSua] = useState<{ id: string; k: TtKhach; daThu: boolean } | null>(null)   // đang bổ sung người mua của một chứng từ
  const [kq, setKq] = useState<Record<string, Kq>>({})
  const [hang, setHang] = useState<string[]>([])   // chứng từ gửi trong lượt này, theo thứ tự
  const [daGui, setDaGui] = useState(0)
  const daLoi = useRef(false)   // giả lập nhà cung cấp trả lỗi một lần để có dòng phát hành lại

  const loiCua = (r: Row) => thieuKhach(kh[id(r)])
  const sanSang = ds.filter(r => !bo.has(id(r)) && !loiCua(r))
  const thieu = ds.filter(r => !bo.has(id(r)) && loiCua(r))
  const cong = (rs: Row[]) => rs.reduce((a, r) => a + (Number(r.tong) || 0), 0)
  const gui = (ids: string[]) => { setHang(ids); setDaGui(0); setBuoc('dang') }

  useEffect(() => {
    if (buoc !== 'dang') return
    if (daGui >= hang.length) { setBuoc('xong'); return }
    const t = setTimeout(() => {
      const ma = hang[daGui]
      const r = ds.find(x => id(x) === ma)!
      // Lượt từ 3 hoá đơn trở lên: hoá đơn cuối bị trả lỗi một lần, gửi lại thì được
      if (!daLoi.current && hang.length >= 3 && daGui === hang.length - 1) {
        daLoi.current = true
        setKq(x => ({ ...x, [ma]: { loi: `${h.ncc} không phản hồi, chưa cấp số hoá đơn` } }))
      } else {
        const hd = ghiHd(man, r, mau, kyHieuCua(h, r), ngay, kh[ma])
        setKq(x => ({ ...x, [ma]: { hd } }))
      }
      setDaGui(n => n + 1)
    }, 300)
    return () => clearTimeout(t)
  }, [buoc, daGui, hang, ds, h, man, mau, ngay, kh])

  if (sua) {
    const r = ds.find(x => id(x) === sua.id)!
    const luu = () => {
      if (thieuKhach(sua.k)) { setSua({ ...sua, daThu: true }); return }
      setKh(x => ({ ...x, [sua.id]: sua.k }))
      setBo(x => { const n = new Set(x); n.delete(sua.id); return n })
      setSua(null)
    }
    return (
      <Vo rong onDong={() => setSua(null)} chan={<>
        <button type="button" className="btn" onClick={() => setSua(null)}>Quay lại</button>
        <button type="button" className="btn pri" onClick={luu}>Lưu thông tin</button>
      </>}>
        <div className="hddt-sua-dau">Bổ sung thông tin người mua cho chứng từ <b className="code">{r.so}</b>, tổng tiền <b>{money(Number(r.tong) || 0)}</b></div>
        <FormKhach k={sua.k} dat={p => setSua(x => (x ? { ...x, k: { ...x.k, ...p } } : x))} daThu={sua.daThu} />
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
            <span>Đang phát hành {Math.min(daGui + 1, hang.length)}/{hang.length} hoá đơn qua {h.ncc}</span>
            <div className="ph-thanh"><i style={{ width: `${Math.round((daGui / hang.length) * 100)}%` }} /></div>
          </div>
        ) : (
          <Note kind={loi.length ? 'warn' : ''} icon={loi.length ? 'info' : 'check'}>
            Đã phát hành {ok} hoá đơn{loi.length ? `, ${loi.length} hoá đơn lỗi chưa được cấp số` : ''}
            {chuaGui ? `. ${chuaGui} chứng từ bỏ chọn hoặc thiếu thông tin vẫn chưa phát hành` : ''}.
          </Note>
        )}
        <div className="hddt-ds hddt-kq">
          <div className="hddt-dong hddt-dau"><span>Số chứng từ</span><span>Công ty</span><span>Người mua</span><span>Tổng tiền</span><span>Kết quả</span></div>
          {dsKq.map(r => {
            const x = kq[id(r)]
            const k = kh[id(r)]
            return (
              <div key={id(r)} className="hddt-dong">
                <span className="code">{r.so}</span><span title={tenCty(k)}>{tenCty(k)}</span><span title={k.tenNm}>{k.tenNm}</span>
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

  const tatCa = ds.every(r => !bo.has(id(r)))
  return (
    <Vo rong onDong={onDong} chan={
      <button type="button" className="btn pri" disabled={!sanSang.length || !ngay} onClick={() => gui(sanSang.map(id))}>
        Phát hành {sanSang.length} hoá đơn
      </button>}>
      <div className="hddt-bang">
        <Dong nhan="Ngày hoá đơn" bb loi={!ngay}>
          <ONgay value={ngay} onChange={setNgay} placeholder="Chọn ngày hoá đơn" inputClassName="hddt-inp" ariaLabel="Ngày hoá đơn" />
        </Dong>
        <Dong nhan="Ký hiệu hoá đơn">
          <input className="hddt-inp" readOnly value="Theo cửa hàng của từng chứng từ, đặt ở Cấu hình kế toán" aria-label="Ký hiệu hoá đơn" />
        </Dong>
      </div>
      {thieu.length > 0 && <Note kind="warn">{thieu.length} chứng từ thiếu thông tin người mua. Bấm Sửa để bổ sung, hoặc bỏ chọn để phát hành sau.</Note>}
      <div className="hddt-ds hddt-lo">
        <div className="hddt-dong hddt-dau">
          <span><input type="checkbox" aria-label="Chọn tất cả" checked={tatCa} onChange={() => setBo(tatCa ? new Set(ds.map(id)) : new Set())} /></span>
          <span>Số chứng từ</span><span>Loại</span><span>Công ty</span><span>Người mua</span><span>MST/CCCD</span><span>Ký hiệu</span><span className="num">Tổng tiền</span><span>Kiểm tra</span>
        </div>
        {ds.map(r => {
          const k = kh[id(r)]
          const loi = loiCua(r)
          const boChon = bo.has(id(r))
          return (
            <div key={id(r)} className={`hddt-dong${boChon ? ' bo' : ''}`}>
              <span><input type="checkbox" aria-label={`Chọn ${r.so}`} checked={!boChon}
                onChange={() => setBo(x => { const n = new Set(x); if (n.has(id(r))) n.delete(id(r)); else n.add(id(r)); return n })} /></span>
              <span className="code">{r.so}</span>
              <span>{k.loai === 'cty' ? 'Công ty' : 'Cá nhân'}</span>
              {/* Công ty là tên đơn vị trên hoá đơn, chỉ có khi loại Công ty; Người mua là người giao dịch */}
              <span title={tenCty(k)}>{k.loai === 'cty' ? (k.tenDv || <span className="dim">Chưa có</span>) : ''}</span>
              <span title={k.tenNm}>{k.tenNm || (k.loai === 'cn' ? <span className="dim">Chưa có</span> : '')}</span>
              <span className="code">{(k.loai === 'cty' ? k.mst : k.cccd) || ''}</span>
              <span className="code">{mau}{kyHieuCua(h, r)}</span>
              <span className="num">{money(Number(r.tong) || 0)}</span>
              <span className="ph-kt">
                {loi ? <span className="ph-loi">{loi}</span> : <span className="ph-ok">Đủ thông tin</span>}
                <button type="button" className="ph-nut" onClick={() => setSua({ id: id(r), k: { ...k }, daThu: Boolean(loi) })}>Sửa</button>
              </span>
            </div>
          )
        })}
        <div className="hddt-dong hddt-cong">
          <span /><span>Cộng</span><span /><span /><span /><span /><span />
          <span className="num">{money(cong(sanSang))}</span><span />
        </div>
      </div>
      {boQua > 0 && <Note kind="gray">Bỏ qua {boQua} chứng từ đã có hoá đơn hoặc là hoá đơn FABi.</Note>}
    </Vo>
  )
}
