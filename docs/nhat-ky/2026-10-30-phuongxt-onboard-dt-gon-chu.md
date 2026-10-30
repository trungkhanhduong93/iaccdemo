# Màn mở từ FABi trên điện thoại gọn chữ (T138)

- Ngày: 30/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn việc khác, phần gọn chữ đã xong)

## Đã làm

- Góp ý màn onboard điện thoại nhiều chữ: chọn hướng gộp 3 trang còn 2, giữ ý chính.
- `src/modules/onboarding/KhoiTaoFabi.tsx`: điện thoại 2 trang. Trang 1 nhãn, tiêu đề, câu phụ ngắn, ảnh app. Trang 2 "Quán bạn được gì", 4 dòng giá trị (cột thứ 4 của `GIA_TRI`), cam kết `CAM_KET_DT` một hàng, nút kết nối. Bỏ đoạn nâng cấp Plus, Pro trên điện thoại. Web giữ nguyên chữ.
- `src/modules/onboarding/OnboardFabi.tsx`: popup Kết nối trên điện thoại chữ ngắn, tiền về quỹ 2 dòng (Tiền mặt; Ngân hàng, ví điện tử), dòng "Sẽ lấy … đơn bán, … phiếu thu chi" thay khung bên; màn Dữ liệu đã sẵn sàng bỏ danh sách danh mục.
- `src/styles/app.css`: mục cuối file "Điện thoại, màn mở từ FABi gọn chữ … (T138)". Popup bớt khoảng cách, ẩn dòng "Đổi ở Danh mục › Quỹ tiền" để vừa 1 trang.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van` 2 file: 0 ĐỎ; 1 VÀNG là câu nâng cấp Plus, Pro cũ trên web.
- Trình duyệt 375x812 và 375x667: trang 2 và popup Kết nối không phải cuộn.

## Dở dang, việc tiếp theo

- Phần gọn chữ: không. Chữ mới chưa có trong file "Chỉnh text Onboarding.xlsx" của PhuongXT, nên thêm cột chữ điện thoại vào file đó.
- T138 còn bước phiếu chi trong hướng dẫn (chờ Trum, T552).

## Bẫy, quyết định mới

- Không.
