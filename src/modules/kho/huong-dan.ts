// Hướng dẫn nhanh các màn Kho (T673, QD86), soạn cho chủ quán gói Standard: phân hệ chỉ có Kiểm kê. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  '5-1-10': {
    goi: ['S'],
    muc: 'Đếm hàng thực tế trong kho, so với số trên sổ để biết hàng thiếu, thừa.',
    buoc: [
      { chu: 'Bấm Thêm mới, chọn Kiểm kê.', o: 'them', di: 'kho/5-1-10/moi', nutDi: 'Lập phiếu kiểm kê' },
      // 2 bước trong form phiếu chỉ vào ô của form, dải nổi trên form (T676)
      { chu: 'Nhập số lượng đếm được ở cột Tồn thực tế. Cột Chênh lệch tự tính.', o: 'chi-tiet' },
      { chu: 'Bấm Lưu hoặc Ctrl + S.', o: 'luu' },
      { chu: 'Hàng thiếu, thừa ghi bằng phiếu Xuất điều chỉnh, Nhập điều chỉnh. Số phiếu hiện ở cột Tham chiếu.', o: 'bang' },
      { chu: 'Xem lại phiếu cũ: chọn thời gian, bấm Lọc, bấm số chứng từ.', o: 'loc' },
    ],
    luuY: ['Thanh trên đang chọn cửa hàng nào thì phiếu kiểm kê lập cho kho của cửa hàng đó.'],
    soDo: [
      [{ k: 'loc', ten: 'Thời gian, Lọc', rong: 3 }, { k: 'them', ten: 'Thêm mới', kieu: 'nut' }],
      [{ k: 'bang', ten: 'Phiếu kiểm kê, phiếu điều chỉnh', kieu: 'bang' }],
    ],
  },
}
