// Phân hệ Công cụ dụng cụ, chi phí trả trước
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { THE_PHAN_BO, bangPhanBo, daPhanBoToiKy, veChiTietThe } from './the-phan-bo'
import { GhiTangHangLoat } from './GhiTangHangLoat'
import { CCDC_HANG, CHI_NHANH } from '../../data/mock'

/** Thẻ chi phí phân bổ mẫu: [số thẻ, loại, ngày ghi tăng, các dòng [mã, tên, số tiền, số tháng, thêm?]]; thêm: số lượng (CCDC), số hiệu, mô tả (TSCĐ) */
const THE_MAU = ([
  ['TPB2601-0001', 'Công cụ dụng cụ', '05/01/2026', [['CC001', 'Bộ nồi inox 50 lít', 24_600_000, 12]]],
  ['TPB2606-0002', 'Công cụ dụng cụ', '20/06/2026', [['CC002', 'Bàn ghế gỗ khu ngoài trời', 86_400_000, 24]]],
  ['TPB2608-0003', 'Công cụ dụng cụ', '01/08/2026', [['CC003', 'Máy POS cầm tay', 31_800_000, 18], ['CC004', 'Máy xay sinh tố công nghiệp', 18_900_000, 12]]],
  ['TPB2607-0004', 'Chi phí trả trước', '01/07/2026', [['TT001', 'Tiền thuê mặt bằng trả trước 6 tháng', 594_000_000, 6]]],
  ['TPB2601-0005', 'Chi phí trả trước', '01/01/2026', [['TT002', 'Phí bản quyền phần mềm năm 2026', 18_000_000, 12]]],
  ['TPB2602-0006', 'Chi phí trả trước', '01/02/2026', [['TT003', 'Bảo hiểm cháy nổ 6 tháng', 12_000_000, 6]]],
  ['TPB2611-0007', 'Công cụ dụng cụ', '05/11/2026', [['CC005', 'Dao thớt bếp trọn bộ', 9_600_000, 12]]],
  // Thẻ nhiều dòng chi tiết phân bổ, mỗi loại một thẻ
  ['TPB2609-0008', 'Chi phí trả trước', '01/09/2026', [['CPTT.0001', 'Tiền thuê kho lạnh 6 tháng', 54_000_000, 6], ['CPTT.0002', 'Bảo hiểm cháy nổ chi nhánh 12 tháng', 24_000_000, 12],
    ['CPTT.0003', 'Phí phần mềm bán hàng 12 tháng', 14_400_000, 12]]],
  ['TPB2609-0009', 'Công cụ dụng cụ', '15/09/2026', [['CC006', 'Ly thuỷ tinh 300ml', 7_200_000, 12, { sl: 240 }], ['CC008', 'Khay inox chữ nhật', 4_800_000, 6, { sl: 40 }],
    ['CC007', 'Tủ mát 2 cánh', 28_500_000, 24, { sl: 1 }]]],
  ['TPB2610-0010', 'Tài sản cố định', '01/10/2026', [
    ['TSCD.0001', 'Máy rửa chén công nghiệp', 186_000_000, 60, { soHieu: 'MRC-2026-01', moTa: 'Máy rửa chén băng chuyền, 1.000 đĩa mỗi giờ, đặt tại bếp Lê Lợi' }],
    ['TSCD.0002', 'Hệ thống hút khói bếp', 124_000_000, 60, { soHieu: 'HK-LL-02', moTa: 'Chụp hút inox 6m, quạt ly tâm, ống dẫn ra mái' }]]],
] as [string, string, string, [string, string, number, number, { sl?: number; soHieu?: string; moTa?: string }?][]][]).map(([soThe, loai, ngay, dong], i) => ({
  soThe, loai, ngay, ngayPb: ngay, _kieu: 'the', ngung: 0, cn: CHI_NHANH[i % CHI_NHANH.length].ten,
  dong: dong.map(([ma, ten, gt, ky, them]) => ({ ma, ten, dvt: CCDC_HANG.find(h => h.ma === ma)?.dvt, gt, ky, sl: them?.sl ?? 1, dg: gt / (them?.sl ?? 1),
    soHieu: them?.soHieu, moTa: them?.moTa, _maTay: true })),
}))

