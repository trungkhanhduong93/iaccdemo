# Cột Ghi chú, Diễn giải tên hàng ở danh sách mua, bán (T286)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/gen.ts`: hàm `tomTatTenHang` gộp tên hàng của phiếu, bỏ trùng, quá 3 tên thì lấy 3 tên đầu rồi thêm "...".
- `src/ui/generic/VoucherScreen.tsx`: danh sách nhóm mua, bán (mọi màn phân hệ Mua hàng, Bán hàng dùng màn chung) có cột Diễn giải mới (`tenHang`) liệt kê tên hàng trong phiếu, rê chuột thấy đủ tên. Cột diễn giải cũ đổi tên Ghi chú. Ô Tìm kiếm tìm được theo tên hàng. Cột mới không nằm trong danh sách cột gom nhóm.
- `src/modules/ban-hang/ChungTuBanHang.tsx` (Xuất bán POS): làm tương tự, tên món lấy từ `monCua` (thêm trường `ten`).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` 3 file đã sửa: sạch.
- Mở trên máy, gói Plus, rộng 1500px: Mua hàng 4.1.1 cột Diễn giải hiện vd "Thịt bò thăn, Bánh phở tươi, Sườn heo..."; Xuất bán POS hiện tên món, cột Ghi chú giữ "Hoá đơn FABi ...".
- Chưa sửa bản điện thoại (T281 của Trum đang sửa `src/ui/mobile/*`). Máy đã lưu tuỳ chỉnh cột của màn thì cột mới được nối cuối bảng theo `useCotDs`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
