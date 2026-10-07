# Giao diện bám cấu trúc DB iPOS (T17, T18)

- Ngày: 07/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code (2 worker)
- Trạng thái cuối phiên: Xong

## Đã làm

- Đọc schema DB TRUNGDEMO (bản iPOS mẫu, SQL Server 2016 Express): 197 bảng, 75 view, 5.180 cột. So với iaccdemo, tìm ra các trường DB có mà giao diện chưa có ô nhập.
- T17, `src/ui/generic/BangSua.tsx`: dòng chứng từ dòng tiền có thêm cột Đối tượng, Khoản mục, Công việc (theo `VOUCHER_DETAIL`). Phiếu nhóm mua có thêm Số lô, Hạn dùng (theo `PURCHASE_DETAIL.LOT_NO`, `USE_DATE`). Dòng tổng cộng sửa colSpan cho đúng cột ở mọi tổ hợp, trước đây lệch khi có ĐVT hoặc dòng tiền.
- T17, `src/ui/generic/gen.ts`: thêm trường `dt`, `km`, `cv`, `lo`, `hsd` vào `Dong`. Giá trị giả sinh bằng bộ sinh riêng `rng(id + '-ct')`, không đụng chuỗi số cũ nên số tiền mọi chứng từ giữ nguyên.
- T17, `src/data/mock.ts`: thêm `KHOAN_MUC`, `CONG_VIEC`, chép từ danh mục 1.6, 1.7.
- T17, `src/ui/generic/ChungTuForm.tsx`: truyền `coLo` cho nhóm mua.
- T18, `src/modules/danh-muc/index.ts`: kho 1.8 có TK kho, TK giá vốn, TK chi phí (gói có tài khoản). Đối tượng 1.5 có Điều khoản thanh toán, TK công nợ. Bút toán tự động 1.15 tách mỗi dòng định khoản một hàng, có Loại chứng từ, Lọc theo, Số tiền lấy từ (theo `DM_POSTING`, `DM_POSTING_DETAIL`). Bỏ mã BT04, gộp vào dòng thuế của BT01 đến BT03.
- T18, `src/modules/tong-hop/index.ts`: số dư ban đầu 10.1.3 có cột Loại, Chi tiết, Số lượng; thêm hàng chi tiết công nợ 131, 331 và tồn kho 152, tổng chi tiết luôn bằng số dư TK lấy từ `soCai(8).mo`.
- Thêm việc T19 (khoá sổ theo đơn vị), T20 (cột trạng thái duyệt), ghi chú trạng thái hoá đơn điện tử vào T05.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, chỉ còn cảnh báo gói JS hơn 500 kB đã có từ trước (T13).
- `python tools/kiem_tra.py --nhanh`: 207 lượt mở màn, "Không có lỗi."
- `python tools/kiem_van.py` cho 3 file có chữ giao diện: sạch.
- Chưa xem bằng mắt form phiếu thu chi và phiếu mua ở các gói Free, Starter, Advance. Bộ kiểm chỉ chạy gói Medium.

## Dở dang, việc tiếp theo

- Không. Còn chờ Trum xác nhận backend IACC Cloud (T06) có dựa trên schema iPOS không. Nếu không thì T17, T18 chỉ là gợi ý bố cục.
- Cột Đối tượng trên dòng phiếu thu chi đang để trống ở dữ liệu giả, chỉ chọn được khi sửa.

## Bẫy, quyết định mới

- `dongCua` trong `gen.ts` dùng một bộ sinh hạt giống cho cả chứng từ. Gọi thêm `r()` sẽ làm lệch số tiền mọi chứng từ và mọi báo cáo. Muốn thêm trường ngẫu nhiên thì tạo bộ sinh riêng.
- Trong DB iPOS, `PR_KEY` (kiểu money) trùng giữa `VOUCHER`, `SALE`, `PURCHASE`. Nối `LEDGER` về chứng từ gốc phải chọn bảng theo `SYS_TRAN.TRAN_CLASS` trước. Cần biết khi làm T06.
- `DM_PR_DETAIL` có 6 loại đối tượng mã 00 đến 05, nghĩa chưa rõ. Giao diện vẫn giữ 3 loại.
