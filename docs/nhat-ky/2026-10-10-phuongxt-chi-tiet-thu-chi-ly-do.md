# Khung chi tiết danh sách thu chi khớp form, thêm cột Lý do (T27, T82, T83)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `VoucherScreen.tsx`: khung chi tiết dưới danh sách lấy dòng phiếu giống form. Nguyên nhân lệch là khung dùng cấu hình chung của màn, còn form dùng cấu hình theo loại phiếu (`theoLoai`), nên cùng hạt giống mà sinh ra diễn giải, số tiền khác. Phiếu đã lưu trong phiên thì dùng dòng đã lưu (`_dong`).
- Phiếu thu, chi, báo có, uỷ nhiệm chi: khung chi tiết có cột Lý do thu / Lý do chi và cột Đối tượng theo đầu phiếu. Lý do lấy từ `_lyDo`, chưa có thì đoán theo diễn giải như form. Chuyển quỹ không có cột Lý do, giống form.
- T82 `VoucherScreen.tsx`, `ChungTuBanHang.tsx`: chế độ không ghi sổ (gói Free) thì khung chi tiết dưới danh sách bỏ tab Ghi sổ, giống form (T62). Form Bán hàng POS cũng bỏ tab này. Đang ở tab Ghi sổ mà đổi sang gói Free thì về tab đầu.
- T83 `ChungTuForm.tsx`: phiếu mua, bán có kho trên dòng (`bo.kho === 'dong'`), gói dưới Pro có ô Kho nhập / Kho xuất ở cột phải dưới số phiếu, chọn trong kho của chi nhánh lập phiếu, lưu ở `_kho`, chép vào mọi dòng; cột Kho trên dòng ẩn. Gói Pro giữ cột Kho trên dòng. Chi nhánh chỉ một kho thì phiếu mới điền sẵn (cả ô đầu phiếu và dòng gói Pro). Khung chi tiết danh sách gói dưới Pro cũng ẩn cột Kho.
- T83: thông tin hoá đơn mua (tích Nhận kèm hoá đơn) chuyển từ cột phải thành một cột riêng trước cột ngày, số phiếu (lưới 4 cột khi tích, `coHdDau`). Cột có ba hàng đều với hai cột trái, kẻ mảnh hai bên (`.ct-hd-dau` trong `app.css`). Đã thử hàng riêng dưới đầu phiếu trước, PhuongXT chọn cột riêng vì đầu phiếu không cao thêm. Bốn ô hoá đơn có dấu * bắt buộc. Phiếu bán (tích Lập kèm hoá đơn) xếp giống hệt, bỏ tab Hoá đơn. Cập nhật QD33.
- T83 `nhom.ts`: hoá đơn bán hàng 3.1.2, trả lại hàng bán 3.1.4 có kho (trước chỉ phiếu bán nguyên vật liệu); lập hoá đơn 3.1.5, điều chỉnh 3.1.6 không có kho. Nhãn: trả lại hàng bán ghi Kho nhập, trả lại hàng mua ghi Kho xuất.
- `ChungTuForm.tsx`: xuất hàm `lyMacDinh` để khung chi tiết dùng chung.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (máy Windows cần đặt `PYTHONIOENCODING=utf-8`, nếu không script báo lỗi in chữ tiếng Việt).
- Trên trình duyệt, gói Pro, màn 2.1.1: UNC2610-0259 khung chi tiết và form cùng 2 dòng "Trả tiền nhà cung cấp thịt bò", cùng số tiền, cùng lý do. Phiếu thu, chi, báo có có cột Lý do; chuyển quỹ không có.
- T82: gói Free, khung chi tiết Thu chi, Mua hàng, Bán hàng POS không còn tab Ghi sổ; gói Pro vẫn có tab Hạch toán.
- T83: gói Free, chi nhánh Nguyễn Trãi (1 kho) phiếu mua mới điền sẵn Kho bếp Nguyễn Trãi; chi nhánh Lê Lợi (2 kho) để trống, chỉ liệt kê 2 kho Lê Lợi. Gói Pro vẫn có cột Kho trên dòng, dòng mới điền sẵn kho khi chi nhánh một kho. Gói Plus mở phiếu mua đã có: ô Kho nhập có giá trị, khung chi tiết danh sách không có cột Kho. Tích Nhận kèm hoá đơn: cột hoá đơn ba hàng đều với hai cột trái, không còn mảng trống; khung 800px vẫn đủ chỗ.
- T83 bán hàng: gói Plus 3.1.2 có Kho xuất, 3.1.4 Kho nhập, 3.1.5 không có kho; gói Pro 3.1.2 có cột Kho trên dòng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD33 bổ sung ý T83. Máy Windows chạy `tools/kiem_tra.py`, `tools/kiem_van.py` cần `PYTHONIOENCODING=utf-8`.
