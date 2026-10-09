# Bỏ Diễn giải đầu mọi phiếu, chọn quỹ khi trả tiền ngay (T78)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: lúc đầu cho Ghi chú Mua hàng kéo dài qua hai cột; sau khi bỏ Diễn giải thì cạnh Địa chỉ bị trống nên đưa Ghi chú về cột giữa, cùng hàng Địa chỉ. `keoGc` (Ghi chú kéo dài, Địa chỉ ở cột giữa) chỉ còn ở phân hệ Thu chi trừ chuyển quỹ, gồm cả biên bản đối chiếu công nợ 2.1.2. Khi kéo dài, cột phải chiếm hai hàng (`gridRow: 'span 2'`).
- Hàng Thanh toán của mua, bán: Tiền mặt ngay hiện ô Quỹ tiền mặt (quỹ của chi nhánh lập phiếu), Chuyển khoản ngay hiện ô Quỹ ngân hàng. Dùng chung `dsQuy`, `quy` với phiếu thu chi, lưu ở `_quy`. Đổi hình thức thì quỹ tự về quỹ đầu danh sách.
- Đầu mọi phiếu dùng form chung bỏ ô Diễn giải (bỏ cờ `boDg`). Ghi chú phiếu không có ô Lý do mặc định là diễn giải; gõ Ghi chú thì diễn giải chép theo ở mọi phiếu.
- Bỏ `tknhChi` (ô Tài khoản ngân hàng cũ khi chuyển khoản), thay bằng ô quỹ ngân hàng ở trên.
- Báo có, uỷ nhiệm chi: nhãn ô quỹ đổi từ Quỹ tiền thành Quỹ ngân hàng.
- Bổ sung QD33.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` các file đã sửa: sạch.
- Trên trình duyệt: Mua hàng và Bán hàng (3.1.2, 3.1.4) đổi Chưa thanh toán, Tiền mặt ngay, Chuyển khoản ngay thì ô quỹ hiện, ẩn đúng; Ghi chú Mua hàng nằm cùng hàng Địa chỉ. Báo có, uỷ nhiệm chi ghi Quỹ ngân hàng.
- Mở form thêm mới của mọi phân hệ (bán hàng, mua hàng, kho, TSCĐ, CCDC, thuế, tổng hợp, thu chi) ở gói Pro: không còn ô Diễn giải ở đầu phiếu, Ghi chú có sẵn diễn giải cũ. Sửa Ghi chú phiếu mua rồi lưu: cột Diễn giải trong danh sách hiện nội dung mới.
- Đếm số ô từng cột đầu phiếu ở mọi form thêm mới, gói Pro và Free: hai cột trái luôn bằng nhau. Phiếu thường 3/3, thu chi 3/3 kèm hàng Ghi chú, chuyển quỹ 2/2, đối chiếu công nợ 2/2 kèm hàng Ghi chú.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD33 bổ sung ý T78.
