# Khung web kiểu AMIS, menu thả xuống, đưa lên online, bộ tài liệu nhóm (T00)

- Ngày: 07/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Dựng khung web theo các điểm Trum duyệt (QD01 đến QD06): 13 phân hệ, 120 tính năng Excel, 4 gói, dữ liệu giả công ty Phố Mây.
- Đổi bố cục sang kiểu AMIS (QD08): sidebar phân hệ lớn, thanh tab ngang có "Khác", form chứng từ toàn màn hình. Thêm màn Quy trình cho 11 phân hệ với 39 ô mở thẳng form, tab Báo cáo cho 9 phân hệ.
- Sửa kiểu màn: trước chiều 07/10 kiểu màn chỉ theo nhóm Excel nên 2.1.3, 5.1.7, 5.1.8, 7.1.3, 8.1.2, 8.1.3, 10.1.1 dựng sai kiểu. Nay kiểu màn theo cấu hình khai trong `rieng`.
- Thay dấu vẽ bằng CSS bằng logo thật của IACC Cloud, kể cả favicon.
- Làm lại mọi menu thả xuống bằng `src/ui/Dropdown.tsx`, đổi 22 thẻ select sang `Select`, sửa lỗi không bấm được gói trong Xem thử, đổi biểu tượng Hệ thống sang bánh răng (QD09).
- Đưa lên GitHub `trungkhanhduong93/iaccdemo` và Cloudflare Pages https://iaccdemo.pages.dev (QD07). Trum mời PhuongXT và dinhlanphuongipacc vào repo với quyền ghi.
- Tách KE-HOACH.md thành bộ tài liệu nhóm: `README.md`, `BAT-DAU.md`, `AGENTS.md`, `CLAUDE.md`, `CHANGELOG.md`, các file trong `docs/` (QD10).
- Thêm robot `.github/workflows/deploy.yml`: kiểm, build, deploy mỗi lần push lên `main` (QD11). Đặt secret `CLOUDFLARE_ACCOUNT_ID`.
- Chép script soát chữ vào `tools/kiem_van.py`, `tools/mau.py`. Thêm `strictPort` cho cổng 5180, thêm `.gitattributes`, bổ sung `.gitignore`.

## Đã kiểm

- `npm run typecheck` sạch, `npm run build` xanh. Vite cảnh báo gói JS hơn 500 kB (việc T13).
- `tools/kiem_tra.py` đủ 4 gói: 792 lượt mở màn, không lỗi console, không trắng trang, không tràn ngang. Ô Quy trình mở đúng form, Esc về đúng Quy trình. Cân đối kế toán, cân đối số phát sinh, lưu chuyển tiền tệ cân ở kỳ 8, 9, 10 với gói Starter, Medium, Advance.
- Menu thả xuống ở màn 1280x720: lật lên khi sát đáy, Tab rời ô chọn đúng, bấm nhãn khi đang mở thì đóng. Mục khoá trong "Khác" mở trang Nâng cấp, lọc trạng thái đúng, đổi đơn vị sang Trà Lá ra gói Advance, không lỗi console.
- Bản online: đăng nhập, chọn đơn vị, đổi gói trong Xem thử, mở form Phiếu thu từ Quy trình, Esc về Quy trình, không lỗi console. Trang trả `x-robots-tag: noindex`.
- Soát chữ giao diện bằng `kiem_van.py --loai giao-dien`: 0 ĐỎ, 0 VÀNG. Soát 12 file tài liệu: 0 ĐỎ, còn VÀNG in đậm ở `docs/TRIEN-KHAI.md` vì đó là tên nút trên Cloudflare và GitHub.

## Dở dang, việc tiếp theo

- Trum tạo token Cloudflare cho robot (T01). Chưa có token thì robot chỉ kiểm và build, không đưa lên online.
- dinhlanphuongipacc chưa nhận lời mời vào repo, hạn 17:17 ngày 14/10/2026.
- Việc tiếp theo theo thứ tự ở `docs/TIEN-DO.md`.

## Bẫy, quyết định mới

- Quyết định mới: QD10, QD11 trong `docs/QUYET-DINH.md`.
- `docs/BAY.md`: bỏ bẫy lớp `.dd-pop` vì lớp này không còn trong code. Thêm bẫy cổng 5180, `npm ci`, xuống dòng, chữ tiếng Việt trên Windows.
