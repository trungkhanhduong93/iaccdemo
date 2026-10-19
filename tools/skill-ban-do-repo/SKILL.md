---
name: ban-do-repo
description: Dựng bản đồ repo cho một project để agent tra code bằng script thay vì đọc nguyên file, tốn ít token nhất. Dùng khi người dùng nói "bản đồ repo", "tạo bản đồ repo", "map repo", "agent đọc code tốn token quá", "đầu phiên tốn token", "dọn rác repo", hoặc sang project mới chưa có tools/ban_do.py. Project đã có tools/ban_do.py thì không dựng lại, chỉ dùng lệnh của nó.
---

# Bản đồ repo

Script đọc thay agent, agent chỉ nhận vài trăm token kết quả dạng `file:dòng`. Không commit file bản đồ sinh sẵn: nhiều người cùng push thì file đó xung đột, để lâu thì lệch code. Bản gốc làm ở iaccdemo (T485, T487, QD74 trong `docs/QUYET-DINH.md` của repo đó). Skill này cài từ `tools/skill-ban-do-repo/` của iaccdemo bằng `python tools/cai_skill_ban_do.py`.

## 1. Kiểm trước

- Repo đã có `tools/ban_do.py`: chạy `python tools/ban_do.py --help`, dùng luôn. Dừng skill.
- Chưa có: làm tiếp mục 2. Không đọc code để "hiểu trước", việc đó là thứ skill này thay.

## 2. Khảo sát rẻ (chỉ lệnh, không Read)

```bash
python "{{SKILL_DIR}}/scripts/soi_repo.py" tong-quan
ls AGENTS.md CLAUDE.md GEMINI.md .cursorrules 2>/dev/null
```

Ghi lại 4 thứ: thư mục code chính, file trên 20 KB, file sinh tự động hoặc file dữ liệu lớn (icon, json sinh, lock, bundle), file luật agent.

## 3. Cài script vào repo

Chỉ cần khi repo có nhiều người cùng làm. Repo một mình thì mục 6 là đủ.

1. Chép `{{SKILL_DIR}}/scripts/ban_do.py` vào `<repo>/tools/ban_do.py`. Repo có sẵn thư mục script khác (`scripts/`, `bin/`) thì đặt ở đó.
2. Script mẫu là bản iaccdemo (React, `src/`). Sửa theo kết quả mục 2, tìm chỗ sửa bằng Grep `ROOT /`:
   - `BO_QUA_TAP_TIN`, `BO_QUA_THU_MUC` ở đầu file: file sinh tự động, dữ liệu lớn, thư mục build.
   - `lenh_tim`: nhóm "Màn" quét `src/modules`, `src/app` tìm `slug:`, `ten:`. Repo không có khai báo màn kiểu này thì bỏ nhóm. Nhóm "Hàm/kiểu" quét `src`, `scan_dirs` là các thư mục đếm chữ thường. Đổi theo thư mục code thật.
   - `lenh_tim`, `lenh_css`: thư mục CSS `src/styles`. Không có CSS thì bỏ lệnh `css`.
3. Lệnh riêng của iaccdemo: `dau-phien` đọc `docs/TIEN-DO.md`, `docs/luu-tru/TIEN-DO-xong.md`, `docs/nhat-ky/`; `qd` đọc `docs/QUYET-DINH.md`; `bay` đọc `docs/BAY.md`. Repo có tài liệu tương đương thì sửa đường dẫn và định dạng bảng cho khớp. Không có thì xoá lệnh đó cùng nhóm "Quyết định", "Bẫy" trong `lenh_tim`.
4. Hook cho Claude: chép `{{SKILL_DIR}}/scripts/chan_doc_lon.py` vào `<repo>/.claude/hooks/`, sửa danh sách file cấm đọc trong biến `cam_doc`. Ghép khối PreToolUse trong `scripts/settings-mau.json` vào `<repo>/.claude/settings.json`. File đã có thì ghép thêm, không ghi đè. Giữ nguyên lệnh `python -c … runpy`: gọi thẳng `python .claude/hooks/x.py` mà sai cwd thì Python thoát mã 2 và chặn mọi lệnh Read.

## 4. Ghi luật cho mọi agent

Thêm mục "Tìm code" vào file luật mà mọi agent cùng đọc. Có `AGENTS.md` thì ghi vào đó, chỉ có `CLAUDE.md` thì ghi vào `CLAUDE.md`. Tối đa 8 dòng, chép từ `{{SKILL_DIR}}/scripts/muc-tim-code.md` rồi sửa đường dẫn. Agent khác Claude không đọc `.claude/`, nên luật phải nằm ở đây.

