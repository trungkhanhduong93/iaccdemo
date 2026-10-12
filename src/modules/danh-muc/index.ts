// Phân hệ Danh mục: 16 danh mục theo Excel mục 1
import { createElement } from 'react'
import type { Col, ModuleDef, Row, ScreenDef } from '../types'
import { tuExcel } from '../types'
import { quyTrinh } from './quy-trinh'
import { kieuGhiSo } from '../../app/plan'
import { CCDC_HANG, CHI_NHANH, HANG, KHACH, KHO, LY_DO, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { DON_VI_TINH, tkCot, taiKhoan, NHOM_HANG, NHOM_DOI_TUONG, NHOM_MUC_CP, NHOM_CONG_VIEC, NHOM_KHO, DS_PTTT, QUY_DOI_DVT } from './data'
import { timNganhNghe } from './nganh-nghe'
import { HeThongTaiKhoan } from './HeThongTaiKhoan'
import { tkTheoCheDo } from '../tong-hop/so-cai'
import { Note } from '../../ui/Page'
import { DanhMucChiNhanh } from './DanhMucChiNhanh'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '1.1': 'Tài khoản', '1.2': 'Hàng hoá', '1.3': 'Đơn vị tính', '1.4': 'Quy đổi ĐVT', '1.5': 'Đối tượng', '1.6': 'Mục chi phí', '1.7': 'Công việc', '1.8': 'Kho', '1.9': 'Tiền tệ', '1.10': 'Tỷ giá', '1.11': 'Loại thuế', '1.12': 'Quỹ tiền', '1.14': 'Bảng giá', '1.15': 'Bút toán tự động', '1.16': 'Lý do' }

/** Biểu tượng riêng theo mã màn (T40) */
const BIEU_TUONG: Record<string, string> = {
  '1.1': 'sotk', '1.2': 'hanghoa', '1.3': 'dvt', '1.4': 'quydoi', '1.5': 'users', '1.6': 'receipt',
  '1.7': 'congviec', '1.8': 'khohang', '1.9': 'tiente', '1.10': 'tygia', '1.11': 'loaithue',
  '1.12': 'quytien', '1.14': 'banggia', '1.15': 'buttoan', '1.16': 'lydo',
}

/** 5 màn danh mục nhóm ngoài Excel (T136) */
const nhomHangHoa: ScreenDef = {
  slug: 'nhom-hang-hoa', ten: 'Danh mục nhóm hàng hoá', ngan: 'Nhóm hàng hoá', nhom: 'Danh mục', kind: 'catalog', icon: 'hanghoa',
  catalog: {
    them: 'Thêm nhóm hàng hoá',
    cols: (goi, cheDo) => [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên nhóm' },
      { k: 'dienGiai', t: 'Diễn giải', cls: 'dim' },   // T154: bỏ cột loại hàng
      ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkKho', 'TK kho'), tkCot('tkDt', 'TK doanh thu'), tkCot('tkGv', 'TK giá vốn')] : []),
    ],
    rows: () => NHOM_HANG,
  },
}

const nhomDoiTuong: ScreenDef = {
  slug: 'nhom-doi-tuong', ten: 'Danh mục nhóm đối tượng', ngan: 'Nhóm đối tượng', nhom: 'Danh mục', kind: 'catalog', icon: 'users',
  catalog: {
    them: 'Thêm nhóm đối tượng',
    cols: (goi, cheDo) => [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên nhóm' },
      { k: 'dienGiai', t: 'Diễn giải', cls: 'dim' },
      ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkThu', 'TK phải thu'), tkCot('tkTra', 'TK phải trả')] : []),
    ],
    rows: () => NHOM_DOI_TUONG,
  },
}

