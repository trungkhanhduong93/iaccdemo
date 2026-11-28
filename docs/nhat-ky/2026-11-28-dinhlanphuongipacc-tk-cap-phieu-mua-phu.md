# TK công nợ, TK thuế lên đầu phiếu Mua qua sơ chế, Trả lại, Chi phí mua hàng, Bổ sung hoá đơn (T965)

- Ngày: 28/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong (web), chưa push

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: biến `muaPhuTk` (MSC, TLN, CPM, BSHD của phân hệ Mua hàng) vào `coTkPhieu`, nên gói Pro hiện ô `TK công nợ` (hoặc `TK thanh toán`) và `TK thuế GTGT` ở cột phải dưới Ngày chứng từ, lưu `_tkTt`, `_tkThue`. Bảng dòng bỏ cặp cột TK Nợ, TK Có (các phiếu này dòng không có tài khoản riêng). Tab Hạch toán: `HachToan` luôn truyền TK thanh toán mặc định (theo hình thức thanh toán, quỹ tiền) nên cả TLN (Nợ 331) đổi theo; `layButToan` thay thêm 1331 bằng TK thuế đã sửa.
- `src/ui/generic/DanhSachButToan.tsx`: danh sách bút toán của 4 chứng từ này lấy `tkPhieuMua` (hình thức thanh toán, quỹ, `_tkTt`, `_tkThue`).
- Mặc định (người dùng xác nhận): MSC Nợ 152 Có 331, thuế Nợ 1331 Có 331. TLN Nợ 331 Có 152, thuế Nợ 331 Có 1331; hoàn tiền ngay thì 331 thành 111x, 112x theo quỹ. CPM Nợ 152 Có 331, thuế 1331. BSHD Nợ 1331 Có 331.
- `BangSua.tsx`: cột Nhóm HHDV mua vào hiện Mã 1 đến 5 (chọn bằng `ChonDanhMuc` chiMa), mặc định nhóm 1, chọn lại được; phiếu cũ lưu tên đầy đủ đọc ra mã theo `maNhomHhdv`.
- `ChungTuForm.tsx`: `coHanTt = false`, gói Pro bỏ ô Hạn thanh toán (Standard, Plus đã ẩn từ T180); `_hanTt` vẫn lưu.
- TLN không có chi phí mua hàng, không áp logic chi phí (người dùng dặn): `coCpMua` vốn đã loại TLN.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`: Không có lỗi. `kiem_van.py` hai file: 0 ĐỎ.
- Xem trên preview gói Pro: 4.1.3, 4.1.4, 4.1.5, 4.1.6 hiện đủ hai ô, Hạch toán đúng mặc định. 4.1.4 chọn Tiền mặt ngay thì TK thanh toán 1111, bút toán đổi theo.
- Chưa kiểm: gõ tay đổi TK rồi lưu, mở lại; danh sách bút toán tổng của 4 chứng từ; chọn lại đúng mặc định thì về theo mặc định (dùng chung code T964, chưa thử riêng).

## Dở dang

- CPM trả tiền ngay: TK thanh toán đổi theo hình thức thanh toán (111x, 112x) như phiếu khác. Người dùng đã xác nhận, không cần sửa.
- Điện thoại chưa có ô sửa; mặc định chưa nối Giá trị mặc định (T962, Trum).
- Bẫy: `ChungTuForm.tsx`, `DanhSachButToan.tsx` có sửa dở T969 của phiên khác, chỉ stage hunk của mình (`git apply --cached --unidiff-zero`). Preview: dùng cấu hình `iacc-demo-dir` ở thư mục cha.
