# Định mức chi phí NVL, hao hụt ở Danh mục cửa hàng (T938)

- Ngày: 25/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `DanhMucCuaHang.tsx`: thêm 2 cột Định mức chi phí NVL (%), Định mức hao hụt (%), nhập ngay ở bảng (lưu khi rời ô hoặc Enter). Hộp Chi tiết cửa hàng có 2 ô tương ứng và nút Lưu.
- `dinh-muc-cua-hang.tsx` (mới): ô nhập, hàm đọc, ghi định mức. Số từ 0 đến 100, để trống là xoá.
- `session.tsx`: thêm `dinhMucCh` theo đơn vị, theo cửa hàng.
- Cuối `app.css`: mục T938.

## Đã kiểm

- `npm run typecheck`, `npm run build` qua.
- `kiem_tra.py --nhanh` dừng ở mục T870/T871 (hỏng sẵn trên `main`, việc T933), không tới được dòng "Không có lỗi".

## Dở dang, việc tiếp theo

- Chưa màn nào dùng hai định mức để tính chi phí NVL hay cảnh báo hao hụt.
- Dữ liệu mẫu chưa có số định mức.
