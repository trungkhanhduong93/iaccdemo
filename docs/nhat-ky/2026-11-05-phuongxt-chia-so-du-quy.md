# Chia số dư quỹ theo cửa hàng (T750)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/ChiaSoDuQuy.tsx` (mới): khối "Số dư theo cửa hàng" ở form Quỹ tiền gói Standard, Plus. Quỹ áp dụng từ 2 cửa hàng thì tổng tự chia đều, tròn nghìn, lẻ dồn cửa hàng chưa sửa cuối. Sửa tay một dòng thì dòng đó giữ, phần còn lại chia cho dòng chưa sửa. Có nút Chia đều lại, dòng Tổng đã chia báo đỏ khi lệch. Quỹ một cửa hàng chỉ hiện một câu.
- `truong-dm.ts`: thêm khối vào 1.12 và `loi: loiChiaSoDu` chặn lưu khi tổng chia không khớp hoặc có cửa hàng bị âm.
- `danh-muc/index.ts`: lưu phần chia (`cn`) và cửa hàng sửa tay (`sua`) cùng số dư quỹ; mở lại thì dòng đã sửa vẫn là đã sửa.
- `session.tsx`, `SoDuBanDau.tsx`: kiểu `soDuQuy` thêm `cn`, `sua`; `datSoDuQuy` nhận thêm phần chia.
- Cuối `app.css`: mục T750.
- Ngoài việc, theo góp ý của PhuongXT giữa phiên: `MCuaHang.tsx` (T749) ẩn nút nổi Đồng bộ FABi khi màn chọn cửa hàng FABi đang mở, để không đè nút Lên sổ. Sửa này để chung với phần T749 chưa commit.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/danh-muc/ChiaSoDuQuy.tsx`: Sạch.
- Mở NH01 trên bản chạy thử gói Plus: gõ 10 triệu cho Lê Lợi thì hai cửa hàng kia chia phần còn lại, tổng khớp; Lưu rồi mở lại vẫn giữ đúng.
- Chưa xem lại trên máy màn điện thoại cho phần ẩn nút Đồng bộ FABi.

## Dở dang, việc tiếp theo

- Biểu đồ số dư quỹ Trang chủ, sổ quỹ lọc theo cửa hàng đang tính từ dữ liệu mẫu, chưa đọc số dư đã lưu, nên phần chia mới nằm ở danh mục. Muốn các màn đó dùng phần chia thì đọc `s.soDuQuy[donVi][mã quỹ].cn`.
- Màn Số dư ban đầu (`SoDuBanDau.tsx`, `MSoDuBanDau.tsx`) lưu lại quỹ thì ghi đè `{ no, co }`, mất phần chia. Gói Standard, Plus không dùng màn đó nên chưa sửa.
- Điện thoại chưa có khối chia.

## Bẫy, quyết định mới

- Không.