## 5. Nghiệm thu

- Mọi lệnh con chạy không lỗi, không vỡ dấu tiếng Việt trên PowerShell 5.1, mỗi lệnh in tối đa 150 dòng.
- `file <file lớn nhất>` không còn khối nào trên 300 dòng mà chưa chia khối con.
- Lấy 3 commit gần nhất có sửa code. Chỉ dùng `tim`, `file`, `css` phải ra đúng file và vùng dòng mà commit đó sửa, so với `git show --stat <hash>`.
- Hook: JSON đọc file lớn không có `limit` thì exit 2; có `limit` ≤400 thì exit 0; JSON hỏng thì exit 0.

Đạt hết thì commit theo luật của repo đó, báo người dùng số token đầu phiên trước và sau (ước theo KB file từng phải đọc).

## 6. Soi quan hệ và dọn rác

`scripts/soi_repo.py` chạy được với mọi repo git, không chép vào repo, không commit. Chạy trong thư mục repo:

```bash
python "{{SKILL_DIR}}/scripts/soi_repo.py" tong-quan
python "{{SKILL_DIR}}/scripts/soi_repo.py" lien-quan <file>
python "{{SKILL_DIR}}/scripts/soi_repo.py" vung <thư mục>
python "{{SKILL_DIR}}/scripts/soi_repo.py" don
```

- `tong-quan`: khung project khoảng 30 dòng, gồm nhánh, worktree, công nghệ, file luật cần đọc, vùng code kèm một dòng mô tả, lõi chung, file lớn, vùng đứng riêng. Chạy đầu phiên ở repo chưa quen.
- `lien-quan`: file này dùng gì, ai dùng nó (2 tầng), mục CSS của nó, file hay sửa cùng (300 commit gần nhất). File bị từ 15 file import trở lên ghi "lõi chung", không cần mở.
- `vung`: thư mục dính vùng nào, và các vùng cùng cấp không dính gì để bỏ qua.
- `don`: chỉ chạy khi người dùng gọi ("dọn rác repo"). Mặc định chỉ ghi báo cáo vào `<thư mục cha của repo>/_can-xoa/<repo>/<ngày giờ>/`. Thêm `--chuyen` mới chuyển file XANH vào đó, kèm `hoan-lai.ps1`. Không xoá file nào, không chạy `git rm`, `git clean`.
  - XANH: file chưa từng commit, khớp mẫu file tạm, sửa lần cuối hơn 2 giờ trước.
  - VÀNG: file chưa commit khác, file code hoặc tài liệu không ai import và không ai nhắc tên, mục CSS có class không file nào dùng, nhánh đã gộp.
  - ĐỎ: cấu hình, file đầu vào, `.env*`, `.github/`, file luật, lõi chung, mẫu trong `.git/info/ban-do-giu`.

## 7. Dọn CSS thừa: bắt buộc đủ 4 lớp

Chỉ làm khi người dùng giao việc dọn CSS. Repo nhiều người thì nhận việc theo luật repo, ghi file CSS vào cột Ghi chú. Thiếu một lớp thì không push.

1. Hai cách đoán cùng đồng ý. Danh sách từ `soi_repo.py don` (đọc code) giao với CSS coverage của Playwright (`page.coverage` hoặc CDP `CSS.startRuleUsageTracking`) sau khi mở mọi màn ở khung máy tính và các khung điện thoại. Chỉ xoá rule cả hai cùng báo không dùng.
2. Chụp mọi màn ở mọi khung trước và sau khi xoá, so từng điểm ảnh. Lệch 1 điểm ảnh thì trả lại các rule vừa xoá của màn đó.
3. Ghi `getComputedStyle` (màu, cỡ chữ, margin, padding, kích thước) của mọi phần tử nhìn thấy, trước và sau khi xoá. Khác một giá trị thì trả lại.
4. Xoá theo đợt, tối đa 10 mục CSS một commit. Mỗi đợt chạy typecheck, build, test của repo. Đợt lỗi thì `git revert` đúng commit đó.

Không xoá đợt này: rule có `:hover`, `:focus`, `:active`, `::before`, `::after`, `@media print`, rule của hộp thoại, menu xổ, toast. Gom các rule đó vào danh sách riêng cho người dùng hoặc người làm màn xác nhận.

## 8. Cập nhật skill

Bản gốc nằm ở `tools/skill-ban-do-repo/` của iaccdemo. Sửa skill thì sửa ở đó, tăng số trong `VERSION`, commit, rồi chạy `python tools/cai_skill_ban_do.py` để cài lại máy mình. Máy khác thấy bản mới khi chạy `python tools/ban_do.py dau-phien <tên>`.
