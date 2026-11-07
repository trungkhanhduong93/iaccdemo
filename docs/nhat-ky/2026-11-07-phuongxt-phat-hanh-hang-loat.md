# Trạng thái phát hành, phát hành hoá đơn hàng loạt ở danh sách Bán hàng (T765)

- Ngày: 07/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: danh sách gói Plus thêm cột Trạng thái phát hành (Chưa phát hành, Đã phát hành), dòng chưa phát hành có nút Phát hành mở popup một hoá đơn. Cột Hoá đơn điện tử đổi tên thành Số hoá đơn, chỉ hiện số khi đã phát hành. Nút thanh công cụ đổi chữ thành "Phát hành HĐĐT (n)".
- `src/modules/ban-hang/hddt.tsx`: tách `khachMacDinh`, `thieuKhach`, `ghiHd`, `FormKhach`, khung `Vo` để popup một hoá đơn và hàng loạt dùng chung. `HopXuatHddt` giữ danh sách lúc mở. Còn 1 chứng từ phát hành được thì vào `HopMot` (form như ở chi tiết), từ 2 trở lên vào `HopHangLoat`.
- `HopHangLoat`: bước kiểm tra (ngày hoá đơn chung, bảng người mua, loại, MST/CCCD, ký hiệu theo cửa hàng, tổng tiền, cột Kiểm tra, nút Sửa mở form người mua của dòng đó, bỏ chọn để phát hành sau). Bấm phát hành thì gửi từng hoá đơn, có thanh tiến trình. Gửi xong hiện bảng kết quả từng dòng và nút "Phát hành lại n dòng lỗi".
- Giả lập lỗi: lượt từ 3 hoá đơn trở lên thì hoá đơn cuối bị nhà cung cấp trả lỗi một lần (mỗi lần mở popup), gửi lại thì được. Mục đích là demo được dòng lỗi.
- Cuối `src/styles/app.css`: mục T765.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần 1 báo 2 lỗi ở Quy trình tiền, phiếu thu (phần không sửa); lần 2 dừng vì máy ngủ mất mạng; lần 3 in "Không có lỗi."
- `python tools/kiem_van.py` hai file tsx: không có mục ĐỎ (3 mục VÀNG là đường vẽ SVG có sẵn trong `ChungTuBanHang.tsx`).
- Bấm thử trên server riêng cổng 5185, gói Plus: chọn 3 chứng từ lập tay, bảng kiểm tra đủ thông tin. Sửa xoá địa chỉ thì ô tô đỏ, không lưu được. Phát hành ra 2 thành công, 1 lỗi; phát hành lại thì đủ 3. Đóng popup, danh sách đổi sang Đã phát hành. Nút Phát hành trên một dòng mở form một hoá đơn.

## Dở dang, việc tiếp theo

- Dữ liệu mẫu lập tay hiện đều đủ thông tin người mua, nên chưa thấy sẵn dòng "Thiếu địa chỉ" khi mở. Muốn demo dòng thiếu thì cần chứng từ mẫu bán cho ShopeeFood (danh mục chưa có địa chỉ).
- Trạng thái phát hành chỉ giữ trong phiên (qua `suaPhieu`), tải lại trang là mất, như T763.
- Nút ở chi tiết chứng từ vẫn ghi "Xuất hoá đơn điện tử", chưa đổi chữ cho khớp danh sách.

## Bẫy, quyết định mới

- Không.
