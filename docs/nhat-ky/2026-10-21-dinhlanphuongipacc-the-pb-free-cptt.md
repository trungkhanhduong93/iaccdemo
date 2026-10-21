# Thẻ chi phí phân bổ gói Free chỉ còn Chi phí trả trước (T605)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ccdc/the-phan-bo.tsx`: thêm `loaiTheTheoGoi(goi)`. Gói Free trả về chỉ "Chi phí trả trước", gói khác đủ 3 loại. Ô Loại thẻ trên form thẻ dùng `dsGoi: { F: ... }`.
- `src/modules/danh-muc/truong-dm.ts`, `src/ui/generic/CatalogScreen.tsx`: trường chọn có thêm `dsGoi`, danh sách chọn riêng theo gói, thay cho `ds` khi có.
- `src/modules/ccdc/index.ts`: danh sách thẻ 8.1.1 thêm `locGoi`, gói Free ẩn thẻ CCDC, TSCĐ.
- `src/modules/ccdc/GhiTangHangLoat.tsx`: ô Loại thẻ ở Ghi tăng hàng loạt theo gói.
- `src/ui/mobile/MCcdc.tsx`: hộp chọn Loại thẻ khi ghi tăng và danh sách thẻ trên điện thoại theo gói.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Web gói Free, màn 8.1.1: chỉ còn 5 thẻ Chi phí trả trước, không còn chữ Công cụ dụng cụ, Tài sản cố định.
- Chưa mở thử ô Loại thẻ trên form và màn điện thoại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
