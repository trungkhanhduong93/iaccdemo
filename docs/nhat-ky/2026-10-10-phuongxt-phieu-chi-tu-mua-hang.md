# Sinh phiếu thu, chi từ phiếu mua, bán trả tiền ngay, tuỳ chỉnh từng cột (T85, T86)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T85 `ChungTuForm.tsx`: phiếu mua chọn Tiền mặt ngay hoặc Chuyển khoản ngay, bấm Lưu thì `dongBoCtTt` sinh phiếu Chi tiền mặt (PC) hoặc Chi ngân hàng (UNC) ở `tien/2-1-1`. Phiếu chi lấy ngày, nhà cung cấp, quỹ, tổng tiền của phiếu mua. Lý do là Trả tiền nhà cung cấp, ghi chú "Chi tiền mua hàng theo <số phiếu mua>". Phiếu mua lưu tham chiếu ở `_ctTt` (id, số, loại).
- T85 mở rộng cho phiếu bán: bán sinh Thu tiền mặt (PT) hoặc Thu ngân hàng (BC), lý do Thu tiền bán hàng. Phiếu trả lại đi ngược chiều: trả lại hàng mua sinh phiếu thu (lý do Thu khác), trả lại hàng bán sinh phiếu chi (lý do Chi phí khác).
- T85 chặn xoá: `ctTtCon` trong `daXoa.ts` cho biết phiếu thu, chi tham chiếu còn hay đã xoá. Còn thì form báo xoá phiếu thu, chi trước; thao tác hàng loạt (`LocNangCao.tsx`) bỏ phiếu đó khỏi danh sách xoá, hiện mục khoá. Phiếu thu, chi đã xoá thì lưu lại phiếu gốc sinh chứng từ mới.
- Hàng Thanh toán: ô chọn quỹ chữ 13px, cao 30px; bỏ dòng mô tả trước khi lưu.
- T85: sửa phiếu mua rồi lưu thì phiếu chi cập nhật theo. Đổi hình thức thanh toán thì xoá chứng từ cũ, sinh chứng từ mới; về Chưa thanh toán thì xoá. Hàng Thanh toán hiện "Lưu phiếu sẽ sinh phiếu ..." trước khi lưu, sau khi lưu hiện mã phiếu chi, bấm mở phiếu chi.
- T86 `BangSua.tsx`: mỗi cột bảng chi tiết có cờ riêng (`maCot`, `slCot`, `ptCkCot`...), `cotTuyChon` liệt kê mọi cột theo thứ tự trên bảng, chỉ Tên hàng hoặc Diễn giải luôn hiện. Dòng tổng tính lại số ô đầu theo cột đang hiện.
- T86: phiếu mua, Tổng tiền thành cột cuối (sau Giá trị nhập kho) cho thẳng với Tổng tiền dưới bảng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Free, phiếu mua mới chọn Tiền mặt ngay, lưu: sinh PC2610-0261, đúng quỹ tiền mặt Nguyễn Trãi, nhà cung cấp, 1.120.000. Bấm mã mở được phiếu chi. Sửa sang Chuyển khoản ngay, lưu: PC2610-0261 biến khỏi danh sách Thu chi, có UNC2610-0261.
- Phiếu mua tiền mặt đã lưu: xoá trong form báo "có phiếu PC2610-0261 tham chiếu, xoá PC2610-0261 trước"; danh sách hiện "Không xoá: còn phiếu thu, chi tham chiếu". Xoá PC2610-0261 bên Thu chi xong thì danh sách Mua hàng cho xoá.
- Gói Plus: hoá đơn bán hàng tiền mặt sinh PT2610-0261, 1.020.600, lý do Thu tiền bán hàng. Trả lại hàng bán chuyển khoản sinh UNC2610-0261.
- Tuỳ chỉnh giao diện phiếu mua: panel có 12 cột. Tắt Số lượng, Tiền CK, Thuế suất: tiêu đề, dòng, dòng tổng cùng 11 ô, thẳng cột.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
