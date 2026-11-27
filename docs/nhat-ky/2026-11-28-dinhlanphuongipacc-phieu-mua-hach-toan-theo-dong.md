# Phiếu mua hàng hạch toán theo dòng, Tk thanh toán, Tk kho, Tk thuế (T961)

- Ngày: 28/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/tk-mua.ts` (mới): Tk thanh toán (quỹ tiền hoặc công nợ), Tk kho theo hàng, Tk thuế, bút toán theo dòng và số chứng từ. Giá trị mặc định chứng từ nhập mua tạm cố định (TK công nợ trống, TK thuế 1331), chưa nối vào khai báo T955 của Trum.
- `BangSua.tsx`: 3 cột Tk thanh toán, Tk kho, Tk thuế cuối bảng phiếu mua 4.1.1, hoá đơn mua 4.1.2 (chỉ gói Pro); thuế suất mặc định theo danh mục hàng, hàng chưa khai thì để trống (ltn rỗng).
- `ChungTuForm.tsx`: công tắc Ẩn cột tài khoản đặt cạnh nút Huỷ, mặc định tắt (cột hiện); tab Hạch toán theo dòng; ô Đối tượng LQ của Chi phí mua hàng (trống là NCC tự vận chuyển, chọn đối tượng thì Có 331 cho đối tượng đó); bỏ cột Số lô, Hạn dùng.
- `DanhSachButToan.tsx` (10.1.1): phiếu mua trả ngay ghi một lần, dòng Tk kho lấy số phiếu mua, dòng còn lại lấy thông tin phiếu chi; phiếu chi tự sinh không ghi thêm; xếp ngày mới nhất lên đầu.
- Nối bản điện thoại (`butToan.ts`) và mẫu in Phiếu nhập kho (`duLieuIn.ts`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_van.py` các file đã sửa: 0 ĐỎ.
- Xem trên giao diện (gói Pro, TT133): cột Tk, tab Hạch toán, công tắc, ô Đối tượng LQ và nút ×; 10.1.1 gọi hàm gom bút toán với MH2610-0014 và PC2610-0009.
- `kiem_tra.py --nhanh` không chạy hết: dừng ở mục T870 Thẻ kho, đã đỏ sẵn trên main (T957). Chưa kiểm hết các mục sau T870.
- Chưa kiểm trên điện thoại thật và bản in; chưa lập phiếu mới trả ngay rồi mở lại 10.1.1.

## Dở dang, việc tiếp theo

- Nối TK công nợ, TK thuế mặc định theo cửa hàng vào hộp Giá trị mặc định (T955) thay giá trị cố định trong `tk-mua.ts` (Trum đang làm phần khai báo).
- Sổ cái, KQKD, bảng cân đối vẫn tính từ số liệu tổng hợp giả `so-cai.ts`, chưa đọc từng chứng từ.
- Bản điện thoại chưa có ô chi phí vận chuyển nên chưa sinh bút toán vận chuyển.

## Bẫy, quyết định mới

- Không ghi thêm vào `docs/BAY.md`, `docs/QUYET-DINH.md`. Gói Plus, Standard không có tab Hạch toán và không hiện cột tài khoản theo QD81.
