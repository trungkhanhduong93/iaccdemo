# Trang chủ Free 2 tab Tổng quan, Cần theo dõi, biểu đồ (T274)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code viết spec, kiểm, commit; Antigravity Windows (Anti A, Gemini 3.8 Flash High) code, chụp ảnh; Anti B (WSL) review chéo
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/BaBaiToanFree.tsx`, `mobile/MTrangChu.tsx` phần Free: 2 tab Tổng quan, Cần theo dõi (huy hiệu số cảnh báo), tab nhớ trên URL `?tab=theo-doi`. Lọc chi nhánh dùng ô chi nhánh có sẵn ở thanh đầu, đổi chi nhánh thì mọi thẻ tính lại.
- Tab Tổng quan: 3 cột mẫu E, dưới là 5 biểu đồ top 5 (mặt hàng doanh thu, chi phí trong tháng, mặt hàng giá vốn, nhà cung cấp mua nhiều, khoản chi tiền) và thẻ Lãi lỗ theo chi nhánh. Mỗi thẻ có link mở báo cáo gốc.
- Modal lãi lỗ: chọn Tất cả chi nhánh thì có 2 kiểu xem 13 tháng và Theo chi nhánh (biểu đồ cột ghép bên trái, bảng bên phải).
- Tab Cần theo dõi: công nợ quá hạn, hàng âm kho, hàng huỷ cao, doanh thu lệch POS, tháng chưa khoá sổ, biến động chi phí so với tháng trước.
- `home/BieuDoFree.tsx` (mới): component biểu đồ dùng chung web và điện thoại. `home/soLieuBieuDoFree.ts` (mới): số liệu lấy từ dữ liệu có sẵn; phần chưa có (lệch POS, huỷ, âm kho, hạn công nợ, khoá sổ) sinh số cố định theo tháng và chi nhánh, thẻ ghi "Số minh hoạ".
- `app.css`: mục T274 cuối file. `tools/kiem_tra.py`: kiểm 2 tab, đủ thẻ, đổi chi nhánh đổi số, modal 2 kiểu xem, tổng lãi các chi nhánh bằng lãi trang chủ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `--dien-thoai`: chỉ còn lỗi có từ trước, màn `trang-chu/chi-phi-nvl` (T242) và `thue/to-khai` chưa có bản điện thoại.
- Anti B review: XANH, góp ý bỏ dấu + trước % biến động chi phí, đã sửa.
- Claude xem ảnh, bắt 3 lỗi, Anti A sửa 1 vòng: modal Theo chi nhánh trống nửa phải; doanh thu chi nhánh cộng lại lệch 2.165.000 so với doanh thu thuần trang chủ; số thập phân dùng dấu chấm. Sau sửa: doanh thu các chi nhánh cộng 616.423.000, lãi cộng 51.957.923, khớp trang chủ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Windows không phân biệt hoa thường tên file: `bieuDoFree.ts` và `BieuDoFree.tsx` cùng thư mục làm TypeScript báo TS1149. Đặt tên file số liệu khác hẳn tên component.
- Lần đầu giao Anti A model `claude-opus-4-6-thinking` thì tài khoản báo hết quota nhóm Claude (reset sau 135 giờ), chuyển sang Gemini 3.8 Flash High.
