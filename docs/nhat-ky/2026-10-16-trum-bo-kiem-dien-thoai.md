# Bộ kiểm điện thoại chạy trọn, tiêu đề màn gói Free (T295, T298)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code giao Antigravity qua Orca
- Trạng thái cuối phiên: Dở dang

## Đã làm

- T295: Anti chạy `kiem_tra.py --dien-thoai` và tìm ra lỗi lặp chuyển hướng. Giá thành, TSCĐ gói Plus không có màn chạy trên điện thoại, nên `MQuyTrinh` chuyển hướng về chính nó. Đã sửa ở `manMobile.ts`, `MQuyTrinh.tsx` (commit 831fd6b).
- T298: thêm `<h1 className="sr-only">` ở `src/modules/home/BaBaiToanFree.tsx` (Tổng quan) và `src/modules/thue/ToKhaiHKD.tsx` (Danh sách tờ khai). Bố cục không đổi.
- T292 sửa thêm: Lịch sử thu chi, Chi phí trong tháng ẩn thanh tab dưới, nút Lập phiếu sát đáy (commit 535a35a).

## Đã kiểm

- 831fd6b: mở `/app/gia-thanh`, `/app/tscd` gói Plus ra 9-1-1, 7-1-1, hết lặp. Typecheck qua.
- 535a35a: đo ở khung 390x844 gói Free, thanh nút từ 779px tới 844px.
- T298 cùng 535a35a, 831fd6b: typecheck, build qua; `kiem_tra.py --nhanh` in `Không có lỗi.` Lớp `.sr-only` đã có sẵn trong `app.css`.

## Dở dang, việc tiếp theo

Phiên sau Trum gọi "làm tiếp": làm theo thứ tự dưới đây. Làm trong worktree `C:/Users/trung.duong/orca/workspaces/Web/icon-solar`, nhánh `trungkhanhduong93/icon-solar`, push bằng `git push origin HEAD:main`.


- Chạy bộ đầy đủ `python tools/kiem_tra.py` gói F: hết 6 lỗi "không có tiêu đề màn" ở `trang-chu/tong-quan`, `thue/to-khai`.
- T295: chạy `kiem_tra.py --dien-thoai`, sửa các bài kiểm còn chờ lớp cũ (`.m-ds-ngay-dong`, `.m-ds-ngay-so`, `.m-nv-dong`, `.m-qt2-*`, `.m-lp-buoc`, nút Tiếp tục). Chỉ đổi selector và bước bấm, không bỏ điều kiện `loi.append`. Spec giao Anti nằm ở mục "Spec T295 đã giao" cuối file này.
- Đã push 535a35a, 831fd6b và commit tiến độ này ngày 16/10/2026.

## Bẫy, quyết định mới

- `manDau` có thể trả về màn sơ đồ. Chỗ nào chuyển hướng từ sơ đồ phải loại `kind === 'quytrinh'`, kẻo lặp.

## Spec T295 đã giao

