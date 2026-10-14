// Cấu hình mẫu từng sổ, báo cáo theo chế độ kế toán (kế hoạch mục 5, 7.2). Ký hiệu chưa đối chiếu văn bản gốc, chờ kế toán trưởng duyệt (T04).
import type { CheDo } from '../../app/che-do'
import type { Kho } from '../../ui/bao-cao/ToGiay'
import { CHI_NHANH, TK_NGAN_HANG } from '../../data/mock'
import { dsDonVi, loaiHinhDv, type Session } from '../../app/session'
import { DON_VI } from '../../data/mock'
import { thTT58 } from './tt58'
import { DS_HANG_S2D, DS_NHOM_HANG_S2D, DS_QUY_S2E, KENH_BAN } from './tt152'
import { KHOA_LOC_NGUON, LOC_BAN, LOC_KHO_BC, LOC_MUA } from './loc-nguon'

export type LoaiBC = 'so' | 'bctc' | 'baocao' | 'tokhai'
export interface LocBC {
  k: string; nhan: string; kieu: 'chon' | 'chonNhieu'
  ds?: (cnId?: string) => string[]   // danh sách chọn cố định theo chi nhánh trên thanh trên, không lấy từ dòng bảng (T54)
  cheDo?: CheDo[]                    // chỉ hiện ở các chế độ này; thiếu là mọi chế độ (T179)
}

/** Bộ lọc Quỹ tiền của sổ thu chi; chi nhánh theo thanh trên. Số liệu sổ tính lại theo lựa chọn để tồn đầu, tồn cuối đúng (T54) */
const cnCua = (id?: string) => CHI_NHANH.filter(c => !id || c.id === id)
export const tenQuyTm = (ngan: string) => `Quỹ tiền mặt ${ngan}`
export const tenTkNh = (t: { so: string; nh: string }) => `${t.nh.split(',')[0]} ${t.so}`


/** Cách tính thuế của hộ kinh doanh, quyết định bộ sổ TT152 (T179): nhóm 1 (S1a), TNCN theo % doanh thu (S2a), theo lợi nhuận (S2b đến S2e) */
export type CachHkd = 'n1' | 'doanhThu' | 'loiNhuan'
/** Phần phiên dùng để chọn báo cáo theo đơn vị đang làm việc */
export type PhienBC = Partial<Pick<Session, 'ppGtgt' | 'ppTndn' | 'ttDv' | 'donVi' | 'dvMoi'>>
/** Đơn vị đang làm việc là hộ kinh doanh */
export const laHkd = (s?: PhienBC) => {
  if (!s?.donVi) return false
  const dv = dsDonVi({ dvMoi: s.dvMoi, ttDv: s.ttDv }).find(d => d.id === s.donVi) ?? DON_VI[0]
  return loaiHinhDv({ ttDv: s.ttDv }, dv) === 'hkd'
}
/** Nhóm 1 dùng S1a; nhóm 3, 4 theo lợi nhuận; nhóm 2 theo lựa chọn khai ở Thông tin đơn vị (mặc định như ở đó: nhóm 1, theo doanh thu) */
export function cachHkd(s?: PhienBC): CachHkd {
  const tt = s?.donVi ? s.ttDv?.[s.donVi] : undefined
  const nhom = tt?.nhom ?? 1
  return nhom === 1 ? 'n1' : nhom >= 3 ? 'loiNhuan' : tt?.ppHkd ?? 'doanhThu'
}

export interface CauHinhBC {
  loai: LoaiBC
  kho: Kho
  cheDo?: CheDo[]                          // thông tư áp dụng; thiếu là mọi thông tư (T97)
  anTam?: CheDo[]                          // ẩn tạm ở các chế độ chưa có mẫu Trum cung cấp (T122); bỏ chế độ khỏi danh sách để hiện lại
  th?: (1 | 2 | 3 | 4)[]                   // trường hợp TT58 áp dụng; thiếu là mọi TH (T108, T171)
  hkd?: CachHkd[]                          // cách tính thuế của hộ kinh doanh TT152 áp dụng; thiếu là mọi cách (T179)
  kyHieu?: Partial<Record<CheDo, string>>   // thiếu chế độ nào thì đầu trang chế độ đó không ghi "Mẫu số"
  ten?: Partial<Record<CheDo, string>>      // tên in trên tờ theo chế độ, thiếu thì giữ tên đang có
  congCot?: string[]                        // sổ: cột cộng chuyển trang
  khoa?: boolean                            // bố cục pháp định: không cho ẩn, đổi thứ tự cột (dùng ở đợt sau)
  loc?: LocBC[]                             // bộ lọc riêng (ngoài kỳ, chi nhánh)
  nhomDuoc?: string[]                       // khoá cột được gom nhóm
  anKhongPS?: boolean                       // có tuỳ chọn "Ẩn dòng không phát sinh"
  phanTrang?: number                        // báo cáo nhiều dòng: tờ trên màn hình chỉ vẽ ngần ấy dòng mỗi trang, in và xuất vẫn đủ dòng (T157)
}

