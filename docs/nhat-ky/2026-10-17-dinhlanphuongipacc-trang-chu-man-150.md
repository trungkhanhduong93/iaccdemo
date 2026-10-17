# Trang chủ Free máy tính vừa màn đặt tỉ lệ 150% (T338)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Ý người dùng: màn đầu thấy trọn 2 khối Kết quả kinh doanh và Quỹ tiền, kể cả biểu đồ 13 tháng; cuộn xuống mới tới Mua hàng & công nợ nhà cung cấp, Hao hụt kiểm kê. Màn Full HD đặt 150% (khung khoảng 1280×640) trước đây đáy 2 khối đầu tràn khoảng 100px.
- `src/modules/home/BaBaiToanFree.tsx`: `KhungVua` thêm `toiThieu`. Có `toiThieu` thì biểu đồ tự thấp xuống (không dưới `toiThieu`, không quá `cao`) cho đáy khối `.bbt-cot` nằm trong vùng cuộn `.main`; tính lại khi khung, khối đổi cỡ hoặc cửa sổ đổi cỡ; chỉ áp dụng từ bề ngang 901px. Hai biểu đồ 13 tháng dùng `cao={210} toiThieu={120}`.
- `src/styles/app.css`, mục cuối T338: màn thấp (cao tới 820px, ngang từ 901px) thu nhỏ vòng tồn quỹ, bớt khoảng trống trên biểu đồ, ẩn dòng chú thích nghiêng dưới tên biểu đồ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Gói Free trên localhost, khung 1280×640: 2 khối đầu nằm trọn màn đầu, biểu đồ 122px. Khung 1920×960: biểu đồ giữ 210px, bố cục như cũ.

## Dở dang, việc tiếp theo

- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.
- `BaBaiToanFree.tsx` cũng là file của T331 (đang làm ở phiên khác). Sửa ở đây gọn trong `KhungVua` và 2 dòng gọi biểu đồ; lấy bản mới về mà xung đột thì giữ cả hai phần.

## Bẫy, quyết định mới

- Khung trình duyệt của agent bị ẩn thì trang chạy như tab nền, `ResizeObserver` không gọi tới khi trang được vẽ lại (chụp màn hình). Đo bố cục khi khung ẩn sẽ ra số cũ, không phải lỗi code.
