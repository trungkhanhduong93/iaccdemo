// Hướng dẫn nhanh các màn Thu chi (T673, QD86), soạn cho chủ quán gói Standard. Khung đọc ở src/ui/HuongDanNhanh.tsx
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
      'Rút tiền két gửi vào tài khoản thì lập phiếu ở tab Chuyển quỹ, không ghi một phiếu chi và một phiếu thu.',
      'Phiếu có số bắt đầu bằng FBTC là phiếu thu chi từ máy POS FABi tự về.',
    ],
    soDo: [
      [{ k: 'tab', ten: 'Tiền mặt · Ngân hàng · Chuyển quỹ', kieu: 'tab' }],
      [{ k: 'loc', ten: 'Thời gian, tìm, Lọc', rong: 3 }, { k: 'them', ten: 'Thêm mới', kieu: 'nut' }],
      [{ k: 'bang', ten: 'Danh sách phiếu thu, chi', kieu: 'bang' }],
      [{ k: 'tong', ten: 'Tổng tiền, chuyển trang' }],
    ],
  },
}
