# Dashboard nhà hàng gói Plus, Pro thay Tổng quan (T939, T941)

- Ngày: 26/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T939: thiết kế hai bản mockup HTML dashboard nhà hàng: `docs/thiet-ke/T939-dashboard-nha-hang-v1.html` (biểu đồ cột và đường), `...-v2.html` (sparkline, thanh bullet, bảng theo cửa hàng có thanh dữ liệu).
- T941: Trang chủ gói Plus, Pro, màn Tổng quan thay hẳn bằng `src/modules/home/DashboardNhaHang.tsx`: 4 thẻ KPI, doanh thu và biên LN gộp theo kênh, cơ cấu chi phí, tiền và ngân hàng, Kết quả kinh doanh và Thu chi 13 tháng, chi phí NVL so với định mức, công nợ phải thu phải trả, hao hụt NVL, kết quả theo cửa hàng.
- `src/modules/home/soLieuDashboardNhaHang.ts`: số liệu giả bằng đồng lẻ đến trăm đồng, cộng khớp nhau (cửa hàng cuối nhận phần dư). Định mức NVL, hao hụt lấy từ Danh mục cửa hàng (T938), tất cả cửa hàng thì bình quân gia quyền theo tỷ trọng doanh thu, chưa đặt thì ghi "Chưa đặt định mức".
- `src/ui/Charts.tsx`: thêm `CotDuongChart` (cột nhóm, đường, trục phải %) và `SparkDinhMuc` (đường 13 tháng, đường định mức), tooltip tự vẽ khi rê chuột.
- `TongQuan.tsx`: gói không phải Standard trả về `DashboardNhaHang`. `BaBaiToanStandard.tsx`: export `TT_NHANH_STANDARD` để dùng lại dải Thao tác nhanh. Cuối `app.css`: kiểu `.dnh-*`.
- Năm, tháng chọn trên hàng tab như Standard (tháng 7 đến 10), cửa hàng theo thanh trên.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py` cho `DashboardNhaHang.tsx`, `soLieuDashboardNhaHang.ts`: sạch.
- Xem bằng trình duyệt ở 1440px: không lỗi console, tooltip hiện, căn lề các bảng, dòng tổng ba thẻ hàng hai thẳng hàng.
- `python tools/kiem_tra.py --nhanh`: KHÔNG chạy hết, dừng ở ca Thẻ kho T870/T871 (lỗi có sẵn ghi ở T933), nên không có dòng "Không có lỗi.". Chưa kiểm ca nào phía sau.
- Chưa kiểm trên điện thoại: màn điện thoại gói Plus dùng `MTrangChu.tsx`, không đổi.

## Dở dang, việc tiếp theo

- Các khối Tổng quan cũ trong `TongQuan.tsx` (thác nước, sức khoẻ tài chính, cảnh báo, món bán chạy) và hộp Tuỳ chỉnh không còn hiện ở Plus, Pro; dọn ở T942.
- Số liệu kênh, cơ cấu chi phí, quỹ, công nợ, hao hụt là số giả, chưa nối sổ thật.

## Bẫy, quyết định mới

- `dashboardNhaHang.ts` và `DashboardNhaHang.tsx` khác nhau chỉ ở hoa thường, `tsc` báo lỗi trên Windows; file số liệu đặt tên `soLieuDashboardNhaHang.ts`. Chưa ghi `docs/BAY.md`.
- Không có quyết định mới.
