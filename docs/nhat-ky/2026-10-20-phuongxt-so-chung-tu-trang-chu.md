# Số chứng từ bấm mở phiếu ở báo cáo, màn mở từ trang chủ (T491)

- Ngày: 20/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Dò lần lượt 15 báo cáo gói Free và các màn mở từ trang chủ (Chi phí NVL, Chi phí hoạt động, Tất cả quỹ, Lịch sử thu chi, KQKD). Các báo cáo dùng `ReportScreen` vẫn bấm số mở phiếu bình thường (T201 còn nguyên).
- Sổ quỹ tiền mặt web (`src/modules/tien/SoQuy.tsx`) vẽ bảng riêng, cột `thu`, `chi` chưa từng gắn liên kết: thêm `SoChungTu` cho hai cột.
- `src/ui/generic/SoChungTu.tsx`: `phieuTheoSo` hiểu số ngắn của sổ quỹ (PT09-001 → loại PT, tháng 2609, thứ tự 1), như điện thoại đang làm trong `MSoBaoCao.tsx`.
- Chi phí hoạt động (`src/modules/home/ChiPhiThang.tsx`): từ T483 danh sách phiếu hiện ngay trong màn nhưng số phiếu là chữ thường, nên mất đường mở phiếu (trước T483 bấm lý do sang danh sách Thu chi, bấm được phiếu). Số phiếu nay là liên kết `/app/tien/2-1-1/<id>`.
- KQKD gói Free (`src/modules/tong-hop/BaoCaoTaiChinh.tsx`): dòng Doanh thu bán hàng dẫn tới Sổ doanh thu 3.2.5, gói Free không có nên hiện "Báo cáo không dùng". Đổi sang Tổng hợp bán hàng `/app/bao-cao/3-2-7`.
- Chi phí NVL (`src/modules/home/ChiPhiNvl.tsx`): tên cửa hàng ở bảng tổng là nút màu liên kết (`ds-link-so nvl-ten-cn`, dòng Cộng giữ chữ thường) cho biết bấm được; bấm lan lên dòng mở chi tiết như cũ. CSS mục T491 cuối `app.css`.
- Chi tiết cửa hàng ở Chi phí NVL: bảng phiếu nhập mua và bảng phiếu tiêu hao (xuất huỷ, điều chỉnh) dùng `ganMoPhieu`, số phiếu bấm mở chứng từ.
- Gói Free ẩn báo cáo Công nợ khách hàng 3.2.9 (`src/modules/ban-hang/index.ts`, giới hạn gói S, PL, PR), PhuongXT chốt 20/10/2026.
- Báo cáo bấm sang báo cáo khác (vd Xuất nhập tồn → Thẻ kho, Tổng hợp nhập kho → Chi tiết nhập kho) có thêm nút "‹ <báo cáo vừa xem>" sau nút "Tất cả báo cáo" (`src/modules/bao-cao/ThanhChon.tsx`). Nút quay lại theo lịch sử nên giữ bộ lọc; mở phiếu rồi quay lại vẫn còn nút; đổi báo cáo bằng ô chọn thì không hiện.

## Đã kiểm

- Trên trình duyệt (gói Free): Sổ quỹ tiền mặt 275 số có liên kết, bấm mở phiếu thu; Chi phí hoạt động bấm lý do, bấm số UNC2610-095 mở phiếu chi ngân hàng; KQKD bấm Doanh thu mở Tổng hợp bán hàng. Chi phí NVL: tên cửa hàng màu xanh, bấm mở chi tiết; phiếu tiêu hao 4/4 có liên kết; cửa hàng đặt tạm cách "phiếu nhập mua" bấm MH2610-0022 mở phiếu mua hàng (đã trả phiên về như cũ). Gói Free không còn Công nợ khách hàng ở Tất cả báo cáo, mở thẳng đường dẫn thì về Xuất bán POS; gói Standard vẫn có. Xuất nhập tồn → Thẻ kho có nút về Xuất nhập tồn, bấm về đúng báo cáo.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này: thiếu `Dự kiến tính năng IACC Cloud.xlsx` (file của máy Trum), nên chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.
- `npm run typecheck`: không lỗi. `npm run build`: xong, không lỗi. `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Chưa kiểm gói Standard, Plus (sổ quỹ dùng chung `SoQuy.tsx` nên cũng có liên kết).

## Dở dang, việc tiếp theo

- Không.
- Sổ quỹ dữ liệu giả đánh số PT09-001 riêng từng cửa hàng nên các cửa hàng cùng thứ tự mở chung một phiếu mẫu. Muốn khớp hẳn thì sổ quỹ phải đọc từ phiếu Thu chi thật như Sổ ngân hàng.
- Thẻ "Giao dịch gần nhất" trong hộp Tất cả quỹ chưa bao giờ bấm được; chưa làm vì không có trong yêu cầu.

## Bẫy, quyết định mới

- Không.
