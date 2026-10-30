// Dữ liệu nhật ký thao tác dùng chung cho màn web và điện thoại (T689): dòng mẫu đủ thông tin kiểm soát, cộng thao tác trên phiếu trong phiên
import { useMemo } from 'react'
import { useNhatKy, type DongNhatKy } from '../../ui/generic/daXoa'

export const THAO_TAC = ['Thêm mới', 'Sửa', 'Xoá', 'Ghi sổ', 'Bỏ ghi sổ', 'Duyệt', 'Khoá sổ', 'Mở khoá sổ', 'Đăng nhập', 'Đăng xuất', 'Xem báo cáo', 'In', 'Xuất Excel'] as const
export type ThaoTac = typeof THAO_TAC[number]

export interface ThayDoi { truong: string; cu: string; moi: string }
export interface MocLichSu { viec: string; luc: string; ai: string; dangXem?: boolean }
export interface DongNK {
  ma: string; luc: string; giay: string          // luc: dd/mm/yyyy hh:mm, giay: 2 chữ số
  ai: string; tk: string; vaiTro: string; tt: ThaoTac
  ch: string; loai: string; so: string; ngay: string; tien: string; dg: string
  tb: string; tbNgan: string; phien: string; manHinh: string
  ky?: string; doiTuong?: string; trangThai?: string; nguon?: string
  kqLoi?: string          // có: thao tác không thành công, lý do
  canhBao?: string        // có: thao tác cần chú ý
  lyDo?: string; thamSo?: string
  doi?: ThayDoi[]; lichSu?: MocLichSu[]
  manPhieu?: string; idPhieu?: string   // dòng sinh trong phiên: màn và id phiếu để mở lại
}

export const canChuY = (d: DongNK) => !!d.canhBao