const baoCao = (kho: Kho, opt?: { loc?: LocBC[]; nhomDuoc?: string[]; anKhongPS?: boolean; phanTrang?: number }): CauHinhBC => ({ loai: 'baocao', kho, ...opt })

const ALL: CheDo[] = ['TT152', 'TT58', 'TT133', 'TT99']

export const CAU_HINH_BC: Record<string, CauHinhBC> = {
  '2.2.1': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S04a-DNN', TT99: 'S07-DN' }, congCot: ['no', 'co'],
    loc: [{ k: 'locQuy', nhan: 'Quỹ tiền', kieu: 'chon', ds: id => cnCua(id).map(c => tenQuyTm(c.ngan)) }] },
  '2.2.2': { loai: 'so', kho: 'ngang', anTam: ALL, kyHieu: { TT133: 'S19-DNN', TT99: 'S38-DN' }, ten: { TT133: 'Sổ chi tiết các tài khoản', TT99: 'Sổ chi tiết các tài khoản' }, congCot: ['no', 'co'] },
  '2.2.3': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S05-DNN', TT99: 'S08-DN' }, ten: { TT133: 'Sổ tiền gửi ngân hàng', TT99: 'Sổ tiền gửi ngân hàng' }, congCot: ['no', 'co'],
    loc: [{ k: 'locQuy', nhan: 'Quỹ tiền', kieu: 'chon', ds: () => TK_NGAN_HANG.map(tenTkNh) }] },
  '2.2.4': { loai: 'so', kho: 'ngang', anTam: ALL, kyHieu: { TT133: 'S03a-DNN', TT99: 'S03a-DN' }, ten: { TT133: 'Sổ nhật ký chung', TT99: 'Sổ nhật ký chung' }, congCot: ['no', 'co'] },
  '2.2.5': { loai: 'so', kho: 'ngang', anTam: ['TT133', 'TT99'], kyHieu: { TT58: 'S4a-DNSN', TT133: 'S12-DNN', TT99: 'S31-DN' }, anKhongPS: true,
    loc: [{ k: 'ten', nhan: 'Đối tượng', kieu: 'chonNhieu' }] },
  '2.2.6': { loai: 'so', kho: 'ngang', anTam: ALL, kyHieu: { TT133: 'S15-DNN', TT99: 'S34-DN' }, congCot: ['no', 'co'] },
  '2.2.7': { loai: 'so', kho: 'doc', cheDo: ['TT58', 'TT152'], th: [2, 4], hkd: ['loiNhuan'], kyHieu: { TT152: 'S2e-HKD', TT58: 'S2d-DNSN' },
    congCot: ['thu', 'chi'],
    loc: [{ k: 'quy', nhan: 'Quỹ', kieu: 'chonNhieu', cheDo: ['TT152'], ds: () => DS_QUY_S2E }] },   // S2e-HKD lọc theo quỹ (T179)
  '2.2.8': baoCao('doc', {
    loc: [{ k: 'locQuy', nhan: 'Quỹ tiền', kieu: 'chon', ds: () => [...CHI_NHANH.map(c => tenQuyTm(c.ngan)), ...TK_NGAN_HANG.map(tenTkNh)] }],
  }),
  '2.2.9': baoCao('doc'),
  '3.2.1': baoCao('ngang', { loc: [{ k: 'nhom', nhan: 'Nhóm món', kieu: 'chon' }], nhomDuoc: ['nhom'], anKhongPS: true }),
  '3.2.2': baoCao('ngang'),
  '3.2.3': baoCao('ngang', { anKhongPS: true }),
  '3.2.4': baoCao('ngang', { loc: [{ k: 'doiTuong', nhan: 'Đối tượng', kieu: 'chon' }], nhomDuoc: ['doiTuong', 'ngay'], anKhongPS: true }),
  '3.2.5': { loai: 'so', kho: 'ngang', anTam: ['TT133', 'TT99'], th: [1, 2, 3], kyHieu: { TT152: 'S2a-HKD', TT58: 'S1-DNSN', TT133: 'S16-DNN', TT99: 'S35-DN' }, ten: { TT152: 'Sổ doanh thu bán hàng hoá, dịch vụ', TT58: 'Sổ doanh thu bán hàng hoá, dịch vụ', TT133: 'Sổ chi tiết bán hàng', TT99: 'Sổ chi tiết bán hàng' }, congCot: ['dt', 'vat', 'tong'],
    loc: [{ k: 'kenh', nhan: 'Kênh bán', kieu: 'chonNhieu', cheDo: ['TT152'], ds: () => KENH_BAN }] },   // S1a, S2a, S2b-HKD lọc theo kênh bán như iFaster (T179)
  // Bán hàng theo ngày, tổng hợp, chi tiết bán hàng (T157)
  // Bộ lọc hàng hoá, nhóm hàng hoá, khách hàng lọc dòng món trước khi cộng (T207)
  '3.2.6': baoCao('doc', { loc: LOC_BAN, anKhongPS: true }),
  '3.2.7': baoCao('ngang', { loc: LOC_BAN, nhomDuoc: ['nhom'], anKhongPS: true }),
  '3.2.8': baoCao('ngang', { loc: LOC_BAN, nhomDuoc: ['ngay', 'so', 'ten'], anKhongPS: true, phanTrang: 100 }),
  '3.2.9': baoCao('ngang', { loc: [{ k: 'ten', nhan: 'Khách hàng', kieu: 'chonNhieu' }], anKhongPS: true }),   // Công nợ khách hàng theo iFaster (T185)
  // Bộ lọc kho, hàng hoá, nhóm hàng hoá, nhà cung cấp lọc phiếu, dòng hàng trước khi cộng (T207)
  '4.2.1': baoCao('ngang', { loc: [...LOC_MUA, { k: 'nguon', nhan: 'Nguồn', kieu: 'chon' }], nhomDuoc: ['doiTuong', 'ngay'], anKhongPS: true }),
  '4.2.2': baoCao('ngang', { loc: LOC_MUA, anKhongPS: true }),   // thêm Thành tiền, Chiết khấu, Tiền trước thuế nên in khổ ngang (T200)
  '4.2.3': baoCao('ngang', { loc: [{ k: 'ten', nhan: 'Nhà cung cấp', kieu: 'chonNhieu' }], anKhongPS: true }),   // Công nợ nhà cung cấp theo iFaster (T185)
  '4.2.4': baoCao('doc', { anKhongPS: true }),
  '4.2.5': baoCao('ngang', { loc: [{ k: 'doiTuong', nhan: 'Nhà cung cấp', kieu: 'chon' }, { k: 'ten', nhan: 'Mặt hàng', kieu: 'chonNhieu' }], nhomDuoc: ['doiTuong', 'ten', 'ngay'], anKhongPS: true }),
  '4.2.7': baoCao('ngang', {   // Bảng kê mua hàng theo hàng hoá (T200)
    loc: LOC_MUA,
    nhomDuoc: ['doiTuong', 'ten', 'ngay'], anKhongPS: true, phanTrang: 100,
  }),
  '4.2.6': baoCao('ngang', { loc: LOC_MUA, nhomDuoc: ['ngay'], anKhongPS: true }),
  '5.2.1': baoCao('doc', { anKhongPS: true }),   // thẻ kho, xuất nhập tồn là báo cáo quản trị kho kiểu iPOS Inventory, mọi thông tư, không ký hiệu mẫu, Trum chốt 11/10/2026 (T157)
  '5.2.2': baoCao('ngang', { loc: [{ k: 'kho', nhan: 'Kho', kieu: 'chon' }, { k: 'loai', nhan: 'Loại phiếu', kieu: 'chon' }], nhomDuoc: ['kho', 'loai', 'ngay'], anKhongPS: true }),
  '5.2.3': baoCao('ngang', { loc: LOC_KHO_BC.filter(l => l.k !== KHOA_LOC_NGUON.kho), anKhongPS: true }),   // kho chọn trên thanh công cụ của màn (T207)
  '5.2.4': baoCao('doc', { loc: [{ k: 'kho', nhan: 'Kho', kieu: 'chon' }], nhomDuoc: ['kho'], anKhongPS: true }),
  '5.2.5': baoCao('ngang', { anKhongPS: true }),
  '5.2.6': baoCao('ngang', { anKhongPS: true }),
  '5.2.7': baoCao('ngang', { anKhongPS: true }),
  '5.2.8': { loai: 'so', kho: 'ngang', anTam: ['TT133', 'TT99'], th: [2, 4], hkd: ['loiNhuan'], kyHieu: { TT152: 'S2d-HKD', TT58: 'S2c-DNSN', TT133: 'S06-DNN', TT99: 'S10-DN' }, ten: { TT152: 'Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hoá' },
    loc: [   // S2d-HKD là sổ một mặt hàng: chọn một hàng hoá, một nhóm hàng hoá (T179)
      { k: 'hang', nhan: 'Hàng hoá', kieu: 'chon', cheDo: ['TT152'], ds: () => DS_HANG_S2D },
      { k: 'nhomHang', nhan: 'Nhóm hàng hoá', kieu: 'chon', cheDo: ['TT152'], ds: () => DS_NHOM_HANG_S2D },
    ] },
  // Tổng hợp, chi tiết nhập kho, xuất kho, hàng trả lại (T157)
  // Bộ lọc kho, hàng hoá, nhóm hàng hoá lọc dòng hàng trước khi cộng (T207)
  '5.2.9': baoCao('ngang', { loc: LOC_KHO_BC, anKhongPS: true }),
  '5.2.10': baoCao('ngang', { loc: [...LOC_KHO_BC, { k: 'loai', nhan: 'Loại phiếu', kieu: 'chon' }], nhomDuoc: ['kho', 'loai', 'ngay'], anKhongPS: true, phanTrang: 100 }),
  '5.2.11': baoCao('ngang', { loc: LOC_KHO_BC, anKhongPS: true }),
  '5.2.12': baoCao('ngang', { loc: [...LOC_KHO_BC, { k: 'loai', nhan: 'Loại phiếu', kieu: 'chon' }], nhomDuoc: ['kho', 'loai', 'ngay'], anKhongPS: true, phanTrang: 100 }),
  '5.2.13': baoCao('doc', { loc: [{ k: 'loai', nhan: 'Loại', kieu: 'chon' }], nhomDuoc: ['loai'], anKhongPS: true }),
  '5.2.14': baoCao('ngang', { loc: [{ k: 'kho', nhan: 'Kho', kieu: 'chon' }, { k: 'loai', nhan: 'Loại phiếu', kieu: 'chon' }], nhomDuoc: ['kho', 'loai', 'ngay'], anKhongPS: true, phanTrang: 100 }),
  '6.2.1': baoCao('ngang', { loc: [{ k: 'doiTuong', nhan: 'Người bán', kieu: 'chon' }], nhomDuoc: ['doiTuong', 'ngay'], anKhongPS: true }),
  '6.2.2': baoCao('ngang', { nhomDuoc: ['ngay'], anKhongPS: true }),
  '6.2.3': { loai: 'tokhai', kho: 'doc', anTam: ALL, khoa: true },
  '6.2.4': { loai: 'so', kho: 'doc', anTam: ['TT152', 'TT133', 'TT99'], th: [3, 4], kyHieu: { TT58: 'S3b-DNSN', TT133: 'S25-DNN', TT99: 'S61-DN' } },
  '6.2.5': { loai: 'so', kho: 'doc', cheDo: ['TT152', 'TT58'], kyHieu: { TT152: 'S3a-HKD', TT58: 'S4c-DNSN' } },
  '7.2.1': { loai: 'so', kho: 'ngang', anTam: ['TT152', 'TT133', 'TT99'], kyHieu: { TT58: 'S4b-DNSN', TT133: 'S09-DNN', TT99: 'S21-DN' }, anKhongPS: true },
  '7.2.2': baoCao('ngang', { anKhongPS: true }),
  '7.2.3': { loai: 'so', kho: 'doc', anTam: ALL, kyHieu: { TT133: 'S11-DNN', TT99: 'S23-DN' } },
  '7.2.4': { loai: 'so', kho: 'ngang', anTam: ALL, kyHieu: { TT133: 'S10-DNN', TT99: 'S22-DN' } },
  '8.2.1': baoCao('ngang', { anKhongPS: true }),
  '8.2.2': baoCao('ngang', { anKhongPS: true }),
  '8.2.3': baoCao('ngang', { anKhongPS: true }),
  '8.2.4': baoCao('ngang', { anKhongPS: true }),
  '9.2.1': { loai: 'so', kho: 'ngang', anTam: ALL, kyHieu: { TT133: 'S17-DNN', TT99: 'S36-DN' } },
  '9.2.2': { loai: 'so', kho: 'ngang', anTam: ALL, kyHieu: { TT133: 'S18-DNN', TT99: 'S37-DN' } },
  '10.2.1': { loai: 'bctc', kho: 'ngang', anTam: ALL, khoa: true, kyHieu: { TT133: 'F01-DNN', TT99: 'S06-DN' }, ten: { TT133: 'Bảng cân đối tài khoản', TT99: 'Bảng cân đối số phát sinh' } },
  '10.2.2': { loai: 'bctc', kho: 'doc', anTam: ['TT152', 'TT133', 'TT99'], khoa: true, th: [2, 4], kyHieu: { TT58: 'B01-DNSN', TT133: 'B01a-DNN', TT99: 'B01-DN' } },
  '10.2.3': { loai: 'bctc', kho: 'doc', anTam: ['TT133', 'TT99'], khoa: true, th: [2, 4], kyHieu: { TT58: 'B02-DNSN', TT133: 'B02-DNN', TT99: 'B02-DN' } },
  '10.2.4': { loai: 'bctc', kho: 'doc', anTam: ALL, khoa: true, kyHieu: { TT133: 'B03-DNN', TT99: 'B03-DN' } },
  '10.2.5': { loai: 'bctc', kho: 'doc', anTam: ALL, khoa: true, kyHieu: { TT133: 'B09-DNN', TT99: 'B09-DN' } },
  '10.3.1': baoCao('ngang', { anKhongPS: true }),
  '10.4.1': { loai: 'so', kho: 'ngang', cheDo: ['TT58', 'TT152'], th: [2, 4], hkd: ['loiNhuan'], kyHieu: { TT152: 'S2c-HKD', TT58: 'S2b-DNSN' } },
  '10.4.2': { loai: 'so', kho: 'doc', anTam: ['TT152', 'TT133', 'TT99'], kyHieu: { TT58: 'S4d-DNSN', TT133: 'S23-DNN', TT99: 'S51-DN' } },
  '10.4.3': baoCao('doc', {
    loc: [
      { k: 'kmcp', nhan: 'Khoản mục chi phí', kieu: 'chon', ds: () => ['Tiền điện', 'Tiền nước', 'Tiền gas công nghiệp', 'Thuê mặt bằng Lê Lợi', 'Thuê mặt bằng Nguyễn Trãi', 'Thuê mặt bằng Thảo Điền', 'Lương nhân viên bếp', 'Lương nhân viên phục vụ', 'Lương quản lý chi nhánh', 'Quảng cáo Facebook & TikTok', 'Phí giao hàng Grab & ShopeeFood', 'Dụng cụ vệ sinh & hoá chất', 'Văn phòng phẩm & in ấn'] },
      { k: 'nhomCp', nhan: 'Nhóm khoản mục chi phí', kieu: 'chon', ds: () => ['Chi phí tiện ích', 'Chi phí mặt bằng', 'Chi phí nhân công', 'Chi phí bán hàng', 'Chi phí quản lý'] },
    ],
    nhomDuoc: ['nhomCp', 'kmcp'],
    anKhongPS: true,
  }),
}

