# Chỉnh giao diện điện thoại sau phương án D (T467, T430)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MXemPhieu.tsx`: xem phiếu mua bỏ tab Hàng hoá, thứ tự tab gồm Chi tiết, Thanh toán, Lịch sử (gói có hạch toán thêm tab Hạch toán trước Lịch sử); ẩn nút Sửa trên từng thẻ mặt hàng ở màn xem, chỉ form sửa phiếu mới sửa mặt hàng; menu ⋯ bỏ mục Sửa chứng từ và Thanh toán ngay.
- `MXemPhieu.tsx`: xem phiếu kiểm kê bỏ tab Mặt hàng, chỉ còn 2 tab Chi tiết và Lịch sử.
- `MXuatBanPos.tsx`: danh sách Xuất bán POS chuyển trạng thái ghi sổ lên dòng đầu bên phải mã đơn thay giờ xuất; dòng cuối thẻ hiện ngày xuất bên trái, tiền bên phải; chi tiết Xuất bán POS căn lề trái ô Thời gian xuất, nút Đóng đổi sang màu xanh chính (T430).
- `MDanhSach.tsx`: đổi biểu tượng lọc ở các màn danh sách chứng từ điện thoại sang biểu tượng filter của bản máy tính.
- `src/styles/app.css`: thêm mục CSS `/* ── Điện thoại chỉnh sau phương án D (T467, T430) ── */` căn lề nhãn ngày và kiểu nút Đóng màn chi tiết đơn POS.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py`: các file đã sửa đạt 0 ĐỎ.
- 6 ảnh Playwright chụp ở độ phân giải 360x780 trong thư mục `backup/` (`T467-*.png`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
