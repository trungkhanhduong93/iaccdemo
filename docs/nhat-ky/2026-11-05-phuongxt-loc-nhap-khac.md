# Lọc kho, hàng hoá, nhóm hàng hoá ở Nhập khác (T738)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`: thêm cờ `laNk` (màn 5.1.1) và `locKhoHang`. Danh sách Nhập khác tính kho, mã hàng của phiếu như kiểm kê.
- Kho của phiếu lấy `_kho` (form lưu từ T737). Phiếu mẫu chưa có thì lấy kho trên dòng, không có thì kho đầu tiên của cửa hàng, khớp form.
- Bộ lọc nâng cao có thêm Kho, Hàng hoá, Nhóm hàng hoá, ghim ra hàng lọc được.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở danh sách Nhập khác gói Plus trên máy: Bộ lọc nâng cao có đủ 3 ô. Chưa bấm thử chọn giá trị rồi Áp dụng; phần lọc dùng chung code với Kiểm kê.

## Dở dang, việc tiếp theo

- Không. `VoucherScreen.tsx` cũng nằm trong T496 của Trum; phiên này chỉ sửa phần lọc, không đụng thanh công cụ.

## Bẫy, quyết định mới

- Không.
