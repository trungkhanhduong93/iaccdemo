# Khoảng cách ô Quỹ phiếu thu chi điện thoại (T631)

- Ngày: 22/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Màn lập phiếu thu chi điện thoại (`MDtThuChiLap.tsx`): hàng Ngày chứng từ, Số phiếu (`.m-tc-lap-hang-2col`) không có khoảng cách dưới nên ô Quỹ dính sát 0px. Thêm `margin-bottom: 12px` ở mục T631 cuối `src/styles/app.css`, bằng khoảng giữa các ô khác trong thẻ.
- Người dùng duyệt trước trên Artifact so sánh trước/sau.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
