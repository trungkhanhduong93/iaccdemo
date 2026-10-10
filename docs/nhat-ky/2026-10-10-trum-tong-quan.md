# Thiết kế lại màn Tổng quan (T133)

- Ngày: 10/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/chiSo.ts` (mới): tính số liệu theo kỳ, chi nhánh; 8 chỉ số sức khoẻ; dữ liệu thác nước, xu hướng, dòng tiền, chi nhánh, cơ cấu chi phí; đọc, lưu tuỳ chỉnh khối ở localStorage.
- `TongQuan.tsx`: bộ lọc Kỳ, So với, Chi nhánh (chọn nhiều), hộp Tuỳ chỉnh; 9 khối theo QD46; link báo cáo gốc qua `hienMan`; gói Free khoá khối chuyên sâu.
- `Charts.tsx`: thêm biểu đồ thác nước, cột kết hợp đường hai trục, có tooltip. Hàm cũ giữ nguyên chữ ký.
- `app.css`: mục "Tổng quan thiết kế lại (T133)".
- Vòng sửa 1: kỳ Từ đầu năm lấy dòng tiền tháng 8–10 (sổ cái bắt đầu tháng 8), số ngày đủ chi và so sánh chi nhánh đúng kỳ; không có kỳ so sánh thì ghi "Chưa có kỳ so sánh"; số thập phân dấu phẩy; cột T10 ghi "7 ngày", vẽ nhạt; khối khoá không hiện link; tên chỉ số tiếng Việt.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`: `Không có lỗi.`. `kiem_van.py` TongQuan.tsx, chiSo.ts: sạch.
- Playwright (coordinator): PR/TT99 và F/TT152 không lỗi trang, không NaN, Infinity, undefined. Kỳ Từ đầu năm: tiền đầu 691,1 tr + thu 6,8 tỷ − chi 5,74 tỷ = cuối 1,75 tỷ. Không còn số thập phân dấu chấm.
- Worker báo: tháng 9 doanh thu thuần, lợi nhuận gộp, lợi nhuận trước thuế khớp `kqkd(9, 2026)`; tiền cuối khớp `soCai(9)`; thác nước cộng trừ ra đúng lợi nhuận trước thuế.
- Chưa kiểm ở màn hẹp hơn 1280px (T12).

## Dở dang, việc tiếp theo

- Ngưỡng đèn của 8 chỉ số là ngưỡng F&B thông dụng, cần Trum hoặc kế toán trưởng chốt.
- So với Kế hoạch chờ màn Lập kế hoạch 10.1.7 có dữ liệu thật.
- So sánh kỳ Tháng này với 01–07/09: lợi nhuận trước thuế kỳ trước ước theo tỷ lệ ngày (kqkd chỉ tính theo tháng).

## Bẫy, quyết định mới

- QD46. `soCai` chỉ có từ tháng 8/2026: `soCai(7)` trả số sai, đừng dùng.
