# Xem Hàng bán trả lại điện thoại có tổng hợp cuối phiếu như phiếu mua (T856)

- Ngày: 15/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MXemPhieu.tsx`: màn xem Hàng bán trả lại bỏ danh sách chi tiết rút gọn, dùng `renderDsHangHoaMua()` như xem phiếu mua. Mỗi mặt hàng có Số lượng, Đơn giá, VAT, Tổng tiền; cuối phiếu có khối Tổng cộng: Thành tiền, Tiền chiết khấu (khi có), Tiền thuế, Tổng tiền.
- Người dùng chốt giữ VAT như phiếu mua, dù web Hàng bán trả lại của Phố Mây không có VAT.

## Đã kiểm

- Trình duyệt 375x812: TL2610-0259 hiện đủ khối Tổng cộng (Thành tiền 8.987.000, Tiền thuế 726.440, Tổng tiền 9.713.440).
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.
- Phiếu mẫu lệch số: thẻ đầu và danh sách lấy `row.tong` ghi sẵn (TL2610-0259: 8.933.078), khối Tổng cộng cộng từ dòng mặt hàng mẫu có VAT (9.713.440), web không VAT (Tổng thanh toán 8.938.394). Phiếu lập từ điện thoại không lệch. Cần thì làm việc riêng cho dữ liệu mẫu.
- `MXemPhieu.tsx` Trum đang giữ ở T497.

## Bẫy, quyết định mới

- Không.
