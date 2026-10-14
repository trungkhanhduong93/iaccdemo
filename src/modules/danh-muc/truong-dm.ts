// Khai báo trường thông tin panel Thêm / Sửa cho các danh mục (T70)
// Lấy theo bảng DM_ tương ứng trong CSDL kế toán iPOS (schema-dm.md)
import { DON_VI_TINH, TEN_DVT, TEN_NHOM_HANG, TEN_NHOM_DOI_TUONG, TEN_NHOM_MUC_CP, TEN_NHOM_KHO, TEN_MUC_CHI_PHI, TEN_CONG_VIEC_17, NHOM_HANG, TEN_THUONG_HIEU, DS_THUONG_HIEU,
  DS_HANG_HOA_12, dienGiaiQd, maDvt, maHang, maKho, DS_CHUNG_TU_TIEN, DS_MUC_CHI_PHI_16, DS_CONG_VIEC_17, DS_QUY_TIEN_112 } from './data'
import { CHI_NHANH, HOM_NAY, KHACH, KHO, NCC, NHAN_VIEN } from '../../data/mock'
import { dmy } from '../../ui/format'
import { NGANH_NGHE_CON, timNganhNghe } from './nganh-nghe'
import { KhoiQuyDoi } from './QuyDoiDvt'

import { createElement, type ReactNode } from 'react'
import type { Col, Row } from '../types'
import type { Goi } from '../../app/plan'
import type { CheDo } from '../../app/che-do'

export type KieuTruong = 'chu' | 'so' | 'tien' | 'chon' | 'chonNhieu' | 'chonTim' | 'tich' | 'ngay' | 'khoangNgay' | 'nhieuDong'   // chonNhieu: chọn nhiều, lưu dạng "A, B", chọn đủ lưu "Tất cả" (T144); chonTim: chọn một có ô tìm, dòng hiện tên và mã (T151); khoangNgay: lưu "dd/mm/yyyy - dd/mm/yyyy" (T154)

/** Đơn vị tính hiện mã và tên trong ô chọn, vd "KG - kg"; giá trị lưu vẫn là tên (T144) */
const nhanDvt = (ten: string) => { const d = DON_VI_TINH.find(x => x[1] === ten); return d ? `${d[0]} - ${d[1]}` : ten }

/** Mã nhà cung cấp, thương hiệu, chi nhánh theo tên cho dòng "Mã: X" của ô chọn (T154) */
const maNcc = (ten: string) => NCC.find(n => n.ten === ten)?.ma ?? ''
const maThuongHieu = (ten: string) => DS_THUONG_HIEU.find(t => t.ten === ten)?.ma ?? ''
const maChiNhanh = (ten: string) => CHI_NHANH.find(c => c.ten === ten)?.id.toUpperCase() ?? ''
const TEN_HANG = DS_HANG_HOA_12.map(h => h.ten)

/** T181: danh sách mã và nhãn hiển thị "<mã> - <tên>" cho phương thức thanh toán */
const MA_DOI_TUONG = [...KHACH.map(k => k.ma), ...NCC.map(n => n.ma), ...NHAN_VIEN.map(nv => nv.ma)]
const nhanDoiTuong = (ma: string) => {
  const d = [...KHACH, ...NCC, ...NHAN_VIEN].find(x => x.ma === ma || `${x.ma} - ${x.ten}` === ma)
  return d ? `${d.ma} - ${d.ten}` : ma
}
const MA_CONG_VIEC_17 = DS_CONG_VIEC_17.map(c => c.ma)
const nhanCongViec = (ma: string) => {
  const c = DS_CONG_VIEC_17.find(x => x.ma === ma || `${x.ma} - ${x.ten}` === ma)
  return c ? `${c.ma} - ${c.ten}` : ma
}
const MA_MUC_CHI_PHI = DS_MUC_CHI_PHI_16.map(m => m.ma)
const nhanMucCp = (ma: string) => {
  const m = DS_MUC_CHI_PHI_16.find(x => x.ma === ma || `${x.ma} - ${x.ten}` === ma)
  return m ? `${m.ma} - ${m.ten}` : ma
}
const MA_QUY_TIEN_112 = DS_QUY_TIEN_112.map(q => q.ma)
const nhanQuyTien = (ma: string) => {
  const q = DS_QUY_TIEN_112.find(x => x.ma === ma || `${x.ma} - ${x.ten}` === ma)
  return q ? `${q.ma} - ${q.ten}` : ma
}

/** Ngành nghề con trong ô chọn: lưu mã, hiện tên (T151) */
const MA_NGANH_NGHE = NGANH_NGHE_CON.map(n => n.ma)
const tenNganhNghe = (ma: string) => NGANH_NGHE_CON.find(n => n.ma === ma)?.ten.replace(/\s*\n\s*/g, ' ') ?? ma
/** Tỷ lệ % kiểu Việt trong ô nhập: 1,5 */
const soPhay = (n: number) => String(n).replace('.', ',')
/** Chọn ngành nghề con thì tự điền nhóm ngành nghề và 2 tỷ lệ mẫu; tỷ lệ vẫn sửa được (T151) */
const dienNganhNghe = (ma: string) => {
  const n = timNganhNghe(ma)
  return { nhomNganh: n?.tenNhom ?? '', thueGtgt: n ? soPhay(n.gtgt) : '', thueTn: n ? soPhay(n.tncn) : '' }
}
/** Thông tư tính thuế hộ kinh doanh theo tỷ lệ % trên doanh thu ngành nghề */
const THEO_NGANH_NGHE: CheDo[] = ['TT152', 'TT58']
/** Ô Theo dõi tồn kho đang tích: chưa đặt cũng hiểu là tích, như ô tích của form */
const coTonKho = (v: Record<string, any>) => v.tonKho !== 0 && v.tonKho !== false && v.tonKho !== '0'

