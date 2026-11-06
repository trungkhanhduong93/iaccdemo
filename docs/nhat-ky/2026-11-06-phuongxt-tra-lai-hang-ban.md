# Phiếu hàng bán trả lại chỉ còn số lượng, đơn giá, thành tiền (T758)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/index.ts`: phiếu 3.1.4 bật `dongPos`, dùng bảng `BangHangBan` như màn Bán hàng. Bảng có giảm giá, chiết khấu, phí dịch vụ, thuế suất hoặc giảm thuế GTGT.
- `src/modules/ban-hang/BangHangBan.tsx`: bảng dựng theo danh sách cột `COT_BHB`, nhận `an` để ẩn cột. Thêm cột Phí vận chuyển (`phiVc` trong `Dong`, `gen.ts`).
- `src/ui/generic/ChungTuForm.tsx`: Tuỳ chỉnh giao diện của phiếu `dongPos` liệt kê cột `COT_BHB`. Phí vận chuyển cộng vào tổng thanh toán và hiện ở dải đáy.
- Mặc định (`anMacDinh`): phiếu trả lại chỉ hiện Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá, Thành tiền. Phiếu Bán hàng gói Plus ẩn sẵn Phí vận chuyển như Xuất bán POS.
- Phiếu trả lại bỏ hẳn cột Phí vận chuyển (`boCotBan`), kể cả trong Tuỳ chỉnh giao diện, theo ý PhuongXT.
- Dải tổng đáy form của phiếu `dongPos` (Bán hàng thêm tay gói Plus, hàng bán trả lại) đổi sang dải phép tính như chi tiết Xuất bán POS (`PhepTinhBan`, CSS mục T758 cuối `app.css`).
- Dải phép tính chỉ hiện mục có cột đang hiện trên bảng hàng. Tiền hàng, Tổng thanh toán luôn hiện.
- Máy đã lưu tuỳ chỉnh cột cho màn (`iacc-cot-phieu:...` trong localStorage) thì giữ tuỳ chỉnh đó.
- Hai lần sửa đầu trong phiên dùng bảng `BangSua` nên thiếu giảm giá, phí dịch vụ. PhuongXT chỉ ra nên đã đổi sang `BangHangBan`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- Đọc bảng trên trình duyệt: phiếu mới chỉ có 6 cột. Tuỳ chỉnh giao diện liệt kê đủ cột như Bán hàng, bật Phí vận chuyển thì cột hiện ra.

## Dở dang, việc tiếp theo

- Ẩn cột thuế mà phiếu vẫn có tiền thuế thì dải ghi Tiền hàng 65.000 = Tổng thanh toán 64.610, nhìn như lệch. PhuongXT chưa chốt có cần xử lý không.

## Bẫy, quyết định mới

- Không.
