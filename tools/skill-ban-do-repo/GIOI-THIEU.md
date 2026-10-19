# Skill bản đồ repo: giới thiệu và cài đặt

Agent đọc file này khi người dùng nhờ "nạp skill bản đồ". Làm đúng 4 bước, giải thích bằng lời thường.

## 1. Giải thích cho người dùng

Nói ngắn, đủ 3 ý:

- Trước đây đầu mỗi phiên, agent đọc nguyên các file lớn như `docs/TIEN-DO.md` (160 KB) và `MLapPhieu.tsx` (104 KB), tốn khoảng 90 nghìn token trước khi sửa dòng đầu tiên.
- Có skill này, agent chạy lệnh để tra đúng file và đúng dòng cần sửa. Đầu phiên còn khoảng 4 nghìn token, mỗi lần mở một file lớn còn 1 đến 2 nghìn.
- Cài một lần vào máy, dùng được ở mọi repo git khác trên máy đó, không chỉ iaccdemo. Có thêm lệnh soi file nào dính file nào, và lệnh lập báo cáo file rác. Lệnh này không tự xoá file nào.

## 2. Hỏi người dùng có cài không

Nói rõ máy sẽ bị đổi 2 chỗ:

- Thêm thư mục `~/.claude/skills/ban-do-repo/`.
- Thêm một mục luật 3 dòng vào cuối `~/.claude/CLAUDE.md`, và vào `~/.gemini/GEMINI.md` nếu máy có Antigravity. File cũ được sao lưu trước khi sửa. Gỡ được bằng `python tools/cai_skill_ban_do.py --go`.

## 3. Cài hoặc ghi nhớ từ chối

- Đồng ý: chạy `python tools/cai_skill_ban_do.py`.
- Không muốn: chạy `python tools/cai_skill_ban_do.py --khong`. Lần sau agent không hỏi lại.

## 4. Nhắc mở phiên mới

Luật mới chỉ có hiệu lực từ phiên sau. Bảo người dùng đóng phiên này, mở phiên mới trong thư mục repo rồi làm việc như bình thường.
