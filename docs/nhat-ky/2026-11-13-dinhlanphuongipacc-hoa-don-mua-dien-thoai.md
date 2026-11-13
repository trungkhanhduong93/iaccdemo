# Hoá đơn mua hàng trên điện thoại (T826)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MChungTu.tsx`: tab Hoá đơn mua hàng (gói Plus, Pro, đã có lối vào từ trước) hiện Lý do nghiệp vụ ở từng dòng, bộ lọc có Lý do; không đếm "n hàng hoá" vì dòng là diễn giải.
- `src/ui/mobile/MLapPhieu.tsx` (`khongKho` = nhóm mua và `cfg.khongKho`):
  - Đầu phiếu bỏ Kho nhập, thay bằng ô Lý do nghiệp vụ (sheet chọn từ `LY_HD_MUA` cùng lý do chi thêm trong phiên, thêm được lý do mới). Lý do tích Là chi phí có nhãn Chi phí. Lý do Chi phí phân bổ nhiều kỳ có dòng nhắc "Lưu hoá đơn xong sẽ tạo Thẻ chi phí phân bổ".
  - Lý do mặc định: theo `?ly=` hoặc đoán từ diễn giải (`lyMacDinh`, như web). Hoá đơn mới để trống Ghi chú; lưu thì diễn giải lấy theo lý do.
  - Mọi dòng mang lý do đầu phiếu, Nợ TK theo lý do, Có 331 (`tkTheoLyDo('mua', ...)`).
  - Dòng chi tiết: tên dòng là ô Diễn giải gõ tự do (thẻ `TheHangMua` thêm prop `dienGiai`). Phiếu mới sẵn một dòng trống mã. Hai nút Thêm dòng (dòng trống) và Chọn hàng hoá (danh mục NVL thêm công cụ dụng cụ `CCDC_HANG`, không có tab Thực đơn).
  - Khối tổng chỉ còn Tổng tiền. Không có Trả hàng. Tiêu đề "Lập hoá đơn mua hàng", "Sửa hoá đơn ...".
  - Lưu kiểm lý do và diễn giải từng dòng, lưu `_lyDo`, `_kho` rỗng. Lý do phân bổ nhiều kỳ: lưu xong (kể cả khi tích Đã thanh toán) hiện hộp Tạo thẻ chi phí phân bổ, Tiếp tục mở form thẻ điền sẵn số tiền trước thuế, các dòng, loại CCDC khi mọi dòng là công cụ dụng cụ (như web T821, T822).
- `src/ui/mobile/MXemPhieu.tsx`: tiêu đề "Hoá đơn mua hàng ...", dòng Lý do (kèm nhãn Chi phí) thay Kho nhập, menu không có Trả hàng, Tham chiếu có thẻ chi phí phân bổ của hoá đơn (`theCuaPhieu`).
- `src/styles/app.css`: mục T826 cuối file. Mã hàng của dòng nằm dưới ô Diễn giải (dòng "Mã: ..."), ô Diễn giải rộng hết hàng.
- Hộp thêm hàng trên điện thoại dùng form danh mục đầy đủ (`MFormDm`), gói Plus, Pro đã chọn được Loại, Nhóm hàng hoá, không cần sửa.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- Trình duyệt 375x812, gói Plus: danh sách 4-1-2 có lý do; xem HDM2610-0253 có Lý do, không Kho; lập hoá đơn lý do Chi phí khác ngày 28/10, 3.000.000 + thuế 8%, lưu được, `phieuChiPhi` có hoá đơn này 3.000.000 (trước thuế) tháng 10; lập hoá đơn lý do Chi phí chờ phân bổ chọn CCDC0001, có nhắc, lưu xong hộp Tạo thẻ, Tiếp tục mở form thẻ điền tên, 9.600.000, số chứng từ; sửa HDM2610-0253 giữ lý do và diễn giải.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` 3 file: 0 ĐỎ (2 VÀNG là chuỗi vẽ biểu tượng có sẵn).

## Dở dang, việc tiếp theo

- Không.
- Form thẻ chi phí điện thoại (`MCcdc.tsx`, Trum giữ ở T552) chưa đọc `tuPhieu.loai` và nhiều dòng: thẻ từ hoá đơn CCDC vẫn mở loại Chi phí trả trước, chỉ lấy tên dòng đầu. Cần sửa `ftLoai` đọc `tuPhieu.loai` khi Trum xong.
- Màn Chi phí trong tháng điện thoại (`MChiPhiThang.tsx`) chỉ tháng 7-10 và chỉ mở từ trang chủ Standard; dữ liệu đã gồm hoá đơn lập trên điện thoại.
- `MLapPhieu.tsx`, `MXemPhieu.tsx` Trum đang giữ ở T497, T498, T552; việc này sửa theo giao việc của phiên trước.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được (thiếu `build_present`, như các phiên trước).
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
