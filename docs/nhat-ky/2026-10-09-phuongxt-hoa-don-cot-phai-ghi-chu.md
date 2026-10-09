# Hoá đơn ở cột phải form Mua hàng, ô Ghi chú mọi phiếu (T68, T69)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T68: `ChungTuForm.tsx` chuyển khối hoá đơn (Mẫu số, Ký hiệu, Số, Ngày hoá đơn) của Mua hàng từ dải dưới đầu phiếu lên cột phải, dưới Số phiếu, xếp 2 cột (`.ct-hd-dau` trong `app.css`). Cột Số lô, Hạn dùng ở bảng chi tiết và hộp Tuỳ chỉnh giao diện phiếu chỉ có ở gói Pro.
- T69: ô Ghi chú ở mọi phiếu. Phiếu thu chi giữ cách cũ (theo lý do, chép sang diễn giải); phiếu khác để trống, độc lập với diễn giải. Lưu phiếu giữ người giao, nhân viên, địa chỉ, MST, hạn thanh toán, tài khoản ngân hàng, hình thức thanh toán, Nhận kèm hoá đơn và các ô hoá đơn ở `row._xxx`; mở lại phiếu đọc từ đó, không lấy lại dữ liệu mẫu.
- Ghi bổ sung QD33 trong `docs/QUYET-DINH.md`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho `QUYET-DINH.md`, `TIEN-DO.md`, `ChungTuForm.tsx`: sạch.
- Trên trình duyệt: gói Pro có Số lô, Hạn dùng; gói Plus không có. Tích Nhận kèm hoá đơn thì 4 ô hoá đơn hiện ở cột phải 2 cột. Thêm phiếu mua, sửa Ghi chú, Người giao, MST, Số hoá đơn, lưu, đóng, mở lại từ danh sách: còn đủ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD33 bổ sung ý T68, T69.
- Phiên chiều đặt mã T66, T67 trên máy chưa push, Trum lấy trước hai mã này. Phiên này đổi thành T68, T69. Commit nhận việc nên push ngay sau khi đặt mã.
