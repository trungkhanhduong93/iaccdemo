// Giá trị mặc định chứng từ theo cửa hàng, gói Pro (T955, T962). Chưa có backend: lưu localStorage theo đơn vị và mã màn chứng từ.
import { CUA_HANG, KHACH, KHOAN_MUC, LY_DO, NCC, NHAN_VIEN, type Role } from '../../data/mock'
import { DS_DOI_TUONG } from './BangSua'
import { QUY_TIEN } from './gen'
import { LY_CHI, LY_THU, LY_XUAT } from './nhom'

export type NhomTruong = 'dau' | 'luoi'   // dau: đầu phiếu, luoi: dòng chi tiết
/** ds trả danh sách [giá trị, nhãn] theo cửa hàng; theoCn = danh sách thay đổi theo cửa hàng; không có ds thì là ô gõ chữ */
export interface TruongMacDinh { nhom: NhomTruong; k: string; ten: string; ds?: (cnId: string) => [string, string][]; theoCn?: boolean }
/** { [mã cửa hàng]: { 'dau:kho': 'Kho bếp Lê Lợi', 'luoi:km': 'CP05' } }; khoá không có hoặc rỗng thì không tự điền */
export type GiaTriMacDinh = Record<string, Record<string, string>>

const cap = (ds: readonly string[]): [string, string][] => ds.map(x => [x, x])
const khoCn = (cnId: string): [string, string][] => cap(CUA_HANG.find(c => c.id === cnId)?.kho ?? [])
const dsNcc = () => cap(NCC.map(n => n.ten))
const dsKh = () => cap(KHACH.map(k => k.ten))
const dsNv = () => cap(NHAN_VIEN.map(n => n.ten))
const dsDt = () => cap(DS_DOI_TUONG)
const dsCuaHang = () => cap(CUA_HANG.map(c => c.ten))
const dsCnKhac = (cnId: string) => cap(CUA_HANG.filter(c => c.id !== cnId).map(c => c.ten))
const dsHttt = (): [string, string][] => [['congno', 'Chưa thanh toán'], ['tienmat', 'Tiền mặt'], ['chuyenkhoan', 'Chuyển khoản']]
const dsTs = (): [string, string][] => [['0', '0%'], ['5', '5%'], ['8', '8%'], ['10', '10%']]
const dsKm = (): [string, string][] => KHOAN_MUC.map(km => [km.ma, km.ten])
const dsTknh = () => cap(QUY_TIEN.slice(CUA_HANG.length))
const dsQuyCq = (cnId: string): [string, string][] => {
  const ngan = CUA_HANG.find(c => c.id === cnId)?.ngan
  return [...(ngan ? [[`Quỹ tiền mặt ${ngan}`, `Quỹ tiền mặt ${ngan}`] as [string, string]] : []), ...dsTknh()]
}
const dsLyThu = () => cap(LY_THU)
const dsLyChi = () => cap(LY_CHI)
const dsLyXuat = () => cap(LY_XUAT)
const dsLyHuy = () => cap(LY_DO.filter(x => x.dung === 'Xuất kho').map(x => x.ten))

