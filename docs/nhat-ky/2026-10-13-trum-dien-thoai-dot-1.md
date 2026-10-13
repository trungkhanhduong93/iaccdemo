# Điện thoại đợt 1: khung, thanh trên, thanh dưới (T173)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Anti A (Antigravity Windows) và Anti B (Antigravity WSL) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/useLaMobile.ts`: hook ngưỡng `max-width: 767px`.
- `src/app/KhungApp.tsx`, `src/App.tsx`: route `/app` chọn `MobileShell` hoặc `Shell`. Thêm route `nghiep-vu`, `khac`; điện thoại tạm ra `MChiMayTinh`, máy tính về `/app`.
- `src/ui/mobile/MobileShell.tsx`: thanh trên (tên màn, nút quay lại, chọn chi nhánh), `<Outlet />`, `ThanhDuoi`, `OnboardFabi`, ghi lịch sử màn như `Shell`.
- `src/ui/mobile/ThanhDuoi.tsx`: 4 tab Trang chủ, Nghiệp vụ, Báo cáo, Khác, biểu tượng IVT nạp `?raw` đổi màu theo tab. Biểu tượng chép vào `src/assets/ivt/`.
- `src/ui/mobile/manMobile.ts`, `MChiMayTinh.tsx`: mọi màn trên điện thoại tạm ra thẻ "Màn này chưa có trên điện thoại".
- `src/app/Screen.tsx`: `ScreenRoute` dùng `manMobile` khi ở điện thoại.
- `src/styles/app.css`: mục cuối `Điện thoại đợt 1 (T173)`, biến `--m-*` theo số tạm mục 5.2 của kế hoạch.
- `index.html`: thêm `viewport-fit=cover`.
- `tools/kiem_tra.py`: cờ `--dien-thoai` (khung 390×844, 17 địa chỉ, bấm 4 tab, chụp `tools/shots/m-*.png`); in tiếng Việt không lỗi mã hoá trên Windows.
- `docs/ke-hoach-mobile-ivt.md`: mục 8 ghi rõ cách chụp và từng ảnh phải thấy gì; đợt 7 ghi chú báo cáo còn lại sau T171.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py`: 571 lượt mở màn, Không có lỗi.
- `python tools/kiem_tra.py --dien-thoai`: 17 địa chỉ, Không có lỗi.
- So 25 ảnh bản máy tính trước và sau: 14 ảnh khác ở nút "Trải nghiệm gói" góc trên phải (hiệu ứng chạy theo thời gian), xem bằng mắt giống nhau. Không có chỗ khác.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Đợt 0: Trum chụp 16 ảnh theo mục 8 của `docs/ke-hoach-mobile-ivt.md`, bỏ vào `docs/ivt-anh/`. Có ảnh thì đo số, thay số tạm trong bảng 5.2 và biến `--m-*` ở `app.css`.
- Đợt 2: Trang chủ, Nghiệp vụ, Khác (mục 7 của kế hoạch). Thay `RouteTamMobile` trong `App.tsx` bằng màn thật.

## Bẫy, quyết định mới

- Anti B chạy `agy` trong WSL: tab Orca phải là PowerShell chạy `wsl.exe`, đặt `WSLENV` gồm các biến `ORCA_*` và tạo lệnh `orca` trỏ về `orca.exe`, xem `backup/anti-b.sh` trên máy Trum. `--shell wsl.exe` bị Orca từ chối vì dự án chạy trên Windows.
