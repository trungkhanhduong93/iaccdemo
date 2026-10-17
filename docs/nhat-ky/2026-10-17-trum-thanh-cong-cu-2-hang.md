# Thanh công cụ danh sách chứng từ tách 2 hàng (T349)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`, khối `ds-thanh`: tách 2 hàng. Hàng 1 `BoLoc` (phễu, ô lọc, nút Lọc) bên trái, Thêm mới góc phải. Hàng 2 chip trạng thái hoặc tab Kiểm kê bên trái; Excel, Tuỳ chỉnh cột, Hàng loạt bên phải. Props, logic giữ nguyên.
- `app.css`, mục cuối T349: 2 hàng xếp dọc, ô lọc tự xuống dòng ở màn hẹp. Gỡ hết `!important` Anti viết ban đầu.
- Áp cho mọi màn danh sách chứng từ ở cả 3 gói. Danh mục, báo cáo (`ThanhLoc.tsx`) và điện thoại không đổi.
- Rebase lên `main`: xung đột cuối `app.css` với mục T345, giữ cả hai, bù dấu đóng khối.

## Đã kiểm

- Anti chạy `npm run typecheck`, `npm run build`, `kiem_tra.py --nhanh` (cổng 5181): không lỗi, cả trước và sau khi gỡ `!important`.
- Anti đo `.ds-thanh` không tràn ngang (scrollWidth trừ clientWidth bằng 0) ở 8 màn: Thu chi gói Pro, gói Free, Mua hàng gói Pro, Kiểm kê kho, cỡ 1280x800 và 1440x900. Ảnh ở `%TEMP%/T349-anh/v2/`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/BAY.md`: gộp xung đột cuối `app.css` làm mất dấu đóng khối.
