# Ô chọn ngay ngắn, bỏ sơ đồ màn đăng nhập (T28)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- `BangSua.tsx`, `ChungTuForm.tsx`: 6 ô `<select>` của trình duyệt (mã hàng, kho, thuế suất, tài khoản ngân hàng, nhân viên thực hiện, chi nhánh lập) đổi sang `Select` trong `src/ui/Dropdown.tsx`. Cả form giờ dùng cùng một kiểu ô chọn.
- `app.css`: ô chọn trong bảng dòng cao 30px bằng ô gõ (`.bang-sua .sel.inp`). Ô chọn bị khoá ở chế độ xem có nền xám, ẩn mũi tên, giống ô chỉ đọc.
- `ChungTuForm.tsx`: cột 3 của khối thông tin chung bỏ `padding: 12` và nền `var(--subtle)`. Biến này không có trong `:root` nên nền trong suốt, chỉ còn khoảng đệm làm cột lệch xuống 12px.
- `Login.tsx`, `app.css`: bỏ sơ đồ kết nối FABi, iPOS Inventory ở khung trái màn đăng nhập và các lớp `.hub`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Đã chụp màn đăng nhập, form chi qua ngân hàng ở chế độ xem và chế độ sửa, xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
