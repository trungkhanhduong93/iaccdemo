# Phát hành bản mới

Chuyển từ `AGENTS.md` (T486). Luật không đổi.

Ai trong 3 người gõ "release" (hoặc "phát hành") thì agent làm, không cần hỏi Trum. Bản phát hành là bản đang ở `origin/main`, tức bản đang chạy ở iaccdemo, không lấy code chưa push trên máy.

1. Chạy `git fetch origin --tags`.
2. Lấy số mới nhất bằng `git tag -l "v*" --sort=-v:refname` ở dòng đầu. Chưa có tag nào thì dùng `v1.0`. Có rồi thì tăng số sau dấu chấm lên 1 (v1.0 lên v1.1, v1.9 lên v1.10). Người dùng ghi rõ số (vd "release v2.0") thì dùng số đó; số đó đã có thì dừng, báo người dùng.
3. Chạy `git tag --points-at origin/main`. Đã có tag `v*` thì báo "bản này đã phát hành là vX.Y", rồi dừng.
4. Nói một câu sẽ phát hành số nào, commit nào (`git log -1 --format="%h %s" origin/main`).
5. Chạy `git tag -a vX.Y origin/main -m "vX.Y"`, rồi `git push origin vX.Y`. Push tag không cần làm mục "Ngay trước lệnh git push" vì tag gắn lên `origin/main` vừa fetch.
6. Báo người dùng: robot ở https://github.com/trungkhanhduong93/iaccdemo/actions chạy khoảng 1 phút, xong thì Telegram báo, bản mới ở https://i-accounting.pages.dev.
