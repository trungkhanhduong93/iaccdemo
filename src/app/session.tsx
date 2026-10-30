// Phiên làm việc: người dùng, vai trò, đơn vị kế toán, gói. Lưu ở localStorage để F5 không mất.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Goi } from './plan'
import { CHE_DO, CHE_DO_DN_STANDARD, CHE_DO_HOP_LE, CHE_DO_MAC_DINH, chuanHoaCheDo, type CheDo } from './che-do'
import { CUA_HANG, DON_VI, HOM_NAY, type DonVi, type Role } from '../data/mock'
import { dmy } from '../ui/format'
import type { LichCachNvl } from '../modules/home/chi-phi-nvl'
import { thangLamViec } from './thangLamViec'

export type PpGtgt = 'tyLe' | 'khauTru'
export type PpTndn = 'tyLe' | 'thuNhap'

/** Cửa hàng lên sổ thêm từ một cửa hàng FABi: tuNgay là ngày bắt đầu lên sổ, doanh thu FABi đồng bộ từ ngày này (T142) */
export interface CnThem { id: string; ten: string; khuVuc: string; tuNgay: string; banDau?: boolean }   // banDau: chọn lúc khởi tạo đơn vị, không phải bổ sung sau

/** Thông tin kê khai của đơn vị, khai lúc khởi tạo, sửa ở Hệ thống, Thông tin đơn vị (T145); ten, mst, diaChi sửa đè lên đơn vị */
export interface TtDonVi {
  loai?: 'hkd' | 'dn'; nhom?: number; ppHkd?: 'doanhThu' | 'loiNhuan'; cnChinh?: string; kenhOnline?: string[]; kenhSan?: string[]
  ten?: string; mst?: string; diaChi?: string
}

export interface Session {
  loggedIn: boolean
  ten: string
  email: string
  role: Role
  donVi: string          // id đơn vị kế toán
  goi: Goi               // gói của đơn vị; thanh "Xem thử" đổi được để xem khoá theo gói
  goiBan?: number        // phiên bản mã gói (T642): 2 = bộ 3 gói S/PL/PR mới
  cheDo: CheDo           // chế độ kế toán của đơn vị, chọn ở Cấu hình hệ thống; đổi gói thì về chế độ mặc định của gói
  cuaHang: string       // cửa hàng đang làm việc chọn trên thanh trên; 'all' là xem gộp mọi cửa hàng
  khoiTao: boolean       // đã chạy xong khởi tạo
  thuGon?: boolean       // sidebar thu gọn còn biểu tượng
  ngayDauNam?: Record<string, string>   // ngày đầu năm từng đơn vị (dd/mm/yyyy), khai ở Thông tin đơn vị
  namTaiChinh?: Record<string, number>  // năm tài chính từng đơn vị, khai ở Thông tin đơn vị
  ppGtgt: PpGtgt         // phương pháp tính thuế GTGT (TT58): 'tyLe' hoặc 'khauTru', mặc định 'tyLe'
  ppTndn: PpTndn         // phương pháp tính thuế TNDN (TT58): 'tyLe' hoặc 'thuNhap', mặc định 'thuNhap'
  dvMoi?: DonVi        // đơn vị mới tạo khi dùng thử từ FABi (T138): tên FABi, chưa có MST; 3 đơn vị mẫu giữ nguyên
  soDuQuy?: Record<string, Record<string, { no: number; co: number }>>   // số dư ban đầu từng quỹ theo đơn vị, lưu ở màn Số dư ban đầu (T160)
  choKeKhai?: Record<string, boolean>   // đơn vị khởi tạo nhanh từ FABi, chưa chọn loại hình, gói, thông tin đơn vị; mở Kê khai thuế thì hỏi (T138)
  dongBoFabi?: Record<string, { bd: number; ct: number; tc: number }>   // chứng từ FABi còn đổ về sau khi Kết nối: lúc bắt đầu (ms), số chứng từ Xuất bán POS, số phiếu thu chi (T687)
  huongDan?: Record<string, boolean>   // hướng dẫn từng bước ở Trang chủ theo đơn vị: false là vừa khởi tạo xong, chờ hiện; true là đã xem hoặc bỏ qua (T138)
  dungThu?: Record<string, string>   // ngày bắt đầu dùng thử (dd/mm/yyyy) của đơn vị mới tạo từ FABi, thêm đơn vị (T158)
  ttDv?: Record<string, TtDonVi>   // thông tin kê khai từng đơn vị (T145)
  cnThem?: Record<string, CnThem[]>   // cửa hàng lên sổ thêm từ cửa hàng FABi theo từng đơn vị (T142)
  cachNvl?: Record<string, Record<string, LichCachNvl[]>>   // cách tính chi phí NVL gói Free theo đơn vị, cửa hàng; mỗi lần đổi áp dụng từ kỳ đầu chưa khoá sổ (T232)
  giaThanhTay?: Record<string, Record<string, number>>   // giá thành món nhập tay theo đơn vị; khoá cửa hàng-yyyymm-mã món (T232)
  dongBoThuChi?: Record<string, Record<string, boolean>>   // tự động đồng bộ phiếu thu, chi lập trên FABi theo đơn vị, từng cửa hàng (mã cửa hàng); chưa đặt là bật (T264)
  mapPttt?: Record<string, Record<string, string>>   // map PTTT FABi về quỹ theo đơn vị; khoá 'mã cửa hàng|mã PTTT', giá trị mã quỹ (T264)
}

