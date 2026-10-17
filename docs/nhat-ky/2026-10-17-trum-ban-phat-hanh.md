# Bản phát hành i-accounting (T319)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo project Cloudflare Pages `i-accounting` bằng `wrangler pages project create i-accounting --production-branch main --force`, chạy ở thư mục ngoài repo. Link https://i-accounting.pages.dev chỉ sống sau lần phát hành đầu.
- Thêm `.github/workflows/release.yml`: push tag `v*` thì kiểm, build, đưa lên `i-accounting`, báo Telegram kèm số phiên bản, cả khi xanh lẫn khi hỏng.
- `tools/bao_telegram.py`: thêm hàm `tin_phat_hanh`, nhận sự kiện push tag.
- `AGENTS.md`: thêm mục Release (cách đánh số, gắn tag lên `origin/main`) và một dòng ở mục Cấm (không xoá, không gắn lại tag `v*` đã push).
- `docs/TRIEN-KHAI.md`: thêm mục Bản phát hành i-accounting, ghi bẫy tạo project bằng wrangler 4.151.
- `docs/QUYET-DINH.md`: QD70.

## Đã kiểm

- `python tools/bao_telegram.py <sự kiện> --thu` với tag có commit (KET_QUA=success), tag không có head_commit (KET_QUA=failure), push main cũ: cả 3 tin in đúng mẫu. Trên Windows phải đặt `PYTHONIOENCODING=utf-8`, không thì lỗi in chữ do console cp1252.
- `python tools/kiem_van.py` cho AGENTS.md, TRIEN-KHAI.md, QUYET-DINH.md: 0 ĐỎ, các mục VÀNG đều ở dòng cũ.
- Chưa chạy robot phát hành thật: chờ lần đầu có người gõ release (sẽ ra `v1.0`).

## Dở dang, việc tiếp theo

- Không. Lần release đầu nên xem tab Actions để chắc bước deploy và tin Telegram chạy đúng.

## Bẫy, quyết định mới

- QD70 trong `docs/QUYET-DINH.md`.
- Bẫy wrangler 4.151 tự chuyển lệnh tạo project Pages sang Workers, tự sửa `package.json`, `vite.config.ts`, `.gitignore`, thêm `wrangler.jsonc`: ghi trong `docs/TRIEN-KHAI.md`, mục Cloudflare và GitHub.
- `ifinance.pages.dev` đã có người khác dùng nên chọn tên `i-accounting`.