/** Báo cáo còn giữ (T171, PhuongXT chốt 13/10/2026): mọi gói chỉ còn Sổ quỹ tiền mặt, Sổ ngân hàng;
 *  chế độ TT58 thêm bộ sổ S1 đến S4d-DNSN và báo cáo tài chính B01, B02-DNSN. Báo cáo khác ẩn ở mọi gói, cấu hình vẫn giữ để mở lại */
const GIU_MOI_CHE_DO = ['2.2.1', '2.2.3']
/** Báo cáo lấy theo danh sách iFaster, mở mọi gói, mọi chế độ, PhuongXT chốt 13/10/2026 (T185): quỹ tiền,
 *  công nợ nhà cung cấp 4.2.3, khách hàng 3.2.9, quản trị, kho, mua hàng, bán hàng. Sổ công nợ 2.2.5 bỏ (PhuongXT: thay bằng Công nợ nhà cung cấp, Công nợ khách hàng theo iFaster); TT58 vẫn giữ S4a-DNSN. Không lọc theo anTam, cheDo, trường hợp thuế; muốn ẩn ở gói nào thì bỏ mã khỏi đây hoặc lọc thêm */
export const MO_IFASTER = ['2.2.8', '2.2.9', '4.2.3', '3.2.9', '4.2.7', '10.2.3', '10.4.3', '5.2.3', '5.2.11', '5.2.12', '5.2.9', '5.2.10', '4.2.2', '4.2.1', '4.2.6', '3.2.7', '3.2.8', '3.2.6',
  '5.2.1']   // Thẻ kho mở lại mọi gói để bấm hàng hoá ở Xuất nhập tồn mở thẻ kho, PhuongXT chốt 14/10/2026 (T211)
