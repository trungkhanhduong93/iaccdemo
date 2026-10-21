# Ô ngày trên form chứng từ web chọn bằng lịch (T557)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Rà 31 form thêm mới chứng từ trên web (gói Pro và Free): thu chi, ngân hàng, mua hàng, bán hàng, kho, CCDC, thuế, tổng hợp, TSCĐ. Ô Ngày chứng từ (và Thời gian, Thời gian xuất ở phiếu kho có giờ) đều đã dùng `ONgay` từ T464, có nút lịch.
- Ô Hạn thanh toán (mua hàng 4-1-1 đến 4-1-6, bán hàng 3-1-2 đến 3-1-7, khi chọn Công nợ) còn là ô chữ: đổi sang `ONgay` trong `src/ui/generic/ChungTuForm.tsx`. Vẫn gõ tay được dd/mm/yyyy. Form sửa dùng chung ô này.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (máy chủ riêng cổng 5182 qua `KIEM_TRA_URL`): Không có lỗi.
- Script quét mở từng form `/moi`, xem mọi ô có nhãn Ngày, Thời gian, Hạn: sau khi sửa, ô nào sửa được cũng có nút lịch.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
