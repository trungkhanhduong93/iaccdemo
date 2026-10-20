// Khai báo phân hệ và màn hình. Mỗi phân hệ là một thư mục trong src/modules, có index.ts trả về ModuleDef.
import type { ComponentType, ReactNode } from 'react'
import { FEATURES, type Goi } from '../app/plan'
import type { CheDo } from '../app/che-do'
import type { CauHinhDM } from './danh-muc/truong-dm'
import type { Session } from '../app/session'

export type Row = Record<string, any>
export interface Col {
  k: string
  t: string
  num?: boolean          // cột số tiền, căn phải
  c?: boolean            // căn giữa
  w?: number
  wCung?: boolean        // rộng đúng w, không tự giãn theo tiêu đề, tiêu đề dài xuống dòng (T287, lưới thẻ chi phí)
  cls?: string
  r?: (row: Row) => ReactNode
  dinh?: 'trai' | 'phai' // cột đứng yên khi cuộn ngang; cột 'trai' phải khai w
  hd?: ReactNode         // nội dung ô tiêu đề thay cho t, vd ô tick chọn tất cả
  an?: boolean           // cột mặc định ẩn, người dùng bật ở Tuỳ chỉnh cột (T92)
  nhom?: string          // tên nhóm cột cho tiêu đề 2 tầng (TT58, T108)
  kyHieu?: string        // ký hiệu cột in sẵn (A, B, C, 1, 2... theo biểu mẫu TT58)
  chiManHinh?: boolean   // cột chỉ hiện trên màn hình (vd nút Thanh toán ngay), bỏ khi xem trước, in, xuất Excel (T304)
  goi?: Goi[]            // cột báo cáo bảng kê chỉ có ở các gói này (vd Báo cáo kiểm kê gói Free chỉ Thừa, Thiếu, T502)
}

