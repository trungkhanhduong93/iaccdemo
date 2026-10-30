// Dữ liệu nhật ký thao tác dùng chung cho màn web và điện thoại (T689, vẽ lại T693): dòng mẫu theo gói, cộng thao tác trên phiếu trong phiên
import { useMemo } from 'react'
import { useNhatKy, type DongNhatKy } from '../../ui/generic/daXoa'
import type { Goi } from '../../app/plan'

export const THAO_TAC = ['Thêm mới', 'Sửa', 'Xoá', 'Duyệt', 'Ghi sổ', 'Bỏ ghi sổ', 'Khoá sổ', 'Đăng nhập'] as const
export type ThaoTac = typeof THAO_TAC[number]

/** Thao tác có trong từng gói: gói Standard không ghi sổ, không khoá sổ (10.1.6), không duyệt (11.5 chỉ Pro) */
export const THAO_TAC_GOI: Record<Goi, ThaoTac[]> = {
  S: ['Thêm mới', 'Sửa', 'Xoá', 'Đăng nhập'],
  PL: ['Thêm mới', 'Sửa', 'Xoá', 'Ghi sổ', 'Bỏ ghi sổ', 'Khoá sổ', 'Đăng nhập'],
  PR: ['Thêm mới', 'Sửa', 'Xoá', 'Duyệt', 'Ghi sổ', 'Bỏ ghi sổ', 'Khoá sổ', 'Đăng nhập'],
}
const BAC: Record<Goi, number> = { S: 0, PL: 1, PR: 2 }

/** Ngày "hôm nay" của dữ liệu mẫu, bộ lọc mặc định dùng ngày này */
export const HOM_NAY = '07/10/2026'

export interface DongNK {
  ma: string; g: Goi                              // g: gói thấp nhất có thao tác này
  luc: string; giay: string                       // luc: dd/mm/yyyy hh:mm, giay: 2 chữ số
  ai: string; tk: string; vaiTro: string; tt: ThaoTac
  ch: string; loai: string; so: string; ngay: string; trangThai: string
  tb: string                                      // thiết bị đầy đủ, vd "Web, Chrome trên Windows"
  noiDung: string[]                               // lịch sử thao tác, mỗi câu một việc đã làm
  canhBao?: string; lyDo?: string
  kqLoi?: string                                  // có: thao tác không thành công
  manPhieu?: string; idPhieu?: string             // dòng sinh trong phiên: màn và id phiếu để mở lại
}

