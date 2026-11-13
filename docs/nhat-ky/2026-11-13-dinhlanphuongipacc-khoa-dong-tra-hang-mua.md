# Trả lại hàng mua từ phiếu mua: không thêm hàng, chỉ sửa số lượng (T816)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/BangSua.tsx`: prop `chiDongCo` như `BangHangBan` ở T815. Mã hàng, tên hàng, kho, ĐVT, số lô, hạn dùng, thuế suất, nhóm HHDV chỉ xem; đơn giá, thành tiền, % CK, tiền CK, tiền thuế dùng `OSo` `disabled`; Số lượng có `max = slMax` (`OSo` thêm prop `max` truyền cho `OSoGo`). Ẩn Thêm dòng, Thêm hàng loạt; giữ Xoá dòng, Xoá hết. Cột TK Nợ, TK Có (gói Pro) vẫn sửa được.
- `src/ui/generic/ChungTuForm.tsx`: `moTraHang` của phiếu mua cũng gắn `slMax` = số lượng đã mua, bỏ dòng số lượng 0. `traBan` bật khi lập từ Trả hàng (bán hoặc mua) và khi sửa lại phiếu có `_traTuBan` hoặc `_traTuMua`. Kiểm số lượng khi lưu dùng chung, chữ báo "số lượng đã mua" hoặc "đã bán". Truyền `chiDongCo={traBan}` cho `BangSua`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` 2 file đã sửa: 0 ĐỎ.
- Trình duyệt, gói Plus: MH2610-0022 (3 dòng 12, 29, 21) → Tiện ích, Trả hàng → Thêm trả lại hàng mua chỉ có 3 ô số lượng, không có Thêm dòng, Thêm hàng loạt. Gõ 13 ở dòng 12 bị chặn, gõ 4 nhận; xoá dòng 3, lưu thành TLN2610-0261, Tham chiếu MH2610-0022; MH2610-0022 Tham chiếu TLN2610-0261. Sửa lại TLN2610-0261 vẫn chỉ có ô số lượng.

## Dở dang, việc tiếp theo

- Không.
- Phiếu trả lại hàng mua có `_traTuMua` lập trước T816 không có `slMax`: khi sửa vẫn khoá dòng nhưng không giới hạn số lượng.
- Số lượng tối đa chưa trừ số đã trả ở các phiếu trả lại trước (như T815).

## Bẫy, quyết định mới

- Không.
