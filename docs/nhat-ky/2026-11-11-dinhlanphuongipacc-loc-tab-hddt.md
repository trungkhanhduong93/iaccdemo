# Lọc tab Điều chỉnh thay thế, Thông báo sai sót; TBSS mẫu trỏ đúng hoá đơn (T797)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/hoa-don/HoaDonDienTu.tsx`, `dsTbss`: hai thông báo sai sót mẫu bỏ hoá đơn tháng 9 (số 118, 38) không có ở tab Hoá đơn điện tử. Giờ trỏ chứng từ mẫu qua trường `ctMau`: `tay-9` (hoá đơn gốc số 121) và `tay-10` (hoá đơn bị thay thế số 119). Mẫu số, ký hiệu, số, ngày, loại, người mua, địa chỉ, email lấy theo dòng tab Hoá đơn điện tử (`tbssDu`), nên đổi gói thì mẫu số đổi theo. Cảnh báo "TBSS chưa gửi" ở cột Loại hoá đơn nhận cả TBSS mẫu.
- Tách `dsDongHd` (dòng tab Hoá đơn điện tử) để tab Thông báo sai sót dùng chung.
- Thêm `useLocTab`: thanh lọc Thời gian, Tìm kiếm, một ô chọn, nút Lọc, cùng `BoLoc` như tab Hoá đơn điện tử. Tab Điều chỉnh thay thế lọc theo ngày hoá đơn mới, tìm số hoá đơn, số chứng từ, người mua, ô Loại. Tab Thông báo sai sót lọc theo ngày tạo, tìm số hoá đơn, người mua, nội dung, ô Trạng thái thuế.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py src/modules/hoa-don/HoaDonDienTu.tsx`: 0 ĐỎ.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Trình duyệt gói Plus: tab Thông báo sai sót hiện 2 TBSS trỏ số 121, 119. Tab Điều chỉnh thay thế tìm "HDTT" còn 2 cặp thay thế.

## Dở dang, việc tiếp theo

- Chưa push: máy có 2 commit T796 của phiên khác chưa push (người dùng dặn phiên đó chỉ push khi được bảo). Push T797 sẽ đẩy luôn T796, nên chờ người dùng bảo.

## Bẫy, quyết định mới

- Không.
