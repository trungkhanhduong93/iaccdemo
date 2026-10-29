# Bộ kiểm hết báo tràn ngang thất thường ở màn báo cáo (T684)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Tái hiện bằng script tạm ngoài repo: đi màn như `main()` của `kiem_tra.py` (bấm sidebar, tab, không tải lại trang), cả 3 gói S, PL, PR, 3 vòng, đo `.main`, `.fsf-b`, `.mtabs-in` mỗi khung hình tới 1,2 giây sau khi chuyển màn.
- `tools/kiem_tra.py`, hàm `kiem` trong `main()`: lần đo đầu thấy tràn thì đo lại mỗi 100ms, hết 1 giây còn tràn mới báo lỗi. Áp cho cả 3 ô, giữ ngưỡng 2px. Màn không tràn đo một lần như cũ.
- Không sửa `ReportScreen.tsx`: tràn không lộ ra cho người dùng (xem số đo).

## Số đo

- 1002 lượt mở màn, 28 lượt tràn, mỗi vòng 7–12 lượt, rơi vào 13 màn báo cáo khác nhau. Nhiều nhất: `kho/5-2-10` 6 lần, `kho/5-2-11` 5 lần, `tien/2-2-3` 3 lần.
- 25 lần ở `.main`, luôn đúng 3px. 3 lần ở `.mtabs-in` (màn `tong-hop/10-2-3`), lố 176px, hết sau dưới 20ms.
- Thời gian tràn kéo dài: 12–381ms. 9/28 lần tràn bắt đầu sau mốc 60ms, nên bộ kiểm cũ lúc trúng lúc trượt.
- Phần tử gây tràn: thanh chọn báo cáo `.bc-chon` (`white-space: nowrap`), `scrollWidth` 1371 so với `clientWidth` 1368. `.page-report` không tràn.
- Lúc tràn, `.main` có `overflow-x: hidden` (`.main:has(.bc-chon)` trong `app.css`), nên không có thanh cuộn ngang nháy trên màn.

## Đã kiểm

- `python tools/kiem_tra.py --nhanh` bản cũ: 197 giây, `Không có lỗi.` (lượt này không trúng tràn).
- Bản mới chạy 3 lượt liền: 195, 206, 201 giây, cả 3 lượt in `Không có lỗi.` Thời gian không tăng.
- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Ghi `docs/BAY.md`: mục `kiem_tra.py` thỉnh thoảng báo tràn ngang `.main` ở màn báo cáo (T684).