/** Mã gói từ link ?goi=: nhận mã mới ('S', 'PL', 'PR'); mã Excel cũ 'M', 'A' (Plus, Pro cũ) đều thành Pro (QD80, T649) */
export function chuanHoaGoi(g: unknown): Goi {
  if (g === 'PR' || g === 'A' || g === 'M') return 'PR'
  if (g === 'PL') return 'PL'
  if (g === 'S') return 'S'
  return 'S'
}

const MAC_DINH: Session = {
  loggedIn: false,
  ten: 'Trần Thu Hà',
  email: 'thuha@phomay.vn',
  role: 'ktt',
  donVi: 'pm',
  goi: 'S',
  cheDo: 'TT58',
  cuaHang: 'all',
  khoiTao: true,
  thuGon: false,
  ppGtgt: 'tyLe',
  ppTndn: 'tyLe',
  goiBan: 2,
}
const KEY = 'iacc-cloud-session'

function doc(): Session {
  try {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const goiParam = params?.get('goi')
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const res: Session = { ...MAC_DINH, ...parsed, goiBan: raw ? parsed.goiBan : 2 }   // phiên cũ chưa có goiBan thì chuanHoaStandard đổi mã (T642)
    if (parsed.goi) {
      res.goi = parsed.goi
    }
    if (goiParam) {
      res.goi = chuanHoaGoi(goiParam)
      res.goiBan = 2
    }
    const n = chuanHoaStandard(res)
    n.cheDo = chuanHoaCheDo(n.goi, params?.get('cheDo') ?? parsed.cheDo)
    const ppGtgtParam = params?.get('ppGtgt')
    if (ppGtgtParam === 'tyLe' || ppGtgtParam === 'khauTru') {
      n.ppGtgt = ppGtgtParam
    } else if (n.ppGtgt !== 'tyLe' && n.ppGtgt !== 'khauTru') {
      n.ppGtgt = 'tyLe'
    }
    const ppTndnParam = params?.get('ppTndn')
    if (ppTndnParam === 'tyLe' || ppTndnParam === 'thuNhap') {
      n.ppTndn = ppTndnParam
    } else if (n.ppTndn !== 'tyLe' && n.ppTndn !== 'thuNhap') {
      n.ppTndn = 'thuNhap'
    }
    return n
  } catch { return MAC_DINH }
}

