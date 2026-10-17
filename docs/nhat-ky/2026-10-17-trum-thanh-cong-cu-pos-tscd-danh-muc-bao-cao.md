# Thanh công cụ Xuất bán POS, TSCĐ, Chi phí phân bổ, danh mục, báo cáo (T351)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/ChungTuBanHang.tsx`: màn Xuất bán POS đưa ô lọc sang trái, Tuỳ chỉnh cột và Excel giữ bên phải.
- `CatalogScreen.tsx`, `danh-muc/HeThongTaiKhoan.tsx`: mọi màn danh mục và danh sách Tài sản cố định gom Nhập, Xuất Excel vào 1 nút icon Excel (`NutExcel`) như danh sách chứng từ.
- Chi phí phân bổ: hàng 1 bộ lọc và nút Ẩn thẻ hết phân bổ bên trái, Thêm mới bên phải; hàng 2 Tuỳ chỉnh cột, Excel bên phải.
- `ReportScreen.tsx`: mọi báo cáo để ô lọc, các ô lọc thêm (Kho, Mặt hàng, Quỹ tiền) và nút Lọc ngoài cùng bên trái. Bên phải là Tuỳ chỉnh, icon Excel, In. Bỏ nút Xuất dạng chữ, icon Excel thả xuống đủ 5 định dạng xuất cũ.
- `LocNangCao.tsx`: `BoLoc` thêm prop tuỳ chọn `truocNutLoc` để chèn ô lọc trước nút Lọc. Màn khác không truyền nên không đổi.
- `CongCuDs.tsx`: `NutExcel` thêm prop tuỳ chọn (title, align, width, nội dung menu riêng), các màn cũ vẫn chạy như trước.
- `app.css`: mục cuối T351.
- `DanhMucCuaHang.tsx` không sửa vì T321 đang làm, màn này không có nút Excel.

## Đã kiểm

- Anti chạy `npm run typecheck`, `npm run build`, `kiem_tra.py --nhanh` (cổng 5181): không lỗi. Chụp 14 ảnh ở 1440x900 và 1280x800 trong `%TEMP%/T351-anh/`, không tràn ngang, không nút bị cắt.
- Sau khi rebase lên `main`: typecheck, build xanh, ngoặc trong `app.css` cân.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
