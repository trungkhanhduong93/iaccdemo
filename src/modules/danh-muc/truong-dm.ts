// Khai báo trường thông tin panel Thêm / Sửa cho các danh mục (T70)
// Lấy theo bảng DM_ tương ứng trong CSDL kế toán iPOS (schema-dm.md)
import { TEN_DVT } from './data'

import type { ReactNode } from 'react'
import type { Col, Row } from '../types'
import type { Goi } from '../../app/plan'

export type KieuTruong = 'chu' | 'so' | 'tien' | 'chon' | 'tich' | 'ngay' | 'nhieuDong'

export interface TruongDM {
  k: string
  nhan: string
  kieu: KieuTruong
  batBuoc?: boolean
  caHang?: boolean
  ds?: string[]
  cot?: string
  hien?: (v: Record<string, any>) => boolean   // chỉ hiện ô khi điều kiện đúng theo giá trị form
  chiDoc?: boolean                             // ô tự sinh, không sửa được
  // Ô ngày khi thêm mới so với ngày đầu năm của đơn vị: 'tu' phải từ ngày đầu năm trở đi, 'truoc' phải trước ngày đầu năm (khai số dư)
  dauNam?: (v: Record<string, any>) => 'tu' | 'truoc' | undefined
}

export interface KhoiDM {
  ten: string
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
          { k: 'nhom', nhan: 'Nhóm hàng hoá', kieu: 'chon', ds: ['Món khai vị', 'Món chính', 'Món lẩu', 'Đồ uống', 'Tráng miệng', 'Món mới tháng 10', 'Thịt, cá', 'Rau củ', 'Gia vị', 'Bia, nước ngọt'], cot: 'ITEM_CLASS_ID' },
          { k: 'loai', nhan: 'Tính chất / Loại', kieu: 'chon', ds: ['Hàng hoá', 'Thành phẩm', 'Nguyên vật liệu', 'Công cụ dụng cụ', 'Dịch vụ'], cot: 'ITEM_TYPE_ID' },
          { k: 'dvt', nhan: 'Đơn vị tính', kieu: 'chon', ds: TEN_DVT, cot: 'UNIT_ID' },
          { k: 'dvtPhu', nhan: 'ĐVT phụ', kieu: 'chon', ds: TEN_DVT, cot: 'UNIT_ID_EXTRA' },
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
        truong: [
          { k: 'tkKho', nhan: 'TK kho', kieu: 'chon', cot: 'ACCOUNT_ID_COST' },
          { k: 'tkDt', nhan: 'TK doanh thu', kieu: 'chon', cot: 'ACCOUNT_ID_INCOME' },
          { k: 'tkGv', nhan: 'TK giá vốn', kieu: 'chon', cot: 'ACCOUNT_ID_SALE_COST' },
          { k: 'tkCp', nhan: 'TK chi phí', kieu: 'chon', cot: 'DEFAULT_ACCOUNT_ID_EXPENSE' },
          { k: 'tkTraLai', nhan: 'TK hàng bán trả lại', kieu: 'chon', cot: 'ACCOUNT_ID_RETURN' },
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
          { k: 'nhom', nhan: 'Nhóm đối tượng', kieu: 'chu', cot: 'PR_DETAIL_CLASS_ID' },
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
        ],
      },
    ],
  },

  // 1.6 Mục chi phí (DM_EXPENSE)
  '1.6': {
    khoi: [
      {
        ten: 'Thông tin chung',
        truong: [
          { k: 'ma', nhan: 'Mã mục chi phí', kieu: 'chu', batBuoc: true, cot: 'EXPENSE_ID' },
          { k: 'ten', nhan: 'Tên mục chi phí', kieu: 'chu', batBuoc: true, caHang: true, cot: 'EXPENSE_NAME' },
          { k: 'nhom', nhan: 'Nhóm chi phí', kieu: 'chon', ds: ['Nhân công', 'Mặt bằng', 'Điện, nước, gas', 'Bán hàng', 'Khác'], cot: 'EXPENSE_CLASS_ID' },
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
          { k: 'nhom', nhan: 'Nhóm công việc', kieu: 'chon', ds: ['Mở rộng', 'Marketing', 'Sửa chữa lớn', 'Bán hàng'], cot: 'JOB_CLASS_ID' },
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
          { k: 'loai', nhan: 'Loại kho', kieu: 'chon', ds: ['Kho bếp', 'Kho pha chế', 'Kho tổng', 'Kho phụ trợ'], cot: 'WAREHOUSE_CLASS_ID' },
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
}
