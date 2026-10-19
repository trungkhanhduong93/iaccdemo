# Skill bản đồ tự lên bản mới nhất ở mọi repo (T490)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (làn Windows) sửa phần Python
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/cai_skill_ban_do.py`: thêm cờ `--cap-nhat`. Lệnh fetch GitHub. `VERSION` trên GitHub mới hơn thì `git pull --ff-only` (chỉ khi iaccdemo đang ở `main`, không thì báo lệnh tự chạy), rồi cài lại skill nếu máy đang cũ hơn. `cai` thay thêm `{{NGUON}}` bằng đường dẫn iaccdemo trên máy.
- `tools/ban_do.py`, `tools/skill-ban-do-repo/scripts/ban_do.py`: thêm `BAN_DO_VERSION = 3`.
- `tools/skill-ban-do-repo/SKILL.md`: mục 1 chạy `--cap-nhat` trước, rồi so `BAN_DO_VERSION` của repo với bản mẫu. Thêm mục 3b cập nhật script đã có mà giữ phần repo chỉnh riêng. Mục 8 ghi cách tăng số và đồng bộ cho Antigravity.
- `tools/skill-ban-do-repo/VERSION`: lên 3.
- `docs/QUYET-DINH.md`, QD74: thêm một gạch về T490.
- Máy Trum: đã cài bản 3 vào `~/.claude/skills/ban-do-repo/` (profile Orca trỏ về đây), đã chạy `dong_bo_skill_gemini.py` cho Antigravity.

## Đã kiểm

- `python tools/cai_skill_ban_do.py --cap-nhat` lần 1: cài bản 3. Lần 2: "Skill bản đồ đang là bản mới nhất (3)." `--kiem`: `da-cai`.
- SKILL.md đã cài không còn `{{`, lệnh `--cap-nhat` trỏ đúng `D:/IACC-CLOUD/Web/tools/cai_skill_ban_do.py`.
- `~/.gemini/config/skills/ban-do-repo/`: có `BAN_DO_VERSION = 3` và mục `--cap-nhat`.
- `ban_do.py dau-phien Trum`, `tim lai lo 13 thang`: chạy không lỗi. `diff` hai bản `ban_do.py` chỉ còn phần T487.
- Chưa thử nhánh pull thật (GitHub mới hơn máy), vì lúc kiểm máy đã là bản mới nhất.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD74 thêm gạch T490.
