# Dashboard nhà hàng điện thoại gói Plus, Pro (T943)

- Ngày: 26/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MDashboardNhaHang.tsx` (mới): dashboard nhà hàng một cột như web T941: chọn năm, tháng; 4 thẻ KPI; kênh; cơ cấu chi phí; tiền và ngân hàng (có dòng Tổng cộng); Kết quả kinh doanh và Thu chi 13 tháng; chi phí NVL so với định mức; công nợ; hao hụt NVL; kết quả theo cửa hàng (mỗi cửa hàng một thẻ nhỏ, có thẻ Tổng).
- `src/ui/mobile/MTrangChu.tsx`: ở tab Quản trị gói Plus, Pro giữ nguyên đầu trang và thẻ Thao tác nhanh, thay các thẻ Tổng quan tài chính, thác nước, xu hướng, dòng tiền, hiệu quả cửa hàng, cơ cấu chi phí, món bán chạy, tồn kho, NVL, hao hụt cũ bằng `MDashboardNhaHang`. Tab Cần theo dõi, chip cửa hàng không đổi.
- `src/ui/Charts.tsx`: `CotDuongChart`, `SparkDinhMuc` thêm prop `rong` (bề rộng khung vẽ, điện thoại 360).
- `src/modules/home/DashboardNhaHang.tsx`: xuất các thành phần nhỏ (Doi, ThanhTy, Chu, ChuDuong, SoDinhMuc, so1) để điện thoại dùng lại. Số liệu dùng chung `soLieuDashboardNhaHang.ts`. Cuối `app.css`: kiểu `.m-dnh`, `.mdnh-*`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_van.py` cho `MDashboardNhaHang.tsx`, `MTrangChu.tsx`: sạch.
- Xem bằng trình duyệt 390px, gói Plus: có 9 thẻ dashboard, không lỗi console, không tràn ngang, số tiền đầy đủ hiện đúng.
- `python tools/kiem_tra.py --nhanh` và `--dien-thoai`: chưa chạy (`--nhanh` dừng ở lỗi có sẵn T933). Chưa chụp ảnh từng thẻ để soát bằng mắt; chưa thử rê chạm biểu đồ trên máy thật.

## Dở dang, việc tiếp theo

- Các thẻ cũ trong `MTrangChu.tsx` bị bỏ khỏi trang vẫn còn code (biến, import) ở đầu hàm `MTrangChuCoPhi`; dọn cùng T942.
- Số liệu là số giả.

## Bẫy, quyết định mới

- Không.
