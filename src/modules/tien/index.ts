// Phân hệ Thu chi (trước là Kế toán tiền): phiếu thu chi, sổ quỹ, sổ ngân hàng, sổ công nợ
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { SoQuy } from './SoQuy'
import { nhatKyChung } from './data'
import { SO_BO_SUNG } from '../bao-cao/so-bo-sung'
import { SoDuBanDau } from '../tong-hop/SoDuBanDau'

/** Phiếu chi mẫu lý do Chi phí chờ phân bổ, đã tạo thẻ chi phí phân bổ TPB2610-0011 (thẻ mẫu ở ccdc/index.ts trỏ về phiếu này) (T168) */
const PHIEU_CHO_PB = {
  id: 'chi-cpb', loai: 'chi', tenLoai: 'Chi tiền mặt', so: 'PC2610-0261', ngay: '07/10/2026', gio: '09:15', thang: 10,
  doiTuong: 'Bà Nguyễn Thị Hạnh', maDt: '', cn: 'Phố Mây Lê Lợi', dienGiai: 'Tiền nhà 6 tháng', tien: 72_000_000, thue: 0, tong: 72_000_000,
  nguon: 'tay', tt: 'ghi', _lyDo: 'Chi phí chờ phân bổ', _ghiChu: 'Tiền nhà 6 tháng',
  _dong: [{ ma: '', ten: 'Tiền nhà 6 tháng', dvt: '', sl: 1, gia: 72_000_000, tien: 72_000_000, ts: 0, thue: 0, ly: 'Chi phí chờ phân bổ', km: '', cv: '', tkNo: '242', tkCo: '1111' }],
  _theCp: ['TPB2610-0011'],
}

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '2.1.1': 'Thu, chi tiền', '2.1.2': 'Đối chiếu công nợ', '2.1.3': 'Phân bổ chi phí chuỗi' }

