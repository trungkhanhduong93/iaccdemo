# Điện thoại, Chi phí hoạt động: màn chi tiết lý do chi (T954)

- Ngày: 27/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MChiPhiThang.tsx`: bấm lý do chi đặt `?ly=<lý do>` vào địa chỉ, màn đổi sang chi tiết lý do. Bỏ kiểu thả phiếu dưới dòng.
- Màn chi tiết có dòng phụ (tháng, cửa hàng), thẻ tổng (tiền, số phiếu, % tổng chi phí, tách tiền mặt, ngân hàng, hoá đơn mua khi có), chip lọc, danh sách phiếu bấm mở phiếu, nút Lập phiếu chi.
- `src/ui/mobile/MobileShell.tsx`: thanh trên lấy tên lý do làm tiêu đề khi có `?ly=`. Nút về dùng lịch sử nên quay lại danh sách lý do.
- `src/styles/app.css`: mục T954 cuối file. Bỏ các lớp `.m-standard-cpt-nhom`, `.m-standard-cpt-phieu`, `.m-standard-cpt-phieu-dong` của kiểu thả cũ.
- `tools/kiem_tra.py` đợt 19B: ca T954 bấm lý do, so tiêu đề, bấm chip Tiền mặt so số phiếu, bấm nút về.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: dừng ở lỗi cũ T933 (`.bc-ban-du-lieu table.tbl` ở Thẻ kho), chưa in được dòng `Không có lỗi.`
- Chạy riêng `kiem_tra_dot_19_b()`: ca T954 không lỗi. Trên code cũ (stash `src`) ca T954 báo lỗi, nên ca kiểm bắt được kiểu thả cũ.
- 19B còn 8 lỗi cũ ở trang chủ Standard (thẻ quỹ, tiêu đề bài toán, Thác nước gói PR). Trước và sau khi sửa đều đúng 8 lỗi đó.
- `python tools/kiem_van.py`: `MChiPhiThang.tsx` sạch, `CHANGELOG.md` 0 ĐỎ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
