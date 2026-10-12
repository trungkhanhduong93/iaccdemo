// Phiên làm việc: người dùng, vai trò, đơn vị kế toán, gói. Lưu ở localStorage để F5 không mất.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Goi } from './plan'
import { CHE_DO, CHE_DO_MAC_DINH, chuanHoaCheDo, type CheDo } from './che-do'
import { CHI_NHANH, DON_VI, HOM_NAY, type DonVi, type Role } from '../data/mock'
import { dmy } from '../ui/format'

export type PpGtgt = 'tyLe' | 'khauTru'
export type PpTndn = 'tyLe' | 'thuNhap'

/** Chi nhánh lên sổ thêm từ một cửa hàng FABi: tuNgay là ngày bắt đầu lên sổ, doanh thu FABi đồng bộ từ ngày này (T142) */
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
  cheDo: CheDo           // chế độ kế toán của đơn vị, chọn ở Cấu hình hệ thống; đổi gói thì về chế độ mặc định của gói
  chiNhanh: string       // chi nhánh đang làm việc chọn trên thanh trên; 'all' là xem gộp mọi chi nhánh
  khoiTao: boolean       // đã chạy xong khởi tạo
  thuGon?: boolean       // sidebar thu gọn còn biểu tượng
  ngayDauNam?: Record<string, string>   // ngày đầu năm từng đơn vị (dd/mm/yyyy), khai ở Thông tin đơn vị
  namTaiChinh?: Record<string, number>  // năm tài chính từng đơn vị, khai ở Thông tin đơn vị
  ppGtgt: PpGtgt         // phương pháp tính thuế GTGT (TT58): 'tyLe' hoặc 'khauTru', mặc định 'tyLe'
  ppTndn: PpTndn         // phương pháp tính thuế TNDN (TT58): 'tyLe' hoặc 'thuNhap', mặc định 'thuNhap'
  dvMoi?: DonVi        // đơn vị mới tạo khi dùng thử từ FABi (T138): tên FABi, chưa có MST; 3 đơn vị mẫu giữ nguyên
  soDuQuy?: Record<string, Record<string, { no: number; co: number }>>   // số dư ban đầu từng quỹ theo đơn vị, lưu ở màn Số dư ban đầu (T159)
  dungThu?: Record<string, string>   // ngày bắt đầu dùng thử (dd/mm/yyyy) của đơn vị mới tạo từ FABi, thêm đơn vị (T158)
  ttDv?: Record<string, TtDonVi>   // thông tin kê khai từng đơn vị (T145)
  cnThem?: Record<string, CnThem[]>   // chi nhánh lên sổ thêm từ cửa hàng FABi theo từng đơn vị (T142)
  dongBoFabi?: 'chiTiet' | 'kenh'   // cách đồng bộ bán hàng FABi (T113): mỗi hoá đơn một chứng từ, hoặc tổng hợp theo kênh mỗi ngày; thiếu là theo kênh
}

/** Đổi mã gói cũ ('M', 'A') sang mã chuẩn ('PL', 'PR'), nhận cả mã cũ và mới */
export function chuanHoaGoi(g: unknown): Goi {
  if (g === 'M' || g === 'PL') return 'PL'
  if (g === 'A' || g === 'PR') return 'PR'
  if (g === 'S') return 'S'
  if (g === 'F') return 'F'
  return 'PL'
}

const MAC_DINH: Session = {
  loggedIn: false,
  ten: 'Trần Thu Hà',
  email: 'thuha@phomay.vn',
  role: 'ktt',
  donVi: 'pm',
  goi: 'PL',
  cheDo: 'TT133',
  chiNhanh: 'all',
  khoiTao: true,
  thuGon: false,
  ppGtgt: 'tyLe',
  ppTndn: 'thuNhap',
}
const KEY = 'iacc-cloud-session'

