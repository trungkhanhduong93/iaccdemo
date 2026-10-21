# Sheet thu chi theo khuôn phiếu mua, gói Free Bán hàng chỉ tab Xuất bán POS, Chi phí phân bổ dùng khung danh sách (T621, T622, T583)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code điều phối Antigravity (spec `backup/spec-T621.md`, `backup/spec-T583.md`)
- Trạng thái cuối phiên: Dở dang (T583)

## Đã làm

- T621: `MDtThuChiLap.tsx` sheet Chọn đối tượng, Chọn lý do, Chọn quỹ theo khuôn sheet Chọn nhà cung cấp, Chọn quỹ của phiếu mua.
- T622: `MDsChungTuChuan.tsx` (`HangTabsBanHang`) lọc tab theo `coTrongGoi`, gói Free chỉ còn Xuất bán POS như web.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: xem mục cuối phiên trong commit.
- Chưa mở điện thoại xem bằng mắt.

## Dở dang, việc tiếp theo

- T583: anti đang làm theo `backup/spec-T583.md` (chỉ sửa khúc danh sách `MCcdc.tsx` 116-333, cuối `app.css` mục T583). Phiên sau: `git diff -- src/ui/mobile/MCcdc.tsx`, soát theo spec, chạy typecheck, build, `kiem_tra.py --nhanh`, commit. T436 của dinhlanphuongipacc cùng sửa `MCcdc.tsx` khúc ghi tăng: ai push sau gộp tay.

## Bẫy, quyết định mới

- Không.
