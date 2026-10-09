// Cấu hình mẫu từng sổ, báo cáo theo chế độ kế toán (kế hoạch mục 5, 7.2). Ký hiệu chưa đối chiếu văn bản gốc, chờ kế toán trưởng duyệt (T04).
import type { CheDo } from '../../app/che-do'
import type { Kho } from '../../ui/bao-cao/ToGiay'
import { CHI_NHANH, TK_NGAN_HANG } from '../../data/mock'

export type LoaiBC = 'so' | 'bctc' | 'baocao' | 'tokhai'
export interface LocBC {
  k: string; nhan: string; kieu: 'chon' | 'chonNhieu'
  ds?: (cnId?: string) => string[]   // danh sách chọn cố định theo chi nhánh trên thanh trên, không lấy từ dòng bảng (T54)
}

/** Bộ lọc Quỹ tiền của sổ thu chi; chi nhánh theo thanh trên. Số liệu sổ tính lại theo lựa chọn để tồn đầu, tồn cuối đúng (T54) */
const cnCua = (id?: string) => CHI_NHANH.filter(c => !id || c.id === id)
export const tenQuyTm = (ngan: string) => `Quỹ tiền mặt ${ngan}`
export const tenTkNh = (t: { so: string; nh: string }) => `${t.nh.split(',')[0]} ${t.so}`


export interface CauHinhBC {
  loai: LoaiBC
  kho: Kho
  kyHieu?: Partial<Record<CheDo, string>>   // thiếu chế độ nào thì đầu trang chế độ đó không ghi "Mẫu số"
  ten?: Partial<Record<CheDo, string>>      // tên in trên tờ theo chế độ, thiếu thì giữ tên đang có
  congCot?: string[]                        // sổ: cột cộng chuyển trang
  khoa?: boolean                            // bố cục pháp định: không cho ẩn, đổi thứ tự cột (dùng ở đợt sau)
  loc?: LocBC[]                             // bộ lọc riêng (ngoài kỳ, chi nhánh)
  nhomDuoc?: string[]                       // khoá cột được gom nhóm
  anKhongPS?: boolean                       // có tuỳ chọn "Ẩn dòng không phát sinh"
}

const baoCao = (kho: Kho, opt?: { loc?: LocBC[]; nhomDuoc?: string[]; anKhongPS?: boolean }): CauHinhBC => ({ loai: 'baocao', kho, ...opt })

