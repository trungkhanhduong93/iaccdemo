# Bỏ nút Tất cả báo cáo, Quy trình chi phí phân bổ gói Free (T515)

- Ngày: 20/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/types.ts`: thêm `QuyTrinhDef.khongLinkBaoCaoKy`.
- `src/ui/generic/QuyTrinhScreen.tsx`: sơ đồ bước theo kỳ (gói Free) không hiện nút Tất cả báo cáo khi có cờ này.
- `src/modules/ccdc/quy-trinh.ts`: bật cờ cho Quy trình chi phí phân bổ; ô Thẻ chi phí phân bổ trong nhóm Chưa chi tiền thành ô nhỏ (`nho`), bỏ mô tả, cỡ bằng Chi tiền mặt.
- `QuyTrinhScreen.tsx`: ô trong nhóm cũng gom hàng nhỏ qua `gomHangNho`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trình duyệt gói Free: màn Quy trình chi phí phân bổ không còn nút Tất cả báo cáo, 5 ô còn đủ; ô Thẻ chi phí phân bổ gọn bằng Chi tiền mặt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
