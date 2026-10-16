# Điện thoại: thẻ mặt hàng phiếu mua, nhập, xuất kho, kiểm kê (T300)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLapPhieu.tsx`, `MLapPhieuKho.tsx`: phiếu lập mới, sửa trên điện thoại xếp khối Thông tin chung (nhà cung cấp, cửa hàng, kho, hình thức, ngày, ghi chú) trên, Danh sách hàng hoá dưới.
- Thẻ mặt hàng theo mẫu Trum gửi: tên kèm mã, nút Nhân bản, Xoá; Số lượng kèm đơn vị tính; Đơn giá; Giảm giá % hoặc đ; Tiền giảm giá, VAT, Tổng tiền có nút bút chì sửa thẳng, tính ngược đơn giá; ô ghi chú dòng.
- Đơn vị tính: gói Free khoá. Gói khác, hàng có quy đổi trong danh mục Quy đổi ĐVT thì chọn được đơn vị quy đổi, đơn giá tính lại theo hệ số, luôn tính từ giá theo đơn vị chính (`giaGoc`) để đổi qua lại không lệch.
- Phiếu nhập, xuất kho khác bỏ giảm giá, VAT. Kiểm kê bỏ giảm giá, VAT, đơn giá, tổng tiền.
- Hai trường mới trên dòng phiếu điện thoại `giaGoc`, `dvtChinh` khai báo bằng kiểu cục bộ `DongM`, không đổi kiểu `Dong` dùng chung.
- `app.css` mục T300.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`, `--dien-thoai`: `Không có lỗi.`
- Xem ảnh 390x844: phiếu mua hàng gói Free khoá đơn vị, gói Pro mở menu đơn vị, sửa Tổng tiền đổi đơn giá, phiếu nhập kho khác, phiếu kiểm kê.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
