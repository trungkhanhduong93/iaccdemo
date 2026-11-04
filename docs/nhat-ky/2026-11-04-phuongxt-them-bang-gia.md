# Form thêm bảng giá nhiều nhà cung cấp, nhiều mặt hàng (T723)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Danh mục Bảng giá (1.14): nút Thêm mới mở form toàn màn mới `src/modules/danh-muc/ThemBangGia.tsx`. Đầu form chung: Loại giá (Giá nhập, Giá bán), Thời gian áp dụng, Kho áp dụng (trống là tất cả kho), Nhà cung cấp mặc định (chỉ giá nhập).
- Lưới Chi tiết giá: Nhà cung cấp (giá nhập), Mặt hàng, ĐVT, Đơn giá, VAT, Giá gồm VAT, nút xoá dòng. Nút Thêm dòng, Chọn nhiều mặt hàng (hộp `ThemHangLoat` có sẵn). Chọn hàng thì lấy sẵn giá, VAT của hàng.
- Lưu: kiểm thiếu hàng, thiếu nhà cung cấp, đơn giá bằng 0, trùng nhà cung cấp + mặt hàng; mỗi dòng thành một dòng bảng giá (`addCatalogRow('1.14')`).
- `CatalogCfg.formThem` (`src/modules/types.ts`): danh mục khai form thêm riêng thì nút Thêm mới, nút ở bảng trống, `?moi=` mở form đó; bấm dòng vẫn sửa bằng panel cũ (`CatalogScreen.tsx`).
- CSS mục T723 cuối `src/styles/app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/danh-muc/ThemBangGia.tsx`: Sạch.
- Mở thử gói Plus (cổng 5185): chọn nhà cung cấp mặc định, chọn 3 nguyên vật liệu, Lưu, danh sách từ 17 lên 20 dòng.
- Chưa làm bản điện thoại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.