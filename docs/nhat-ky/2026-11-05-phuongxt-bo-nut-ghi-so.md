# Bỏ nút Ghi sổ ở chân form chứng từ (T746)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: xoá nút Ghi sổ, Bỏ ghi sổ ở thanh chân form khi xem phiếu (cạnh Tiện ích, In phiếu). Áp cho mọi phiếu dùng form chung. Cờ `coGhiSo` vẫn giữ vì còn dùng cho trạng thái phiếu mới lưu và chặn xoá phiếu đã ghi sổ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Phiếu đã ghi sổ vẫn bị chặn xoá với câu "bỏ ghi sổ rồi mới xoá", mà web giờ không còn nút Bỏ ghi sổ. Cần Trum chốt có bỏ luôn câu chặn này không.
- Điện thoại chưa xem.

## Bẫy, quyết định mới

- Không.
