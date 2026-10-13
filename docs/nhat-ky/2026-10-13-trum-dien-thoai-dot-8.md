# Điện thoại đợt 8: đăng nhập, chọn đơn vị, popup (T184)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Anti B (Antigravity WSL) viết code, Anti A (Antigravity Windows) chạy kiểm và sửa lỗi nhỏ
- Trạng thái cuối phiên: Xong

## Đã làm

- `app.css` mục `Điện thoại đợt 8 (T184)`: mọi luật nằm trong `@media (max-width: 767px)`, không đổi markup.
  - Đăng nhập, Quên mật khẩu: ẩn cột giới thiệu `.auth-l`, hộp `.auth-box` rộng hết màn, ô nhập cao 44px, chữ 16px (iPhone không tự phóng to), nút chính rộng hết hàng.
  - Chọn đơn vị: thẻ `.dv-card` một cột.
  - Khởi tạo, Khởi tạo FABi: thanh bước `.steps` cuộn ngang, lưới `.grid.g2`, `.g3`, `.form-grid` một cột.
  - Popup khởi tạo `.ktf-pop` và hộp thoại `.hdb-hop`, `.ds-hop`, `.in-ct-hop`, `.tq-modal-box` phủ kín màn (`100dvh`), hàng nút dính đáy, ẩn thanh dưới nổi khi hộp thoại mở.
- `tools/kiem_tra.py --dien-thoai`:
  - Hàm `kiem_tra_dang_nhap_dot_8`: bắt đầu từ localStorage trống, qua màn Quên mật khẩu, gõ email, mật khẩu, chọn đơn vị, vào Nghiệp vụ, Thu chi, lập một phiếu chi. Mỗi màn kiểm không tràn ngang, nút chính trong khung nhìn.
  - Hàm `kiem_tra_popup_khoi_tao_dot_8`: bấm Thêm đơn vị kế toán, popup phải phủ đúng 390×844.
- Rà màn còn báo dùng máy tính trên điện thoại, chép vào `docs/TIEN-DO.md` thành T186–T192.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai` (cổng 5181): Không có lỗi. Phiếu chi lập ở 390px: PC2610-0261.
- Anti A so ảnh bản máy tính trước (commit `2f9eaa0`) và sau: 7 ảnh trùng khít; 17 ảnh lệch khử răng cưa ở thanh trên, độ lệch điểm ảnh tối đa 3; ảnh gói thuê bao lệch 15×16px ở nút radio có hiệu ứng. Không đổi bố cục. Mọi luật mới nằm trong media query điện thoại.
- Claude xem ảnh 390px: Đăng nhập, Quên mật khẩu, Chọn đơn vị, Khởi tạo, Khởi tạo FABi, popup khởi tạo.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Hết 8 đợt của `docs/ke-hoach-mobile-ivt.md`. Việc tiếp theo là T186–T192 trong `docs/TIEN-DO.md`: các màn còn báo dùng máy tính.
- Màn Đăng nhập ở điện thoại không có logo vì logo nằm trong cột `.auth-l` đã ẩn. Muốn có logo thì phải đổi markup `Login.tsx`, nên chưa làm.

## Bẫy, quyết định mới

- Bộ chọn `div:has(> div > .steps)` viết cho trang Khởi tạo bắt nhầm cả nền popup `.ktf-pop-nen`, vì popup cũng chứa `div > .steps`. Độ ưu tiên của `:has()` cao hơn `.ktf-pop-nen`, nên popup bị đệm 16px dù đã đặt `padding: 0 !important`. Đã sửa thành `div:not(.ktf-pop-nen):has(> div > .steps)`. Vòng kiểm của Anti A không bắt được lỗi này, Claude bắt được khi đo `getBoundingClientRect`.
