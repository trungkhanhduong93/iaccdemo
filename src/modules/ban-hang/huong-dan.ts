// Hướng dẫn nhanh các màn Bán hàng (T673, QD86), soạn cho chủ quán gói Standard. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  '3-1-1': {
    goi: ['S'],
    muc: 'Mỗi hoá đơn bán trên máy POS FABi tự về đây thành một chứng từ, không cần nhập tay.',
    buoc: [
      { chu: 'Chọn thời gian, bấm Lọc để xem hoá đơn trong khoảng đó.', o: 'loc' },
      { chu: 'Bấm số chứng từ để xem từng món đã bán, in phiếu.', o: 'bang' },
      { chu: 'Dòng cuối bảng cộng tổng tiền các hoá đơn đang lọc. Đối chiếu với báo cáo bán hàng trên máy POS.', o: 'tong' },
      { chu: 'Xem sổ doanh thu ở tab Báo cáo.', o: 'tab' },
    ],
    luuY: ['Số chứng từ là mã hoá đơn trên FABi, dùng để tra lại trên máy POS.'],
    soDo: [
      [{ k: 'tab', ten: 'Xuất bán POS · Báo cáo', kieu: 'tab' }],
      [{ k: 'loc', ten: 'Thời gian, Lọc' }],
      [{ k: 'bang', ten: 'Hoá đơn bán từ FABi', kieu: 'bang' }],
      [{ k: 'tong', ten: 'Tổng tiền, chuyển trang' }],
    ],
  },
}
