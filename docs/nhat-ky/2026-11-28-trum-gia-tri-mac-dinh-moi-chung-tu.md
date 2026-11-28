# Giá trị mặc định cho mọi chứng từ gói Pro (T962)

- Ngày: 28/11/2026
- Người: Trum, agent: Claude Code điều phối và soát, Antigravity (3 worker) viết code và kiểm
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/giaTriMacDinh.ts`: thêm 28 mã màn vào `TRUONG_MAC_DINH` và `O_BAN_DAU`: Tiền 2.1.1 tách riêng từng loại (`2.1.1:thu`, `:chi`, `:bc`, `:unc`, `:cq`), Mua 4.1.2 tới 4.1.6, Bán 3.1.1, 3.1.7, 3.1.2, 3.1.3, 3.1.4, Kho 5.1.1, 5.1.2-2/3/4, 5.1.6, 5.1.3, 5.1.4, 5.1.10, 5.1.11 và 4 màn chỉ có slug (`5-1-4-2`, `5-1-4-3`, `5-1-6-2`, `5-1-3-2`). Thêm cờ `theoCn` cho ô có danh sách đổi theo cửa hàng, hàm `maMacDinh(code, loaiK)`.
- `src/ui/generic/HopGiaTriMacDinh.tsx`: chép sang cửa hàng khác áp quy tắc chung: giá trị có trong danh sách của cửa hàng nhận thì giữ, ô `theoCn` (kho, kho nhận, từ quỹ, đến quỹ) đổi theo vị trí, còn lại bỏ ô (vd Cửa hàng nhận chép sang chính cửa hàng đó).
- `src/ui/generic/ChungTuForm.tsx`: bỏ phần tự điền viết cứng của 4.1.1, thay bằng `locMacDinhDau` nối khoá ô sang trường phiếu (ncc, kh, dt → đối tượng; kho, khoNhan, cnNhan, httt, dienGiai, nguoiGiao, nv, ly, tknh → quỹ, tuQuy, denQuy). Giá trị chỉ điền khi nằm trong danh sách chọn của phiếu. `apMacDinhCn` dùng chung hàm này. Mã tra là `sc.code || sc.slug` kèm loại phiếu.
- `src/modules/ban-hang/BangHangBan.tsx`: prop `tsMacDinh` cho dòng mới khi hàng chưa có thuế suất.
- Không làm: Thuế 6.x, TSCĐ, CCDC, Tổng hợp, 2.1.2, Xuất/Nhập điều chỉnh (sinh từ kiểm kê, không có nút Thêm), điện thoại. Nhập điều chuyển, nhập sơ chế, nhập chế biến chỉ có Diễn giải, Người giao vì kho theo phiếu tham chiếu (Trum chốt).
- Bán hàng không có ô Kho ở dòng: Pro dùng kho đầu phiếu, kho đầu phiếu tự áp xuống dòng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `giaTriMacDinh.ts`, `HopGiaTriMacDinh.tsx`: Sạch.
- Worker chạy Playwright 14 ca, gói Pro KTT, tất cả Đạt, 0 pageerror: Phiếu thu (Phiếu chi không bị điền theo), Chuyển quỹ, 4.1.4, 3.1.2, 5.1.2-3, 5-1-4-3, 5-1-4-2, 4.1.1 như T955, phiếu cũ, sao chép, cửa hàng chưa đặt, chép 5.1.4 sang cửa hàng khác (kho đổi, Cửa hàng nhận bị bỏ), màn Tất cả cửa hàng, gói Standard không có nút, KTV chỉ xem.
- Chưa kiểm: thuế suất dòng bán hàng tự điền (hàng mẫu đều có sẵn thuế suất), kho dòng 4.1.1, 4.1.4 (cột Kho dòng đang ẩn mặc định).

## Dở dang, việc tiếp theo

- Không. Thêm màn khác: thêm mục vào `TRUONG_MAC_DINH` với khoá có sẵn; khoá mới phải nối thêm ở `locMacDinhDau` trong `ChungTuForm.tsx`.

## Bẫy, quyết định mới

- Không ghi QD mới. Trum chốt trong phiên: Tiền đặt riêng từng loại phiếu, chỉ bản web, bỏ điều chỉnh kho.
