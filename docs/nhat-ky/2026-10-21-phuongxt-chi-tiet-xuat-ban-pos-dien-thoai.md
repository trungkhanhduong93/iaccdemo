# Chi tiết phiếu Xuất bán POS điện thoại theo mẫu B (T573)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Dựng 3 mẫu trên Artifact (https://claude.ai/artifact/Lht5nvehSEX8ChwPLxptNU), PhuongXT chọn mẫu B (biên lai) rồi chỉnh qua nhiều lượt.
- `src/ui/mobile/MXuatBanPos.tsx`: bỏ 3 tab Mặt hàng, Thanh toán, Hạch toán và khối tổng bung ở chân. Thanh đầu ghi "Xuất bán POS" kèm số hoá đơn FABi.
- Thẻ Thông tin đơn: chip trạng thái (gói Free ghi "Đã đồng bộ") và FABi; Kho xuất, Khách hàng, PTTT, Thời gian xuất, Cửa hàng, Kênh bán hàng, Ghi chú. Bỏ Ngày chứng từ và dòng Số hoá đơn FABi vì đã có trên thanh đầu.
- Danh sách hàng hoá: tiêu đề có số món, ô tìm theo tên, mã; mỗi món 2 dòng (tên, thành tiền; mã · SL ĐVT × đơn giá). VAT % chỉ hiện khi thuế khấu trừ; theo % doanh thu không hiện thuế, giảm thuế trên dòng.
- Thẻ biên lai cuối: Tiền hàng (số món, tổng SL), Giảm giá chiết khấu, Phí dịch vụ, Phí vận chuyển, Doanh thu trước thuế, Tiền thuế GTGT (khấu trừ) hoặc Giảm thuế GTGT (theo % doanh thu), Phiếu giảm giá, Tổng tiền.
- `src/styles/app.css`: mục mới cuối file "Điện thoại: chi tiết phiếu Xuất bán POS theo mẫu B biên lai, bỏ tab (T573)".
- Ghi việc mới T574 (dữ liệu giả SL × đơn giá lệch thành tiền), T575 (nút In phiếu trên điện thoại).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` với `KIEM_TRA_URL=http://localhost:5181/` (cổng 5180 đang có bản dev của phiên khác): "Không có lỗi."
- `python tools/kiem_van.py src/ui/mobile/MXuatBanPos.tsx`: sạch.
- Mở thử ở cỡ 375px: Phố Mây (khấu trừ) hiện VAT 8% trên dòng, Tiền thuế GTGT ở chân; Góc Nhỏ (gói Free, theo % doanh thu) không hiện thuế trên dòng, chân có Giảm thuế GTGT, trạng thái "Đã đồng bộ".

## Dở dang, việc tiếp theo

- Không. Nút In phiếu chưa làm vì điện thoại chưa có hộp in chứng từ, để ở T575.

## Bẫy, quyết định mới

- Không.
