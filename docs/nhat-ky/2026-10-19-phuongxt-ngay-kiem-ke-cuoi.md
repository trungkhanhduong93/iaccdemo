# Bỏ % cùng kỳ mua hàng, ngày kiểm kê cuối ở trang chủ Free (T446)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/BaBaiToanFree.tsx`: thẻ Mua hàng & công nợ NCC bỏ chữ "▲ x% so với cùng kỳ" dưới Giá trị mua hàng, chỉ còn số phiếu.
- `home/BaBaiToanFree.tsx`, `home/khoFree.ts`: Tiến độ kiểm kê theo cửa hàng, cột cuối thay "lệch n" bằng ngày kiểm kê cuối trong tháng (dd/mm). Màu giữ như cũ: đỏ khi có mặt hàng lệch, xanh khi khớp. Rê chuột hiện ngày đủ năm và số mặt hàng lệch. Cửa hàng chưa kiểm vẫn ghi "chưa kiểm".
- Gộp 2 commit chưa push T317, T321 với bản mới trên GitHub. Xung đột ở `KhoaSoFree.tsx` với T327 (dinhlanphuongipacc, khung lý do dưới nút Mở khoá): PhuongXT chọn giữ hộp thoại giữa màn của T317, bỏ khung của T327; giữ chữ "Tháng ghi nhận chi phí" và icon nét của bản mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: xem mục cuối phiên.
- Mở trang chủ gói Free trên máy: Lê Lợi 07/10, Nguyễn Trãi 06/10, Thảo Điền 05/10; thẻ Mua hàng chỉ còn "22 phiếu".

## Dở dang, việc tiếp theo

- Không. Cần báo dinhlanphuongipacc: T327 đã đổi thành hộp thoại (T317), và T446 sửa cột cuối tiến độ kiểm kê, cùng file T339 đang làm.

## Bẫy, quyết định mới

- Không.
