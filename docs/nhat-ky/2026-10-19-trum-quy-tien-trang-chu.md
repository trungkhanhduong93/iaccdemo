# Quỹ tiền trang chủ Free điện thoại (T423, T435)

- Ngày: 19/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- T423: Hiện lại nút "Tất cả quỹ (n) ›" ở cột phải phía trên nút "Xem dòng tiền 13 tháng ›", độ cao cân xứng với nút "Tạo quỹ" bên trái ở `src/ui/mobile/MTrangChuFree.tsx`.
- T435: Đưa số tồn quỹ hiện tại sang bên phải cùng hàng với nhãn "Tồn quỹ hiện tại" ở `src/ui/mobile/MTrangChuFree.tsx`.
- Thêm CSS `m-free-ton-quy-hang` ở cuối `src/styles/app.css` căn giữa theo chiều dọc, số tiền 19px đậm theo thang T426, không xuống dòng trên màn 360px.
- Chụp ảnh trước/sau tại `backup/T435-quy-tien-360-truoc.png`, `backup/T435-quy-tien-360-sau.png`, `backup/T435-quy-tien-390-sau.png`, `backup/T435-quy-tien-360-so-dai.png`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: thành công, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/mobile/MTrangChuFree.tsx`: Sạch (0 ĐỎ, 0 VÀNG).
- Playwright mobile viewport 360x780 và 390x844: hiển thị đúng, số tiền 1.250.000.000 đ không xuống dòng ở 360px, bấm mở modal thành công.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
