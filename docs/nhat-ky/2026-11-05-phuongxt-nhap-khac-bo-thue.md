# Danh sách Nhập khác bỏ cột Tiền thuế (T739)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/VoucherScreen.tsx`: cột Tiền thuế không còn ở danh sách Phiếu nhập khác (thêm `!laNk` vào điều kiện cột). Các màn khác giữ nguyên.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở danh sách Nhập khác gói Plus trên máy: tiêu đề cột còn #, Ngày, Số chứng từ, Diễn giải, Tham chiếu, Ngày tạo, Người tạo, Nguồn, Tổng tiền.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