const tien: ModuleDef = {
  key: 'tien', ten: 'Thu chi', ngan: 'Thu chi', icon: 'wallet', mod: 1,
  mota: 'Quỹ tiền mặt, tiền gửi ngân hàng, công nợ',
  quyTrinh,
  screens: [...tuExcel(1, {
    '2.1.1': { voucher: { prefix: 'PC', doiTuong: 'ncc', nhan: 'Đối tượng', them: 'Thêm phiếu thu, chi', dong: 'tien', tien: [800_000, 32_000_000], soTT58: 'Sổ chi phí sản xuất, kinh doanh',
      dienGiai: ['Chi mua rau, củ tại chợ', 'Chi tiền gas tháng 10', 'Chi tạm ứng mua nguyên liệu', 'Chi tiền điện tháng 9', 'Thu tiền đặt tiệc khách công ty', 'Nộp tiền bán hàng vào ngân hàng'],
      noCo: [['6421', '1111', 'Chi phí bán hàng'], ['1331', '1111', 'Thuế GTGT được khấu trừ']],
      loai: [
        { k: 'thu', ten: 'Thu tiền mặt', icon: 'cashin', prefix: 'PT', doiTuong: 'kh', nhan: 'Người nộp', soTT58: 'Sổ quỹ tiền mặt',
          dienGiai: ['Thu tiền đặt tiệc khách công ty', 'Thu nợ khách hàng', 'Thu tiền bán phế liệu'], noCo: [['1111', '131', 'Thu tiền khách hàng']] },
        { k: 'chi', ten: 'Chi tiền mặt', icon: 'cashout', prefix: 'PC', doiTuong: 'ncc', nhan: 'Người nhận',
          dienGiai: ['Chi mua rau, củ tại chợ', 'Chi tiền gas tháng 10', 'Chi tạm ứng mua nguyên liệu', 'Chi tiền điện tháng 9'] },
        { k: 'bc', ten: 'Thu ngân hàng', icon: 'bank', prefix: 'BC', doiTuong: 'kh', nhan: 'Người chuyển', soTT58: 'Sổ tiền gửi ngân hàng',
          dienGiai: ['Khách công ty chuyển khoản trả nợ', 'GrabFood thanh toán tiền đơn tuần trước'], noCo: [['1121', '131', 'Thu tiền qua ngân hàng']] },
        { k: 'unc', ten: 'Chi ngân hàng', icon: 'bank', prefix: 'UNC', doiTuong: 'ncc', nhan: 'Người nhận', soTT58: 'Sổ tiền gửi ngân hàng',
          dienGiai: ['Trả tiền nhà cung cấp thịt bò', 'Trả tiền thuê mặt bằng tháng 10', 'Nộp thuế GTGT tháng 9'], noCo: [['331', '1121', 'Trả tiền qua ngân hàng']] },
        { k: 'cq', ten: 'Chuyển quỹ', icon: 'swap', prefix: 'CQ', doiTuong: 'none', soTT58: 'Sổ chi tiết tiền',
          dienGiai: ['Nộp tiền bán hàng trong ngày vào Vietcombank', 'Rút tiền gửi ngân hàng về quỹ tiền mặt', 'Chuyển tiền quỹ chi nhánh về tài khoản công ty'],
          noCo: [['1121', '1111', 'Chuyển tiền giữa các quỹ']] },
      ], phieuThem: () => [PHIEU_CHO_PB] } },
    '2.1.2': { voucher: { prefix: 'DCCN', doiTuong: 'kh', nhan: 'Khách hàng, nhà cung cấp', them: 'Lập biên bản', dong: 'tien', tien: [5_000_000, 120_000_000],
      dienGiai: ['Đối chiếu công nợ đến 30/09/2026', 'Đối chiếu công nợ quý 3/2026'], noCo: [['131', '131', 'Số dư đối chiếu, không sinh bút toán']] } },
    '2.1.3': { tool: { nut: 'Phân bổ kỳ 9/2026', mota: 'Phân bổ chi phí chung của văn phòng cho từng chi nhánh: lương quản lý, marketing, thuê kho tổng. Tiêu thức là doanh thu, số đơn hoặc tỷ lệ cố định. Sinh bút toán phân bổ cho từng chi nhánh.',
      caiDat: [['Kỳ phân bổ', 'Tháng 9/2026'], ['Tiêu thức', 'Doanh thu chưa thuế'], ['Khoản mục', '6422, Quảng cáo, Thuê kho tổng']],
      nhatKy: [['30/09/2026 18:10', 'Phân bổ 186.400.000 đ cho 3 chi nhánh', 'Xong'], ['31/08/2026 17:55', 'Phân bổ 172.900.000 đ cho 3 chi nhánh', 'Xong']] } },
    '2.2.1': { kind: 'custom', comp: SoQuy },
    '2.2.2': { report: { kieu: 'so' } },
    '2.2.3': { report: { kieu: 'so', theoCn: true, theoTk: true } },
    '2.2.4': { report: { kieu: 'bangke', ...nhatKyChung } },
    '2.2.5': { report: { kieu: 'tonghop', doiTuong: 'kh', theoCn: true } },
    '2.2.6': { report: SO_BO_SUNG['2.2.6'] },
    '2.2.7': { report: SO_BO_SUNG['2.2.7'] },
    '2.2.8': { report: SO_BO_SUNG['2.2.8'] },
    '2.2.9': { report: SO_BO_SUNG['2.2.9'] },
  }, NGAN),
  // Gói Free chỉ khai số dư tiền, đặt ở Thu chi vì gói Free ẩn phân hệ Tổng hợp; gói khác khai ở Tổng hợp 10.1.3 (T141)
  { slug: 'so-du-ban-dau', ten: 'Số dư ban đầu', icon: 'db', kind: 'custom', comp: SoDuBanDau, goi: ['F'] }],
}
export default tien
