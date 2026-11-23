# Skill bản đồ lên siêu bản đồ, học từ graphify (T911)

- Ngày: 24/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/skill-ban-do-repo/scripts/soi_repo.py`: lưu kết quả đọc file vào `.git/soi-repo-cache.pickle`, khoá theo mtime và cỡ file. Lần sau chỉ đọc lại file đã đổi.
- `soi_repo.py`: bỏ dấu bằng `str.translate` thay cho chuẩn hoá NFD từng dòng. Giải import bằng `posixpath` thay cho `Path`. Việc cũ giống lấy bằng một lệnh `git log` thay cho 6 lệnh `git show`.
- `soi_repo.py viec`: mỗi dòng gắn nhãn `[tên]`, `[chữ]`, `[import]`, `[lịch sử]` để agent biết dòng nào tin được, dòng nào phải tự kiểm.
- `soi_repo.py explain <tên>`: chỗ định nghĩa hàm, màn, kiểu và mọi file `[import]` đang gọi kèm số dòng. Tách riêng file chỉ trùng chữ. Gõ sai tên thì gợi ý tên gần giống.
- `soi_repo.py ma <mã>`: code, CSS, tài liệu, commit nhắc tới một mã việc hoặc QD.
- `soi_repo.py do`: tự đo độ trúng của `viec` trên 20 commit gần nhất.
- `soi_repo.py lien-quan`: in mã việc, QD nhắc trong file. Gõ sai đường dẫn thì gợi ý file đúng. Sửa lỗi chữ Việt bị vỡ khi in lỗi ra stderr.
- `tools/skill-ban-do-repo/scripts/nhac_ban_do.py` (mới): hook PreToolUse. Agent dò code bằng Grep, Glob, grep 3 lần mà 4 giờ qua chưa chạy bản đồ ở repo đó thì nhận một câu nhắc. Tối đa 2 câu mỗi phiên, không chặn lệnh.
- `tools/cai_skill_ban_do.py`: cài thêm hook nhắc vào `~/.claude/settings.json`, thư mục `CLAUDE_CONFIG_DIR` và mọi hồ sơ Orca. Sao lưu trước khi sửa. `--go` gỡ cả hook. Mục luật thêm dòng `explain`, `ma`.
- `SKILL.md` viết lại cho bản 6, dùng `{{SKILL_DIR}}` thay đường dẫn cứng. `VERSION`, `BAN_DO_VERSION` lên 6. `muc-tim-code.md` thêm `explain`, `ma`.
- Đã cài bản 6 lên máy Trum bằng `python tools/cai_skill_ban_do.py`, đồng bộ sang Antigravity bằng `dong_bo_skill_gemini.py`.

## Đã kiểm

- Đo `viec` trên 20 commit gần nhất, cùng một bộ commit cho bản 5 và bản 6:

| Chỉ số | Bản 5 | Bản 6 |
|---|---|---|
| File đã sửa nằm trong top 3 | 17/20 | 17/20 |
| File đã sửa nằm trong top 6 | 18/20 | 18/20 |
| Thời gian một lần `viec` | 5,86 giây | 2,65 giây |
| `viec` khi chưa có cache | 6,8 giây | 2,5 giây |

- Output `viec` bản 6 trùng từng dòng với bản 5 khi bỏ nhãn. Lệnh so: `diff --strip-trailing-cr`.
- `explain` so với dò tay (grep cộng đọc file định nghĩa), tính bằng ký tự: FormToanMan 1.030 so với 6.311, keoNvlCb 733 so với 19.628, useDoRongCot 699 so với 21.560, ChonDanhMuc 1.234 so với 22.587, Dropdown 1.554 so với 21.438.
- `viec` so với đọc nguyên 3 file đứng đầu: ít hơn 7 tới 71 lần ký tự trên 4 mô tả việc.
- Hook nhắc chạy thật trong phiên Claude Code: lần Grep thứ 3 ở repo chưa chạy bản đồ nhận đúng câu nhắc. Repo vừa chạy bản đồ thì không nhắc.
- `python tools/kiem_van.py` cho `SKILL.md`, `muc-tim-code.md`: 0 ĐỎ. Còn 1 VÀNG ở nhãn `[tên]`, nhãn thật, không phải chỗ trống.
- `npm run typecheck`: không lỗi. `npm run build`: chạy xong trong 2,14 giây. Không sửa `src/` nên không chạy `kiem_tra.py`.

## Dở dang, việc tiếp theo

- Không.
- Muốn làm sau: lệnh `path A B` (đường nối giữa hai file) và chia cụm kiểu Leiden của graphify. Đã cân nhắc, chưa làm vì ít khi cần.

## Bẫy, quyết định mới

- Không ghi vào `docs/BAY.md`. Ghi chú: Claude Code chạy trong Orca đọc `settings.json` ở `CLAUDE_CONFIG_DIR` của hồ sơ Orca, không đọc `~/.claude/settings.json`. Bộ cài đã sửa cả hai chỗ.
