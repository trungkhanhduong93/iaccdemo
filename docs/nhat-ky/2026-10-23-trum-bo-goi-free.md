# Bỏ gói Free, còn 3 gói Standard, Plus, Pro (T642)

- Ngày: 23/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- Đổi mã gói theo nghĩa: Free (F) thành Standard (S), Standard (S) thành Plus (PL), Plus (PL) và Pro (PR) gộp thành Pro (PR). Pro mới theo hành vi Pro cũ. Commit `d1a4f5d`, 62 file `src/`, `tools/kiem_tra.py`, `tools/xuat_bao_cao_he_thong.py`.
- `plan.ts`: `doiGoiTuExcel` đổi mã Excel F, S, M, A sang S, PL, PR, PR. `features.json` giữ nguyên.
- `session.tsx`: thêm `goiBan: 2`. Phiên cũ chưa có `goiBan` thì `chuanHoaStandard` đổi mã một lần. Gói mặc định là S.
- Gói thuê bao web, điện thoại còn 3 thẻ: Standard 0 đ, Plus lấy giá Standard cũ, Pro giữ giá. Bỏ logo lá mầm Free.
- Đổi tên hàm, file, lớp CSS có chữ Free sang Standard: 7 file `git mv`, 79 lớp `.m-free-*`. Commit `7d4a50a`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py` bản đủ: `Không có lỗi.`; gói S 47 màn, PL 146 màn, PR 141 màn.
- Script so mã gói từng file với bản HEAD theo bảng đổi: mọi chỗ lệch đều giải thích được (gộp `PL || PR` thành `PR`, gói mặc định S).
- Chưa mở trình duyệt xem tay màn Gói thuê bao.

## Dở dang, việc tiếp theo

- Không.
- Excel trên máy Trum vẫn ghi 4 gói. Sửa Excel xong thì sinh lại `features.json`, rồi bỏ bước đổi mã trong `doiGoiTuExcel` ở một việc riêng.
- PhuongXT (T138) và dinhlanphuongipacc (T436, T333) cần `git pull --rebase`: `Shell.tsx`, `OnboardFabi.tsx`, `MXemPhieu.tsx`, `MCcdc.tsx`, `DanhMucCuaHang.tsx` đã đổi mã gói, tên hàm.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD80.
