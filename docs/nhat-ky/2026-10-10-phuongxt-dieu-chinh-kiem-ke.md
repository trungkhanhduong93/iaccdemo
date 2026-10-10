# Tự sinh phiếu điều chỉnh từ kiểm kê (T126)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT chọn để phiếu điều chỉnh ở màn mới Điều chỉnh kho (không dùng Xuất khác, Nhập khác).
- `kho/dieu-chinh.ts` (mới): `dongDieuChinh` lấy dòng chênh (thiếu thì xuất, thừa thì nhập, số lượng là phần chênh, đơn giá theo danh mục NVL); `phieuDieuChinh` dựng phiếu, số phiếu theo số kiểm kê (KK2610-0256 thành XDC2610-0256, NDC2610-0256); `mauKiemKe`, `mauDieuChinh` dựng phiếu mẫu cùng hạt giống với màn 5.1.10 để phiếu kiểm kê mẫu đã có phiếu điều chỉnh.
- `kho/index.ts`: màn `dieu-chinh` (Điều chỉnh kho) đứng ngay sau Kiểm kê, ngoài Excel, không mã tính năng nên gói nào cũng có. Hai loại `xdc` (Nợ 1381, Có 152), `ndc` (Nợ 152, Có 3381).
- `modules/types.ts`: `VoucherCfg.dieuChinh`, `khongThem`, `rowsMau`.
- `ChungTuForm.tsx`: lưu phiếu kiểm kê thì `dongBoDc` sinh, sửa hoặc xoá phiếu điều chỉnh cho khớp, ghi `_dsDc` vào phiếu kiểm kê. Xoá phiếu kiểm kê thì xoá luôn phiếu điều chỉnh. Phiếu kiểm kê hiện dòng "Chứng từ xử lý chênh lệch", phiếu điều chỉnh hiện "Theo phiếu kiểm kê", đều bấm mở được. Phiếu điều chỉnh dùng đầu phiếu gọn như kiểm kê (Kho xuất hoặc Kho nhập, Nhân viên; Ghi chú), bảng không có cột Kho.
- `VoucherScreen.tsx`: `rowsMau`; bỏ nút Thêm mới khi `khongThem`; Điều chỉnh kho có hai tab con Xuất điều chỉnh, Nhập điều chỉnh nằm bên trái thanh công cụ, cùng hàng bộ lọc (số đếm theo bộ lọc đang áp), cột Kho, Ghi chú; bỏ cột Loại, Tiền thuế, chip trạng thái ghi sổ.
- `daXoa.ts`: `dsDcCon`.
- `app.css`: mục cuối "Tham chiếu phiếu kiểm kê, phiếu điều chỉnh (T126)", gồm cả kiểu tab con `.seg.dc-tabs`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt gói Free: thêm phiếu kiểm kê, sửa tồn thực tế Tôm sú từ 4 xuống 2, lưu thì sinh XDC2610-0261, hiện trong tab Xuất điều chỉnh. Phiếu mẫu KK2610-0256 bấm NDC2610-0256 mở phiếu nhập điều chỉnh, bấm ngược về phiếu kiểm kê. Gói Plus không còn chip trạng thái ở Điều chỉnh kho.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Phiếu điều chỉnh sửa tay được nhưng không cập nhật ngược phiếu kiểm kê.
- Phiếu kiểm kê mới lấy ghi chú mẫu "Kiểm kê cuối tháng Kho bếp Lê Lợi" dù kho khác; nên đổi ghi chú mặc định theo kho đang chọn.

## Bẫy, quyết định mới

- Không.
