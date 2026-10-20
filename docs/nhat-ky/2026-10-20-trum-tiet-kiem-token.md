# Luật tiết kiệm token cho mọi agent (T493)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `AGENTS.md`: thêm mục "Tiết kiệm token (QD75)" sau mục "Tìm code".
- `tools/skill-ban-do-repo/scripts/muc-tiet-kiem-token.md`: mẫu mục này cho repo khác.
- `tools/skill-ban-do-repo/SKILL.md`: mục 4 chép thêm mục tiết kiệm token; mục 1 bước 3 thêm mục này cho repo đã có bản đồ cùng bản.
- `tools/skill-ban-do-repo/VERSION`: 3 lên 4. `BAN_DO_VERSION` giữ 3 vì `scripts/ban_do.py` không đổi.
- `docs/QUYET-DINH.md`: QD75.

## Đã kiểm

- `python tools/kiem_van.py` cho `AGENTS.md`, `SKILL.md`, mẫu mới, QD75, nhật ký này.
- Không sửa `src/`, không chạy typecheck, build, kiem_tra.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD75 trong `docs/QUYET-DINH.md`.