const nhomMucChiPhi: ScreenDef = {
  slug: 'nhom-muc-chi-phi', ten: 'Danh mục nhóm mục chi phí', ngan: 'Nhóm mục chi phí', nhom: 'Danh mục', kind: 'catalog', icon: 'receipt',
  goi: ['S', 'PL', 'PR'],   // gói Free ẩn, PhuongXT 11/10/2026 (T143)
  catalog: {
    them: 'Thêm nhóm mục chi phí',
    cols: [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên nhóm' },
      { k: 'dienGiai', t: 'Diễn giải', cls: 'dim' },
    ],
    rows: () => NHOM_MUC_CP,
  },
}

const nhomCongViec: ScreenDef = {
  slug: 'nhom-cong-viec', ten: 'Danh mục nhóm công việc', ngan: 'Nhóm công việc', nhom: 'Danh mục', kind: 'catalog', icon: 'congviec',
  goi: ['S', 'PL', 'PR'],   // gói Free ẩn (T143)
  catalog: {
    them: 'Thêm nhóm công việc',
    cols: [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên nhóm' },
      { k: 'dienGiai', t: 'Diễn giải', cls: 'dim' },
    ],
    rows: () => NHOM_CONG_VIEC,
  },
}

const nhomKho: ScreenDef = {
  slug: 'nhom-kho', ten: 'Danh mục nhóm kho', ngan: 'Nhóm kho', nhom: 'Danh mục', kind: 'catalog', icon: 'khohang',
  goi: ['S', 'PL', 'PR'],   // gói Free ẩn (T143)
  catalog: {
    them: 'Thêm nhóm kho',
    cols: [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên nhóm' },
      { k: 'dienGiai', t: 'Diễn giải', cls: 'dim' },
    ],
    rows: () => NHOM_KHO,
  },
}

/** Chi nhánh của đơn vị: một mã số thuế có nhiều chi nhánh. Không có trong Excel, gói nào cũng mở. Thanh trên chọn chi nhánh làm việc từ danh mục này.
 *  Thêm chi nhánh từ cửa hàng FABi chưa dùng kế toán (T142) */
const chiNhanh: ScreenDef = { slug: 'chi-nhanh', ten: 'Danh mục chi nhánh', ngan: 'Chi nhánh', nhom: 'Danh mục', kind: 'custom', icon: 'chinhanh', comp: DanhMucChiNhanh }

/** Ngành nghề tính thuế của hàng hoá theo mã: tự điền nhóm và 2 tỷ lệ (T151) */
const nganhNghe = (ma: string) => {
  const n = timNganhNghe(ma)
  return n ? { nganhNghe: ma, nhomNganh: n.tenNhom, thueGtgt: String(n.gtgt).replace('.', ','), thueTn: String(n.tncn).replace('.', ',') } : {}
}
/** Hàng bán thẳng mua về bán lại: bia, nước suối */
const BAN_THANG = new Set(['BIA01', 'NS01'])
/** Đồ uống pha chế bán dưới thương hiệu quầy cà phê */
const PHA_CHE = new Set(['CF01', 'TRA01'])

/** Danh mục phương thức thanh toán ngoài Excel (T137, chưa đối chiếu bảng DM_) */
const phuongThucThanhToan: ScreenDef = {
  slug: 'phuong-thuc-thanh-toan',
  ten: 'Danh mục phương thức thanh toán',
  ngan: 'Phương thức thanh toán',
  nhom: 'Danh mục',
  kind: 'catalog',
  icon: 'quytien',
  catalog: {
    them: 'Thêm phương thức',
    khongThem: ['F', 'S'],   // gói Free, Standard lấy phương thức từ FABi, không thêm mới (T144)
    nutPhu: { nhan: 'Đồng bộ từ FABi', icon: 'refresh', bao: `Đã đồng bộ ${DS_PTTT.length} phương thức thanh toán từ FABi` },
    cols: (goi, cheDo) => [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên phương thức' },
      // gói Free, Standard chỉ có mã, tên: loại chứng từ, hạch toán dùng cho tự hạch toán ở gói Plus, Pro (T144)
      ...(goi === 'F' || goi === 'S' ? [] : [
        { k: 'loaiCt', t: 'Loại chứng từ' },
        ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkNo', 'TK Nợ')] : []),
        { k: 'doiTuong', t: 'Đối tượng' },
        { k: 'dienGiai', t: 'Diễn giải', cls: 'dim' },
      ]),
    ],
    rows: () => DS_PTTT,
  },
}

