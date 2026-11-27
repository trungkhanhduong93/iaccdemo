// Giá trị mặc định chứng từ theo cửa hàng, gói Pro (T955). Chưa có backend: lưu localStorage theo đơn vị và mã màn chứng từ.
import { CUA_HANG, KHOAN_MUC, NCC, NHAN_VIEN, type Role } from '../../data/mock'

export type NhomTruong = 'dau' | 'luoi'   // dau: đầu phiếu, luoi: dòng chi tiết
/** ds trả danh sách [giá trị, nhãn] theo cửa hàng; không có ds thì là ô gõ chữ */
export interface TruongMacDinh { nhom: NhomTruong; k: string; ten: string; ds?: (cnId: string) => [string, string][] }
/** { [mã cửa hàng]: { 'dau:kho': 'Kho bếp Lê Lợi', 'luoi:km': 'CP05' } }; khoá không có hoặc rỗng thì không tự điền */
export type GiaTriMacDinh = Record<string, Record<string, string>>

const khoCn = (cnId: string): [string, string][] => (CUA_HANG.find(c => c.id === cnId)?.kho ?? []).map(k => [k, k])

/** Kho trường chọn được theo mã màn chứng từ (sc.code). Màn không có ở đây thì không hiện nút Giá trị mặc định */
export const TRUONG_MAC_DINH: Record<string, TruongMacDinh[]> = {
  '4.1.1': [   // Phiếu mua hàng, thí điểm
    { nhom: 'dau', k: 'ncc', ten: 'Nhà cung cấp', ds: () => NCC.map(n => [n.ten, n.ten]) },
    { nhom: 'dau', k: 'kho', ten: 'Kho nhập', ds: khoCn },
    { nhom: 'dau', k: 'httt', ten: 'Hình thức thanh toán', ds: () => [['congno', 'Chưa thanh toán'], ['tienmat', 'Tiền mặt'], ['chuyenkhoan', 'Chuyển khoản']] },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người giao', ds: () => NHAN_VIEN.map(n => [n.ten, n.ten]) },
    { nhom: 'luoi', k: 'kho', ten: 'Kho', ds: khoCn },
    { nhom: 'luoi', k: 'ts', ten: 'Thuế suất', ds: () => [['0', '0%'], ['5', '5%'], ['8', '8%'], ['10', '10%']] },
    { nhom: 'luoi', k: 'km', ten: 'Khoản mục', ds: () => KHOAN_MUC.map(km => [km.ma, km.ten]) },
  ],
}

const khoa = (donVi: string, ma: string) => `iacc-gt-mac-dinh:${donVi}/${ma}`

export function docMacDinh(donVi: string, ma: string): GiaTriMacDinh {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(khoa(donVi, ma)) ?? '{}')
    return v && typeof v === 'object' && !Array.isArray(v) ? v as GiaTriMacDinh : {}
  } catch { return {} }
}

export function luuMacDinh(donVi: string, ma: string, gt: GiaTriMacDinh) {
  try { localStorage.setItem(khoa(donVi, ma), JSON.stringify(gt)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
}

/** Ô có sẵn trong hộp lúc admin chưa chọn lần nào */
const O_BAN_DAU: Record<string, string[]> = { '4.1.1': ['dau:kho', 'dau:httt', 'luoi:kho'] }
const khoaO = (donVi: string, ma: string) => `iacc-gt-mac-dinh-o:${donVi}/${ma}`

/** Danh sách ô admin chọn để đặt mặc định, dạng 'dau:kho'; dùng chung mọi cửa hàng của đơn vị */
export function docODaChon(donVi: string, ma: string): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(khoaO(donVi, ma)) ?? 'null')
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string')
  } catch { /* hỏng thì dùng danh sách ban đầu */ }
  return O_BAN_DAU[ma] ?? []
}

export function luuODaChon(donVi: string, ma: string, ds: string[]) {
  try { localStorage.setItem(khoaO(donVi, ma), JSON.stringify(ds)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
}

/** Giá trị của một cửa hàng, chỉ gồm ô đang chọn; cửa hàng chưa đặt thì trả {} (không lấy mặc định chung công ty) */
export function macDinhCuaHang(donVi: string, ma: string, cnId: string): Record<string, string> {
  const chon = docODaChon(donVi, ma)
  return Object.fromEntries(Object.entries(docMacDinh(donVi, ma)[cnId] ?? {}).filter(([k, v]) => v && chon.includes(k)))
}

/** Chủ doanh nghiệp, kế toán trưởng được sửa; kế toán viên chỉ xem */
export const duocSuaMacDinh = (role: Role) => role === 'owner' || role === 'ktt'
