// Cấu hình mẫu từng sổ, báo cáo theo chế độ kế toán (kế hoạch mục 5, 7.2). Ký hiệu chưa đối chiếu văn bản gốc, chờ kế toán trưởng duyệt (T04).
import type { CheDo } from '../../app/che-do'
import type { Kho } from '../../ui/bao-cao/ToGiay'

export type LoaiBC = 'so' | 'bctc' | 'baocao' | 'tokhai'
export interface CauHinhBC {
  loai: LoaiBC
  kho: Kho
  kyHieu?: Partial<Record<CheDo, string>>   // thiếu chế độ nào thì đầu trang chế độ đó không ghi "Mẫu số"
  ten?: Partial<Record<CheDo, string>>      // tên in trên tờ theo chế độ, thiếu thì giữ tên đang có
  congCot?: string[]                        // sổ: cột cộng chuyển trang
  khoa?: boolean                            // bố cục pháp định: không cho ẩn, đổi thứ tự cột (dùng ở đợt sau)
}

const baoCao = (kho: Kho): CauHinhBC => ({ loai: 'baocao', kho })

export const CAU_HINH_BC: Record<string, CauHinhBC> = {
  '2.2.1': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S04a-DNN', TT99: 'S07-DN' }, congCot: ['no', 'co'] },
  '2.2.2': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S19-DNN', TT99: 'S38-DN' }, ten: { TT133: 'Sổ chi tiết các tài khoản', TT99: 'Sổ chi tiết các tài khoản' }, congCot: ['no', 'co'] },
  '2.2.3': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S05-DNN', TT99: 'S08-DN' }, ten: { TT133: 'Sổ tiền gửi ngân hàng', TT99: 'Sổ tiền gửi ngân hàng' }, congCot: ['no', 'co'] },
  '2.2.4': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S03a-DNN', TT99: 'S03a-DN' }, ten: { TT133: 'Sổ nhật ký chung', TT99: 'Sổ nhật ký chung' }, congCot: ['no', 'co'] },
  '2.2.5': { loai: 'so', kho: 'ngang', kyHieu: { TT58: 'S4a-DNSN', TT133: 'S12-DNN', TT99: 'S31-DN' } },
  '3.2.1': baoCao('ngang'), '3.2.2': baoCao('ngang'), '3.2.3': baoCao('ngang'), '3.2.4': baoCao('ngang'), '4.2.1': baoCao('ngang'),
  '4.2.2': baoCao('doc'),
  '5.2.1': { loai: 'so', kho: 'doc', kyHieu: { TT133: 'S08-DNN', TT99: 'S12-DN' }, congCot: ['nhap', 'xuat'] },
  '5.2.2': baoCao('ngang'),
  '5.2.3': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S07-DNN', TT99: 'S11-DN' } },
  '5.2.4': baoCao('doc'), '5.2.5': baoCao('ngang'), '5.2.6': baoCao('ngang'), '5.2.7': baoCao('ngang'),
  '6.2.1': baoCao('ngang'), '6.2.2': baoCao('ngang'),
  '6.2.3': { loai: 'tokhai', kho: 'doc', khoa: true },
  '7.2.1': { loai: 'so', kho: 'ngang', kyHieu: { TT58: 'S4b-DNSN', TT133: 'S09-DNN', TT99: 'S21-DN' } },
  '7.2.2': baoCao('ngang'),
  '8.2.1': baoCao('ngang'), '8.2.2': baoCao('ngang'), '8.2.3': baoCao('ngang'), '8.2.4': baoCao('ngang'),
  '9.2.1': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S17-DNN', TT99: 'S36-DN' } },
  '9.2.2': { loai: 'so', kho: 'ngang', kyHieu: { TT133: 'S18-DNN', TT99: 'S37-DN' } },
  '10.2.1': { loai: 'bctc', kho: 'ngang', khoa: true, kyHieu: { TT133: 'F01-DNN', TT99: 'S06-DN' }, ten: { TT133: 'Bảng cân đối tài khoản', TT99: 'Bảng cân đối số phát sinh' } },
  '10.2.2': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT58: 'B01-DNSN', TT133: 'B01a-DNN', TT99: 'B01-DN' } },
  '10.2.3': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT58: 'B02-DNSN', TT133: 'B02-DNN', TT99: 'B02-DN' } },
  '10.2.4': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT133: 'B03-DNN', TT99: 'B03-DN' } },
  '10.2.5': { loai: 'bctc', kho: 'doc', khoa: true, kyHieu: { TT133: 'B09-DNN', TT99: 'B09-DN' } },
  '10.3.1': baoCao('ngang'),
}

export const cauHinhBC = (code?: string) => code ? CAU_HINH_BC[code] : undefined