/** Báo cáo chỉ mở từ báo cáo khác, không hiện ở danh sách báo cáo, menu, tìm kiếm: Chi tiết mua hàng 4.2.1 mở khi bấm nhà cung cấp ở Tổng hợp mua hàng, PhuongXT 13/10/2026 (T200) */
export const CHI_MO_TU_BC = ['4.2.1']
const GIU_TT58 = ['2.2.5', '2.2.7', '3.2.5', '5.2.8', '6.2.4', '6.2.5', '7.2.1', '10.2.2', '10.2.3', '10.4.1', '10.4.2']
/** Hộ kinh doanh TT152 (T179): S1a, S2a, S2b-HKD (3.2.5), S2c (10.4.1), S2d (5.2.8), S2e (2.2.7); doanh nghiệp gói Free cũng chạy TT152 nhưng không có các sổ này */
const GIU_TT152_HKD = ['2.2.7', '3.2.5', '5.2.8', '10.4.1']
export const giuBC = (code: string | undefined, cheDo: CheDo, hkd = false) =>
  !!code && (GIU_MOI_CHE_DO.includes(code) || MO_IFASTER.includes(code) || (cheDo === 'TT58' && GIU_TT58.includes(code)) || (cheDo === 'TT152' && hkd && GIU_TT152_HKD.includes(code)))

