// Khai báo phân hệ và màn hình. Mỗi phân hệ là một thư mục trong src/modules, có index.ts trả về ModuleDef.
import type { ComponentType, ReactNode } from 'react'
import { FEATURES, type Goi } from '../app/plan'

export type Row = Record<string, any>
export interface Col {
  k: string
  t: string
  num?: boolean          // cột số tiền, căn phải
  c?: boolean            // căn giữa
  w?: number
  cls?: string
  r?: (row: Row) => ReactNode
  dinh?: 'trai' | 'phai' // cột đứng yên khi cuộn ngang; cột 'trai' phải khai w
  hd?: ReactNode         // nội dung ô tiêu đề thay cho t, vd ô tick chọn tất cả
}

/** Danh mục: bảng có tìm kiếm, nút thêm */
export interface CatalogCfg {
  cols: Col[] | ((goi: Goi) => Col[])
  rows: () => Row[]
  them?: string
  nhomLoc?: string
  nhanLoc?: string
  chucNang?: (r: Row) => { nhan: string; di: string; icon?: string }[]
  note?: (goi: Goi) => ReactNode
}

/** Chứng từ: danh sách + form chi tiết */
export interface VoucherCfg {
  prefix: string                         // tiền tố số chứng từ: PT, PC, BH, MH...
  doiTuong: 'kh' | 'ncc' | 'nv' | 'cn' | 'none'
  nhan?: string                          // nhãn cột đối tượng
  dienGiai: string[]                     // mẫu diễn giải
  tien: [number, number]                 // khoảng số tiền giả
  dong?: 'hang' | 'nvl' | 'tien' | 'ts'  // dòng chi tiết
  noCo?: [string, string, string][]      // bút toán mẫu: Nợ, Có, diễn giải
  soTT58?: string                        // sổ ghi theo TT58 khi không dùng tài khoản
  nguon?: 'FABi' | 'IVT' | 'HĐ' | 'tay'  // nguồn chính của chứng từ
  them?: string                          // nhãn nút thêm
  thue?: number                          // thuế suất GTGT mặc định
  loai?: LoaiCT[]                        // một màn nhiều loại phiếu, vd 2.1.1 có phiếu thu, phiếu chi
  soPhieu?: number                       // số phiếu mẫu, mặc định 26
}

/** Một loại phiếu trong màn chứng từ. Mở form đúng loại bằng ?loai=k */
export interface LoaiCT {
  k: string
  ten: string                            // tên loại, cũng là tiêu đề form: Thu tiền mặt, Chi tiền mặt
  prefix: string
  doiTuong?: VoucherCfg['doiTuong']
  nhan?: string
  dienGiai?: string[]
  noCo?: [string, string, string][]
  soTT58?: string
  thue?: number
  icon?: string
}

/** Sổ, báo cáo dạng bảng */
export interface ReportCfg {
  kieu: 'so' | 'tonghop' | 'bangke' | 'dinhmuc'
  doiTuong?: 'kh' | 'ncc' | 'hang' | 'nvl' | 'tk' | 'ts' | 'ccdc' | 'cn'
  cols?: Col[]                           // bảng kê tự khai cột
  rows?: (thang: number) => Row[]
  mau?: string                           // ký hiệu mẫu sổ, vd S07-DNN
  taiKhoan?: string                      // sổ theo tài khoản
  theoCn?: boolean                       // số liệu theo chi nhánh chọn trên thanh trên
}

/** Tiện ích, chức năng chạy theo lệnh */
export interface ToolCfg {
  mota: string
  nut: string
  caiDat?: [string, string][]
  nhatKy?: [string, string, string][]    // thời điểm, nội dung, kết quả
}

