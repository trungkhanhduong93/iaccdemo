# Đợt chỉnh 13 điểm giao diện, đổi tên và mã gói (T43)

- Ngày: 09/10/2026 (làm từ tối 08/10)
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) sửa code qua 3 lượt
- Trạng thái cuối phiên: Xong

## Đã làm

- Lượt A (toàn app):
  - Khối mục đang chọn ở sidebar dùng màu nút Lọc. Cam đổi sang #f28020 theo logo.
  - Bỏ giới hạn rộng 1480px.
  - Gói đổi tên Free/Standard/Plus/Pro, mã F/S/PL/PR. `plan.ts` đổi mã khi đọc `features.json`, `session.tsx` đổi mã phiên cũ.
  - Màn danh mục bỏ dòng tiêu đề.
- Lượt C: `gen.ts` có tuỳ chọn `soPhieu`. Mua hàng 4.1.1 có 80 phiếu tháng 9 và 10.
- Lượt B (danh sách chứng từ và 3.1.1):
  - Thanh công cụ một hàng, chip đếm theo mẫu.
  - Nút Excel và nút Hàng loạt dạng biểu tượng. Hàng loạt theo trạng thái phiếu đã chọn.
  - Bỏ cột Trạng thái và dòng tiêu đề (giữ `h1` ẩn). Ghi chú FABi thành ⓘ.
  - Dòng tổng luôn thấy. Bảng chi tiết có dòng tổng.
- Coordinator sửa thêm: ô nhãn dòng tổng trải sang các ô trống liền sau (`colSpan` trong `Table.tsx`), cột # không còn bị giãn.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.` Bản đầy đủ 4 gói: xem dòng dưới.
- Đo ở 1600px trên 2.1.1, 4.1.1, 3.1.1: khe giữa tiêu đề và hàng lọc 0px, dòng tổng luôn thấy, không còn cột Trạng thái, không có lỗi trang.

## Dở dang, việc tiếp theo

- Không.
- Ở 1600px, bảng Mua hàng rộng hơn khung khoảng 100px, cột Nguồn nằm dưới cột Chức năng đứng yên, phải cuộn ngang mới thấy.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD27.
- Đêm 08/10 có phiên khác làm T44, T45 ngay trong thư mục này, trái QD21 (mỗi phiên một bản clone). Coordinator suýt ẩn ô gõ lọc mà QD28 vừa thêm.
