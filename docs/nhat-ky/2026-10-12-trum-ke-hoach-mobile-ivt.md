# Kế hoạch giao diện điện thoại theo IVT Pro (T170)

- Ngày: 12/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Đọc `mobile/IVT Pro(STG).apk`: app viết bằng Flutter, lấy được biểu tượng, hình minh hoạ, phông, câu chữ, tên màn. Bố cục chi tiết phải đo từ ảnh chụp.
- Viết kế hoạch `docs/ke-hoach-mobile-ivt.md`: cấu trúc IVT, bộ nhận diện, cách dựng trong iaccdemo, 9 đợt làm, danh sách ảnh cần chụp.
- Ghi QD54, đánh dấu QD06 (chỉ làm web) đã bị thay.
- Thêm `*.apk` vào `.gitignore`.
- Soát lại kế hoạch cho agent khác đọc là làm được: chốt kiến trúc (hook ngưỡng, `KhungApp`, `manMobile`), nguồn dữ liệu từng màn, thẻ danh sách, 9 đợt có bước, file, việc không làm, nghiệm thu.
- Rút tài nguyên IVT vào `docs/ivt-tai-nguyen/` (222 SVG biểu tượng, 17 hình, câu chữ, tên màn) để máy không có APK vẫn làm được.

## Đã kiểm

- `python tools/kiem_van.py docs/ke-hoach-mobile-ivt.md`: sạch.
- `python tools/kiem_van.py docs/QUYET-DINH.md`: 0 ĐỎ, 2 VÀNG ở phần có sẵn, không thuộc QD54.
- Không sửa `src/`, không chạy typecheck, build.

## Dở dang, việc tiếp theo

- Đợt 0: Trum chụp 16 ảnh theo mục 8 của kế hoạch, lưu vào `docs/ivt-anh/`. Agent đo số, điền bảng 5.2 và đầu mục 8.
- Đợt 1: nhận việc theo mục 0 của kế hoạch, làm theo mục 7 đợt 1.
- Tài nguyên IVT đã có ở `docs/ivt-tai-nguyen/`. Cần thêm thì giải nén APK bằng Python `zipfile`, bỏ qua `assets/flutter_assets/assets/config/` (file `.env`).

## Bẫy, quyết định mới

- QD54 trong `docs/QUYET-DINH.md`.
