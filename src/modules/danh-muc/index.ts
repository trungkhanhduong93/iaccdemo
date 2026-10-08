// Phân hệ Danh mục: 16 danh mục theo Excel mục 1
import { createElement } from 'react'
import type { Col, ModuleDef, ScreenDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { kieuGhiSo } from '../../app/plan'
import { CHI_NHANH, HANG, KHACH, KHO, LY_DO, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { tkCot, TAI_KHOAN } from './data'
import { Note } from '../../ui/Page'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '1.1': 'Tài khoản', '1.2': 'Hàng hoá', '1.3': 'Đơn vị tính', '1.4': 'Quy đổi ĐVT', '1.5': 'Đối tượng', '1.6': 'Mục chi phí', '1.7': 'Công việc', '1.8': 'Kho', '1.9': 'Tiền tệ', '1.10': 'Tỷ giá', '1.11': 'Loại thuế', '1.12': 'Quỹ tiền', '1.13': 'Tài sản cố định', '1.14': 'Bảng giá', '1.15': 'Bút toán tự động', '1.16': 'Lý do' }

/** Biểu tượng riêng theo mã màn (T40) */
const BIEU_TUONG: Record<string, string> = {
  '1.1': 'sotk', '1.2': 'hanghoa', '1.3': 'dvt', '1.4': 'quydoi', '1.5': 'users', '1.6': 'receipt',
  '1.7': 'congviec', '1.8': 'khohang', '1.9': 'tiente', '1.10': 'tygia', '1.11': 'loaithue',
  '1.12': 'quytien', '1.13': 'building', '1.14': 'banggia', '1.15': 'buttoan', '1.16': 'lydo',
}

/** Chi nhánh của đơn vị: một mã số thuế có nhiều chi nhánh. Không có trong Excel, gói nào cũng mở. Thanh trên chọn chi nhánh làm việc từ danh mục này. */
const chiNhanh: ScreenDef = { slug: 'chi-nhanh', ten: 'Danh mục chi nhánh', ngan: 'Chi nhánh', nhom: 'Danh mục', kind: 'catalog', icon: 'chinhanh', catalog: {
  them: 'Thêm chi nhánh',
  cols: [{ k: 'ma', t: 'Mã', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên chi nhánh' }, { k: 'kho', t: 'Kho', cls: 'dim' }],
  rows: () => CHI_NHANH.map(c => ({ ma: c.id.toUpperCase(), ten: c.ten, kho: c.kho.join(', ') })),
} }

const danhMuc: ModuleDef = {
  key: 'danh-muc', ten: 'Danh mục', ngan: 'Danh mục', icon: 'folder', mod: 0,
  mota: 'Hàng hoá, đối tượng, kho, tài khoản lấy từ FABi và iPOS Inventory',
  quyTrinh,
  screens: tuExcel(0, {
    '1.1': { catalog: { them: 'Thêm tài khoản', nhomLoc: 'loai', nhanLoc: 'Loại', cols: [{ k: 'so', t: 'Số tài khoản', cls: 'code', w: 120 }, { k: 'ten', t: 'Tên tài khoản' },
      { k: 'loai', t: 'Loại' }, { k: 'tc', t: 'Tính chất' }, { k: 'ct', t: 'Theo dõi chi tiết', cls: 'dim' }], rows: () => TAI_KHOAN } },
    '1.2': { catalog: {
      them: 'Thêm hàng hoá', nhomLoc: 'nhom',
      chucNang: r => r.tkKho === '152' ? [{ nhan: 'Xem thẻ kho', di: 'kho/5-2-1' }] : [{ nhan: 'Xem doanh thu', di: 'ban-hang/3-2-3' }],
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
    '1.5': { catalog: { them: 'Thêm đối tượng', nhomLoc: 'loai', nhanLoc: 'Loại',
      chucNang: r => {
        if (r.loai === 'Khách hàng') return [{ nhan: 'Lập hoá đơn', di: 'ban-hang/3-1-2/moi' }, { nhan: 'Thu tiền', di: 'tien/2-1-1/moi?loai=thu' }, { nhan: 'Xem công nợ', di: 'tien/2-2-5' }]
        if (r.loai === 'Nhà cung cấp') return [{ nhan: 'Lập phiếu mua', di: 'mua-hang/4-1-1/moi' }, { nhan: 'Trả tiền', di: 'tien/2-1-1/moi?loai=chi' }, { nhan: 'Xem công nợ', di: 'mua-hang/4-2-2' }]
        if (r.loai === 'Nhân viên') return [{ nhan: 'Chi tạm ứng', di: 'tien/2-1-1/moi?loai=chi' }]
        return []
      },
      cols: goi => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'loai', t: 'Loại' }, { k: 'mst', t: 'Mã số thuế' }, { k: 'nhom', t: 'Nhóm', cls: 'dim' },
        { k: 'dktt', t: 'Điều khoản thanh toán' }, ...(kieuGhiSo(goi) === 'noco' ? [tkCot('tkCn', 'TK công nợ')] : [])],
      rows: () => [
        ...KHACH.map(x => ({ ...x, loai: 'Khách hàng', dktt: x.ma === 'KL' ? 'Thanh toán ngay' : 'Công nợ 30 ngày', tkCn: '131' })),
        ...NCC.map(x => ({ ...x, loai: 'Nhà cung cấp', dktt: 'Công nợ 15 ngày', tkCn: '331' })),
        ...NHAN_VIEN.map(x => ({ ...x, mst: '', nhom: x.bp, loai: 'Nhân viên', dktt: '—', tkCn: '141' })),
      ] } },
    '1.6': { catalog: { them: 'Thêm mục chi phí', nhomLoc: 'nhom', cols: goi => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Mục chi phí' }, { k: 'nhom', t: 'Nhóm' }, ...(kieuGhiSo(goi) === 'noco' ? [{ k: 'tk', t: 'TK chi phí', cls: 'code' } as Col] : [])],
      rows: () => [['CP01', 'Lương nhân viên bếp', 'Nhân công', '6421'], ['CP02', 'Lương phục vụ, thu ngân', 'Nhân công', '6421'], ['CP03', 'Lương văn phòng', 'Nhân công', '6422'],
        ['CP04', 'Thuê mặt bằng', 'Mặt bằng', '6421'], ['CP05', 'Điện', 'Điện, nước, gas', '6421'], ['CP06', 'Nước', 'Điện, nước, gas', '6421'], ['CP07', 'Gas', 'Điện, nước, gas', '6421'],
        ['CP08', 'Hoa hồng app giao đồ ăn', 'Bán hàng', '6421'], ['CP09', 'Quảng cáo, khuyến mãi', 'Bán hàng', '6421'], ['CP10', 'Sửa chữa, bảo trì', 'Khác', '6422'], ['CP11', 'Văn phòng phẩm', 'Khác', '6422']]
        .map(([ma, ten, nhom, tk]) => ({ ma, ten, nhom, tk })) } },
    '1.7': { catalog: { them: 'Thêm công việc', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Công việc' }, { k: 'nhom', t: 'Nhóm' }, { k: 'pt', t: 'Phụ trách' }, { k: 'tg', t: 'Thời gian', cls: 'dim' }],
      rows: () => [['CV01', 'Khai trương chi nhánh Thảo Điền', 'Mở rộng', 'Nguyễn Minh Anh', '06–08/2026'], ['CV02', 'Sự kiện Trung thu 2026', 'Marketing', 'Phạm Ngọc Lan', '09/2026'],
        ['CV03', 'Cải tạo bếp Lê Lợi', 'Sửa chữa lớn', 'Võ Thanh Tùng', '10–11/2026'], ['CV04', 'Tiệc cuối năm khách công ty', 'Bán hàng', 'Phạm Ngọc Lan', '12/2026']]
        .map(([ma, ten, nhom, pt, tg]) => ({ ma, ten, nhom, pt, tg })) } },
    '1.8': { catalog: { them: 'Thêm kho',
      chucNang: () => [{ nhan: 'Xem tồn kho', di: 'kho/5-2-4' }, { nhan: 'Điều chuyển', di: 'kho/5-1-4/moi' }],
      cols: goi => [{ k: 'ma', t: 'Mã kho', cls: 'code' }, { k: 'ten', t: 'Tên kho' }, { k: 'cn', t: 'Chi nhánh' }, { k: 'loai', t: 'Loại' }, { k: 'tk', t: 'Thủ kho', cls: 'dim' },
        ...(kieuGhiSo(goi) === 'noco' ? [tkCot('tkKho', 'TK kho'), tkCot('tkGv', 'TK giá vốn'), tkCot('tkCp', 'TK chi phí')] : [])],
      rows: () => KHO.map((ten, i) => {
        const isTong = ten.includes('tổng')
        return { ma: `K${String(i + 1).padStart(2, '0')}`, ten, cn: CHI_NHANH.find(c => c.kho.includes(ten))?.ten ?? 'Văn phòng', loai: ten.includes('bar') ? 'Kho pha chế' : isTong ? 'Kho tổng' : 'Kho bếp', tk: 'Võ Thanh Tùng', tkKho: '152', tkGv: '632', tkCp: isTong ? '6422' : '6421' }
      }),
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
    '1.12': { catalog: { them: 'Thêm quỹ', nhomLoc: 'loai', nhanLoc: 'Loại', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên quỹ' }, { k: 'loai', t: 'Loại' }, { k: 'stk', t: 'Số tài khoản' }, { k: 'cn', t: 'Chi nhánh', cls: 'dim' }],
      rows: () => [...CHI_NHANH.map((c, i) => ({ ma: `TM0${i + 1}`, ten: `Quỹ tiền mặt ${c.ngan}`, loai: 'Tiền mặt', stk: '', cn: c.ten })),
        { ma: 'NH01', ten: 'Vietcombank, chi nhánh Sài Gòn', loai: 'Ngân hàng', stk: '0071 0012 3456', cn: 'Tất cả' },
        { ma: 'NH02', ten: 'Techcombank, nhận tiền QR', loai: 'Ngân hàng', stk: '1903 6655 8899', cn: 'Tất cả' }] } },
    '1.13': { catalog: { them: 'Thêm tài sản', cols: [{ k: 'ma', t: 'Mã TS', cls: 'code' }, { k: 'ten', t: 'Tên tài sản' }, { k: 'loai', t: 'Loại' }, { k: 'ngay', t: 'Ngày ghi tăng' }, { k: 'ng', t: 'Nguyên giá', num: true }, { k: 'kh', t: 'Số tháng khấu hao', num: true }],
      rows: () => [['TS001', 'Hệ thống bếp công nghiệp Lê Lợi', 'Máy móc thiết bị', '01/03/2024', 486_000_000, 60], ['TS002', 'Tủ đông 1.500 lít', 'Máy móc thiết bị', '15/05/2024', 92_500_000, 60],
        ['TS003', 'Máy pha cà phê La Marzocco', 'Máy móc thiết bị', '01/07/2025', 268_000_000, 60], ['TS004', 'Hệ thống điều hoà Thảo Điền', 'Máy móc thiết bị', '20/06/2026', 214_800_000, 72],
        ['TS005', 'Xe tải giao hàng 1,5 tấn', 'Phương tiện vận tải', '10/01/2025', 545_000_000, 96]].map(([ma, ten, loai, ngay, ng, kh]) => ({ ma, ten, loai, ngay, ng, kh })) } },
    '1.14': { catalog: { them: 'Thêm bảng giá', nhomLoc: 'loai', cols: [{ k: 'ten', t: 'Hàng hoá' }, { k: 'dvt', t: 'ĐVT' }, { k: 'loai', t: 'Loại giá' }, { k: 'gia', t: 'Giá', num: true }, { k: 'tu', t: 'Áp dụng từ' }, { k: 'cn', t: 'Chi nhánh', cls: 'dim' }],
      rows: () => [...HANG.map(h => ({ ten: h.ten, dvt: h.dvt, loai: 'Giá bán', gia: h.gia, tu: '01/09/2026', cn: 'Tất cả' })), ...NVL.slice(0, 8).map(h => ({ ten: h.ten, dvt: h.dvt, loai: 'Giá mua', gia: h.gia, tu: '01/10/2026', cn: 'Kho tổng' }))] } },
    '1.15': { catalog: { them: 'Thêm bút toán', nhomLoc: 'lct', nhanLoc: 'Loại chứng từ',
      cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Nghiệp vụ' }, { k: 'lct', t: 'Loại chứng từ' }, { k: 'loc', t: 'Lọc theo', cls: 'dim' },
        { k: 'no', t: 'TK Nợ', cls: 'code', c: true }, { k: 'co', t: 'TK Có', cls: 'code', c: true }, { k: 'tien', t: 'Số tiền lấy từ', cls: 'dim' }],
      rows: () => [
        ['BT01', 'Doanh thu bán hàng thu tiền mặt', 'Chứng từ bán hàng FABi', 'Thanh toán tiền mặt', '1111', '5111', 'Tiền hàng chưa thuế'],
        ['BT01', 'Doanh thu bán hàng thu tiền mặt', 'Chứng từ bán hàng FABi', 'Thanh toán tiền mặt', '1111', '33311', 'Tiền thuế GTGT'],
        ['BT02', 'Doanh thu thu qua QR, chuyển khoản', 'Chứng từ bán hàng FABi', 'Thanh toán QR, chuyển khoản', '1121', '5111', 'Tiền hàng chưa thuế'],
        ['BT02', 'Doanh thu thu qua QR, chuyển khoản', 'Chứng từ bán hàng FABi', 'Thanh toán QR, chuyển khoản', '1121', '33311', 'Tiền thuế GTGT'],
        ['BT03', 'Doanh thu qua app giao đồ ăn', 'Chứng từ bán hàng FABi', 'Kênh GrabFood, ShopeeFood', '131', '5111', 'Tiền hàng chưa thuế'],
        ['BT03', 'Doanh thu qua app giao đồ ăn', 'Chứng từ bán hàng FABi', 'Kênh GrabFood, ShopeeFood', '131', '33311', 'Tiền thuế GTGT'],
        ['BT05', 'Giá vốn xuất bán POS', 'Phiếu xuất bán POS', 'Tất cả kho bếp, kho bar', '632', '152', 'Giá vốn theo định lượng'],
        ['BT06', 'Hoa hồng app giao đồ ăn', 'Đối soát sàn', 'Kênh GrabFood, ShopeeFood', '6421', '131', 'Tiền hoa hồng'],
        ['BT07', 'Mua nguyên vật liệu chưa trả tiền', 'Phiếu mua hàng', 'Nhóm nhà cung cấp Thịt, cá; Tinh bột; Pha chế', '152', '331', 'Tiền hàng chưa thuế'],
        ['BT07', 'Mua nguyên vật liệu chưa trả tiền', 'Phiếu mua hàng', 'Nhóm nhà cung cấp Thịt, cá; Tinh bột; Pha chế', '1331', '331', 'Tiền thuế GTGT'],
      ].map(([ma, ten, lct, loc, no, co, tien]) => ({ ma, ten, lct, loc, no, co, tien })) } },
    '1.16': { catalog: { them: 'Thêm lý do', nhomLoc: 'dung', nhanLoc: 'Dùng cho', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Lý do' }, { k: 'dung', t: 'Dùng cho' }],
      rows: () => LY_DO } },
  }, NGAN).map(sc => ({ ...sc, icon: BIEU_TUONG[sc.code ?? ''] ?? sc.icon })).flatMap(sc => sc.code === '1.8' ? [sc, chiNhanh] : [sc]),
}
export default danhMuc
