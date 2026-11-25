# Xuất kho định lượng, danh sách và hộp thoại Tạo (T935)

- Ngày: 25/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `XuatDinhLuong.tsx` (hàm danh sách): cột Cửa hàng luôn hiện, thêm Kênh bán, cột Mã hoá đơn đổi tên Mã đơn POS (vẫn `#` + 5 ký tự). Nút Tạo xuất kho định lượng, dải cảnh báo món sót, thanh tiến trình.
- `HopXuatDinhLuong.tsx` (mới): popup món chưa tạo (Mã món, Tên món, ĐVT, Cửa hàng, Lý do, Xử lý, nút mở ở tab mới), hộp thoại Tạo xuất kho định lượng (xuất bổ sung, tạo lại toàn bộ, nhóm món chỉ ở tạo lại, món, không chọn là tất cả), bước xác nhận.
- `xuat-dinh-luong.ts`: trạng thái giả bổ sung, tạo lại, số phiếu mới, lịch sử; cảnh báo chỉ tính thành phẩm không theo dõi tồn kho; xuất bổ sung liệt kê mọi món thiếu, tích sẵn món đã có công thức.
- `app.css`: mục T935 cuối file.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- Xem tay trên trình duyệt ở bản trước khi thêm Nhóm món, thanh tiến trình, xác nhận: popup, hộp thoại chạy được.
- Chưa chạy được `kiem_tra.py --nhanh` (cổng 5180 đang là bản clone khác) và `xuat_bao_cao_he_thong.py` (thiếu module build_present).

## Dở dang, việc tiếp theo

- Tab Lịch sử trong chi tiết phiếu chưa đọc `PhieuXdl.lichSu`. Dữ liệu đã ghi sẵn.
- Chế độ xuất bổ sung chưa có món thử vì chưa món nào có công thức mới trong dữ liệu mẫu.

## Bẫy, quyết định mới

- Không.
