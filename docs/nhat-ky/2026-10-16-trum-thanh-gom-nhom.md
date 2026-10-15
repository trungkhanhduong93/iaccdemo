# Thanh gom nhóm ở danh sách chứng từ (T278)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`, khối `ds-groupzone`: ô Thêm cột gom bỏ thẻ `select` gốc, dùng `Dropdown` và `MenuItem` như mọi menu khác. Mỗi cột đang gom là một thẻ có số cấp 1, 2, 3, giữa các cấp có mũi tên. Đã gom ít nhất một cột thì nút đổi thành Thêm cấp. Nút xoá trên thẻ dùng icon `x`.
- `src/styles/app.css`: thêm mục T278 cuối file. Nhãn Gom nhóm có icon `layers` và vạch ngăn. Câu gợi ý chữ nghiêng nhạt. Thẻ nền trắng, viền xanh nhạt. Nút Thêm cột gom viền đứt. Nút Xoá gom nhóm nằm sát phải.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` với vite cổng 5181: in `Không có lỗi.`
- Chụp danh sách Mua hàng ở 3 trạng thái: chưa gom, đang mở menu, gom 2 cấp. Bảng vẫn gom nhóm và tính tổng đúng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
