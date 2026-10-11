// Khai báo trường thông tin panel Thêm / Sửa cho các danh mục (T70)
// Lấy theo bảng DM_ tương ứng trong CSDL kế toán iPOS (schema-dm.md)
import { DON_VI_TINH, TEN_DVT, TEN_NHOM_HANG, TEN_NHOM_DOI_TUONG, TEN_NHOM_MUC_CP, TEN_NHOM_CONG_VIEC, TEN_NHOM_KHO, TEN_MUC_CHI_PHI, TEN_CONG_VIEC_17, NHOM_HANG } from './data'
import { KHACH, NCC } from '../../data/mock'

import type { ReactNode } from 'react'
import type { Col, Row } from '../types'
import type { Goi } from '../../app/plan'

export type KieuTruong = 'chu' | 'so' | 'tien' | 'chon' | 'tich' | 'ngay' | 'nhieuDong'

/** Đơn vị tính hiện mã và tên trong ô chọn, vd "KG - kg"; giá trị lưu vẫn là tên (T144) */
const nhanDvt = (ten: string) => { const d = DON_VI_TINH.find(x => x[1] === ten); return d ? `${d[0]} - ${d[1]}` : ten }

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
  nhanDs?: (v: string) => string               // nhãn hiện trong ô chọn khác giá trị lưu, vd đơn vị tính hiện mã và tên (T144)
  chiDoc?: boolean                             // ô tự sinh, không sửa được
  // Ô ngày khi thêm mới so với ngày đầu năm của đơn vị: 'tu' phải từ ngày đầu năm trở đi, 'truoc' phải trước ngày đầu năm (khai số dư)
  dauNam?: (v: Record<string, any>) => 'tu' | 'truoc' | undefined
}

export interface KhoiDM {
  ten: string
  goi?: Goi[]   // chỉ hiện khối ở các gói này (T144)
  truong: TruongDM[]
  // khối dạng lưới tự tính từ giá trị form; doi ghi giá trị khi gõ trong lưới
  bang?: (v: Record<string, any>, doi: (k: string, val: unknown) => void) => { cols: Col[]; rows: Row[]; sum?: Row; rowCls?: (r: Row) => string; chan?: ReactNode; trong: string }
  ve?: (v: Record<string, any>, doi: (k: string, val: unknown) => void) => ReactNode   // khối vẽ riêng (vd Thông tin mua: ô nhập, hoặc chỉ xem khi lấy từ phiếu gốc)
}

