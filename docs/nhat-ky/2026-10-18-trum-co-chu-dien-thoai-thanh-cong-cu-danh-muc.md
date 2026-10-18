# Cỡ chữ điện thoại 360px (T426) và thanh công cụ danh mục web (T427)

- Ngày: 18/10/2026
- Người: Trum, agent: Antigravity tiếp quản từ Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css` (T426): cập nhật các biến `--m-*` trong `:root` theo thang chung (thanh trên 17px, thanh dưới 10.5px, chữ chính 14px, tiền 14px, chip 10.5px). Thêm khối `@media (max-width: 767px)` ở cuối file áp dụng thang chữ chuẩn và căn chỉnh tránh đè chữ cho thiết kế cơ sở 360px theo QD73.
- `src/ui/generic/CatalogScreen.tsx` (T427): chuyển thanh công cụ từ 1 hàng + chip dính lề sang 2 hàng chuẩn `ds-thanh` (giống màn chứng từ). Hàng 1 gồm ô tìm kiếm, nút phễu mở popover lọc và các nút thao tác phải (Đồng bộ FABi, Thêm mới). Hàng 2 đưa chip trạng thái vào bên trái, số dòng và nút tuỳ chỉnh cột, Excel vào bên phải. Chip trạng thái thẳng lề ô tìm kiếm.
- `docs/QUYET-DINH.md`: hoàn thiện QD73 thay mốc thiết kế 390pt của QD54 sang chuẩn 360px.
- `docs/TIEN-DO.md`: chuyển T426 và T427 sang Đã xong.

## Đã kiểm

- `npm run typecheck`: sạch lỗi.
- `npm run build`: hoàn tất, không lỗi.
- `python tools/kiem_tra.py --nhanh` (dev server cổng 5190): `Không có lỗi.`
- `python tools/kiem_van.py`: đã soát `CatalogScreen.tsx`, `QUYET-DINH.md`, `TIEN-DO.md`, `CHANGELOG.md`, file nhật ký; không có lỗi ĐỎ.
- Pre-push QA: diff T426, T427 XANH, không sót điều kiện hiển thị của các gói hay thao tác danh mục.

## Dở dang, việc tiếp theo

- Giao diện điện thoại còn vài chỗ inline fontSize trong `MTrangChuFree.tsx` và `MXuatBanPos.tsx` sẽ dọn dẹp khi T423, T425 hoàn tất.
- Triển khai tiếp T428 (tiêu đề cột nút trong Cột hiển thị) và T431 (vòng lặp nút back điện thoại).

## Bẫy, quyết định mới

- QD73: App điện thoại chuẩn hoá bề rộng thiết kế cơ sở là 360px, thang chữ chung toàn app.