```text
Mục tiêu: hai việc nhỏ (T295, T298). (1) `python tools/kiem_tra.py --dien-thoai` chạy trọn, in `Không có lỗi.` (2) Bản máy tính gói Free: trang chủ Tổng quan và Danh sách tờ khai có tiêu đề màn h1, bộ kiểm đầy đủ hết 6 lỗi "không có tiêu đề màn".
Thư mục làm việc: C:/Users/trung.duong/orca/workspaces/Web/icon-solar (worktree riêng, KHÔNG đụng D:/IACC-CLOUD/Web).
Đọc trước: AGENTS.md, docs/BAY.md, QD65 trong docs/QUYET-DINH.md, nhật ký docs/nhat-ky/2026-10-16-trum-dien-thoai-danh-sach-gon.md và 2026-10-16-trum-phieu-mot-man.md.

Phạm vi (Target): tools/kiem_tra.py (chỉ bài kiểm điện thoại), src/ui/mobile/** (chỉ khi lỗi do code app), src/modules/home/BaBaiToanFree.tsx, src/modules/thue/ToKhaiHKD.tsx, src/styles/app.css (chỉ khi cần, mục cuối "(T298)").

Thay đổi (Change):
1. T295. T281 đổi danh sách chứng từ điện thoại sang thẻ (.m-the-ct), bỏ sơ đồ quy trình. T282 đổi lập phiếu sang một màn. Nhiều bài kiểm trong nhóm --dien-thoai còn chờ lớp cũ (vd .m-ds-ngay-dong, .m-ds-ngay-so, .m-nv-dong, .m-qt2-*, .m-lp-buoc, nút "Tiếp tục") nên dừng giữa chừng.
   - Chạy `KIEM_TRA_URL=http://localhost:5181/ python tools/kiem_tra.py --dien-thoai`, sửa từng chỗ gãy, chạy lại tới khi in `Không có lỗi.`
   - Chỉ đổi selector và bước bấm cho khớp giao diện mới. KHÔNG bỏ điều kiện `loi.append` nào, KHÔNG nới điều kiện thành luôn đúng.
   - Lỗi do code app sai (vd mất thanh dưới, tràn ngang, nút ngoài khung nhìn) thì sửa code trong src/ui/mobile, không sửa bài kiểm cho qua. Ghi lại trong báo cáo.
   - Không sửa manDauMobile, coManMobile (manMobile.ts), laBaoCao (MobileShell.tsx) trừ khi bài kiểm chứng minh sai; khi đó hỏi coordinator trước.
2. T298. Gói Free, khung 1440x900: `#/app/trang-chu/tong-quan` và `#/app/thue/to-khai` (cả `?buoc=1..4`) không có `.main h1`. Gói Plus trang chủ có h1. Thêm tiêu đề màn h1 theo cùng cách các màn khác đang làm (component Page hoặc khung tiêu đề có sẵn), không đổi bố cục khác của hai màn. Tiêu đề lấy tên màn trong registry (vd "Tổng quan", "Danh sách tờ khai").

Ràng buộc (Constraints): giữ style, đặt tên tiếng Việt không dấu, mật độ comment như file hiện có. Không đổi màu, bố cục ngoài phần nêu trên. Tên "chi nhánh" đã đổi thành "Cửa hàng" ở T294 (QD66): dùng tên mới (CUA_HANG, cuaHang). Không sửa src/app/features.json, .github/, package.json.

Quyền sửa (Ownership): chỉ sửa các file ở mục Phạm vi. File khác cần sửa thì hỏi coordinator.

Nghiệm thu (Acceptance), chạy trong worktree:
- `npm run typecheck` và `npm run build` không lỗi.
- Chạy `npx vite --port 5181 --strictPort` ở terminal phụ (cổng 5180 phiên khác dùng).
- `KIEM_TRA_URL=http://localhost:5181/ python tools/kiem_tra.py --dien-thoai` in `Không có lỗi.`
- `KIEM_TRA_URL=http://localhost:5181/ python tools/kiem_tra.py --nhanh` in `Không có lỗi.`
- Trong thư mục tools, chạy riêng và phải trả về danh sách rỗng: `python -c "import kiem_tra as k; print(k.kiem_tra_lap_phieu_dot_5(), k.kiem_tra_dang_nhap_dot_8(), k.kiem_tra_dot_12_b(), k.kiem_tra_dot_17_a(), k.kiem_tra_dot_15_a(), k.kiem_tra_dot_11_b(), k.kiem_tra_dot_22_b())"` (đặt KIEM_TRA_URL như trên).
- Mở hai màn T298 gói Free khung 1440x900, đếm `.main h1` lớn hơn 0. Chụp 2 ảnh vào C:/Users/TRUNG~1.DUO/AppData/Local/Temp/claude/D--IACC-CLOUD-Web/652367bd-4b89-4336-b4e6-d42c82efaa9b/scratchpad/anh-T298/, tự xem.
- Tắt vite khi xong. Không còn console.log, file tạm, script debug trong repo.
Skill phải nạp: ponytail
Cách làm: làm thay đổi nhỏ nhất chạy đủ.

Báo xong (worker_done), tối đa 10 dòng: dòng đầu "Đã nạp: ponytail"; danh sách file đã sửa; tên các bài kiểm đã sửa; lỗi code app đã sửa (nếu có); lệnh nghiệm thu và kết quả.
```
