# Phiếu hàng bán trả lại chỉ còn số lượng, đơn giá, thành tiền (T758)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: thêm `laTlBan` (màn 3.1.4). Bảng chi tiết bỏ cột Kho, Số lô, Hạn dùng. Bỏ cả % CK, Tiền CK, Tiền trước thuế, Thuế suất, Tiền thuế, Giảm thuế GTGT, Giá trị nhập kho, Tổng tiền, chỉ còn Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá, Thành tiền. Tuỳ chỉnh cột phiếu cũng bỏ các cột này.
- Tổng chiết khấu, tiền thuế của phiếu trả lại tính bằng 0, không tính Giảm thuế GTGT. Dải đáy form chỉ còn Tổng tiền như phiếu trả lại hàng mua (T727).
- Kho nhập chọn ở đầu phiếu ở mọi gói, kể cả gói Pro (trước đây gói Pro chọn kho trên từng dòng).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- Chưa mở trình duyệt xem bằng mắt: cửa sổ trình duyệt trong app không vẽ được lúc chạy.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
