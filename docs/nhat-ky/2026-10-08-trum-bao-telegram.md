# Robot báo Telegram khi push, token Cloudflare cho robot deploy (T30, T01)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `.github/workflows/bao-telegram.yml`: mỗi push lên `main` gửi tin vào group Telegram; robot deploy hỏng thì gửi thêm tin báo hỏng. Trum duyệt sửa `.github/workflows/`.
- Thêm `tools/bao_telegram.py`: soạn tin từ file sự kiện GitHub và gửi qua Bot API. Cờ `--thu` chỉ in tin, không gửi.
- Trum đặt 3 secret repo: `CLOUDFLARE_API_TOKEN` (T01), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. Lần đầu đặt nhầm 2 secret Telegram thành Environment, đã xoá và đặt lại ở Repository secrets.
- `docs/TRIEN-KHAI.md`: thêm mục "Báo Telegram", ghi T01 đã đặt token, ghi thời gian deploy lần đầu.

## Đã kiểm

- Chạy tay robot deploy (run 37741596058): xanh, bước "Đưa lên Cloudflare Pages" có chạy, cả job 24 giây.
- `python tools/bao_telegram.py <sự kiện giả> --thu` với 6 ca: commit có `<`, `&`; 12 commit (cắt còn 10 dòng); push không commit; deploy xanh (không gửi); deploy hỏng; thiếu token (cảnh báo vàng, thoát 0). Token sai: in `Telegram từ chối tin, mã 401: Unauthorized`, không in URL chứa token.
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py docs/TRIEN-KHAI.md`: 0 ĐỎ, 2 VÀNG ở chữ cũ dòng 36 và 53.
- Tin báo deploy hỏng chưa thấy chạy thật vì robot deploy chưa hỏng lần nào sau khi có workflow này.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
