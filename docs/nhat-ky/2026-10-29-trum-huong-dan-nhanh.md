# Hướng dẫn nhanh từng màn, đợt 1 (T673)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Xong

## Đã làm

- Bàn hướng làm bằng bản bấm thử https://claude.ai/artifact/LP2XYAL9y5KTswcVSAKDdS, Trum chốt 5 câu, ghi QD86.
- `src/ui/HuongDanNhanh.tsx` (mới): nút la bàn và khung bên phải 4 mục: Màn này để làm gì, Làm nhanh kèm sơ đồ khung màn đánh số, Lưu ý, Đi tiếp.
- Cùng file: bộ chung theo kiểu màn cho chứng từ, danh mục, báo cáo, chức năng, Quy trình, tab Báo cáo. Đi tiếp đọc `quy-trinh.ts` theo đúng bản gói đang dùng như `QuyTrinhScreen`.
- `src/app/ModuleTabs.tsx`: gắn `NutHuongDan` cuối thanh tab, thêm lớp `co-hdn`.
- Nội dung riêng gói Standard: `src/modules/tien/huong-dan.ts` (Thu chi 2.1.1), `danh-muc/huong-dan.ts` (Quỹ tiền 1.12), `thue/huong-dan.ts` (Kê khai thuế), `ban-hang/huong-dan.ts` (Xuất bán POS 3.1.1), `kho/huong-dan.ts` (Kiểm kê 5.1.10).
- `src/styles/app.css`: mục cuối file (T673). Khung mở thì `.main` chừa 380px bên phải để không che nút của màn.
- QD86 ghi 5 màn thật: gói Standard không có Báo cáo bán hàng riêng, Kho chỉ có Kiểm kê, nên đổi sang Xuất bán POS, Kiểm kê.
- `docs/KIEN-TRUC.md` thêm file `huong-dan.ts` của phân hệ. Thêm việc T674 đến T677 vào `docs/TIEN-DO.md`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi." Máy trên mây không có Chrome ở `/opt/google/chrome/chrome` nên trỏ đường dẫn đó sang Chromium có sẵn, cài gói Python `playwright` 1.63.0.
- Mở khung ở gói Standard: Thu chi, Quỹ tiền, Kê khai thuế, Xuất bán POS, Kiểm kê, Quy trình, tab Báo cáo; gói Pro: Mua hàng, Hàng hoá, Cơ quan thuế 11.9, Báo cáo kết quả kinh doanh 10.2.3. Không lỗi console.
- `python tools/kiem_van.py` cho 6 file nội dung: sạch.
- Chưa chạy được `python tools/xuat_bao_cao_he_thong.py`: lệnh cần `../Present/tools/build_present.py`, chỉ có trên máy Trum. File Excel báo cáo chưa làm mới, chạy lại trên máy Trum.

## Dở dang, việc tiếp theo

- Chữ hướng dẫn do Clau soạn, Trum hoặc PhuongXT duyệt lại trên bản online. Sửa ở các file `huong-dan.ts` nêu trên.
- Màn báo cáo mà đầu báo cáo nằm thay thanh tab (phân hệ Báo cáo, Sổ quỹ tiền mặt gói Standard) chưa có nút la bàn: T674.
- Điện thoại chưa có: T675. Đợt 2 (Chỉ cho tôi): T676, làm sau T138. Đợt 3: T677.

## Bẫy, quyết định mới

- QD86. Không có bẫy mới.
