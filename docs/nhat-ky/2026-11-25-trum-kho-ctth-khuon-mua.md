# Phiếu kho, chứng từ tổng hợp điện thoại theo khuôn Nhập mua (T929, T930, T931)

- Ngày: 25/11/2026
- Người: Trum, agent: Claude Code điều phối, 3 Antigravity (gemini-3.8-flash-high) code
- Trạng thái cuối phiên: Xong

## Đã làm

- T929, `src/ui/mobile/MChungTu.tsx`: danh sách phiếu kho hiện tiền, chỉ Kiểm kê ẩn tiền; Chứng từ tổng hợp vào `dungKhungChuan`, dòng phụ là diễn giải.
- T929, `src/ui/mobile/MLapPhieuKho.tsx`: form Điều chuyển có thẻ `m-t655-the` (Ngày, Số phiếu, Từ kho, Đến kho, Diễn giải), chân `m-t600-chan-day m-t656-chan`. Chọn Đến kho của Xuất điều chuyển tự đặt cửa hàng nhận. Kiểm kê giữ vỏ cũ.
- T930, `src/ui/mobile/MXemPhieu.tsx`: cờ `khoChuanXem` (mọi phiếu kho trừ Kiểm kê) và `laCtth`; thẻ đầu Tổng giá trị, Thông tin chung `m-t655-gon`, CTTH mỗi bút toán một thẻ, chân Xoá + Sửa phiếu. Điều chỉnh vẫn không chân.
- T930: anti bỏ mất dòng Người thực hiện của Nhập kho, Xuất huỷ (T824, T927). Claude trả lại khi gộp.
- T931, `src/ui/mobile/MLapPhieu.tsx`: `khuonMuaGon` gồm thêm Nhập kho, Xuất khác (`laXk`); thẻ đầu `m-t655-the` cho Nhập kho, Xuất khác, Xuất huỷ (thêm Ngày, Số phiếu), CTTH (`khuonTh`). CTTH: thẻ từng bút toán, nút Thêm bút toán, không bắt chọn quỹ, không bắt diễn giải chung, ẩn khối hạch toán cũ.
- CSS: mục T930, T931 cuối `src/styles/app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: dừng ở mục T870/T871 (Thẻ kho máy tính, chờ `.bc-ban-du-lieu table.tbl` quá 8 giây). Lỗi này có cả trên `main` sạch trước khi gộp, không do 3 việc này. Ghi thành việc mới.
- Chạy lại kiem_tra bỏ riêng mục T870: xem kết quả ở commit message.

## Dở dang, việc tiếp theo

- Không với T929–T931.
- Mục kiểm T870/T871 trong `tools/kiem_tra.py:5557` hỏng trên `main`: cần người xem màn Thẻ kho máy tính còn ra bảng `.bc-ban-du-lieu table.tbl` không.

## Bẫy, quyết định mới

- Không ghi BAY.md. Bài học điều phối: anti tự kill vite của thư mục chính để lấy cổng 5180; `do_anti.py kiem` đo sai khi worker chạy worktree riêng.