const MAU: DongNK[] = [
  { ma: 'NK2610-004815', g: 'S', luc: '07/10/2026 16:50', giay: '07', ai: 'Nguyễn Minh Thư', tk: 'thu.nguyen', vaiTro: 'Thu ngân', tt: 'Sửa', ch: 'Phố Mây Lê Lợi', loai: 'Phiếu chi', so: 'PC2610-0244', ngay: '07/10/2026', trangThai: 'Đã lưu',
    tb: 'Web, Chrome trên Windows', lyDo: 'Ghi nhầm số tiền mua gas.',
    noiDung: ['Sửa số tiền từ 500.000 thành 550.000.', 'Sửa diễn giải từ "Mua gas" thành "Mua gas bếp tuần 1/10".'] },
  { ma: 'NK2610-004812', g: 'PR', luc: '07/10/2026 16:42', giay: '18', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Sửa', ch: 'Phố Mây Lê Lợi', loai: 'Phiếu chi', so: 'PC2610-0241', ngay: '06/10/2026', trangThai: 'Đã duyệt, chưa ghi sổ',
    tb: 'Web, Chrome trên Windows', canhBao: 'Sửa phiếu đã duyệt cấp 1. Số tiền tăng 270.000 sau khi duyệt.', lyDo: 'Nhà cung cấp gửi lại hoá đơn, số tiền cũ ghi thiếu.',
    noiDung: ['Sửa số tiền từ 1.250.000 thành 1.520.000.', 'Đổi ngày chứng từ từ 05/10/2026 sang 06/10/2026.', 'Sửa diễn giải từ "Chi mua đá viên" thành "Chi mua đá viên tuần 1/10".', 'Dòng 2: đổi tài khoản Nợ từ 6422 sang 6421.', 'Thêm dòng 3: phí giao hàng 30.000.'] },
  { ma: 'NK2610-004811', g: 'S', luc: '07/10/2026 16:40', giay: '33', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Thêm mới', ch: 'Phố Mây Thảo Điền', loai: 'Uỷ nhiệm chi', so: 'UNC2610-0250', ngay: '07/10/2026', trangThai: 'Đã lưu',
    tb: 'Web, Chrome trên Windows', noiDung: ['Lập uỷ nhiệm chi trả tiền điện tháng 9 cho Điện lực Quận 1, số tiền 3.640.000.'] },
  { ma: 'NK2610-004809', g: 'S', luc: '07/10/2026 16:35', giay: '02', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Thêm mới', ch: 'Phố Mây Nguyễn Trãi', loai: 'Phiếu thu', so: 'PT2610-0262', ngay: '07/10/2026', trangThai: 'Chưa ghi sổ',
    tb: 'Ứng dụng điện thoại, iPhone', noiDung: ['Lập phiếu thu tiền bán hàng ca chiều của khách lẻ, số tiền 8.450.000.'] },
  { ma: 'NK2610-004795', g: 'S', luc: '07/10/2026 15:58', giay: '11', ai: 'Phạm Ngọc Lan', tk: 'lan.pham', vaiTro: 'Thủ kho', tt: 'Xoá', ch: 'Phố Mây Thảo Điền', loai: 'Chứng từ mua hàng', so: 'MH2610-0118', ngay: '05/10/2026', trangThai: 'Đã xoá',
    tb: 'Web, Edge trên Windows', lyDo: 'Nhập trùng với MH2610-0117.', noiDung: ['Xoá phiếu nhập rau củ của Rau sạch Đà Lạt, số tiền 2.180.000.'] },
  { ma: 'NK2610-004790', g: 'PL', luc: '07/10/2026 15:41', giay: '30', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Ghi sổ', ch: 'Phố Mây Lê Lợi', loai: 'Chứng từ bán hàng', so: 'XB2610-0187', ngay: '07/10/2026', trangThai: 'Đã ghi sổ',
    tb: 'Web, Chrome trên macOS', noiDung: ['Ghi sổ hoá đơn FABi ca trưa, số tiền 12.640.000.', 'Trạng thái đổi từ Chưa ghi sổ sang Đã ghi sổ.'] },
  { ma: 'NK2610-004786', g: 'PL', luc: '07/10/2026 15:20', giay: '09', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Sửa', ch: 'Phố Mây Nguyễn Trãi', loai: 'Phiếu chi', so: 'PC2609-0198', ngay: '28/09/2026', trangThai: 'Đã ghi sổ',
    tb: 'Web, Chrome trên Windows', kqLoi: 'Kỳ 9/2026 đã khoá sổ', canhBao: 'Định sửa phiếu thuộc kỳ đã khoá sổ. Hệ thống chặn, phiếu không đổi.',
    noiDung: ['Định sửa số tiền từ 3.200.000 thành 3.450.000.', 'Hệ thống chặn vì kỳ 9/2026 đã khoá sổ. Phiếu giữ nguyên.'] },
  { ma: 'NK2610-004770', g: 'PR', luc: '07/10/2026 14:50', giay: '21', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Duyệt', ch: 'Phố Mây Nguyễn Trãi', loai: 'Phiếu chi', so: 'PC2610-0236', ngay: '04/10/2026', trangThai: 'Đã duyệt cấp 1',
    tb: 'Web, Chrome trên Windows', noiDung: ['Duyệt cấp 1 phiếu chi tiền thuê kho tháng 10, số tiền 4.800.000.', 'Trạng thái đổi từ Chờ duyệt sang Đã duyệt cấp 1.'] },
  { ma: 'NK2610-004731', g: 'PL', luc: '07/10/2026 10:05', giay: '44', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Bỏ ghi sổ', ch: 'Phố Mây Thảo Điền', loai: 'Uỷ nhiệm chi', so: 'UNC2610-0245', ngay: '03/10/2026', trangThai: 'Chưa ghi sổ',
    tb: 'Web, Chrome trên Windows', canhBao: 'Bỏ ghi sổ phiếu chi tiền ngân hàng 15.000.000.', lyDo: 'Sai tài khoản ngân hàng nhận, cần sửa lại.',
    noiDung: ['Bỏ ghi sổ uỷ nhiệm chi trả tiền hàng Rau sạch Đà Lạt, số tiền 15.000.000.', 'Trạng thái đổi từ Đã ghi sổ sang Chưa ghi sổ.'] },
  { ma: 'NK2610-004720', g: 'S', luc: '07/10/2026 09:30', giay: '15', ai: 'Phạm Ngọc Lan', tk: 'lan.pham', vaiTro: 'Thủ kho', tt: 'Thêm mới', ch: 'Phố Mây Thảo Điền', loai: 'Chứng từ mua hàng', so: 'MH2610-0119', ngay: '07/10/2026', trangThai: 'Chưa ghi sổ',
    tb: 'Ứng dụng điện thoại, Android', noiDung: ['Lập phiếu nhập thịt bò của Bò tươi Củ Chi, 3 dòng hàng, số tiền 6.300.000.'] },
  { ma: 'NK2610-004702', g: 'S', luc: '07/10/2026 08:01', giay: '12', ai: 'Phạm Ngọc Lan', tk: 'lan.pham', vaiTro: 'Thủ kho', tt: 'Đăng nhập', ch: '', loai: '', so: '', ngay: '', trangThai: '',
    tb: 'Ứng dụng điện thoại, Android', kqLoi: 'Sai mật khẩu', canhBao: 'Đăng nhập sai 3 lần liên tiếp. Tài khoản bị khoá 15 phút.',
    noiDung: ['Nhập sai mật khẩu lần thứ 3 liên tiếp.', 'Tài khoản bị khoá đăng nhập tới 08:16.'] },
  { ma: 'NK2610-004699', g: 'S', luc: '07/10/2026 08:01', giay: '04', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Đăng nhập', ch: '', loai: '', so: '', ngay: '', trangThai: '',
    tb: 'Web, Chrome trên Windows', noiDung: ['Đăng nhập thành công, mở phiên làm việc mới.'] },
  { ma: 'NK2610-004650', g: 'PL', luc: '06/10/2026 17:45', giay: '40', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Khoá sổ', ch: '', loai: '', so: '', ngay: '', trangThai: '',
    tb: 'Web, Chrome trên Windows', lyDo: 'Đã đối chiếu xong quỹ, ngân hàng, kho tháng 9.', noiDung: ['Khoá sổ kỳ 9/2026 cho tất cả cửa hàng.', 'Ngày khoá sổ đổi từ 31/08/2026 sang 30/09/2026.'] },
]

