# Phiếu thu, chi mẫu cho phiếu mua, bán đã thanh toán (T586)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `src/modules/tien/tt-mau.ts`: từ phiếu mẫu Mua hàng 4.1.1 và Bán hàng ngoài POS 3.1.7, phiếu nào Đã thanh toán, Thanh toán một phần thì sinh một phiếu thu, chi mẫu bên Thu chi 2.1.1, trỏ về phiếu gốc qua `_thamChieu`, `_thamChieuDi`.
- Đã thanh toán: trả ngay, cùng ngày phiếu, phiếu gốc giữ `_ctTt` và `_httt` tiền mặt (dưới 10 triệu, phiếu chi, thu) hoặc chuyển khoản (từ 10 triệu, uỷ nhiệm chi, báo có).
- Thanh toán một phần: trả sau 2 ngày (không quá 07/10/2026), phiếu gốc giữ `_httt: 'congno'` và `_dsTt` với số tiền 40% làm tròn nghìn, đúng số `soDaTra` tạm tính trước đây, nên cột Đã trả, Còn nợ, TT thanh toán không đổi.
- Số phiếu đánh từ 0001 theo loại, theo tháng (PC2610-0001...), không trùng phiếu mẫu Thu chi có sẵn (từ 0180 trở lên) và số phiếu lập mới (từ 0261).
- `mua-hang/index.ts` 4.1.1, `ban-hang/index.ts` 3.1.7 lấy phiếu qua `rowsMau: () => phieuGocCoTt(...)`. `tien/index.ts` 2.1.1 thêm `phieuTtMau(s)` vào `phieuThem`, chỉ lấy màn có trong gói đang dùng.

## Đã kiểm

- Mở MH2610-0004: dòng Tham chiếu có PC2610-0003, bấm mở phiếu chi 7.155.480, Tham chiếu về MH2610-0004, bấm về được.
- Danh sách Mua hàng tháng 10: cột Tham chiếu có số phiếu chi, uỷ nhiệm chi; TT thanh toán giữ như cũ. Bán hàng 3.1.7: BH2610-0015 Thu một phần có PT2610-0009, mở được.
- Danh sách Thu chi có các phiếu "Chi tiền mua hàng theo MH...", lý do Thanh toán tiền cho nhà cung cấp (không tính vào chi phí hoạt động trang chủ).
- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh` (chạy ở cổng 5186 qua `KIEM_TRA_URL` vì cổng 5180 đang có phiên khác): chạy xong, không lỗi, kiem_tra in "Không có lỗi."
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: máy này thiếu thư mục `Design/Present/tools` mà `tools/xuat_bao_cao_he_thong.py` cần. Lần xuất sau trên máy có thư mục đó sẽ gồm cả T586.
- Chưa kiểm bằng mắt trên điện thoại. Điện thoại lấy phiếu qua `useDongChungTu` như web nên có cùng dữ liệu.

## Dở dang, việc tiếp theo

- Không.
- Các màn mua, bán khác (Hoá đơn mua hàng 4.1.2, Hoá đơn bán hàng 3.1.2, trả lại hàng...) chưa có phiếu thu, chi mẫu. Muốn thì thêm dòng vào `NGUON` trong `tt-mau.ts` và gắn `rowsMau` cho màn đó.
- Phiếu mẫu thêm vào đầu danh sách Thu chi theo `phieuThem`, chưa xếp lẫn với phiếu sinh ngẫu nhiên theo ngày.

## Bẫy, quyết định mới

- Không.
