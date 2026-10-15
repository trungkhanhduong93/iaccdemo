# Trang chủ điện thoại gói Free giống bản web, ẩn mục khoá, nút quay lại (T257, T259)

- Ngày: 15/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MTrangChu.tsx`: gói Free dựng lại theo trang chủ Free bản web: thẻ 1. Quản lý lãi lỗ kèm Báo cáo lãi lỗ tháng, thẻ 2. Quản lý thu chi kèm Tồn quỹ hiện tại, thẻ 3. Quản lý kho kèm Mua hàng, công nợ, hao hụt. Số liệu lấy từ cùng hàm của bản web. Nút Xem biểu đồ lãi lỗ 13 tháng mở hộp `HopLaiLo13` của T255.
- `BaBaiToanFree.tsx`: chỉ thêm `export` cho `laiLo13Thang`, `HopLaiLo13` để bản điện thoại dùng chung.
- Gói Free trên điện thoại bỏ tab Cần theo dõi. Hàng đầu trang chỉ còn ô Năm, Tháng và chip chi nhánh, vừa màn 375px.
- Gói khác: tab Quản trị, Cần theo dõi một hàng, chip chi nhánh xuống hàng dưới, không tràn mép phải.
- Gói Free trên điện thoại ẩn hẳn mục ngoài gói thay vì hiện khoá: `MNghiepVu.tsx` (phân hệ, màn), `MKhac.tsx` (danh mục, hệ thống), `MTimKiem.tsx` (kết quả tìm), `MTacVu.tsx` (bước khoá sổ chỉ có từ gói Plus), khối Thao tác nhanh ở trang chủ. Dùng `anNgoaiGoi`, `moDuoc`. Gói khác giữ cách hiện khoá cũ.
- `MobileShell.tsx`: màn con mở từ trang chủ (`/app/trang-chu/...`, trừ Tổng quan, Bàn làm việc) có thanh trên với nút quay lại. Nút về trang chủ, giữ tham số `thang`.
- `app.css`: mục T257 cuối file.
- T259 (Anti B viết): khối Thao tác nhanh gói Free lên trên thẻ 1. Quản lý lãi lỗ; gói Free có mảng `thaoTacFree` riêng: Thu tiền, Chi tiền, Nhập mua (`/app/mua-hang/4-1-1/moi`), Kiểm kê (`/app/kho/5-1-10/moi`), Sổ quỹ. Gói khác giữ 5 ô cũ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_tra.py --dien-thoai`: còn 1 lỗi cũ, màn Chi phí NVL (`trang-chu/chi-phi-nvl`) chưa có bản điện thoại. Lỗi này thuộc việc T242, không do T257.
- `kiem_van.py` cho `MTrangChu.tsx`, `MobileShell.tsx`: sạch.
- T259: typecheck, build, `kiem_tra.py --nhanh` không lỗi; `kiem_van` sạch; Playwright 375px gói Free: khối nằm trên thẻ lãi lỗ, đủ 5 ô; bấm Nhập mua, Kiểm kê mở đúng form thêm mới, không lỗi trang.
- Playwright 375px, 390px gói Free: số liệu trang chủ khớp ảnh bản web tháng 10, ô Năm, Tháng hiện đủ chữ, không cuộn ngang. Anti đếm phần tử khoá gói Free trên các màn điện thoại: 0.

## Dở dang, việc tiếp theo

- Không. Trum chốt giữ khối Thao tác nhanh trên trang chủ Free điện thoại, chỉ hiện thao tác mở được.

## Bẫy, quyết định mới

- Không.