/** 5 loại hàng hoá theo iPOS Inventory; gói Pro có thêm Bán thành phẩm (T144) */
const LOAI_HANG = ['Nguyên vật liệu', 'Thành phẩm', 'Hàng bán thẳng', 'Khác (Công cụ dụng cụ)', 'Ghi chú']
const LOAI_HANG_PRO = ['Nguyên vật liệu', 'Thành phẩm', 'Hàng bán thẳng', 'Bán thành phẩm', 'Khác (Công cụ dụng cụ)', 'Ghi chú']

export interface TruongDM {
  k: string
  nhan: string
  kieu: KieuTruong
  batBuoc?: boolean
  caHang?: boolean
  ds?: string[]
  cot?: string
  hien?: (v: Record<string, any>) => boolean   // chỉ hiện ô khi điều kiện đúng theo giá trị form
  goi?: Goi[]                                  // chỉ hiện ô ở các gói này (T144)
  cheDo?: CheDo[]                              // chỉ hiện ô ở các chế độ/thông tư này (T147)
  nhanDs?: (v: string) => string               // nhãn hiện trong ô chọn khác giá trị lưu, vd đơn vị tính hiện mã và tên (T144)
  chiDoc?: boolean | ((v: Record<string, any>) => boolean)   // ô tự sinh, không sửa được; hàm: chỉ đọc theo giá trị form, vd khi sửa thẻ có sẵn (T165)
  goiY?: string                                // chữ mờ khi ô chọn nhiều để trống (T151)
  maDs?: (v: string) => string                 // mã của mục trong ô chọn nhiều, ô chọn có tìm: dòng hiện "Mã: X", ô hiện "Tên (MÃ)" (T154)
  // Ô ngày khi thêm mới so với ngày đầu năm của đơn vị: 'tu' phải từ ngày đầu năm trở đi, 'truoc' phải trước ngày đầu năm (khai số dư)
  dauNam?: (v: Record<string, any>) => 'tu' | 'truoc' | undefined
}

export interface KhoiDM {
  ten: string
  goi?: Goi[]   // chỉ hiện khối ở các gói này (T144)
  cheDo?: CheDo[]   // chỉ hiện khối ở các chế độ/thông tư này (T147)
  truong: TruongDM[]
  // khối dạng lưới tự tính từ giá trị form; doi ghi giá trị khi gõ trong lưới; goi: gói đang dùng (T159)
  bang?: (v: Record<string, any>, doi: (k: string, val: unknown) => void, goi: Goi) => { cols: Col[]; rows: Row[]; sum?: Row; rowCls?: (r: Row) => string; chan?: ReactNode; trong: string }
  ve?: (v: Record<string, any>, doi: (k: string, val: unknown) => void) => ReactNode   // khối vẽ riêng (vd Thông tin mua: ô nhập, hoặc chỉ xem khi lấy từ phiếu gốc)
  anDau?: boolean    // không vẽ thanh tiêu đề khối, khối luôn mở, nhường chỗ cho lưới bên dưới (T165)
  congTac?: string   // khoá ô tích hiện thành công tắc ở đầu khối, vd '_tt' trạng thái (T154)
}

export interface CauHinhDM {
  khoi: KhoiDM[]
  ten?: string                                       // tên trên đầu panel: "Thêm <ten>", "Sửa <ten>"
  moTa?: string                                      // dòng phụ dưới tên khi thêm mới
  soQuocTe?: boolean                                 // ô số, ô tiền theo kiểu quốc tế: 1,234,567.89
  toanMan?: { icon: string }                         // mở toàn màn hình như form chứng từ, khối lưới thành tab cạnh tab Lịch sử
  haiCot?: boolean                                   // lưới ô nhập luôn 2 cột như form iFaster (T154)
  // Nhiều kiểu thêm mới trên cùng màn, mỗi kiểu một nút; kiểu lưu ở form._kieu, mở thẳng bằng ?moi=<k>
  bien?: { k: string; ten: string; nut: string; icon?: string; goi?: Goi[] }[]   // goi: chỉ hiện ở các gói này
  moi?: (rows: Row[], ctx: { kieu?: string; ngayDauNam: string }) => Record<string, any>   // giá trị sẵn khi thêm mới theo kiểu thêm mới, ngày đầu năm của đơn vị
  doi?: (k: string, v: Record<string, any>, rows: Row[]) => Record<string, any>   // ô tự tính khi ô k đổi
  goiHoiDoi?: Goi[]   // chỉ hỏi hoiDoi ở các gói này (T144: nhóm hàng hoá gói Free, Standard không có ngầm định)
  hoiDoi?: (k: string, v: Record<string, any>, rows: Row[]) => { tieuDe: string; hoi: string; sua: Record<string, any>; dien?: Record<string, any> } | null   // hỏi khi đổi ô (T136)
  loi?: (v: Record<string, any>) => string | null   // lỗi chặn lưu, báo bằng thông báo
  kiemLuu?: (v: Record<string, any>) => { tieuDe: string; hoi: string; sua: Record<string, any> } | null   // lỗi cần hỏi trước khi lưu; đồng ý thì áp sua rồi lưu
}

