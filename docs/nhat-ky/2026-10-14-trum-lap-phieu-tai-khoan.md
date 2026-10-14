# Lập phiếu mới có tài khoản hạch toán (T233)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối và kiểm, Antigravity Windows (Anti A) code phần điện thoại, Antigravity WSL (Anti B) code phần máy tính
- Trạng thái cuối phiên: T233 Xong

## Đã làm

Trum báo các màn thêm mới chứng từ không có tài khoản hạch toán. Đo lại: lập phiếu trên điện thoại không có tài khoản ở bước nào. Trên máy tính, dòng thêm bằng nút "Thêm dòng" của phiếu thu, chi để trống TK Nợ, TK Có.

- `src/ui/generic/gen.ts`: thêm `tkTheoLyDo(loai, ly)` trả TK Nợ, Có của dòng thu chi theo loại phiếu và lý do. `dinhKhoanDongTien` gọi lại hàm này.
- `src/ui/generic/BangSua.tsx`: prop tuỳ chọn `tkTheoLy`. Dòng mới và dòng đổi lý do tự điền tài khoản. Nơi không truyền prop giữ hành vi cũ.
- `src/ui/generic/ChungTuForm.tsx`: phiếu tiền truyền `tkTheoLy`; đổi lý do đầu phiếu thì tài khoản mọi dòng đổi theo; nhãn cột tài khoản phiếu tiền là "TK Nợ", "TK Có" thay cho "TK công nợ (131)". Chuyển quỹ không đổi.
- `src/ui/mobile/butToan.ts` (mới): `tinhButToan`, `KhoiHachToan`, tách từ `MXemPhieu.tsx`. Màn xem phiếu gọi lại, kết quả như cũ.
- `src/ui/mobile/MLapPhieu.tsx`: bước 3 mỗi dòng thu chi có hàng "Nợ 152 · Có 1111", bấm mở tấm chọn tài khoản chi tiết trong danh mục. Đổi lý do thì tài khoản đổi theo. Bước 4 Xác nhận có khối Hạch toán. Phiếu lưu giữ `tkNo`, `tkCo`. Hoá đơn bán, phiếu xuất ghi "Kho xuất".
- `tools/kiem_tra.py`: `kiem_tra_t233_may_tinh` (gọi trong `--nhanh`), `kiem_tra_dot_17_a` (gọi trong `--dien-thoai`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (cổng 5181): in `Không có lỗi.` Các hàm `kiem_tra_dot_15_a`, `kiem_tra_dot_16_a`, `kiem_tra_dot_17_a`, `kiem_tra_t233_may_tinh`: không lỗi.
- `--dien-thoai` báo 1 lỗi không thuộc việc này: hai màn mới của T230, T231 chưa có bản điện thoại. Đã ghi thành T234.
- Tự mở bằng script, không dựa vào bước kiểm của anti: phiếu chi mới thêm dòng ra 152 / 1111, phiếu thu mới ra 1111 / 5111; cột ghi TK Nợ, TK Có; hoá đơn bán, phiếu mua giữ nhãn cũ.
- Xem ảnh `tools/shots/m-17-lap-chi-b3.png`, `m-17-lap-hoa-don-b4.png`: hàng "Nợ 6422 · Có 1111" sau khi chọn tài khoản; hạch toán hoá đơn có Nợ 131, Có 5111, Có 33311, Nợ 632, Có 152.

## Dở dang, việc tiếp theo

- Tài khoản theo lý do vẫn nằm trong bảng `TK_LY_DO` của `gen.ts`. Muốn người dùng tự khai thì thêm cột tài khoản vào danh mục Lý do nghiệp vụ, làm thành việc riêng, hỏi PhuongXT trước vì T231 vừa sửa danh mục này.
- Chưa thử trên điện thoại thật.

## Bẫy, quyết định mới

- Anti B đưa `oLy` vào danh sách phụ thuộc của effect trong `ChungTuForm.tsx`. `oLy` là object tìm lại mỗi lần vẽ, effect gọi `setDsDong` sẽ chạy lặp. Đã bỏ khỏi danh sách, ghi chú ngay dòng đó.