/** Câu đầu khung chi tiết: "<ai> <dongTu> <doiTuong>", vd "Trần Thu Hà | đã sửa | phiếu chi PC2610-0241" */
export const dongTu = (d: DongNK) => d.kqLoi ? `${d.tt.toLowerCase()} không thành công` : `đã ${d.tt.toLowerCase()}`
export const doiTuongTT = (d: DongNK) => d.so ? `${d.loai.toLowerCase()} ${d.so}` : ''
/** Chữ viết tắt ô tròn: chữ đầu 2 từ cuối của tên, vd "Trần Thu Hà" → "TH" */
export const vietTat = (ai: string) => ai.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
/** Dòng thuộc ngày hôm nay của dữ liệu mẫu; dòng sinh trong phiên luôn tính là hôm nay */
export const laHomNay = (d: DongNK) => !!d.manPhieu || d.luc.startsWith(HOM_NAY)

/** Loại phiếu đoán theo tiền tố số chứng từ */
const LOAI_THEO_SO: [string, string][] = [['UNC', 'Uỷ nhiệm chi'], ['PC', 'Phiếu chi'], ['PT', 'Phiếu thu'], ['MH', 'Chứng từ mua hàng'], ['XB', 'Chứng từ bán hàng'], ['BC', 'Báo có'], ['BN', 'Báo nợ']]
const loaiTheoSo = (so: string) => LOAI_THEO_SO.find(([t]) => so.startsWith(t))?.[1] ?? 'Chứng từ'
const thaoTacTheoViec = (viec: string): ThaoTac => viec.startsWith('Xoá') ? 'Xoá' : viec.startsWith('Sửa') ? 'Sửa' : 'Thêm mới'

function tuPhien(x: DongNhatKy, i: number, tatCa: DongNhatKy[]): DongNK {
  return {
    ma: `Phiên này #${tatCa.length - i}`, g: 'S', luc: x.luc, giay: '00', ai: x.ai, tk: '', vaiTro: '', tt: thaoTacTheoViec(x.viec),
    ch: '', loai: loaiTheoSo(x.so), so: x.so, ngay: '', trangThai: '',
    tb: 'Máy đang dùng', noiDung: [x.viec], manPhieu: x.man, idPhieu: x.id,
  }
}

/** Nhật ký của gói đang dùng: thao tác trên phiếu trong phiên lên đầu (mới nhất trước), rồi dòng mẫu có trong gói */
export function useNhatKyDayDu(goi: Goi): DongNK[] {
  const phien = useNhatKy()
  return useMemo(() => [...phien.map((x, i) => tuPhien(x, i, phien)), ...MAU.filter(d => BAC[d.g] <= BAC[goi])], [phien, goi])
}