export interface ScreenDef {
  slug: string
  code?: string            // mã tính năng trong Excel; quyết định khoá theo gói
  can?: string[]           // màn không có trong Excel: cần một trong các mã này
  ten?: string
  ngan?: string            // nhãn ngắn trên thanh tab
  icon?: string   // biểu tượng riêng của màn (tên trong Icon.tsx); không có thì dùng biểu tượng theo loại màn hoặc của phân hệ
  nhom?: string            // nhóm Excel; nhóm có chữ "báo cáo" vào tab Báo cáo
  tab?: boolean            // ép màn báo cáo thành tab riêng (true) hoặc màn khác vào tab Báo cáo (false)
  kind: 'custom' | 'catalog' | 'voucher' | 'report' | 'tool' | 'quytrinh' | 'baocao'
  comp?: ComponentType<ScreenProps>
  catalog?: CatalogCfg
  voucher?: VoucherCfg
  report?: ReportCfg
  tool?: ToolCfg
}

export interface ModuleDef {
  key: string
  ten: string
  ngan: string              // nhãn trên thanh biểu tượng
  icon: string
  mod?: number              // vị trí trong MODS của Excel
  mota?: string
  quyTrinh?: QuyTrinhDef    // có thì phân hệ có tab Quy trình đứng đầu
  screens: ScreenDef[]
}

/** Ô trên sơ đồ quy trình. di là đường dẫn sau /app/, vd 'tien/2-1-1/moi?loai=thu' mở form phiếu thu mới */
export interface NutQT { ten: string; icon: string; di: string; tone?: 'fabi' | 'ivt' | 'hd' }

/** Một bước trên trục ngang: ô chính nằm trên trục, ô phụ treo phía trên hoặc phía dưới */
export interface BuocQT { ten?: string; chinh: NutQT; tren?: NutQT[]; duoi?: NutQT[] }

/** Một làn của sơ đồ hội tụ: tên nhóm nghiệp vụ và các ô xếp ngang */
export interface LanQT {
  ten: string
  nut: NutQT[]
  tone?: 'ok' | 'err' | 'info' | 'ad' | 'st'  // tông màu ô biểu tượng ở nhãn làn: xanh lá, đỏ, xanh, tím, xanh ngọc; thiếu thì 'info'
}

export interface QuyTrinhDef {
  ten: string                            // tiêu đề sơ đồ
  buoc: BuocQT[]                         // trái sang phải
  hoiTu?: { lan: LanQT[]; ra: LanQT }    // sơ đồ hội tụ thay trục ngang: các làn nghiệp vụ song song cùng đổ về khối kết quả bên phải
  danhSo?: boolean                       // đánh số bước, kiểu màn Giá thành của AMIS
  baoCao?: string[]                      // khung Báo cáo bên phải: slug trong phân hệ hoặc 'phân hệ/slug'
  ghiChu?: { tieuDe: string; dong: [string, string, string?][] }  // thay khung Báo cáo khi phân hệ không có báo cáo
  danhMuc?: string[]                     // hàng dưới: danh mục liên quan, dạng 'phân hệ/slug'
  tienIch?: string[]                     // menu Tiện ích ở hàng dưới
}

export interface ScreenProps { sc: ScreenDef; mod: ModuleDef }

const KIND: Record<string, ScreenDef['kind']> = { 'Danh mục': 'catalog', 'Chứng từ': 'voucher', 'Chức năng': 'tool', 'Tiện ích': 'tool' }

/** Sinh màn hình cho mọi tính năng Excel của một phân hệ, ghép cấu hình riêng và nhãn tab ngắn theo mã.
 *  Kiểu màn lấy theo cấu hình riêng (voucher, tool, catalog, report); không khai thì theo nhóm Excel. */
export function tuExcel(mod: number, rieng: Record<string, Partial<ScreenDef>> = {}, ngan: Record<string, string> = {}): ScreenDef[] {
  return FEATURES.filter(f => f.m === mod).map(f => {
    const r = rieng[f.c] ?? {}
    const kind = r.kind ?? (r.voucher ? 'voucher' : r.tool ? 'tool' : r.catalog ? 'catalog' : r.report ? 'report' : KIND[f.grp] ?? 'report')
    return { slug: f.c.replace(/\./g, '-'), code: f.c, nhom: f.grp, ngan: ngan[f.c], ...r, kind }
  })
}
