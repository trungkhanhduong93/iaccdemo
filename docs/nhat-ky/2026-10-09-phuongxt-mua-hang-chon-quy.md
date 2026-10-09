# Form Mua hàng: Ghi chú kéo dài, chọn quỹ khi trả tiền ngay (T78)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: Mua hàng có Ghi chú kéo dài qua hai cột trái (`keoGc`); cột phải (ngày, số, hoá đơn) chiếm hai hàng (`gridRow: 'span 2'`) để Ghi chú không bị đẩy xuống dưới.
- Hàng Thanh toán của mua, bán: Tiền mặt ngay hiện ô Quỹ tiền mặt (quỹ của chi nhánh lập phiếu), Chuyển khoản ngay hiện ô Quỹ ngân hàng. Dùng chung `dsQuy`, `quy` với phiếu thu chi, lưu ở `_quy`. Đổi hình thức thì quỹ tự về quỹ đầu danh sách.
- Bỏ `tknhChi` (ô Tài khoản ngân hàng cũ khi chuyển khoản), thay bằng ô quỹ ngân hàng ở trên.
- Báo có, uỷ nhiệm chi: nhãn ô quỹ đổi từ Quỹ tiền thành Quỹ ngân hàng.
- Bổ sung QD33.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` các file đã sửa: sạch.
- Trên trình duyệt: Mua hàng và Bán hàng (3.1.2, 3.1.4) đổi Chưa thanh toán, Tiền mặt ngay, Chuyển khoản ngay thì ô quỹ hiện, ẩn đúng; Ghi chú Mua hàng kéo dài, nằm ngay dưới hai cột trái khi tích Nhận kèm hoá đơn. Báo có, uỷ nhiệm chi ghi Quỹ ngân hàng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD33 bổ sung ý T78.
