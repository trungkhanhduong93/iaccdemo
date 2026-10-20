# 10 lỗi giao diện điện thoại, dò code và viết spec cho Anti (T527, T528, T529)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity làm
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Dò code cho 10 lỗi Trum nêu, chia thành 3 việc T527, T528, T529 trong `docs/TIEN-DO.md`.
- Viết spec cho Anti trong `backup/` (thư mục bị gitignore, chỉ có trên máy Trum ở `D:\IACC-CLOUD\Web-dt\backup\`):
  + `plan-T527-T529.md`: các điểm Trum chốt, cách chia làn, thứ tự giao.
  + `spec-T527-B.md`: Lịch sử thu chi, Đính kèm bản Free, tab "Chi tiết (n)" thừa. Giao Anti B (WSL).
  + `spec-T528-A.md`: thẻ hàng điền nhanh ở phiếu mua hàng, ô % bỏ số 0 đầu, ô Số hoá đơn và Ký hiệu bỏ gạch dưới. Giao Anti Windows.
  + `spec-T529-A.md`: bộ lọc lọc thật dữ liệu, đầu báo cáo theo Sổ quỹ, thẻ Tổng cộng nền trắng, kẻ thừa trên Tồn cuối ngày. Giao Anti Windows sau T528.
- Đã giao T528 (Windows) và T527 (Anti B) lúc 00:07. Sau 30 phút cả hai mới đọc code, chưa sửa dòng nào. Trum bảo dừng, Claude dừng cả hai lúc 00:38.

## Đã kiểm

- `git status`: không file code nào đổi. Không có gì để kiểm typecheck, build.

## Dở dang, việc tiếp theo

- Chưa sửa code. Cả 3 việc làm lại từ đầu theo spec, không có bản dở cần giữ.
- Trum nói "giao lại dở dang T527–T529" thì làm theo `backup/plan-T527-T529.md` từ bước 3: việc đã nhận và đã push nên bỏ qua bước 1, 2.
  + Giao T528 làn Windows: prompt chỉ trỏ tới `backup/spec-T528-A.md`, khối LUẬT CẤM ghi thẳng trong prompt.
  + Giao T527 làn WSL: mở tab Anti B, prompt trỏ tới `/mnt/d/IACC-CLOUD/Web-dt/backup/spec-T527-B.md`.
  + T528 xong và đã nghiệm thu thì giao T529.
- Lần này Anti mất khoảng 13 phút chỉ để nghĩ. Lần sau dặn trong prompt: đọc đúng các dòng spec đã ghi, không dò lại cả file, mỗi ý sửa xong báo một dòng.
- Lệnh dừng đi qua `orchestration send` hay `terminal send` đều nằm hàng chờ tới khi Anti hết lượt nghĩ. Muốn dừng nhanh thì `worker-stop` luôn.
- Lúc điều phối có thêm một phiên Claude khác mở trong `D:/IACC-CLOUD/Web-dt`. Trước khi giao, kiểm tra phiên đó không sửa các file trong spec.

## Bẫy, quyết định mới

- Không.