/** Gói Standard mới (Free cũ) theo loại hình (T632): hộ kinh doanh TT152; doanh nghiệp TT58, thuế GTGT, TNDN theo tỷ lệ % doanh thu (trường hợp 1, sổ S1-DNSN) */
function chuanHoaStandard(n: Session): Session {
  let goi = n.goi
  let goiBan = n.goiBan
  if (goiBan !== 2) {
    const g = goi as unknown as string
    if (g === 'F') goi = 'S'
    else if (g === 'S') goi = 'PL'
    else if (g === 'PL') goi = 'PR'
    else if (g === 'PR' || g === 'M' || g === 'A') goi = 'PR'
    else goi = 'S'
    goiBan = 2
  }
  const s: Session = { ...n, goi, goiBan }
  if (s.goi !== 'S') return s
  if (loaiHinhDv(s, donViHienTai(s)) === 'hkd') return s.cheDo === 'TT152' ? s : { ...s, cheDo: 'TT152' }
  return { ...s, cheDo: CHE_DO_DN_STANDARD, ppGtgt: 'tyLe', ppTndn: 'tyLe' }
}

const Ctx = createContext<{ s: Session; set: (p: Partial<Session>) => void; toast: (m: string) => void } | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Session>(doc)
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* trình duyệt chặn lưu thì thôi */ } }, [s])
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t) }, [msg])
  // Đổi gói mà không chỉ định chế độ: hộ kinh doanh lấy TT152 nếu gói cho phép, còn lại lấy mặc định của gói (T179)
  const cheDoKhiDoiGoi = (n: Session, g: Goi): CheDo =>
    loaiHinhDv(n, donViHienTai(n)) === 'hkd' && CHE_DO_HOP_LE[g].includes('TT152') ? 'TT152' : CHE_DO_MAC_DINH[g]
  const set = (p: Partial<Session>) => setS(x => { const n = { ...x, ...p, goiBan: 2 }; if (p.goi && !p.cheDo) n.cheDo = cheDoKhiDoiGoi(n, p.goi); n.cheDo = chuanHoaCheDo(n.goi, n.cheDo); return chuanHoaStandard(n) })
  return (
    <Ctx.Provider value={{ s, set, toast: setMsg }}>
      {children}
      {msg && <div className="toast">{msg}</div>}
    </Ctx.Provider>
  )
}

export function useSession() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useSession ngoài SessionProvider')
  return c
}

/** Các đơn vị của tài khoản: 3 đơn vị mẫu, thêm đơn vị mới tạo từ FABi nếu có */
export const dsDonVi = (s: Pick<Session, 'dvMoi' | 'ttDv'>): DonVi[] => (s.dvMoi ? [...DON_VI, s.dvMoi] : DON_VI).map(d => {
  const t = s.ttDv?.[d.id]   // tên, MST, địa chỉ sửa ở Thông tin đơn vị (T145)
  return t ? { ...d, ...(t.ten !== undefined && { ten: t.ten }), ...(t.mst !== undefined && { mst: t.mst }), ...(t.diaChi !== undefined && { diaChi: t.diaChi }) } : d
})
/** Loại hình đơn vị: theo Thông tin đơn vị; chưa khai thì tên "Hộ kinh doanh..." là hộ kinh doanh (T145) */
export const loaiHinhDv = (s: Pick<Session, 'ttDv'>, d: DonVi): 'hkd' | 'dn' => s.ttDv?.[d.id]?.loai ?? (d.ten.startsWith('Hộ kinh doanh') ? 'hkd' : 'dn')
/** Dùng thử: mọi gói được 30 ngày tính từ lúc tạo đơn vị (PhuongXT chốt 12/10/2026, T158) */
export const SO_NGAY_DUNG_THU = 30
export const batDauDungThu = () => dmy(HOM_NAY)
/** Đơn vị đang dùng thử: còn bao nhiêu ngày, đến ngày nào; null là không dùng thử (3 đơn vị mẫu đã mua).
 *  Gói Standard miễn phí nên tạm không hiện dùng thử ở mọi màn (PhuongXT 28/10/2026, T138) */
