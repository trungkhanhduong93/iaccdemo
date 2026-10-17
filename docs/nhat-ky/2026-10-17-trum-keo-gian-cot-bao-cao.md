# Kéo giãn cột bảng báo cáo, icon nét hộp Tuỳ chỉnh báo cáo (T350)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/bao-cao/TuyChinhBC.tsx`: icon dạng nét; bỏ ô Rộng (px) ở tab Cột hiển thị.
- `src/ui/Table.tsx`: thêm `BaoCaoDoRongCtx`; bảng lấy cơ chế kéo giãn cột có sẵn (T41) từ context khi nằm trong màn báo cáo; thêm `xong` gọi khi thả chuột để lưu. Bảng ở màn khác không có context nên như cũ.
- `src/ui/generic/ReportScreen.tsx`: cấp context kéo giãn cho bảng báo cáo.
- `src/ui/bao-cao/tuyChinhBC.ts`: `luuRongCotBC` lưu độ rộng cột đã kéo vào tuỳ chỉnh báo cáo (trường `rong` của cột), mở lại vẫn giữ; Về mặc định xoá.
- `src/styles/app.css`: mục cuối T350.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Worker kiểm Playwright: Báo cáo kiểm kê kéo cột giữ qua tải lại trang, Về mặc định trả lại độ rộng gốc, danh sách Chi tiền mặt không đổi, không lỗi console.

## Dở dang, việc tiếp theo

- Bản in, xuất Excel chưa theo độ rộng đã kéo (giữ cách tính cũ).

## Bẫy, quyết định mới

- Không.
