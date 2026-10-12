# Xuất, nhập điều chuyển và chuyển kho (T155)

- Ngày: 12/10/2026
- Người: Trum, agent: Claude Code điều phối, worker Claude viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Kho tách Điều chuyển thành 3 tab: Xuất điều chuyển (5.1.4, Nợ 1368/Có 152), Nhập điều chuyển (5-1-4-2, Nợ 152/Có 3368, bắt buộc tham chiếu phiếu xuất đang chờ nhập), Chuyển kho (5-1-4-3, trong cùng chi nhánh, không hạch toán).
- Dùng lại cơ chế tham chiếu của phiếu sản xuất T152: chip Chờ nhập, Đã nhập, Đã huỷ; lưu phiếu nhập thì phiếu xuất chuyển Đã nhập; phiếu xuất đã có phiếu nhập thì không xoá được. File mới `kho/dieu-chuyen.ts`, `kho/BangDieuChuyen.tsx`, `kho/PhieuDieuChuyen.tsx`; `ChungTuForm.tsx` thêm nhánh `cfg.dieuChuyen`.
- Báo cáo nhập, xuất (5-2-9 đến 5-2-12) có thêm phiếu điều chuyển. Sơ đồ quy trình, menu bay, nút ở danh mục kho trỏ đúng tab mới.
- Tìm nhanh (`CommandPalette.tsx`): "chuyển kho" ra màn Chuyển kho, tra thêm theo slug cho màn ngoài Excel.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `kiem_tra.py --nhanh`: đạt.
- Worker chạy thử bằng Playwright: chọn phiếu xuất XDCK2610-0256, lưu phiếu nhập, phiếu xuất chuyển Đã nhập, tham chiếu hai chiều mở được, chặn xoá phiếu xuất đã có phiếu nhập; phiếu chuyển kho không có tab Hạch toán.

## Dở dang, việc tiếp theo

- Thẻ kho, Xuất nhập tồn chưa tính phiếu chuyển kho (dữ liệu hai báo cáo này không sinh từ phiếu).
- Báo cáo kho chỉ đọc phiếu mẫu, chưa đọc phiếu lưu trong phiên.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD53.