const danhMuc: ModuleDef = {
  key: 'danh-muc', ten: 'Danh mục', ngan: 'Danh mục', icon: 'folder', mod: 0,
  mota: 'Hàng hoá, đối tượng, kho, tài khoản lấy từ FABi và iPOS Inventory',
  quyTrinh,
  screens: tuExcel(0, {
    '1.1': { kind: 'custom', comp: HeThongTaiKhoan, cheDo: ['TT133', 'TT99'] },
    '1.2': { catalog: {
      them: 'Thêm hàng hoá', nhomLoc: 'nhom',
      chucNang: r => r.tkKho === '152' ? [{ nhan: 'Xem thẻ kho', di: 'kho/5-2-1' }] : r.tkKho === '153' ? [{ nhan: 'Xem thẻ chi phí', di: 'ccdc/8-1-1' }] : [{ nhan: 'Xem doanh thu', di: 'ban-hang/3-2-5' }],
      cols: (goi, cheDo) => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên hàng hoá' }, { k: 'nhom', t: 'Nhóm' }, { k: 'dvt', t: 'ĐVT' },
        { k: 'thuongHieu', t: 'Thương hiệu' },
        // TT152, TT58 tính thuế theo tỷ lệ % trên doanh thu của ngành nghề; TT133, TT99 theo thuế suất GTGT (T151)
        { k: 'gia', t: 'Giá bán', num: true }, cheDo === 'TT152' || cheDo === 'TT58'
          ? { k: 'thueGtgt', t: 'Thuế suất', num: true, r: r => r.thueGtgt === undefined || r.thueGtgt === '' ? '—' : `${String(r.thueGtgt).replace('.', ',')}%` }
          : { k: 'ts', t: 'Thuế suất', num: true, r: r => r.ts ? `${r.ts}%` : 'KCT' },
        { k: 'tonKho', t: 'Theo dõi tồn', c: true, w: 110, r: r => createElement('input', { type: 'checkbox', className: 'o-tich-xem', checked: Boolean(r.tonKho), readOnly: true, tabIndex: -1, 'aria-label': 'Theo dõi tồn kho' }) },   // T114
        ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkDt', 'TK doanh thu'), tkCot('tkGv', 'TK giá vốn'), tkCot('tkKho', 'TK kho')] : [])],
      rows: () => [
        ...HANG.map(h => ({ ...h, tkDt: '5111', tkGv: '632', tkKho: '156', ...nganhNghe(BAN_THANG.has(h.ma) ? '101-1' : '301-5'),
          thuongHieu: PHA_CHE.has(h.ma) ? 'Mây Cà Phê' : 'Phố Mây', ...(BAN_THANG.has(h.ma) ? { ncc: 'Công ty TNHH Nước giải khát Nam Bộ' } : {}) })),
        { ma: 'BUN02', ten: 'Bún bò Huế', nhom: 'Món mới tháng 10', dvt: 'Tô', gia: 69000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, ...nganhNghe('301-5'), thuongHieu: 'Phố Mây' },
        { ma: 'MI01', ten: 'Mì Quảng tôm thịt', nhom: 'Món mới tháng 10', dvt: 'Tô', gia: 65000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, ...nganhNghe('301-5'), thuongHieu: 'Phố Mây Express' },
        ...NVL.map(h => ({ ...h, gia: 0, tkDt: '', tkGv: '632', tkKho: '152', tonKho: true })),   // nguyên vật liệu luôn theo dõi tồn (T114)
        ...CCDC_HANG.map(h => ({ ...h, loai: 'Khác (Công cụ dụng cụ)', gia: 0, ts: 10, tkDt: '', tkGv: '', tkKho: '153', tonKho: false })),   // CCDC: thẻ chi phí phân bổ chọn mã từ đây
      ],
    } },
    '1.3': { catalog: { them: 'Thêm đơn vị tính', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên đơn vị tính' }, { k: 'mota', t: 'Mô tả', cls: 'dim' }],
      rows: () => DON_VI_TINH.map(([ma, ten, mota]) => ({ ma, ten, mota })) } },
    // T154: 1 Từ ĐVT = tỷ lệ Đến ĐVT; hàng hoá áp dụng để trống là mọi hàng hoá
    '1.4': { catalog: { them: 'Thêm quy đổi', cols: [{ k: 'tu', t: 'Từ ĐVT', c: true }, { k: 'den', t: 'Đến ĐVT', c: true }, { k: 'tl', t: 'Tỷ lệ', num: true },
      { k: 'dienGiai', t: 'Diễn giải' }, { k: 'hangAd', t: 'Hàng hoá áp dụng', r: (r: Row) => r.hangAd || 'Tất cả hàng hoá' }],
      rows: () => QUY_DOI_DVT } },
    '1.5': { catalog: { them: 'Thêm đối tượng', nhomLoc: 'loai', nhanLoc: 'Loại',
      chucNang: r => {
        if (r.loai === 'Khách hàng') return [{ nhan: 'Lập hoá đơn', di: 'ban-hang/3-1-2/moi' }, { nhan: 'Thu tiền', di: 'tien/2-1-1/moi?loai=thu' }, { nhan: 'Xem công nợ', di: 'tien/2-2-5' }]
        if (r.loai === 'Nhà cung cấp') return [{ nhan: 'Lập phiếu mua', di: 'mua-hang/4-1-1/moi' }, { nhan: 'Trả tiền', di: 'tien/2-1-1/moi?loai=chi' }, { nhan: 'Xem công nợ', di: 'mua-hang/4-2-2' }]
        if (r.loai === 'Nhân viên') return [{ nhan: 'Chi tạm ứng', di: 'tien/2-1-1/moi?loai=chi' }]
        return []
      },
      cols: (goi, cheDo) => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'loai', t: 'Loại' }, { k: 'mst', t: 'Mã số thuế' }, { k: 'nhom', t: 'Nhóm', cls: 'dim' },
        { k: 'dongY', t: 'Đồng ý chia sẻ', c: true, r: (r: Row) => r.dongY ? 'Đã đồng ý' : 'Chưa' },
        { k: 'dktt', t: 'Điều khoản thanh toán' }, ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkCn', 'TK công nợ')] : [])],
      rows: () => [
        ...KHACH.map(x => ({ ...x, loai: 'Khách hàng', dktt: x.ma === 'KL' ? 'Thanh toán ngay' : 'Công nợ 30 ngày', tkCn: '131', dongY: true })),
        ...NCC.map(x => ({ ...x, loai: 'Nhà cung cấp', dktt: 'Công nợ 15 ngày', tkCn: '331', dongY: true })),
        ...NHAN_VIEN.map(x => ({ ...x, mst: '', nhom: x.bp, loai: 'Nhân viên', dktt: '—', tkCn: '141', dongY: true })),
      ] } },
    '1.6': { catalog: { them: 'Thêm mục chi phí', nhomLoc: 'nhom', cols: (goi, cheDo) => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Mục chi phí' }, { k: 'nhom', t: 'Nhóm' }, ...(kieuGhiSo(cheDo) === 'noco' ? [{ k: 'tk', t: 'TK chi phí', cls: 'code' } as Col] : [])],
      rows: () => [['CP01', 'Lương nhân viên bếp', 'Nhân công', '6421'], ['CP02', 'Lương phục vụ, thu ngân', 'Nhân công', '6421'], ['CP03', 'Lương văn phòng', 'Nhân công', '6422'],
        ['CP04', 'Thuê mặt bằng', 'Mặt bằng', '6421'], ['CP05', 'Điện', 'Điện, nước, gas', '6421'], ['CP06', 'Nước', 'Điện, nước, gas', '6421'], ['CP07', 'Gas', 'Điện, nước, gas', '6421'],
        ['CP08', 'Hoa hồng app giao đồ ăn', 'Bán hàng', '6421'], ['CP09', 'Quảng cáo, khuyến mãi', 'Bán hàng', '6421'], ['CP10', 'Sửa chữa, bảo trì', 'Khác', '6422'], ['CP11', 'Văn phòng phẩm', 'Khác', '6422']]
        .map(([ma, ten, nhom, tk]) => ({ ma, ten, nhom, tk })) } },
    // T154: công việc chỉ còn mã, tên, mô tả, trạng thái
    '1.7': { catalog: { them: 'Thêm công việc', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên công việc' }, { k: 'moTa', t: 'Mô tả', cls: 'dim' }],
      rows: () => [['CV01', 'Khai trương chi nhánh Thảo Điền', 'Chi phí mở điểm bán mới tháng 6 đến tháng 8/2026'], ['CV02', 'Sự kiện Trung thu 2026', 'Trang trí, quà tặng, quảng cáo tháng 9/2026'],
        ['CV03', 'Cải tạo bếp Lê Lợi', 'Sửa bếp, thay hút mùi tháng 10, 11/2026'], ['CV04', 'Tiệc cuối năm khách công ty', 'Tiệc theo hợp đồng tháng 12/2026']]
        .map(([ma, ten, moTa]) => ({ ma, ten, moTa })) } },
    '1.8': { catalog: { them: 'Thêm kho', khongThem: ['F'],
      // gói Free: mỗi chi nhánh một kho mặc định theo iPOS Inventory (kho đầu của chi nhánh), không thêm kho mới (T143)
      locGoi: (goi, r) => (goi !== 'F' && goi !== 'S') || CHI_NHANH.some(c => c.kho[0] === r.ten),   // gói Free, Standard: dữ liệu mẫu một kho mỗi chi nhánh
      chucNang: () => [{ nhan: 'Xem tồn kho', di: 'kho/5-2-4' }, { nhan: 'Chuyển kho', di: 'kho/5-1-4-3/moi' }, { nhan: 'Xuất điều chuyển', di: 'kho/5-1-4/moi' }],
      cols: (goi, cheDo) => [{ k: 'ma', t: 'Mã kho', cls: 'code' }, { k: 'ten', t: 'Tên kho' }, { k: 'cn', t: 'Chi nhánh' }, ...(goi === 'F' ? [] : [{ k: 'loai', t: 'Nhóm kho' }]), { k: 'tk', t: 'Thủ kho', cls: 'dim' },
        { k: 'thuongHieu', t: 'Thương hiệu', an: true, r: (r: Row) => r.thuongHieu || 'Tất cả' },   // bảng rộng nên mặc định ẩn, bật ở Tuỳ chỉnh cột (T151)
        ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkKho', 'TK kho'), tkCot('tkGv', 'TK giá vốn'), tkCot('tkCp', 'TK chi phí')] : [])],
      rows: () => KHO.map((ten, i) => {
        const isTong = ten.includes('tổng')
        return {
          ma: `K${String(i + 1).padStart(2, '0')}`,
          ten,
          cn: CHI_NHANH.find(c => c.kho.includes(ten))?.ten ?? 'Văn phòng',
          loai: ten.includes('bar') ? 'Kho pha chế' : isTong ? 'Kho tổng' : 'Kho bếp',
          tk: 'Võ Thanh Tùng',
          thuongHieu: ten.includes('bar') ? 'Mây Cà Phê' : isTong ? '' : 'Phố Mây',   // để trống là mọi thương hiệu (T151)
          tkKho: '152',
          tkGv: '632',
          tkCp: isTong ? '6422' : '6421',
          mucCp: isTong ? 'Thuê mặt bằng' : 'Lương nhân viên bếp',
          congViec: isTong ? 'Cải tạo bếp Lê Lợi' : 'Khai trương chi nhánh Thảo Điền',
          diaChi: isTong ? 'Kho tổng Bình Tân, TP.HCM' : '86 Lê Lợi, P. Sài Gòn, TP.HCM',
          dienThoai: '028 3822 1234',
          nguoiLienHe: 'Võ Thanh Tùng',
          ghiChu: isTong ? 'Kho tổng phân phối toàn chuỗi' : 'Kho phục vụ chi nhánh',
        }
      }),
      note: goi => goi === 'F' ? createElement(Note, { kind: 'gray', icon: 'info', children: 'Gói Free: mỗi chi nhánh tự có một kho mặc định theo iPOS Inventory, không thêm kho mới.' }) : null } },
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
    // T154: bảng giá theo iFaster; giá nhập có nhà cung cấp, kho áp dụng để trống là mọi kho
    '1.14': { catalog: { them: 'Thêm bảng giá', nhomLoc: 'loai', nhanLoc: 'Loại giá',
      cols: [{ k: 'loai', t: 'Loại giá' }, { k: 'ten', t: 'Hàng hoá' }, { k: 'dvt', t: 'ĐVT' }, { k: 'thoiGian', t: 'Thời gian áp dụng', w: 200 }, { k: 'gia', t: 'Đơn giá', num: true },
        { k: 'vat', t: 'VAT (%)', num: true }, { k: 'ncc', t: 'Nhà cung cấp', r: (r: Row) => r.ncc || '—' }, { k: 'kho', t: 'Kho áp dụng', r: (r: Row) => r.kho || 'Tất cả kho' }],
      rows: () => [
        ...HANG.map(h => ({ loai: 'Giá bán', ten: h.ten, dvt: h.dvt, thoiGian: '01/09/2026 - 31/12/2026', gia: h.gia, vat: h.ts, ncc: '', kho: '' })),
        ...NVL.slice(0, 8).map(h => ({ loai: 'Giá nhập', ten: h.ten, dvt: h.dvt, thoiGian: '01/10/2026 - 31/03/2027', gia: h.gia, vat: h.ts,
          ncc: (NCC.find(n => n.nhom === h.nhom) ?? NCC[0]).ten, kho: 'Kho tổng' })),
      ] } },
    '1.15': { cheDo: ['TT133', 'TT99'], catalog: { them: 'Thêm bút toán', nhomLoc: 'lct', nhanLoc: 'Loại chứng từ',
      cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Nghiệp vụ' }, { k: 'lct', t: 'Loại chứng từ' }, { k: 'loc', t: 'Lọc theo', cls: 'dim' },
        { k: 'no', t: 'TK Nợ', cls: 'code', c: true }, { k: 'co', t: 'TK Có', cls: 'code', c: true }, { k: 'tien', t: 'Số tiền lấy từ', cls: 'dim' }],
      rows: cd => [
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
      ].map(([ma, ten, lct, loc, no, co, tien]) => ({ ma, ten, lct, loc, no: tkTheoCheDo(no, cd).so, co: tkTheoCheDo(co, cd).so, tien })) } },
    '1.16': { catalog: { them: 'Thêm lý do', locGoi: (goi, r) => goi !== 'F' || r.dung === 'Thu tiền' || r.dung === 'Chi tiền',   // gói Free chỉ lý do thu, chi (T144)
      nhomLoc: 'dung', nhanLoc: 'Dùng cho', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Lý do' }, { k: 'dung', t: 'Dùng cho' }],
      rows: () => LY_DO } },
  }, NGAN).filter(sc => sc.code !== '1.13').map(sc => ({ ...sc, icon: BIEU_TUONG[sc.code ?? ''] ?? sc.icon })).flatMap(sc => {
    if (sc.code === '1.2') return [sc, nhomHangHoa]
    if (sc.code === '1.5') return [sc, nhomDoiTuong]
    if (sc.code === '1.6') return [sc, nhomMucChiPhi]
    if (sc.code === '1.7') return [sc, nhomCongViec]
    if (sc.code === '1.8') return [sc, nhomKho, chiNhanh]   // bỏ danh mục Thương hiệu (T166)
    if (sc.code === '1.12') return [sc, phuongThucThanhToan]
    return [sc]
  }),
}
export default danhMuc
