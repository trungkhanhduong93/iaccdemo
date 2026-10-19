# Phiếu mua điện thoại theo phương án D (T449)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MXemPhieu.tsx`: làm lại màn Xem phiếu mua theo mẫu phương án D. Thẻ tổng quan gồm chip trạng thái, nhà cung cấp, cửa hàng, tổng thanh toán, ô đã trả và còn phải trả. Thân màn có 4 tab, danh sách hàng dạng thẻ có nút Sửa và thẻ tổng tiền. Chân ghim đáy có nút Sửa phiếu và Thanh toán.
- `MXemPhieu.tsx`: bảng trượt Thanh toán phiếu mua gồm ô số tiền chi trả kèm số còn nợ, hình thức thanh toán, danh sách thẻ chọn quỹ kèm số dư, ngày chi, cửa hàng và nút Lập phiếu chi.
- `MLapPhieu.tsx`: làm lại màn Lập và sửa phiếu mua. Thanh tiêu đề hiển thị số phiếu khi sửa. Màn gồm chọn nhà cung cấp, cửa hàng, ô tích Thanh toán ngay, nhóm thông tin hoá đơn, danh sách hàng hoá dạng thẻ kèm nút Thêm mặt hàng. Chân màn gồm nút Huỷ, Lưu thay đổi.
- `MLapPhieu.tsx`: bảng trượt Sửa một mặt hàng có tay kéo gồm số lượng kèm chọn đơn vị tính, đơn giá. Nút bút cho phép sửa Tiền giảm giá (tính lại %), Tiền VAT (ghi đè), Tổng tiền (tính ngược đơn giá). Bổ sung trường tuỳ chọn `ghiChu` cho mặt hàng.
- `src/styles/app.css`: thêm mục CSS `/* ── Phiếu mua điện thoại theo phương án D (T449) ── */` ở cuối file, dùng biến `:root` có sẵn, đảm bảo chuẩn hiển thị 360px không cuộn ngang.
- Review chéo VÀNG, đã sửa: bỏ inline style ở danh sách hàng màn xem; quỹ TM02 không trùng tên quỹ cửa hàng đang chọn.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py`: 2 file `MXemPhieu.tsx` và `MLapPhieu.tsx` sạch 0 ĐỎ.
- 8 ảnh Playwright chụp ở độ phân giải 360x780 và 390x844 lưu trong thư mục `backup/`.

## Dở dang, việc tiếp theo

- Không.
- Ghi thêm: danh sách quỹ ở bảng Thanh toán vẫn là dữ liệu giả viết cứng trong `MXemPhieu.tsx` từ trước, chưa lấy từ danh mục Quỹ tiền. Mẫu D lưu ở canvas https://claude.ai/artifact/Peitt7dwABmLBNUj6ScWit.

## Bẫy, quyết định mới

- Không.
