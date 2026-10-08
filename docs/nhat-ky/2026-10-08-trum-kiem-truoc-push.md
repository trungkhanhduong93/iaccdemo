# Luật kiểm bản mới trên GitHub trước khi push (T31)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `AGENTS.md`: thêm mục "Ngay trước lệnh git push", 8 bước: fetch, so `HEAD..origin/main`, báo người dùng, pull --rebase, kiểm lại nếu người khác sửa code, lặp tới khi hết commit mới. Bước 6 của "Cuối phiên" trỏ sang mục này.
- `docs/QUYET-DINH.md`: thêm QD16.

## Đã kiểm

- `python tools/kiem_van.py` cho `AGENTS.md`, `docs/QUYET-DINH.md` và nhật ký này.
- Chạy thật bước 1 và 2 trước khi push: `origin/main` không có commit mới.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD16.
