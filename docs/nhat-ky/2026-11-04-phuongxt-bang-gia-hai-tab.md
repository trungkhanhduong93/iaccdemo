# Bảng giá 2 tab, lọc trạng thái, lọc kênh công thức (T724)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Màn danh mục chung (`src/ui/generic/CatalogScreen.tsx`) thêm tuỳ chọn `tabTheo` (khai ở `src/modules/types.ts`): chia danh sách thành tab theo giá trị một cột, tab thay hàng chip trạng thái, ô Trạng thái hiện sẵn trên thanh lọc (mặc định Đang hoạt động), `anCot` ẩn cột ở bảng và bộ lọc theo tab. Form thêm riêng (`formThem`) nhận `tab` đang mở.
- Danh mục Bảng giá 1.14 (`src/modules/danh-muc/index.ts`): 2 tab Giá nhập, Giá bán; bỏ cột Loại giá, bỏ lọc nhóm Loại giá; `khongLoc` bỏ ĐVT, Đơn giá, VAT; tab Giá nhập ẩn Khách hàng, tab Giá bán ẩn Nhà cung cấp.
- Form Thêm bảng giá (`ThemBangGia.tsx`) mở sẵn loại giá theo tab đang xem.
- Công thức chế biến (`src/modules/kho/CongThuc.tsx`): thêm ô lọc Kênh áp dụng; công thức để trống kênh là mọi kênh nên luôn hiện. Sơ chế không có ô này.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở trên máy: Bảng giá hiện tab Giá nhập 8, Giá bán 9, ô Trạng thái Đang hoạt động; Công thức chế biến có ô Kênh áp dụng.

## Dở dang, việc tiếp theo

- Không.
- Máy đã lưu cấu hình ô lọc của màn Bảng giá thì ô Trạng thái nằm trong nút phễu, bật lại nếu muốn hiện ngoài.

## Bẫy, quyết định mới

- Không.
