# Nút Xoá ra chân phiếu, Tiện ích thành nút ba chấm (T965)

- Ngày: 28/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Anti B, gemini-4-hydrogen-high) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: chân phiếu chế độ xem, bên trái còn nút chứng từ trước, sau và In phiếu. Bên phải xếp nút Xoá, Sửa (Ctrl+E), nút ba chấm dọc. Menu ba chấm giữ các mục cũ của Tiện ích trừ hai mục Xoá chứng từ, rộng 240px.
- Nút Xoá hiện khi phiếu đã lưu và không khoá (`row && !khoaSua`), gọi `thuXoa` như cũ. Phiếu đã xuất HĐĐT không còn mục Xoá mờ trong menu, vì đã có nhãn khoá.
- `src/modules/kho/XuatDinhLuong.tsx`: menu Tiện ích (chỉ có Xuất Excel) thành nút ba chấm ở chân phải.
- `src/styles/app.css`: mục cuối T965, lớp `.xp-btn-xoa` chữ đỏ, nền đỏ nhạt khi rê chuột.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/generic/ChungTuForm.tsx`: 0 ĐỎ, 6 VÀNG (chuỗi đường vẽ SVG cũ).
- Ảnh phiếu mua MH2610-0022: chân phải đúng thứ tự Xoá, Sửa, ba chấm; menu mở lên trên, không có mục Xoá.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
