// Phân hệ Tài sản cố định (chỉ gói Pro)
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'

const DS = [['TS001', 'Hệ thống bếp công nghiệp Lê Lợi', 'Máy móc thiết bị', '01/03/2024', 486_000_000, 60, 251_100_000],
  ['TS002', 'Tủ đông 1.500 lít', 'Máy móc thiết bị', '15/05/2024', 92_500_000, 60, 43_166_000], ['TS003', 'Máy pha cà phê La Marzocco', 'Máy móc thiết bị', '01/07/2025', 268_000_000, 60, 66_999_000],
  ['TS004', 'Hệ thống điều hoà Thảo Điền', 'Máy móc thiết bị', '20/06/2026', 214_800_000, 72, 8_950_000], ['TS005', 'Xe tải giao hàng 1,5 tấn', 'Phương tiện vận tải', '10/01/2025', 545_000_000, 96, 119_218_000]] as const

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '7.1.1': 'Danh sách TSCĐ', '7.1.2': 'Tăng, giảm TSCĐ', '7.1.3': 'Tính khấu hao' }

const tscd: ModuleDef = {
  key: 'tscd', ten: 'Tài sản cố định', ngan: 'Tài sản cố định', icon: 'building', mod: 6,
  mota: 'Ghi tăng, khấu hao, thanh lý tài sản cố định',
  quyTrinh,
  screens: tuExcel(6, {
    '7.1.1': { kind: 'catalog', catalog: { them: 'Thêm tài sản', nhomLoc: 'loai', cols: [{ k: 'ma', t: 'Mã TS', cls: 'code' }, { k: 'ten', t: 'Tên tài sản' }, { k: 'loai', t: 'Loại' }, { k: 'ngay', t: 'Ngày ghi tăng' },
      { k: 'ng', t: 'Nguyên giá', num: true }, { k: 'hm', t: 'Hao mòn luỹ kế', num: true }, { k: 'cl', t: 'Giá trị còn lại', num: true }],
      rows: () => DS.map(([ma, ten, loai, ngay, ng, , hm]) => ({ ma, ten, loai, ngay, ng, hm, cl: ng - hm })) } },
    '7.1.2': { voucher: { prefix: 'GTTS', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm chứng từ tài sản', dong: 'ts', tien: [60_000_000, 480_000_000], thue: 10,
      dienGiai: ['Ghi tăng hệ thống hút khói bếp', 'Thanh lý tủ mát cũ', 'Ngừng khấu hao xe tải chờ sửa chữa'], noCo: [['211', '331', 'Ghi tăng tài sản cố định'], ['1332', '331', 'Thuế GTGT của TSCĐ']],
      loai: [
        { k: 'tang', ten: 'Ghi tăng TSCĐ', icon: 'building', prefix: 'GTTS', dienGiai: ['Ghi tăng hệ thống hút khói bếp', 'Ghi tăng tủ đông 1.500 lít'] },
        { k: 'dc', ten: 'Điều chuyển TSCĐ', icon: 'swap', prefix: 'DCTS', doiTuong: 'cn', nhan: 'Chi nhánh nhận', thue: 0,
          dienGiai: ['Điều chuyển máy pha cà phê sang Thảo Điền'], noCo: [['211', '211', 'Điều chuyển giữa chi nhánh, giữ nguyên giá']] },
        { k: 'ngung', ten: 'Ngừng khấu hao', icon: 'clock', prefix: 'NKH', doiTuong: 'cn', nhan: 'Chi nhánh dùng', thue: 0,
          dienGiai: ['Ngừng khấu hao xe tải chờ sửa chữa'], noCo: [['214', '214', 'Ngừng trích khấu hao từ tháng sau']] },
        { k: 'tl', ten: 'Thanh lý TSCĐ', icon: 'trash', prefix: 'TLTS', doiTuong: 'kh', nhan: 'Người mua',
          dienGiai: ['Thanh lý tủ mát cũ'], noCo: [['214', '211', 'Ghi giảm hao mòn luỹ kế'], ['811', '211', 'Giá trị còn lại đưa vào chi phí khác'], ['1111', '711', 'Tiền thu thanh lý']] },
      ] } },
    '7.1.3': { tool: { nut: 'Tính khấu hao tháng 9/2026', mota: 'Tính khấu hao đường thẳng theo số tháng sử dụng của từng tài sản. Sinh bút toán Nợ 6421, 6422 / Có 214 theo bộ phận sử dụng.',
      caiDat: [['Kỳ tính', 'Tháng 9/2026'], ['Phương pháp', 'Đường thẳng'], ['Phân bổ chi phí', 'Theo chi nhánh sử dụng tài sản']],
      nhatKy: [['30/09/2026 17:30', 'Khấu hao 5 tài sản: 31.250.000 đ', 'Xong'], ['31/08/2026 17:12', 'Khấu hao 5 tài sản: 31.250.000 đ', 'Xong']] } },
    '7.2.1': { report: { kieu: 'tonghop', doiTuong: 'ts' } },
    '7.2.2': { report: { kieu: 'tonghop', doiTuong: 'ts' } },
  }, NGAN),
}
export default tscd