function doc(): Session {
  try {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const goiParam = params?.get('goi')
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const res: Session = { ...MAC_DINH, ...parsed }
    if (parsed.goi) {
      res.goi = chuanHoaGoi(parsed.goi)
    }
    if (goiParam) {
      res.goi = chuanHoaGoi(goiParam)
    }
    res.cheDo = chuanHoaCheDo(res.goi, params?.get('cheDo') ?? parsed.cheDo)
    const ppGtgtParam = params?.get('ppGtgt')
    if (ppGtgtParam === 'tyLe' || ppGtgtParam === 'khauTru') {
      res.ppGtgt = ppGtgtParam
    } else if (res.ppGtgt !== 'tyLe' && res.ppGtgt !== 'khauTru') {
      res.ppGtgt = 'tyLe'
    }
    const ppTndnParam = params?.get('ppTndn')
    if (ppTndnParam === 'tyLe' || ppTndnParam === 'thuNhap') {
      res.ppTndn = ppTndnParam
    } else if (res.ppTndn !== 'tyLe' && res.ppTndn !== 'thuNhap') {
      res.ppTndn = 'thuNhap'
    }
    return res
  } catch { return MAC_DINH }
}

const Ctx = createContext<{ s: Session; set: (p: Partial<Session>) => void; toast: (m: string) => void } | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Session>(doc)
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* trình duyệt chặn lưu thì thôi */ } }, [s])
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2600); return () => clearTimeout(t) }, [msg])
  const set = (p: Partial<Session>) => setS(x => { const n = { ...x, ...p }; if (p.goi && !p.cheDo) n.cheDo = CHE_DO_MAC_DINH[p.goi]; n.cheDo = chuanHoaCheDo(n.goi, n.cheDo); return n })
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
/** Đơn vị đang dùng thử: còn bao nhiêu ngày, đến ngày nào; null là không dùng thử (3 đơn vị mẫu đã mua) */
export function dungThuDv(s: Pick<Session, 'dungThu' | 'donVi'>): { con: number; den: string } | null {
  const tu = s.dungThu?.[s.donVi]
  if (!tu) return null
  const [d, m, y] = tu.split('/').map(Number)
  const den = new Date(y, m - 1, d + SO_NGAY_DUNG_THU)
  const con = Math.max(0, Math.ceil((+den - +HOM_NAY) / 86400000))
  return { con, den: dmy(den) }
}
export const donViHienTai = (s: Session) => dsDonVi(s).find(d => d.id === s.donVi) ?? DON_VI[0]
export const cheDoHienTai = (s: Session) => CHE_DO[s.cheDo]
/** Chi nhánh đang chọn trên thanh trên; undefined khi đang xem tất cả chi nhánh */
export const chiNhanhHienTai = (s: Session) => CHI_NHANH.find(c => c.id === s.chiNhanh)
/** Chi nhánh của đơn vị đang làm việc: đơn vị mẫu có 3 chi nhánh mẫu; đơn vị mới từ FABi chỉ có cửa hàng đã chọn; cộng chi nhánh lên sổ thêm (T142) */
export const dsChiNhanh = (s: Pick<Session, 'donVi' | 'cnThem'>): { id: string; ten: string }[] => [
  ...(DON_VI.some(d => d.id === s.donVi) ? CHI_NHANH.map(c => ({ id: c.id, ten: c.ten })) : []),
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
/** Kỳ mặc định: tháng hiện tại nếu nằm trong năm tài chính, không thì kỳ cuối năm */
export function kyMacDinh(s: Session): number {
  const d = new Date(), ds = dsKyNam(s), nay = d.getFullYear() * 100 + d.getMonth() + 1
  return ds.some(k => k.so === nay) ? nay : ds[ds.length - 1].so
}
const soNgay = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : NaN }
/** Chứng từ thêm mới phải có ngày từ ngày đầu năm trở đi (trừ màn khai số dư) */
export const truocDauNam = (s: Session, ngay: string) => soNgay(ngay) < soNgay(ngayDauNam(s))
