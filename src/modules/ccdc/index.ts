// Phân hệ Công cụ dụng cụ, chi phí trả trước
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { GhiTangHangLoat, useCanhBaoCho } from './GhiTangHangLoat'
import { THE_PHAN_BO, bangPhanBo, daPhanBoToiKy, veChiTietThe } from './the-phan-bo'
import { CCDC_HANG, CUA_HANG } from '../../data/mock'

/** Chứng từ gốc của thẻ mẫu theo thứ tự thẻ: phiếu chi, uỷ nhiệm chi mẫu có sẵn ở Thu, chi tiền (T159) */
const GOC_MAU = ([
  ['chi-3', 'PC2610-0250', '03/10/2026', 'Chi mua rau, củ tại chợ'], ['chi-6', 'PC2609-0240', '29/09/2026', 'Chi mua rau, củ tại chợ'],
  ['unc-1', 'UNC2610-0256', '05/10/2026', 'Trả tiền nhà cung cấp thịt bò'], ['unc-8', 'UNC2609-0236', '25/09/2026', 'Trả tiền thuê mặt bằng tháng 10'],
  ['unc-7', 'UNC2609-0237', '26/09/2026', 'Trả tiền nhà cung cấp thịt bò'], ['chi-8', 'PC2609-0236', '26/09/2026', 'Chi tiền gas tháng 10'],
  ['chi-0', 'PC2610-0259', '07/10/2026', 'Chi tiền điện tháng 9'], ['unc-2', 'UNC2610-0252', '03/10/2026', 'Trả tiền thuê mặt bằng tháng 10'],
  ['chi-5', 'PC2609-0243', '30/09/2026', 'Chi tiền gas tháng 10'], ['unc-5', 'UNC2609-0244', '28/09/2026', 'Nộp thuế GTGT tháng 9'],
  ['chi-cpb', 'PC2610-0261', '07/10/2026', 'Tiền nhà 6 tháng', 'Phố Mây Lê Lợi'],   // phiếu chi mẫu Chi phí chờ phân bổ ở tien/index.ts, thẻ theo cửa hàng của phiếu (T168)
] as [string, string, string, string, string?][]).map(([id, soCt, ngayCt, ghiChuCt, cn]) => ({ _goc: `/app/tien/2-1-1/${id}`, soCt, ngayCt, ghiChuCt, ...(cn ? { cn } : {}) }))

