# Làm kín khe hở 1px giữa các cột đóng băng (T353)

- Ngày: 17/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Sửa `src/styles/app.css`: thêm rule `::before` phủ kín mép trái `-1px` với `background: inherit` cho các ô cố định bên trái (`th.dinh`, `td.dinh`) ở cả thead, tbody và tfoot, loại trừ `dinh-phai`.

## Đã kiểm

- `npm run typecheck`: chạy xong, không có lỗi.
- `npm run build`: chạy xong, không có lỗi.
- `python tools/kiem_tra.py --nhanh`: in dòng "Không có lỗi."
- Đã chụp kiểm tra Playwright và đo pixel: vết hở 1px lộ chữ ngầm bên dưới giữa cột Ngày và Số chứng từ khi cuộn ngang đã được làm kín hoàn toàn.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
