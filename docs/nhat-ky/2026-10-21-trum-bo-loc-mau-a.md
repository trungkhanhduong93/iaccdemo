# Thiết kế bộ lọc Mẫu A, sửa Chi phí phân bổ tụt, spec cho anti (T530–T535)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Nhận việc T530–T535 vào `docs/TIEN-DO.md`, giữ chỗ QD76.
- Dựng artifact 3 mẫu bộ lọc nâng cao và ô chọn nhiều: https://claude.ai/artifact/NmBxDpyhSGcM7CbcXmTmej. Trum chốt Mẫu A.
- T531: `src/ui/generic/CatalogScreen.tsx` thêm `flex: 'none'` cho lớp bọc thanh lọc. Lớp này ăn luật `.voucher-split .voucher-top { flex: 1 }` (`app.css:32825`) nên chia đôi chiều cao với bảng.
- Ghi QD76 theo Mẫu A.
- Đợt 1 giao song song: Anti Windows làm T530, T533, T534; Anti B làm T532. Menu Thêm mới là portal nên CSS phải ăn qua `popClass` `ds-them-pop`.
- Đợt 2 Anti Windows làm T535 theo Mẫu A. Clau thu phạm vi luật `.chc-o.open` về `.chc-chip-mode` để form khác không đổi.
- Gộp với T527, T528, T536–T539 của người khác: `app.css`, `CHANGELOG.md`, hai bảng tiến độ giữ cả hai bên.
- Viết spec cho anti, nằm trong `backup/` (không lên git): `spec-T530-W.md`, `spec-T532-B.md`, `spec-T535-W.md`, kế hoạch `ke-hoach-T530-T535.md`.

## Đã kiểm

- T531, đo bằng Playwright ở 1440x900: đầu bảng từ y=455px lên y=202px, đáy hàng lọc y=158px.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. Chạy lại sau T531, sau đợt 1, và trên bản đã gộp với commit người khác.
- T535, anti đo bằng Playwright 1440x900: ô lọc 220px cả ba trạng thái, hộp hai ngăn 600px chênh cao 0px, Bộ lọc nâng cao 760px lưới 3 cột, 7/7 nút ghim. Ảnh ở `backup/nghiem-thu-T535/`.
- Chưa review chéo bằng anti thứ hai: Clau tự đọc diff từng file.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD76 bộ lọc Mẫu A.
- Lớp bọc trong `.voucher-split` đặt trùng class `voucher-top` sẽ ăn `flex: 1`. Chưa ghi `docs/BAY.md` vì tìm ra dưới 15 phút.
