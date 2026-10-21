# Bộ lọc Loại phiếu ở danh sách Thu chi điện thoại (T569)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLoc.tsx`: thêm trường `loaiPhieu` (chọn nhiều, lưu mã) và prop `dsLoaiPhieu`. Có prop thì tấm Bộ lọc hiện dòng Loại phiếu, trang con có ô tìm, Chọn tất cả, Bỏ chọn như Nguồn dữ liệu. Tên mục chọn nhiều gom vào hàm `tenMuc`.
- `src/ui/mobile/MDtThuChiDs.tsx`: hằng `LOAI_THU_CHI` dùng chung cho menu Thêm mới và bộ lọc. Bộ lọc chỉ liệt kê loại phiếu của tab đang chọn (Tiền mặt: thu, chi; Ngân hàng: thu, chi ngân hàng; Chuyển quỹ). Đổi tab thì loại đã chọn mà tab không có bị bỏ qua, không làm danh sách trống. Loại đang lọc hiện thành chip trên hàng lọc.
- Trum đồng ý sửa chung `MDtThuChiDs.tsx` với T563.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (máy chủ riêng cổng 5182): Không có lỗi.
- Script thử trên khung 390: chọn Thu tiền mặt thì còn 9/38 chứng từ, Tổng chi 0, có chip; sang tab Ngân hàng hiện 15 chứng từ, chip loại bỏ đi; không lỗi trang.
- `kiem_van.py` hai file: Sạch.

## Dở dang, việc tiếp theo

- Không. Chấm đỏ trên nút phễu vẫn hiện khi loại đã chọn bị bỏ qua vì tab không có loại đó; chưa sửa.

## Bẫy, quyết định mới

- Không.
