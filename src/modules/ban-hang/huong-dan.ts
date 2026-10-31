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
      // Đồng bộ hoá đơn FABi, chip Đã đồng bộ, Chưa đồng bộ (T697, T699, T701, T703); điện thoại chỉ xem, chọn trạng thái trong Bộ lọc
      { chu: 'Muốn lấy lại hoá đơn một khoảng ngày thì bấm nút Đồng bộ cạnh nút Excel.', o: 'dongBo', dt: 'Hoá đơn trên máy POS tự về. Muốn lấy lại một khoảng ngày thì bấm nút Đồng bộ ở màn Xuất bán POS trên máy tính.' },
      { chu: 'Chọn khoảng thời gian của hoá đơn cần lấy về.', o: 'hdbNgay', bam: 'dongBo', web: true },
      { chu: 'Tích cửa hàng cần lấy hoá đơn. Gõ tên vào ô tìm để lọc nhanh.', o: 'hdbDs', bam: 'dongBo', web: true },
      { chu: 'Chọn các món cần đồng bộ. Để trống để lấy tất cả món.', o: 'hdbMon', bam: 'dongBo', web: true },
      { chu: 'Tích Đồng bộ lại hoá đơn đã có để lấy lại hoá đơn đã vào sổ trong kỳ, không nhân đôi.', o: 'hdbLamLai', bam: 'dongBo', web: true },
      { chu: 'Bấm Đồng bộ ngay để lấy hoá đơn về sổ kế toán.', o: 'hdbNut', bam: 'dongBo', web: true },
      { chu: 'Bấm chip Đã đồng bộ để xem từng món đã vào sổ.', o: 'chip-da-db', dt: 'Mở Bộ lọc, chọn Trạng thái Đã đồng bộ để xem từng món đã vào sổ.' },
      { chu: 'Bấm chip Chưa đồng bộ để xem món chưa vào sổ.', o: 'chip-chua-db', dt: 'Mở Bộ lọc, chọn Trạng thái Chưa đồng bộ để xem món chưa vào sổ và nguyên nhân. Sửa, đồng bộ lại làm trên máy tính.' },
      { chu: 'Bảng Chưa đồng bộ hiện các cột: ngày bán, cửa hàng, tên món kèm mã món, ĐVT, số lượng bán, PTTT, tổng tiền.', o: 'bang', bam: 'chip-chua-db', web: true },
      { chu: 'Cột Hoá đơn FABi là mã hoá đơn trên máy POS. Dùng mã này để tra lại trên máy POS.', o: 'cot-soFabi', bam: 'chip-chua-db', web: true },
      { chu: 'Cột Nguyên nhân nêu 4 lý do: thiếu món, chưa map PTTT, chưa chọn kho xuất, hoặc kỳ đã khoá sổ.', o: 'cot-nguyenNhan', bam: 'chip-chua-db', web: true },
      { chu: 'Bấm link ở cột Xử lý để sửa. Sửa xong thì tích dòng, bấm Đồng bộ lại.', o: 'cot-xuLy', bam: 'chip-chua-db', web: true },
      { chu: 'Xem sổ doanh thu ở tab Báo cáo.', o: 'tab' },
    ],
    luuY: [
      'Số chứng từ là mã hoá đơn trên FABi, dùng để tra lại trên máy POS.',
      'Bốn lý do món chưa đồng bộ: món chưa có trong danh mục, phương thức thanh toán chưa gán tài khoản, cửa hàng chưa chọn kho xuất, ngày bán thuộc kỳ đã khoá sổ.',
    ],
    soDo: [
      [{ k: 'tab', ten: 'Xuất bán POS · Báo cáo', kieu: 'tab' }],
      [{ k: 'loc', ten: 'Thời gian, Lọc', rong: 3 }, { k: 'dongBo', ten: 'Đồng bộ, Excel', kieu: 'nut' }],
      [{ k: 'chip-chua-db', ten: 'Tất cả · Đã đồng bộ · Chưa đồng bộ' }],
      [{ k: 'bang', ten: 'Hoá đơn bán từ FABi', kieu: 'bang' }],
      [{ k: 'tong', ten: 'Tổng tiền, chuyển trang' }],
    ],
  },
}
