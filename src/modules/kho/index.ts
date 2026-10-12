// Phân hệ Kho hàng: 10 phiếu kế thừa iPOS Inventory đứng đầu, sau đó tính giá vốn, kiểm kê, báo cáo kho
import type { ModuleDef, ReportCfg, ScreenDef, VoucherCfg } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { XuatNhapTon } from './XuatNhapTon'
import { dinhMucTon, nhapXuat, tonBanDau, tonTucThoi } from './data'
import { TheKho } from './TheKho'
import { SO_BO_SUNG } from '../bao-cao/so-bo-sung'
import { mauDieuChinh, mauKiemKe } from './dieu-chinh'
import { PhieuSanXuat } from './PhieuSanXuat'
import { CongThucScreen } from './CongThuc'
import { cauHinhSx, type LoaiSx } from './san-xuat'
import { chiTietKho, tongHopKho, tongHopTra, type NguonPhieu } from './bao-cao'
import { PhieuDieuChuyen } from './PhieuDieuChuyen'
import { DCN, cauHinhDcn, phieuMauDcn, type LoaiDcn } from './dieu-chuyen'
import banHang from '../ban-hang'
import muaHang from '../mua-hang'

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

/** Sản xuất theo iPOS Inventory (T152): bốn tab phiếu xuất, nhập sơ chế và chế biến, hai màn công thức.
 *  Phiếu nhập không có mã Excel riêng, mở theo gói của phiếu xuất cùng loại */
const phieuSx = (loai: LoaiSx, ten: string, icon: string): Partial<ScreenDef> => ({ ten, icon, kind: 'custom', comp: PhieuSanXuat, voucher: cauHinhSx(loai) })
const NHAP_SC: ScreenDef = { slug: '5-1-6-2', can: ['5.1.6'], ngan: 'Nhập sơ chế', nhom: 'Chứng từ', ...phieuSx('nsc', 'Nhập sơ chế', 'chef'), kind: 'custom' }
const NHAP_CB: ScreenDef = { slug: '5-1-3-2', can: ['5.1.3'], ngan: 'Nhập chế biến', nhom: 'Chứng từ', ...phieuSx('ncb', 'Nhập chế biến', 'flask'), kind: 'custom' }
/** Thứ tự tab như IVT: Xuất sơ chế, Nhập sơ chế, Xuất chế biến, Nhập chế biến, Công thức sơ chế, Công thức chế biến; đứng ở chỗ Công thức chế biến cũ */
const SAN_XUAT = ['5-1-6', '5-1-6-2', '5-1-3', '5-1-3-2', '5-1-5', '9-1-3']
const xepSanXuat = (ds: ScreenDef[]) => {
  const i = ds.findIndex(x => x.slug === '9-1-3')
  const gom = [...ds, NHAP_SC, NHAP_CB]
  const sx = SAN_XUAT.map(sl => gom.find(x => x.slug === sl)).filter((x): x is ScreenDef => Boolean(x))
  const con = ds.filter(x => !SAN_XUAT.includes(x.slug))
  return [...con.slice(0, i), ...sx, ...con.slice(i)]
}

/** Điều chuyển theo iPOS Inventory (T155): tab Điều chuyển cũ tách thành Xuất điều chuyển (mã Excel 5.1.4), Nhập điều chuyển, Chuyển kho.
 *  Hai tab sau không có mã Excel riêng, mở theo gói của 5.1.4, đứng liền sau Xuất điều chuyển */
const phieuDcn = (loai: LoaiDcn, icon: string): Partial<ScreenDef> => ({ ten: DCN[loai].ten, icon, kind: 'custom', comp: PhieuDieuChuyen, voucher: cauHinhDcn(loai) })
const NHAP_DC: ScreenDef = { slug: '5-1-4-2', can: ['5.1.4'], ngan: 'Nhập điều chuyển', nhom: 'Chứng từ', ...phieuDcn('ndc', 'filein'), kind: 'custom' }
const CHUYEN_KHO: ScreenDef = { slug: '5-1-4-3', can: ['5.1.4'], ngan: 'Chuyển kho', nhom: 'Chứng từ', ...phieuDcn('ck', 'swap'), kind: 'custom' }
const sauDieuChuyen = (ds: ScreenDef[]) => { const i = ds.findIndex(x => x.slug === '5-1-4'); return [...ds.slice(0, i + 1), NHAP_DC, CHUYEN_KHO, ...ds.slice(i + 1)] }

