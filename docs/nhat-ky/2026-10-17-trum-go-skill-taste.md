# Gỡ 13 skill thiết kế taste-skill (T305)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Gỡ 13 skill của `Leonxlnx/taste-skill` khỏi `.claude/skills` và `.agents/skills`, gỡ `skills-lock.json`. Bộ này thêm ở T16.
- Lý do: bộ này viết cho landing page (GSAP, hero, bảng giá, tạo ảnh bằng Codex). Nhiều luật ngược với app kế toán: tăng gấp đôi khoảng trắng, bỏ sidebar, thêm hạt nhiễu, phông monospace cho số. `design-taste-frontend` nặng 88 KB, agent nạp nhầm là tốn khoảng 25 nghìn token. Không tài liệu nào trong repo gọi tới bộ này.
- 6 luật hợp app kế toán đã gộp vào skill toàn máy `iacc-ui-ux` (`references/chung/anti-patterns.md`, mục 17 đến 22): số dùng `tabular-nums`, dữ liệu mẫu giống thật, đủ trạng thái tải, rỗng, lỗi, không dựng ảnh giả bằng div, không chấm màu trang trí, `text-wrap`.

## Đã kiểm

- Không chạy `npm run typecheck`, `npm run build`, `kiem_tra.py`: lần này không sửa `src/`.
- `python tools/kiem_van.py` cho nhật ký này và `docs/TIEN-DO.md`.

## Dở dang, việc tiếp theo

- Không.
- Máy nào còn skill taste trong thư mục người dùng (`~/.claude/skills`, `~/.gemini/config/skills`) thì giữ hay gỡ tuỳ người đó, repo không còn kèm.

## Bẫy, quyết định mới

- Không.
