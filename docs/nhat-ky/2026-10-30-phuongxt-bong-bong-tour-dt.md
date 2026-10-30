# Bong bóng tour điện thoại cho nổi, đóng màn làm ngay thì tour chạy tiếp (T138)

- Ngày: 30/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn chờ góp ý)

## Đã làm

- `app.css`, mục cuối "Điện thoại: mọi bong bóng hướng dẫn…": trên điện thoại mọi `.hdan-bong` viền xanh, dải nền xanh nhạt đầu, chữ đậm; `.hdan-lo` viền xanh, nền tối đậm hơn; dải `.hdan-dai-dt` nền xanh đặc. Hiệu ứng trượt vào chỉ đặt cho `.hdan-khen`, không đặt cho bong bóng `.giua` vì transform làm lệch tâm.
- `HuongDan.tsx`: nút Bỏ qua hiện cả bước cuối. Thêm `boViecHuongDan(viec, dv, nav)`: đóng màn làm ngay chưa lưu thì về Trang chủ chạy bước sau, việc ở bước cuối thì chỉ vào nút Xem lại hướng dẫn (`Tiep.bo`). Xét sau một nhịp vì Đã nộp CQT đóng hộp trước rồi mới gọi `xongViecHuongDan`.
- `KhoanhSoDuQuy`: ô Số dư ban đầu đã thấy rồi mất quá 400ms thì coi là đóng form quỹ chưa lưu, gọi `boViecHuongDan('quy')`.
- `dauMan` (dải hướng dẫn điện thoại): chọn đầu của lớp cố định cao nhất trước (`lopCua`), cùng lớp mới xét chữ trên cùng. Trước đây form quỹ mở thì dải nhảy mỗi giây giữa đầu form và tiêu đề màn phía sau, vì phép thử bị che bằng `elementsFromPoint` trên Safari iPhone lúc được lúc không (video PhuongXT gửi). Bản đó lên online iPhone vẫn nhảy: thêm chữ trong lớp cố định không thử bị che, và dải đã ở lớp nổi còn hiện thì không tụt về lớp thấp hơn (`tut` trong `DaiHuongDanDt`). Chromium, WebKit trên máy tính đều không tái hiện được, kể cả bản cũ; chờ PhuongXT thử trên iPhone.
- `ToKhaiHKD.tsx`, `MToKhaiHKD.tsx`: đóng hộp chọn kỳ, hộp các bước tờ khai gọi `boViecHuongDan('thue')`. `OnboardFabi.tsx` `deSau`: thoát hỏi kê khai cũng gọi.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Khung 375px gói Standard: bong bóng 4 bước nằm trong màn, bước chào giữa màn. Bấm Nhập số dư quỹ rồi Huỷ: về Trang chủ, sang bước Kê khai thuế. Mở Kê khai thuế, Lập tờ khai thuế rồi Huỷ: về Trang chủ, bong bóng Xem lại hướng dẫn ở đây.
- Chưa bấm thử luồng Đã nộp CQT sau khi sửa (khen vẫn phải hiện), chưa thử thoát popup hỏi loại hình (đơn vị mẫu không có `choKeKhai`).

## Dở dang, việc tiếp theo

- PhuongXT, Trum xem bản online, góp ý tiếp.
- Bước Tạo phiếu chi: đóng phiếu chưa lưu thì tour vẫn đứng im. Chưa sửa vì `MDtThuChiLap.tsx` nằm trong việc T552 của Trum, `ChungTuForm.tsx` là file dùng chung; hỏi Trum rồi gọi `boViecHuongDan('chi', …)` ở chỗ đóng form.

## Bẫy, quyết định mới

- Không.
