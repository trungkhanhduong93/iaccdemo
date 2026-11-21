---
name: ban-do-repo
description: Bản đồ repo cho mọi repo git, agent nạp xong là nắm cả repo, tra code bằng script thay vì đọc nguyên file. Lệnh hieu in khung toàn repo, lệnh viec gom ngữ cảnh cho một việc (chỗ sửa file:dòng, file dính, CSS, quyết định, bẫy, việc cũ, skill, lệnh kiểm) để làm hoặc dán vào spec giao agent khác. Dùng đầu phiên ở repo chưa quen, trước khi bắt đầu việc sửa code, khi giao việc cho agent khác, khi người dùng nói "bản đồ repo", "map repo", "hiểu repo", "agent đọc code tốn token", "dọn rác repo", hoặc sang project mới chưa có tools/ban_do.py.
---

# Bản đồ repo

Script đọc thay agent, agent chỉ nhận kết quả dạng `file:dòng`. Chạy được ở mọi repo git, không cần cài gì vào repo.

## Dùng

`S` dưới đây là `"C:/Users/trung.duong/.claude/skills/ban-do-repo/scripts/soi_repo.py"`. Chạy trong thư mục repo.

1. Đầu phiên, repo chưa quen: `python S hieu`. Lệnh in khoảng 100–150 dòng: công nghệ, vùng code kèm mô tả, lõi chung, thành phần dùng nhiều kèm mô tả, mục luật trong `AGENTS.md`/`CLAUDE.md`, tài liệu, file hay sửa, lệnh kiểm, phần riêng của repo. Đọc xong là đủ khung. Không mở thêm file để "hiểu trước".
2. Bắt đầu một việc: `python S viec "<mô tả việc>"`. Lệnh in chỗ sửa (file, điểm, 3 dòng khớp nhất), file dính kèm, mục CSS, quyết định, bẫy, việc cũ giống kèm file các việc đó hay sửa, skill nên nạp, lệnh nghiệm thu. Giao việc cho agent khác thì dán nguyên khối này vào spec.
3. Trước khi sửa file chưa rõ dính tới đâu: `python S lien-quan <file>`. Cả thư mục: `python S vung <thư mục>`.
4. Repo có `tools/ban_do.py`: tra thêm `tim <từ>`, `file <đường dẫn>` (dàn ý file trên 20 KB), `css <class>`, `qd <từ>`, `bay <từ>`, `dau-phien <tên>`. Xem `python tools/ban_do.py --help`.
5. Đọc file: chỉ đọc khúc mà `viec` hoặc `file` chỉ ra, mỗi lần tối đa 400 dòng. Không đọc nguyên file trên 20 KB, file sinh tự động, `dist/`.
6. Kết quả sai hay thiếu: báo người dùng một dòng, ghi thành việc sửa script. Không quay về đọc nguyên file.

`viec` đo trên iaccdemo ngày 21/11/2026: 12/15 commit gần nhất có file đã sửa nằm trong top 3 kết quả. Mô tả càng sát tên màn, tên thành phần thì càng trúng.

## Phần riêng của repo

Repo có `tools/ban_do.py` kèm lệnh `hieu-them` thì `hieu` tự gọi và in thêm. Ở iaccdemo lệnh này in phân hệ, tab, màn tự viết và file của nó, mục kiến trúc, quyết định mới nhất. Repo khác muốn có thì thêm hàm `lenh_hieu_them` theo mẫu `scripts/ban_do.py`.

## Dựng, cập nhật, dọn

Người dùng nhờ dựng bản đồ cho repo mới, cập nhật `tools/ban_do.py`, dọn rác repo, dọn CSS thừa: đọc `references/dung-ban-do.md` rồi làm theo.
