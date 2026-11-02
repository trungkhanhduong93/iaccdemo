# Chọn lại công ty của cửa hàng ở Danh mục cửa hàng (T711)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/session.tsx`: thêm trường `cnCongTy` (công ty chọn lại theo đơn vị, khoá mã cửa hàng) và hàm `congTyCn` lấy công ty của cửa hàng; chưa chọn là đơn vị đang mở.
- `src/modules/danh-muc/DanhMucCuaHang.tsx`: hộp Chi tiết cửa hàng, dòng Công ty thành ô chọn các đơn vị của tài khoản; chọn công ty khác hiện hộp xác nhận báo toàn bộ số liệu cửa hàng chuyển sang công ty mới. Cột Công ty, MST theo công ty đã chọn.
- `src/ui/mobile/MCuaHang.tsx`: điện thoại làm giống web; Công ty, Địa chỉ, MST theo công ty đã chọn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 2 file giao diện: Sạch.
- Thử tay web (1440) và điện thoại (375): chuyển Phố Mây Lê Lợi sang Chuỗi Trà Lá, cảnh báo hiện, xác nhận xong công ty, MST đổi đúng.

## Dở dang, việc tiếp theo

- Không.
- Bản mẫu chỉ đổi tên công ty hiện ở cửa hàng: cửa hàng vẫn nằm trong danh mục, báo cáo của công ty cũ, chưa dời số liệu thật. Muốn cửa hàng biến khỏi công ty cũ thì hỏi Trum, mở việc mới.

## Bẫy, quyết định mới

- Không.
