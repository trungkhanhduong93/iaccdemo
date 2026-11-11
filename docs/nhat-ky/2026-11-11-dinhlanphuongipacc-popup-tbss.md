# Popup Thông báo hoá đơn có sai sót vào khung (T796)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/hoa-don/HoaDonDienTu.tsx`, `HopTbss`: Hoá đơn, Người mua, Nội dung sai sót nằm chung một khung `hddt-bang`, nhãn một cột rộng 160px, ô nhập không viền riêng (`hddt-inp`).
- Thêm nút Lưu và gửi CQT (nút chính) cạnh Lưu nháp. Lưu và gửi thì thông báo vào tab Thông báo sai sót với trạng thái Đã gửi CQT.
- `src/styles/app.css`: mục cuối file `T796`, class `hddt-tbss`, `hddt-gt` (ô giá trị chỉ xem).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `KIEM_TRA_URL=http://localhost:5183/ python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/hoa-don/HoaDonDienTu.tsx`: Sạch.
- Mở popup trên trình duyệt, nhãn và ô thẳng hàng, đủ 3 nút.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
