// Phân hệ Danh mục: 16 danh mục theo Excel mục 1
import { createElement } from 'react'
import type { Col, ModuleDef, Row, ScreenDef } from '../types'
import { tuExcel } from '../types'
// Tạm ẩn tab Quy trình của Danh mục, PhuongXT chốt 14/10/2026 (T225); mở lại thì khai lại quyTrinh từ './quy-trinh'
import { kieuGhiSo } from '../../app/plan'
import { CCDC_HANG, CUA_HANG, HANG, KHACH, KHO, LY_DO, NCC, NHAN_VIEN, NHOM_LY_DO, NVL, ganLyDo, luuLyDo } from '../../data/mock'
import { DON_VI_TINH, tkCot, taiKhoan, NHOM_HANG, NHOM_DOI_TUONG, NHOM_MUC_CP, NHOM_CONG_VIEC, NHOM_KHO, DS_PTTT, QUY_DOI_DVT, DS_MUC_CHI_PHI_16, DS_CONG_VIEC_17, DS_QUY_TIEN_112, DS_HANG_HOA_12 } from './data'
import { timNganhNghe } from './nganh-nghe'
import { DN_AN_UONG, DN_BAN_LE, nhanTyLe, timNganhNgheDn } from './nganh-nghe-dn'
import { BAN_THANG, hangDuocGiam } from '../ban-hang/giam-thue'
import { HeThongTaiKhoan } from './HeThongTaiKhoan'
import { tkTheoCheDo } from '../tong-hop/so-cai'
import { Note } from '../../ui/Page'
import { DanhMucCuaHang } from './DanhMucCuaHang'
import { datSoDuQuy, soDuQuyBanDau } from '../tong-hop/SoDuBanDau'
import { chiaTheoForm, docTien } from './ChiaSoDuQuy'
import { luuPtttQuy, ptttCuaQuy, tomTatPttt } from '../tien/dong-bo-fabi'
import { dauThap } from '../../ui/format'
import { CongThucScreen } from '../kho/CongThuc'
import { ThemBangGia } from './ThemBangGia'

/** Nhãn ngắn trên thanh tab */
const NGAN: Record<string, string> = { '1.1': 'Tài khoản', '1.2': 'Hàng hoá', '1.3': 'Đơn vị tính', '1.4': 'Quy đổi ĐVT', '1.5': 'Đối tượng', '1.6': 'Mục chi phí', '1.7': 'Công việc', '1.8': 'Kho', '1.9': 'Tiền tệ', '1.10': 'Tỷ giá', '1.11': 'Loại thuế', '1.12': 'Quỹ tiền', '1.14': 'Bảng giá', '1.15': 'Bút toán tự động', '1.16': 'Lý do nghiệp vụ' }

/** Biểu tượng riêng theo mã màn (T40) */
const BIEU_TUONG: Record<string, string> = {
  '1.1': 'sotk', '1.2': 'hanghoa', '1.3': 'dvt', '1.4': 'quydoi', '1.5': 'users', '1.6': 'receipt',
  '1.7': 'congviec', '1.8': 'khohang', '1.9': 'tiente', '1.10': 'tygia', '1.11': 'loaithue',
  '1.12': 'quytien', '1.14': 'banggia', '1.15': 'buttoan', '1.16': 'lydo',
}

/** Cột ĐVT ở danh sách Quy đổi ĐVT hiện mã kèm tên, vd "THUNG - Thùng" */
const maTenDvt = (ten: string) => { const d = DON_VI_TINH.find(x => x[1] === ten); return d ? `${d[0]} - ${d[1]}` : ten }

