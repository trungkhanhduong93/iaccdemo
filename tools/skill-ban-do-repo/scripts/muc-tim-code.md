## Tìm code

Không đọc nguyên file lớn. `tools/ban_do.py` đọc thay và in kết quả dạng `file:dòng`.

- Repo chưa quen: `python "<skill ban-do-repo>/scripts/soi_repo.py" hieu` in khung cả repo.
- Bắt đầu một việc: `python "<skill ban-do-repo>/scripts/soi_repo.py" viec "<mô tả>"` in chỗ sửa, file dính, quyết định, bẫy, skill, lệnh kiểm.
- Chưa biết sửa ở đâu: `python tools/ban_do.py tim <từ khoá>`. Gõ không dấu cũng được.
- File trên 20 KB: `python tools/ban_do.py file <đường dẫn>` lấy dàn ý, rồi chỉ đọc khúc cần sửa, mỗi lần tối đa 400 dòng.
- CSS: `python tools/ban_do.py css <class hoặc mã việc>`.
- Không đọc: <file sinh tự động, file dữ liệu lớn của repo này>.
- Xem nhánh nào đang có việc chưa vào nhánh chính: `python tools/ban_do.py nhanh`.
- Claude Code có hook trong `.claude/settings.json` chặn đọc file lớn khi không giới hạn số dòng. Agent khác tự giữ luật này.
