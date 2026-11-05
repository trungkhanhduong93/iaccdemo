# Chia số dư quỹ theo cửa hàng (T750)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/ChiaSoDuQuy.tsx` (mới): hàm chia số dư. Quỹ áp dụng từ 2 cửa hàng thì tổng tự chia đều, tròn nghìn, lẻ dồn cửa hàng chưa sửa cuối. Sửa tay một cửa hàng thì cửa hàng đó giữ, phần còn lại chia cho cửa hàng chưa sửa.
- Bố cục theo cách B PhuongXT chọn: bản đầu là một khối bảng riêng, form dài nên bỏ. Gói Standard, Plus đổi khối "Phương thức thanh toán từ FABi" thành "Theo cửa hàng" (`QuyPttt.tsx`): đầu mỗi nhóm cửa hàng có ô Số dư. Gói Pro giữ khối cũ.
- Logic cuối theo PhuongXT: gõ ô tổng (hoặc đổi cửa hàng áp dụng) thì chia đều lại; gõ ô một cửa hàng thì giữ số mọi cửa hàng, ô tổng tự cộng lại. Làm bằng hook `doi` của 1.12 vì form chỉ nhận một lần `doi` mỗi lần gõ. Bỏ dòng tổng, nút Chia đều lại, nhãn "đã sửa". Câu hướng dẫn tách 2 dòng: Số dư, Phương thức thanh toán.
- Gọn form theo góp ý PhuongXT: ô Tên quỹ bỏ `caHang`, Thông tin chung còn 2 hàng (Mã, Tên, Loại / Số tài khoản, Cửa hàng áp dụng, Số dư ban đầu). Chữ "2/4 phương thức" xuống dưới tên cửa hàng (`.qp-cn-ten`, mọi gói).
- `truong-dm.ts`: tách khối theo gói ở 1.12 và `loi: loiChiaSoDu` chặn lưu khi có cửa hàng bị âm (giờ tổng luôn khớp).
- `danh-muc/index.ts`: lưu phần chia (`cn`) và cửa hàng sửa tay (`sua`) cùng số dư quỹ; mở lại thì dòng đã sửa vẫn là đã sửa.
- `session.tsx`, `SoDuBanDau.tsx`: kiểu `soDuQuy` thêm `cn`, `sua`; `datSoDuQuy` nhận thêm phần chia.
- Cuối `app.css`: mục T750.
- Ngoài việc, theo góp ý của PhuongXT giữa phiên: `MCuaHang.tsx` (T749) ẩn nút nổi Đồng bộ FABi khi màn chọn cửa hàng FABi đang mở, để không đè nút Lên sổ. Sửa này để chung với phần T749 chưa commit.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/danh-muc/ChiaSoDuQuy.tsx`: Sạch.
- Mở NH01 trên bản chạy thử gói Plus: gõ 10 triệu cho Lê Lợi thì hai cửa hàng kia chia phần còn lại, tổng khớp; Lưu rồi mở lại vẫn giữ đúng. Làm lại theo cách B: gõ 50 triệu cho Lê Lợi, hai cửa hàng kia còn 116.627.000 và 116.628.000, tổng khớp. Phần lưu không đổi so với bản đầu.
- Chưa xem lại trên máy màn điện thoại cho phần ẩn nút Đồng bộ FABi.

## Dở dang, việc tiếp theo

- Biểu đồ số dư quỹ Trang chủ, sổ quỹ lọc theo cửa hàng đang tính từ dữ liệu mẫu, chưa đọc số dư đã lưu, nên phần chia mới nằm ở danh mục. Muốn các màn đó dùng phần chia thì đọc `s.soDuQuy[donVi][mã quỹ].cn`.
- Màn Số dư ban đầu (`SoDuBanDau.tsx`, `MSoDuBanDau.tsx`) lưu lại quỹ thì ghi đè `{ no, co }`, mất phần chia. Gói Standard, Plus không dùng màn đó nên chưa sửa.
- Điện thoại chưa có khối chia.

## Bẫy, quyết định mới

- Không.
