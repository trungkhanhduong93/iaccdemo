# Phiếu xuất huỷ gọn như nhập khác (T741)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: thêm cờ `laXh` (màn 5.1.2-3) và `khoGon` (nhập khác hoặc xuất huỷ), dùng `khoGon` thay `laNk` ở các chỗ của T737. Đầu phiếu bỏ Đối tượng, Người giao / nhận, Địa chỉ, Mã số thuế; còn Kho xuất (bắt buộc, gán cho mọi dòng), Nhân viên thực hiện, Ghi chú, Ngày chứng từ. Bảng chi tiết bỏ cột Kho, Thuế suất, Tiền thuế; đáy form chỉ Tổng tiền.
- `src/ui/generic/BangSua.tsx`: thêm prop `giaVon`, cột Đơn giá, Thành tiền đổi tên Giá vốn, Tiền vốn (cả bảng sửa, bảng xem, hộp Tuỳ chỉnh giao diện). Dải Tổng tiền ở đáy form canh theo cột Tiền vốn.
- `src/ui/generic/VoucherScreen.tsx`: cờ `laNk` của danh sách tính cả 5.1.2-3, nên danh sách Xuất huỷ đổi Diễn giải thành Ghi chú, bỏ cột Tiền thuế, có lọc Kho, Hàng hoá, Nhóm hàng hoá. Không đụng thanh công cụ của T496.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở thêm mới và xem phiếu Xuất huỷ gói Plus bằng Playwright: đầu phiếu, cột chi tiết, cột danh sách, mục lọc đúng như trên.

## Dở dang, việc tiếp theo

- Điện thoại chưa đổi theo: form lập phiếu kho `MLapPhieuKho.tsx` đang trong T552 của Trum, hỏi Trum trước.
- Giá vốn trên dòng vẫn nhập tay như đơn giá cũ, chưa tự lấy theo giá vốn tính được.

## Bẫy, quyết định mới

- Không.
