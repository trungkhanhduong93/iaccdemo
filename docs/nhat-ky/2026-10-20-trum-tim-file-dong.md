# Lệnh tim in file:dòng cho nhóm Chữ thường (T489)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (làn Windows) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/ban_do.py`, `lenh_tim` mục 5: nhóm Chữ thường in `file:dòng` kèm 80 ký tự đầu của dòng gốc có dấu. Mỗi file tối đa 3 dòng, còn thừa thì in "còn N dòng nữa". Trước đây chỉ in `file (N lần)`.
- Thứ tự: `src/` trước, rồi `tools/`, rồi `docs/`. Trong nhóm, file có nhiều dòng chứa nguyên cụm từ khoá đứng trước. Trong file, dòng chứa nguyên cụm đứng trước.
- Nhóm này in tối đa 30 dòng (`max_dong=30`), các nhóm khác giữ 15.
- `tools/skill-ban-do-repo/scripts/ban_do.py`: sửa y như trên. `VERSION` lên 2, máy đã cài skill sẽ được nhắc cài bản mới.

## Đã kiểm

- `python tools/ban_do.py tim in chứng từ`: 1,8 giây, ra `src/styles/app.css:3400 /* ── Hộp in chứng từ 2 cột (T56) ── */` và `src/ui/bao-cao/InChungTu.tsx:1`.
- `python tools/ban_do.py tim lai lo 13 thang` (không dấu): ra `src/modules/home/BaBaiToanFree.tsx:32`, `:205`, đoạn chữ có dấu, đúng dòng.
- `tim` với từ không có: chạy không lỗi. `dau-phien Trum`: chạy không lỗi.
- `diff` hai bản `ban_do.py`: chỉ còn khác phần nhắc cài skill của T487.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
