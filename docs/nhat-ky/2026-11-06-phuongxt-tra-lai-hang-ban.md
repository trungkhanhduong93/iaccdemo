# Phiếu hàng bán trả lại chỉ còn số lượng, đơn giá, thành tiền (T758)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: phiếu 3.1.4 có đủ cột như phiếu bán hàng. Mặc định chỉ hiện Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá, Thành tiền.
- Các cột khác (Kho, Số lô, Hạn dùng, % CK, Tiền CK, Thuế suất, Tiền thuế, Giảm thuế GTGT...) ẩn sẵn qua `anMacDinh`. Muốn hiện thì bật ở Tuỳ chỉnh giao diện phiếu.
- Máy đã lưu tuỳ chỉnh cột cho màn này (`iacc-cot-phieu:...` trong localStorage) thì giữ tuỳ chỉnh đó, không áp mặc định.
- Lần sửa đầu ép bỏ hẳn cột, tính thuế, chiết khấu bằng 0 và chuyển kho lên đầu phiếu. PhuongXT đổi ý trong phiên nên đã trả các phần đó về như cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- Chưa mở trình duyệt xem bằng mắt: cửa sổ trình duyệt trong app không vẽ được lúc chạy.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
