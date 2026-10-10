# Đối soát đơn POS ở danh sách Xuất bán POS (T118)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/ChungTuBanHang.tsx`: dải đối soát ngay dưới thanh công cụ của danh sách, theo mẫu iPOS Inventory nhưng vẽ theo IACC. Bên trái hai nút Đã đồng bộ (số chứng từ đang lọc), Chưa đồng bộ (số dòng lỗi). Bên phải 5 ô số liệu: tổng số hoá đơn POS, tổng số hoá đơn IACC (POS trừ hoá đơn lỗi), tổng số món, mã hoá đơn cuối, lần đồng bộ cuối.
- Bấm Chưa đồng bộ: bảng lỗi gồm #, Mã hoá đơn, Thời gian, Tên món (link "tên - mã" mở danh mục hàng hoá), Đơn vị tính, Số lượng, Chi nhánh (chỉ khi xem tất cả chi nhánh), Lý do lỗi; khung Chi tiết phía dưới ẩn đi.
- Dữ liệu lỗi giả, cố định theo ngày, chi nhánh (`loiDongBo`), theo khoảng thời gian và chi nhánh đang lọc. Lý do: không tìm thấy hàng hoá, chưa có định lượng, ĐVT chưa khai báo, món chưa gắn kho xuất.
- Bỏ chip trạng thái Tất cả, Chưa ghi sổ, Đã ghi sổ, Lệch đối soát ở danh sách Xuất bán POS (mọi gói). Bỏ luôn trạng thái lệch trong dữ liệu mẫu, dòng tô đỏ và cảnh báo lệch trong phiếu.
- Bỏ nút Ghi chú FABi (biểu tượng i), cột ô chọn dòng và nút Hàng loạt (xoá hàng loạt) ở danh sách Xuất bán POS.
- Cột STT gọn còn 46px; chữ Tổng trang chuyển sang cột Ngày.
- Bộ lọc thêm Hàng hoá (chứng từ có món đó) và Theo dõi tồn kho (có hoặc không có món theo dõi tồn kho), tính theo món của chứng từ (`monCua`).
- `app.css`: mục cuối "Đối soát đơn POS ở danh sách Xuất bán POS (T118)".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho file tsx và tài liệu: sạch.
- Xem trên trình duyệt gói PL, chi nhánh Phố Máy Nguyễn Trãi, tháng 10: hai nút và 5 ô số liệu hiện đúng, bảng Chưa đồng bộ có 3 dòng.

## Dở dang, việc tiếp theo

- Không. Khi có backend thì thay dữ liệu lỗi giả bằng kết quả đồng bộ thật từ FABi.

## Bẫy, quyết định mới

- Không.
