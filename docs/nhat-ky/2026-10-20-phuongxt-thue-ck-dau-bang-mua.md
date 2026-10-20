# Ô Thuế GTGT, Chiết khấu đầu bảng phiếu mua hàng (T492)

- Ngày: 20/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- File mới `src/ui/generic/ApDauBang.tsx`: ô Thuế GTGT và Chiết khấu ở góc phải thanh tab phiếu mua hàng, chỉ hiện khi đang sửa phiếu.
- Thuế GTGT: chọn 0%, 5%, 8%, 10% thì áp cho mọi dòng; dòng thêm sau lấy mặc định mức đã chọn, trên từng dòng vẫn chọn lại được. Các dòng khác mức thì ô hiện "Nhiều mức".
- Chiết khấu: hai nút biểu tượng nét (`percent`, `tiente`, `kieu="net"`) chọn theo % hoặc số tiền. % áp nguyên cho mọi dòng, chỉ cho gõ tối đa 100, có chữ % bên cạnh. Số tiền chia theo thành tiền từng dòng, dòng có tiền cuối cùng nhận phần lẻ cho khớp tổng, có chữ đ bên cạnh. Thêm, xoá dòng hoặc đổi thành tiền thì tự chia lại.
- `ChungTuForm.tsx`: gắn `ApDauBang` vào thanh tab, giữ ô khi sang tab khác (ẩn bằng `hidden`) để nhớ mức đã chọn.
- `src/ui/OSoGo.tsx`: thêm tuỳ chọn `max`, gõ quá số này thì bỏ phím vừa gõ.
- Cuối `app.css`: mục T492, chặn kiểu `.tabs button` đè lên ô chọn và nút trong khối mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/generic/ApDauBang.tsx`: Sạch.
- Thử trên máy gói Plus, Phố Mây Lê Lợi: chọn 8%, 10% đổi mọi dòng; thêm dòng lấy 10%; 10% chiết khấu đúng từng dòng; 100.000 đ chia 63.636 + 18.182 + 18.182, thêm dòng chia lại vẫn tổng 100.000; gõ 150 bị chặn còn 15.

## Dở dang, việc tiếp theo

- Không.
- Chia theo số tiền lưu % CK lẻ (vd 5,68) trên dòng, ô % CK dòng hiện làm tròn. Đổi giữa % và số tiền thì chiết khấu mọi dòng về 0.

## Bẫy, quyết định mới

- Không.
