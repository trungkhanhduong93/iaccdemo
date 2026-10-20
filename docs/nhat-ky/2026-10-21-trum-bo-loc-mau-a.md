# Thiết kế bộ lọc Mẫu A, sửa Chi phí phân bổ tụt, spec cho anti (T530–T535)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Nhận việc T530–T535 vào `docs/TIEN-DO.md`, giữ chỗ QD76.
- Dựng artifact 3 mẫu bộ lọc nâng cao và ô chọn nhiều: https://claude.ai/artifact/NmBxDpyhSGcM7CbcXmTmej. Trum chốt Mẫu A.
- T531: `src/ui/generic/CatalogScreen.tsx` thêm `flex: 'none'` cho lớp bọc thanh lọc. Lớp này ăn luật `.voucher-split .voucher-top { flex: 1 }` (`app.css:32825`) nên chia đôi chiều cao với bảng.
- Ghi QD76 theo Mẫu A.
- Viết spec cho anti, nằm trong `backup/` (không lên git): `spec-T530-W.md`, `spec-T532-B.md`, `spec-T535-W.md`, kế hoạch `ke-hoach-T530-T535.md`.

## Đã kiểm

- T531, đo bằng Playwright ở 1440x900: đầu bảng từ y=455px lên y=202px, đáy hàng lọc y=158px.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Chưa giao anti. Trum gõ "giao anti" thì làm theo `backup/ke-hoach-T530-T535.md`.
- Đợt 1 song song: Windows làm `spec-T530-W.md` (T530, T533, T534), Anti B làm `spec-T532-B.md` (T532). Commit xong mới giao đợt 2 `spec-T535-W.md` (T535), vì cùng sửa `app.css`.
- Máy khác không có `backup/`: spec chỉ nằm trên máy Trum.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD76 bộ lọc Mẫu A.
- Lớp bọc trong `.voucher-split` đặt trùng class `voucher-top` sẽ ăn `flex: 1`. Chưa ghi `docs/BAY.md` vì tìm ra dưới 15 phút.
