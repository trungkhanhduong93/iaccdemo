# In phiếu từ chứng từ bán hàng gói Plus, cột giá vốn (T813)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/mau-in.ts`: thêm mẫu `phieu-xuat-kho-ban` (02-VT, A4 ngang, không quyển số, "Bộ phận" cùng dòng người nhận, "Địa điểm" cùng dòng kho; HKD không có ký hiệu nên không in Mẫu số, căn cứ) và `hoa-don-ban-hang` (Cửa hàng, Ngày bán, Khách hàng, Địa chỉ, Mã số thuế). `mauCuaChungTu` nhận thêm `goi`: 3.1.1 gói Plus chỉ in hai mẫu này; gói khác giữ Bảng kê bán hàng theo ngày, Hoá đơn GTGT.
- `src/ui/bao-cao/InChungTu.tsx`: truyền gói vào danh sách mẫu.
- `src/ui/bao-cao/duLieuIn.ts`: hai mẫu mới bỏ giờ phút ở ngày; phiếu xuất kho bán lấy đơn giá, thành tiền theo giá vốn bình quân, tháng chưa tính thì để trống; địa chỉ, MST lấy `_diaChi`, `_mst` của form.
- `src/modules/kho/tinh-gia-von/giaVonBq.ts` (mới): lưu đơn giá vốn bình quân theo tháng, mã hàng vào localStorage; `TinhGiaVon.tsx` ghi khi tính xong.
- `src/modules/ban-hang/BangHangBan.tsx`, `ChungTuBanHang.tsx`, `src/ui/generic/ChungTuForm.tsx`: cột Giá vốn, Tiền vốn chỉ xem ở bảng Hàng bán gõ tay và Xuất bán POS; bút toán 632 tab Hạch toán POS bằng tổng Tiền vốn, chưa tính thì không có dòng; in từ form gửi kèm địa chỉ, MST đang gõ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` các file sửa: 0 ĐỎ (3 VÀNG cũ là chuỗi SVG trong `ChungTuBanHang.tsx`).
- Chạy thử bằng `tsx`: danh sách mẫu theo gói, chế độ; phiếu xuất kho trước khi tính giá vốn để trống, sau khi tính ra đúng đơn giá × số lượng.
- `python tools/xuat_bao_cao_he_thong.py` lỗi `No module named 'build_present'` như phiên trước, chưa làm mới file Excel.
- Chưa xem bản in trên trình duyệt trong phiên (khung trình duyệt của agent bị ẩn); người dùng đã xem ảnh chụp hộp In ở local.

## Dở dang, việc tiếp theo

- Đơn giá vốn là số giả lập 30 đến 40% giá bán theo mã và tháng, vì dữ liệu mẫu chưa có nhập, xuất từng món. Chạy Tính giá vốn một tháng là ghi cho mọi món bán, kể cả khi lọc kho, hàng.
- Giá vốn lưu chung mọi đơn vị trên trình duyệt; tách theo đơn vị thì thêm mã đơn vị vào khoá như `khoMauIn.ts`.
- Bút toán 632 của phiếu bán gõ tay vẫn là số dữ liệu mẫu, chưa theo Tiền vốn.
- Mẫu bán hàng người dùng hẹn gửi sau, chưa nhận.
- Hai mẫu mới chưa có trong cây màn Thiết kế mẫu in (11.11).

## Bẫy, quyết định mới

- Không.
