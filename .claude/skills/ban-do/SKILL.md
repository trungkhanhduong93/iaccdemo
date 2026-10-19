---
name: ban-do
description: Tra repo iaccdemo bằng tools/ban_do.py thay vì đọc nguyên file. Dùng đầu mỗi phiên, khi tìm chỗ sửa (màn hình, hàm, class CSS, QD, bẫy), khi định đọc file trên 20 KB như MLapPhieu.tsx, ChungTuForm.tsx, app.css, TIEN-DO.md, QUYET-DINH.md, và khi cần biết nhánh nào đang có việc.
---

# Bản đồ repo

Luật gốc ở mục "Đầu phiên" và "Tìm code" của `AGENTS.md` (QD74). Skill này chỉ nhắc thứ tự lệnh.

1. Đầu phiên: `python tools/ban_do.py dau-phien <tên GitHub>`. Không đọc nguyên `docs/TIEN-DO.md`.
2. Chưa biết chỗ sửa: `python tools/ban_do.py tim <từ khoá>`.
3. File trên 20 KB: `python tools/ban_do.py file <path>`, rồi Read có `offset` và `limit` tối đa 400.
4. CSS: `python tools/ban_do.py css <class hoặc Txx>`. Thêm CSS mới thì đọc 40 dòng cuối `app.css`.
5. Quyết định, bẫy: `python tools/ban_do.py qd <số hoặc từ>`, `python tools/ban_do.py bay <từ>`.
6. Nhánh: `python tools/ban_do.py nhanh`.

Lệnh in thiếu hay sai thì sửa `tools/ban_do.py` trong việc riêng. Không quay về đọc nguyên file.
