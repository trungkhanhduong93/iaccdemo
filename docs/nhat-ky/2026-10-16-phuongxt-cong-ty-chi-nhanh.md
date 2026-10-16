# Cột Công ty ở Danh mục chi nhánh (T285)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/DanhMucChiNhanh.tsx`: thêm cột Công ty sau Tên chi nhánh, hiện tên và MST của đơn vị đang mở (`donViHienTai`, nên tên, MST sửa ở Thông tin đơn vị cũng đổi theo). PhuongXT chốt: mọi chi nhánh lấy công ty của đơn vị đang mở, không khai riêng từng chi nhánh.
- Cùng file: tên chi nhánh thành liên kết, bấm mở hộp Chi tiết chi nhánh mới (`HopChiTietCn`): Mã, POS ID, Tên, Công ty, Mã số thuế, Khu vực, Kho, Nguồn, Cách tính chi phí NVL (gói Free), Đồng bộ thu chi FABi. Esc hoặc nút Đóng để đóng.
- `src/styles/app.css`: mục cuối "Cột Công ty, hộp chi tiết ở Danh mục chi nhánh (T285)".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py src/modules/danh-muc/DanhMucChiNhanh.tsx`: sạch.
- Mở màn trên máy, gói Plus, rộng 1500px: cột Công ty hiện "Công ty TNHH Ẩm thực Phố Mây · MST 0319 990 001"; bấm Phố Mây Lê Lợi mở hộp chi tiết đủ dòng.
- Chưa sửa bản điện thoại `MChiNhanh.tsx` (T281 của Trum đang sửa `src/ui/mobile/*`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Mã T284 bị trùng: dinhlanphuongipacc nhận T284 lúc 13:58, commit nhận việc của PhuongXT đẩy lên lúc 14:07 cùng mã. Đã đổi việc của PhuongXT sang T285 bằng một commit mới, không viết lại lịch sử.
