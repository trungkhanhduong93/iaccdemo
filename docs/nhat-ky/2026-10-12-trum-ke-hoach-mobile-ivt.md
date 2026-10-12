# Kế hoạch giao diện điện thoại theo IVT Pro (T170)

- Ngày: 12/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Đọc `mobile/IVT Pro(STG).apk`: app viết bằng Flutter, lấy được biểu tượng, hình minh hoạ, phông, câu chữ, tên màn. Bố cục chi tiết phải đo từ ảnh chụp.
- Viết kế hoạch `docs/ke-hoach-mobile-ivt.md`: cấu trúc IVT, bộ nhận diện, cách dựng trong iaccdemo, 9 đợt làm, danh sách 14 ảnh cần chụp.
- Ghi QD54, đánh dấu QD06 (chỉ làm web) đã bị thay.
- Thêm `*.apk` vào `.gitignore`.

## Đã kiểm

- `python tools/kiem_van.py docs/ke-hoach-mobile-ivt.md`: sạch.
- `python tools/kiem_van.py docs/QUYET-DINH.md`: 0 ĐỎ, 2 VÀNG ở phần có sẵn, không thuộc QD54.
- Không sửa `src/`, không chạy typecheck, build.

## Dở dang, việc tiếp theo

- Đợt 0: Trum chụp 14 ảnh theo mục 6 của kế hoạch, lưu vào `docs/ivt-anh/`. Agent đo số, điền mục 7.
- Đợt 1: thêm việc mới vào `docs/TIEN-DO.md`, làm `MobileShell` theo mục 4, 5 của kế hoạch.
- Muốn giải nén lại APK: dùng Python `zipfile`, bỏ qua `assets/flutter_assets/assets/config/` (file `.env`).

## Bẫy, quyết định mới

- QD54 trong `docs/QUYET-DINH.md`.
