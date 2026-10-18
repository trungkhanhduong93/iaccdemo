# Giao diện danh mục điện thoại theo AMIS/FABi (T434)

- Ngày: 18/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Không hiển thị thuế suất ngoài card danh mục hàng hoá bản app (`MDanhMuc.tsx`).
- Nút Đồng bộ FABi chuyển thành nút nổi góc dưới bên trái (`.m-nut-fabi-fab`), đối xứng nút Thêm mới bên phải (`MDanhMuc.tsx`, `MCuaHang.tsx`, `app.css`).
- Nút lọc danh mục chuyển thành icon phễu trên thanh tiêu đề góc phải, có chấm báo khi có điều kiện lọc (`MDanhMuc.tsx`, `MobileShell.tsx`, `app.css`).
- Hàng tab trạng thái hoạt động (Đang hoạt động / Ngừng hoạt động) hiển thị dạng tab bấm qua lại cho các danh mục thông thường (`MDanhMuc.tsx`).
- Riêng danh mục Hàng hoá: mang ra ngoài dạng tab trạng thái phân loại hàng hoá (Tất cả / Đã phân loại / Chưa phân loại), kèm chip trạng thái hoạt động ở trên (`MDanhMuc.tsx`).
- Ô tìm kiếm cố định hiển thị ngay dưới hàng tab, gõ lọc tức thì (`MDanhSach.tsx`).
- Chuẩn hoá nút Thêm mới thành nút tròn FAB `+` góc dưới bên phải ở màn danh mục (`MDanhSach.tsx`, `app.css`).

## Đã kiểm

- `npm run typecheck`: chạy xong, không có lỗi.
- `npm run build`: chạy xong, không có lỗi, hoàn thành trong 2.12s.
- `python tools/kiem_van.py`: 0 ĐỎ, 0 VÀNG trên tất cả các file đã sửa.
- Kiểm thử Playwright trên mobile viewport (375x812) cho màn Hàng hoá (`/app/danh-muc/1-2`) và Đối tượng (`/app/danh-muc/1-5`):
  + Icon phễu trên header: CÓ
  + Chip trạng thái ở Hàng hoá: CÓ
  + Tabs phân loại hàng hoá: Tất cả (34), Đã phân loại (31), Chưa phân loại (3)
  + Tabs Đối tượng: Đang hoạt động (18), Ngừng hoạt động (2)
  + Ô tìm kiếm cố định: CÓ
  + Nút Đồng bộ FABi nổi đáy trái: CÓ
  + Nút Thêm mới tròn đáy phải: CÓ
  + Cột số thuế suất trong card hàng hoá: 0 (đã gỡ bỏ thành công)
  + Đã chụp ảnh `screenshot_hanghoa.png` và `screenshot_doituong.png` đối chiếu khớp hoàn toàn với ảnh mẫu của Trum.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
