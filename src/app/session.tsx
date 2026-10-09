// Phiên làm việc: người dùng, vai trò, đơn vị kế toán, gói. Lưu ở localStorage để F5 không mất.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Goi } from './plan'
import { CHE_DO, CHE_DO_MAC_DINH, chuanHoaCheDo, type CheDo } from './che-do'
import { CHI_NHANH, DON_VI, type Role } from '../data/mock'

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
}

/** Đổi mã gói cũ ('M', 'A') sang mã chuẩn ('PL', 'PR'), nhận cả mã cũ và mới */
export function chuanHoaGoi(g: unknown): Goi {
  if (g === 'M' || g === 'PL') return 'PL'
  if (g === 'A' || g === 'PR') return 'PR'
  if (g === 'S') return 'S'
  if (g === 'F') return 'F'
  return 'PL'
}

const MAC_DINH: Session = { loggedIn: false, ten: 'Trần Thu Hà', email: 'thuha@phomay.vn', role: 'ktt', donVi: 'pm', goi: 'PL', cheDo: 'TT133', chiNhanh: 'all', khoiTao: true, thuGon: false }
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

export const donViHienTai = (s: Session) => DON_VI.find(d => d.id === s.donVi) ?? DON_VI[0]
export const cheDoHienTai = (s: Session) => CHE_DO[s.cheDo]
/** Chi nhánh đang chọn trên thanh trên; undefined khi đang xem tất cả chi nhánh */
export const chiNhanhHienTai = (s: Session) => CHI_NHANH.find(c => c.id === s.chiNhanh)

