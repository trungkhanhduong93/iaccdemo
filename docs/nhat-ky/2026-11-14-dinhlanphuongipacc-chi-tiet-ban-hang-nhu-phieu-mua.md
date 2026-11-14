# Điện thoại, chi tiết bán hàng lập tay theo giao diện phiếu nhập mua (T834)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MBanHangTay.tsx`: chi tiết chứng từ bán hàng lập tay (tab Bán hàng gói Plus, Pro) đổi từ khuôn chi tiết Xuất bán POS sang khuôn xem phiếu nhập mua (T655): thanh đầu mũi tên quay lại, tiêu đề "Bán hàng <số>"; thẻ đầu có cửa hàng, nguồn, nhãn trạng thái HĐĐT và Tổng tiền; nhóm Thông tin chung (khách hàng, MST, địa chỉ, ngày, kho xuất, kênh, thanh toán, ghi chú, tham chiếu phiếu trả lại), Thông tin hoá đơn khi đã xuất, Hàng hoá, dịch vụ dạng thẻ như phiếu mua và khối Tổng cộng.
- Chứng từ đã xuất HĐĐT: thẻ đầu có nhãn "Đã xuất HĐĐT" kèm "Mã tra cứu ..." ngay trên Tổng tiền; chưa xuất thì nhãn cam ghi trạng thái (Chưa xuất HĐĐT, Hoá đơn dự thảo...).
- Chân ghim như phiếu mua: Trả lại (nút phụ) và Xuất HĐĐT (nút chính) chia đôi; chỉ còn một thì nút chính rộng hết; không còn tiện ích thì không có chân.
- Không làm tab Lịch sử: `MLichSu` là dữ liệu mẫu của phiếu mua (nhà cung cấp, Ghi nợ phải trả), không hợp chứng từ bán.
- Sửa lỗi T833: Trả lại điền sẵn đơn giá theo giá bán gốc, bỏ giảm giá, phí dịch vụ nên tổng trả lại có thể vượt số đã bán (BH2610-0005 bán 2.460.150 đ, trả đủ ra 2.750.000 đ). Nay đơn giá điền sẵn là doanh thu tính thuế của dòng chia số lượng, chiết khấu 0, thuế tính lại theo đơn giá đó.
- Theo góp ý sau khi xem: thẻ đầu để Tổng tiền bên trái, nhãn HĐĐT bên phải cùng dòng chữ Tổng tiền, mã tra cứu (chữ nhỏ) dưới nhãn, ngang số tiền; dưới có khung tình trạng thanh toán như phiếu mua (hình thức, chip Đã/Chưa/một phần thanh toán, Đã thu / tổng, thanh tiến độ, số đã thu lấy theo `soDaTra`). Thông tin chung bỏ Mã số thuế, Địa chỉ, Thanh toán cho gọn.
- `app.css`: mục T834 cuối file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi. `python tools/kiem_van.py src/ui/mobile/MBanHangTay.tsx`: sạch.
- Trình duyệt 375x812, gói Plus (Phố Mây): BH2610-0013 hiện "Đã xuất HĐĐT · Mã tra cứu PM1AVH0BL" trên tổng 1.177.294 đ, đủ Thông tin hoá đơn; nội dung không tràn ngang. BH2610-0009 chưa xuất: bấm Xuất HĐĐT phát hành xong thẻ đầu hiện ngay nhãn kèm mã tra cứu, nút Xuất HĐĐT ẩn. BH2610-0005: hai nút rộng bằng nhau 170px; Trả lại mở form điền sẵn 50 Dĩa × 49.500 = 2.475.000 đ (không lưu).
- Sau góp ý: BH2610-0009 (Tiền mặt, đã xuất HĐĐT) hiện nhãn, mã tra cứu bên phải tổng tiền, khung Đã thanh toán 2.186.800 / 2.186.800; BH2610-0013, BH2610-0005 (Công nợ) Chưa thanh toán 0 / tổng; không tràn ngang.
- Chưa kiểm lại gói Pro (3.1.7 dùng chung thành phần).

## Dở dang, việc tiếp theo

- Phiếu trả lại vẫn chưa trừ giảm thuế GTGT theo % doanh thu (form lập phiếu điện thoại chưa có), ví dụ BH2610-0005 lệch 14.850 đ. Đã ghi ở nhật ký T833.

## Bẫy, quyết định mới

- Không.
