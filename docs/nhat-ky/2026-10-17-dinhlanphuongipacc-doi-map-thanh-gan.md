# Đổi chữ "map" thành "gán" (T333)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- `src/modules/tong-hop/KhoaSoFree.tsx`: bước Phiếu thu, chi FABi chờ xử lý ghi "Còn … phiếu chờ gán phương thức thanh toán".
- `src/modules/danh-muc/index.ts`: ô tích lọc Danh mục Quỹ tiền đổi thành "Chưa gán phương thức thanh toán".
- `src/modules/danh-muc/QuyPttt.tsx`: khối phương thức thanh toán trong form Quỹ tiền ghi "để gán", "Đã gán vào".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Hệ thống › Khoá sổ gói Free trên localhost: bước cuối ghi "Còn 3 phiếu chờ gán phương thức thanh toán".

## Dở dang, việc tiếp theo

- `src/modules/danh-muc/DanhMucCuaHang.tsx` dòng cảnh báo còn "chưa map quỹ", "Map ở Danh mục Quỹ tiền". Chưa đổi vì PhuongXT đang sửa file này (T321). T321 xong thì đổi thành "chưa gán quỹ", "Gán ở Danh mục Quỹ tiền".
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
