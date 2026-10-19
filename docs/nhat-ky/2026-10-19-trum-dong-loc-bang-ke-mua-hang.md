# Dòng điều kiện lọc Bảng kê mua hàng điện thoại (T477)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MBangKeMua.tsx`:
  - Bỏ dòng phụ tự dựng dưới tiêu đề (dòng chữ xám Tháng/Kho/Số phiếu).
  - Tiêu đề "Bảng kê mua hàng" căn giữa một dòng như thanh tiêu đề Sổ quỹ.
  - Hiện lại hàng ô lọc Thời gian, Kho/CN dùng chung ở đầu danh sách như Sổ quỹ tiền mặt.
- `src/styles/app.css`:
  - Bỏ ẩn lớp `.m-sbc-loc-hang` trong mục CSS T445, chỉ giữ ẩn ô tìm kiếm.
  - Dọn các lớp CSS thừa của dòng phụ tiêu đề (`.m-bkm-head-title`, `.m-bkm-head-ten`, `.m-bkm-head-phu`).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- `python tools/kiem_van.py src/ui/mobile/MBangKeMua.tsx`: sạch, 0 ĐỎ.
- Ảnh chụp màn hình:
  - `backup/T477-bang-ke-mua.png`
  - `backup/T477-so-quy.png`

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
