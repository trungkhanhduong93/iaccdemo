# Hết rung trang do vòng nhấp nháy nút Hướng dẫn (T686)

- Ngày: 30/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Cuối `src/styles/app.css`, mục T686: `.mtabs { overflow-x: clip; }`. Vòng cam nhấp nháy quanh nút Hướng dẫn cuối thanh tab không còn lố ra ngoài cửa sổ.

## Đã kiểm

- Trum báo: ở Hệ thống, bấm Khoá sổ, Gói thuê bao, Người dùng thì màn rung; Thông tin đơn vị, Cấu hình kế toán không rung.
- Đo bằng script tạm, màn 1440x900, gói S và PR, mỗi khung hình trong 1,5 giây sau khi bấm tab. Trước sửa: `scrollWidth` của trang nhảy 1441, 1442 … 1446 rồi về 1440 theo nhịp vòng nhấp nháy, nên thanh cuộn ngang của trang hiện, mất liên tục. Sau sửa: giữ 1440 suốt.
- Hai màn không rung là hai màn Trum đã bấm Hướng dẫn, nút thôi nhấp nháy.
- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Chưa kiểm trên Chrome có giao diện. Headless không vẽ thanh cuộn nên chỉ đo được `scrollWidth`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Ghi `docs/BAY.md`: hiệu ứng `transform: scale` quanh phần tử sát mép cửa sổ làm rung trang.
