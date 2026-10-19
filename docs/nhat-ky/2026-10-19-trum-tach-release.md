# Tách mục Release khỏi AGENTS.md (T486)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Chuyển nguyên văn mục "Release" của `AGENTS.md` sang `docs/RELEASE.md`. `AGENTS.md` giữ một câu: có người gõ "release" hoặc "phát hành" thì đọc `docs/RELEASE.md`.
- Thêm dòng `docs/RELEASE.md` vào bảng "Bản đồ tài liệu" của `AGENTS.md`.

## Đã kiểm

- So bằng `diff` nội dung mục cũ với `docs/RELEASE.md`: khớp 100%, không đổi câu luật nào.
- `AGENTS.md` từ 12.520 còn 11.529 byte, bớt khoảng 350 token mỗi phiên.
- `python tools/kiem_van.py` cho `AGENTS.md`, `docs/RELEASE.md`: sạch.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
