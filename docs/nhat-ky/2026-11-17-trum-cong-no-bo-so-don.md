# Báo cáo công nợ bỏ cột Số đơn phát sinh, tiêu đề canh giữa, popup in đậm Đầu kỳ, Cuối kỳ (T876, T877, T878)

- Ngày: 17/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- T876: bỏ cột Số đơn phát sinh khỏi `colsCongNo`, `rowsCongNo`, `rowsCongNoNhom` trong `src/modules/bao-cao/cong-no.tsx`. Màn hình, xem trước in, Excel của 4.2.3 và 3.2.9 cùng đổi.
- T876: thẻ điện thoại công nợ trong `src/ui/mobile/MBaoCaoTongHopMauD.tsx` bỏ dòng Số đơn phát sinh, chân thẻ chỉ còn nút Thanh toán khi còn nợ. Gỡ `tongSl` vì không chỗ nào đọc. File này còn phục vụ 5.2.9, 5.2.3, hai báo cáo đó không đổi.
- T877: tiêu đề cột 2 báo cáo công nợ canh giữa. Cột #, tên, Thanh toán gắn `hd` có class `cn-tieu-de`; CSS mục T877 cuối `app.css` canh giữa mọi `th` của bảng có class đó.
- T878: popup Lịch sử công nợ gắn `rowCls` `cn-dong-dam` cho dòng Đầu kỳ, Cuối kỳ; CSS mục T878 in đậm cả dòng.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Ảnh trong `backup/review-T876/`: 4.2.3, 3.2.9, popup NCC, cửa hàng, khách hàng, Sổ quỹ tiền mặt (tiêu đề không đổi), thẻ điện thoại 390x844.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
