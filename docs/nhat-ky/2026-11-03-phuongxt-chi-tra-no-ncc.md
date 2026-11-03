# Phiếu chi chọn phiếu mua trả công nợ nhà cung cấp (T718)

- Ngày: 03/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Web, gói Standard, phiếu chi và UNC lý do Thanh toán công nợ nhà cung cấp: tab Chi tiết thành bảng phiếu mua còn nợ của nhà cung cấp ở cửa hàng lập phiếu (`src/ui/generic/BangTraNoNcc.tsx`, nối ở `src/ui/generic/ChungTuForm.tsx`). Cột ô tích, Mã chứng từ, Ngày chứng từ, Giá trị đơn, Đã thanh toán, Công nợ, Thanh toán; dòng Tổng ghim đáy, chữ to, đậm.
- Tích phiếu thì Thanh toán mặc định bằng công nợ, sửa được, không vượt công nợ. Mỗi phiếu chọn thành một dòng chi tiết `Thanh toán <số phiếu mua>`, phiếu chi lưu danh sách chọn ở `_traNo`.
- Lưu phiếu chi thì `ghiTraNo` ghi phiếu chi vào `_dsTt` của từng phiếu mua (màn `mua-hang/4-1-1`), sửa hoặc bỏ chọn thì thay hoặc gỡ phần của chính phiếu chi. Xoá phiếu chi thì `dsTtCon` tự bỏ qua như cũ.
- Phiếu chi mẫu lý do này chưa có `_traNo` thì khi xem vẫn hiện bảng dòng cũ; bấm Sửa thì chuyển sang bảng chọn phiếu mua.
- Điện thoại: `src/ui/mobile/MTraNoNcc.tsx`, nối ở `src/ui/mobile/MDtThuChiLap.tsx`. Mục Chi tiết là các thẻ phiếu mua, có Chọn tất cả; Tổng cộng ghim trên nút Lưu cả khi sửa, chữ to. Thanh toán ngay từ một phiếu mua (`dienSan.idMua`) giữ cách cũ.
- Điện thoại: form thu chi đọc `?ly=<mã lý do>` trên đường dẫn khi lập mới, như web.
- CSS mục T718 cuối `src/styles/app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `BangTraNoNcc.tsx`, `MTraNoNcc.tsx`: Sạch.
- Thử tay gói Standard trên web (1400x850) và điện thoại (375x812): chọn, trả một phần, lưu, xem, sửa, lập phiếu mới thấy công nợ phiếu mua giảm đúng.

## Dở dang, việc tiếp theo

- Không. Màn xem phiếu chi trên điện thoại vẫn hiện dạng dòng "Thanh toán MH…", chưa có bảng phiếu mua (file xem phiếu đang thuộc việc khác).
- `MDtThuChiLap.tsx` đang ghi trong T552 của Trum: T718 chỉ thêm khối riêng (state `traNo`, thẻ Chi tiết khi `traNoMode`), Trum làm tiếp T552 lưu ý chỗ này.

## Bẫy, quyết định mới

- Không.
