# Điện thoại: 29 điểm giao diện Trum gửi, sửa lỗi POS hộ kinh doanh cộng VAT (T354)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, 5 worker Antigravity (Gemini 3.8 Flash High)
- Trạng thái cuối phiên: Xong

Mã việc: lúc nhận việc, phiên này lấy T353. Cùng lúc một phiên khác đã dùng T353 cho việc khe hở 1px (commit `2f4daa4`). Dòng trong `docs/TIEN-DO.md` đổi sang T354, nhưng các commit code của phiên này vẫn ghi `T353:` ở đầu.

## Đã làm

Mọi thay đổi chỉ áp cho điện thoại, trừ những chỗ ghi "web".

- Trang chủ Free: thẻ Kết quả kinh doanh đưa số tiền, % xuống dưới tên mục. Thẻ Mua hàng & công nợ: hai số tiền nằm ngang nhau. Chỉ sửa CSS, không đụng `BaBaiToanFree.tsx` (T339).
- Báo cáo kết quả kinh doanh: chỉ tiêu và số liệu như web, chia nhóm thẻ (`MBaoCaoDong.tsx`, `BaoCaoTaiChinh.tsx` export `dongKqkd`, `truoc`).
- Mọi báo cáo bỏ nút In, Xem mẫu in. Báo cáo dạng dòng (sổ quỹ...) bỏ nền trắng, tách thẻ theo nhóm ngày.
- Báo cáo dạng bảng có ô tìm, nút Excel dùng lại hàm xuất của web, nút xoay ngang. Áp cho 3.2.1–3.2.5, các sổ TT152 (3.2.5, 10.4.1, 5.2.8, 2.2.7, 6.2.5), 3.2.7, 4.2.2, 4.2.7 (`MSoBaoCao.tsx`, `MToGiay.tsx`). Tiêu đề sổ TT152 ghi theo ký hiệu, vd "Báo cáo S1a-HKD" (`MobileShell.tsx`).
- Xuất nhập tồn: ô tóm tắt tách 4 ô Đầu kỳ, Nhập, Xuất, Cuối kỳ.
- Icon (web cũng đổi): thu tiền mặt là tờ tiền (`banknote-2`), chi tiền mặt là tay cầm tiền (`hand-money`), ngân hàng là toà nhà (`buildings-2`). Sửa bảng tên ở `tools/xuat_bieu_tuong.py`, chạy lại sinh `src/ui/icon-dac.ts`. Bộ Solar không có icon ngân hàng mái tam giác có cột.
- Nút back: trước đây gọi `navigate` tới đường dẫn cũ, đẩy thêm lịch sử nên lặp vòng. Giờ có lịch sử thì `nav(-1)`, không có thì `replace` về màn cha (`MobileShell.tsx`, `MLapPhieu.tsx`, `MLapPhieuKho.tsx`).
- Bấm kính lúp thì ô tìm thế chỗ hàng tóm tắt, không sinh hàng mới (`MDanhSach.tsx`).
- Icon cửa hàng đổi sang `cuahang` nét như web: nút chọn cửa hàng, hộp chọn cửa hàng ghi tăng, form.
- Form chứng từ:
  - Bỏ nút Thêm hàng phía dưới, dòng hàng thấp lại.
  - Field Hình thức thanh toán, Ghi chú có icon.
  - Phiếu mua chọn Tiền mặt hoặc Chuyển khoản thì hiện ô chọn quỹ tương ứng.
  - Lưu phiếu còn nợ thì có nút Thanh toán ngay, sinh phiếu chi như web (`MLapPhieu.tsx`, `MXemPhieu.tsx`).
- Xem phiếu:
  - Chỉ giữ dòng cam Tổng thanh toán.
  - Điều chỉnh kho bỏ dòng Phiếu gốc khi trùng số với phiếu kiểm kê.
  - Kiểm kê, Xuất, Nhập điều chỉnh chỉ hiện số lượng, bỏ dòng Nguồn. Danh sách kiểm kê hiện mã, tên, tồn hệ thống, tồn thực tế, loại, SL điều chỉnh, ghi chú.
- Nghiệp vụ:
  - Bỏ Lập nhanh, làm lại kiểu danh sách gọn (Trum chọn mẫu B).
  - Thu chi thêm dòng Chuyển quỹ.
  - Điều chỉnh kho chỉ xem, không thêm mới (`MNghiepVu.tsx`).
