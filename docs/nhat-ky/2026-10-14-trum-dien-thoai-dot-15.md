# Điện thoại đợt 15, 16: làm theo tư vấn thiết kế (T223)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối và kiểm, Antigravity Windows (Anti A), Antigravity WSL (Anti B) code
- Trạng thái cuối phiên: T223 Xong

## Đã làm

Trum duyệt toàn bộ `docs/tu-van-thiet-ke-dien-thoai.md` (bảng mục 1, 8 điểm mục 2).

- Dữ liệu giả: dòng thu chi (`src/ui/generic/gen.ts`, `dongCua`) có `tkNo`, `tkCo`, `ly`. Lý do đoán từ diễn giải đã bỏ dấu (`fold`), tài khoản đối ứng lấy theo lý do trong bảng `TK_LY_DO`. Danh mục lý do `LY_DO` chưa có cột tài khoản nên bảng này nằm trong `gen.ts`. Phiếu chờ phân bổ PC2610-0261 ghi Nợ 242, Có 1111.
- `src/ui/generic/ChungTuForm.tsx`: tách phần tính bút toán của `HachToan` thành `layButToan` (export), hành vi bản máy tính giữ nguyên.
- `src/ui/mobile/MXemPhieu.tsx`: đầu phiếu có số tiền lớn có dấu theo chiều tiền. Đầu phiếu thêm quỹ, lý do, người giao dịch, mẫu số, ký hiệu, số, ngày hoá đơn, tình trạng thanh toán, mã số thuế (khi có đối tượng), hạn thanh toán (ẩn ở gói Free, Standard). Có thêm nhãn kho xuất, kho nhập, tham chiếu thẻ chi phí. Khối Hạch toán mở sẵn, mỗi bút toán một dòng có tên tài khoản. Dòng hàng, dòng diễn giải, dòng kiểm kê gọn còn 2 hàng: hoá đơn 5 mặt hàng cao 314px, trước khoảng 1.050px. Phiếu đã ghi sổ: nút chính In, Bỏ ghi sổ là nút viền đỏ, hỏi lại bằng `HopXacNhan`.
- `src/ui/mobile/MChungTu.tsx`, `MDanhSach.tsx`: thẻ phiếu thành dòng 2 hàng, nhóm theo ngày có tổng ngày. Danh sách có cả thu và chi thì có 3 ô Tổng thu, Tổng chi, Chênh lệch. Chip tình trạng thanh toán ở hoá đơn bán, mua. Thẻ Chuyển kho, Kiểm kê không hiện số tiền. `MDanhSach` thêm prop tuỳ chọn `nhomTheo`, `tieuDeNhom`; `MDanhMuc`, `MChiNhanh` không đổi.
- `src/ui/mobile/chieuTien.ts` (mới): chiều tiền của chứng từ (vào, ra, không có), dấu và lớp màu `m-tien-vao`, `m-tien-ra`.
- `src/ui/mobile/MSoBaoCao.tsx`: Sổ quỹ 2.2.1, sổ tiền gửi 2.2.3 có chip Dạng dòng / Bảng, mặc định Dạng dòng: thẻ Tồn đầu, Thu / Chi, Tồn cuối, nhóm theo ngày có tồn cuối ngày. 2.2.5 Sổ công nợ có sẵn chỗ nhưng chưa có mẫu.
- `src/ui/format.ts`: thêm `rutGonSo` (122,5 tr, 1,7 tỷ).
- `src/ui/mobile/MobileShell.tsx`: xem phiếu, sửa phiếu, xem báo cáo (màn cấp 2) không có thanh tab, lớp `m-cap-2` đặt `--m-thanh-duoi: 0px`. Chip chi nhánh chỉ hiện ở danh sách và báo cáo.
- `tools/kiem_tra.py`: bước kiểm cũ đổi bộ chọn thẻ phiếu `.m-the-ct` sang `.m-ds-ngay-dong`, số phiếu đọc ở `.m-ds-ngay-so`; bước kiểm sổ quỹ, sổ ngân hàng đợt 7, 10 bấm chip Bảng trước. Thêm `kiem_tra_dot_15_a`, `kiem_tra_dot_15_b`, `kiem_tra_dot_16_a`, `kiem_tra_dot_16_b`, gọi trong `--dien-thoai`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` và `--dien-thoai` (cổng 5181): đều in `Không có lỗi.`
- Sổ quỹ, sổ tiền gửi dạng dòng: Tồn đầu, tổng thu, tổng chi, Tồn cuối khớp từng đồng với kiểu bảng (2.2.1: 122.545.000, 1.021.150.000, 1.102.808.000, 40.887.000).
- Bản máy tính bật Cột tài khoản ở PC2610-0250, PT2610-0258, BC2610-0260, UNC2610-0259, PC2610-0261: ra 141, 131, 331, 242, không còn "—".
- Chi tiết bán hàng 3.2.8 đo riêng 3 lần: 1.329 đến 1.542 ms, như trước đợt này. Lần đo 6.878 ms trong `--dien-thoai` rơi vào lúc Vite dịch lại file vừa sửa.
- Xem ảnh `tools/shots/m-15-*.png`, `m-16-*.png`: số tiền có dấu, màu đúng chiều; hạch toán có tên tài khoản; không tràn ngang.

## Dở dang, việc tiếp theo

- 3.2.9 Công nợ khách hàng, 4.2.3 Công nợ nhà cung cấp là bảng tổng hợp theo đối tượng, giữ kiểu bảng. Sổ chi tiết công nợ dạng dòng chờ 2.2.5 có mẫu.
- Cột Lý do ở dòng chi tiết bản máy tính vẫn đọc lý do của cả phiếu. Lý do này có thể khác lý do đoán cho từng dòng (vd dòng "Thu nợ khách hàng" ghi TK 131 nhưng cột Lý do ghi "Thu khác").
- T229 (Báo cáo kết quả kinh doanh 10.2.3 ra "Báo cáo chưa có mẫu") vẫn chờ.
- Chưa thử trên điện thoại thật.

## Bẫy, quyết định mới

- Anti A hết quota giữa việc rồi thoát; đổi sang tài khoản C phải tắt mọi agy đang chạy, kể cả của phiên khác, nên phần còn lại giao Anti B.
- Đoán chữ tiếng Việt bằng `toLowerCase()` không khớp từ khoá không dấu ("trả nợ" khác "tra no"). Dùng `fold`.
- Thêm tài khoản vào `TEN_TK` của `so-cai.ts` làm màn Số dư ban đầu có thêm dòng, vì màn đó duyệt mọi khoá của `TEN_TK`. Tên tài khoản thiếu thì lấy từ `TAI_KHOAN` của danh mục.
- Màu `m-tien-vao`, `m-tien-ra` phải có tiền tố `.m-app`: luật màu chữ của thẻ tổng, đầu phiếu viết sau trong `app.css` đè mất màu.
