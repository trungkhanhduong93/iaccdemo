// Phân hệ Kế toán tổng hợp: chứng từ tổng hợp, cuối kỳ, báo cáo tài chính, báo cáo quản trị
import type { ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { BaoCaoQuanTri, CanDoiKeToan, CanDoiPhatSinh, KetQuaKinhDoanh, LuuChuyenTien } from './BaoCaoTaiChinh'
import { KhoaSo, KiemTraCuoiKy } from './CuoiKy'
import { TEN_TK, soCai } from './so-cai'
import { KHACH, NCC, NVL } from '../../data/mock'
import { k } from '../../ui/format'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '10.1.1': 'Chứng từ tổng hợp', '10.1.2': 'Doanh thu trả trước', '10.1.3': 'Số dư ban đầu', '10.1.4': 'Kiểm tra cuối kỳ', '10.1.5': 'Kết chuyển', '10.1.6': 'Khoá sổ', '10.1.7': 'Kế hoạch tài chính', '10.1.8': 'Kế hoạch sản xuất', '10.1.9': 'Kết chuyển số dư' }

function tach(tong: number, tyLe: number[]) {
  let con = tong
  return tyLe.map((tl, i) => {
    if (i === tyLe.length - 1) return con
    const v = k(tong * tl)
    con -= v
    return v
  })
}

