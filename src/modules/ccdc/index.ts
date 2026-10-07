// Phân hệ Công cụ dụng cụ, chi phí trả trước
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '8.1.1': 'CCDC, chi phí trả trước', '8.1.2': 'Tăng, giảm CCDC', '8.1.3': 'Kiểm kê CCDC' }

const ccdc: ModuleDef = {
  key: 'ccdc', ten: 'Công cụ dụng cụ', ngan: 'Công cụ dụng cụ', icon: 'tool', mod: 7,
  mota: 'Công cụ dụng cụ, chi phí trả trước, phân bổ theo kỳ',
  quyTrinh,
  screens: tuExcel(7, {
    '8.1.1': { kind: 'catalog', catalog: { them: 'Ghi tăng CCDC', nhomLoc: 'loai', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'loai', t: 'Loại' }, { k: 'ngay', t: 'Ngày ghi tăng' },
      { k: 'gt', t: 'Giá trị', num: true }, { k: 'ky', t: 'Số kỳ phân bổ', num: true }, { k: 'da', t: 'Đã phân bổ', num: true }, { k: 'con', t: 'Còn lại', num: true }],
      rows: () => ([['CC001', 'Bộ nồi inox 50 lít', 'Công cụ dụng cụ', '05/01/2026', 24_600_000, 12, 18_450_000], ['CC002', 'Bàn ghế gỗ khu ngoài trời', 'Công cụ dụng cụ', '20/06/2026', 86_400_000, 24, 14_400_000],
        ['CC003', 'Máy POS cầm tay', 'Công cụ dụng cụ', '01/08/2026', 31_800_000, 18, 3_533_000], ['CC004', 'Máy xay sinh tố công nghiệp', 'Công cụ dụng cụ', '15/03/2026', 18_900_000, 12, 11_025_000],
        ['TT001', 'Tiền thuê mặt bằng trả trước 6 tháng', 'Chi phí trả trước', '01/07/2026', 594_000_000, 6, 297_000_000], ['TT002', 'Phí bản quyền phần mềm năm 2026', 'Chi phí trả trước', '01/01/2026', 18_000_000, 12, 13_500_000]] as const)
        .map(([ma, ten, loai, ngay, gt, ky, da]) => ({ ma, ten, loai, ngay, gt, ky, da, con: gt - da })) } },
    '8.1.2': { voucher: { prefix: 'DCCC', doiTuong: 'cn', nhan: 'Chi nhánh nhận', them: 'Thêm chứng từ CCDC', dong: 'tien', tien: [2_000_000, 40_000_000],
      dienGiai: ['Điều chuyển bàn ghế sang Thảo Điền', 'Ghi giảm nồi hỏng', 'Ghi tăng máy POS cầm tay'], noCo: [['242', '153', 'Ghi tăng CCDC đang dùng']],
      loai: [
        { k: 'tang', ten: 'Ghi tăng CCDC', icon: 'tool', prefix: 'GTCC', dienGiai: ['Ghi tăng máy POS cầm tay', 'Ghi tăng bộ nồi inox 50 lít'] },
        { k: 'dc', ten: 'Điều chuyển CCDC', icon: 'swap', prefix: 'DCCC', dienGiai: ['Điều chuyển bàn ghế sang Thảo Điền'], noCo: [['242', '242', 'Điều chuyển giữa chi nhánh']] },
        { k: 'giam', ten: 'Ghi giảm CCDC', icon: 'trash', prefix: 'GGCC', dienGiai: ['Ghi giảm nồi hỏng', 'Ghi giảm ly thuỷ tinh vỡ'], noCo: [['6421', '242', 'Phân bổ nốt giá trị còn lại']] },
      ] } },
    '8.1.3': { voucher: { prefix: 'KKCC', doiTuong: 'cn', nhan: 'Chi nhánh', them: 'Thêm phiếu kiểm kê', dong: 'tien', tien: [0, 1_000_000],
      dienGiai: ['Kiểm kê CCDC cuối quý 3', 'Kiểm kê CCDC đột xuất'], noCo: [['1381', '242', 'CCDC thiếu chờ xử lý']] } },
    '8.2.1': { report: { kieu: 'tonghop', doiTuong: 'ccdc' } },
    '8.2.2': { report: { kieu: 'tonghop', doiTuong: 'ccdc' } },
    '8.2.3': { report: { kieu: 'tonghop', doiTuong: 'ccdc' } },
    '8.2.4': { report: { kieu: 'tonghop', doiTuong: 'ccdc' } },
  }, NGAN),
}
export default ccdc