/** Danh mục: bảng có tìm kiếm, nút thêm */
export interface CatalogCfg {
  cols: Col[] | ((goi: Goi, cheDo: CheDo) => Col[])
  rows: (cd: CheDo, ky: number) => Row[] // danh mục đổi theo chế độ kế toán, vd hệ thống tài khoản; ky (yyyymm) khi có kySoLieu
  them?: string
  khongThem?: Goi[]        // gói không có nút thêm mới (vd danh mục Kho gói Free, T143)
  khongExcel?: Goi[]       // gói không có nút Nhập, Xuất Excel (vd Phương thức thanh toán lấy từ FABi, T268)
  chiXem?: Goi[]           // gói chỉ xem chi tiết, không sửa, không xoá (vd Phương thức thanh toán lấy từ FABi, T328)
  nutPhu?: { nhan: string; icon?: string; logo?: string; bao: string; chiIcon?: boolean }   // nút phụ trên thanh công cụ, bấm thì báo bao (vd Đồng bộ từ FABi, T144, T181)
  locGoi?: (goi: Goi, r: Row) => boolean   // lọc dòng theo gói (vd gói Free chỉ thấy kho mặc định của cửa hàng, T143)
  nhomLoc?: string
  nhanLoc?: string
  chucNang?: (r: Row) => { nhan: string; di: string; icon?: string }[]
  stt?: boolean                          // cột STT đầu bảng, đánh số theo dòng đang hiện
  kySoLieu?: boolean                     // ô chọn Kỳ số liệu (các tháng của năm tài chính), số liệu tính tới hết kỳ
  tich?: { nhan: string; macDinh: boolean; loc: (r: Row) => boolean }   // ô tích lọc nhanh trên thanh công cụ, tích thì chỉ hiện dòng loc đúng
  // Hook dải cảnh báo trên bảng (T287): so > 0 thì dải vàng và số trên nút thêm hàng loạt, so = 0 thì gợi ý xám; cachLam: các bước mở từ link Cách làm; null thì ẩn; ky: kỳ số liệu yyyymm
  useCanhBao?: (ky: number) => { so: number; noiDung: ReactNode; cachLam?: ReactNode } | null
  // Hook trả hàm sửa từng dòng theo kỳ, gói (vd Phân bổ trong kỳ chỉ có khi kỳ đã kích hoạt, T438)
  useHauXuLy?: (ky: number, goi: Goi) => (r: Row) => Row
  // Nút phụ ở thanh công cụ, cạnh nút thêm; lam trả câu báo (vd Phân bổ ở danh sách thẻ chi phí gói Plus, Pro, T438)
  // hoi: câu hỏi lại trước khi làm (null thì làm luôn); lam trả câu báo
  nutKichHoat?: { nhan: string; icon: string; goi: Goi[]; hoi?: (rows: Row[], ky: number) => string | null; lam: (rows: Row[], ky: number) => string }[]
  hangLoat?: { nhan: string; nhanChinh?: string; Form: ComponentType<{ soDong: number; rows: Row[]; onDong: () => void }> }   // nút thêm hàng loạt mở form riêng, soDong: số dòng đang có, rows: các dòng đang có (T284)
  // Danh sách kiểu danh sách chứng từ: phân trang, dòng Tổng, cộng các cột cotCong; bấm dòng chọn và xem nhanh chi tiết ở khung dưới, đúp chuột mở form;
  // cotSo: cột số chứng từ hiện link xanh, bấm mở form như danh sách thu chi
  // Dòng lấy thêm giá trị lưu trong phiên, lưu form thì ghi vào phiên; vd số dư ban đầu quỹ ở Danh mục Quỹ tiền (T245)
  phien?: { gan: (r: Row, s: Session) => Row; luu: (val: Record<string, any>, s: Session) => Partial<Session> }
  dsChungTu?: { cotCong: string[]; cotSo?: string; so: (r: Row) => string; moTa: (r: Row) => string; chiTiet: (r: Row) => ReactNode }
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
  nhomLoai?: { k: string; ten: string; loai: string[] }[]   // mỗi nhóm loại phiếu một tab trên thanh tab phân hệ (?nhom=), mỗi loại trong tab một nút thêm, vd Tiền mặt (thu, chi), Ngân hàng, Chuyển quỹ (T386)
  soPhieu?: number                       // số phiếu mẫu, mặc định 26
  kiemKe?: boolean                       // phiếu kiểm kê: đầu phiếu chọn kho, bảng tồn hệ thống, tồn thực tế, chênh lệch (T124)
  dieuChinh?: boolean                    // phiếu xuất, nhập điều chỉnh sinh từ kiểm kê: đầu phiếu như kiểm kê, có tham chiếu về phiếu kiểm kê (T126)
  khongThem?: boolean                    // danh sách không có nút Thêm mới, phiếu chỉ do phiếu khác sinh ra (T126)
  rowsMau?: () => Row[]                  // phiếu mẫu riêng thay phiếu sinh ngẫu nhiên (T126)
  phieuThem?: (s?: Session) => Row[]     // phiếu mẫu cố định thêm vào đầu danh sách phiếu sinh ngẫu nhiên (T168); s: phiên, vd phiếu thu chi đồng bộ từ FABi (T264)
  sanXuat?: 'xsc' | 'nsc' | 'xcb' | 'ncb' // phiếu sản xuất theo iPOS Inventory: xuất, nhập sơ chế; xuất, nhập chế biến. Bảng dòng riêng, phiếu nhập có tham chiếu phiếu xuất (T152)
  dieuChuyen?: 'xdc' | 'ndc' | 'ck'     // xuất, nhập điều chuyển giữa cửa hàng; chuyển kho trong cửa hàng, không hạch toán. Phiếu nhập tham chiếu phiếu xuất như sản xuất (T155)
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
  nut?: string                           // chữ trên nút thêm khi tab có nhiều loại, vd Thu tiền, Chi tiền (T386)
}

