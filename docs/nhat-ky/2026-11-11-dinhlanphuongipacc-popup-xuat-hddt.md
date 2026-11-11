# Popup xuất HĐĐT nhiều chứng từ: tiêu đề phụ, căn ô, dòng Cộng cố định (T792)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/hddt.tsx`: hàm `Dong` nhận thêm `phu` (tiêu đề phụ dưới nhãn); hai ô đầu popup đổi thành "Ngày hoá đơn" / "Ký hiệu" kèm phụ "Áp dụng cho tất cả".
- `src/styles/app.css`, mục T792 cuối file: kiểu `.co-phu`; ô ngày từng dòng cao 30px, bo 6px như ô ký hiệu; `.hddt-than > .hddt-bang` không co; dòng `.hddt-cong` sticky ở đáy `.hddt-ds`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/ban-hang/hddt.tsx`: Sạch.
- Mở popup ở cửa sổ 1366x560: tiêu đề phụ hiện đủ, dòng Cộng nằm đáy khi cuộn.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Ghi chú: ô `ONgay` luôn gắn class `.inp` (cao 36px), muốn ô ngày nhỏ phải đè `height` cho `.inp`.