/** dd/mm/yyyy -> yyyymm; kỳ liền trước của yyyymm */
const thangCua = (d: string) => { const [, m, y] = d.split('/').map(Number); return y * 100 + m }
const kyTruoc = (ky: number) => ky % 100 === 1 ? ky - 89 : ky - 1

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '8.1.1': 'Danh sách thẻ chi phí', '8.1.2': 'Tăng, giảm CCDC', '8.1.3': 'Kiểm kê CCDC' }

const ccdc: ModuleDef = {
  key: 'ccdc', ten: 'Chi phí phân bổ', ngan: 'Chi phí phân bổ', icon: 'tool', mod: 7,
  mota: 'Công cụ dụng cụ, chi phí trả trước, phân bổ theo kỳ',
  quyTrinh,
  screens: [...tuExcel(7, {
    '8.1.1': { kind: 'catalog', catalog: { them: 'Ghi tăng', nhomLoc: 'loai', nhanLoc: 'Loại thẻ', truong: THE_PHAN_BO, stt: true, kySoLieu: true,
      // Như danh sách chứng từ: phân trang, dòng Tổng, xem nhanh các dòng của thẻ ở khung dưới
      hangLoat: { nhan: 'Ghi tăng hàng loạt', Form: GhiTangHangLoat },
      dsChungTu: { cotCong: ['gt', 'da', 'con'], so: r => r.soThe, moTa: r => `(${r.ngay}) — ${r.ten}`, chiTiet: veChiTietThe }, cols: [{ k: 'soThe', t: 'Số thẻ', cls: 'code' }, { k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'loai', t: 'Loại' }, { k: 'ngay', t: 'Ngày ghi tăng' },
      { k: 'gt', t: 'Giá trị', num: true }, { k: 'ky', t: 'Số kỳ phân bổ', num: true }, { k: 'da', t: 'Đã phân bổ', num: true }, { k: 'con', t: 'Còn lại', num: true }],
      // Mặc định ẩn thẻ hết phân bổ: chỉ hiện thẻ còn phân bổ ở kỳ này hoặc còn giá trị sau kỳ này
      tich: { nhan: 'Ẩn thẻ hết phân bổ', macDinh: true, loc: r => r.kyNay > 0 || r.con > 0 },
      // Chỉ thẻ ghi tăng tới ngày cuối kỳ số liệu; đã phân bổ tính tới hết kỳ đó
      rows: (_cd, ky) => THE_MAU.filter(t => thangCua(t.ngay) <= ky).map(t => {
        // Mỗi thẻ một hàng: mã, tên dòng đầu; giá trị cộng các dòng
        const gt = t.dong.reduce((s, d) => s + d.gt, 0), da = daPhanBoToiKy(t, ky)
        return { ...t, ma: t.dong[0].ma, ten: t.dong[0].ten + (t.dong.length > 1 ? ` và ${t.dong.length - 1} mục khác` : ''), gt, ky: t.dong[0].ky, da, con: gt - da,
          kyNay: da - daPhanBoToiKy(t, kyTruoc(ky)) }
      }) } },
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
    // Bảng chi tiết phân bổ chi phí: báo cáo của thẻ chi phí phân bổ, có ở mọi gói có màn thẻ (8.1.1)
    { slug: 'bang-phan-bo', ten: 'Bảng chi tiết phân bổ chi phí', nhom: 'Sổ sách và báo cáo', can: ['8.1.1'], kind: 'report', icon: 'calendar',
      report: { kieu: 'bangke', cols: [
        { k: 'soThe', t: 'Số thẻ', cls: 'code', w: 120 }, { k: 'loai', t: 'Loại thẻ', w: 140 }, { k: 'ma', t: 'Mã', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên mục chi phí, CCDC, TSCĐ' },
        { k: 'ngayPb', t: 'Ngày bắt đầu phân bổ', w: 120 }, { k: 'gt', t: 'Số tiền', num: true }, { k: 'soKy', t: 'Số kỳ', num: true, w: 70 },
        { k: 'kyNay', t: 'Phân bổ trong kỳ', num: true }, { k: 'luyKe', t: 'Luỹ kế đã phân bổ', num: true }, { k: 'con', t: 'Còn lại', num: true },
      ], rows: thang => THE_MAU.filter(t => thangCua(t.ngay) <= 202600 + thang).flatMap(t => bangPhanBo(t, 202600 + thang)) } },
  ],
}
export default ccdc