/** Ký hiệu mẫu theo chế độ; Sổ doanh thu 3.2.5 đổi mẫu theo trường hợp thuế: TT58 S1, S2a, S3a-DNSN; hộ kinh doanh TT152 S1a, S2a, S2b-HKD (T179) */
export function kyHieuBC(code: string | undefined, cheDo: CheDo, s?: PhienBC): string | undefined {
  if (code === '3.2.5' && cheDo === 'TT58') {
    const th = thTT58(s?.ppGtgt, s?.ppTndn)
    return th === 1 ? 'S1-DNSN' : th === 2 ? 'S2a-DNSN' : 'S3a-DNSN'
  }
  if (code === '3.2.5' && cheDo === 'TT152') {
    const c = cachHkd(s)
    return c === 'n1' ? 'S1a-HKD' : c === 'doanhThu' ? 'S2a-HKD' : 'S2b-HKD'
  }
  return code ? CAU_HINH_BC[code]?.kyHieu?.[cheDo] : undefined
}

/** S2b-HKD (hộ kinh doanh tính thuế theo lợi nhuận) chỉ có ở gói Standard như RoadMap; gói Free không hiện Sổ doanh thu 3.2.5 (T179) */
export const anSoHkdGoiFree = (code: string | undefined, goi: string, s?: PhienBC) => code === '3.2.5' && goi === 'F' && cachHkd(s) === 'loiNhuan'

/** Tên in trên tờ theo chế độ; S1a-HKD (hộ kinh doanh nhóm 1) in Sổ chi tiết doanh thu như iFaster (T179) */
export function tenBC(code: string | undefined, cheDo: CheDo, s?: PhienBC): string | undefined {
  if (code === '3.2.5' && cheDo === 'TT152' && cachHkd(s) === 'n1') return 'Sổ chi tiết doanh thu bán hàng hoá, dịch vụ'
  return code ? CAU_HINH_BC[code]?.ten?.[cheDo] : undefined
}

export const cauHinhBC = (code?: string) => code ? CAU_HINH_BC[code] : undefined
