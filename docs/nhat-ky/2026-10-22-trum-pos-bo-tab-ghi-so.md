# Bỏ tab Ghi sổ ở chi tiết Xuất bán POS (T640)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: thanh tab chi tiết Xuất bán POS chỉ còn Hàng bán. Chế độ nợ có vẫn giữ tab Hạch toán.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
