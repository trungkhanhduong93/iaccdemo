# Chứng từ bán hàng lập tay phát hành HĐĐT, danh sách xuất nhiều (T785)

- Ngày: 10/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/hddt.tsx`: thêm `phatHanhHd` (Lưu và phát hành từ form), `HopNguoiMua` (popup Thông tin xuất hoá đơn, có chế độ chỉ xem), `HopXemHd` (popup xem hoá đơn: ngày, người mua, tiền, thuế suất, mã tra cứu, mã CQT, Tải PDF, Tải XML, Xem hoá đơn điện tử), `OKyHieu` (ô Mẫu số - Ký hiệu chọn trong danh sách đã khai báo hoặc gõ tay), `dsKyHieu`, `khachTheoTen`, `nguoiMuaMotDong`. `HdDaXuat` thêm mã tra cứu, người mua, tiền trước thuế, thuế, tổng. Chứng từ lưu thêm `_khachHd`, `_khongLayHd`.
- `FormKhach` theo QD106: Cá nhân gồm tên người mua, địa chỉ, SĐT, CCCD, hộ chiếu, email; Công ty gồm MST (không bắt buộc), tên đơn vị, địa chỉ, tên người mua hàng, email, mã QHNS.
- `HopHangLoat` làm lại theo thiết kế: mỗi chứng từ một dòng, sửa ngày hoá đơn, ký hiệu từng dòng hoặc "áp dụng cho tất cả", cột Người mua trên hoá đơn hiện thông tin nào có, Sửa mở popup Thông tin hoá đơn (Ngày hoá đơn và Mẫu số - Ký hiệu cùng dòng, ô tích Người mua không lấy hoá đơn, người mua), Đồng ý lưu luôn vào chứng từ. Bỏ cột tích bỏ chọn; dòng thiếu thông tin có vạch đỏ, không phát hành.
- `src/ui/generic/ChungTuForm.tsx` (khi `hdDienTu`): công tắc Phát hành HĐĐT thay ô tích Lập kèm hoá đơn, thêm mới mặc định bật khi đã khai báo; ô Xuất HĐ cho một dòng dưới Địa chỉ, link Sửa; ô tích Người mua không lấy hoá đơn tự tích với khách lẻ, cá nhân; cột hoá đơn Ngày hoá đơn, Ký hiệu (theo cửa hàng rồi khai báo chung), Số hoá đơn "Cấp khi phát hành"; nhóm Tiền trước thuế HĐ, Tiền thuế HĐ (mẫu 2 là Giảm trừ thuế HĐ), Tổng tiền hoá đơn ở đầu trái dải tổng, cả khi thêm mới; nút Lưu và phát hành, Lưu, phát hành và thêm.
- Chứng từ đã xuất: nhãn chữ "Đã xuất HĐĐT · Mã tra cứu", Số hoá đơn là link kèm biểu tượng mắt mở popup xem hoá đơn, Ký hiệu, Ngày hoá đơn chỉ xem, ô Xuất HĐ cho có link Xem; không nút Sửa, Ctrl+E không sửa, Xoá chứng từ trong Tiện ích mờ, thêm Tải PDF, Tải XML hoá đơn; chân phải nhãn "Đã xuất HĐĐT · không sửa được". Số lệch giữa hoá đơn và chứng từ tô đỏ (`NhomTienHd`).
- `src/modules/ban-hang/ChungTuBanHang.tsx`: cột đổi tên Trạng thái xuất HĐĐT (Đã xuất kèm số hoá đơn bấm mở xem, Chưa xuất); bỏ nút Phát hành từng dòng; nút Xuất HĐĐT báo chứng từ đã xuất, chọn lẫn thì bỏ qua và báo số dòng bỏ qua. Bỏ chip HĐ ở đầu form, nút chân form chứng từ chưa xuất đổi tên Phát hành HĐĐT.
- `src/styles/app.css`: mục cuối file "(T785)".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` cho 3 file tsx: 0 ĐỎ.
- Script Playwright riêng gói Plus: thêm mới chọn cửa hàng, form có công tắc, Xuất HĐ cho, nhóm tiền HĐ; Lưu và phát hành chuyển sang xem đã xuất, không có nút Sửa, popup xem hoá đơn mở; danh sách tab Bán hàng có cột mới, chọn dòng mở popup xuất nhiều, Sửa mở popup Thông tin hoá đơn. Không có lỗi trên console.

## Dở dang, việc tiếp theo

- Không. Việc tiếp là T786 (menu Hoá đơn điện tử 3 tab).
- Đã chốt (dinhlanphuongipacc): đơn vị khấu trừ ghi thẳng thuế suất đã giảm, không áp dụng giảm thuế. Thẻ Hoá đơn điện tử chỉ hiện công tắc giảm thuế với đơn vị tính GTGT theo % doanh thu; popup xem hoá đơn bỏ chữ "giảm 2% theo NQ". Ghi vào QD106.
- Chứng từ phát hành chỉ giữ trong phiên (dữ liệu giả), tải lại trang là mất như mọi chứng từ mới.
- `tools/xuat_bao_cao_he_thong.py` chưa chạy được trên máy này (thiếu module `build_present`, như nhật ký T784).

## Bẫy, quyết định mới

- Không. Theo QD106 đã có.
