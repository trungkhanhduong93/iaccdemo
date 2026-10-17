# Khoá sổ gói Free: bước kiểm tra mặc định có bước chưa xong (T317)

- Ngày: 17/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tong-hop/KhoaSoFree.tsx`: thêm dữ liệu mẫu `thieuNgay` (hai ngày cuối tháng FABi chưa đẩy doanh thu) và `phieuCho` (3 phiếu thu, chi FABi chưa map phương thức thanh toán). Bước Đồng bộ đủ doanh thu FABi và Phiếu thu, chi FABi chờ xử lý tính xong theo hai biến này thay vì luôn xong. Mặc định 4/6 bước xong, hiện cảnh báo vàng.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/tong-hop/KhoaSoFree.tsx`: Sạch.
- Mở `#/app/he-thong/khoa-so` gói Free: 4/6 bước đã xong, hai bước chưa xong ghi "28/30 ngày đã có doanh thu, thiếu ngày 29, 30" và "Còn 3 phiếu chờ map phương thức thanh toán".

## Dở dang, việc tiếp theo

- Không. Muốn đổi số ngày thiếu, số phiếu chờ thì sửa `thieuNgay`, `phieuCho` trong `KhoaSoFree.tsx` (đặt `[]`, `0` là xong).

## Bẫy, quyết định mới

- Không.
