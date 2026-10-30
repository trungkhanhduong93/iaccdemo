// Hướng dẫn nhanh các màn Kê khai thuế (T673, QD86), soạn cho chủ quán gói Standard. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  'to-khai': {
    goi: ['S'],
    muc: 'Lập tờ khai thuế từng kỳ cho hộ kinh doanh. Doanh thu bán từ FABi tự điền vào tờ khai, thuế GTGT, TNCN tự tính.',
    buoc: [
      { chu: 'Lần đầu mở, khai loại hình kinh doanh và mã số thuế.' },
      { chu: 'Đến kỳ kê khai, bấm Thêm mới, chọn kỳ. Tờ khai đi qua 4 bước, bước cuối là Xem và nộp tờ khai.', o: 'them', dt: 'Đến kỳ kê khai, chạm nút + ở góc dưới, chọn kỳ. Tờ khai đi qua 4 bước, bước cuối là Xem và nộp tờ khai.' },
      { chu: 'Cột Trạng thái cho biết tờ khai đã nộp hay chưa. Bấm một dòng để xem, in tờ khai.', o: 'bang', dt: 'Cột Trạng thái cho biết tờ khai đã nộp hay chưa. Chạm một dòng để xem, in tờ khai.' },
      { chu: 'Xem tờ khai năm trước: chọn năm, bấm Lọc.', o: 'loc', dt: 'Xem tờ khai năm trước: chọn năm ở hàng lọc.' },
    ],
    luuY: ['Số trên tờ khai lấy từ doanh thu FABi đã về sổ. Thấy thiếu ngày nào thì xem lại ở Bán hàng trước khi lập tờ khai.'],
    soDo: [
      [{ k: 'loc', ten: 'Năm, trạng thái, Lọc', rong: 3 }, { k: 'them', ten: 'Thêm mới', kieu: 'nut' }],
      [{ k: 'bang', ten: 'Tờ khai từng kỳ: doanh thu, thuế, trạng thái', kieu: 'bang' }],
    ],
  },
}