/** Thẻ chi phí phân bổ mẫu: [số thẻ, loại, ngày ghi tăng, các dòng [mã, tên, số tiền, số tháng, thêm?]]; thêm: số lượng (CCDC), số hiệu, mô tả (TSCĐ) */
const THE_MAU = ([
  ['TPB2601-0001', 'Công cụ dụng cụ', '05/01/2026', [['CCDC0001', 'Bộ nồi inox 50 lít', 24_600_000, 12]]],
  ['TPB2606-0002', 'Công cụ dụng cụ', '20/06/2026', [['CCDC0002', 'Bàn ghế gỗ khu ngoài trời', 86_400_000, 24]]],
  ['TPB2608-0003', 'Công cụ dụng cụ', '01/08/2026', [['CCDC0003', 'Máy POS cầm tay', 31_800_000, 18], ['CCDC0004', 'Máy xay sinh tố công nghiệp', 18_900_000, 12]]],
  ['TPB2607-0004', 'Chi phí trả trước', '01/07/2026', [['TT001', 'Tiền thuê mặt bằng trả trước 6 tháng', 594_000_000, 6]]],
  ['TPB2601-0005', 'Chi phí trả trước', '01/01/2026', [['TT002', 'Phí bản quyền phần mềm năm 2026', 18_000_000, 12]]],
  ['TPB2602-0006', 'Chi phí trả trước', '01/02/2026', [['TT003', 'Bảo hiểm cháy nổ 6 tháng', 12_000_000, 6]]],
  ['TPB2611-0007', 'Công cụ dụng cụ', '05/11/2026', [['CCDC0005', 'Dao thớt bếp trọn bộ', 9_600_000, 12]]],
  // Thẻ nhiều dòng chi tiết phân bổ, mỗi loại một thẻ
  ['TPB2609-0008', 'Chi phí trả trước', '01/09/2026', [['CPTT.0001', 'Tiền thuê kho lạnh 6 tháng', 54_000_000, 6], ['CPTT.0002', 'Bảo hiểm cháy nổ cửa hàng 12 tháng', 24_000_000, 12],
    ['CPTT.0003', 'Phí phần mềm bán hàng 12 tháng', 14_400_000, 12]]],
  ['TPB2609-0009', 'Công cụ dụng cụ', '15/09/2026', [['CCDC0006', 'Ly thuỷ tinh 300ml', 7_200_000, 12, { sl: 240 }], ['CCDC0008', 'Khay inox chữ nhật', 4_800_000, 6, { sl: 40 }],
    ['CCDC0007', 'Tủ mát 2 cánh', 28_500_000, 24, { sl: 1 }]]],
  ['TPB2610-0010', 'Tài sản cố định', '01/10/2026', [
    ['TSCD.0001', 'Máy rửa chén công nghiệp', 186_000_000, 60, { soHieu: 'MRC-2026-01', moTa: 'Máy rửa chén băng chuyền, 1.000 đĩa mỗi giờ, đặt tại bếp Lê Lợi' }],
    ['TSCD.0002', 'Hệ thống hút khói bếp', 124_000_000, 60, { soHieu: 'HK-LL-02', moTa: 'Chụp hút inox 6m, quạt ly tâm, ống dẫn ra mái' }]]],
  ['TPB2610-0011', 'Chi phí trả trước', '07/10/2026', [['CPTT.0004', 'Tiền nhà 6 tháng', 72_000_000, 6]]],   // tạo từ phiếu chi PC2610-0261 (T168)
  // Thẻ dư đầu kỳ (T284): ghi tăng 31/12/2025, trước ngày đầu năm; da, kyDa là phần đã phân bổ trước khi dùng phần mềm, phân bổ tiếp từ 01/01/2026.
  // Thông tin mua gõ tay (không có chứng từ gốc trong phần mềm)
  ['TPBDK2512-0001', 'Chi phí trả trước', '31/12/2025', [['CPTT.0005', 'Tiền thuê kho tổng 24 tháng', 120_000_000, 24, { da: 60_000_000, kyDa: 12 }]],
    { soCt: 'PC2501-0035', ngayCt: '02/01/2025', ghiChuCt: 'Trả trước tiền thuê kho tổng 2 năm' }],
  ['TPBDK2512-0002', 'Công cụ dụng cụ', '31/12/2025', [['CCDC0001', 'Bộ nồi inox 50 lít', 36_000_000, 24, { sl: 2, da: 9_000_000, kyDa: 6 }],
    ['CCDC0004', 'Máy xay sinh tố công nghiệp', 14_400_000, 12, { sl: 1, da: 7_200_000, kyDa: 6 }]],
    { soCt: 'MH2506-0042', ngayCt: '28/06/2025', ghiChuCt: 'Mua dụng cụ bếp mở cửa hàng Thảo Điền' }],
  ['TPBDK2512-0003', 'Tài sản cố định', '31/12/2025', [['TSCD.0003', 'Lò nướng đối lưu', 96_000_000, 36, { da: 32_000_000, kyDa: 12, soHieu: 'LN-TD-01', moTa: 'Lò nướng đối lưu 10 khay, đặt tại bếp Thảo Điền' }]],
    { soCt: 'MH2501-0008', ngayCt: '06/01/2025', ghiChuCt: 'Mua lò nướng cho bếp bánh' }],
] as [string, string, string, [string, string, number, number, { sl?: number; soHieu?: string; moTa?: string; da?: number; kyDa?: number }?][], { soCt: string; ngayCt: string; ghiChuCt: string }?][]).map(([soThe, loai, ngay, dong, mua], i) => {
  const dau = soThe.startsWith('TPBDK'), ngayPb = dau ? '01/01/2026' : ngay
  return {
    soThe, loai, ngay, ngayPb, _kieu: dau ? 'dau' : 'the', cn: CUA_HANG[i % CUA_HANG.length].ten, ...(dau ? mua : GOC_MAU[i]),
    dong: dong.map(([ma, ten, gt, ky, them]) => ({ ma, ten, dvt: CCDC_HANG.find(h => h.ma === ma)?.dvt, gt, ky, sl: them?.sl ?? 1, dg: gt / (them?.sl ?? 1), ngayPb,
      da: them?.da, kyDa: them?.kyDa, soHieu: them?.soHieu, moTa: them?.moTa, _maTay: true })),
  }
})

/** Số thẻ mẫu trỏ về phiếu chi gốc (_goc), để phiếu hiện dòng Thẻ chi phí và xoá phiếu thì xoá thẻ (T436) */
export const theMauTheoGoc = (goc: string): string[] => THE_MAU.filter(t => '_goc' in t && t._goc === goc).map(t => t.soThe)

/** dd/mm/yyyy -> yyyymm; kỳ liền trước của yyyymm */
const thangCua = (d: string) => { const [, m, y] = d.split('/').map(Number); return y * 100 + m }
const kyTruoc = (ky: number) => ky % 100 === 1 ? ky - 89 : ky - 1

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '8.1.1': 'Danh sách thẻ chi phí', '8.1.2': 'Tăng, giảm CCDC', '8.1.3': 'Kiểm kê CCDC' }

