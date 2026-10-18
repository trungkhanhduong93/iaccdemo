# Danh sách tờ khai: bộ lọc như các phân hệ, thêm Trạng thái, Loại tờ khai (T389)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong, chưa push (người dùng dặn chưa push)

## Đã làm

- `modules/thue/ToKhaiHKD.tsx`: bỏ ô tìm và ô năm riêng, dùng thanh lọc chung `BoLoc` (`useLocNhap`, `useCauHinhLoc`) như danh sách chứng từ: các ô Năm, Tìm kiếm, Loại tờ khai, Trạng thái, nút Lọc, Bộ lọc nâng cao; nút Lập tờ khai bên phải.
- Lọc chỉ áp dụng khi bấm Lọc hoặc Enter ở ô tìm, như các phân hệ khác.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Gói Free, Kê khai thuế, Danh sách tờ khai: thanh lọc hiện 4 ô; lọc Trạng thái Đã nộp còn 2 tờ khai năm 2026; console không lỗi.

## Dở dang, việc tiếp theo

- Chưa push: chờ người dùng bảo.

## Bẫy, quyết định mới

- Không.