/** 5 màn danh mục nhóm ngoài Excel (T136) */
const nhomHangHoa: ScreenDef = {
  slug: 'nhom-hang-hoa', ten: 'Danh mục nhóm hàng hoá', ngan: 'Nhóm hàng hoá', nhom: 'Danh mục', kind: 'catalog', icon: 'nhomhang',
  catalog: {
    them: 'Thêm nhóm hàng hoá',
    nutPhu: { nhan: 'Đồng bộ FABi', bao: `Đã đồng bộ ${NHOM_HANG.length} nhóm hàng hoá từ FABi` },
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

/** Nhóm lý do nghiệp vụ (T473): 6 nhóm chi phí hợp lý theo Sổ S2c-HKD, cố định theo TT152 nên chỉ xem; cột Số lý do đếm lý do là chi phí thuộc nhóm */
const nhomLyDo: ScreenDef = {   // lý do lưu tên nhóm nên cột, bộ lọc ở Lý do nghiệp vụ hiện tên nhóm
  slug: 'nhom-ly-do', ten: 'Danh mục nhóm lý do nghiệp vụ', ngan: 'Nhóm lý do nghiệp vụ', nhom: 'Danh mục', kind: 'catalog', icon: 'receipt',
  catalog: {
    them: 'Thêm nhóm lý do nghiệp vụ',
    khongThem: ['S', 'PL', 'PR'],
    chiXem: ['S', 'PL', 'PR'],
    nhomLoc: 'dung', nhanLoc: 'Dùng cho',
    cols: [
      { k: 'ma', t: 'Mã', cls: 'code', w: 80 },
      { k: 'ten', t: 'Tên nhóm' },
      { k: 'dung', t: 'Dùng cho', w: 110 },   // nhóm dành cho thu hay chi (T473)
      { k: 'soLy', t: 'Số lý do', num: true, w: 100 },
    ],
    rows: () => NHOM_LY_DO.map(n => ({ ...n, soLy: LY_DO.filter(l => l.chiPhi && l.nhomCp === n.ten).length })),
  },
}

const nhomMucChiPhi: ScreenDef = {
  slug: 'nhom-muc-chi-phi', ten: 'Danh mục nhóm mục chi phí', ngan: 'Nhóm mục chi phí', nhom: 'Danh mục', kind: 'catalog', icon: 'receipt',
  goi: ['PL', 'PR'],   // gói Standard ẩn, PhuongXT 11/10/2026 (T143)
  anTab: ['PL'],   // gói Plus theo bộ danh mục gói Standard (T719)
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
  goi: ['PL', 'PR'],   // gói Standard ẩn (T143)
  anTab: ['PL'],   // gói Plus theo bộ danh mục gói Standard (T719)
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
  goi: ['PL', 'PR'],   // gói Standard ẩn (T143)
  anTab: ['PL'],   // gói Plus theo bộ danh mục gói Standard (T719)
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

/** Cửa hàng của đơn vị: một mã số thuế có nhiều cửa hàng. Không có trong Excel, gói nào cũng mở. Thanh trên chọn cửa hàng làm việc từ danh mục này.
 *  Thêm cửa hàng từ cửa hàng FABi chưa dùng kế toán (T142) */
const cuaHang: ScreenDef = { slug: 'cua-hang', ten: 'Danh mục cửa hàng', ngan: 'Cửa hàng', nhom: 'Danh mục', kind: 'custom', icon: 'chinhanh', comp: DanhMucCuaHang }

/** Ngành nghề tính thuế của hàng hoá theo mã: tự điền nhóm và 2 tỷ lệ (T151) */
const nganhNghe = (ma: string) => {
  const n = timNganhNghe(ma)
  // T720: điền luôn ngành nghề doanh nghiệp TT58 ở ô riêng; hàng mẫu chỉ có bán lẻ hoặc ăn uống
  const dn = timNganhNgheDn(ma === '101-1' ? DN_BAN_LE : DN_AN_UONG)
  return n && dn ? { nganhNghe: ma, nhomNganh: n.tenNhom, thueGtgt: String(n.gtgt).replace('.', ','), thueTn: String(n.tncn).replace('.', ','),
    nganhNgheDn: dn.ma, nhomNganhDn: dn.tenNhom, thueGtgtDn: dn.gtgt === null ? '' : String(dn.gtgt).replace('.', ','), thueTndn: String(dn.tndn).replace('.', ',') } : {}
}
/** Tỷ lệ trong ô hàng hoá ("1,5") ra chữ theo dấu thập phân đang chọn; trống là "—" (T720) */
const tyLeO = (v: unknown) => v === undefined || v === '' ? '—' : nhanTyLe(Number(String(v).replace(',', '.')), dauThap())
/** Đồ uống pha chế bán dưới thương hiệu quầy cà phê */
const PHA_CHE = new Set(['CF01', 'TRA01'])

/** Danh mục phương thức thanh toán ngoài Excel (T137, chưa đối chiếu bảng DM_) */
const phuongThucThanhToan: ScreenDef = {
  slug: 'phuong-thuc-thanh-toan',
  ten: 'Danh mục phương thức thanh toán',
  ngan: 'Phương thức thanh toán',
  nhom: 'Danh mục',
  kind: 'catalog',
  icon: 'wallet',
  catalog: {
    them: 'Thêm phương thức',
    khongThem: ['S', 'PL'],   // gói Standard, Plus lấy phương thức từ FABi, không thêm mới (T144)
    khongExcel: ['S', 'PL'],  // cũng không nhập, xuất Excel (T268)
    chiXem: ['S', 'PL'],      // chi tiết chỉ xem, không sửa, không xoá (T328)
    nutPhu: { nhan: 'Đồng bộ FABi', bao: `Đã đồng bộ ${DS_PTTT.length} phương thức thanh toán từ FABi` },
    cols: (goi, cheDo) => [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên phương thức' },
      // gói Free, Standard chỉ có mã, tên: loại chứng từ, hạch toán dùng cho tự hạch toán ở gói Plus, Pro (T144, T181)
      ...(goi === 'S' || goi === 'PL' ? [] : [
        { k: 'loaiCt', t: 'Chứng từ mặc định' },
        ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkNo', 'TK Nợ ngầm định')] : []),
        { k: 'doiTuong', t: 'Đối tượng' },
        { k: 'quyTien', t: 'Quỹ tiền', cls: 'code' },
        { k: 'dienGiai', t: 'Diễn giải', cls: 'dim' },
      ]),
    ],
    rows: () => DS_PTTT,
  },
}

/** Gói Plus theo bộ danh mục gói Standard, thêm Đơn vị tính, Quy đổi đơn vị tính, Bảng giá, Công thức chế biến, PhuongXT chốt 03/11/2026 (T719).
 *  Các danh mục dưới đây ẩn khỏi tab, menu gói Plus; đường dẫn vẫn mở được */
const AN_GOI_PLUS = ['1.1', '1.6', '1.7', '1.9', '1.10', '1.11', '1.15']

/** Công thức chế biến của Kho hiện thêm ở Danh mục gói Plus, cùng dữ liệu với tab ở Kho (T719) */
const congThucCheBien: ScreenDef = {
  slug: 'cong-thuc-che-bien', ten: 'Công thức chế biến', ngan: 'Công thức chế biến', nhom: 'Danh mục', kind: 'custom', icon: 'book',
  comp: CongThucScreen, can: ['9.1.3'], goi: ['PL'],
}

const danhMuc: ModuleDef = {
  key: 'danh-muc', ten: 'Danh mục', ngan: 'Danh mục', icon: 'folder', mod: 0,
  mota: 'Hàng hoá, đối tượng, kho, tài khoản lấy từ FABi và iPOS Inventory',
  screens: tuExcel(0, {
    '1.1': { kind: 'custom', comp: HeThongTaiKhoan, cheDo: ['TT133', 'TT99'] },
    '1.2': { catalog: {
      them: 'Thêm hàng hoá', nhomLoc: 'nhom',
      nutPhu: { nhan: 'Đồng bộ FABi', bao: `Đã đồng bộ ${DS_HANG_HOA_12.length} hàng hoá từ FABi` },
      cols: (goi, cheDo, s) => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên hàng hoá' }, { k: 'nhom', t: 'Nhóm' }, { k: 'dvt', t: 'ĐVT' },
        { k: 'thuongHieu', t: 'Thương hiệu' },
        // TT152, TT58 tính thuế theo tỷ lệ % trên doanh thu của ngành nghề; TT133, TT99 theo thuế suất GTGT (T151)
        ...(goi === 'S' || goi === 'PL' ? [] : [{ k: 'gia', t: 'Giá bán', num: true }]),
        // T720: doanh nghiệp TT58 hiện 2 tỷ lệ theo ngành nghề doanh nghiệp, ô riêng với hộ kinh doanh.
        // GTGT khấu trừ thì cột GTGT là thuế suất người dùng tự chọn, không theo ngành nghề; TNDN trên thu nhập tính thuế thì bỏ cột TNDN
        ...(cheDo === 'TT58'
          ? [s?.ppGtgt === 'khauTru'
              ? { k: 'ts', t: 'Thuế GTGT', num: true, w: 100, r: (r: Row) => r.ts === undefined || r.ts === '' ? '—' : r.ts === 'KCT' ? 'KCT' : `${r.ts}%` }
              : { k: 'thueGtgtDn', t: 'Thuế GTGT', num: true, w: 100, r: (r: Row) => tyLeO(r.thueGtgtDn) },
            ...(s?.ppTndn === 'thuNhap' ? [] : [{ k: 'thueTndn', t: 'Thuế TNDN', num: true, w: 100, r: (r: Row) => tyLeO(r.thueTndn) }])]
          : cheDo === 'TT152'
          ? [{ k: 'thueGtgt', t: 'Thuế suất', num: true, r: (r: Row) => r.thueGtgt === undefined || r.thueGtgt === '' ? '—' : `${String(r.thueGtgt).replace('.', dauThap())}%` }]
          : [{ k: 'ts', t: 'Thuế suất', num: true, r: (r: Row) => r.ts ? `${r.ts}%` : 'KCT' }]),
        { k: 'tonKho', t: 'Theo dõi tồn', c: true, w: 110, r: (r: Row) => createElement('input', { type: 'checkbox', className: 'o-tich-xem', checked: Boolean(r.tonKho), readOnly: true, tabIndex: -1, 'aria-label': 'Theo dõi tồn kho' }) },   // T114
        ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkDt', 'TK doanh thu'), tkCot('tkGv', 'TK giá vốn'), tkCot('tkKho', 'TK kho')] : [])],
      rows: () => [
        ...HANG.map(h => ({ ...h, loai: BAN_THANG.has(h.ma) ? 'Hàng bán thẳng' : 'Thành phẩm', tkDt: '5111', tkGv: '632', tkKho: '156', ...nganhNghe(BAN_THANG.has(h.ma) ? '101-1' : '301-5'),
          thuongHieu: PHA_CHE.has(h.ma) ? 'Mây Cà Phê' : 'Phố Mây', ...(BAN_THANG.has(h.ma) ? { ncc: 'Công ty TNHH Nước giải khát Nam Bộ' } : {}) })),
        { ma: 'BUN02', ten: 'Bún bò Huế', loai: 'Thành phẩm', nhom: 'Món mới tháng 10', dvt: 'Tô', gia: 69000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, ...nganhNghe('301-5'), thuongHieu: 'Phố Mây' },
        { ma: 'MI01', ten: 'Mì Quảng tôm thịt', loai: 'Thành phẩm', nhom: 'Món mới tháng 10', dvt: 'Tô', gia: 65000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, ...nganhNghe('301-5'), thuongHieu: 'Phố Mây Express' },
        { ma: 'BXP01', ten: 'Bánh xíu páo', loai: '', nhom: 'Món mới tháng 10', dvt: 'Cái', gia: 15000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, thuongHieu: 'Phố Mây', _tt: 1 },
        { ma: 'HB01', ten: 'Hàng bán không có mô tả', loai: '', nhom: 'Đồ ăn vặt', dvt: 'Gói', gia: 20000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, thuongHieu: 'Phố Mây', _tt: 1 },
        { ma: 'HB02', ten: 'Hàng bán đơn vị tính 1', loai: '', nhom: 'Đồ ăn vặt', dvt: 'Cái', gia: 10000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, thuongHieu: 'Phố Mây', _tt: 1 },
        { ma: 'NGUNG01', ten: 'Trà sữa trân châu đường đen', loai: 'Thành phẩm', nhom: 'Đồ uống', dvt: 'Ly', gia: 45000, ts: 8, tkDt: '', tkGv: '', tkKho: '', tonKho: false, thuongHieu: 'Mây Cà Phê', _tt: 0 },
        ...NVL.map(h => ({ ...h, loai: 'Nguyên vật liệu', gia: 0, tkDt: '', tkGv: '632', tkKho: '152', tonKho: true })),   // nguyên vật liệu luôn theo dõi tồn (T114)
        ...CCDC_HANG.map(h => ({ ...h, loai: 'Khác (Công cụ dụng cụ)', gia: 0, ts: 10, tkDt: '', tkGv: '', tkKho: '153', tonKho: false })),   // CCDC: thẻ chi phí phân bổ chọn mã từ đây
      ],
      // Ô Giảm thuế theo quy định lưu theo đơn vị, màn bán hàng đọc để tính tiền giảm thuế GTGT từng dòng (T754)
      phien: {
        gan: (r, s) => ({ ...r, giamVat: hangDuocGiam(s, String(r.ma)) ? 1 : 0 }),
        luu: (val, s) => ({ hangGiamVat: { ...s.hangGiamVat, [s.donVi]: { ...s.hangGiamVat?.[s.donVi], [String(val.ma)]: val.giamVat === 1 || val.giamVat === true || val.giamVat === '1' } } }),
      },
    } },
    '1.3': { catalog: { them: 'Thêm đơn vị tính',
      nutPhu: { nhan: 'Đồng bộ FABi', bao: `Đã đồng bộ ${DON_VI_TINH.length} đơn vị tính từ FABi` },
      cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên đơn vị tính' }, { k: 'mota', t: 'Mô tả', cls: 'dim' }],
      rows: () => DON_VI_TINH.map(([ma, ten, mota]) => ({ ma, ten, mota })) } },
    // T154: 1 Từ ĐVT = tỷ lệ Đến ĐVT; hàng hoá áp dụng để trống là mọi hàng hoá
    '1.4': { catalog: { them: 'Thêm quy đổi', khongLoc: ['tl', 'dienGiai'], cols: [{ k: 'tu', t: 'Từ ĐVT', c: true, r: (r: Row) => maTenDvt(r.tu) }, { k: 'den', t: 'Đến ĐVT', c: true, r: (r: Row) => maTenDvt(r.den) }, { k: 'tl', t: 'Tỷ lệ', num: true },
      { k: 'dienGiai', t: 'Diễn giải' }, { k: 'hangAd', t: 'Hàng hoá áp dụng', r: (r: Row) => r.hangAd || 'Tất cả hàng hoá' }],
      rows: () => QUY_DOI_DVT } },
    '1.5': { catalog: { them: 'Thêm đối tượng', nhomLoc: 'loai', nhanLoc: 'Loại',
      cols: (goi, cheDo) => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'loai', t: 'Loại' }, { k: 'mst', t: 'Mã số thuế' }, { k: 'nhom', t: 'Nhóm', cls: 'dim' },
        { k: 'dongY', t: 'Đồng ý chia sẻ', c: true, r: (r: Row) => r.dongY ? 'Đã đồng ý' : 'Chưa' },
        ...(goi === 'PR' ? [{ k: 'dktt', t: 'Điều khoản thanh toán' } as Col] : []),
        ...(goi === 'PR' && kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkCn', 'TK công nợ')] : [])],
      rows: () => [
        // Đối tượng có sẵn: có MST là tổ chức, chưa có (khách lẻ, nhân viên) là cá nhân (T471)
        ...KHACH.map(x => ({ ...x, kieuDt: x.mst ? 'Tổ chức' : 'Cá nhân', loai: 'Khách hàng', dktt: x.ma === 'KL' ? 'Thanh toán ngay' : 'Công nợ 30 ngày', tkCn: '131', dongY: true, _tt: x.ma === 'KH004' ? 0 : 1 })),
        ...NCC.map(x => ({ ...x, kieuDt: x.mst ? 'Tổ chức' : 'Cá nhân', loai: 'Nhà cung cấp', dktt: 'Công nợ 15 ngày', tkCn: '331', dongY: true, _tt: x.ma === 'NCC007' ? 0 : 1 })),
        ...NHAN_VIEN.map(x => ({ ...x, mst: '', kieuDt: 'Cá nhân', nhom: x.bp, loai: 'Nhân viên', dktt: '—', tkCn: '141', dongY: true })),
      ] } },
    '1.6': { catalog: { them: 'Thêm mục chi phí', nhomLoc: 'nhom', cols: (goi, cheDo) => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Mục chi phí' }, { k: 'nhom', t: 'Nhóm' }, ...(kieuGhiSo(cheDo) === 'noco' ? [{ k: 'tk', t: 'TK chi phí', cls: 'code' } as Col] : [])],
      rows: () => DS_MUC_CHI_PHI_16 } },
    // T154: công việc chỉ còn mã, tên, mô tả, trạng thái
    '1.7': { catalog: { them: 'Thêm công việc', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên công việc' }, { k: 'moTa', t: 'Mô tả', cls: 'dim' }],
      rows: () => DS_CONG_VIEC_17 } },
    '1.8': { catalog: { them: 'Thêm kho', khongThem: ['S', 'PL'],
      // gói Free: mỗi cửa hàng một kho mặc định theo iPOS Inventory (kho đầu của cửa hàng), không thêm kho mới (T143)
      locGoi: (goi, r) => goi === 'PR' || CUA_HANG.some(c => c.kho[0] === r.ten),   // gói Standard, Plus: dữ liệu mẫu một kho mỗi cửa hàng
      cols: (goi, cheDo) => [{ k: 'ma', t: 'Mã kho', cls: 'code' }, { k: 'ten', t: 'Tên kho' }, { k: 'cn', t: 'Cửa hàng' }, ...(goi === 'S' || goi === 'PL' ? [] : [{ k: 'loai', t: 'Nhóm kho' }]), { k: 'tk', t: 'Thủ kho', cls: 'dim' },
        { k: 'thuongHieu', t: 'Thương hiệu', an: true, r: (r: Row) => r.thuongHieu || 'Tất cả' },   // bảng rộng nên mặc định ẩn, bật ở Tuỳ chỉnh cột (T151)
        ...(kieuGhiSo(cheDo) === 'noco' ? [tkCot('tkKho', 'TK kho'), tkCot('tkGv', 'TK giá vốn'), tkCot('tkCp', 'TK chi phí')] : [])],
      rows: () => KHO.map((ten, i) => {
        const isTong = ten.includes('tổng')
        return {
          ma: `K${String(i + 1).padStart(2, '0')}`,
          ten,
          _tt: i === KHO.length - 1 ? 0 : 1,
          cn: CUA_HANG.find(c => c.kho.includes(ten))?.ten ?? 'Văn phòng',
          loai: ten.includes('bar') ? 'Kho pha chế' : isTong ? 'Kho tổng' : 'Kho bếp',
          tk: 'Võ Thanh Tùng',
          thuongHieu: ten.includes('bar') ? 'Mây Cà Phê' : isTong ? '' : 'Phố Mây',   // để trống là mọi thương hiệu (T151)
          tkKho: '152',
          tkGv: '632',
          tkCp: isTong ? '6422' : '6421',
          mucCp: isTong ? 'Thuê mặt bằng' : 'Lương nhân viên bếp',
          congViec: isTong ? 'Cải tạo bếp Lê Lợi' : 'Khai trương cửa hàng Thảo Điền',
          diaChi: isTong ? 'Kho tổng Bình Tân, TP.HCM' : '86 Lê Lợi, P. Sài Gòn, TP.HCM',
          dienThoai: '028 3822 1234',
          nguoiLienHe: 'Võ Thanh Tùng',
          ghiChu: isTong ? 'Kho tổng phân phối toàn chuỗi' : 'Kho phục vụ cửa hàng',
        }
      }),
      note: goi => goi === 'S' || goi === 'PL' ? createElement(Note, { kind: 'gray', icon: 'info', children: 'Mỗi cửa hàng tự có một kho mặc định theo iPOS Inventory, không thêm kho mới.' }) : null } },
    '1.9': { catalog: { them: 'Thêm tiền tệ', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên tiền tệ' }, { k: 'kh', t: 'Ký hiệu', c: true }, { k: 'le', t: 'Số lẻ', num: true }],
      rows: () => [['VND', 'Đồng Việt Nam', 'đ', 0], ['USD', 'Đô la Mỹ', '$', 2], ['EUR', 'Euro', '€', 2], ['JPY', 'Yên Nhật', '¥', 0]].map(([ma, ten, kh, le]) => ({ ma, ten, kh, le: String(le) })) } },
    '1.10': { catalog: { them: 'Thêm tỷ giá', cols: [{ k: 'ngay', t: 'Ngày' }, { k: 'tt', t: 'Tiền tệ', cls: 'code' }, { k: 'mua', t: 'Tỷ giá mua', num: true }, { k: 'ban', t: 'Tỷ giá bán', num: true }, { k: 'nguon', t: 'Nguồn', cls: 'dim' }],
      rows: () => [['07/10/2026', 'USD', 26280, 26640], ['07/10/2026', 'EUR', 30410, 31950], ['06/10/2026', 'USD', 26270, 26630], ['06/10/2026', 'EUR', 30390, 31930], ['30/09/2026', 'USD', 26250, 26610]]
        .map(([ngay, tt, mua, ban]) => ({ ngay, tt, mua, ban, nguon: 'Ngân hàng giao dịch chính' })) } },
    '1.11': { catalog: { them: 'Thêm loại thuế', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }, { k: 'ts', t: 'Thuế suất', num: true }, { k: 'gc', t: 'Áp dụng', cls: 'dim' }],
      rows: () => [['GTGT0', 'Thuế GTGT 0%', '0%', 'Hàng xuất khẩu'], ['GTGT5', 'Thuế GTGT 5%', '5%', 'Nước sạch, một số nông sản'], ['GTGT8', 'Thuế GTGT 8%', '8%', 'Dịch vụ ăn uống được giảm thuế'],
        ['GTGT10', 'Thuế GTGT 10%', '10%', 'Bia, rượu và hàng hoá khác'], ['KCT', 'Không chịu thuế', '—', 'Rau, thịt tươi sống chưa chế biến'], ['KKKNT', 'Không kê khai, tính nộp', '—', 'Khoản thu hộ']]
        .map(([ma, ten, ts, gc]) => ({ ma, ten, ts, gc })) } },
    // Gói Free khai số dư ban đầu quỹ ngay ở danh mục (cột, ô trong form), không còn màn Số dư ban đầu riêng; lưu cùng chỗ soDuQuy (T245)
    '1.12': { catalog: { them: 'Thêm quỹ', nhomLoc: 'loai', nhanLoc: 'Loại',
      tich: { nhan: 'Chưa gán phương thức thanh toán', macDinh: false, loc: r => !r._pttt?.length },   // Khoá sổ gói Free mở với ?tich=1 (T317)
      cols: goi => [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên quỹ' }, { k: 'loai', t: 'Loại' }, { k: 'stk', t: 'Số tài khoản' }, { k: 'cn', t: 'Cửa hàng', cls: 'dim' },
        { k: 'pttt', t: 'PTTT từ FABi', cls: 'dim', w: 260 },   // phương thức thanh toán map về quỹ (T264)
        ...(goi === 'S' || goi === 'PL' ? [{ k: 'soDu', t: 'Số dư ban đầu', num: true, w: 150 }] : [])],
      rows: () => DS_QUY_TIEN_112,
      phien: {
        gan: (r, s) => {
          const pt = ptttCuaQuy(s, String(r.ma))
          if (s.goi !== 'S' && s.goi !== 'PL') return { ...r, _pttt: pt, pttt: tomTatPttt(pt) }
          // Dòng cửa hàng sửa tay lúc lưu mở lại vẫn là đã sửa, dòng khác tự chia theo tổng (T750)
          const luu = s.soDuQuy?.[s.donVi]?.[String(r.ma)]
          const suaCn = Object.fromEntries((luu?.sua ?? []).filter(id => luu?.cn?.[id] !== undefined).map(id => [id, luu!.cn![id]]))
          return { ...r, _pttt: pt, pttt: tomTatPttt(pt), soDu: soDuQuyBanDau(s, String(r.ma)), _suaCn: suaCn }
        },
        luu: (v, s) => {
          // Lưu map PTTT của quỹ (T264) cùng số dư ban đầu gói Free (T245)
          const map = v.ma && Array.isArray(v._pttt) ? luuPtttQuy(s, String(v.ma), v._pttt) : {}
          if ((s.goi !== 'S' && s.goi !== 'PL') || !v.ma || v.soDu === undefined || v.soDu === '') return map
          const du = docTien(v.soDu)
          // Lưu phần chia từng cửa hàng cùng tổng (T750)
          const cn = chiaTheoForm(v)
          const chia = cn ? { cn, sua: Object.keys(v._suaCn ?? {}).filter(id => id in cn) } : null
          return { ...datSoDuQuy(s, String(v.ma), du, chia), ...map }
        },
      } } },
    // T154: bảng giá theo iFaster; giá nhập có nhà cung cấp, kho áp dụng để trống là mọi kho
    // T723: Thêm mới mở form nhiều dòng (một khoảng thời gian, nhiều nhà cung cấp, nhiều mặt hàng); bấm dòng vẫn sửa từng dòng
    // T724: 2 tab Giá nhập, Giá bán thay lọc Loại giá; Bộ lọc có Trạng thái, bỏ ĐVT, Đơn giá, VAT
    '1.14': { catalog: { them: 'Thêm bảng giá', formThem: ThemBangGia, khongLoc: ['loai', 'dvt', 'gia', 'vat'],
      tabTheo: { k: 'loai', ds: ['Giá nhập', 'Giá bán'], anCot: { 'Giá nhập': ['kh'], 'Giá bán': ['ncc'] } },
      cols: [{ k: 'ten', t: 'Hàng hoá' }, { k: 'dvt', t: 'ĐVT' }, { k: 'thoiGian', t: 'Thời gian áp dụng', w: 200 }, { k: 'gia', t: 'Đơn giá', num: true },
        { k: 'vat', t: 'VAT (%)', num: true }, { k: 'ncc', t: 'Nhà cung cấp', r: (r: Row) => r.ncc || '—' },
        // T723: giá bán có khách hàng (trống là mọi khách hàng); áp dụng theo cửa hàng thay cho kho
        { k: 'kh', t: 'Khách hàng', r: (r: Row) => r.loai === 'Giá bán' ? (r.kh || 'Tất cả khách hàng') : '—' }, { k: 'cuaHang', t: 'Cửa hàng áp dụng', r: (r: Row) => r.cuaHang || 'Tất cả cửa hàng' }],
      rows: () => [
        ...HANG.map(h => ({ loai: 'Giá bán', ten: h.ten, dvt: h.dvt, thoiGian: '01/09/2026 - 31/12/2026', gia: h.gia, vat: h.ts, ncc: '', kh: '', cuaHang: '' })),
        ...NVL.slice(0, 8).map(h => ({ loai: 'Giá nhập', ten: h.ten, dvt: h.dvt, thoiGian: '01/10/2026 - 31/03/2027', gia: h.gia, vat: h.ts,
          ncc: (NCC.find(n => n.nhom === h.nhom) ?? NCC[0]).ten, kh: '', cuaHang: '' })),
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
    '1.16': { catalog: { them: 'Thêm lý do nghiệp vụ', locGoi: (goi, r) => goi !== 'S' || r.dung === 'Thu tiền' || r.dung === 'Chi tiền',   // gói Standard chỉ lý do thu, chi (T144)
      nhomLoc: 'dung', nhanLoc: 'Dùng cho', cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Lý do nghiệp vụ' }, { k: 'dung', t: 'Dùng cho' },
        // Nguồn: lý do có sẵn từ FABi, lý do người dùng thêm là Thủ công (T708)
        { k: 'nguon', t: 'Nguồn', w: 100, r: r => r.nguon === 'FABi' ? 'FABi' : 'Thủ công' },
        // Là chi phí: chỉ lý do chi tiền có ô này (T231)
        { k: 'chiPhi', t: 'Là chi phí', c: true, w: 100, r: r => r.dung !== 'Chi tiền' ? '' : createElement('input', { type: 'checkbox', className: 'o-tich-xem', checked: Boolean(r.chiPhi), readOnly: true, tabIndex: -1, 'aria-label': 'Là chi phí' }) },
        // Chi phí phân bổ nhiều kỳ: loại trừ với Là chi phí, phiếu chi lý do này gợi ý tạo thẻ chi phí (T700)
        { k: 'phanBo', t: 'Chi phí phân bổ nhiều kỳ', c: true, w: 120, r: r => r.dung !== 'Chi tiền' ? '' : createElement('input', { type: 'checkbox', className: 'o-tich-xem', checked: Boolean(r.phanBo), readOnly: true, tabIndex: -1, 'aria-label': 'Chi phí phân bổ nhiều kỳ' }) },
        // Nhóm của lý do là chi phí (T473), tên nhóm dài nên cắt "..." trong ô, rê chuột xem đủ
        { k: 'nhomCp', t: 'Nhóm lý do', w: 320, r: r => !r.chiPhi || !r.nhomCp ? '' : createElement('span', { className: 'o-cat', title: String(r.nhomCp) }, String(r.nhomCp)) }],
      rows: () => LY_DO,
      phien: { gan: ganLyDo, luu: luuLyDo } } },   // giữ tích Là chi phí, Chi phí phân bổ nhiều kỳ, nhóm lý do đã sửa (T700)
  }, NGAN).filter(sc => sc.code !== '1.13').map(sc => ({ ...sc, icon: BIEU_TUONG[sc.code ?? ''] ?? sc.icon, ...(AN_GOI_PLUS.includes(sc.code ?? '') ? { anTab: ['PL' as const] } : {}) })).flatMap(sc => {
    if (sc.code === '1.2') return [sc, nhomHangHoa]
    if (sc.code === '1.4') return [sc, congThucCheBien]
    if (sc.code === '1.5') return [sc, nhomDoiTuong]
    if (sc.code === '1.6') return [sc, nhomMucChiPhi]
    if (sc.code === '1.16') return [sc, nhomLyDo]   // Nhóm lý do nghiệp vụ ngay sau Lý do nghiệp vụ (T473)
    if (sc.code === '1.7') return [sc, nhomCongViec]
    if (sc.code === '1.8') return [sc, nhomKho, cuaHang]   // bỏ danh mục Thương hiệu (T166)
    if (sc.code === '1.12') return [sc, phuongThucThanhToan]
    return [sc]
  }),
}
export default danhMuc
