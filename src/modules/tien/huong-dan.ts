// Hướng dẫn nhanh các màn Thu chi (T673, T674, QD86), soạn cho chủ quán gói Standard. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  '2-1-1': {
    goi: ['S'],
    muc: 'Ghi mọi khoản tiền vào, ra của quán. Phiếu thu chi ghi trên máy POS FABi tự về đây, bạn chỉ ghi thêm khoản còn thiếu.',
    buoc: [
      { chu: 'Chọn tab theo nơi tiền đi qua: Tiền mặt, Ngân hàng, hoặc Chuyển quỹ khi đưa tiền từ quỹ này sang quỹ khác.', o: 'tab' },
      { chu: 'Bấm Thêm mới, chọn Phiếu thu hoặc Phiếu chi.', o: 'them', di: 'tien/2-1-1/moi?loai=chi', nutDi: 'Ghi một khoản chi' },
      { chu: 'Chọn đối tượng, lý do, ghi diễn giải và số tiền, rồi bấm Lưu hoặc Ctrl + S.' },
      { chu: 'Tìm phiếu cũ: chọn thời gian, gõ số phiếu hoặc diễn giải, bấm Lọc.', o: 'loc' },
      { chu: 'Bấm số chứng từ để xem, in, sửa phiếu.', o: 'bang' },
    ],
    luuY: [
      'Rút tiền mặt từ Quỹ tiền gửi vào ngân hàng thì lập phiếu ở tab Chuyển quỹ. Không ghi một phiếu chi và một phiếu thu.',
      'Phiếu có số bắt đầu bằng FBTC là phiếu thu chi từ máy POS FABi tự về.',
    ],
    soDo: [
      [{ k: 'tab', ten: 'Tiền mặt · Ngân hàng · Chuyển quỹ', kieu: 'tab' }],
      [{ k: 'loc', ten: 'Thời gian, tìm, Lọc', rong: 3 }, { k: 'them', ten: 'Thêm mới', kieu: 'nut' }],
      [{ k: 'bang', ten: 'Danh sách phiếu thu, chi', kieu: 'bang' }],
      [{ k: 'tong', ten: 'Tổng tiền, chuyển trang' }],
    ],
  },
  // Sổ quỹ gói Standard mở trong phân hệ Thu chi, đầu báo cáo nằm thay thanh tab nên nút la bàn ở cạnh nút In (T674). Gọi là Quỹ tiền, không gọi là két (T679)
  '2-2-1': {
    goi: ['S'],
    muc: 'Xem tiền mặt vào, ra từng ngày và số tiền còn lại trong Quỹ tiền, để cuối ngày đếm tiền thực tế so lại.',
    buoc: [
      { chu: 'Chọn Thời gian và Quỹ tiền cần xem, rồi bấm Lọc.', o: 'loc' },
      { chu: 'Đọc từ dòng Số tồn đầu kỳ, qua từng phiếu thu, chi, tới dòng Số tồn cuối kỳ. Cột Tồn là tiền còn lại sau mỗi phiếu.', o: 'to' },
      { chu: 'Bấm số phiếu thu, phiếu chi để mở phiếu gốc.', o: 'to' },
      { chu: 'Bấm In để in sổ, bấm nút tải xuống để lấy file về máy.', o: 'in' },
      { chu: 'Tiền đếm thực tế trong Quỹ tiền khác Số tồn cuối kỳ thì tìm khoản thu, chi chưa ghi rồi ghi thêm ở Thu chi.', di: 'tien/2-1-1?nhom=tm', nutDi: 'Mở Thu chi tiền mặt' },
    ],
    luuY: [
      'Đối chiếu cuối ngày: chọn Thời gian là hôm nay, xem dòng Số tồn cuối kỳ.',
      'Ô Cửa hàng chỉ có khi thanh trên đang xem Tất cả cửa hàng.',
      'Nút phễu mở Bộ lọc nâng cao. Nút Tuỳ chỉnh chọn cột hiện trên sổ.',
    ],
    soDo: [
      [{ k: 'ten', ten: 'Sổ quỹ tiền mặt, ngôi sao ghim', rong: 2 }, { k: 'in', ten: 'Tải xuống, Tuỳ chỉnh, In', kieu: 'nut' }],
      [{ k: 'loc', ten: 'Thời gian, Cửa hàng, Quỹ tiền, Lọc' }],
      [{ k: 'to', ten: 'Tồn đầu kỳ, từng phiếu thu, chi, cột Tồn, tồn cuối kỳ', kieu: 'bang' }],
    ],
  },
}
