---
name: ban-do-repo
description: Siêu bản đồ repo cho mọi repo git. Agent nạp xong là nắm cả repo, tra code bằng script thay vì đọc nguyên file. Lệnh hieu in khung toàn repo. Lệnh viec gom ngữ cảnh cho một việc (chỗ sửa file:dòng có nhãn độ tin, file dính, CSS, quyết định, bẫy, việc cũ, skill, lệnh kiểm) để làm hoặc dán vào spec giao agent khác. Lệnh explain liệt kê mọi chỗ gọi một hàm, màn trước khi đổi nó. Lệnh ma tra mã việc, QD nằm ở code nào. Dùng đầu phiên ở repo chưa quen, trước khi bắt đầu việc sửa code, trước khi đổi tên hay tham số một hàm dùng chung, khi giao việc cho agent khác, khi người dùng nói "bản đồ repo", "siêu bản đồ", "map repo", "hiểu repo", "ai đang gọi hàm này", "agent đọc code tốn token", "dọn rác repo", hoặc sang project mới chưa có tools/ban_do.py.
---

# Siêu bản đồ repo

Script đọc thay agent, agent chỉ nhận kết quả dạng `file:dòng`. Chạy được ở mọi repo git, không cần cài gì vào repo. Kết quả đọc file lưu ở `.git/soi-repo-cache.pickle`, lần sau chỉ đọc lại file đã đổi.

## Dùng

`S` dưới đây là `"{{SKILL_DIR}}/scripts/soi_repo.py"`. Chạy trong thư mục repo.

1. Đầu phiên, repo chưa quen: `python S hieu`. Lệnh in khoảng 100–150 dòng: công nghệ, vùng code kèm mô tả, lõi chung, thành phần dùng nhiều, mục luật trong `AGENTS.md`/`CLAUDE.md`, tài liệu, file hay sửa, lệnh kiểm, phần riêng của repo. Đọc xong là đủ khung. Không mở thêm file để "hiểu trước".
2. Bắt đầu một việc: `python S viec "<mô tả việc>"`. Lệnh in chỗ sửa (file, điểm, 3 dòng khớp nhất), file dính kèm, mục CSS, quyết định, bẫy, việc cũ giống, skill nên nạp, lệnh nghiệm thu. Giao việc cho agent khác thì dán nguyên khối này vào spec.
3. Đọc nhãn trước khi tin kết quả:
   - `[tên]`: dòng khai báo hàm, màn, nhãn. Tin được.
   - `[import]`: file nối thật qua import. Tin được.
   - `[chữ]`: chỉ khớp chữ. Mở đúng dòng đó kiểm trước khi sửa.
   - `[lịch sử]`: suy từ git log. Chỉ để tham khảo.
4. Trước khi đổi tên, tham số, kiểu trả về của một hàm hay thành phần: `python S explain <tên>`. Lệnh in chỗ định nghĩa, mọi file `[import]` đang gọi kèm số dòng. Sửa đủ các file đó rồi mới chạy typecheck.
5. Trước khi sửa file chưa rõ dính tới đâu: `python S lien-quan <file>`. Lệnh in file nó dùng, file dùng nó, mục CSS, mã việc và QD nhắc trong file, file hay sửa cùng. Cả thư mục: `python S vung <thư mục>`.
6. Gặp mã việc, QD lạ trong code hay comment: `python S ma <mã>`. Lệnh in code, CSS, tài liệu, commit nhắc tới mã đó.
7. Repo có `tools/ban_do.py`: tra thêm `tim <từ>`, `file <đường dẫn>` (dàn ý file trên 20 KB), `css <class>`, `qd <từ>`, `bay <từ>`, `dau-phien <tên>`. Xem `python tools/ban_do.py --help`.
8. Đọc file: chỉ đọc khúc mà `viec`, `explain` hoặc `file` chỉ ra, mỗi lần tối đa 400 dòng. Không đọc nguyên file trên 20 KB, file sinh tự động, `dist/`.
9. Kết quả sai hay thiếu: báo người dùng một dòng, ghi thành việc sửa script. Không quay về đọc nguyên file.

## Đo độ trúng

`python S do` lấy 20 commit gần nhất có sửa code, chạy `viec` với câu commit, đếm số việc có file đã sửa nằm trong top 3. Sửa cách chấm điểm thì chạy lại trước và sau, số không được giảm. Đo trên iaccdemo ngày 24/11/2026: 17/20 việc trúng top 3, 18/20 trúng top 6. Mô tả càng sát tên màn, tên thành phần thì càng trúng.

## Hook nhắc

Bộ cài thêm hook `scripts/nhac_ban_do.py` vào `settings.json` của Claude Code trên máy. Agent dò code bằng Grep, Glob hoặc grep trong Bash ở repo chưa chạy bản đồ trong 4 giờ thì từ lần dò thứ 3 nhận một câu nhắc. Mỗi phiên tối đa 2 câu. Hook không chặn lệnh nào. Antigravity không có hook, dựa vào mục luật trong `GEMINI.md`.

## Phần riêng của repo

Repo có `tools/ban_do.py` kèm lệnh `hieu-them` thì `hieu` tự gọi và in thêm. Ở iaccdemo lệnh này in phân hệ, tab, màn tự viết và file của nó, mục kiến trúc, quyết định mới nhất. Repo khác muốn có thì thêm hàm `lenh_hieu_them` theo mẫu `scripts/ban_do.py`.

## Dựng, cập nhật, dọn

Người dùng nhờ dựng bản đồ cho repo mới, cập nhật `tools/ban_do.py`, dọn rác repo, dọn CSS thừa: đọc `references/dung-ban-do.md` rồi làm theo.
