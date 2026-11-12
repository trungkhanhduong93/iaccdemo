# Quy đổi ĐVT hiện tên ĐVT, định dạng tỷ lệ, gọn form (T807)

- Ngày: 12/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `danh-muc/index.ts`: cột Từ ĐVT, Đến ĐVT chỉ hiện tên, bỏ hàm `maTenDvt`.
- `truong-dm.ts`: thêm `chiTen` (ô chọn có tìm chỉ hiện tên), `anPhuDe` (ẩn dòng mã dưới tên panel), `khongGap` (khối luôn mở, không nút gập); form 1.4 bật cả ba, bật `soQuocTe`, trạng thái chuyển từ công tắc đầu khối sang khối Trạng thái riêng như các danh mục khác.
- `CatalogScreen.tsx`: đọc `chiTen`, `anPhuDe`, `khongGap`.
- `danh-muc/data.ts`: `dienGiaiQd` định dạng tỷ lệ bằng `soQT`, theo tiêu chuẩn định dạng số của đơn vị.
- `MDanhMuc.tsx`: thẻ Quy đổi ĐVT trên điện thoại hiện diễn giải (vd 1 Thùng = 24 Lon) và Hàng hoá áp dụng, bỏ mã và số kiểu tiền "24 đ".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: 0 ĐỎ.
- Thử tay trên localhost: danh sách, form sửa (gõ 12500,5 hiện 12.500,5, diễn giải theo), khổ điện thoại 375px.

## Dở dang, việc tiếp theo

- Không.
- Bản demo chưa lưu thay đổi khi sửa dòng Quy đổi ĐVT có sẵn (bấm Lưu danh sách giữ số cũ), có từ trước, chưa mở việc.

## Bẫy, quyết định mới

- Không.
