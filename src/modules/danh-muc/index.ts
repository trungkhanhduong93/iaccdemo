// Phân hệ Danh mục: 16 danh mục theo Excel mục 1
import { createElement } from 'react'
import type { Col, ModuleDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { kieuGhiSo } from '../../app/plan'
import { CHI_NHANH, HANG, KHACH, KHO, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { tkCot, TAI_KHOAN } from './data'
import { Note } from '../../ui/Page'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '1.1': 'Tài khoản', '1.2': 'Hàng hoá', '1.3': 'Đơn vị tính', '1.4': 'Quy đổi ĐVT', '1.5': 'Đối tượng', '1.6': 'Mục chi phí', '1.7': 'Công việc', '1.8': 'Kho', '1.9': 'Tiền tệ', '1.10': 'Tỷ giá', '1.11': 'Loại thuế', '1.12': 'Quỹ tiền', '1.13': 'Tài sản cố định', '1.14': 'Bảng giá', '1.15': 'Bút toán tự động', '1.16': 'Lý do' }

const danhMuc: ModuleDef = {
  key: 'danh-muc', ten: 'Danh mục', ngan: 'Danh mục', icon: 'folder', mod: 0,
  mota: 'Hàng hoá, đối tượng, kho, tài khoản lấy từ FABi và iPOS Inventory',
  quyTrinh,
  screens: tuExcel(0, {
    '1.1': { catalog: { them: 'Thêm tài khoản', nhomLoc: 'loai', cols: [{ k: 'so', t: 'Số tài khoản', cls: 'code', w: 120 }, { k: 'ten', t: 'Tên tài khoản' },
      { k: 'loai', t: 'Loại' }, { k: 'tc', t: 'Tính chất' }, { k: 'ct', t: 'Theo dõi chi tiết', cls: 'dim' }], rows: () => TAI_KHOAN } },
    '1.2': { catalog: {
      them: 'Thêm hàng hoá', nhomLoc: 'nhom',
      cols: goi => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên hàng hoá' }, { k: 'nhom', t: 'Nhóm' }, { k: 'dvt', t: 'ĐVT' },
        { k: 'gia', t: 'Giá bán', num: true }, { k: 'ts', t: 'Thuế suất', num: true, r: r => r.ts ? `${r.ts}%` : 'KCT' },
        ...(kieuGhiSo(goi) === 'noco' ? [tkCot('tkDt', 'TK doanh thu'), tkCot('tkGv', 'TK giá vốn'), tkCot('tkKho', 'TK kho')] : [])],
      rows: () => [
        ...HANG.map(h => ({ ...h, tkDt: '5111', tkGv: '632', tkKho: '156' })),
        { ma: 'BUN02', ten: 'Bún bò Huế', nhom: 'Món mới tháng 10', dvt: 'Tô', gia: 69000, ts: 8, tkDt: '', tkGv: '', tkKho: '' },
        { ma: 'MI01', ten: 'Mì Quảng tôm thịt', nhom: 'Món mới tháng 10', dvt: 'Tô', gia: 65000, ts: 8, tkDt: '', tkGv: '', tkKho: '' },
        ...NVL.map(h => ({ ...h, gia: 0, tkDt: '', tkGv: '632', tkKho: '152' })),
      ],
    } },
    '1.3': { catalog: { them: 'Thêm đơn vị tính', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên đơn vị tính' }, { k: 'mota', t: 'Mô tả', cls: 'dim' }],
      rows: () => [['TO', 'Tô', 'Món nước'], ['PHAN', 'Phần', 'Món ăn'], ['DIA', 'Dĩa', 'Món cơm'], ['LY', 'Ly', 'Đồ uống pha chế'], ['LON', 'Lon', 'Bia, nước ngọt'],
        ['CHAI', 'Chai', 'Nước suối, rượu'], ['KG', 'kg', 'Nguyên liệu tươi'], ['G', 'g', 'Định lượng công thức'], ['L', 'Lít', 'Dầu ăn, sữa tươi'], ['ML', 'ml', 'Định lượng pha chế'],
        ['THUNG', 'Thùng', 'Đóng gói nhập hàng'], ['HOP', 'Hộp', 'Đồ hộp'], ['CAI', 'Cái', 'Công cụ dụng cụ']].map(([ma, ten, mota]) => ({ ma, ten, mota })) } },
    '1.4': { catalog: { them: 'Thêm quy đổi', cols: [{ k: 'hang', t: 'Hàng hoá' }, { k: 'goc', t: 'ĐVT gốc', c: true }, { k: 'qd', t: 'ĐVT quy đổi', c: true }, { k: 'tl', t: 'Tỷ lệ', num: true }, { k: 'dung', t: 'Dùng khi', cls: 'dim' }],
      rows: () => [['Bia Sài Gòn lon', 'Lon', 'Thùng', 24, 'Nhập hàng'], ['Sữa đặc', 'Lon', 'Thùng', 48, 'Nhập hàng'], ['Thịt bò thăn', 'g', 'kg', 1000, 'Nhập hàng, kiểm kê'],
        ['Dầu ăn', 'Lít', 'Can 5 lít', 5, 'Nhập hàng'], ['Cà phê hạt Robusta', 'kg', 'Bao 25 kg', 25, 'Nhập hàng'], ['Bánh phở tươi', 'g', 'kg', 1000, 'Định lượng công thức']]
        .map(([hang, goc, qd, tl, dung]) => ({ hang, goc, qd, tl, dung })) } },
    '1.5': { catalog: { them: 'Thêm đối tượng', nhomLoc: 'loai', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'loai', t: 'Loại' }, { k: 'mst', t: 'Mã số thuế' }, { k: 'nhom', t: 'Nhóm', cls: 'dim' }],
      rows: () => [...KHACH.map(x => ({ ...x, loai: 'Khách hàng' })), ...NCC.map(x => ({ ...x, loai: 'Nhà cung cấp' })), ...NHAN_VIEN.map(x => ({ ...x, mst: '', nhom: x.bp, loai: 'Nhân viên' }))] } },
    '1.6': { catalog: { them: 'Thêm mục chi phí', nhomLoc: 'nhom', cols: goi => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Mục chi phí' }, { k: 'nhom', t: 'Nhóm' }, ...(kieuGhiSo(goi) === 'noco' ? [{ k: 'tk', t: 'TK chi phí', cls: 'code' } as Col] : [])],
      rows: () => [['CP01', 'Lương nhân viên bếp', 'Nhân công', '6421'], ['CP02', 'Lương phục vụ, thu ngân', 'Nhân công', '6421'], ['CP03', 'Lương văn phòng', 'Nhân công', '6422'],
        ['CP04', 'Thuê mặt bằng', 'Mặt bằng', '6421'], ['CP05', 'Điện', 'Điện, nước, gas', '6421'], ['CP06', 'Nước', 'Điện, nước, gas', '6421'], ['CP07', 'Gas', 'Điện, nước, gas', '6421'],
        ['CP08', 'Hoa hồng app giao đồ ăn', 'Bán hàng', '6421'], ['CP09', 'Quảng cáo, khuyến mãi', 'Bán hàng', '6421'], ['CP10', 'Sửa chữa, bảo trì', 'Khác', '6422'], ['CP11', 'Văn phòng phẩm', 'Khác', '6422']]
        .map(([ma, ten, nhom, tk]) => ({ ma, ten, nhom, tk })) } },
    '1.7': { catalog: { them: 'Thêm công việc', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Công việc' }, { k: 'nhom', t: 'Nhóm' }, { k: 'pt', t: 'Phụ trách' }, { k: 'tg', t: 'Thời gian', cls: 'dim' }],
      rows: () => [['CV01', 'Khai trương chi nhánh Thảo Điền', 'Mở rộng', 'Nguyễn Minh Anh', '06–08/2026'], ['CV02', 'Sự kiện Trung thu 2026', 'Marketing', 'Phạm Ngọc Lan', '09/2026'],
        ['CV03', 'Cải tạo bếp Lê Lợi', 'Sửa chữa lớn', 'Võ Thanh Tùng', '10–11/2026'], ['CV04', 'Tiệc cuối năm khách công ty', 'Bán hàng', 'Phạm Ngọc Lan', '12/2026']]
        .map(([ma, ten, nhom, pt, tg]) => ({ ma, ten, nhom, pt, tg })) } },
    '1.8': { catalog: { them: 'Thêm kho', cols: [{ k: 'ma', t: 'Mã kho', cls: 'code' }, { k: 'ten', t: 'Tên kho' }, { k: 'cn', t: 'Chi nhánh' }, { k: 'loai', t: 'Loại' }, { k: 'tk', t: 'Thủ kho', cls: 'dim' }],
      rows: () => KHO.map((ten, i) => ({ ma: `K${String(i + 1).padStart(2, '0')}`, ten, cn: CHI_NHANH.find(c => c.kho.includes(ten))?.ten ?? 'Văn phòng', loai: ten.includes('bar') ? 'Kho pha chế' : ten.includes('tổng') ? 'Kho tổng' : 'Kho bếp', tk: 'Võ Thanh Tùng' })),
      note: goi => goi === 'F' ? createElement(Note, { kind: 'gray', icon: 'info', children: 'Gói Free dùng các kho nhận từ FABi và iPOS Inventory, không tạo thêm kho mới.' }) : null } },
    '1.9': { catalog: { them: 'Thêm tiền tệ', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên tiền tệ' }, { k: 'kh', t: 'Ký hiệu', c: true }, { k: 'le', t: 'Số lẻ', num: true }],
      rows: () => [['VND', 'Đồng Việt Nam', 'đ', 0], ['USD', 'Đô la Mỹ', '$', 2], ['EUR', 'Euro', '€', 2], ['JPY', 'Yên Nhật', '¥', 0]].map(([ma, ten, kh, le]) => ({ ma, ten, kh, le: String(le) })) } },
    '1.10': { catalog: { them: 'Thêm tỷ giá', cols: [{ k: 'ngay', t: 'Ngày' }, { k: 'tt', t: 'Tiền tệ', cls: 'code' }, { k: 'mua', t: 'Tỷ giá mua', num: true }, { k: 'ban', t: 'Tỷ giá bán', num: true }, { k: 'nguon', t: 'Nguồn', cls: 'dim' }],
      rows: () => [['07/10/2026', 'USD', 26280, 26640], ['07/10/2026', 'EUR', 30410, 31950], ['06/10/2026', 'USD', 26270, 26630], ['06/10/2026', 'EUR', 30390, 31930], ['30/09/2026', 'USD', 26250, 26610]]
        .map(([ngay, tt, mua, ban]) => ({ ngay, tt, mua, ban, nguon: 'Ngân hàng giao dịch chính' })) } },
    '1.11': { catalog: { them: 'Thêm loại thuế', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'ts', t: 'Thuế suất', num: true }, { k: 'gc', t: 'Áp dụng', cls: 'dim' }],
      rows: () => [['GTGT0', 'Thuế GTGT 0%', '0%', 'Hàng xuất khẩu'], ['GTGT5', 'Thuế GTGT 5%', '5%', 'Nước sạch, một số nông sản'], ['GTGT8', 'Thuế GTGT 8%', '8%', 'Dịch vụ ăn uống được giảm thuế'],
        ['GTGT10', 'Thuế GTGT 10%', '10%', 'Bia, rượu và hàng hoá khác'], ['KCT', 'Không chịu thuế', '—', 'Rau, thịt tươi sống chưa chế biến'], ['KKKNT', 'Không kê khai, tính nộp', '—', 'Khoản thu hộ']]
        .map(([ma, ten, ts, gc]) => ({ ma, ten, ts, gc })) } },
    '1.12': { catalog: { them: 'Thêm quỹ', nhomLoc: 'loai', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên quỹ' }, { k: 'loai', t: 'Loại' }, { k: 'stk', t: 'Số tài khoản' }, { k: 'cn', t: 'Chi nhánh', cls: 'dim' }],
      rows: () => [...CHI_NHANH.map((c, i) => ({ ma: `TM0${i + 1}`, ten: `Quỹ tiền mặt ${c.ngan}`, loai: 'Tiền mặt', stk: '', cn: c.ten })),
        { ma: 'NH01', ten: 'Vietcombank, chi nhánh Sài Gòn', loai: 'Ngân hàng', stk: '0071 0012 3456', cn: 'Tất cả' },
        { ma: 'NH02', ten: 'Techcombank, nhận tiền QR', loai: 'Ngân hàng', stk: '1903 6655 8899', cn: 'Tất cả' }] } },
    '1.13': { catalog: { them: 'Thêm tài sản', cols: [{ k: 'ma', t: 'Mã TS', cls: 'code' }, { k: 'ten', t: 'Tên tài sản' }, { k: 'loai', t: 'Loại' }, { k: 'ngay', t: 'Ngày ghi tăng' }, { k: 'ng', t: 'Nguyên giá', num: true }, { k: 'kh', t: 'Số tháng khấu hao', num: true }],
      rows: () => [['TS001', 'Hệ thống bếp công nghiệp Lê Lợi', 'Máy móc thiết bị', '01/03/2024', 486_000_000, 60], ['TS002', 'Tủ đông 1.500 lít', 'Máy móc thiết bị', '15/05/2024', 92_500_000, 60],
        ['TS003', 'Máy pha cà phê La Marzocco', 'Máy móc thiết bị', '01/07/2025', 268_000_000, 60], ['TS004', 'Hệ thống điều hoà Thảo Điền', 'Máy móc thiết bị', '20/06/2026', 214_800_000, 72],
        ['TS005', 'Xe tải giao hàng 1,5 tấn', 'Phương tiện vận tải', '10/01/2025', 545_000_000, 96]].map(([ma, ten, loai, ngay, ng, kh]) => ({ ma, ten, loai, ngay, ng, kh })) } },
    '1.14': { catalog: { them: 'Thêm bảng giá', nhomLoc: 'loai', cols: [{ k: 'ten', t: 'Hàng hoá' }, { k: 'dvt', t: 'ĐVT' }, { k: 'loai', t: 'Loại giá' }, { k: 'gia', t: 'Giá', num: true }, { k: 'tu', t: 'Áp dụng từ' }, { k: 'cn', t: 'Chi nhánh', cls: 'dim' }],
      rows: () => [...HANG.map(h => ({ ten: h.ten, dvt: h.dvt, loai: 'Giá bán', gia: h.gia, tu: '01/09/2026', cn: 'Tất cả' })), ...NVL.slice(0, 8).map(h => ({ ten: h.ten, dvt: h.dvt, loai: 'Giá mua', gia: h.gia, tu: '01/10/2026', cn: 'Kho tổng' }))] } },
    '1.15': { catalog: { them: 'Thêm bút toán', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Nghiệp vụ' }, { k: 'no', t: 'TK Nợ', cls: 'code', c: true }, { k: 'co', t: 'TK Có', cls: 'code', c: true }, { k: 'dk', t: 'Điều kiện', cls: 'dim' }],
      rows: () => [['BT01', 'Doanh thu bán hàng thu tiền mặt', '1111', '5111', 'Thanh toán tiền mặt trên FABi'], ['BT02', 'Doanh thu thu qua QR, chuyển khoản', '1121', '5111', 'Thanh toán QR, chuyển khoản'],
        ['BT03', 'Doanh thu qua app giao đồ ăn', '131', '5111', 'Kênh GrabFood, ShopeeFood'], ['BT04', 'Thuế GTGT đầu ra', '1111', '33311', 'Theo thuế suất món'],
        ['BT05', 'Giá vốn xuất bán POS', '632', '152', 'Xuất kho theo định lượng'], ['BT06', 'Hoa hồng app giao đồ ăn', '6421', '131', 'Khi đối soát với sàn'], ['BT07', 'Mua nguyên vật liệu chưa trả tiền', '152', '331', 'Phiếu nhập mua từ iPOS Inventory']]
        .map(([ma, ten, no, co, dk]) => ({ ma, ten, no, co, dk })) } },
    '1.16': { catalog: { them: 'Thêm lý do', nhomLoc: 'dung', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Lý do' }, { k: 'dung', t: 'Dùng cho' }],
      rows: () => [['LD01', 'Thu tiền bán hàng', 'Phiếu thu'], ['LD02', 'Thu nợ khách hàng', 'Phiếu thu'], ['LD03', 'Rút tiền ngân hàng nhập quỹ', 'Phiếu thu'], ['LD04', 'Chi mua nguyên vật liệu', 'Phiếu chi'],
        ['LD05', 'Chi trả lương', 'Phiếu chi'], ['LD06', 'Chi tạm ứng', 'Phiếu chi'], ['LD07', 'Xuất huỷ hàng hỏng', 'Phiếu xuất kho'], ['LD08', 'Xuất dùng nội bộ', 'Phiếu xuất kho'], ['LD09', 'Nhập hàng khách trả lại', 'Phiếu nhập kho']]
        .map(([ma, ten, dung]) => ({ ma, ten, dung })) } },
  }, NGAN),
}
export default danhMuc
