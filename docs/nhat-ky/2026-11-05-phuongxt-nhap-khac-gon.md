# Phiếu nhập khác gọn đầu phiếu (T737)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: thêm cờ `laNk` (màn 5.1.1), cho vào `gonDau`. Đầu phiếu bỏ Đối tượng, Người giao / nhận, Địa chỉ, Mã số thuế; còn Kho nhập, Nhân viên thực hiện, Ghi chú, Ngày chứng từ.
- Kho nhập bắt buộc khi lưu, gán cho mọi dòng hàng.
- Bảng chi tiết bỏ cột Kho, Thuế suất, Tiền thuế (thêm `ts`, `thue` vào `anDc`). Đáy form chỉ còn Tổng tiền.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở form thêm mới Phiếu nhập khác gói Plus trên máy: đúng như trên.

## Dở dang, việc tiếp theo

- Điện thoại chưa đổi theo: form lập phiếu kho `MLapPhieuKho.tsx` đang trong T552 của Trum, hỏi Trum trước.
- Màn danh sách phiếu nhập khác chưa xem lại.

## Bẫy, quyết định mới

- Không.
