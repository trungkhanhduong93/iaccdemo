// Khai báo phân hệ và màn hình. Mỗi phân hệ là một thư mục trong src/modules, có index.ts trả về ModuleDef.
import type { ComponentType, ReactNode } from 'react'
import { FEATURES, type Goi } from '../app/plan'
import type { CheDo } from '../app/che-do'
import type { CauHinhDM } from './danh-muc/truong-dm'

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
  an?: boolean           // cột mặc định ẩn, người dùng bật ở Tuỳ chỉnh cột (T92)
  nhom?: string          // tên nhóm cột cho tiêu đề 2 tầng (TT58, T108)
  kyHieu?: string        // ký hiệu cột in sẵn (A, B, C, 1, 2... theo biểu mẫu TT58)
}

/** Danh mục: bảng có tìm kiếm, nút thêm */
export interface CatalogCfg {
  cols: Col[] | ((goi: Goi) => Col[])
  rows: (cd: CheDo) => Row[]             // danh mục đổi theo chế độ kế toán, vd hệ thống tài khoản
  them?: string
  nhomLoc?: string
  nhanLoc?: string
  chucNang?: (r: Row) => { nhan: string; di: string; icon?: string }[]
  note?: (goi: Goi) => ReactNode
  truong?: CauHinhDM                     // trường panel Thêm / Sửa riêng của màn, không khai thì lấy TRUONG_DM theo mã màn
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
  nguon?: 'FABi' | 'IVT' | 'HĐ' | 'tay' | 'excel'  // nguồn chính của chứng từ; excel: nhập từ file Excel (T64)
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
  rows?: (thang: number, cn?: string) => Row[]   // cn: tên chi nhánh chọn trên thanh trên (T63)
  taiKhoan?: string                      // sổ theo tài khoản
  theoCn?: boolean                       // số liệu theo chi nhánh chọn trên thanh trên
  theoTk?: boolean                       // sổ tách theo tài khoản ngân hàng, lọc được theo quỹ tiền (T54)
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
  goc?: string             // màn báo cáo trong phân hệ Báo cáo: key phân hệ gốc (vd 'mua-hang')
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

/** Ô trên sơ đồ quy trình. di là đường dẫn sau /app/, vd 'tien/2-1-1/moi?loai=thu' mở form phiếu thu mới; di rỗng là ô chỉ để xem, không bấm được (T100) */
export interface NutQT { ten: string; icon: string; di: string; tone?: 'fabi' | 'ivt' | 'hd'; noi?: string }   // noi: chữ trên mũi tên từ ô trước tới ô này trong làn hội tụ (T98)

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
  hoiTuFree?: { lan: LanQT[]; ra: LanQT } // gói Free dùng sơ đồ hội tụ riêng thay sơ đồ chung (T98)
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