/** Sổ, báo cáo dạng bảng */
export interface ReportCfg {
  kieu: 'so' | 'tonghop' | 'bangke' | 'dinhmuc'
  doiTuong?: 'kh' | 'ncc' | 'hang' | 'nvl' | 'tk' | 'ts' | 'ccdc' | 'cn'
  cols?: Col[]                           // bảng kê tự khai cột
  rows?: (thang: number, cn?: string, loc?: Record<string, string[]>, tyLe?: boolean) => Row[]   // cn: tên cửa hàng chọn trên thanh trên (T63); loc: bộ lọc đang xem, lọc trên phiếu trước khi cộng (T207); tyLe: GTGT theo % doanh thu (T450)
  theoGtgt?: boolean                     // báo cáo bán hàng (T450): GTGT theo % doanh thu bỏ cột thue, vat, hiện giamThue; khấu trừ thì ngược lại
  taiKhoan?: string                      // sổ theo tài khoản
  theoCn?: boolean                       // số liệu theo cửa hàng chọn trên thanh trên
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
  goi?: Goi[]              // màn không có trong Excel chỉ có ở các gói này, gói khác ẩn hẳn (vd Số dư ban đầu ở Thu chi gói Free, T141)
  cheDo?: CheDo[]          // màn chỉ áp dụng cho các thông tư này (T147)
  ten?: string
  ngan?: string            // nhãn ngắn trên thanh tab
  tabCha?: string          // màn con không có tab riêng trên thanh tab; mở màn này thì tab có slug này sáng (T167)
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
export interface NutQT { ten: string; icon: string; di: string; tone?: 'fabi' | 'ivt' | 'hd' | 'kq'; noi?: string; rieng?: boolean }   // rieng: ô sơ đồ luồng đứng riêng, không nhận mũi tên từ cột trước   // noi: chữ trên mũi tên từ ô trước tới ô này (T98); tone 'kq': ô kết quả hệ thống tự tổng hợp, không phải màn hình (T123)

/** Một bước trên trục ngang: ô chính nằm trên trục, ô phụ treo phía trên hoặc phía dưới */
export interface BuocQT { ten?: string; chinh: NutQT; tren?: NutQT[]; duoi?: NutQT[] }

/** Một làn của sơ đồ hội tụ: tên nhóm nghiệp vụ và các ô xếp ngang */
export interface LanQT {
  ten: string
  icon?: string   // biểu tượng ở nhãn làn; thiếu thì lấy của ô đầu làn (T121)
  nut: NutQT[]
  tone?: 'ok' | 'err' | 'info' | 'ad' | 'st'  // tông màu ô biểu tượng ở nhãn làn: xanh lá, đỏ, xanh, tím, xanh ngọc; thiếu thì 'info'
}

/** Một ô của sơ đồ bước theo kỳ (mẫu C, T366): chieu là chấm màu tiền vào, tiền ra, nội bộ; taoMoi là đường dẫn nút + lập nhanh */
export interface NutKyQT extends NutQT { chieu?: 'vao' | 'ra' | 'noi'; taoMoi?: string; moTa?: string; rong?: boolean; nho?: boolean }   // nho: ô nhỏ không mô tả, các ô nho liền nhau chung 1 hàng (T514)

/** Một bước của sơ đồ bước theo kỳ: tên bước, câu giải thích bằng lời thường cho người không rành kế toán, các ô, ghi chú cuối bước (T366) */
export interface BuocKyQT { ten: string; moTa: string; nut: NutKyQT[]; ghiChu?: string; rong?: boolean; nhom?: NhomKyQT[] }
/** Nhóm ô phụ dưới các ô chính của một bước, có tiêu đề, tiêu đề phụ riêng (T514) */
export interface NhomKyQT { ten: string; moTa?: string; nut: NutKyQT[] }

/** Một cột của sơ đồ luồng: các ô xếp dọc; noi là chữ trên mũi tên đi vào cột, ô có noi riêng thì dùng chữ của ô (T123) */
export interface CotQT { nut: NutQT[]; noi?: string }

export interface QuyTrinhDef {
  ten: string                            // tiêu đề sơ đồ
  buoc: BuocQT[]                         // trái sang phải
  hoiTu?: { lan: LanQT[]; ra: LanQT }    // sơ đồ hội tụ thay trục ngang: các làn nghiệp vụ song song cùng đổ về khối kết quả bên phải
  hoiTuFree?: { lan: LanQT[]; ra: LanQT } // gói Free dùng sơ đồ hội tụ riêng thay sơ đồ chung (T98)
  moTaFree?: string                      // dòng mô tả dưới tiêu đề sơ đồ ở gói Free (T123)
  tenFree?: string                       // tiêu đề sơ đồ riêng ở gói Free, vd Quy trình lập tờ khai thuế (T261)
  anDuoiFree?: boolean                   // gói Free ẩn hàng dưới (Danh mục liên quan), vd Kê khai thuế (T261)
  baoCaoFree?: string[]                  // gói Free dùng danh sách báo cáo riêng ở khung Báo cáo, vd sổ TT152 của Kê khai thuế (T261)
  raFree?: LanQT                         // gói Free thay khối báo cáo của sơ đồ hội tụ, các làn giữ nguyên (T262)
  buocKyFree?: BuocKyQT[]                // gói Free dùng sơ đồ bước theo kỳ (mẫu C), ưu tiên trên hoiTuFree, luongFree (T366)
  luongFree?: CotQT[]                     // gói Free dùng sơ đồ luồng theo cột thay sơ đồ chung: ô cột trước nối tới mọi ô cột sau, gộp và tách nhánh (T123)
  danhSo?: boolean                       // đánh số bước, kiểu màn Giá thành của AMIS
  baoCao?: string[]                      // khung Báo cáo bên phải: slug trong phân hệ hoặc 'phân hệ/slug'
  khongBaoCao?: boolean                  // phân hệ không có báo cáo, ẩn link Tất cả báo cáo ở khối đầu ra sơ đồ hội tụ (T146)
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