- Thanh tab dưới: nền kính mờ, pill trượt theo tab, tự ẩn khi cuộn xuống, hiện lại khi cuộn lên (`ThanhDuoi.tsx`).
- Ghi tăng thẻ chi phí: form gọn theo kiểu form chứng từ (`MCcdc.tsx`).
- Xuất bán POS: chi tiết đơn đủ thông tin như web. Gói Free ẩn nhãn Đã ghi sổ (`MXuatBanPos.tsx`).
- Lỗi số (web và điện thoại): đơn POS hộ kinh doanh chia tiền phương thức thanh toán theo doanh thu cộng VAT, nên Tiền mặt lớn hơn Tổng thanh toán. Thêm `ttHkd` ở `ChungTuBanHang.tsx` để chia lại theo tổng sau giảm thuế.
- Tab Khác:
  - Nhóm Danh mục bỏ chữ "Danh mục" ở đầu tên, 1.2 ghi Hàng hoá, 1.5 ghi Đối tượng (`MKhac.tsx`).
  - Lý do nghiệp vụ, Phương thức thanh toán chỉ xem, riêng Lý do nghiệp vụ cho tích "Là chi phí".
  - Chi tiết cửa hàng có mã số thuế, đồng bộ thu chi, cách tính chi phí NVL.
  - Thêm màn Khoá sổ (`MDanhMuc.tsx`, `MFormDm.tsx`, `MCuaHang.tsx`, `MKhoaSo.tsx` mới, `manMobile.ts`).
- Web: mô tả phân hệ Kho hàng, Kế toán mua hàng bỏ chữ "iPOS Inventory".

## Đã kiểm

- `npm run typecheck`, `npm run build` trên bản gộp đủ 5 nhánh: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- `python tools/kiem_van.py` cho mọi file `.tsx` đã sửa: Sạch.
- Tự chụp 390x844 trên bản gộp:
  - Xuất nhập tồn: 44,8 + 232,4 − 178,1 = 99,1 tr, khớp.
  - Màn Nghiệp vụ, thanh tab: hiện đúng.
- Ảnh nghiệm thu các điểm khác do worker chụp, nằm trong scratchpad của phiên, không đưa vào repo.
- Chưa mở lại đơn POS hộ kinh doanh sau khi sửa `ttHkd`, chỉ kiểm bằng typecheck, build.

## Dở dang, việc tiếp theo

- Không. T355–T359 làm tiếp ngay trong phiên, ghi ở mục dưới.

## Làm thêm sau push đầu (T355–T359)

- T355: thẻ kho trả về số lượng `nhap`, `xuat`, `ton`, không có cột tiền, nên điện thoại đọc ra 0. Khuôn ngày trong `MBaoCaoDong.tsx` giờ nhận ra thẻ kho, hiện 4 ô số lượng, tồn cuối từng ngày, +nhập xanh, −xuất đỏ.
- T356: bút toán Xuất bán POS của hộ kinh doanh chỉ ghi Có 5111 (`ChungTuBanHang.tsx`, `MXuatBanPos.tsx`).
- Thanh tab dưới bỏ kính mờ, nền trắng đặc (Trum yêu cầu).
- T357: đang xem Tất cả cửa hàng thì phiếu mới để trống Cửa hàng, Kho và bắt chọn, không tự lấy Phố Mây Lê Lợi (`MLapPhieu.tsx`, `MLapPhieuKho.tsx`). Kiểm kê, phiếu kho trước đây không có ô Cửa hàng, nay có, chỉ hiện khi xem Tất cả.
- T358: kiểm kê chọn ngày hôm nay lấy giờ lúc chọn, ngày trước lấy 23:59.
- T359: chênh lệch −0,5 qua `money()` bị làm tròn thành 0. Kiểm kê dùng `soLuong` ở `kho/san-xuat.ts`, xem phiếu dùng `soLuong` mới ở `ui/format.ts` (tối đa 2 số lẻ).
- Đã kiểm:
  - `npm run typecheck`, `npm run build`, `kiem_tra.py --nhanh`: không lỗi.
  - Chụp thẻ kho: 22 + 103 − 84 = 41.
  - Đơn POS hộ kinh doanh: tiền mặt bằng tổng thanh toán, kiểm 3 đơn.
  - Form kiểm kê khi xem Tất cả: báo lỗi chọn cửa hàng.
  - T359 chưa nhập thử số lẻ trên màn.

## Bẫy, quyết định mới

- Không ghi vào `docs/BAY.md`, `docs/QUYET-DINH.md`.
- Gộp nhiều nhánh cùng thêm mục CSS cuối `app.css`: git có thể để dấu `}` cuối chung ra ngoài vùng xung đột. Gộp xong phải đếm `{` `}`, rồi chạy build để bắt lỗi "Unclosed block".
