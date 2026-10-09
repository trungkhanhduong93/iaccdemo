import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ModuleDef } from '../modules/types'
import { useSession } from './session'
import { hienMan, moDuoc, timMan } from './registry'
import { Icon } from '../ui/Icon'
import { heSoZoom } from '../ui/zoom'

export interface FlyoutItem {
  ten: string
  di: string
  icon?: string
}

export interface FlyoutData {
  trai: { tieuDe: string; items: FlyoutItem[] }
  phai: { tieuDe: string; items: FlyoutItem[] }
}

const FLYOUT_CONFIG: Record<string, FlyoutData> = {
  'home': {
    trai: {
      tieuDe: 'Nghiệp vụ thường dùng',
      items: [
        { ten: 'Bán hàng', di: '/app/ban-hang/3-1-1' },
        { ten: 'Mua hàng', di: '/app/mua-hang/4-1-1' },
        { ten: 'Thu, chi tiền', di: '/app/tien/2-1-1' },
        { ten: 'Nhập, xuất kho', di: '/app/kho/5-1-1' },
        { ten: 'Kê khai thuế', di: '/app/thue/6-1-1' },
      ],
    },
    phai: {
      tieuDe: 'Báo cáo & Sổ sách',
      items: [
        { ten: 'Sổ quỹ tiền mặt', di: '/app/tien/2-2-1' },
        { ten: 'Doanh thu theo món', di: '/app/ban-hang/3-2-3' },
        { ten: 'Tổng hợp nhập xuất tồn', di: '/app/kho/5-2-2' },
        { ten: 'Báo cáo tài chính', di: '/app/tong-hop/10-2-2' },
        { ten: 'Cảnh báo số liệu', di: '/app/tien-ich/11-6' },
      ],
    },
  },
  'mua-hang': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Đơn mua hàng', di: '/app/mua-hang/4-1-1/moi' },
        { ten: 'Phiếu mua hàng', di: '/app/mua-hang/4-1-1' },
        { ten: 'Hoá đơn mua hàng', di: '/app/mua-hang/4-1-2' },
        { ten: 'Mua hàng qua sơ chế', di: '/app/mua-hang/4-1-3' },
        { ten: 'Trả lại hàng mua', di: '/app/mua-hang/4-1-4' },
        { ten: 'Chi phí mua hàng', di: '/app/mua-hang/4-1-5' },
        { ten: 'Bổ sung hoá đơn', di: '/app/mua-hang/4-1-6' },
        { ten: 'Đối chiếu công nợ', di: '/app/tien/2-1-2' },
        { ten: 'Sơ đồ quy trình', di: '/app/mua-hang/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Nhập từ iPOS Inventory', di: '/app/tien-ich/11-3' },
        { ten: 'Nhận hoá đơn đầu vào', di: '/app/tien-ich/11-4' },
        { ten: 'Bảng kê mua hàng', di: '/app/mua-hang/4-2-1' },
        { ten: 'Sổ công nợ phải trả', di: '/app/mua-hang/4-2-2' },
        { ten: 'Nhà cung cấp', di: '/app/danh-muc/1-5' },
        { ten: 'Hàng hoá, vật tư', di: '/app/danh-muc/1-2' },
        { ten: 'Bảng giá mua', di: '/app/danh-muc/1-14' },
        { ten: 'Báo cáo mua hàng', di: '/app/mua-hang/bao-cao' },
      ],
    },
  },
  'ban-hang': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Đơn POS từ FABi', di: '/app/tien-ich/11-1' },
        { ten: 'Chứng từ bán hàng', di: '/app/ban-hang/3-1-1' },
        { ten: 'Hoá đơn bán hàng', di: '/app/ban-hang/3-1-2' },
        { ten: 'Bán hàng nội bộ', di: '/app/ban-hang/3-1-3' },
        { ten: 'Hàng bán trả lại', di: '/app/ban-hang/3-1-4' },
        { ten: 'Xuất hoá đơn điện tử', di: '/app/ban-hang/3-1-5' },
        { ten: 'Điều chỉnh hoá đơn', di: '/app/ban-hang/3-1-6' },
        { ten: 'Đối soát với POS', di: '/app/ban-hang/3-2-2' },
        { ten: 'Sơ đồ quy trình', di: '/app/ban-hang/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Đồng bộ đơn từ FABi', di: '/app/tien-ich/11-1' },
        { ten: 'Khách hàng', di: '/app/danh-muc/1-5' },
        { ten: 'Hàng hoá, món ăn', di: '/app/danh-muc/1-2' },
        { ten: 'Bảng giá bán', di: '/app/danh-muc/1-14' },
        { ten: 'Bảng kê bán hàng', di: '/app/ban-hang/3-2-1' },
        { ten: 'Doanh thu theo món', di: '/app/ban-hang/3-2-3' },
        { ten: 'Báo cáo bán hàng', di: '/app/ban-hang/bao-cao' },
      ],
    },
  },
  'tien': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Thu tiền mặt', di: '/app/tien/2-1-1/moi?loai=thu' },
        { ten: 'Chi tiền mặt', di: '/app/tien/2-1-1/moi?loai=chi' },
        { ten: 'Thu tiền gửi ngân hàng', di: '/app/tien/2-1-1/moi?loai=bc' },
        { ten: 'Chi tiền gửi ngân hàng (UNC)', di: '/app/tien/2-1-1/moi?loai=unc' },
        { ten: 'Chuyển quỹ nội bộ', di: '/app/tien/2-1-1/moi?loai=cq' },
        { ten: 'Thu, chi tiền tổng hợp', di: '/app/tien/2-1-1' },
        { ten: 'Đối chiếu công nợ', di: '/app/tien/2-1-2' },
        { ten: 'Phân bổ chi phí chuỗi', di: '/app/tien/2-1-3' },
        { ten: 'Sơ đồ quy trình', di: '/app/tien/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Sổ quỹ tiền mặt', di: '/app/tien/2-2-1' },
        { ten: 'Sổ tiền gửi ngân hàng', di: '/app/tien/2-2-3' },
        { ten: 'Sổ công nợ tổng hợp', di: '/app/tien/2-2-5' },
        { ten: 'Sổ nhật ký chung', di: '/app/tien/2-2-4' },
        { ten: 'Khớp giao dịch ngân hàng', di: '/app/tien-ich/11-8' },
        { ten: 'Quỹ tiền & Tài khoản NH', di: '/app/danh-muc/1-12' },
        { ten: 'Khách hàng, nhà cung cấp', di: '/app/danh-muc/1-5' },
        { ten: 'Báo cáo tiền & ngân hàng', di: '/app/tien/bao-cao' },
      ],
    },
  },
  'kho': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Phiếu nhập khác', di: '/app/kho/5-1-1' },
        { ten: 'Phiếu xuất kho', di: '/app/kho/5-1-2' },
        { ten: 'Phiếu chế biến', di: '/app/kho/5-1-3' },
        { ten: 'Điều chuyển kho', di: '/app/kho/5-1-4' },
        { ten: 'Phiếu sơ chế', di: '/app/kho/5-1-6' },
        { ten: 'Kiểm kê kho', di: '/app/kho/5-1-10' },
        { ten: 'Tính giá vốn xuất kho', di: '/app/kho/5-1-7' },
        { ten: 'Công thức chế biến', di: '/app/kho/9-1-3' },
        { ten: 'Sơ đồ quy trình', di: '/app/kho/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Đồng bộ kho iPOS Inventory', di: '/app/tien-ich/11-3' },
        { ten: 'Xuất kho định lượng bán hàng', di: '/app/tien-ich/11-2' },
        { ten: 'Thẻ kho chi tiết', di: '/app/kho/5-2-1' },
        { ten: 'Tổng hợp nhập xuất tồn', di: '/app/kho/5-2-2' },
        { ten: 'Định mức tồn kho', di: '/app/kho/5-1-13' },
        { ten: 'Danh mục kho hàng', di: '/app/danh-muc/1-8' },
        { ten: 'Hàng hoá, nguyên vật liệu', di: '/app/danh-muc/1-2' },
        { ten: 'Báo cáo kho', di: '/app/kho/bao-cao' },
      ],
    },
  },
  'thue': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Kê khai thuế mua vào', di: '/app/thue/6-1-1' },
        { ten: 'Kê khai thuế bán ra', di: '/app/thue/6-1-2' },
        { ten: 'Bảng kê hoá đơn mua vào', di: '/app/thue/6-2-1' },
        { ten: 'Bảng kê hoá đơn bán ra', di: '/app/thue/6-2-2' },
        { ten: 'Tờ khai thuế GTGT', di: '/app/thue/6-2-3' },
        { ten: 'Sơ đồ quy trình', di: '/app/thue/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Nhận hoá đơn đầu vào', di: '/app/tien-ich/11-4' },
        { ten: 'Nộp tờ khai qua mạng', di: '/app/tien-ich/11-9' },
        { ten: 'Danh mục loại thuế suất', di: '/app/danh-muc/1-11' },
        { ten: 'Báo cáo thuế GTGT', di: '/app/thue/bao-cao' },
      ],
    },
  },
  'tscd': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Danh sách TSCĐ', di: '/app/tscd/7-1-1' },
        { ten: 'Ghi tăng TSCĐ', di: '/app/tscd/7-1-2/moi?loai=tang' },
        { ten: 'Tính khấu hao TSCĐ', di: '/app/tscd/7-1-3' },
        { ten: 'Điều chuyển TSCĐ', di: '/app/tscd/7-1-2/moi?loai=dc' },
        { ten: 'Ngừng khấu hao', di: '/app/tscd/7-1-2/moi?loai=ngung' },
        { ten: 'Thanh lý TSCĐ', di: '/app/tscd/7-1-2/moi?loai=tl' },
        { ten: 'Sơ đồ quy trình', di: '/app/tscd/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Bảng tính khấu hao TSCĐ', di: '/app/tscd/7-2-1' },
        { ten: 'Sổ tài sản cố định', di: '/app/tscd/7-2-2' },
        { ten: 'Danh mục loại TSCĐ', di: '/app/danh-muc/1-13' },
        { ten: 'Báo cáo tài sản', di: '/app/tscd/bao-cao' },
      ],
    },
  },
  'ccdc': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Danh sách CCDC', di: '/app/ccdc/8-1-1' },
        { ten: 'Ghi tăng CCDC', di: '/app/ccdc/8-1-2/moi?loai=tang' },
        { ten: 'Phân bổ CCDC hằng tháng', di: '/app/ccdc/8-2-3' },
        { ten: 'Điều chuyển CCDC', di: '/app/ccdc/8-1-2/moi?loai=dc' },
        { ten: 'Ghi giảm CCDC', di: '/app/ccdc/8-1-2/moi?loai=giam' },
        { ten: 'Kiểm kê CCDC', di: '/app/ccdc/8-1-3' },
        { ten: 'Sơ đồ quy trình', di: '/app/ccdc/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Bảng phân bổ CCDC', di: '/app/ccdc/8-2-3' },
        { ten: 'Sổ theo dõi CCDC', di: '/app/ccdc/8-2-1' },
        { ten: 'Danh mục mục chi phí', di: '/app/danh-muc/1-6' },
        { ten: 'Báo cáo CCDC', di: '/app/ccdc/bao-cao' },
      ],
    },
  },
  'gia-thanh': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Công thức chế biến món', di: '/app/kho/9-1-3' },
        { ten: 'Tính giá vốn NVL', di: '/app/kho/5-1-7' },
        { ten: 'Tập hợp chi phí sản xuất', di: '/app/gia-thanh/9-2-1' },
        { ten: 'Phân bổ chi phí chung', di: '/app/gia-thanh/9-1-1' },
        { ten: 'Tính giá thành nhiều cấp', di: '/app/gia-thanh/9-1-2' },
        { ten: 'Quy trình giá thành', di: '/app/gia-thanh/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Báo cáo giá thành món ăn', di: '/app/gia-thanh/9-2-2' },
        { ten: 'Thẻ tính giá thành', di: '/app/kho/5-2-6' },
        { ten: 'Mục chi phí', di: '/app/danh-muc/1-6' },
        { ten: 'Công việc, đơn đoạn', di: '/app/danh-muc/1-7' },
        { ten: 'Báo cáo giá thành', di: '/app/gia-thanh/bao-cao' },
      ],
    },
  },
  'tong-hop': {
    trai: {
      tieuDe: 'Nghiệp vụ',
      items: [
        { ten: 'Chứng từ tổng hợp', di: '/app/tong-hop/10-1-1' },
        { ten: 'Doanh thu trả trước', di: '/app/tong-hop/10-1-2' },
        { ten: 'Số dư ban đầu', di: '/app/tong-hop/10-1-3' },
        { ten: 'Kiểm tra cuối kỳ', di: '/app/tong-hop/10-1-4' },
        { ten: 'Kết chuyển cuối kỳ', di: '/app/tong-hop/10-1-5' },
        { ten: 'Khoá sổ kế toán', di: '/app/tong-hop/10-1-6' },
        { ten: 'Kết chuyển số dư', di: '/app/tong-hop/10-1-9' },
        { ten: 'Sơ đồ quy trình', di: '/app/tong-hop/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tiện ích',
      items: [
        { ten: 'Hệ thống tài khoản', di: '/app/danh-muc/1-1' },
        { ten: 'Bút toán tự động', di: '/app/danh-muc/1-15' },
        { ten: 'Cảnh báo số liệu', di: '/app/tien-ich/11-6' },
        { ten: 'Báo cáo tài chính', di: '/app/tong-hop/10-2-2' },
        { ten: 'Bảng cân đối tài khoản', di: '/app/tong-hop/10-2-1' },
        { ten: 'Báo cáo quản trị F&B', di: '/app/tong-hop/10-3-1' },
        { ten: 'Báo cáo tổng hợp', di: '/app/tong-hop/bao-cao' },
      ],
    },
  },
  'bao-cao': {
    trai: {
      tieuDe: 'Báo cáo hay dùng',
      items: [
        { ten: 'Báo cáo tình hình tài chính', di: '/app/bao-cao/10-2-2' },
        { ten: 'Kết quả kinh doanh', di: '/app/bao-cao/10-2-3' },
        { ten: 'Báo cáo doanh thu', di: '/app/bao-cao/3-2-3' },
        { ten: 'Xuất nhập tồn', di: '/app/bao-cao/5-2-3' },
        { ten: 'Sổ quỹ tiền mặt', di: '/app/bao-cao/2-2-1' },
        { ten: 'Sổ công nợ', di: '/app/bao-cao/2-2-5' },
      ],
    },
    phai: {
      tieuDe: 'Theo phân hệ',
      items: [
        { ten: 'Thu chi', di: '/app/bao-cao/nhom-tien' },
        { ten: 'Bán hàng', di: '/app/bao-cao/nhom-ban-hang' },
        { ten: 'Mua hàng', di: '/app/bao-cao/nhom-mua-hang' },
        { ten: 'Kho', di: '/app/bao-cao/nhom-kho' },
        { ten: 'Kê khai thuế', di: '/app/bao-cao/nhom-thue' },
        { ten: 'Tài sản cố định', di: '/app/bao-cao/nhom-tscd' },
        { ten: 'Chi phí phân bổ', di: '/app/bao-cao/nhom-ccdc' },
        { ten: 'Giá thành', di: '/app/bao-cao/nhom-gia-thanh' },
        { ten: 'Tổng hợp', di: '/app/bao-cao/nhom-tong-hop' },
      ],
    },
  },
  'danh-muc': {
    trai: {
      tieuDe: 'Đối tượng & Hàng hoá',
      items: [
        { ten: 'Hàng hoá, món ăn', di: '/app/danh-muc/1-2' },
        { ten: 'Đơn vị tính', di: '/app/danh-muc/1-3' },
        { ten: 'Quy đổi đơn vị tính', di: '/app/danh-muc/1-4' },
        { ten: 'Khách hàng, NCC, nhân viên', di: '/app/danh-muc/1-5' },
        { ten: 'Kho hàng', di: '/app/danh-muc/1-8' },
        { ten: 'Chi nhánh làm việc', di: '/app/danh-muc/chi-nhanh' },
        { ten: 'Bảng giá bán & mua', di: '/app/danh-muc/1-14' },
        { ten: 'Sơ đồ danh mục', di: '/app/danh-muc/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Tài chính & Khác',
      items: [
        { ten: 'Hệ thống tài khoản', di: '/app/danh-muc/1-1' },
        { ten: 'Quỹ tiền & Tài khoản NH', di: '/app/danh-muc/1-12' },
        { ten: 'Mục chi phí', di: '/app/danh-muc/1-6' },
        { ten: 'Công việc, đơn đoạn', di: '/app/danh-muc/1-7' },
        { ten: 'Tiền tệ & Tỷ giá', di: '/app/danh-muc/1-9' },
        { ten: 'Loại thuế suất', di: '/app/danh-muc/1-11' },
        { ten: 'Tài sản cố định', di: '/app/danh-muc/1-13' },
        { ten: 'Bút toán tự động', di: '/app/danh-muc/1-15' },
      ],
    },
  },
  'tien-ich': {
    trai: {
      tieuDe: 'Tích hợp & Đồng bộ',
      items: [
        { ten: 'Đồng bộ đơn từ FABi POS', di: '/app/tien-ich/11-1' },
        { ten: 'Xuất kho định lượng bán hàng', di: '/app/tien-ich/11-2' },
        { ten: 'Đồng bộ kho iPOS Inventory', di: '/app/tien-ich/11-3' },
        { ten: 'Nhận hoá đơn đầu vào', di: '/app/tien-ich/11-4' },
        { ten: 'Duyệt chứng từ nhiều cấp', di: '/app/tien-ich/11-5' },
        { ten: 'Sơ đồ tiện ích', di: '/app/tien-ich/quy-trinh' },
      ],
    },
    phai: {
      tieuDe: 'Kiểm tra & Tiện ích khác',
      items: [
        { ten: 'Cảnh báo sai lệch số liệu', di: '/app/tien-ich/11-6' },
        { ten: 'Đối soát đơn hàng & doanh thu', di: '/app/tien-ich/11-7' },
        { ten: 'Khớp giao dịch ngân hàng', di: '/app/tien-ich/11-8' },
        { ten: 'Kết nối cơ quan thuế', di: '/app/tien-ich/11-9' },
        { ten: 'AI gợi ý định khoản', di: '/app/tien-ich/11-10' },
        { ten: 'Thiết kế mẫu in chứng từ', di: '/app/tien-ich/11-11' },
        { ten: 'Báo cáo tự khai báo', di: '/app/tien-ich/11-12' },
      ],
    },
  },
  'he-thong': {
    trai: {
      tieuDe: 'Quản trị & Người dùng',
      items: [
        { ten: 'Người dùng', di: '/app/he-thong/nguoi-dung' },
        { ten: 'Vai trò & phân quyền', di: '/app/he-thong/phan-quyen' },
        { ten: 'Gói thuê bao & bản quyền', di: '/app/he-thong/goi-thue-bao' },
        { ten: 'Nhật ký thao tác', di: '/app/he-thong/nhat-ky' },
      ],
    },
    phai: {
      tieuDe: 'Cấu hình & Cài đặt',
      items: [
        { ten: 'Thông tin doanh nghiệp', di: '/app/he-thong/thong-tin' },
        { ten: 'Cấu hình kế toán', di: '/app/he-thong/cau-hinh' },
        { ten: 'Danh mục chi nhánh', di: '/app/danh-muc/chi-nhanh' },
      ],
    },
  },
}

export function SidebarFlyout({
  mod,
  top,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  mod: ModuleDef
  top: number
  onClose: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const { s } = useSession()
  const flyoutRef = useRef<HTMLDivElement>(null)

  // Điều chỉnh top để không tràn màn hình bên dưới
  const adjustedTop = (() => {
    const z = heSoZoom()
    const winH = typeof window !== 'undefined' ? window.innerHeight / z : 800
    // Ước tính chiều cao flyout khoảng 380px
    const maxTop = Math.max(12, winH - 420)
    return Math.max(8, Math.min(top, maxTop))
  })()

  const data = FLYOUT_CONFIG[mod.key]
  if (!data) return null

  // Lọc theo quyền gói
  const locItems = (items: FlyoutItem[]) => {
    return items
      .map(it => {
        const parts = it.di.replace(/^\/app\//, '').split('?')[0].split('/')
        const modK = parts[0]
        const slug = parts[1]
        const { sc } = timMan(modK, slug)
        if (sc) {
          if (!hienMan(sc, s.goi)) return null
          const khoa = !moDuoc(sc, s.goi)
          return { ...it, khoa }
        }
        return { ...it, khoa: false }
      })
      .filter((it): it is NonNullable<typeof it> => it !== null)
  }

  const itemsTrai = locItems(data.trai.items)
  const itemsPhai = locItems(data.phai.items)

  return (
    <div
      ref={flyoutRef}
      className="sb-flyout"
      style={{ top: `${adjustedTop}px` }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="sb-flyout-bridge" />
      <div className="sb-flyout-grid">
        <div className="sb-flyout-col">
          <div className="sb-flyout-title">{data.trai.tieuDe}</div>
          <div className="sb-flyout-list">
            {itemsTrai.map(it => (
              <Link
                key={it.di}
                to={it.di}
                className={`sb-flyout-item${it.khoa ? ' lock' : ''}`}
                onClick={onClose}
              >
                <span>{it.ten}</span>
                {it.khoa && <Icon n="lock" className="ic sm lk" />}
              </Link>
            ))}
          </div>
        </div>
        <div className="sb-flyout-col">
          <div className="sb-flyout-title">{data.phai.tieuDe}</div>
          <div className="sb-flyout-list">
            {itemsPhai.map(it => (
              <Link
                key={it.di}
                to={it.di}
                className={`sb-flyout-item${it.khoa ? ' lock' : ''}`}
                onClick={onClose}
              >
                <span>{it.ten}</span>
                {it.khoa && <Icon n="lock" className="ic sm lk" />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
