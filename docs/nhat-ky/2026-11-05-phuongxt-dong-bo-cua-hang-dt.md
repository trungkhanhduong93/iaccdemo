# Điện thoại: Đồng bộ FABi ở Danh mục cửa hàng (T749)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MCuaHang.tsx`: nút nổi Đồng bộ FABi mở màn chọn cửa hàng FABi lên sổ như web, thay cho thông báo đồng bộ giả. Bỏ nút Thêm từ FABi riêng. Màn chọn đang mở thì ẩn nút nổi, để không đè nút Lên sổ.
- `src/ui/mobile/MThemCuaHangFabi.tsx`: tích sẵn mọi cửa hàng FABi chưa dùng kế toán như web. Nút đổi thành "Lên sổ N cửa hàng", không còn cửa hàng nào thì ẩn nút. Bỏ tuỳ chọn khai số dư ban đầu ngay sau khi lên sổ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 2 file: Sạch.
- Chưa mở lại màn điện thoại xem bằng mắt sau khi ẩn nút nổi.

## Dở dang, việc tiếp theo

- Không. CSS `.m-ch-khai-so-du` giờ không dùng, chưa xoá.

## Bẫy, quyết định mới

- Không.