/** Báo cáo nhập, xuất, hàng trả ngoài Excel (T157): đọc phiếu của các màn chứng từ lúc vẽ báo cáo; gói Standard, Plus, Pro, mọi thông tư.
 *  Nhập, xuất điều chuyển đọc phiếu mẫu của màn điều chuyển, bỏ phiếu đã huỷ; chuyển kho không vào báo cáo nhập, xuất (T155).
 *  Mã trên đường dẫn 5-2-9 tới 5-2-14 là khoá cấu hình mẫu trong bao-cao/danh-sach.ts */
const phieuCua = (m: ModuleDef, ma: string, loai: string): NguonPhieu => {
  const sc = m.screens.find(x => x.code === ma)!
  return { loai, cfg: sc.voucher!, seed: ma, di: `${m.key}/${sc.slug}` }
}
const phieuDc = (loai: LoaiDcn): NguonPhieu => ({ loai: DCN[loai].ten, cfg: cauHinhDcn(loai), seed: DCN[loai].man, di: DCN[loai].man, ds: () => phieuMauDcn(loai) })
const NHAP = () => [phieuCua(muaHang, '4.1.1', 'Nhập mua'), phieuCua(kho, '5.1.1', 'Nhập khác'), phieuCua(banHang, '3.1.4', 'Khách trả lại'), phieuDc('ndc')]
const XUAT = () => [phieuCua(kho, '5.1.2', 'Xuất bán POS'), phieuCua(kho, '5.1.2-2', 'Xuất bán hàng'), phieuCua(kho, '5.1.2-3', 'Xuất huỷ'),
  phieuCua(kho, '5.1.2-4', 'Xuất khác'), phieuDc('xdc'), phieuCua(muaHang, '4.1.4', 'Trả nhà cung cấp')]
const TRA = () => [phieuCua(banHang, '3.1.4', 'Khách trả lại'), phieuCua(muaHang, '4.1.4', 'Trả nhà cung cấp')]
const baoCaoMoi = (slug: string, ten: string, report: Omit<ReportCfg, 'kieu'>): ScreenDef =>
  ({ slug, ten, nhom: 'Sổ sách, báo cáo', kind: 'report', goi: ['S', 'PL', 'PR'], report: { kieu: 'bangke', theoCn: true, ...report } })
const BAO_CAO_MOI = [
  baoCaoMoi('5-2-9', 'Tổng hợp nhập kho', tongHopKho(NHAP, ['Nhập mua', 'Nhập khác', 'Khách trả lại', 'Nhập điều chuyển'])), baoCaoMoi('5-2-10', 'Chi tiết nhập kho', chiTietKho(NHAP)),
  baoCaoMoi('5-2-11', 'Tổng hợp xuất kho', tongHopKho(XUAT, ['Xuất bán POS', 'Xuất bán hàng', 'Xuất huỷ', 'Xuất khác', 'Xuất điều chuyển', 'Trả nhà cung cấp'])), baoCaoMoi('5-2-12', 'Chi tiết xuất kho', chiTietKho(XUAT)),
  baoCaoMoi('5-2-13', 'Tổng hợp hàng trả lại', tongHopTra(TRA)), baoCaoMoi('5-2-14', 'Chi tiết hàng trả lại', chiTietKho(TRA)),
]

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '5.1.2': 'Xuất bán POS', '5.1.2-2': 'Xuất bán hàng', '5.1.2-3': 'Xuất huỷ', '5.1.2-4': 'Xuất khác', '5.1.1': 'Nhập khác', '5.1.4': 'Xuất điều chuyển', '9.1.3': 'Công thức chế biến', '5.1.3': 'Xuất chế biến', '5.1.5': 'Công thức sơ chế', '5.1.6': 'Xuất sơ chế', '5.1.7': 'Tính giá vốn', '5.1.8': 'Giá thành đơn giản', '5.1.10': 'Kiểm kê', '5.1.11': 'Bổ sung giá nhập', '5.1.12': 'Tồn kho ban đầu', '5.1.13': 'Định mức tồn' }

const sauKiemKe = (ds: ScreenDef[]) => { const i = ds.findIndex(x => x.slug === '5-1-10'); return [...ds.slice(0, i + 1), DIEU_CHINH, ...ds.slice(i + 1)] }

