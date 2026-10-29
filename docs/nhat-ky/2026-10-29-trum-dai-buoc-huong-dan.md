# Hướng dẫn nhanh kiểu dải bước (T679)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Xong

## Đã làm

- Làm bản bấm thử so 5 kiểu hiện hướng dẫn trên màn Sổ quỹ tiền mặt và Thu chi: https://claude.ai/artifact/FuCMVCh9iofH7yD7VxGkeK. Bản thử tự đo cột bảng bị khuất, nút bị che ở màn 1440, 1366, 1280. Trum chốt kiểu C, đổi chữ nút thành Bước trước, Bước kế. Ghi QD87.
- `src/ui/HuongDanNhanh.tsx`: bấm la bàn hiện dải bước thay cho khung. Dải có Bước n/N, chữ bước, nút làm ngay nếu bước có, Bước trước, Bước kế (bước cuối là Xong), Xem đủ hướng dẫn, nút tắt. Esc đóng khung đủ trước rồi tới dải.
- Cùng file: số cam đánh lên chỗ thật của màn. `timCho` tìm theo `data-hd`, không có thì theo khuôn chung `KHUON` (thanh lọc `.ds-toolbar-figma`, nút Thêm mới, bảng, hàng nút lọc nhanh, tab, đầu báo cáo, màn chức năng, Tất cả báo cáo). Vị trí đo lại khi cuộn, đổi cỡ và đều 400ms, chia `heSoZoom()` theo `docs/BAY.md`.
- Khung đủ thành khung nổi dưới dải, không đẩy màn. Bấm một bước trong khung thì khung đóng, dải về đúng bước. Màn có chỗ thật thì bỏ sơ đồ vẽ, không có thì giữ sơ đồ. Đi tiếp chỉ hiện bước trước, đang ở, bước sau.
- `src/styles/app.css`: sửa mục T673, T674 cho khung nổi; mục mới cuối file (T679) cho dải, số cam. Màn chính chừa 52px ở đầu khi có dải.
- Đổi chữ "két" sang "Quỹ tiền" trong `src/modules/tien/huong-dan.ts`, `src/modules/danh-muc/huong-dan.ts`.
- `docs/KIEN-TRUC.md` thêm cách gắn `data-hd`. QD86 ghi dòng trỏ sang QD87. T676 ghi lại phần còn lại.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi." Máy trên mây trỏ `/opt/google/chrome/chrome` sang Chromium có sẵn, cài gói Python `playwright` 1.63.0.
- Script thử riêng (không đưa vào repo), màn 1440: dải nằm sát dưới thanh tab hoặc thanh trên, màn chính co lại vừa khít, không sinh thanh cuộn thừa. Đã thử gói Standard: Thu chi, Sổ quỹ tiền mặt, Quỹ tiền, Tất cả báo cáo, Xuất bán POS, Kiểm kê, Kê khai thuế. Gói Pro: Mua hàng, Sổ quỹ, tab Báo cáo Tổng hợp. Mỗi màn đúng 1 nút la bàn.
- Số cam tìm được ở các màn trên. Báo cáo kết quả kinh doanh 10.2.3 gói Pro và màn Quy trình không có chỗ thật: dải chạy chữ, khung dùng sơ đồ vẽ.
- Bấm thử Bước kế tới Xong, Bước trước, Xem đủ, bấm bước trong khung, Esc hai lần, đổi tab Ngân hàng, sang tab Báo cáo: đúng, không lỗi console.
- `python tools/kiem_van.py` cho file có chữ đã sửa: không có mục ĐỎ.
- Bỏ qua `python tools/xuat_bao_cao_he_thong.py` theo lời Trum dặn: lệnh chỉ chạy được trên máy Trum. File Excel báo cáo chưa làm mới, chạy lại trên máy Trum.

## Dở dang, việc tiếp theo

- T676: bước nằm trong form phiếu (vd Thu chi bước 3) chưa có số cam, dải nằm dưới form toàn màn. Cần gắn `data-hd` trong form, cho dải nổi trên form, thêm bước kiểm chỗ đánh số vào `tools/kiem_tra.py`.
- Chữ "két" còn ở các màn T138 của PhuongXT: `src/modules/home/NhacDonViMoi.tsx`, `src/modules/home/HuongDan.tsx`, `src/modules/onboarding/KhoiTaoFabi.tsx`. Nhờ PhuongXT đổi sang "Quỹ tiền" khi làm tiếp T138.
- Màn dựng riêng khác chưa có chỗ thật thì gắn `data-hd` khi soạn hướng dẫn riêng ở T677.

## Bẫy, quyết định mới

- QD87. Không có bẫy mới.