const MAU: DongNK[] = [
  { ma: 'NK2610-004812', luc: '07/10/2026 16:42', giay: '18', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Sửa', ch: 'Phố Mây Lê Lợi', loai: 'Phiếu chi', so: 'PC2610-0241', ngay: '06/10/2026', tien: '1.520.000', dg: 'Chi mua đá viên tuần 1/10',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 08:01', manHinh: 'Tiền > Phiếu chi', ky: '10/2026', doiTuong: 'Đá viên Sài Gòn (NCC0042)', trangThai: 'Đã duyệt, chưa ghi sổ', nguon: 'Lập tay',
    canhBao: 'Sửa phiếu đã duyệt cấp 1. Số tiền tăng 270.000 sau khi duyệt.', lyDo: 'Nhà cung cấp gửi lại hoá đơn, số tiền cũ ghi thiếu.',
    doi: [{ truong: 'Số tiền', cu: '1.250.000', moi: '1.520.000' }, { truong: 'Ngày chứng từ', cu: '05/10/2026', moi: '06/10/2026' }, { truong: 'Diễn giải', cu: 'Chi mua đá viên', moi: 'Chi mua đá viên tuần 1/10' }, { truong: 'Dòng 2, tài khoản Nợ', cu: '6422', moi: '6421' }, { truong: 'Dòng 3', cu: 'Chưa có', moi: 'Thêm dòng phí giao hàng 30.000' }],
    lichSu: [{ viec: 'Thêm mới', luc: '05/10/2026 09:12', ai: 'Lê Quốc Bảo' }, { viec: 'In 2 liên', luc: '05/10/2026 09:15', ai: 'Lê Quốc Bảo' }, { viec: 'Duyệt cấp 1', luc: '06/10/2026 10:04', ai: 'Trần Thu Hà' }, { viec: 'Sửa 5 trường', luc: '07/10/2026 16:42', ai: 'Trần Thu Hà', dangXem: true }] },
  { ma: 'NK2610-004809', luc: '07/10/2026 16:35', giay: '02', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Thêm mới', ch: 'Phố Mây Nguyễn Trãi', loai: 'Phiếu thu', so: 'PT2610-0262', ngay: '07/10/2026', tien: '8.450.000', dg: 'Thu tiền bán hàng ca chiều',
    tb: 'Ứng dụng điện thoại, iPhone', tbNgan: 'Điện thoại', phien: 'Bắt đầu 07/10/2026 13:20', manHinh: 'Tiền > Phiếu thu', ky: '10/2026', doiTuong: 'Khách lẻ', trangThai: 'Chưa ghi sổ', nguon: 'Lập tay',
    lichSu: [{ viec: 'Thêm mới', luc: '07/10/2026 16:35', ai: 'Lê Quốc Bảo', dangXem: true }] },
  { ma: 'NK2610-004801', luc: '07/10/2026 16:20', giay: '47', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Xem báo cáo', ch: 'Phố Mây Lê Lợi', loai: '', so: '', ngay: '', tien: '', dg: 'Sổ quỹ tiền mặt',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 08:01', manHinh: 'Báo cáo > Tiền', thamSo: 'Tháng 10/2026, Phố Mây Lê Lợi, quỹ tiền mặt chính' },
  { ma: 'NK2610-004795', luc: '07/10/2026 15:58', giay: '11', ai: 'Phạm Ngọc Lan', tk: 'lan.pham', vaiTro: 'Thủ kho', tt: 'Xoá', ch: 'Phố Mây Thảo Điền', loai: 'Mua hàng', so: 'MH2610-0118', ngay: '05/10/2026', tien: '2.180.000', dg: 'Nhập rau củ',
    tb: 'Web, Edge trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 14:30', manHinh: 'Mua hàng > Chứng từ mua hàng', ky: '10/2026', doiTuong: 'Rau sạch Đà Lạt (NCC0017)', trangThai: 'Nháp, đã xoá', nguon: 'Lập tay', lyDo: 'Nhập trùng với MH2610-0117.',
    lichSu: [{ viec: 'Thêm mới', luc: '05/10/2026 11:40', ai: 'Phạm Ngọc Lan' }, { viec: 'Xoá', luc: '07/10/2026 15:58', ai: 'Phạm Ngọc Lan', dangXem: true }] },
  { ma: 'NK2610-004790', luc: '07/10/2026 15:41', giay: '30', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Ghi sổ', ch: 'Phố Mây Lê Lợi', loai: 'Bán hàng', so: 'XB2610-0187', ngay: '07/10/2026', tien: '12.640.000', dg: 'Hoá đơn FABi ca trưa',
    tb: 'Web, Chrome trên macOS', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 13:05', manHinh: 'Bán hàng > Chứng từ bán hàng', ky: '10/2026', doiTuong: 'Khách lẻ', trangThai: 'Chưa ghi sổ → Đã ghi sổ', nguon: 'Đồng bộ FABi',
    doi: [{ truong: 'Trạng thái', cu: 'Chưa ghi sổ', moi: 'Đã ghi sổ' }],
    lichSu: [{ viec: 'Đồng bộ từ FABi', luc: '07/10/2026 14:00', ai: 'Hệ thống' }, { viec: 'Ghi sổ', luc: '07/10/2026 15:41', ai: 'Lê Quốc Bảo', dangXem: true }] },
  { ma: 'NK2610-004786', luc: '07/10/2026 15:20', giay: '09', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Sửa', ch: 'Phố Mây Nguyễn Trãi', loai: 'Phiếu chi', so: 'PC2609-0198', ngay: '28/09/2026', tien: '3.200.000', dg: 'Chi tiền điện tháng 9',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 13:05', manHinh: 'Tiền > Phiếu chi', ky: '09/2026', doiTuong: 'Điện lực Quận 5', trangThai: 'Đã ghi sổ', nguon: 'Lập tay', kqLoi: 'Kỳ 9/2026 đã khoá sổ',
    canhBao: 'Định sửa phiếu thuộc kỳ đã khoá sổ. Hệ thống chặn, phiếu không đổi.',
    lichSu: [{ viec: 'Thêm mới', luc: '28/09/2026 10:15', ai: 'Lê Quốc Bảo' }, { viec: 'Ghi sổ', luc: '28/09/2026 10:16', ai: 'Lê Quốc Bảo' }, { viec: 'Sửa, bị chặn', luc: '07/10/2026 15:20', ai: 'Lê Quốc Bảo', dangXem: true }] },
  { ma: 'NK2610-004781', luc: '07/10/2026 15:12', giay: '55', ai: 'Phạm Ngọc Lan', tk: 'lan.pham', vaiTro: 'Thủ kho', tt: 'Xuất Excel', ch: 'Tất cả cửa hàng', loai: '', so: '', ngay: '', tien: '', dg: 'Sổ chi tiết mua hàng',
    tb: 'Web, Edge trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 14:30', manHinh: 'Báo cáo > Mua hàng', thamSo: 'Tháng 10/2026, tất cả cửa hàng, 214 dòng' },
  { ma: 'NK2610-004770', luc: '07/10/2026 14:50', giay: '21', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Duyệt', ch: 'Phố Mây Nguyễn Trãi', loai: 'Phiếu chi', so: 'PC2610-0236', ngay: '04/10/2026', tien: '4.800.000', dg: 'Chi tiền thuê kho tháng 10',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 08:01', manHinh: 'Tiện ích > Duyệt chứng từ', ky: '10/2026', doiTuong: 'Công ty Kho Vận Nam (NCC0008)', trangThai: 'Chờ duyệt → Đã duyệt cấp 1', nguon: 'Lập tay',
    doi: [{ truong: 'Trạng thái duyệt', cu: 'Chờ duyệt', moi: 'Đã duyệt cấp 1' }],
    lichSu: [{ viec: 'Thêm mới', luc: '04/10/2026 15:02', ai: 'Lê Quốc Bảo' }, { viec: 'Duyệt cấp 1', luc: '07/10/2026 14:50', ai: 'Trần Thu Hà', dangXem: true }] },
  { ma: 'NK2610-004761', luc: '07/10/2026 14:05', giay: '33', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'In', ch: 'Phố Mây Lê Lợi', loai: 'Phiếu chi', so: 'PC2610-0240', ngay: '04/10/2026', tien: '650.000', dg: 'In 2 liên',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 08:01', manHinh: 'Tiền > Phiếu chi', ky: '10/2026', doiTuong: 'Nhân viên Lê Văn Tâm', trangThai: 'Đã ghi sổ', nguon: 'Lập tay' },
  { ma: 'NK2610-004702', luc: '07/10/2026 08:01', giay: '12', ai: 'Phạm Ngọc Lan', tk: 'lan.pham', vaiTro: 'Thủ kho', tt: 'Đăng nhập', ch: '', loai: '', so: '', ngay: '', tien: '', dg: 'Sai mật khẩu lần 3, khoá tài khoản 15 phút',
    tb: 'Ứng dụng điện thoại, Android', tbNgan: 'Điện thoại', phien: 'Chưa mở phiên', manHinh: 'Đăng nhập', kqLoi: 'Sai mật khẩu',
    canhBao: 'Đăng nhập sai 3 lần liên tiếp. Tài khoản bị khoá 15 phút.' },
  { ma: 'NK2610-004699', luc: '07/10/2026 08:01', giay: '04', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Đăng nhập', ch: '', loai: '', so: '', ngay: '', tien: '', dg: 'Mở phiên làm việc',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 07/10/2026 08:01', manHinh: 'Đăng nhập' },
  { ma: 'NK2610-004655', luc: '06/10/2026 17:52', giay: '41', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Đăng xuất', ch: '', loai: '', so: '', ngay: '', tien: '', dg: 'Kết thúc phiên làm việc',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 06/10/2026 13:00', manHinh: 'Đăng xuất' },
  { ma: 'NK2610-004650', luc: '06/10/2026 17:45', giay: '40', ai: 'Trần Thu Hà', tk: 'ha.tran', vaiTro: 'Kế toán trưởng', tt: 'Khoá sổ', ch: 'Tất cả cửa hàng', loai: '', so: '', ngay: '', tien: '', dg: 'Khoá sổ kỳ 9/2026',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 06/10/2026 08:10', manHinh: 'Tổng hợp > Khoá sổ', lyDo: 'Đã đối chiếu xong quỹ, ngân hàng, kho tháng 9.',
    doi: [{ truong: 'Ngày khoá sổ', cu: '31/08/2026', moi: '30/09/2026' }] },
  { ma: 'NK2610-004642', luc: '06/10/2026 17:30', giay: '05', ai: 'Lê Quốc Bảo', tk: 'bao.le', vaiTro: 'Kế toán', tt: 'Bỏ ghi sổ', ch: 'Phố Mây Thảo Điền', loai: 'Uỷ nhiệm chi', so: 'UNC2610-0245', ngay: '03/10/2026', tien: '15.000.000', dg: 'Trả tiền hàng Rau sạch Đà Lạt',
    tb: 'Web, Chrome trên Windows', tbNgan: 'Web', phien: 'Bắt đầu 06/10/2026 13:00', manHinh: 'Tiền > Uỷ nhiệm chi', ky: '10/2026', doiTuong: 'Rau sạch Đà Lạt (NCC0017)', trangThai: 'Đã ghi sổ → Chưa ghi sổ', nguon: 'Lập tay',
    canhBao: 'Bỏ ghi sổ phiếu chi tiền ngân hàng 15.000.000.', lyDo: 'Sai tài khoản ngân hàng nhận, cần sửa lại.',
    doi: [{ truong: 'Trạng thái', cu: 'Đã ghi sổ', moi: 'Chưa ghi sổ' }],
    lichSu: [{ viec: 'Thêm mới', luc: '03/10/2026 09:00', ai: 'Lê Quốc Bảo' }, { viec: 'Ghi sổ', luc: '03/10/2026 09:02', ai: 'Lê Quốc Bảo' }, { viec: 'Bỏ ghi sổ', luc: '06/10/2026 17:30', ai: 'Lê Quốc Bảo', dangXem: true }] },
]

/** Loại phiếu đoán theo tiền tố số chứng từ */
const LOAI_THEO_SO: [string, string][] = [['UNC', 'Uỷ nhiệm chi'], ['PC', 'Phiếu chi'], ['PT', 'Phiếu thu'], ['MH', 'Mua hàng'], ['XB', 'Bán hàng'], ['BC', 'Báo có'], ['BN', 'Báo nợ']]
const loaiTheoSo = (so: string) => LOAI_THEO_SO.find(([t]) => so.startsWith(t))?.[1] ?? 'Chứng từ'
const thaoTacTheoViec = (viec: string): ThaoTac => viec.startsWith('Xoá') ? 'Xoá' : viec.startsWith('Sửa') ? 'Sửa' : 'Thêm mới'

function tuPhien(x: DongNhatKy, i: number, tatCa: DongNhatKy[]): DongNK {
  const cungPhieu = tatCa.filter(y => y.man === x.man && y.id === x.id).reverse()
  return {
    ma: `Phiên này #${tatCa.length - i}`, luc: x.luc, giay: '00', ai: x.ai, tk: '', vaiTro: '', tt: thaoTacTheoViec(x.viec),
    ch: '', loai: loaiTheoSo(x.so), so: x.so, ngay: '', tien: '', dg: x.viec,
    tb: 'Máy đang dùng', tbNgan: 'Máy này', phien: 'Phiên đang mở', manHinh: x.man, nguon: 'Lập tay',
    lichSu: cungPhieu.map(y => ({ viec: y.viec, luc: y.luc, ai: y.ai, dangXem: y === x })),
    manPhieu: x.man, idPhieu: x.id,
  }
}

/** Nhật ký đủ thông tin: thao tác trên phiếu trong phiên lên đầu (mới nhất trước), rồi dòng mẫu */
export function useNhatKyDayDu(): DongNK[] {
  const phien = useNhatKy()
  return useMemo(() => [...phien.map((x, i) => tuPhien(x, i, phien)), ...MAU], [phien])
}
