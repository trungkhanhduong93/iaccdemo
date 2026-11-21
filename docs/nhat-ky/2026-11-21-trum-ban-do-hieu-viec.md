# Bản đồ repo: lệnh hieu, viec cho mọi repo (T901)

- Ngày: 21/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/skill-ban-do-repo/scripts/soi_repo.py`: thêm `hieu` (khung cả repo, khoảng 100 dòng: gồm `tong-quan`, thành phần dùng nhiều kèm mô tả, mục luật, tài liệu, file hay sửa, lệnh kiểm, phần riêng repo) và `viec "<mô tả>"` (chỗ sửa file:dòng, dính kèm, mục CSS, QD, bẫy, việc cũ giống, skill nên nạp, lệnh kiểm). Chạy ở mọi repo git.
- `viec` chấm điểm khớp nguyên từ có tách camelCase, từ hiếm nặng hơn (idf), cụm 2–3 từ liền nhau được thưởng, mỗi file chỉ cộng 5 dòng tốt nhất.
- Repo không có `package.json`: `tong-quan` đoán công nghệ theo đuôi file. Mô tả file bỏ dòng kẻ `====`.
- `tools/ban_do.py` (và bản mẫu): thêm `hieu-them` in phân hệ, tab, màn tự viết và file, mục kiến trúc, QD mới nhất. `BAN_DO_VERSION` 4, `VERSION` 4.
- `SKILL.md` còn 3 KB, chỉ phần dùng. Phần dựng, cập nhật, dọn chuyển sang `references/dung-ban-do.md`.
- `AGENTS.md` mục Tìm code, Đầu phiên bước 6; `.claude/skills/ban-do`; mẫu `muc-tim-code.md`; khối luật trong `cai_skill_ban_do.py` dùng `hieu`, `viec`.
- Ngoài repo: skill `orca-dieu-phoi` bước chẩn đoán dùng `viec`; cài lại skill, đồng bộ sang Antigravity.

## Đã kiểm

- `viec` trên 15 commit gần nhất, lấy tiêu đề commit làm mô tả: 12/15 có file đã sửa trong top 3. 3 ca trượt là commit sửa script kiểm, đổi mã việc.
- `hieu` iaccdemo 102 dòng; repo web-present (JS thuần, không package.json) 16 dòng, `viec` chạy được.
- `python -m py_compile` hai script; `kiem_van.py` SKILL.md, AGENTS.md: sạch.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
