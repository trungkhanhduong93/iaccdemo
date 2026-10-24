# Bảng chọn kho kiểm kê điện thoại không bung cả màn (T659)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLapPhieuKho.tsx`: bảng Chọn kho kiểm kê bỏ chế độ Áp dụng (bung cả màn hình), thành bảng trượt từ dưới lên, chạm là chọn, cùng kiểu Chọn kho nhận phiếu mua (T656). Các phiếu kho khác giữ nguyên.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Khổ 375px, gói S: Lập phiếu kiểm kê, chọn Phố Mây Thảo Điền, bấm Kho kiểm kê ra bảng thấp, có ô tìm, tích kho đang chọn. Bảng cao 80% màn như mọi bảng có ô tìm (T556). Chưa xem trên điện thoại thật.

## Dở dang, việc tiếp theo

- Không. `MLapPhieuKho.tsx` nằm trong danh sách file của T552 (Trum), việc này chỉ sửa một dòng.

## Bẫy, quyết định mới

- Không.