export interface CauHinhDM {
  khoi: KhoiDM[]
  ten?: string                                       // tên trên đầu panel: "Thêm <ten>", "Sửa <ten>"
  moTa?: string                                      // dòng phụ dưới tên khi thêm mới
  soQuocTe?: boolean                                 // ô số, ô tiền theo kiểu quốc tế: 1,234,567.89
  toanMan?: { icon: string }                         // mở toàn màn hình như form chứng từ, khối lưới thành tab cạnh tab Lịch sử
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
          { k: 'loai', nhan: 'Loại hàng hoá', kieu: 'chon', ds: ['Hàng hoá', 'Thành phẩm', 'Nguyên vật liệu', 'Công cụ dụng cụ', 'Dịch vụ'], cot: 'ITEM_TYPE_ID' },
          { k: 'dvt', nhan: 'Đơn vị tính', kieu: 'chon', ds: TEN_DVT, nhanDs: nhanDvt, cot: 'UNIT_ID' },
          { k: 'dvtPhu', nhan: 'ĐVT phụ', kieu: 'chon', ds: TEN_DVT, nhanDs: nhanDvt, goi: ['S', 'PL', 'PR'], cot: 'UNIT_ID_EXTRA' },   // gói Free không có quy đổi ĐVT nên bỏ (T144)
          { k: 'barcode', nhan: 'Mã vạch', kieu: 'chu', cot: 'BARCODE' },
        ],
      },
      {
        ten: 'Giá và thuế',
        truong: [
          { k: 'giaMua', nhan: 'Giá mua', kieu: 'tien', cot: 'PURCHASE_PRICE' },
          { k: 'gia', nhan: 'Giá bán', kieu: 'tien', cot: 'SALE_PRICE' },
          { k: 'ts', nhan: 'Thuế suất GTGT (%)', kieu: 'chon', ds: ['KCT', '0', '5', '8', '10'], cot: 'VAT_TAX_ID' },
        ],
      },
      {
        ten: 'Hạch toán',
        goi: ['S', 'PL', 'PR'],   // gói Free tạm bỏ (T144)
        truong: [
          { k: 'tkKho', nhan: 'TK kho', kieu: 'chon', cot: 'ACCOUNT_ID_COST' },
          { k: 'tkDt', nhan: 'TK doanh thu', kieu: 'chon', cot: 'ACCOUNT_ID_INCOME' },
          { k: 'tkGv', nhan: 'TK giá vốn', kieu: 'chon', cot: 'ACCOUNT_ID_SALE_COST' },
          { k: 'tkCp', nhan: 'TK chi phí', kieu: 'chon', cot: 'DEFAULT_ACCOUNT_ID_EXPENSE' },
          { k: 'tkTraLai', nhan: 'TK hàng bán trả lại', kieu: 'chon', cot: 'ACCOUNT_ID_RETURN' },
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
        ],
      },
      {
        ten: 'Trạng thái',
        truong: [
          { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich', caHang: true, cot: 'ACTIVE' },
        ],
      },
    ],
    goiHoiDoi: ['PL', 'PR'],   // nhóm hàng hoá gói Free, Standard không có ngầm định nên không hỏi áp (T144)
    hoiDoi: (k, v) => {
      if (k !== 'nhom' || !v.nhom) return null
      const nhomMoi = NHOM_HANG.find(n => n.ten === v.nhom)
      if (!nhomMoi) return null

      const O_NGAM_DINH: (keyof typeof nhomMoi)[] = [
        'tkKho', 'tkDt', 'tkGv', 'tkCp', 'tkTraLai', 'mucCp', 'ppGia', 'ts', 'loai', 'tonKho', 'khoMacDinh',
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
        loai: 'Loại hàng hoá',
        tonKho: 'Theo dõi tồn kho',
        khoMacDinh: 'Kho mặc định',
      }

      const dien: Record<string, any> = {}
      const sua: Record<string, any> = {}
      const tenDoi: string[] = []

      for (const f of O_NGAM_DINH) {
        let valNhom: any = nhomMoi[f]
        if (valNhom === undefined) continue
        if (f === 'tonKho') valNhom = valNhom ? 1 : 0
        const valForm = v[f]
        const laRong = valForm === undefined || valForm === null || valForm === ''

        if (laRong) {
          dien[f] = valNhom
        } else {
          const khac = f === 'tonKho'
            ? (valForm === 0 || valForm === '0' || valForm === false || valForm === 'false' ? 0 : 1) !== valNhom
            : String(valForm) !== String(valNhom)
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

  // 1.4 Quy đổi ĐVT (chưa có bảng DM_ trong schema, chờ đối chiếu)
  '1.4': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'hang', nhan: 'Hàng hoá', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'goc', nhan: 'ĐVT gốc', kieu: 'chon', ds: TEN_DVT },
          { k: 'qd', nhan: 'ĐVT quy đổi', kieu: 'chon', ds: TEN_DVT },
          { k: 'tl', nhan: 'Tỷ lệ quy đổi', kieu: 'so', batBuoc: true },
          { k: 'dung', nhan: 'Áp dụng khi', kieu: 'chu', caHang: true },
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
          { k: 'soThe', nhan: 'Số thẻ', kieu: 'chu', cot: 'BANK_CARD_NO' },
        ],
      },
      {
        ten: 'Công nợ',
        truong: [
          { k: 'tkCn', nhan: 'TK công nợ', kieu: 'chon', cot: 'PR_ACCOUNT_ID' },
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

  // 1.7 Công việc (DM_JOB)
  '1.7': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã công việc', kieu: 'chu', batBuoc: true, cot: 'JOB_ID' },
          { k: 'ten', nhan: 'Tên công việc', kieu: 'chu', batBuoc: true, caHang: true, cot: 'JOB_NAME' },
          { k: 'nhom', nhan: 'Nhóm công việc', kieu: 'chon', ds: TEN_NHOM_CONG_VIEC, cot: 'JOB_CLASS_ID' },
          { k: 'pt', nhan: 'Người phụ trách', kieu: 'chu', cot: 'PERSON_IN_CHARGE' },
          { k: 'tg', nhan: 'Thời gian', kieu: 'chu', cot: 'PERIOD' },
          { k: 'doiTuong', nhan: 'Đối tượng liên quan', kieu: 'chu', cot: 'PR_DETAIL_ID' },
        ],
      },
      {
        ten: 'Hạch toán',
        truong: [
          { k: 'tkCp', nhan: 'TK chi phí dở dang', kieu: 'chon', cot: 'EXPENSE_ACCOUNT_ID' },
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
          { k: 'loai', nhan: 'Nhóm kho', kieu: 'chon', ds: TEN_NHOM_KHO, cot: 'WAREHOUSE_CLASS_ID' },
          { k: 'tk', nhan: 'Thủ kho', kieu: 'chu', cot: 'KEEPER' },
        ],
      },
      {
        ten: 'Hạch toán',
        truong: [
          { k: 'tkKho', nhan: 'TK kho ngầm định', kieu: 'chon', cot: 'COST_ACCOUNT_ID' },
          { k: 'tkGv', nhan: 'TK giá vốn ngầm định', kieu: 'chon', cot: 'SALE_COST_ACCOUNT_ID' },
          { k: 'tkCp', nhan: 'TK chi phí ngầm định', kieu: 'chon', cot: 'EXPENSE_ACCOUNT_ID' },
        ],
      },
      {
        ten: 'Ngầm định',
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
          { k: 'stk', nhan: 'Số tài khoản / Ngân hàng', kieu: 'chu' },
          { k: 'cn', nhan: 'Chi nhánh áp dụng', kieu: 'chon', ds: ['Tất cả', 'Lê Lợi', 'Thảo Điền', 'Phan Xích Long'] },
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

  // 1.14 Bảng giá (chưa có bảng DM_ trong schema, chờ đối chiếu)
  '1.14': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ten', nhan: 'Hàng hoá', kieu: 'chu', batBuoc: true, caHang: true },
          { k: 'dvt', nhan: 'Đơn vị tính', kieu: 'chon', ds: TEN_DVT },
          { k: 'loai', nhan: 'Loại giá', kieu: 'chon', ds: ['Giá bán', 'Giá mua', 'Giá sỉ'], batBuoc: true },
          { k: 'gia', nhan: 'Đơn giá', kieu: 'tien', batBuoc: true },
          { k: 'tu', nhan: 'Áp dụng từ ngày', kieu: 'ngay' },
          { k: 'cn', nhan: 'Chi nhánh áp dụng', kieu: 'chon', ds: ['Tất cả', 'Kho tổng', 'Lê Lợi', 'Thảo Điền'] },
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
          { k: 'dung', nhan: 'Dùng cho nghiệp vụ', kieu: 'chon', ds: ['Thu tiền', 'Chi tiền', 'Nhập kho', 'Xuất kho'], batBuoc: true },
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
          { k: 'thuocNhom', nhan: 'Thuộc nhóm', kieu: 'chon', ds: TEN_NHOM_HANG, goi: ['PL', 'PR'] },   // gói Free, Standard bỏ (T144)
          { k: 'loai', nhan: 'Loại hàng hoá', kieu: 'chon', ds: ['Hàng hoá', 'Thành phẩm', 'Nguyên vật liệu', 'Dịch vụ'], goi: ['PL', 'PR'] },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Ngầm định cho hàng hoá',
        goi: ['PL', 'PR'],   // gói Free, Standard ẩn (T144)
        truong: [
          { k: 'tkKho', nhan: 'TK kho', kieu: 'chon' },
          { k: 'tkDt', nhan: 'TK doanh thu', kieu: 'chon' },
          { k: 'tkGv', nhan: 'TK giá vốn', kieu: 'chon' },
          { k: 'tkCp', nhan: 'TK chi phí', kieu: 'chon' },
          { k: 'tkTraLai', nhan: 'TK hàng bán trả lại', kieu: 'chon' },
          { k: 'mucCp', nhan: 'Mục chi phí', kieu: 'chon', ds: TEN_MUC_CHI_PHI },
          { k: 'ppGia', nhan: 'Phương pháp tính giá', kieu: 'chon', ds: ['Bình quân cuối kỳ', 'Bình quân tức thời', 'Nhập trước xuất trước', 'Đích danh'] },
          { k: 'ts', nhan: 'Thuế suất GTGT (%)', kieu: 'chon', ds: ['KCT', '0', '5', '8', '10'] },
          { k: 'tonKho', nhan: 'Theo dõi tồn kho', kieu: 'tich' },
          { k: 'khoMacDinh', nhan: 'Kho mặc định', kieu: 'chon', ds: ['Kho tổng', 'Kho bếp Lê Lợi', 'Kho bar Lê Lợi', 'Kho bếp Thảo Điền', 'Kho bar Thảo Điền'] },
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
          { k: 'thuocNhom', nhan: 'Thuộc nhóm', kieu: 'chon', ds: TEN_NHOM_DOI_TUONG },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Hạch toán',
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
          { k: 'thuocNhom', nhan: 'Thuộc nhóm', kieu: 'chon', ds: TEN_NHOM_MUC_CP },
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
          { k: 'thuocNhom', nhan: 'Thuộc nhóm', kieu: 'chon', ds: TEN_NHOM_CONG_VIEC },
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
          { k: 'thuocNhom', nhan: 'Thuộc nhóm', kieu: 'chon', ds: TEN_NHOM_KHO },
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
          { k: 'loaiCt', nhan: 'Loại chứng từ thu tiền', kieu: 'chon', ds: ['Thu tiền mặt', 'Thu ngân hàng'], batBuoc: true },
          { k: 'dienGiai', nhan: 'Diễn giải', kieu: 'chu', caHang: true },
        ],
      },
      {
        ten: 'Hạch toán ngầm định',
        truong: [
          { k: 'tkNo', nhan: 'TK Nợ', kieu: 'chon', batBuoc: true },
          { k: 'doiTuong', nhan: 'Đối tượng', kieu: 'chon', ds: [...KHACH.map(k => k.ten), ...NCC.map(n => n.ten)] },
          { k: 'congViec', nhan: 'Công việc', kieu: 'chon', ds: TEN_CONG_VIEC_17 },
          { k: 'mucCp', nhan: 'Mục chi phí', kieu: 'chon', ds: TEN_MUC_CHI_PHI },
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
