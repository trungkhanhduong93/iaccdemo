# Bỏ cột Mã màn chi phí trả trước (T804)

- Ngày: 12/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ccdc/index.ts`: bỏ cột Mã khỏi danh sách màn Thẻ chi phí phân bổ (8.1.1). Trường `ma` của hàng vẫn giữ, Bảng chi tiết phân bổ chi phí vẫn có cột Mã.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
