# Xuất điều chuyển gọn, sinh phiếu nhập chờ (T748)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/BangDieuChuyen.tsx`: đầu phiếu xuất điều chuyển bỏ ô Cửa hàng nhận. Ô Kho nhận liệt kê kho của mọi cửa hàng khác, cửa hàng nhận suy ra từ kho (`cnCuaKho`). Bảng chi tiết, hộp Tuỳ chỉnh giao diện của phiếu xuất gọi Đơn giá, Thành tiền là Giá vốn, Tiền vốn. Ô Tham chiếu của phiếu nhập bỏ phiếu xuất đã có phiếu nhập chờ.
- `src/ui/generic/ChungTuForm.tsx`: lưu phiếu xuất điều chuyển thì sinh phiếu nhập điều chuyển ở cửa hàng nhận, trạng thái Chờ nhập, chưa ghi sổ; thực nhận bằng số xuất. Sửa phiếu xuất khi phiếu nhập còn chờ thì phiếu nhập đổi theo. Xoá phiếu xuất còn chờ thì xoá luôn phiếu nhập chờ; phiếu xuất đã nhập vẫn phải xoá phiếu nhập trước.
- `src/modules/kho/PhieuDieuChuyen.tsx`: danh sách xuất điều chuyển bỏ cột Cửa hàng nhận; danh sách nhập điều chuyển có chip Chờ nhập, mở mặc định ở chip này (`PhieuSanXuat.tsx`).
- `src/modules/kho/dieu-chuyen.ts`: thêm 2 phiếu nhập mẫu Chờ nhập cho 2 phiếu xuất mẫu đang chờ (XDCK2610-0255, 0256).

- Góp ý lần 2 của PhuongXT: phiếu nhập điều chuyển chỉ sinh từ phiếu xuất. Danh sách bỏ nút Thêm mới (`khongThem` trong `KieuDs`, `PhieuSanXuat.tsx`), đường `/moi` quay về danh sách (`PhieuDieuChuyen.tsx`), form bỏ Lưu và thêm, Ctrl+Shift+S; lối tắt ở Quy trình kho mở danh sách (`quy-trinh.ts`).
- Đầu phiếu nhập: Tham chiếu chuyển xuống dưới Xuất từ, Kho nhận, chỉ còn link tới phiếu xuất, không chọn được (bỏ `OThamChieuDcn`).
- Góp ý lần 3: phiếu nhập điều chuyển bỏ nút Sửa, Ctrl+E, mục Sao chép ở Tiện ích, Ctrl+O. Phiếu Chờ nhập mở ra là ở chế độ sửa (`ndcCho` trong `ChungTuForm.tsx`, trừ kỳ đã khoá sổ): sửa được Thực nhận, Kho nhận; không có Huỷ; nút Lưu đổi thành Nhập kho (Ctrl+S). Nhập kho thì phiếu nhập Đã nhập, ghi sổ, phiếu xuất tham chiếu Đã nhập, lịch sử ghi "Nhập kho". Phiếu Đã nhập chỉ xem.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` 4 file đã sửa: 0 ĐỎ.
- Thử trên trình duyệt gói Plus: lập phiếu xuất Lê Lợi sang Kho bếp Thảo Điền, lưu; đổi cửa hàng làm việc sang Thảo Điền thấy NDCK2610-0261 Chờ nhập; sửa, mở NDCK2610-0256 Chờ nhập, sửa Thực nhận, bấm Nhập kho thì phiếu thành Đã nhập, giữ số mới; phiếu xuất tham chiếu thành Đã nhập. Danh sách nhập điều chuyển không còn nút Thêm mới.

## Dở dang, việc tiếp theo

- Điện thoại chưa đổi theo: `MLapPhieuKho.tsx` vẫn có ô cửa hàng nhận, chưa sinh phiếu nhập; file đang trong T552 của Trum.
- Phiếu nhập điều chuyển vẫn gọi cột Đơn giá, Thành tiền; PhuongXT chỉ yêu cầu đổi ở phiếu xuất.

## Bẫy, quyết định mới

- Không.
