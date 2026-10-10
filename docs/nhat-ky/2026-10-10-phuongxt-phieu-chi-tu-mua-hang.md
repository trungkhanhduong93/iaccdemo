# Sinh phiếu chi từ phiếu mua trả tiền ngay, tuỳ chỉnh từng cột (T85, T86)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T85 `ChungTuForm.tsx`: phiếu mua chọn Tiền mặt ngay hoặc Chuyển khoản ngay, bấm Lưu thì `dongBoCtTt` sinh phiếu Chi tiền mặt (PC) hoặc Chi ngân hàng (UNC) ở `tien/2-1-1`. Phiếu chi lấy ngày, nhà cung cấp, quỹ, tổng tiền của phiếu mua. Lý do là Trả tiền nhà cung cấp, ghi chú "Chi tiền mua hàng theo <số phiếu mua>". Phiếu mua lưu tham chiếu ở `_ctTt` (id, số, loại).
- T85: sửa phiếu mua rồi lưu thì phiếu chi cập nhật theo. Đổi hình thức thanh toán thì xoá chứng từ cũ, sinh chứng từ mới; về Chưa thanh toán thì xoá. Hàng Thanh toán hiện "Lưu phiếu sẽ sinh phiếu ..." trước khi lưu, sau khi lưu hiện mã phiếu chi, bấm mở phiếu chi.
- T86 `BangSua.tsx`: mỗi cột bảng chi tiết có cờ riêng (`maCot`, `slCot`, `ptCkCot`...), `cotTuyChon` liệt kê mọi cột theo thứ tự trên bảng, chỉ Tên hàng hoặc Diễn giải luôn hiện. Dòng tổng tính lại số ô đầu theo cột đang hiện.
- T86: phiếu mua, Tổng tiền thành cột cuối (sau Giá trị nhập kho) cho thẳng với Tổng tiền dưới bảng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Free, phiếu mua mới chọn Tiền mặt ngay, lưu: sinh PC2610-0261, đúng quỹ tiền mặt Nguyễn Trãi, nhà cung cấp, 1.120.000. Bấm mã mở được phiếu chi. Sửa sang Chuyển khoản ngay, lưu: PC2610-0261 biến khỏi danh sách Thu chi, có UNC2610-0261.
- Tuỳ chỉnh giao diện phiếu mua: panel có 12 cột. Tắt Số lượng, Tiền CK, Thuế suất: tiêu đề, dòng, dòng tổng cùng 11 ô, thẳng cột.

## Dở dang, việc tiếp theo

- Xoá phiếu mua chưa xoá phiếu chi đã sinh. Phiếu bán trả tiền ngay chưa sinh phiếu thu, chờ PhuongXT chốt.

## Bẫy, quyết định mới

- Không.