export function dungThuDv(s: Pick<Session, 'dungThu' | 'donVi' | 'goi'>): { con: number; den: string } | null {
  const tu = s.dungThu?.[s.donVi]
  if (!tu || s.goi === 'S') return null
  const [d, m, y] = tu.split('/').map(Number)
  const den = new Date(y, m - 1, d + SO_NGAY_DUNG_THU)
  const con = Math.max(0, Math.ceil((+den - +HOM_NAY) / 86400000))
  return { con, den: dmy(den) }
}
export const donViHienTai = (s: Session) => dsDonVi(s).find(d => d.id === s.donVi) ?? DON_VI[0]
export const cheDoHienTai = (s: Session) => CHE_DO[s.cheDo]
/** Nhãn Bổ sung MST: gói có màn Kê khai thuế mở hộp Thông tin kê khai ở màn đó, gói khác mở Thông tin đơn vị */
export const denBoMst = (goi: Goi) => goi === 'S' || goi === 'PL' ? '/app/thue/to-khai?thongtin=1' : '/app/he-thong/thong-tin'
/** Thuế GTGT tính theo % doanh thu (T450): hộ kinh doanh luôn vậy; doanh nghiệp gói Plus, Pro cố định khấu trừ; còn lại theo Thông tin đơn vị.
 *  Chứng từ, báo cáo bán hàng: theo % doanh thu thì hiện Giảm thuế GTGT, ẩn Thuế suất, Tiền thuế; khấu trừ thì ngược lại */
export const gtgtTyLe = (s: Session) => loaiHinhDv(s, donViHienTai(s)) === 'hkd' || (s.goi !== 'PL' && s.goi !== 'PR' && s.ppGtgt === 'tyLe')
/** Cửa hàng đang chọn trên thanh trên; undefined khi đang xem tất cả cửa hàng */
export const cuaHangHienTai = (s: Session) => CUA_HANG.find(c => c.id === s.cuaHang)
/** Cửa hàng của đơn vị đang làm việc: đơn vị mẫu có 3 cửa hàng mẫu; đơn vị mới từ FABi chỉ có cửa hàng đã chọn; cộng cửa hàng lên sổ thêm (T142) */
export const dsCuaHang = (s: Pick<Session, 'donVi' | 'cnThem'>): { id: string; ten: string }[] => [
  ...(DON_VI.some(d => d.id === s.donVi) ? CUA_HANG.map(c => ({ id: c.id, ten: c.ten })) : []),
  ...(s.cnThem?.[s.donVi] ?? []).map(c => ({ id: c.id, ten: c.ten })),
]


/** Năm tài chính của đơn vị đang làm việc; chưa khai thì năm hiện tại */
export const namTaiChinh = (s: Session) => s.namTaiChinh?.[s.donVi] ?? new Date().getFullYear()
/** Ngày đầu năm của đơn vị đang làm việc; chưa khai thì 01/01 của năm tài chính như lúc khởi tạo đơn vị */
export const ngayDauNam = (s: Session) => s.ngayDauNam?.[s.donVi] ?? `01/01/${namTaiChinh(s)}`
/** Các kỳ (tháng) của năm tài chính, từ tháng của ngày đầu năm, 12 tháng. so = yyyymm để so sánh */
export function dsKyNam(s: Session): { nhan: string; so: number }[] {
  const [, mm, yy] = ngayDauNam(s).split('/').map(Number)
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(yy, mm - 1 + i, 1)
    return { nhan: `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`, so: d.getFullYear() * 100 + d.getMonth() + 1 }
  })
}
/** Kỳ mặc định: tháng làm việc chọn ở trang chủ gói Free (T617), không có thì tháng hiện tại nếu nằm trong năm tài chính, không thì kỳ cuối năm */
export function kyMacDinh(s: Session): number {
  const d = new Date(), ds = dsKyNam(s), nay = d.getFullYear() * 100 + d.getMonth() + 1
  const lv = s.goi === 'S' ? thangLamViec() : null
  if (lv && ds.some(k => k.so === 2026 * 100 + lv)) return 2026 * 100 + lv
  return ds.some(k => k.so === nay) ? nay : ds[ds.length - 1].so
}
const soNgay = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : NaN }
/** Chứng từ thêm mới phải có ngày từ ngày đầu năm trở đi (trừ màn khai số dư) */
export const truocDauNam = (s: Session, ngay: string) => soNgay(ngay) < soNgay(ngayDauNam(s))
