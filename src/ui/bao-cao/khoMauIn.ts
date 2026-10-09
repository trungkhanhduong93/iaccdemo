// Kho mẫu in riêng của đơn vị (tiện ích 11.11, kế hoạch mục 8.7). Chưa có backend nên lưu localStorage theo đơn vị;
// đọc ghi bọc try/catch, dữ liệu hỏng thì coi như rỗng và in mẫu chuẩn. Không dùng hook React để file báo cáo dùng lại được.
import { CHE_DOS, type CheDo } from '../../app/che-do'
import { mauIn, type MauIn } from '../../app/mau-in'

/** Mẫu riêng: bản sao đã sửa của mẫu chuẩn goc, chỉ áp cho đúng chế độ đã tạo */
export interface MauRieng { id: string; goc: string; cheDo: CheDo; ten: string; macDinh: boolean; mau: MauIn; capNhat: string }

const khoaMau = (donVi: string) => `mau-in:${donVi}`
const khoaKy = (donVi: string) => `nguoi-ky:${donVi}`

const laObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

// Đủ phần veMauIn cần đọc, mẫu gốc còn tồn tại
function hopLe(x: unknown): x is MauRieng {
  if (!laObj(x) || typeof x.id !== 'string' || typeof x.goc !== 'string' || typeof x.ten !== 'string') return false
  if (!CHE_DOS.includes(x.cheDo as CheDo) || !mauIn(x.goc)) return false
  const m = x.mau
  return laObj(m) && laObj(m.trang) && Array.isArray(m.khoi) && Array.isArray(m.thongTin) && Array.isArray(m.ky) && typeof m.tieuDe === 'string'
}

function docTat(donVi: string): MauRieng[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(khoaMau(donVi)) ?? '[]')
    return Array.isArray(v) ? v.filter(hopLe) : []
  } catch {
    return []
  }
}

function ghiTat(donVi: string, ds: MauRieng[]) {
  try { localStorage.setItem(khoaMau(donVi), JSON.stringify(ds)) } catch { /* trình duyệt chặn lưu thì in mẫu chuẩn */ }
}

/** Mẫu riêng của đơn vị theo chế độ, lọc thêm theo mẫu gốc nếu có */
export function dsMauRieng(donVi: string, cd: CheDo, goc?: string): MauRieng[] {
  return docTat(donVi).filter(m => m.cheDo === cd && (!goc || m.goc === goc))
}

/** Thêm hoặc cập nhật theo id */
export function luuMauRieng(donVi: string, m: MauRieng): void {
  const ds = docTat(donVi)
  const moi = { ...m, capNhat: new Date().toISOString() }
  const i = ds.findIndex(x => x.id === m.id)
  if (i >= 0) ds[i] = moi
  else ds.push(moi)
  ghiTat(donVi, ds)
}

export function xoaMauRieng(donVi: string, id: string): void {
  ghiTat(donVi, docTat(donVi).filter(m => m.id !== id))
}

/** Đặt mẫu riêng id làm mặc định của goc; null = dùng mẫu chuẩn */
export function datMacDinh(donVi: string, cd: CheDo, goc: string, id: string | null): void {
  ghiTat(donVi, docTat(donVi).map(m => m.cheDo === cd && m.goc === goc ? { ...m, macDinh: m.id === id } : m))
}

/** Mẫu đem in: mẫu riêng mặc định của goc, không có thì mẫu chuẩn */
export function mauDungIn(donVi: string, cd: CheDo, goc: string): MauIn {
  const rieng = dsMauRieng(donVi, cd, goc).find(m => m.macDinh)
  return rieng?.mau ?? mauIn(goc) ?? mauIn('phieu-ke-toan')!
}

/** Toàn bộ mẫu riêng của chế độ ra chuỗi JSON để chép sang đơn vị khác */
export function xuatJson(donVi: string, cd: CheDo): string {
  return JSON.stringify({ loai: 'iacc-mau-in', phienBan: 1, cheDo: cd, mau: dsMauRieng(donVi, cd) }, null, 2)
}

/** Nhập mẫu từ file JSON vào chế độ đang dùng, trùng id thì ghi đè. Trả số mẫu nhập được; file sai thì ném lỗi */
export function nhapJson(donVi: string, cd: CheDo, json: string): number {
  let v: unknown
  try {
    v = JSON.parse(json)
  } catch {
    throw new Error('File không phải JSON hợp lệ')
  }
  const goc = Array.isArray(v) ? v : laObj(v) && Array.isArray(v.mau) ? v.mau : null
  if (!goc) throw new Error('File không phải mẫu in xuất từ IACC Cloud')
  const nhap = goc.filter(hopLe).map(m => ({ ...m, cheDo: cd }))
  if (!nhap.length) throw new Error('File không có mẫu in nào dùng được')
  const ds = docTat(donVi).filter(m => !nhap.some(x => x.id === m.id))
  // mỗi mẫu gốc chỉ một mẫu mặc định: mẫu nhập vào là mặc định thì bỏ mặc định cũ
  const coMacDinh = new Set(nhap.filter(m => m.macDinh).map(m => m.goc))
  ghiTat(donVi, [...ds.map(m => m.cheDo === cd && coMacDinh.has(m.goc) ? { ...m, macDinh: false } : m), ...nhap])
  return nhap.length
}

export const khoaMoi = (): string => `mr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Người ký mặc định cấp đơn vị: chức danh → họ tên. Dùng cho mọi mẫu chưa sửa riêng phần ký */
export function layNguoiKy(donVi: string): Record<string, string> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(khoaKy(donVi)) ?? '{}')
    if (!laObj(v)) return {}
    return Object.fromEntries(Object.entries(v).filter((e): e is [string, string] => typeof e[1] === 'string'))
  } catch {
    return {}
  }
}

export function luuNguoiKy(donVi: string, m: Record<string, string>): void {
  try { localStorage.setItem(khoaKy(donVi), JSON.stringify(m)) } catch { /* trình duyệt chặn lưu thì thôi */ }
}
