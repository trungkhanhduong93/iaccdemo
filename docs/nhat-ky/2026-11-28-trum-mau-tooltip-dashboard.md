# 28/11/2026 · Trum · Màu và nội dung tooltip dashboard nhà hàng (T960)

## Đã làm

- Chấm màu trong tooltip mất vì tooltip gắn ra body, không đọc được biến `--dnh-*`. Khai báo biến cho cả `.nh-tip`.
- Trang đặt zoom 0.9 làm tooltip fixed lệch khỏi con trỏ. Hàm `Tip` chia left, top cho tỷ lệ zoom.
- `SparkDinhMuc` thêm prop `tien`: tooltip Chi phí NVL có Doanh thu, Chi phí NVL; tooltip Hao hụt có Chi phí NVL, Giá trị hao hụt.
- Hộp nguồn hao hụt cùng khung, bóng, cỡ chữ với `ll-tip`.

## Kiểm

- typecheck, build exit 0; ca kiểm dashboard riêng in "Không có lỗi.".
- Đo 4 tooltip: cách con trỏ 15px, 14px.

## Dở dang, việc tiếp theo

Không.
