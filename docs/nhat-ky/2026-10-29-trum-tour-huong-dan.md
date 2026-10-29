# Hướng dẫn nhanh đổi sang kiểu tour như Trang chủ (T681)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/HuongDanNhanh.tsx`: thay dải bước, số cam, khung Xem đủ hướng dẫn bằng tour theo QD88. Bong bóng đầu giữa màn (Màn này để làm gì, Bắt đầu), mỗi bước khoanh sáng chỗ thật (dùng lại `timCho`, `KHUON`, `data-hd`), bong bóng cuối (Lưu ý, Đi tiếp gọn, Xong). Viết hàm riêng `choTour`, `viTriBong`, `useCaoBong`, không import từ `src/modules/home/HuongDan.tsx`.
- Tiếp tự làm thao tác: bước kế nằm trong form thì mở form (`diMoForm`); thanh trên xem Tất cả cửa hàng thì có bước "chọn cửa hàng" khoanh `.chon-cn`, Tiếp bấm cửa hàng đầu tiên; bước `luu` bấm Lưu, form tự đóng, bước sau khoanh dòng phiếu vừa lưu trong `.main table.tbl`. Lưu không được (thiếu ô) thì ở lại bước Lưu.
- Quay lại về bước chọn cửa hàng thì trả cửa hàng trên thanh trên về như cũ để form hỏi lại. Bước ngoài form mà form đang mở thì đóng form không hỏi.
- Bỏ qua, Xong: đóng form, xoá phiếu mẫu, trả cửa hàng, `nav` về đường dẫn lúc bấm nút (có cả tab). Lớp tối chặn bấm, chặn luôn phím của màn dưới (Esc, Ctrl + S); Tab, Enter, phím cách trong bong bóng vẫn dùng được.
- Bước không tìm được chỗ thật: bong bóng giữa màn, kèm sơ đồ khung màn (`soDo`) nếu màn có, ô của bước sáng cam.
- Bước có nút làm ngay mà Tiếp không tự làm (vd Mở Thu chi tiền mặt ở Sổ quỹ, Nhập số dư Quỹ tiền): bấm nút thì tắt tour, trả lại như cũ rồi sang màn đó. Bấm chỗ Đi tiếp, Mở sơ đồ Quy trình trong bong bóng cuối cũng tắt tour trước.
- `src/ui/huongDanForm.ts`: `datDaiChay` đổi thành `datTourChay`, `baoDaLuu({ man, id, so })` ghi phiếu mẫu lưu lúc tour chạy, thêm `phieuTour()`.
- `src/ui/generic/ChungTuForm.tsx`: chỉ gọi `baoDaLuu` khi lưu phiếu mới, kèm `man`, `id`, `so`. Sửa 2 chú thích.
- `src/ui/generic/daXoa.ts`: thêm `boPhieuMoi(man, id)` bỏ hẳn phiếu mới lưu, cả phiếu thu chi, phiếu điều chỉnh sinh kèm và nhật ký của chúng. Phiếu mẫu không vào Đã xoá, số phiếu kế tiếp lùi lại.
- `src/ui/FormToanMan.tsx`: sửa 2 chú thích còn nhắc dải.
- `src/styles/app.css`: bỏ CSS dải, số cam, khung đủ ở các mục T673, T674, T679, T680, bỏ hẳn mục T676. Thêm mục T681 cuối file, dùng lại `.hdan-*` của tour Trang chủ.
- `tools/kiem_tra.py`: `kiem_tra_t676_huong_dan` đổi thành `kiem_tra_t681_tour_huong_dan`.
- `docs/QUYET-DINH.md` (QD87, QD88), `docs/KIEN-TRUC.md`, `CHANGELOG.md`, `docs/TIEN-DO.md`, `docs/luu-tru/TIEN-DO-xong.md`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần đầu báo 1 lỗi `[PR] #/app/tien/2-2-3: tràn ngang ở ['.main']`. Mở thẳng màn đó thì không tràn, thay đổi T681 không đụng bố cục báo cáo; bộ kiểm chỉ chờ 60ms sau khi bấm nên có thể bắt lúc báo cáo đang tự cân cột. Chạy lại: `Không có lỗi.` Máy mây không có Chrome nên chạy bằng Chromium có sẵn, qua một file `sitecustomize.py` tạm bỏ `channel='chrome'`, không sửa `kiem_tra.py`.
- Hàm kiểm tour mới chạy riêng ở 6 màn gói Standard: đúng. Kiểm bong bóng đầu giữa màn, bấm vùng tối không tắt, tâm chỗ khoanh trúng chỗ thật của từng khoá, bong bóng không tràn màn, có bước chọn cửa hàng và Tiếp tự chọn, Lưu xong khoanh phiếu vừa lưu. Xong và Bỏ qua trong form thì đường dẫn, cửa hàng, số dòng, dòng đầu danh sách như lúc bấm nút. Quay lại về bước chọn cửa hàng thì form hỏi lại.
- Chụp 3 ảnh Thu chi (bước Thêm mới, bước đầu form, bong bóng cuối) để xem chỗ đặt bong bóng: đúng.
- `python tools/kiem_van.py` cho `src/ui/HuongDanNhanh.tsx` và các file tài liệu đã sửa: không có mục ĐỎ.
- Chưa thử trên Chrome có giao diện, tỉ lệ màn 125–150%.
- Chưa chạy `python tools/xuat_bao_cao_he_thong.py`: lệnh cần `../Present/tools/build_present.py` ở máy Trum, máy mây không có. Lần sau chạy trên máy Trum để làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Dở dang, việc tiếp theo

- Không.
- Dữ liệu giả Thu chi đã có sẵn phiếu PC2610-0261 ("Tiền nhà 6 tháng"), trùng với số phiếu chi mới đầu tiên mà `soKeTiep` cấp. Ghi thành việc T682.

## Bẫy, quyết định mới

- Không có bẫy mới. Sửa QD87 (dải, số cam, khung đủ không còn dùng), QD88 (đã làm).
