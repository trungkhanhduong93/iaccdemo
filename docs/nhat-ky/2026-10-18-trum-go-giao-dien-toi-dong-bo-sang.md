# Gỡ giao diện tối trang chủ điện thoại, đồng bộ theme sáng (T422)

- Ngày: 18/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css`: gỡ sạch các khối `@media (prefers-color-scheme: dark)` và `:root[data-theme="dark"]` làm nền thẻ Kết quả kinh doanh và các thẻ trang chủ bị biến thành màu xanh đậm `#1e293b`.
- `index.html`: thêm `<meta name="color-scheme" content="light" />` để trình duyệt điện thoại không tự đảo màu hay áp kiểu tối lên ứng dụng.
- `docs/TIEN-DO.md`: chuyển T422 sang mục Đã xong.

## Đã kiểm

- `npm run typecheck`: không có lỗi.
- `npm run build`: dịch xong, 258 module, không có lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Kiểm tra Playwright với `color_scheme='dark'` trên iPhone: thẻ Kết quả kinh doanh giữ đúng nền trắng `rgb(255, 255, 255)`, chữ `rgb(31, 34, 37)`, màu sắc đồng bộ hoàn toàn với giao diện sáng của hệ thống.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
