# Luật phối hợp để không trùng mã, không đè việc nhau (T35)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `AGENTS.md`, mục "Đầu phiên": mỗi phiên agent một bản clone riêng, kèm lệnh tạo. Trên một máy mỗi lúc chỉ một bản chạy `npm run dev`.
- `AGENTS.md`, bước 5 "Đầu phiên": lấy mã sau `git fetch origin`, ghi file dùng chung sẽ sửa vào cột Ghi chú, giữ chỗ dòng QD, push ngay commit nhận việc.
- `AGENTS.md`, mục "Trong phiên": CSS mới gom thành mục riêng có mã việc ở cuối `app.css`.
- `docs/QUYET-DINH.md`: QD21.

## Đã kiểm

- `python tools/kiem_van.py` cho `AGENTS.md`, `docs/QUYET-DINH.md`, `docs/TIEN-DO.md` và nhật ký này.

## Dở dang, việc tiếp theo

- Không.
- Người dùng tự tạo bản clone riêng cho từng phiên agent theo lệnh trong `AGENTS.md`.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD21.
