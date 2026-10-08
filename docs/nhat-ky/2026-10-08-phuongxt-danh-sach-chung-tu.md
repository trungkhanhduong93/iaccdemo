# Danh sách chứng từ lọc từng cột, công cụ dạng biểu tượng; tên loại phiếu thu chi (T39, T25)

- Ngày: 08/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong (T39), Dở dang (T25)

## Đã làm

- T25, `tien/index.ts`, `tien/quy-trinh.ts`, `ban-hang/quy-trinh.ts`, `Shell.tsx`: loại phiếu đổi tên Thu tiền mặt, Chi tiền mặt, Thu ngân hàng, Chi ngân hàng; Chuyển quỹ xuống cuối. Thêm nhanh mục Tiền có đủ 5 loại. `kiem_tra.py` bấm ô "Thu tiền mặt".
- `Page.tsx`: bỏ dòng mã tính năng, giai đoạn, nhãn gói dưới tiêu đề mọi màn (bỏ `FeatureMeta`).
- `Shell.tsx`, `app.css`: dòng "Phiên bản [gói]" dưới logo sidebar, bấm mở Gói thuê bao.
- `LocCot.tsx` (mới), `Table.tsx`: prop `loc` bật hàng lọc dưới tiêu đề. Ô lọc có phễu điều kiện theo kiểu cột chữ, số, ngày; cột phân loại tick giá trị.
- `CongCuDs.tsx` (mới), `Icon.tsx`: nút Excel (logo xanh, menu Nhập, Xuất), nút Tuỳ chỉnh giao diện (biểu tượng `chinh`, ẩn hiện cột).
- `VoucherScreen.tsx`: cột STT; lọc từng cột; kỳ lên đầu trang cạnh nút Excel, Tuỳ chỉnh giao diện; bỏ thanh lọc dưới, ô tìm, lọc trạng thái, nút In. "Xoá bộ lọc" xoá cả lọc từng cột.
- `app.css` (mục T39 cuối file): bỏ 50/50, khung chi tiết tối đa 38vh; kiểu ô lọc, phễu, nút Excel.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py` đủ 4 gói: 629 lượt mở màn, "Không có lỗi."
- `kiem_van.py --loai giao-dien` các file đã sửa: sạch.
- Trình duyệt 1440×900: danh sách 2.1.1 hiện 8 phiếu; lọc cột Loại "chi tien" ra 3 phiếu; phễu "Lớn hơn" cột Tổng tiền 20.000.000 ra 4 phiếu; menu Excel; danh sách Mua hàng 4.1.1 gói Medium cũng đổi theo.
- Trước khi push đã gộp T37 (biểu tượng) và việc nhận T38 của Trum, không xung đột.

## Dở dang, việc tiếp theo

- PhuongXT kiểm tiếp ngày 09/10.
- T25: Sổ quỹ 2.2.1, Sổ ngân hàng 2.2.3, Sổ công nợ 2.2.5 lọc theo chi nhánh trên thanh trên; gói Free đổi chỗ ký "Kế toán trưởng".
- Bán hàng 3.1.1 (màn riêng, T29) chưa có lọc từng cột, vẫn dùng thanh lọc cũ. Danh mục, Báo cáo cũng vậy.
- Gói Free: trang chủ và cột Chức năng của danh mục có thể còn nút tới tính năng ngoài gói.
- Trum đang làm T38 sửa `tien/quy-trinh.ts`; phiên này đổi tên 2 ô trong file đó, gộp cẩn thận.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD24.
- Mã T38 bị Trum lấy trước khi push, việc này đổi sang T39 (đúng luật QD21: lấy mã sau fetch).