const muaKho = (khoTen: string): TruongMacDinh[] => [
  { nhom: 'dau', k: 'ncc', ten: 'Nhà cung cấp', ds: dsNcc },
  { nhom: 'dau', k: 'kho', ten: khoTen, ds: khoCn, theoCn: true },
  { nhom: 'dau', k: 'httt', ten: 'Hình thức thanh toán', ds: dsHttt },
  { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  { nhom: 'dau', k: 'nguoiGiao', ten: 'Người giao hàng', ds: dsNv },
  { nhom: 'luoi', k: 'kho', ten: 'Kho', ds: khoCn, theoCn: true },
  { nhom: 'luoi', k: 'ts', ten: 'Thuế suất', ds: dsTs },
]

const muaDichVu = (tenNcc: string): TruongMacDinh[] => [
  { nhom: 'dau', k: 'ncc', ten: tenNcc, ds: dsNcc },
  { nhom: 'dau', k: 'httt', ten: 'Hình thức thanh toán', ds: dsHttt },
  { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  { nhom: 'dau', k: 'nguoiGiao', ten: 'Người giao hàng', ds: dsNv },
  { nhom: 'luoi', k: 'ts', ten: 'Thuế suất', ds: dsTs },
  { nhom: 'luoi', k: 'km', ten: 'Khoản mục', ds: dsKm },
]

const banHang = (khoTen = 'Kho xuất'): TruongMacDinh[] => [
  { nhom: 'dau', k: 'kh', ten: 'Khách hàng', ds: dsKh },
  { nhom: 'dau', k: 'kho', ten: khoTen, ds: khoCn, theoCn: true },
  { nhom: 'dau', k: 'httt', ten: 'Hình thức thanh toán', ds: dsHttt },
  { nhom: 'dau', k: 'nv', ten: 'Nhân viên bán hàng', ds: dsNv },
  { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  { nhom: 'luoi', k: 'ts', ten: 'Thuế suất', ds: dsTs },
]

const xuatSx = (): TruongMacDinh[] => [
  { nhom: 'dau', k: 'kho', ten: 'Kho xuất', ds: khoCn, theoCn: true },
  { nhom: 'dau', k: 'nguoiGiao', ten: 'Nhân viên thực hiện', ds: dsNv },
  { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
]

const nhapThamChieu = (): TruongMacDinh[] => [
  { nhom: 'dau', k: 'nguoiGiao', ten: 'Nhân viên thực hiện', ds: dsNv },
  { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
]

/** Kho trường chọn được theo mã màn chứng từ (sc.code hoặc slug với màn kho không có code). Màn không có ở đây thì không hiện nút Giá trị mặc định */
export const TRUONG_MAC_DINH: Record<string, TruongMacDinh[]> = {
  // Tiền (2.1.1 theo loại phiếu)
  '2.1.1:thu': [
    { nhom: 'dau', k: 'dt', ten: 'Đối tượng', ds: dsDt },
    { nhom: 'dau', k: 'ly', ten: 'Lý do thu', ds: dsLyThu },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người nộp', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '2.1.1:chi': [
    { nhom: 'dau', k: 'dt', ten: 'Đối tượng', ds: dsDt },
    { nhom: 'dau', k: 'ly', ten: 'Lý do chi', ds: dsLyChi },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người nhận', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '2.1.1:bc': [
    { nhom: 'dau', k: 'tknh', ten: 'Nộp vào tài khoản', ds: dsTknh },
    { nhom: 'dau', k: 'dt', ten: 'Đối tượng', ds: dsDt },
    { nhom: 'dau', k: 'ly', ten: 'Lý do thu', ds: dsLyThu },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '2.1.1:unc': [
    { nhom: 'dau', k: 'tknh', ten: 'Tài khoản chi', ds: dsTknh },
    { nhom: 'dau', k: 'dt', ten: 'Đối tượng', ds: dsDt },
    { nhom: 'dau', k: 'ly', ten: 'Lý do chi', ds: dsLyChi },
    { nhom: 'dau', k: 'dienGiai', ten: 'Nội dung thanh toán' },
  ],
  '2.1.1:cq': [
    { nhom: 'dau', k: 'tuQuy', ten: 'Từ quỹ', ds: dsQuyCq, theoCn: true },
    { nhom: 'dau', k: 'denQuy', ten: 'Đến quỹ', ds: dsQuyCq, theoCn: true },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người thực hiện', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],

  // Mua hàng
  '4.1.1': [   // Phiếu mua hàng, thí điểm
    { nhom: 'dau', k: 'ncc', ten: 'Nhà cung cấp', ds: () => NCC.map(n => [n.ten, n.ten]) },
    { nhom: 'dau', k: 'kho', ten: 'Kho nhập', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'httt', ten: 'Hình thức thanh toán', ds: () => [['congno', 'Chưa thanh toán'], ['tienmat', 'Tiền mặt'], ['chuyenkhoan', 'Chuyển khoản']] },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người giao dịch', ds: () => NHAN_VIEN.map(n => [n.ten, n.ten]) },
    { nhom: 'luoi', k: 'kho', ten: 'Kho', ds: khoCn, theoCn: true },
    { nhom: 'luoi', k: 'ts', ten: 'Thuế suất', ds: () => [['0', '0%'], ['5', '5%'], ['8', '8%'], ['10', '10%']] },
    { nhom: 'luoi', k: 'km', ten: 'Khoản mục', ds: () => KHOAN_MUC.map(km => [km.ma, km.ten]) },
  ],
  '4.1.2': [
    { nhom: 'dau', k: 'ncc', ten: 'Nhà cung cấp', ds: dsNcc },
    { nhom: 'dau', k: 'httt', ten: 'Hình thức thanh toán', ds: dsHttt },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người giao hàng', ds: dsNv },
    { nhom: 'luoi', k: 'ts', ten: 'Thuế suất', ds: dsTs },
  ],
  '4.1.3': muaKho('Kho nhập'),
  '4.1.4': muaKho('Kho xuất'),
  '4.1.5': muaDichVu('Nhà cung cấp dịch vụ'),
  '4.1.6': muaDichVu('Nhà cung cấp'),

  // Bán hàng
  '3.1.1': banHang(),
  '3.1.7': banHang(),
  '3.1.2': banHang(),
  '3.1.3': [
    { nhom: 'dau', k: 'dt', ten: 'Cửa hàng mua', ds: dsCuaHang },
    { nhom: 'dau', k: 'kho', ten: 'Kho xuất', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'httt', ten: 'Hình thức thanh toán', ds: dsHttt },
    { nhom: 'dau', k: 'nv', ten: 'Nhân viên bán hàng', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '3.1.4': banHang('Kho nhập'),

  // Kho hàng
  '5.1.1': [
    { nhom: 'dau', k: 'kho', ten: 'Kho nhập', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người thực hiện', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '5.1.2-2': [
    { nhom: 'dau', k: 'kho', ten: 'Kho xuất', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'dt', ten: 'Khách hàng', ds: dsKh },
    { nhom: 'dau', k: 'ly', ten: 'Lý do xuất', ds: dsLyXuat },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người giao / nhận', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
    { nhom: 'luoi', k: 'kho', ten: 'Kho', ds: khoCn, theoCn: true },
  ],
  '5.1.2-3': [
    { nhom: 'dau', k: 'kho', ten: 'Kho xuất', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'ly', ten: 'Lý do huỷ', ds: dsLyHuy },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Người thực hiện', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '5.1.2-4': [
    { nhom: 'dau', k: 'kho', ten: 'Kho xuất', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'dt', ten: 'Người nhận', ds: dsNv },
    { nhom: 'dau', k: 'nguoiGiao', ten: 'Nhân viên thực hiện', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '5.1.6': xuatSx(),
  '5-1-6-2': nhapThamChieu(),
  '5.1.3': xuatSx(),
  '5-1-3-2': nhapThamChieu(),
  '5.1.4': [
    { nhom: 'dau', k: 'kho', ten: 'Kho xuất', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'cnNhan', ten: 'Cửa hàng nhận', ds: dsCnKhac },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '5-1-4-2': nhapThamChieu(),
  '5-1-4-3': [
    { nhom: 'dau', k: 'kho', ten: 'Kho xuất', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'khoNhan', ten: 'Kho nhận', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '5.1.10': [
    { nhom: 'dau', k: 'kho', ten: 'Kho kiểm kê', ds: khoCn, theoCn: true },
    { nhom: 'dau', k: 'nv', ten: 'Người kiểm kê', ds: dsNv },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
  '5.1.11': [
    { nhom: 'dau', k: 'ncc', ten: 'Nhà cung cấp', ds: dsNcc },
    { nhom: 'dau', k: 'dienGiai', ten: 'Diễn giải' },
  ],
}

/** Mã lưu giá trị mặc định (T962): màn có nhiều loại phiếu chung mã (Tiền 2.1.1) thì đặt riêng từng loại, vd '2.1.1:thu' */
export function maMacDinh(code: string, loaiK?: string): string {
  return loaiK && TRUONG_MAC_DINH[`${code}:${loaiK}`] ? `${code}:${loaiK}` : code
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
const O_BAN_DAU: Record<string, string[]> = {
  '2.1.1:thu': ['dau:dt', 'dau:ly'],
  '2.1.1:chi': ['dau:dt', 'dau:ly'],
  '2.1.1:bc': ['dau:tknh', 'dau:ly'],
  '2.1.1:unc': ['dau:tknh', 'dau:ly'],
  '2.1.1:cq': ['dau:tuQuy', 'dau:denQuy'],
  '4.1.1': ['dau:kho', 'dau:httt', 'luoi:kho'],
  '4.1.2': ['dau:httt'],
  '4.1.3': ['dau:kho', 'dau:httt', 'luoi:kho'],
  '4.1.4': ['dau:kho', 'dau:httt', 'luoi:kho'],
  '4.1.5': ['dau:httt'],
  '4.1.6': ['dau:httt'],
  '3.1.1': ['dau:kho', 'dau:httt'],
  '3.1.7': ['dau:kho', 'dau:httt'],
  '3.1.2': ['dau:kho', 'dau:httt'],
  '3.1.3': ['dau:kho', 'dau:httt'],
  '3.1.4': ['dau:kho', 'dau:httt'],
  '5.1.1': ['dau:kho'],
  '5.1.2-2': ['dau:kho'],
  '5.1.2-3': ['dau:kho'],
  '5.1.2-4': ['dau:kho'],
  '5.1.6': ['dau:kho'],
  '5-1-6-2': ['dau:dienGiai'],
  '5.1.3': ['dau:kho'],
  '5-1-3-2': ['dau:dienGiai'],
  '5.1.4': ['dau:kho', 'dau:cnNhan'],
  '5-1-4-2': ['dau:dienGiai'],
  '5-1-4-3': ['dau:kho', 'dau:khoNhan'],
  '5.1.10': ['dau:kho'],
  '5.1.11': ['dau:ncc'],
}
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
