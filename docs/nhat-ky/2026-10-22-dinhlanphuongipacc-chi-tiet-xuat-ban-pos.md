# Chi tiết chứng từ Xuất bán POS theo bảng B canvas (T613)

- Ngày: 22/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`, khúc `ChiTiet`: phiếu đã đồng bộ ghi nhãn "Đã đồng bộ" thay "Đã ghi sổ".
- Cùng khúc: đầu phiếu thành 3 cụm. Đơn hàng POS gồm Mã đơn POS (số FABi), Số đơn POS, Cửa hàng, Kênh, Phương thức thanh toán, Thời gian xuất. Thông tin khách hàng gồm Khách hàng, Địa chỉ, Mã số thuế, Người mua. Hoá đơn gồm Số, Ký hiệu, Ngày hoá đơn, Ngày chứng từ, Mã tra cứu. Ghi chú nằm một dòng dưới cùng.
- Mã tra cứu tự xuống dòng, nút sao chép ngay sau mã, chép xong biểu tượng đổi xanh lá và báo "Đã chép mã tra cứu".
- Dữ liệu giả: hàm mới `donPosCua(x)` sinh Số đơn POS theo thứ tự đơn trong ngày. Khoảng một phần ba đơn có khách lấy hoá đơn GTGT (3 khách mẫu `KHACH_VAT`), kèm số, ký hiệu, ngày hoá đơn, mã tra cứu. Đơn khác ghi "Khách lẻ POS", cụm Hoá đơn chỉ còn Ngày chứng từ và dòng "Khách không lấy hoá đơn GTGT". Cột Đối tượng ở danh sách lấy theo khách này.
- Chân phiếu bỏ `DaiTong` và Phiếu giảm giá. Dải phép tính nằm giữa In phiếu và Đóng: Tiền hàng − Giảm giá − Chiết khấu + Phí dịch vụ (+ Phí vận chuyển khi có) = Doanh thu tính thuế − Giảm trừ thuế = Tổng thanh toán. Số cộng từ các dòng Hàng bán nên khớp dòng Tổng cộng.
- Doanh nghiệp tính thuế khấu trừ thì chỗ Giảm trừ thuế thành "+ Thuế GTGT", theo đúng cột thuế của lưới (`anTheoLoai`).
- `src/styles/app.css` cuối file, mục T613: `.pos-dau3`, `.fsf-f-pos`, `.pos-phep`. Dưới 1200px dải phép tính lên hàng riêng, hai nút xuống hàng dưới. Dưới 900px ba cụm đầu phiếu xếp dọc.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` file `ChungTuBanHang.tsx`: 0 ĐỎ. Còn 3 VÀNG là đường vẽ SVG nút In phiếu có sẵn.
- Mở màn ở 1366px và 1024px: đúng bố cục bảng B; bấm nút sao chép đổi màu.

## Dở dang, việc tiếp theo

- Không. Bốn điều chưa chốt với người dùng, cần thì hỏi rồi tạo việc mới:
  - Giảm giá khác Chiết khấu thế nào trên đơn FABi.
  - Giảm trừ thuế tính ra sao, hiện dùng `giamThueHkd`.
  - Có cần dòng Thuế GTGT ở chân với đơn vị theo % doanh thu không.
  - Cột lưới "Doanh thu trước thuế" có đổi thành "Doanh thu tính thuế" không.
- Dữ liệu mẫu chưa có giảm giá, chiết khấu, phí dịch vụ nên các ô này bằng 0. T574 (số lượng × đơn giá khác thành tiền ở món cuối) vẫn còn.
- Bản điện thoại `MXuatBanPos.tsx` chưa đổi theo.

## Bẫy, quyết định mới

- Không.
