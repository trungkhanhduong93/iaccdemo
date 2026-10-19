# Công cụ bản đồ repo cho agent (T485)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết phần lớn `tools/ban_do.py`
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `tools/ban_do.py` với 7 lệnh: `dau-phien`, `tim`, `file`, `css`, `qd`, `bay`, `nhanh`. Chỉ dùng thư viện chuẩn Python.
- Lệnh `file` dựng dàn ý theo cây thụt lề. Khối trên 300 dòng chia tiếp, khối JSX không có comment `──` thì chia theo thẻ mở. Khối dưới 15 dòng liền nhau gộp một dòng.
- Chuyển bảng "Đã xong" từ `docs/TIEN-DO.md` sang `docs/luu-tru/TIEN-DO-xong.md`, sửa link tương đối thêm `../`.
- `tools/xuat_bao_cao_he_thong.py` đọc thêm file lưu trữ.
- Hook `.claude/hooks/chan_doc_lon.py` và `.claude/settings.json`: Claude Code bị chặn đọc file trên 20 KB khi không có `limit` hoặc `limit` trên 400, bị chặn đọc `icon-dac.ts`, `features.json`, `dist/`.
- Skill `.claude/skills/ban-do/SKILL.md`. `AGENTS.md` sửa mục Đầu phiên, thêm mục "Tìm code", sửa bước chuyển dòng ở Cuối phiên. Ghi QD74.

## Đã kiểm

- Mọi lệnh con chạy không lỗi, không vỡ dấu. Output dài nhất 73 dòng (`qd`), `dau-phien Trum` 34 dòng. `tim` mất khoảng 2 giây, các lệnh khác dưới 2,5 giây.
- `file`: 15 file `src/` lớn nhất không còn khối nào trên 300 dòng chưa chia. `MLapPhieu.tsx` (104 KB) ra 67 dòng dàn ý.
- Tìm ngược commit `c4ddfae`: `tim T476` ra `MBaoCaoDong.tsx` và mục CSS; `css T480`, `css T481` ra đúng mục; `tim lich su thu chi` ra màn `lich-su-quy`.
- `load_all_tasks()`: 472 việc trước và sau khi tách. 180 link trong file lưu trữ đều trỏ tới file có thật.
- Hook qua bash, 9 ca: file lớn không `limit` chặn, `limit` 200 cho qua, `limit` 2000 chặn, `icon-dac.ts` chặn, file nhỏ, file không có, file ngoài repo, JSON hỏng, sai `CLAUDE_PROJECT_DIR` đều cho qua.
- `npm run typecheck`, `npm run build`: chạy xong, không lỗi. Không sửa `src/` nên không chạy `kiem_tra.py`.
- Chưa kiểm: hook trong một phiên Claude Code thật mở ở repo này. Gọi qua `cmd` lúc test trả mã 1 (không chặn), chưa rõ do cách gọi `cmd` từ Git Bash hay do lệnh.

## Dở dang, việc tiếp theo

- Không. Phiên Claude Code đầu tiên mở repo sau khi pull: thử Read nguyên `src/ui/mobile/MLapPhieu.tsx`, phải bị hook chặn. Không bị chặn thì xem mục Bẫy dưới đây.

## Bẫy, quyết định mới

- QD74 trong `docs/QUYET-DINH.md`.
- Ghi vào `docs/BAY.md`: Python không thấy file script thì thoát mã 2, đúng mã hook dùng để chặn, nên lệnh hook gọi qua `runpy` và tự kiểm file tồn tại.
