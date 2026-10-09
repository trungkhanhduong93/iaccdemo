// Phân hệ Kế toán mua hàng
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { PHIEU_MUA, chiTietMua, chiTietNhap, tongHopMua, tongHopNhap } from './bao-cao'

const MUA = PHIEU_MUA.dienGiai

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '4.1.2': 'Hoá đơn mua hàng', '4.1.3': 'Mua qua sơ chế', '4.1.4': 'Trả lại hàng mua', '4.1.5': 'Chi phí mua hàng', '4.1.6': 'Bổ sung hoá đơn' }

const muaHang: ModuleDef = {
  key: 'mua-hang', ten: 'Kế toán mua hàng', ngan: 'Mua hàng', icon: 'truck', mod: 3,
  mota: 'Phiếu mua từ iPOS Inventory, hoá đơn đầu vào, công nợ phải trả',
  quyTrinh,
  screens: tuExcel(3, {
    '4.1.1': { voucher: PHIEU_MUA },
    '4.1.2': { voucher: { prefix: 'HDM', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm hoá đơn mua hàng', dong: 'nvl', tien: [0, 0], nguon: 'HĐ', dienGiai: MUA,
      noCo: [['152', '331', 'Giá trị hàng mua'], ['1331', '331', 'Thuế GTGT được khấu trừ']] } },
    '4.1.3': { voucher: { prefix: 'MSC', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm phiếu mua qua sơ chế', dong: 'nvl', tien: [0, 0], nguon: 'excel',
      dienGiai: ['Mua thịt bò nguyên tảng, sơ chế thành thịt tái', 'Mua tôm sú, sơ chế bóc vỏ'], noCo: [['152', '331', 'Nhập kho nguyên liệu đã sơ chế'], ['1331', '331', 'Thuế GTGT được khấu trừ']] } },
    '4.1.4': { voucher: { prefix: 'TLN', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm phiếu trả lại', dong: 'nvl', tien: [0, 0], nguon: 'excel',
      dienGiai: ['Trả lại thịt bò không đạt chất lượng', 'Trả lại bánh phở giao trễ'], noCo: [['331', '152', 'Trả lại hàng'], ['331', '1331', 'Giảm thuế GTGT được khấu trừ']] } },
    '4.1.5': { voucher: { prefix: 'CPM', doiTuong: 'ncc', nhan: 'Nhà cung cấp dịch vụ', them: 'Thêm chi phí mua hàng', dong: 'tien', tien: [400_000, 6_000_000], thue: 8,
      dienGiai: ['Phí vận chuyển lô hàng đông lạnh', 'Phí bốc xếp', 'Phí kiểm định an toàn thực phẩm'], noCo: [['152', '331', 'Phân bổ chi phí mua vào giá nhập'], ['1331', '331', 'Thuế GTGT được khấu trừ']] } },
    '4.1.6': { voucher: { prefix: 'BSHD', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Gắn hoá đơn cho phiếu mua', dong: 'tien', tien: [2_000_000, 30_000_000], thue: 8, nguon: 'HĐ',
      dienGiai: ['Gắn hoá đơn cho phiếu mua tuần trước', 'Nhà cung cấp xuất hoá đơn gộp cuối tháng'], noCo: [['1331', '331', 'Thuế GTGT được khấu trừ bổ sung']] } },
    // Báo cáo mua hàng, nhập hàng tính từ phiếu mua 4.1.1, theo chi nhánh trên thanh trên (T63)
    '4.2.1': { ten: 'Chi tiết mua hàng', report: { kieu: 'bangke', theoCn: true, ...chiTietMua } },
    '4.2.2': { ten: 'Tổng hợp mua hàng', report: { kieu: 'bangke', theoCn: true, ...tongHopMua } },
    '4.2.4': { report: { kieu: 'bangke', theoCn: true, ...tongHopNhap } },
    '4.2.5': { report: { kieu: 'bangke', theoCn: true, ...chiTietNhap } },
    '4.2.3': { report: { kieu: 'tonghop', doiTuong: 'ncc', theoCn: true } },   // Sổ công nợ nhà cung cấp (T52)
  }, NGAN),
}
export default muaHang
