# Điện thoại đợt 3: danh sách, danh mục, lọc, màn trống (T176)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Anti A (Antigravity Windows) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`: tách hook `useDongChungTu(sc, mod)`, export `GtLoc`, `locMacDinh`, `gopLoai`. Giao diện, hành vi bản máy tính không đổi.
- `src/ui/mobile/MDanhSach.tsx`: ô tìm, hàng chip, danh sách thẻ, nút thêm dạng viên thuốc, màn trống khi rỗng.
- `src/ui/mobile/MChungTu.tsx`: danh sách chứng từ dạng thẻ (số phiếu, tổng tiền, đối tượng, chip trạng thái, ngày giờ, loại phiếu); chip Tất cả, Chưa ghi sổ, Đã ghi sổ, Lỗi hạch toán; chip loại phiếu; lọc tháng này và chi nhánh như bản máy tính; chọn loại phiếu khi thêm bằng tấm trượt. Mở phiếu (`/:id`) tạm ra `MChiMayTinh`, đợt 4 làm.
- `src/ui/mobile/MLoc.tsx`: màn lọc toàn màn (khoảng ngày, đối tượng, nguồn, Thiết lập lại, Áp dụng).
- `src/ui/mobile/MDanhMuc.tsx`: danh mục dạng thẻ, chip nhóm; bấm thẻ báo "Sửa trên điện thoại có ở bản sau".
- `src/ui/mobile/MChon.tsx`, `MTrong.tsx`: tấm trượt chọn, màn trống có hình IVT (`src/assets/ivt/img_empty_*`, `img_search_no_result.png`).
- `src/ui/mobile/manMobile.ts`: màn `voucher` ra `MChungTu`, `catalog` ra `MDanhMuc`.
- `src/ui/mobile/MobileShell.tsx`, `app.css`: tiêu đề thanh trên dùng nhãn ngắn của màn (`nhanTab`), cắt chữ ở cuối khi dài. Nút đóng màn lọc dùng biểu tượng `chevl` (Anti A đặt tên `arrl` không có trong `Icon.tsx`, hiện ô vuông).
- `tools/kiem_tra.py --dien-thoai`: mở 9 màn mẫu, gõ `zzzz` ra màn trống, xoá thì thẻ trở lại, bấm từng chip.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`, `--dien-thoai`: Không có lỗi.
- `python tools/kiem_tra.py` đủ 4 gói: Không có lỗi. So 25 ảnh bản máy tính trước và sau: không khác ngoài vùng nút có hiệu ứng.
- Số thẻ điện thoại so với ô Tổng ở chân bảng bản máy tính, gói Plus, tất cả chi nhánh, tháng này: Thu chi 26/26, Mua hàng 22/22, Nhập kho 6/6, Xuất kho 5/5, Bán hàng 5/5, Kiểm kê 6/6.
- Xem ảnh 390px danh sách thu chi, hàng hoá, màn trống, màn lọc bằng mắt.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Đợt 4: xem phiếu (mục 7 của `docs/ke-hoach-mobile-ivt.md`), thay `MChiMayTinh` khi mở `/:id` trong `MChungTu.tsx`.

## Bẫy, quyết định mới

- Không.