const tongHop: ModuleDef = {
  key: 'tong-hop', ten: 'Kế toán tổng hợp', ngan: 'Tổng hợp', icon: 'book', mod: 9,
  mota: 'Bút toán tổng hợp, cuối kỳ, báo cáo tài chính',
  quyTrinh,
  screens: tuExcel(9, {
    '10.1.1': { voucher: { prefix: 'NVK', doiTuong: 'none', them: 'Thêm chứng từ tổng hợp', dong: 'tien', tien: [3_000_000, 320_000_000],
      dienGiai: ['Phân bổ tiền thuê mặt bằng tháng 9', 'Trích khấu hao TSCĐ tháng 9', 'Kết chuyển thuế GTGT được khấu trừ', 'Hạch toán lương tháng 9'], noCo: [['6421', '242', 'Phân bổ chi phí trả trước']] } },
    '10.1.2': { tool: { nut: 'Phân bổ kỳ 9/2026', mota: 'Phân bổ doanh thu nhận trước (thẻ thành viên nạp tiền, voucher bán trước, tiền đặt tiệc) vào doanh thu theo kỳ sử dụng.',
      caiDat: [['Kỳ', 'Tháng 9/2026'], ['Tài khoản doanh thu chưa thực hiện', '3387']] } },
    '10.1.3': { kind: 'catalog', catalog: { them: 'Thêm số dư', nhomLoc: 'loai',
      cols: [{ k: 'loai', t: 'Loại' }, { k: 'tk', t: 'Số hiệu TK', cls: 'code' }, { k: 'ten', t: 'Tên tài khoản' }, { k: 'ct', t: 'Chi tiết' }, { k: 'sl', t: 'Số lượng', num: true }, { k: 'no', t: 'Dư Nợ', num: true }, { k: 'co', t: 'Dư Có', num: true }],
      rows: () => {
        const m = soCai(8).mo
        const tkRows = Object.keys(m).map(tk => ({ loai: 'Tài khoản', tk, ten: TEN_TK[tk], ct: '', sl: '', no: Math.max(0, m[tk]), co: Math.max(0, -m[tk]) }))
        const khach3 = KHACH.filter(x => x.ma !== 'KL').slice(0, 3)
        const cn131 = tach(m['131'] ?? 0, [0.45, 0.35, 0.2]).map((v, i) => ({
          loai: 'Công nợ', tk: '131', ten: TEN_TK['131'], ct: khach3[i].ten, sl: '', no: Math.max(0, v), co: Math.max(0, -v),
        }))
        const ncc3 = NCC.slice(0, 3)
        const cn331 = tach(m['331'] ?? 0, [0.5, 0.3, 0.2]).map((v, i) => ({
          loai: 'Công nợ', tk: '331', ten: TEN_TK['331'], ct: ncc3[i].ten, sl: '', no: Math.max(0, v), co: Math.max(0, -v),
        }))
        const nvl4 = NVL.slice(0, 4)
        const kho152 = tach(m['152'] ?? 0, [0.45, 0.25, 0.15, 0.15]).map((v, i) => ({
          loai: 'Tồn kho', tk: '152', ten: TEN_TK['152'], ct: `Kho tổng · ${nvl4[i].ten}`, sl: Math.round(v / nvl4[i].gia), no: Math.max(0, v), co: Math.max(0, -v),
        }))
        return [...tkRows, ...cn131, ...cn331, ...kho152]
      } } },
    '10.1.4': { kind: 'custom', comp: KiemTraCuoiKy },
    '10.1.5': { tool: { nut: 'Kết chuyển kỳ 9/2026', mota: 'Kết chuyển doanh thu, giá vốn, chi phí sang tài khoản 911 và kết chuyển lãi lỗ sang 421. Chạy lại được trước khi khoá sổ.',
      caiDat: [['Kỳ', 'Tháng 9/2026'], ['Bộ kết chuyển', 'Mặc định theo chế độ kế toán']] } },
    '10.1.6': { kind: 'custom', comp: KhoaSo },
    '10.1.7': { tool: { nut: 'Lập kế hoạch 2027', mota: 'Lập kế hoạch doanh thu, chi phí, dòng tiền theo tháng và theo chi nhánh. So sánh thực hiện với kế hoạch trên Tổng quan.', caiDat: [['Năm kế hoạch', '2027'], ['Lấy số gốc từ', 'Thực hiện năm 2026']] } },
    '10.1.8': { tool: { nut: 'Lập kế hoạch sản xuất', mota: 'Dự trù số lượng bán thành phẩm cần chế biến theo dự báo bán hàng: nước dùng, sốt, bánh. Từ đó ra nhu cầu nguyên vật liệu.', caiDat: [['Tuần', '12–18/10/2026'], ['Dự báo theo', 'Bình quân 4 tuần gần nhất']] } },
    '10.1.9': { tool: { nut: 'Kết chuyển số dư sang năm 2027', mota: 'Chuyển số dư cuối năm tài chính sang đầu năm mới, kể cả khi đổi chế độ kế toán hoặc tách dữ liệu đơn vị.', caiDat: [['Từ năm', '2026'], ['Sang năm', '2027']] } },
    '10.2.1': { kind: 'custom', comp: CanDoiPhatSinh },
    '10.2.2': { kind: 'custom', comp: CanDoiKeToan },
    '10.2.3': { kind: 'custom', comp: KetQuaKinhDoanh },
    '10.2.4': { kind: 'custom', comp: LuuChuyenTien },
    '10.2.5': { report: { kieu: 'bangke', cols: [{ k: 'muc', t: 'Mục', w: 60 }, { k: 'nd', t: 'Nội dung' }, { k: 'tt', t: 'Trạng thái', w: 140 }],
      rows: () => [['I', 'Đặc điểm hoạt động của doanh nghiệp', 'Đã soạn'], ['II', 'Kỳ kế toán, đơn vị tiền tệ sử dụng', 'Tự điền'], ['III', 'Chuẩn mực và chế độ kế toán áp dụng', 'Tự điền'],
        ['IV', 'Các chính sách kế toán áp dụng', 'Đã soạn'], ['V', 'Thông tin bổ sung cho bảng cân đối kế toán', 'Lấy số từ sổ'], ['VI', 'Thông tin bổ sung cho báo cáo kết quả kinh doanh', 'Lấy số từ sổ'],
        ['VII', 'Thông tin bổ sung cho báo cáo lưu chuyển tiền tệ', 'Lấy số từ sổ'], ['VIII', 'Những thông tin khác', 'Chưa soạn']].map(([muc, nd, tt]) => ({ muc, nd, tt })) } },
    '10.3.1': { kind: 'custom', comp: BaoCaoQuanTri },
  }, NGAN),
}
export default tongHop
