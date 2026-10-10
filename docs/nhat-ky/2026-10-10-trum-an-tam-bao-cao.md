# Ẩn tạm sổ, BCTC, tờ khai do agent tự dựng (T122)

- Ngày: 10/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `danh-sach.ts`: thêm trường `anTam` trong `CauHinhBC`, hằng `ALL`, khai `anTam` cho 23 mã theo QD45.
- `registry.ts`: `apDung` trả false khi chế độ đang chọn nằm trong `anTam`.
- `Screen.tsx`: `ScreenRoute` hiện màn trống "Báo cáo chưa có mẫu" kèm nút về Tất cả báo cáo khi mở thẳng link báo cáo đang ẩn.
- `tools/kiem_tra.py`: ngưỡng số màn gói ngoài Free hạ từ 140 xuống 125 (gói PL còn 137 màn).
- Coordinator bỏ đoạn chặn trùng ở `ReportScreen.tsx` do worker thêm: đoạn này return trước `useState`, đổi chế độ khi đang mở màn sẽ vỡ thứ tự hook. `ScreenRoute` đã chặn mọi đường vào.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (chạy với `PYTHONIOENCODING=utf-8`).
- Script so `anTam` trong file với bảng QD45: 23 mã, 0 lệch.
- Playwright: 2.2.1 ở TT133, 10.2.1 ở TT58, 6.2.3 ở TT99 hiện "Báo cáo chưa có mẫu"; 2.2.1 ở TT152, 7.2.1 ở TT58 vẫn mở. Phân hệ Thuế ở TT99 không còn tab Tờ khai. Không lỗi trang.
- Worker kiểm thêm danh sách Tất cả báo cáo theo 6 cặp gói, chế độ: khớp bảng giữ lại.

## Dở dang, việc tiếp theo

- Chờ Trum đưa mẫu TT133, TT99 và các mẫu còn lại. Có mẫu thì bỏ chế độ tương ứng khỏi `anTam`, sửa cột, ký hiệu theo mẫu.

## Bẫy, quyết định mới

- QD45.