const ccdc: ModuleDef = {
  key: 'ccdc', ten: 'Chi phí phân bổ', ngan: 'Chi phí phân bổ', icon: 'phanbo', mod: 7,
  mota: 'Công cụ dụng cụ, chi phí trả trước, phân bổ theo kỳ',
  quyTrinh,
  screens: [...tuExcel(7, {
    '8.1.1': { kind: 'catalog', catalog: { them: 'Ghi tăng', nhomLoc: 'loai', nhanLoc: 'Loại thẻ', truong: THE_PHAN_BO, stt: true, kySoLieu: true,
      // Như danh sách chứng từ: phân trang, dòng Tổng, xem nhanh các dòng của thẻ ở khung dưới
      // Ghi tăng bổ sung: tạo thẻ cho các dòng phiếu chi chờ phân bổ còn sót (T159); nút chính Ghi tăng mở form thẻ mới (T421)
      hangLoat: { nhan: 'Ghi tăng bổ sung', nhanChinh: 'Ghi tăng', Form: GhiTangHangLoat },   // nhanChinh: chữ khi là nút chính (gói trên Free, T436)
      useCanhBao: useCanhBaoCho,   // dải cảnh báo khoản chờ phân bổ chưa tạo thẻ, có nút Ghi tăng bổ sung (T287, T421)
      dsChungTu: { cotCong: ['gt', 'kyNay', 'da', 'con'], cotSo: 'soThe', so: r => r.soThe, moTa: r => `(${r.ngay}) — ${r.ten}`, chiTiet: veChiTietThe }, cols: [{ k: 'soThe', t: 'Số thẻ', cls: 'code' }, { k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'loai', t: 'Loại' }, { k: 'ngay', t: 'Ngày ghi tăng' },
      // Phân bổ trong kỳ: số phân bổ đúng tháng đang lọc ở tab Đã phân bổ, thẻ nhiều dòng cộng các dòng (T296)
      { k: 'gt', t: 'Giá trị', num: true }, { k: 'kyNay', t: 'Phân bổ trong kỳ', num: true }, { k: 'da', t: 'Đã phân bổ', num: true }, { k: 'con', t: 'Còn lại', num: true }],
      // Mặc định ẩn thẻ hết phân bổ: chỉ hiện thẻ còn phân bổ ở kỳ này hoặc còn giá trị sau kỳ này
      tich: { nhan: 'Ẩn thẻ hết phân bổ', macDinh: true, loc: r => r.kyNay > 0 || r.con > 0 },
      // Chỉ thẻ ghi tăng tới ngày cuối kỳ số liệu; đã phân bổ tính tới hết kỳ đó
      rows: (_cd, ky) => THE_MAU.filter(t => thangCua(t.ngay) <= ky).map(t => {
        // Mỗi thẻ một hàng: mã, tên dòng đầu; giá trị cộng các dòng
        const gt = t.dong.reduce((s, d) => s + d.gt, 0), da = daPhanBoToiKy(t, ky)
        return { ...t, ma: t.dong[0].ma, ten: t.dong[0].ten + (t.dong.length > 1 ? ` và ${t.dong.length - 1} mục khác` : ''), gt, da, con: gt - da,
          kyNay: da - daPhanBoToiKy(t, kyTruoc(ky)) }
      }) } },
    '8.1.2': { voucher: { prefix: 'DCCC', doiTuong: 'cn', nhan: 'Cửa hàng nhận', them: 'Thêm chứng từ CCDC', dong: 'tien', tien: [2_000_000, 40_000_000],
      dienGiai: ['Điều chuyển bàn ghế sang Thảo Điền', 'Ghi giảm nồi hỏng', 'Ghi tăng máy POS cầm tay'], noCo: [['242', '153', 'Ghi tăng CCDC đang dùng']],
      loai: [
        { k: 'tang', ten: 'Ghi tăng CCDC', icon: 'tool', prefix: 'GTCC', dienGiai: ['Ghi tăng máy POS cầm tay', 'Ghi tăng bộ nồi inox 50 lít'] },
        { k: 'dc', ten: 'Điều chuyển CCDC', icon: 'swap', prefix: 'DCCC', dienGiai: ['Điều chuyển bàn ghế sang Thảo Điền'], noCo: [['242', '242', 'Điều chuyển giữa cửa hàng']] },
        { k: 'giam', ten: 'Ghi giảm CCDC', icon: 'trash', prefix: 'GGCC', dienGiai: ['Ghi giảm nồi hỏng', 'Ghi giảm ly thuỷ tinh vỡ'], noCo: [['6421', '242', 'Phân bổ nốt giá trị còn lại']] },
      ] } },
    '8.1.3': { voucher: { prefix: 'KKCC', doiTuong: 'cn', nhan: 'Cửa hàng', them: 'Thêm phiếu kiểm kê', dong: 'tien', tien: [0, 1_000_000],
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
