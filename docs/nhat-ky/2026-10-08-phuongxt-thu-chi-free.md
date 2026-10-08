# Thu chi gói Free, thanh trên chọn chi nhánh, sơ đồ Quy trình tiền (T25, T32)

- Ngày: 08/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T25), Xong (T32)

## Đã làm

- Trả T03 về Chờ: PhuongXT tập trung gói Free, không hạch toán. Đổi tên T25 thành thu chi gói Free theo sheet Roadmap.
- `ChungTuForm.tsx`, `nhom.ts`, `data/mock.ts`, `danh-muc/index.ts`: ô Lý do thu, Lý do chi ở đầu phiếu thu chi, tự chọn theo diễn giải. Lý do lấy chung một nguồn `LY_DO` với Danh mục lý do 1.16 (13 lý do). Ô này đã khai trong `nhom.ts` từ trước nhưng mất khi làm lại form ở T15.
- `BangSua.tsx`, `VoucherScreen.tsx`: prop `coKm`, gói Free bỏ cột Khoản mục, Công việc ở dòng phiếu tiền. Phiếu không có đối tượng thì bỏ cột Đối tượng ở dòng. Khung chi tiết dưới danh sách dùng cấu hình theo loại phiếu.
- `ChungTuForm.tsx`: phiếu thu chi chỉ có một dòng Tổng tiền.
- `session.tsx`, `Topbar.tsx`, `Shell.tsx`, `app.css`: thanh trên bỏ ô tìm, ô kỳ, trạng thái FABi; thêm ô chọn chi nhánh làm việc có "Tất cả chi nhánh". Ô tìm nhanh lên đầu sidebar.
- `danh-muc/index.ts`: thêm Danh mục chi nhánh `/app/danh-muc/chi-nhanh`, đặt sau Danh mục kho.
- `VoucherScreen.tsx`: danh sách chứng từ lọc theo chi nhánh trên thanh trên, bỏ bộ lọc chi nhánh riêng, cột Chi nhánh chỉ hiện khi xem tất cả.
- `ChungTuForm.tsx`: chi nhánh lên nhãn đầu form, bỏ ô Chi nhánh lập. Đang xem tất cả mà lập chứng từ mới thì hiện bước chọn chi nhánh.
- `tien/index.ts`, `nhom.ts`, `ChungTuForm.tsx`, `Shell.tsx`: loại phiếu Nộp tiền vào ngân hàng (`nop`) đổi thành Chuyển quỹ (`cq`), có ô Từ quỹ, Đến quỹ, Người thực hiện.
- `types.ts`, `QuyTrinhScreen.tsx`, `tien/quy-trinh.ts`, `app.css`: sơ đồ Quy trình kiểu hội tụ `hoiTu`, dùng cho phân hệ Tiền. Tách ô sơ đồ thành component `ONut` dùng chung.
- `plan.ts`: `THEO_ROADMAP` mở 1.12 Danh mục quỹ tiền và 2.2.3 Sổ ngân hàng cho gói Free (QD19), không sửa `features.json`.
- `tools/kiem_tra.py`: bấm ô "Thu tiền mặt" thay ô "Phiếu thu" cũ trên sơ đồ tiền.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, còn cảnh báo gói JS hơn 500 kB cũ (T13).
- `python tools/kiem_tra.py` đủ 4 gói trên bản đã gộp 12 commit mới của Trum: 772 lượt mở màn, "Không có lỗi."
- `kiem_van.py --loai giao-dien` cho mọi file `src/` đã sửa: sạch.
- Xem trên trình duyệt ở gói Free và Medium: form phiếu thu, chi, thu qua ngân hàng, chuyển quỹ; chọn chi nhánh khi đang xem tất cả; danh sách lọc theo chi nhánh (Nguyễn Trãi 22/45 phiếu); sơ đồ Quy trình gọn một trang ở 1366×768 và 1440×900.
- Lúc pull về có xung đột ở `Shell.tsx`, `app.css`, `ChungTuForm.tsx`. Đã giữ logo, màu iFaster của Trum và thêm phần của phiên này.

## Dở dang, việc tiếp theo

- T25: Sổ quỹ 2.2.1, Sổ ngân hàng 2.2.3, Sổ công nợ 2.2.5 chưa lọc theo chi nhánh trên thanh trên, vẫn có ô chọn quỹ riêng. Ở gói Free, chỗ ký "Kế toán trưởng" trên sổ chưa đổi. PhuongXT đi tiếp từng màn.
- Gói Free còn ô chọn chi nhánh dù Roadmap ghi gói nhỏ một điểm bán. Chưa chốt.
- T33 chờ Trum cập nhật Excel tính năng.
- T25 trùng mã với việc T25 của Trum ở bảng Đã xong, nhờ Trum đổi mã.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: thêm QD17, QD18, QD19.
- Khi đọc lại sheet Roadmap, đọc lại cả các dòng đã đọc trước: sheet đổi giữa hai lần đọc làm sót dòng 1.12.