const kho: ModuleDef = {
  key: 'kho', ten: 'Kho hàng', ngan: 'Kho', icon: 'box', mod: 4,
  mota: 'Phiếu kho lấy từ iPOS Inventory; giá vốn, thẻ kho, tồn kho IACC Cloud tự tính',
  quyTrinh,
  // Màn Điều chỉnh kho đứng ngay sau Kiểm kê (T126); nhóm sản xuất xếp theo IVT (T152); ba tab điều chuyển liền nhau (T155)
  screens: [...sauKiemKe(xepSanXuat(sauDieuChuyen(tuExcel(4, {
    '5.1.2': phieu('XB', 'Thêm phiếu xuất bán POS', ['Xuất kho theo định lượng món bán trong ngày'], [['632', '152', 'Giá vốn xuất bán theo định lượng']], 'cn', 'Chi nhánh'),
    '5.1.2-2': phieu('XBH', 'Thêm phiếu xuất bán hàng', ['Xuất bán nguyên liệu cho đối tác', 'Xuất bán set quà Trung thu'], [['632', '156', 'Giá vốn hàng bán']], 'kh', 'Khách hàng'),
    '5.1.2-3': phieu('XH', 'Thêm phiếu xuất huỷ', ['Huỷ rau héo cuối ngày', 'Huỷ thịt quá hạn bảo quản', 'Huỷ bánh phở hỏng'], [['632', '152', 'Hao hụt, huỷ hàng hỏng']]),
    '5.1.2-4': phieu('XK', 'Thêm phiếu xuất khác', ['Xuất dùng cho bữa ăn nhân viên', 'Xuất làm món thử cho thực đơn mới'], [['6421', '152', 'Xuất dùng nội bộ']], 'nv', 'Người nhận'),
    '5.1.1': phieu('NK', 'Thêm phiếu nhập khác', ['Nhập thừa khi kiểm kê', 'Nhập bán thành phẩm nước dùng'], [['152', '154', 'Nhập kho bán thành phẩm']]),
    '5.1.4': phieuDcn('xdc', 'truck'),
    '9.1.3': { kind: 'custom', comp: CongThucScreen, icon: 'book' },
    '5.1.3': phieuSx('xcb', 'Xuất chế biến', 'flask'),
    '5.1.5': { kind: 'custom', comp: CongThucScreen, icon: 'book' },
    '5.1.6': phieuSx('xsc', 'Xuất sơ chế', 'chef'),
    '5.1.7': { tool: { nut: 'Tính giá vốn tháng 9/2026', mota: 'Tính giá xuất kho bình quân gia quyền cuối kỳ cho từng nguyên vật liệu, từng kho. Cập nhật đơn giá vào phiếu xuất bán POS, xuất huỷ, xuất khác và bút toán giá vốn. Chạy lại được nhiều lần trước khi khoá sổ.',
      caiDat: [['Kỳ tính', 'Tháng 9/2026'], ['Phương pháp', 'Bình quân gia quyền cuối kỳ'], ['Phạm vi', 'Tất cả kho']],
      nhatKy: [['07/10/2026 09:20', 'Tính thử tháng 9/2026: 142 mặt hàng, 5 kho', 'Có 2 mặt hàng tồn âm'], ['01/09/2026 08:45', 'Tháng 8/2026: 138 mặt hàng, 5 kho', 'Xong']] } },
    '5.1.8': { tool: { nut: 'Tính giá thành tháng 9/2026', mota: 'Giá thành món theo công thức chế biến và giá xuất kho bình quân. Dùng cho chuỗi có một cấp chế biến.', caiDat: [['Kỳ tính', 'Tháng 9/2026'], ['Đối tượng', 'Món bán trên FABi']] } },
    '5.1.10': KK,
    '5.1.11': { voucher: { prefix: 'BSG', doiTuong: 'ncc', nhan: 'Nhà cung cấp', them: 'Thêm phiếu bổ sung giá', dong: 'nvl', tien: [0, 0], thue: 0, dienGiai: ['Bổ sung giá cho phiếu nhập chưa có giá'], noCo: [['152', '331', 'Bổ sung giá nhập']] } },
    '5.1.12': { kind: 'catalog', catalog: tonBanDau },
    '5.1.13': { kind: 'catalog', catalog: dinhMucTon },
    '5.2.1': { kind: 'custom', comp: TheKho },   // đọc mặt hàng, kho, kỳ trên đường dẫn khi mở từ xuất nhập tồn (T157)
    '5.2.2': { report: { kieu: 'bangke', ...nhapXuat } },
    '5.2.3': { kind: 'custom', comp: XuatNhapTon },
    '5.2.4': { report: { kieu: 'bangke', ...tonTucThoi } },
    '5.2.5': { report: { kieu: 'dinhmuc' } },
    '5.2.6': { report: { kieu: 'dinhmuc' } },
    '5.2.7': { report: { kieu: 'dinhmuc' } },
    '5.2.8': { report: SO_BO_SUNG['5.2.8'] },
  }, NGAN)))), ...BAO_CAO_MOI],
}
export default kho
