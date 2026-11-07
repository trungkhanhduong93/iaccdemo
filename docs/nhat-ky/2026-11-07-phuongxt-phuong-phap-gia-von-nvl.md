# Phương pháp giá vốn NVL chung cả công ty, cài ở Thông tin đơn vị (T767)

- Ngày: 07/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/chi-phi-nvl.ts`: chỉ còn 2 phương pháp, chung cả công ty: Kiểm kê định kỳ (Tồn đầu kỳ + Mua trong tháng − Tồn cuối kỳ theo kiểm kê cuối tháng, mặc định) và Tổng chi phí mua hàng trong tháng. Bỏ cách iPOS Inventory, nhập tay. Phiên lưu ở `cachNvlDv` theo đơn vị (bỏ `cachNvl` theo cửa hàng, `giaThanhTay`). Tồn kiểm kê cuối tháng là số giả: `tonKiemKe`.
- Xoá `src/modules/home/excel-gia-thanh.ts` (xuất, nhập Excel giá thành nhập tay, không còn dùng).
- `ChiPhiNvl.tsx`, `MChiPhiNvl.tsx`: màn Giá vốn NVL ghi công thức kèm số; bảng cửa hàng có Tồn đầu, Mua, Tồn cuối khi kiểm kê định kỳ; xem một cửa hàng là danh sách phiếu mua hàng; nút Đổi cách tính mở Thông tin đơn vị.
- `DanhMucCuaHang.tsx`, `MCuaHang.tsx`, `MThemCuaHangFabi.tsx`: bỏ ô chọn cách tính theo cửa hàng.
- `HeThong.tsx`, `MHeThong.tsx` (Thông tin đơn vị, thẻ Chế độ kế toán): thêm ô Phương pháp giá vốn NVL (gói Standard); đổi nhãn Ngày đầu năm thành Ngày đầu năm tài chính, ẩn ở gói Standard; bỏ ô Năm làm việc hiện tại (năm tài chính lấy theo năm của ngày đầu năm tài chính); thêm ô Ngày bắt đầu làm việc.
- `session.tsx`: thêm `ngayLamViec` theo đơn vị và hàm `ngayLamViec(s)`; `OnboardFabi.tsx` lưu ngày bắt đầu làm việc chọn lúc khởi tạo.
- `BaBaiToanStandard.tsx`, `MTrangChuStandard.tsx`: dòng phụ thẻ Giá vốn nguyên vật liệu ghi phương pháp chung.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` các file đã sửa: không có mục đỏ.
- Mở thử gói Standard trên máy: màn Giá vốn NVL tháng 10 theo kiểm kê định kỳ; đổi sang Tổng chi phí mua hàng ở Thông tin đơn vị, Lưu, màn đổi số đúng. Phần ngày bắt đầu làm việc, bỏ năm làm việc chưa mở màn xem tận mắt.

## Dở dang, việc tiếp theo

- Không.
- Công thức Kiểm kê định kỳ theo cách làm kế toán thông thường, chưa hỏi Trum. Dữ liệu mẫu chỉ có phiếu mua hàng tháng 9, 10 nên tháng 7, 8 phần mua bằng 0.

## Bẫy, quyết định mới

- Không.
