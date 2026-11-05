# Phiếu xuất khác gọn như xuất huỷ (T745)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: cờ `laXh` tính cả màn 5.1.2-4, nên phiếu xuất khác dùng chung mọi thay đổi của T741: đầu phiếu bỏ Người nhận, Địa chỉ, Mã số thuế, có Kho xuất bắt buộc; chi tiết bỏ Kho, Thuế suất, Tiền thuế, cột Giá vốn, Tiền vốn; đáy form chỉ Tổng tiền.
- `src/ui/generic/VoucherScreen.tsx`: cờ `laNk` của danh sách tính cả 5.1.2-4 (Ghi chú, bỏ Tiền thuế, lọc Kho, Hàng hoá, Nhóm hàng hoá). Cột đối tượng của danh sách ẩn khi `laNk`, nên Xuất khác bỏ cột Người nhận.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở thêm mới và danh sách Xuất khác gói Plus: đầu phiếu Kho xuất, Nhân viên thực hiện, Ghi chú, Ngày chứng từ; cột chi tiết Mã hàng, Tên, ĐVT, Số lượng, Giá vốn, Tiền vốn; danh sách không còn Người nhận, Tiền thuế.

## Dở dang, việc tiếp theo

- Điện thoại chưa đổi theo, như T741: `MLapPhieuKho.tsx` đang trong T552 của Trum.
- Dữ liệu mẫu phiếu xuất khác vẫn có trường người nhận, chỉ không hiện.

## Bẫy, quyết định mới

- Không.
