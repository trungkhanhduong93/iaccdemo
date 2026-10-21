# Điện thoại: thu chi nhanh dùng menu nổi, tiến độ kiểm kê theo web (T612)

- Ngày: 22/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MChonLoaiTien.tsx`: Thu tiền, Chi tiền ở trang chủ điện thoại bỏ bảng chọn dưới đáy, thay bằng menu nổi ngay dưới ô (`Popover`, `MenuItem` trong `Dropdown.tsx`, lớp `pop-lap-phieu`), giống nút Lập phiếu thu ở Tất cả quỹ (`NutLapPhieuQuy`). Hai dòng có biểu tượng: Thu (Chi) tiền mặt, Thu (Chi) ngân hàng.
- `MKhoFree.tsx`: tiến độ kiểm kê theo cửa hàng thêm dòng tiêu đề cột "Kiểm kê lần cuối", bỏ số đã kiểm, giống `DongKkCn` ở web.
- CSS mục T612 cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `MChonLoaiTien.tsx`, `MKhoFree.tsx`: sạch.
- Trình duyệt 375x812: gói Plus bấm Thu tiền ra menu dưới ô, chọn Thu ngân hàng mở `loai=bc`; gói Free tiến độ kiểm kê có tiêu đề cột, ngày 07/10, 06/10, 05/10. Thử xong đã trả phiên về gói Plus.

## Dở dang, việc tiếp theo

- Không. Web có đường kẻ giữa các dòng tiến độ kiểm kê, app chưa có, chưa ai yêu cầu.

## Bẫy, quyết định mới

- Không.