export const TRUONG_DM: Record<string, CauHinhDM> = {
  // 1.2 Hàng hoá (DM_ITEM, DM_ITEM_CLASS)
  '1.2': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã hàng hoá', kieu: 'chu', batBuoc: true, cot: 'ITEM_ID' },
          { k: 'ten', nhan: 'Tên hàng hoá', kieu: 'chu', batBuoc: true, caHang: true, cot: 'ITEM_NAME' },
          { k: 'nhom', nhan: 'Nhóm hàng hoá', kieu: 'chon', ds: TEN_NHOM_HANG, cot: 'ITEM_CLASS_ID' },
          // loại hàng hoá theo iPOS Inventory; Bán thành phẩm chỉ gói Pro (PhuongXT 11/10/2026, T144)
          { k: 'loai', nhan: 'Loại hàng hoá', kieu: 'chon', ds: LOAI_HANG, goi: ['F', 'S', 'PL'], cot: 'ITEM_TYPE_ID' },
          { k: 'loai', nhan: 'Loại hàng hoá', kieu: 'chon', ds: LOAI_HANG_PRO, goi: ['PR'], cot: 'ITEM_TYPE_ID' },
          { k: 'dvt', nhan: 'Đơn vị tính', kieu: 'chon', ds: TEN_DVT, nhanDs: nhanDvt, cot: 'UNIT_ID' },
          { k: 'dvtPhu', nhan: 'ĐVT phụ', kieu: 'chon', ds: TEN_DVT, nhanDs: nhanDvt, goi: ['S', 'PL', 'PR'], cot: 'UNIT_ID_EXTRA' },   // gói Free không có quy đổi ĐVT nên bỏ (T144)
          { k: 'barcode', nhan: 'Mã vạch', kieu: 'chu', cot: 'BARCODE' },
          { k: 'thuongHieu', nhan: 'Thương hiệu', kieu: 'chon', ds: TEN_THUONG_HIEU },   // thương hiệu FABi (T151)
        ],
      },
      {
        ten: 'Giá và thuế',
        truong: [
          { k: 'giaMua', nhan: 'Giá mua', kieu: 'tien', cot: 'PURCHASE_PRICE' },
          { k: 'gia', nhan: 'Giá bán', kieu: 'tien', cot: 'SALE_PRICE' },
          { k: 'ts', nhan: 'Thuế suất GTGT (%)', kieu: 'chon', ds: ['KCT', '0', '5', '8', '10'], cot: 'VAT_TAX_ID', cheDo: ['TT133', 'TT99'] },   // TT152, TT58 tính theo ngành nghề (T151)
        ],
      },
      {
        // Hộ kinh doanh nộp thuế theo tỷ lệ % trên doanh thu của ngành nghề (T151)
        ten: 'Thông tin thuế',
        cheDo: THEO_NGANH_NGHE,
        truong: [
          { k: 'nganhNghe', nhan: 'Nhóm ngành nghề con', kieu: 'chonTim', batBuoc: true, caHang: true, ds: MA_NGANH_NGHE, nhanDs: tenNganhNghe },
          { k: 'nhomNganh', nhan: 'Nhóm ngành nghề', kieu: 'chu', chiDoc: true, caHang: true },
          // T154: 2 tỷ lệ chỉ đọc, tự điền theo ngành nghề con; chưa chọn ngành nghề thì trống
          { k: 'thueGtgt', nhan: 'Thuế GTGT (%)', kieu: 'so', chiDoc: true },
          { k: 'thueTn', nhan: 'Thuế TNCN (%)', kieu: 'so', chiDoc: true, cheDo: ['TT152'] },
          { k: 'thueTn', nhan: 'Thuế TNDN (%)', kieu: 'so', chiDoc: true, cheDo: ['TT58'] },
        ],
      },
      {
        ten: 'Hạch toán',
        goi: ['S', 'PL', 'PR'],   // gói Free tạm bỏ (T144)
        truong: [
          { k: 'tkKho', nhan: 'TK kho', kieu: 'chon', cot: 'ACCOUNT_ID_COST', cheDo: ['TT133', 'TT99'] },
          { k: 'tkDt', nhan: 'TK doanh thu', kieu: 'chon', cot: 'ACCOUNT_ID_INCOME', cheDo: ['TT133', 'TT99'] },
          { k: 'tkGv', nhan: 'TK giá vốn', kieu: 'chon', cot: 'ACCOUNT_ID_SALE_COST', cheDo: ['TT133', 'TT99'] },
          { k: 'tkCp', nhan: 'TK chi phí', kieu: 'chon', cot: 'DEFAULT_ACCOUNT_ID_EXPENSE', cheDo: ['TT133', 'TT99'] },
          { k: 'tkTraLai', nhan: 'TK hàng bán trả lại', kieu: 'chon', cot: 'ACCOUNT_ID_RETURN', cheDo: ['TT133', 'TT99'] },
          { k: 'mucCp', nhan: 'Mục chi phí', kieu: 'chon', ds: TEN_MUC_CHI_PHI },
          { k: 'ppGia', nhan: 'Phương pháp tính giá', kieu: 'chon', ds: ['Bình quân cuối kỳ', 'Bình quân tức thời', 'Nhập trước xuất trước', 'Đích danh'] },
        ],
      },
      {
        ten: 'Tồn kho',
        truong: [
          { k: 'tonKho', nhan: 'Theo dõi tồn kho', kieu: 'tich', cot: 'IS_INVENTORY' },   // tích thì nhập, xuất, tồn theo mặt hàng; món chế biến bỏ tích (T114)
          { k: 'khoMacDinh', nhan: 'Kho mặc định', kieu: 'chon', ds: ['Kho tổng', 'Kho bếp Lê Lợi', 'Kho bar Lê Lợi', 'Kho bếp Thảo Điền', 'Kho bar Thảo Điền'], cot: 'DEFAULT_WAREHOUSE_ID' },
          { k: 'tonToiThieu', nhan: 'Tồn tối thiểu', kieu: 'so', cot: 'MIN_QUANTITY' },
          { k: 'tonToiDa', nhan: 'Tồn tối đa', kieu: 'so', cot: 'MAX_QUANTITY' },
          { k: 'khoTheoDoi', nhan: 'Kho theo dõi', kieu: 'chonNhieu', ds: KHO, maDs: maKho, caHang: true, hien: coTonKho, goiY: 'Để trống nếu hàng hoá theo dõi tồn tại mọi kho' },   // T151
        ],
      },
      {
        ten: 'Nhà cung cấp',
        truong: [
          { k: 'ncc', nhan: 'Nhà cung cấp', kieu: 'chonNhieu', ds: NCC.map(n => n.ten), maDs: maNcc, caHang: true, goiY: 'Để trống nếu hàng hoá này được tất cả nhà cung cấp đáp ứng' },   // T151
        ],
      },
      {
        // Bảng quy đổi trong form; gói Free không có quy đổi ĐVT, như ô ĐVT phụ (T151)
        ten: 'Quy đổi đơn vị tính',
        goi: ['S', 'PL', 'PR'],
        truong: [],
        ve: (v, doi) => createElement(KhoiQuyDoi, { v, doi }),
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
    doi: (k, v) => {
      if (k === 'nganhNghe') return dienNganhNghe(String(v.nganhNghe ?? ''))
      // T151: TT152, TT58 chỉ đi với gói Free, Standard nên không qua hoiDoi (gói Plus, Pro). Chọn nhóm thì điền ngành nghề
      // của nhóm khi ô ngành nghề đang trống, đã có giá trị thì giữ nguyên. Ô ẩn ở TT133, TT99 nên điền ở mọi thông tư
      const nn = k === 'nhom' && !v.nganhNghe ? NHOM_HANG.find(n => n.ten === v.nhom)?.nganhNghe : undefined
      return nn ? { nganhNghe: nn, ...dienNganhNghe(nn) } : {}
    },
    goiHoiDoi: ['PL', 'PR'],   // nhóm hàng hoá gói Free, Standard không có ngầm định nên không hỏi áp (T144)
    hoiDoi: (k, v) => {
      if (k !== 'nhom' || !v.nhom) return null
      const nhomMoi = NHOM_HANG.find(n => n.ten === v.nhom)
      if (!nhomMoi) return null

      const O_NGAM_DINH: (keyof typeof nhomMoi)[] = [
        'tkKho', 'tkDt', 'tkGv', 'tkCp', 'tkTraLai', 'mucCp', 'ppGia', 'ts',   // T154: nhóm không còn loại hàng, tồn kho, kho mặc định
      ]
      const TEN_O: Record<string, string> = {
        tkKho: 'TK kho',
        tkDt: 'TK doanh thu',
        tkGv: 'TK giá vốn',
        tkCp: 'TK chi phí',
        tkTraLai: 'TK hàng bán trả lại',
        mucCp: 'Mục chi phí',
        ppGia: 'Phương pháp tính giá',
        ts: 'Thuế suất GTGT',
      }

      const dien: Record<string, any> = {}
      const sua: Record<string, any> = {}
      const tenDoi: string[] = []

      for (const f of O_NGAM_DINH) {
        const valNhom = nhomMoi[f]
        if (valNhom === undefined) continue
        const valForm = v[f]
        const laRong = valForm === undefined || valForm === null || valForm === ''

        if (laRong) {
          dien[f] = valNhom
        } else {
          const khac = String(valForm) !== String(valNhom)
          if (khac) {
            sua[f] = valNhom
            tenDoi.push(TEN_O[f] ?? f)
          }
        }
      }

      if (Object.keys(sua).length === 0) {
        return { tieuDe: '', hoi: '', sua: {}, dien }
      }

      return {
        tieuDe: `Áp thông tin ngầm định của nhóm ${v.nhom}?`,
        hoi: `Các ô sẽ đổi: ${tenDoi.join(', ')}`,
        sua,
        dien,
      }
    },
  },

  // 1.3 Đơn vị tính (DM_UNIT)
  '1.3': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã đơn vị tính', kieu: 'chu', batBuoc: true, cot: 'UNIT_ID' },
          { k: 'ten', nhan: 'Tên đơn vị tính', kieu: 'chu', batBuoc: true, cot: 'UNIT_NAME' },
          { k: 'mota', nhan: 'Mô tả / Diễn giải', kieu: 'chu', caHang: true, cot: 'DESCRIPTION' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // 1.4 Quy đổi ĐVT (chưa có bảng DM_ trong schema, chờ đối chiếu). Form theo iFaster: 1 Từ ĐVT = tỷ lệ Đến ĐVT, trạng thái là công tắc (T154)
  '1.4': {
    haiCot: true,
    khoi: [
      {
        ten: 'Thông tin chung',
        congTac: '_tt',
        truong: [
          { k: 'tu', nhan: 'Từ đơn vị tính', kieu: 'chonTim', batBuoc: true, ds: TEN_DVT, maDs: maDvt },
          { k: 'den', nhan: 'Đến đơn vị tính', kieu: 'chonTim', batBuoc: true, ds: TEN_DVT, maDs: maDvt },
          { k: 'tl', nhan: 'Tỷ lệ quy đổi', kieu: 'so', batBuoc: true },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', chiDoc: true },
          { k: 'hangAd', nhan: 'Hàng hoá áp dụng', kieu: 'chonNhieu', ds: TEN_HANG, maDs: maHang, caHang: true, goiY: 'Để trống nếu áp dụng cho mọi hàng hoá' },
          { k: 'moTa', nhan: 'Mô tả', kieu: 'nhieuDong' },
        ],
      },
    ],
    doi: (k, v) => k === 'tu' || k === 'den' || k === 'tl' ? { dienGiai: dienGiaiQd(v.tu, v.den, v.tl) } : {},
    loi: v => v.tu && v.tu === v.den ? 'Đến đơn vị tính phải khác từ đơn vị tính' : null,
  },

  // 1.5 Đối tượng (DM_PR_DETAIL)
  '1.5': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã đối tượng', kieu: 'chu', batBuoc: true, cot: 'PR_DETAIL_ID' },
          { k: 'ten', nhan: 'Tên đối tượng', kieu: 'chu', batBuoc: true, caHang: true, cot: 'PR_DETAIL_NAME' },
          { k: 'loai', nhan: 'Loại đối tượng', kieu: 'chon', ds: ['Khách hàng', 'Nhà cung cấp', 'Nhân viên'], batBuoc: true, cot: 'PR_DETAIL_TYPE_ID' },
          { k: 'nhom', nhan: 'Nhóm đối tượng', kieu: 'chon', ds: TEN_NHOM_DOI_TUONG, cot: 'PR_DETAIL_CLASS_ID' },
          { k: 'mst', nhan: 'Mã số thuế', kieu: 'chu', cot: 'TAX_FILE_NUMBER' },
        ],
      },
      {
        ten: 'Liên hệ',
        truong: [
          { k: 'diaChi', nhan: 'Địa chỉ', kieu: 'chu', caHang: true, cot: 'ADDRESS' },
          { k: 'tinhThanh', nhan: 'Tỉnh / Thành phố', kieu: 'chu', cot: 'PROVINCE_ID' },
          { k: 'dienThoai', nhan: 'Điện thoại', kieu: 'chu', cot: 'PHONE' },
          { k: 'fax', nhan: 'Fax', kieu: 'chu', cot: 'FAX' },
          { k: 'email', nhan: 'Email', kieu: 'chu', cot: 'EMAIL' },
        ],
      },
      {
        ten: 'Ngân hàng',
        truong: [
          { k: 'nganHang', nhan: 'Ngân hàng', kieu: 'chu', cot: 'BANK_NAME' },
          { k: 'chiNhanhNh', nhan: 'Chi nhánh ngân hàng', kieu: 'chu', cot: 'BANK_BRANCH' },
          { k: 'soTkNh', nhan: 'Số tài khoản ngân hàng', kieu: 'chu', cot: 'BANK_ACCOUNT' },
          { k: 'chuTk', nhan: 'Chủ tài khoản', kieu: 'chu', cot: 'BANK_ACCOUNT_HOLDER' },
          { k: 'soThe', nhan: 'Số thẻ', kieu: 'chu', cot: 'BANK_CARD_NO', goi: ['PL', 'PR'] },   // gói Free, Standard ẩn (T180)
        ],
      },
      {
        ten: 'Công nợ',
        goi: ['PL', 'PR'],   // gói Free, Standard ẩn (T180)
        truong: [
          { k: 'tkCn', nhan: 'TK công nợ', kieu: 'chon', cot: 'PR_ACCOUNT_ID', cheDo: ['TT133', 'TT99'] },   // TK chỉ dùng ở TT133, TT99 (T147)
          { k: 'bangGia', nhan: 'Bảng giá', kieu: 'chu', cot: 'PRICE_LEVEL_ID' },
          { k: 'dktt', nhan: 'Điều khoản thanh toán', kieu: 'chu', caHang: true, cot: 'PAYMENT_TERM_ID' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
          { k: 'dongY', nhan: 'Đã đồng ý chia sẻ thông tin cá nhân', kieu: 'tich', batBuoc: true, caHang: true },
        ],
      },
    ],
    moi: () => ({ dongY: false }),
  },

  // 1.6 Mục chi phí (DM_EXPENSE)
  '1.6': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã mục chi phí', kieu: 'chu', batBuoc: true, cot: 'EXPENSE_ID' },
          { k: 'ten', nhan: 'Tên mục chi phí', kieu: 'chu', batBuoc: true, caHang: true, cot: 'EXPENSE_NAME' },
          { k: 'nhom', nhan: 'Nhóm chi phí', kieu: 'chon', ds: TEN_NHOM_MUC_CP, cot: 'EXPENSE_CLASS_ID' },
          { k: 'congViec', nhan: 'Công việc liên quan', kieu: 'chu', cot: 'JOB_ID' },
        ],
      },
      {
        ten: 'Hạch toán',
        cheDo: ['TT133', 'TT99'],
        truong: [
          { k: 'tk', nhan: 'TK chi phí ngầm định', kieu: 'chon', cot: 'DEFAULT_ACCOUNT_ID_EXPENSE' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // 1.7 Công việc (DM_JOB): chỉ mã, tên, mô tả, trạng thái (T154)
  '1.7': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã công việc', kieu: 'chu', batBuoc: true, cot: 'JOB_ID' },
          { k: 'ten', nhan: 'Tên công việc', kieu: 'chu', batBuoc: true, caHang: true, cot: 'JOB_NAME' },
          { k: 'moTa', nhan: 'Mô tả', kieu: 'nhieuDong' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // 1.8 Kho (DM_WAREHOUSE)
  '1.8': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã kho', kieu: 'chu', batBuoc: true, cot: 'WAREHOUSE_ID' },
          { k: 'ten', nhan: 'Tên kho', kieu: 'chu', batBuoc: true, caHang: true, cot: 'WAREHOUSE_NAME' },
          { k: 'cn', nhan: 'Chi nhánh trực thuộc', kieu: 'chon', ds: ['Lê Lợi', 'Thảo Điền', 'Phan Xích Long', 'Văn phòng'], cot: 'ORGANIZATION_ID' },
          { k: 'loai', nhan: 'Nhóm kho', kieu: 'chon', ds: TEN_NHOM_KHO, cot: 'WAREHOUSE_CLASS_ID', goi: ['S', 'PL', 'PR'] },   // gói Free không có nhóm kho (T143)
          { k: 'tk', nhan: 'Thủ kho', kieu: 'chu', cot: 'KEEPER' },
          { k: 'thuongHieu', nhan: 'Thương hiệu', kieu: 'chonNhieu', ds: TEN_THUONG_HIEU, maDs: maThuongHieu, caHang: true, goiY: 'Để trống nếu kho dùng cho mọi thương hiệu' },   // T151
        ],
      },
      {
        ten: 'Hạch toán',
        cheDo: ['TT133', 'TT99'],   // thông tư không ghi Nợ/Có thì ẩn (T147)
        truong: [
          { k: 'tkKho', nhan: 'TK kho ngầm định', kieu: 'chon', cot: 'COST_ACCOUNT_ID' },
          { k: 'tkGv', nhan: 'TK giá vốn ngầm định', kieu: 'chon', cot: 'SALE_COST_ACCOUNT_ID' },
          { k: 'tkCp', nhan: 'TK chi phí ngầm định', kieu: 'chon', cot: 'EXPENSE_ACCOUNT_ID' },
        ],
      },
      {
        ten: 'Ngầm định',
        goi: ['PL', 'PR'],   // gói Free, Standard ẩn (T144)
        truong: [
          { k: 'mucCp', nhan: 'Mục chi phí ngầm định', kieu: 'chon', ds: TEN_MUC_CHI_PHI },
          { k: 'congViec', nhan: 'Công việc ngầm định', kieu: 'chon', ds: TEN_CONG_VIEC_17 },
        ],
      },
      {
        ten: 'Liên hệ',
        truong: [
          { k: 'diaChi', nhan: 'Địa chỉ', kieu: 'chu', caHang: true },
          { k: 'dienThoai', nhan: 'Số điện thoại', kieu: 'chu' },
          { k: 'nguoiLienHe', nhan: 'Người liên hệ', kieu: 'chu' },
          { k: 'ghiChu', nhan: 'Ghi chú', kieu: 'nhieuDong', caHang: true },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // Chi nhánh (DM_ORGANIZATION)
  'chi-nhanh': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã chi nhánh', kieu: 'chu', batBuoc: true, cot: 'ORGANIZATION_ID' },
          { k: 'ten', nhan: 'Tên chi nhánh', kieu: 'chu', batBuoc: true, caHang: true, cot: 'ORGANIZATION_NAME' },
          { k: 'mst', nhan: 'Mã số thuế', kieu: 'chu', cot: 'TAX_FILE_NUMBER' },
          { k: 'kho', nhan: 'Kho trực thuộc', kieu: 'chu', caHang: true, cot: 'WAREHOUSE_LIST' },
        ],
      },
      {
        ten: 'Liên hệ',
        truong: [
          { k: 'diaChi', nhan: 'Địa chỉ', kieu: 'chu', caHang: true, cot: 'ADDRESS' },
          { k: 'quanHuyen', nhan: 'Quận / Huyện', kieu: 'chu', cot: 'DISTRICT' },
          { k: 'tinhThanh', nhan: 'Tỉnh / Thành phố', kieu: 'chu', cot: 'CITY' },
          { k: 'dienThoai', nhan: 'Điện thoại', kieu: 'chu', cot: 'PHONE' },
          { k: 'email', nhan: 'Email', kieu: 'chu', cot: 'EMAIL' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // 1.9 Tiền tệ (DM_CURRENCY)
  '1.9': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã tiền tệ', kieu: 'chu', batBuoc: true, cot: 'CURRENCY_ID' },
          { k: 'ten', nhan: 'Tên tiền tệ', kieu: 'chu', batBuoc: true, cot: 'CURRENCY_NAME' },
          { k: 'kh', nhan: 'Ký hiệu', kieu: 'chu', cot: 'CURRENCY_SYMBOL' },
          { k: 'le', nhan: 'Số chữ số lẻ', kieu: 'so', cot: 'DECIMAL_PLACES' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // 1.10 Tỷ giá (DM_EXCHANGE_RATE)
  '1.10': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ngay', nhan: 'Ngày áp dụng', kieu: 'ngay', batBuoc: true, cot: 'VALID_DATE' },
          { k: 'tt', nhan: 'Loại tiền tệ', kieu: 'chon', ds: ['USD', 'EUR', 'JPY', 'GBP'], batBuoc: true, cot: 'CURRENCY_ID' },
          { k: 'mua', nhan: 'Tỷ giá mua', kieu: 'tien', batBuoc: true, cot: 'BUY_RATE' },
          { k: 'ban', nhan: 'Tỷ giá bán', kieu: 'tien', batBuoc: true, cot: 'EXCHANGE_RATE' },
          { k: 'nguon', nhan: 'Nguồn tỷ giá', kieu: 'chu', caHang: true, cot: 'SOURCE' },
        ],
      },
    ],
  },

  // 1.11 Loại thuế (DM_VAT_TAX)
  '1.11': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã loại thuế', kieu: 'chu', batBuoc: true, cot: 'VAT_TAX_ID' },
          { k: 'ten', nhan: 'Tên loại thuế', kieu: 'chu', batBuoc: true, caHang: true, cot: 'VAT_TAX_NAME' },
          { k: 'ts', nhan: 'Thuế suất (%)', kieu: 'chu', cot: 'VAT_TAX_RATE' },
          { k: 'gc', nhan: 'Áp dụng cho', kieu: 'chu', caHang: true, cot: 'DESCRIPTION' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // 1.12 Quỹ tiền (chưa có bảng DM_ trong schema, chờ đối chiếu)
  '1.12': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã quỹ', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên quỹ', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'loai', nhan: 'Loại quỹ', kieu: 'chon', ds: ['Tiền mặt', 'Ngân hàng'], batBuoc: true },
          { k: 'stk', nhan: 'Số tài khoản / Ngân hàng', kieu: 'chu', hien: v => v.loai !== 'Tiền mặt' },   // quỹ tiền mặt không có số tài khoản (T144)
          { k: 'cn', nhan: 'Chi nhánh áp dụng', kieu: 'chonNhieu', ds: CHI_NHANH.map(c => c.ten), maDs: maChiNhanh },   // một quỹ dùng cho nhiều chi nhánh (T144)
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },

  // 1.13 Tài sản (ASSET)
  '1.13': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã tài sản', kieu: 'chu', batBuoc: true, cot: 'ASSET_ID' },
          { k: 'soTheTs', nhan: 'Số thẻ tài sản', kieu: 'chu', cot: 'ASSET_NO' },
          { k: 'ten', nhan: 'Tên tài sản', kieu: 'chu', batBuoc: true, caHang: true, cot: 'DESCRIPTION' },
          { k: 'loai', nhan: 'Loại tài sản', kieu: 'chon', ds: ['Máy móc thiết bị', 'Phương tiện vận tải', 'Nhà cửa vật kiến trúc', 'Thiết bị truyền dẫn', 'Tài sản vô hình'], cot: 'FA_CLASS_ID' },
          { k: 'dvt', nhan: 'Đơn vị tính', kieu: 'chon', ds: TEN_DVT, cot: 'UNIT' },
          { k: 'soLuong', nhan: 'Số lượng', kieu: 'so', cot: 'QUANTITY' },
          { k: 'nuocSx', nhan: 'Nước sản xuất', kieu: 'chu', cot: 'MANU_COUNTRY' },
          { k: 'namSx', nhan: 'Năm sản xuất', kieu: 'chu', cot: 'MANU_YEAR' },
        ],
      },
      {
        ten: 'Nguyên giá và khấu hao',
        truong: [
          { k: 'ngay', nhan: 'Ngày ghi tăng', kieu: 'ngay', cot: 'USE_DATE' },
          { k: 'ngayMua', nhan: 'Ngày mua', kieu: 'ngay', cot: 'PURCHASE_DATE' },
          { k: 'ng', nhan: 'Nguyên giá', kieu: 'tien', batBuoc: true, cot: 'ORIG_TRAN_ID' },
          { k: 'ppKh', nhan: 'Phương pháp khấu hao', kieu: 'chon', ds: ['Đường thẳng', 'Số dư giảm dần có điều chỉnh', 'Theo sản lượng'], cot: 'DEP_METHOD_ID' },
          { k: 'kh', nhan: 'Số tháng khấu hao', kieu: 'so', batBuoc: true, cot: 'DEP_LENGTH' },
        ],
      },
      {
        ten: 'Bộ phận sử dụng',
        truong: [
          { k: 'bpSuDung', nhan: 'Bộ phận / Chi nhánh', kieu: 'chon', ds: ['Bếp Lê Lợi', 'Bar Lê Lợi', 'Bếp Thảo Điền', 'Văn phòng', 'Kho tổng'], cot: 'ORGANIZATION_ID' },
          { k: 'nguoiSuDung', nhan: 'Người sử dụng', kieu: 'chu', cot: 'PR_DETAIL_ID' },
        ],
      },
      {
        ten: 'Tài khoản hạch toán',
        cheDo: ['TT133', 'TT99'],
        truong: [
          { k: 'tkTs', nhan: 'TK tài sản', kieu: 'chon', cot: 'FA_ACCOUNT_ID' },
          { k: 'tkHm', nhan: 'TK hao mòn', kieu: 'chon', cot: 'DEP_ACCOUNT_ID' },
          { k: 'tkCp', nhan: 'TK chi phí khấu hao', kieu: 'chon', cot: 'EXPENSE_ACCOUNT_ID' },
          { k: 'kmcp', nhan: 'Khoản mục chi phí', kieu: 'chu', cot: 'EXPENSE_ID' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
  },

  // 1.14 Bảng giá (chưa có bảng DM_ trong schema, chờ đối chiếu). Form theo iFaster; nhà cung cấp chỉ có ở giá nhập (T154)
  '1.14': {
    haiCot: true,
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'loai', nhan: 'Loại giá', kieu: 'chon', ds: ['Giá nhập', 'Giá bán'], batBuoc: true, caHang: true },
          { k: 'ten', nhan: 'Hàng hoá', kieu: 'chonTim', batBuoc: true, caHang: true, ds: TEN_HANG, maDs: maHang },
          { k: 'dvt', nhan: 'Đơn vị tính', kieu: 'chon', ds: TEN_DVT, nhanDs: nhanDvt, batBuoc: true },
          { k: 'thoiGian', nhan: 'Thời gian áp dụng', kieu: 'khoangNgay', batBuoc: true },
          { k: 'gia', nhan: 'Đơn giá', kieu: 'tien', batBuoc: true },
          { k: 'vat', nhan: 'VAT (%)', kieu: 'so' },
          { k: 'ncc', nhan: 'Nhà cung cấp', kieu: 'chonTim', batBuoc: true, caHang: true, ds: NCC.map(n => n.ten), maDs: maNcc, hien: v => v.loai === 'Giá nhập' },
          { k: 'kho', nhan: 'Kho áp dụng', kieu: 'chonNhieu', ds: KHO, maDs: maKho, caHang: true, goiY: 'Để trống nếu đơn giá áp dụng cho mọi kho' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
    // Mặc định giá nhập, áp dụng một năm từ hôm nay như iFaster
    moi: () => ({ loai: 'Giá nhập', thoiGian: `${dmy(HOM_NAY)} - ${dmy(new Date(HOM_NAY.getFullYear() + 1, HOM_NAY.getMonth(), HOM_NAY.getDate()))}` }),
    // Chọn hàng thì lấy đơn vị tính của hàng
    doi: (k, v) => k === 'ten' ? { dvt: DS_HANG_HOA_12.find(h => h.ten === v.ten)?.dvt ?? v.dvt } : {},
  },

  // 1.15 Bút toán tự động (chưa có bảng DM_ trong schema, chờ đối chiếu)
  '1.15': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã nghiệp vụ', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên nghiệp vụ', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'lct', nhan: 'Loại chứng từ', kieu: 'chon', ds: ['Chứng từ bán hàng FABi', 'Phiếu xuất bán POS', 'Phiếu mua hàng', 'Đối soát sàn'], batBuoc: true },
          { k: 'loc', nhan: 'Điều kiện lọc', kieu: 'chu' },
          { k: 'no', nhan: 'TK Nợ', kieu: 'chon', batBuoc: true },
          { k: 'co', nhan: 'TK Có', kieu: 'chon', batBuoc: true },
          { k: 'tien', nhan: 'Số tiền lấy từ', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },

  // 1.16 Lý do (chưa có bảng DM_ trong schema, chờ đối chiếu)
  '1.16': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã lý do', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Lý do nghiệp vụ', kieu: 'chu', batBuoc: true, caHang: true },
          // cùng chữ với danh sách lý do (LY_DO); gói Free chỉ lý do thu, chi (T144)
          { k: 'dung', nhan: 'Dùng cho nghiệp vụ', kieu: 'chon', ds: ['Thu tiền', 'Chi tiền'], batBuoc: true, goi: ['F'] },
          { k: 'dung', nhan: 'Dùng cho nghiệp vụ', kieu: 'chon', ds: ['Thu tiền', 'Chi tiền', 'Nhập kho', 'Xuất kho'], batBuoc: true, goi: ['S', 'PL', 'PR'] },
          // Lý do chi tiền là chi phí thì báo cáo chi phí lấy lên (T231)
          { k: 'chiPhi', nhan: 'Là chi phí', kieu: 'tich', caHang: true, hien: v => v.dung === 'Chi tiền' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },

  // Nhóm hàng hoá (chưa đối chiếu bảng DM_)
  'nhom-hang-hoa': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã nhóm', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên nhóm', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },   // T154: bỏ loại hàng hoá
          // T151: ngầm định ngành nghề nằm ở Thông tin chung vì TT152, TT58 chỉ có ở gói Free, Standard, không có khối Ngầm định
          { k: 'nganhNghe', nhan: 'Nhóm ngành nghề con', kieu: 'chonTim', caHang: true, ds: MA_NGANH_NGHE, nhanDs: tenNganhNghe, cheDo: THEO_NGANH_NGHE },
        ],
      },
      {
        ten: 'Ngầm định cho hàng hoá',
        goi: ['PL', 'PR'],   // gói Free, Standard ẩn (T144)
        truong: [
          { k: 'tkKho', nhan: 'TK kho', kieu: 'chon', cheDo: ['TT133', 'TT99'] },
          { k: 'tkDt', nhan: 'TK doanh thu', kieu: 'chon', cheDo: ['TT133', 'TT99'] },
          { k: 'tkGv', nhan: 'TK giá vốn', kieu: 'chon', cheDo: ['TT133', 'TT99'] },
          { k: 'tkCp', nhan: 'TK chi phí', kieu: 'chon', cheDo: ['TT133', 'TT99'] },
          { k: 'tkTraLai', nhan: 'TK hàng bán trả lại', kieu: 'chon', cheDo: ['TT133', 'TT99'] },
          { k: 'mucCp', nhan: 'Mục chi phí', kieu: 'chon', ds: TEN_MUC_CHI_PHI },
          { k: 'ppGia', nhan: 'Phương pháp tính giá', kieu: 'chon', ds: ['Bình quân cuối kỳ', 'Bình quân tức thời', 'Nhập trước xuất trước', 'Đích danh'] },
          { k: 'ts', nhan: 'Thuế suất GTGT (%)', kieu: 'chon', ds: ['KCT', '0', '5', '8', '10'], cheDo: ['TT133', 'TT99'] },
          // T154: bỏ theo dõi tồn kho, kho mặc định
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },

  // Nhóm đối tượng (chưa đối chiếu bảng DM_)
  'nhom-doi-tuong': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã nhóm', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên nhóm', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Hạch toán',
        cheDo: ['TT133', 'TT99'],   // thông tư không ghi Nợ/Có thì ẩn (T147)
        truong: [
          { k: 'tkThu', nhan: 'TK phải thu ngầm định', kieu: 'chon' },
          { k: 'tkTra', nhan: 'TK phải trả ngầm định', kieu: 'chon' },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
    moi: () => ({ tkThu: '131', tkTra: '331' }),
  },

  // Nhóm mục chi phí (chưa đối chiếu bảng DM_)
  'nhom-muc-chi-phi': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã nhóm', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên nhóm', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },

  // Nhóm công việc (chưa đối chiếu bảng DM_)
  'nhom-cong-viec': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã nhóm', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên nhóm', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },

  // Nhóm kho (chưa đối chiếu bảng DM_)
  'nhom-kho': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã nhóm', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên nhóm', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },

  // Phương thức thanh toán (chưa đối chiếu bảng DM_)
  'phuong-thuc-thanh-toan': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã phương thức', kieu: 'chu', batBuoc: true },
          { k: 'ten', nhan: 'Tên phương thức', kieu: 'chu', batBuoc: true, caHang: true },
          // gói Free, Standard bỏ: loại chứng từ, hạch toán chỉ dùng cho tự hạch toán theo phương thức ở gói Plus, Pro (T137, T144, T181)
          { k: 'loaiCt', nhan: 'Chứng từ mặc định', kieu: 'chon', ds: DS_CHUNG_TU_TIEN, batBuoc: true, goi: ['PL', 'PR'] },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true, goi: ['PL', 'PR'] },
        ],
      },
      {
        ten: 'Hạch toán ngầm định',
        goi: ['PL', 'PR'],
        truong: [
          { k: 'tkNo', nhan: 'Tài khoản Nợ ngầm định', kieu: 'chon', batBuoc: true, cheDo: ['TT133', 'TT99'] },
          { k: 'doiTuong', nhan: 'Mã đối tượng', kieu: 'chon', ds: MA_DOI_TUONG, nhanDs: nhanDoiTuong },
          { k: 'congViec', nhan: 'Mã công việc', kieu: 'chon', ds: MA_CONG_VIEC_17, nhanDs: nhanCongViec },
          { k: 'mucCp', nhan: 'Mã mục chi phí', kieu: 'chon', ds: MA_MUC_CHI_PHI, nhanDs: nhanMucCp },
          { k: 'quyTien', nhan: 'Mã quỹ tiền', kieu: 'chon', ds: MA_QUY_TIEN_112, nhanDs: nhanQuyTien },
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true },
        ],
      },
    ],
  },
}
