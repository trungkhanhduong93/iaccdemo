# Bảng flyout menu khi rê chuột vào sidebar (T45)

- Ngày: 09/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo component `src/app/SidebarFlyout.tsx` hiển thị bảng flyout 2 cột (Nghiệp vụ và Tiện ích) khi rê chuột vào từng phân hệ trên sidebar.
- Tích hợp `SidebarFlyout` vào component `Sidebar` trong `src/app/Shell.tsx`:
  - Hover vào phân hệ tính toạ độ `top` bám theo mục tương ứng và chia tỷ lệ `heSoZoom()`.
  - Giới hạn đáy không cho flyout tràn ra ngoài màn hình ở các phân hệ phía dưới.
  - Xử lý trễ 180ms và cầu nối hit-test `.sb-flyout-bridge` giúp rê chuột mượt mà không nhấp nháy.
  - Tự động đóng flyout khi click chọn mục hoặc chuyển route.
- Thêm cấu hình mục con cho tất cả 13 phân hệ, kiểm tra quyền mở theo gói `Goi` (màn ngoài gói bị khoá hoặc ẩn nếu gói Free theo QD22).
- Thêm định kiểu CSS cho flyout menu ở cuối `src/styles/app.css` với mã `T45`: nền tối navy `#181f2a`, 2 cột cân đối, bo góc 10px, đổ bóng mềm và hiệu ứng fade-in.
- Thêm nút thu gọn và mở rộng màn hình chi tiết chứng từ ở các màn hình danh sách chứng từ (`VoucherScreen.tsx` và `ChungTuBanHang.tsx`), có nút trên thanh tiêu đề chi tiết và nút toggle trên thanh công cụ.
- Xử lý dứt điểm khe hở giữa hàng tiêu đề và hàng lọc cột: đặt `top: calc(var(--th-h1, 36px) - 1.5px)` đè khít lên mép đáy hàng tiêu đề và thêm lớp phủ `::before` 4px bịt kín mọi khoảng trống subpixel khi cuộn.
- Xử lý khoảng hở dòng tổng cộng và footer: bỏ `tbl-spacer`, thẻ `tfoot` static, ô `td` dòng tổng cộng sticky dính đáy kèm lớp phủ che chân `::after`. Thanh phân trang liền mạch không còn kẽ hở.

## Đã kiểm

- `npm run typecheck`: không có lỗi.
- `npm run build`: hoàn thành sạch sẽ.
- `python tools/kiem_tra.py --nhanh`: 208 lượt mở màn, in dòng `Không có lỗi.`
- `python tools/kiem_van.py`: các file đều sạch, 0 ĐỎ, 0 VÀNG.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Cập nhật quyết định `QD29` trong `docs/QUYET-DINH.md`.

