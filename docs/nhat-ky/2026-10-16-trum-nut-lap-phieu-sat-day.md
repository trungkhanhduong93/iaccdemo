# Thanh nút Lập phiếu sát đáy ở Lịch sử thu chi điện thoại (T292)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css`, mục T292 cuối file: màn cấp hai (`.m-cap-2`) không có thanh dưới, nên thanh `.m-free-day-nut` đặt `bottom: 0`. Trước đó thanh này luôn chừa chỗ cho thanh dưới nên treo lơ lửng. Vùng cuộn `.m-than` chừa 80px ở đáy để dòng cuối không bị che.

## Đã kiểm

- Mở Lịch sử thu chi gói Free khung 390x844: thanh nút nằm từ 779px tới 844px, sát đáy. Cuộn tới cuối, dòng cuối hiện đủ trên thanh nút.
- `npm run typecheck`, `npm run build`, `kiem_tra.py --nhanh`: chạy trước khi push, cùng lần kiểm T282.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
