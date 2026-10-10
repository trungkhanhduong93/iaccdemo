// Phân hệ Kho hàng: 10 phiếu kế thừa iPOS Inventory đứng đầu, sau đó tính giá vốn, kiểm kê, báo cáo kho
import type { ModuleDef, ScreenDef, VoucherCfg } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { XuatNhapTon } from './XuatNhapTon'
import { congThuc, dinhMucTon, nhapXuat, theKho, tonBanDau, tonTucThoi, soChe } from './data'
import { SO_BO_SUNG } from '../bao-cao/so-bo-sung'
import { mauDieuChinh, mauKiemKe } from './dieu-chinh'

const phieu = (prefix: string, them: string, dienGiai: string[], noCo: VoucherCfg['noCo'], doiTuong: VoucherCfg['doiTuong'] = 'none', nhan?: string): Partial<ScreenDef> =>
  ({ voucher: { prefix, them, dienGiai, noCo, doiTuong, nhan, dong: 'nvl', tien: [0, 0], thue: 0, nguon: 'IVT', soTT58: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá' } })

/** Phiếu kiểm kê (T124): đầu phiếu chọn kho, bảng tồn hệ thống, tồn thực tế, chênh lệch thay số lượng, tiền */
const kiemKe = (p: Partial<ScreenDef>): Partial<ScreenDef> => {
  const v: VoucherCfg = { ...p.voucher!, kiemKe: true }
  return { voucher: { ...v, rowsMau: () => mauKiemKe(v) } }   // phiếu mẫu ghi sẵn phiếu điều chỉnh đã sinh (T126)
}
const KK = kiemKe(phieu('KK', 'Thêm phiếu kiểm kê', ['Kiểm kê cuối tháng Kho bếp Lê Lợi', 'Kiểm kê đột xuất Kho bar Thảo Điền'], [['1381', '152', 'Thiếu chờ xử lý'], ['152', '3381', 'Thừa chờ xử lý']]))

/** Màn Điều chỉnh kho (T126): phiếu xuất, nhập điều chỉnh do phiếu kiểm kê có chênh lệch sinh ra. Ngoài Excel, không mã tính năng nên gói nào cũng có */
const DIEU_CHINH: ScreenDef = {
  slug: 'dieu-chinh', ten: 'Xuất, nhập điều chỉnh', ngan: 'Điều chỉnh kho', nhom: 'Chứng từ', kind: 'voucher',
  voucher: {
    prefix: 'XDC', doiTuong: 'none', dong: 'nvl', tien: [0, 0], thue: 0, dienGiai: ['Điều chỉnh theo kiểm kê'], dieuChinh: true, khongThem: true,
    soTT58: 'Sổ chi tiết vật liệu, dụng cụ, hàng hoá', rowsMau: () => mauDieuChinh(KK.voucher!),
    loai: [
      { k: 'xdc', ten: 'Xuất điều chỉnh', prefix: 'XDC', icon: 'cashout', noCo: [['1381', '152', 'Hàng thiếu khi kiểm kê chờ xử lý']] },
      { k: 'ndc', ten: 'Nhập điều chỉnh', prefix: 'NDC', icon: 'filein', noCo: [['152', '3381', 'Hàng thừa khi kiểm kê chờ xử lý']] },
    ],
  },
}

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '5.1.2': 'Xuất bán POS', '5.1.2-2': 'Xuất bán hàng', '5.1.2-3': 'Xuất huỷ', '5.1.2-4': 'Xuất khác', '5.1.1': 'Nhập khác', '5.1.4': 'Điều chuyển', '9.1.3': 'Công thức chế biến', '5.1.3': 'Chế biến', '5.1.5': 'Công thức sơ chế', '5.1.6': 'Sơ chế', '5.1.7': 'Tính giá vốn', '5.1.8': 'Giá thành đơn giản', '5.1.10': 'Kiểm kê', '5.1.11': 'Bổ sung giá nhập', '5.1.12': 'Tồn kho ban đầu', '5.1.13': 'Định mức tồn' }

const sauKiemKe = (ds: ScreenDef[]) => { const i = ds.findIndex(x => x.slug === '5-1-10'); return [...ds.slice(0, i + 1), DIEU_CHINH, ...ds.slice(i + 1)] }

const kho: ModuleDef = {
  key: 'kho', ten: 'Kho hàng', ngan: 'Kho', icon: 'box', mod: 4,
  mota: 'Phiếu kho lấy từ iPOS Inventory; giá vốn, thẻ kho, tồn kho IACC Cloud tự tính',
  quyTrinh,
  // Màn Điều chỉnh kho đứng ngay sau Kiểm kê (T126)
  screens: sauKiemKe(tuExcel(4, {
    '5.1.2': phieu('XB', 'Thêm phiếu xuất bán POS', ['Xuất kho theo định lượng món bán trong ngày'], [['632', '152', 'Giá vốn xuất bán theo định lượng']], 'cn', 'Chi nhánh'),
    '5.1.2-2': phieu('XBH', 'Thêm phiếu xuất bán hàng', ['Xuất bán nguyên liệu cho đối tác', 'Xuất bán set quà Trung thu'], [['632', '156', 'Giá vốn hàng bán']], 'kh', 'Khách hàng'),
    '5.1.2-3': phieu('XH', 'Thêm phiếu xuất huỷ', ['Huỷ rau héo cuối ngày', 'Huỷ thịt quá hạn bảo quản', 'Huỷ bánh phở hỏng'], [['632', '152', 'Hao hụt, huỷ hàng hỏng']]),
    '5.1.2-4': phieu('XK', 'Thêm phiếu xuất khác', ['Xuất dùng cho bữa ăn nhân viên', 'Xuất làm món thử cho thực đơn mới'], [['6421', '152', 'Xuất dùng nội bộ']], 'nv', 'Người nhận'),
    '5.1.1': phieu('NK', 'Thêm phiếu nhập khác', ['Nhập thừa khi kiểm kê', 'Nhập bán thành phẩm nước dùng'], [['152', '154', 'Nhập kho bán thành phẩm']]),
    '5.1.4': phieu('DCK', 'Thêm phiếu điều chuyển', ['Điều chuyển từ Kho tổng sang Kho bếp Lê Lợi', 'Điều chuyển từ Kho tổng sang Kho bếp Thảo Điền'], [['152', '152', 'Điều chuyển giữa các kho']], 'cn', 'Chi nhánh nhận'),
    '9.1.3': { kind: 'catalog', catalog: congThuc },
    '5.1.3': phieu('QCB', 'Thêm lệnh chế biến', ['Nấu nước dùng phở 200 lít', 'Ướp sườn nướng 40 kg'], [['154', '152', 'Xuất nguyên liệu chế biến'], ['152', '154', 'Nhập bán thành phẩm']]),
    '5.1.5': { kind: 'catalog', catalog: soChe },
    '5.1.6': phieu('QSC', 'Thêm phiếu sơ chế', ['Sơ chế thịt bò nguyên tảng', 'Sơ chế tôm sú bóc vỏ'], [['152', '152', 'Nguyên liệu thô sang nguyên liệu sơ chế']]),
    '5.1.7': { tool: { nut: 'Tính giá vốn tháng 9/2026', mota: 'Tính giá xuất kho bình quân gia quyền cuối kỳ cho từng nguyên vật liệu, từng kho. Cập nhật đơn giá vào phiếu xuất bán POS, xuất huỷ, xuất khác và bút toán giá vốn. Chạy lại được nhiều lần trước khi khoá sổ.',
      caiDat: [['Kỳ tính', 'Tháng 9/2026'], ['Phương pháp', 'Bình quân gia quyền cuối kỳ'], ['Phạm vi', 'Tất cả kho']],
      nhatKy: [['07/10/2026 09:20', 'Tính thử tháng 9/2026: 142 mặt hàng, 5 kho', 'Có 2 mặt hàng tồn âm'], ['01/09/2026 08:45', 'Tháng 8/2026: 138 mặt hàng, 5 kho', 'Xong']] } },
    '5.1.8': { tool: { nut: 'Tính giá thành tháng 9/2026', mota: 'Giá thành món theo công thức chế biến và giá xuất kho bình quân. Dùng cho chuỗi có một cấp chế biến.', caiDat: [['Kỳ tính', 'Tháng 9/2026'], ['Đối tượng', 'Món bán trên FABi']] } },
    '5.1.10': KK,
    '5.1.11': { voucher: { prefix: 'BSG', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm phiếu bổ sung giá', dong: 'nvl', tien: [0, 0], thue: 0, dienGiai: ['Bổ sung giá cho phiếu nhập chưa có giá'], noCo: [['152', '331', 'Bổ sung giá nhập']] } },
    '5.1.12': { kind: 'catalog', catalog: tonBanDau },
    '5.1.13': { kind: 'catalog', catalog: dinhMucTon },
    '5.2.1': { report: { kieu: 'bangke', ...theKho } },
    '5.2.2': { report: { kieu: 'bangke', ...nhapXuat } },
    '5.2.3': { kind: 'custom', comp: XuatNhapTon },
    '5.2.4': { report: { kieu: 'bangke', ...tonTucThoi } },
    '5.2.5': { report: { kieu: 'dinhmuc' } },
    '5.2.6': { report: { kieu: 'dinhmuc' } },
    '5.2.7': { report: { kieu: 'dinhmuc' } },
    '5.2.8': { report: SO_BO_SUNG['5.2.8'] },
  }, NGAN)),
}
export default kho