export const CAU_HINH_BC: Record<string, CauHinhBC> = {
  '2.2.1': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S04a-DNN', TT99: 'S07-DN' }, congCot: ['no', 'co'],
    loc: [{ k: 'locQuy', nhan: 'Quỹ tiền', kieu: 'chon', ds: id => cnCua(id).map(c => tenQuyTm(c.ngan)) }] },
  '2.2.2': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S19-DNN', TT99: 'S38-DN' }, ten: { TT133: 'Sổ chi tiết các tài khoản', TT99: 'Sổ chi tiết các tài khoản' }, congCot: ['no', 'co'] },
  '2.2.3': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S05-DNN', TT99: 'S08-DN' }, ten: { TT133: 'Sổ tiền gửi ngân hàng', TT99: 'Sổ tiền gửi ngân hàng' }, congCot: ['no', 'co'],
    loc: [{ k: 'locQuy', nhan: 'Quỹ tiền', kieu: 'chon', ds: () => TK_NGAN_HANG.map(tenTkNh) }] },
  '2.2.4': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S03a-DNN', TT99: 'S03a-DN' }, ten: { TT133: 'Sổ nhật ký chung', TT99: 'Sổ nhật ký chung' }, congCot: ['no', 'co'] },
  '2.2.5': { loai: 'so', kho: 'ngang', kyHieu: { TT58: 'S4a-DNSN', TT133: 'S12-DNN', TT99: 'S31-DN' }, anKhongPS: true,
    loc: [{ k: 'ten', nhan: 'Đối tượng', kieu: 'chonNhieu' }] },
  '2.2.6': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S15-DNN', TT99: 'S34-DN' }, congCot: ['no', 'co'] },
  '2.2.7': { loai: 'so', kho: 'doc', kyHieu: { TT152: 'S2e-HKD', TT58: 'S2d-DNSN' }, congCot: ['thu', 'chi'] },
  '3.2.1': baoCao('ngang', { loc: [{ k: 'nhom', nhan: 'Nhóm món', kieu: 'chon' }], nhomDuoc: ['nhom'], anKhongPS: true }),
  '3.2.2': baoCao('ngang'),
  '3.2.3': baoCao('ngang', { anKhongPS: true }),
  '3.2.4': baoCao('ngang', { loc: [{ k: 'doiTuong', nhan: 'Đối tượng', kieu: 'chon' }], nhomDuoc: ['doiTuong', 'ngay'], anKhongPS: true }),
  '3.2.5': { loai: 'so', kho: 'ngang', kyHieu: { TT152: 'S1a-HKD', TT58: 'S1-DNSN', TT133: 'S16-DNN', TT99: 'S35-DN' }, ten: { TT152: 'Sổ doanh thu bán hàng hoá, dịch vụ', TT58: 'Sổ doanh thu bán hàng hoá, dịch vụ', TT133: 'Sổ chi tiết bán hàng', TT99: 'Sổ chi tiết bán hàng' }, congCot: ['dt', 'vat', 'tong'] },
  '4.2.1': baoCao('ngang', { loc: [{ k: 'doiTuong', nhan: 'Nhà cung cấp', kieu: 'chon' }, { k: 'nguon', nhan: 'Nguồn', kieu: 'chon' }], nhomDuoc: ['doiTuong', 'ngay'], anKhongPS: true }),
  '4.2.2': baoCao('doc', { anKhongPS: true }),
  '5.2.1': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S08-DNN', TT99: 'S12-DN' }, congCot: ['nhap', 'xuat'] },
  '5.2.2': baoCao('ngang', { loc: [{ k: 'kho', nhan: 'Kho', kieu: 'chon' }, { k: 'loai', nhan: 'Loại phiếu', kieu: 'chon' }], nhomDuoc: ['kho', 'loai', 'ngay'], anKhongPS: true }),
  '5.2.3': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S07-DNN', TT99: 'S11-DN' }, anKhongPS: true },
  '5.2.4': baoCao('doc', { loc: [{ k: 'kho', nhan: 'Kho', kieu: 'chon' }], nhomDuoc: ['kho'], anKhongPS: true }),
  '5.2.5': baoCao('ngang', { anKhongPS: true }),
  '5.2.6': baoCao('ngang', { anKhongPS: true }),
  '5.2.7': baoCao('ngang', { anKhongPS: true }),
  '5.2.8': { loai: 'so', kho: 'ngang', kyHieu: { TT152: 'S2d-HKD', TT58: 'S2c-DNSN', TT133: 'S06-DNN', TT99: 'S10-DN' } },
  '6.2.1': baoCao('ngang', { loc: [{ k: 'doiTuong', nhan: 'Người bán', kieu: 'chon' }], nhomDuoc: ['doiTuong', 'ngay'], anKhongPS: true }),
  '6.2.2': baoCao('ngang', { nhomDuoc: ['ngay'], anKhongPS: true }),
  '6.2.3': { loai: 'tokhai', kho: 'doc', khoa: true },
  '6.2.4': { loai: 'so', kho: 'doc', kyHieu: { TT58: 'S3b-DNSN', TT133: 'S25-DNN', TT99: 'S61-DN' } },
  '6.2.5': { loai: 'so', kho: 'doc', kyHieu: { TT152: 'S3a-HKD', TT58: 'S4c-DNSN' } },
  '7.2.1': { loai: 'so', kho: 'ngang', kyHieu: { TT58: 'S4b-DNSN', TT133: 'S09-DNN', TT99: 'S21-DN' }, anKhongPS: true },
  '7.2.2': baoCao('ngang', { anKhongPS: true }),
  '7.2.3': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S11-DNN', TT99: 'S23-DN' } },
  '7.2.4': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S10-DNN', TT99: 'S22-DN' } },
  '8.2.1': baoCao('ngang', { anKhongPS: true }),
  '8.2.2': baoCao('ngang', { anKhongPS: true }),
  '8.2.3': baoCao('ngang', { anKhongPS: true }),
  '8.2.4': baoCao('ngang', { anKhongPS: true }),
  '9.2.1': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S17-DNN', TT99: 'S36-DN' } },
  '9.2.2': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S18-DNN', TT99: 'S37-DN' } },
  '10.2.1': { loai: 'bctc', kho: 'ngang', khoa: true, kyHieu: { TT133: 'F01-DNN', TT99: 'S06-DN' }, ten: { TT133: 'Bảng cân đối tài khoản', TT99: 'Bảng cân đối số phát sinh' } },
  '10.2.2': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT58: 'B01-DNSN', TT133: 'B01a-DNN', TT99: 'B01-DN' } },
  '10.2.3': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT58: 'B02-DNSN', TT133: 'B02-DNN', TT99: 'B02-DN' } },
  '10.2.4': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT133: 'B03-DNN', TT99: 'B03-DN' } },
  '10.2.5': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT133: 'B09-DNN', TT99: 'B09-DN' } },
  '10.3.1': baoCao('ngang', { anKhongPS: true }),
  '10.4.1': { loai: 'so', kho: 'ngang', kyHieu: { TT152: 'S2c-HKD', TT58: 'S2b-DNSN' } },
  '10.4.2': { loai: 'so', kho: 'doc', kyHieu: { TT58: 'S4d-DNSN', TT133: 'S23-DNN', TT99: 'S51-DN' } },
}

export const cauHinhBC = (code?: string) => code ? CAU_HINH_BC[code] : undefined
