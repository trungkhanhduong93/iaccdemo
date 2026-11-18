# Số tổng Hàng bán trả lại lấy từ dòng chi tiết của chính phiếu (T885)

- Ngày: 15/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Nguyên nhân lệch: đơn vị GTGT theo % doanh thu (Phố Mây), danh sách tính giảm thuế trên cả tiền hàng (`giamThueHkd`), form web tính theo từng dòng (`giamThueHang`), điện thoại cộng VAT của dòng mẫu.
- `VoucherScreen.tsx`: thêm `giamThueTheoDong`; `useDongChungTu` với Hàng bán trả lại (3.1.4) tính Giảm thuế GTGT và Tổng tiền từ dòng chi tiết (`_dong` hoặc dòng mẫu `dongCua` cùng mã phiếu). Màn khác giữ cách cũ.
- `MXemPhieu.tsx`: xem Hàng bán trả lại khi GTGT theo % doanh thu bỏ VAT ở dòng, khối Tổng cộng có Giảm thuế GTGT, Tổng tiền tính như web.
- `MLapPhieu.tsx`: lập Hàng bán trả lại đã bỏ VAT, trừ Giảm trừ thuế ở chân phiếu từ T855 (phiên khác). Phiên này thêm dòng "Giảm thuế" chỉ xem ở từng mặt hàng (prop `giamThue` của `TheHangMua`), Tổng tiền dòng đã trừ; áp cho cả lập Bán hàng.
- Giảm thuế GTGT hiện ở từng dòng như xem Bán hàng (xem: dòng "Giảm thuế GTGT"; lập: dòng "Giảm thuế" chỉ xem, prop `giamThue` của `TheHangMua`), Tổng tiền từng dòng đã trừ nên cộng các dòng khớp tổng ở trên.
- Đơn vị khấu trừ thuế không đổi: vẫn Tiền thuế như phiếu mua (T884).

## Đã kiểm

- TL2610-0259 (Phố Mây): danh sách web, danh sách điện thoại, form web, xem điện thoại (thẻ đầu, khung Đã trả, khối Tổng cộng) đều 8.938.394 đ, Giảm thuế GTGT 48.606.
- TL2610-0259 xem điện thoại: Tổng tiền 4 dòng 766.464 + 374.000 + 4.587.310 + 3.210.620 = 8.938.394.
- Trả lại từ BH2610-0009 trên điện thoại: form lập, màn lưu thành công, xem chi tiết đều 2.186.800 đ (2.200.000 trừ 13.200).
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.
- Các chứng từ bán khác (Bán hàng, Hoá đơn bán hàng) ở danh sách vẫn tính giảm thuế trên cả tiền hàng, có thể lệch vài nghìn với form web tính theo dòng. Cần thì làm việc riêng, kiểm cả báo cáo dùng số danh sách.

## Bẫy, quyết định mới

- Làm trên máy với mã T854, T855 nhưng phiên khác đã push hai mã này trước, nên đổi sang T856, T857 rồi làm lại; lúc push Trum vừa nhận T856-T862 rồi T865-T883 nên đổi tiếp sang T884, T885. Mã chỉ giữ được khi push commit nhận việc ngay. Phiên này làm lại trên bản mới (giữ phần `MLapPhieu.tsx` của phiên kia).
