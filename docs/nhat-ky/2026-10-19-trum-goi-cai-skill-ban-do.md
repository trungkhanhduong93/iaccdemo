# Gói cài skill bản đồ repo cho máy từng người (T487)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `tools/skill-ban-do-repo/`: bản gốc trung tính của skill bản đồ repo (SKILL.md, `soi_repo.py`, `ban_do.py` mẫu, hook mẫu, `VERSION`).
- Thêm `tools/cai_skill_ban_do.py`: cài vào `~/.claude/skills/ban-do-repo/`, thêm mục luật có đánh dấu vào `~/.claude/CLAUDE.md` và `~/.gemini/GEMINI.md` (nếu có), sao lưu file luật trước khi sửa. Có `--kiem`, `--khong`, `--go`, `--ep`.
- `tools/ban_do.py dau-phien` in thêm dòng nhắc khi máy chưa cài hoặc có bản mới. `AGENTS.md` bước 4 Đầu phiên: agent hỏi người dùng một lần.
- Máy Trum cài lại từ bản gốc (`--ep`), bỏ dòng luật cũ không đánh dấu trong `CLAUDE.md`, `GEMINI.md` toàn cục.

## Đã kiểm

- Thư mục nhà giả, 7 ca: chưa cài, cài, cài lại không trùng khối luật và chỉ sao lưu 1 lần, tăng `VERSION` ra `cu-hon`, `--go` gỡ sạch giữ nguyên luật cũ, `--khong` ra `tu-choi`, skill cùng tên tự làm ra `ban-rieng` và không bị đè.
- Máy Trum sau khi cài: `--kiem` ra `da-cai`, `dau-phien` không in dòng nhắc, `soi_repo.py tong-quan` chạy được.
- `npm run typecheck`, `npm run build`: chạy xong, không lỗi. Không sửa `src/`.

## Dở dang, việc tiếp theo

- Không. Lần đầu PhuongXT, dinhlanphuongipacc mở phiên sau khi pull, agent sẽ hỏi có cài không.

## Bẫy, quyết định mới

- Ghi thêm một dòng vào QD74 trong `docs/QUYET-DINH.md`.
