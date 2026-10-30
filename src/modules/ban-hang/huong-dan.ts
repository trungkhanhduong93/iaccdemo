// Hướng dẫn nhanh các màn Bán hàng (T673, QD86), soạn cho chủ quán gói Standard. Khung đọc ở src/ui/HuongDanNhanh.tsx
import type { HuongDanMan } from '../../ui/HuongDanNhanh'

export const huongDan: Record<string, HuongDanMan> = {
  '3-1-1': {
    goi: ['S'],
    muc: 'Mỗi hoá đơn bán trên máy POS FABi tự về đây thành một chứng từ, không cần nhập tay.',
    buoc: [
      { chu: 'Chọn thời gian, bấm Lọc để xem hoá đơn trong khoảng đó.', o: 'loc', dt: 'Chọn thời gian ở hàng lọc để xem hoá đơn trong khoảng đó.' },
      { chu: 'Bấm số chứng từ để xem từng món đã bán, in phiếu.', o: 'bang', dt: 'Chạm vào hoá đơn để xem từng món đã bán, in phiếu.' },
      { chu: 'Số Tổng cộng dưới bảng là tổng tiền các hoá đơn đang lọc. Đối chiếu với báo cáo bán hàng trên máy POS.', o: 'tong', dt: 'Thẻ Tổng cộng phía trên là tổng tiền các hoá đơn đang lọc. Đối chiếu với báo cáo bán hàng trên máy POS.' },
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
