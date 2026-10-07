# Chuẩn hoá BAT-DAU.md và đồng bộ kỹ năng Clau - Anti (T16)

- Ngày: 07/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `BAT-DAU.md`: viết lại tinh gọn 3 bước kéo code cho thành viên mới (PhuongXT, dinhlanphuongipacc); bổ sung mục chỉ thị tự động cho Claude Code tự kiểm tra môi trường (Node, Python, Playwright, Chrome), tự chạy `npm ci`, tự nhận việc từ `docs/TIEN-DO.md` và giải thích bằng tiếng Việt.
- `AGENTS.md`: bổ sung tên gọi tắt Clau, Anti.
- `docs/QUYET-DINH.md`: thêm QD13 chốt quy ước tên gọi tắt và mô hình phối hợp Clau (Architect / Planner / Reviewer) và Anti (Builder / Executor) tối ưu token.
- Thêm 13 skill thiết kế giao diện từ `Leonxlnx/taste-skill` cho cả Antigravity và Claude Code (`.agents/skills`, `.claude/skills`, `skills-lock.json`).
- Gỡ bỏ hoàn toàn bộ skill sinh học không liên quan (`science`).
- Đồng bộ 2 chiều toàn bộ 14 global skills giữa Clau và Anti.

## Đã kiểm

- `npm run typecheck`: không có lỗi.
- `npm run build`: hoàn tất, không có lỗi.
- `python tools/kiem_tra.py --nhanh`: 148 màn, 39 ô quy trình, 231 lượt mở màn, in dòng "Không có lỗi."
- `python tools/kiem_van.py BAT-DAU.md`: Sạch.
- `python tools/kiem_van.py AGENTS.md`: Sạch.
- `python tools/kiem_van.py docs/QUYET-DINH.md`: Sạch.

## Dở dang, việc tiếp theo

- Không. (Việc T15 tiếp tục làm theo nhật ký `2026-10-07-trum-form-chung-tu-amis.md`).

## Bẫy, quyết định mới

- Ghi QD13 vào `docs/QUYET-DINH.md`.
