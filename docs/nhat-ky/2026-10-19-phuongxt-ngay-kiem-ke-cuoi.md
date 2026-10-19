# Bỏ % cùng kỳ mua hàng, ngày kiểm kê cuối ở trang chủ Free (T446)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/BaBaiToanFree.tsx`: thẻ Mua hàng & công nợ NCC bỏ chữ "▲ x% so với cùng kỳ" dưới Giá trị mua hàng, chỉ còn số phiếu.
- `home/BaBaiToanFree.tsx`, `home/khoFree.ts`: Tiến độ kiểm kê theo cửa hàng, bỏ cột số mặt hàng đã kiểm (8/12); cột cuối thay "lệch n" bằng ngày kiểm kê cuối trong tháng (dd/mm, chữ xám), tiêu đề cột "Kiểm kê lần cuối" ở hàng trên (PhuongXT yêu cầu, người dùng không hiểu ngày trơn). Rê chuột hiện ngày đủ năm và số mặt hàng lệch. CSS ở mục cuối `app.css` (T446). Cửa hàng chưa kiểm vẫn ghi "chưa kiểm".
- `app.css` (mục T446): vòng tồn quỹ khối Quỹ tiền kéo lên 22px (SVG có khoảng trống phía trên), nhãn trên cùng ngang dòng Doanh thu của Kết quả kinh doanh; SVG giãn tới 480px (thực tế khoảng 430px ở màn 1640) cho đầy khối; biểu đồ 13 tháng hai bên vẫn thẳng hàng, xuống khoảng 5px so với trước.
- Gộp 2 commit chưa push T317, T321 với bản mới trên GitHub. Xung đột ở `KhoaSoFree.tsx` với T327 (dinhlanphuongipacc, khung lý do dưới nút Mở khoá): PhuongXT chọn giữ hộp thoại giữa màn của T317, bỏ khung của T327; giữ chữ "Tháng ghi nhận chi phí" và icon nét của bản mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: xem mục cuối phiên.
- Mở trang chủ gói Free trên máy: tiêu đề Kiểm kê lần cuối, Lê Lợi 07/10, Nguyễn Trãi 06/10, Thảo Điền 05/10 (1440x900); thẻ Mua hàng chỉ còn "22 phiếu".

## Dở dang, việc tiếp theo

- Không. Cần báo dinhlanphuongipacc: T327 đã đổi thành hộp thoại (T317), và T446 sửa cột cuối tiến độ kiểm kê, cùng file T339 đang làm.

## Bẫy, quyết định mới

- Không.
