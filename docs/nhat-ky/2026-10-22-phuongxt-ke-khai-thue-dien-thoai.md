# Kê khai thuế trên điện thoại theo app iFaster, đổi tên Thu chi, Chi phí chờ phân bổ (T623)

- Ngày: 22/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MToKhaiHKD.tsx` (mới): Kê khai thuế gói Free, Standard trên điện thoại. Khung danh sách như Thu chi: đầu trang riêng có tìm kiếm, tab Kê khai thuế và Báo cáo theo dõi, hàng lọc nút phễu và chip (Năm, Loại tờ khai, Trạng thái), tấm Bộ lọc kiểu Xuất bán POS, thẻ Tờ khai cần nộp, danh sách gom theo năm, nút nổi Lập tờ khai. Tấm Lập tờ khai từ đáy, màn kê khai 4 bước toàn màn hình (vạch tiến độ bấm được, tải XML, Đã nộp CQT).
- Tab Báo cáo theo dõi lấy sổ thuế và bộ sổ TT152 của hộ kinh doanh (6.2.5, 6.2.4, 6.2.3, 6.2.1, 6.2.2, 3.2.5, 10.4.1, 5.2.8, 2.2.7), lọc bằng `hienMan` theo cấu hình báo cáo. `MBaoCaoTheoDoi.tsx` thêm tham số `ds` (danh sách truyền sẵn) và dòng báo khi trống; phân hệ không truyền `ds` chạy như cũ.
- `src/ui/mobile/MToKhaiGTGT.tsx` (mới): tờ khai GTGT quý (01/GTGT hoặc 04/GTGT theo chế độ) dạng thẻ. Màn 6.2.3 đang `anTam: ALL` trong `danh-sach.ts` nên chưa ai mở được, mở lại là hiện.
- `ToKhaiHKD.tsx` xuất dữ liệu, hàm dùng chung (`DS`, `soLieu`, `lapToKhai`...); `ToKhaiGTGT.tsx` tách `soLieuGTGT`. Web chạy như cũ.
- `manMobile.ts`: thue/to-khai mở `MToKhaiHKD`, 6.2.3 mở `MToKhaiGTGT`.
- `thue/index.ts`: màn tờ khai mở cho gói Standard (`goi: ['F', 'S']`), PhuongXT chốt 22/10/2026; tên màn đổi "Danh sách tờ khai" thành "Kê khai thuế".
- Đổi nhãn "Thu, chi tiền" thành "Thu chi" (`SidebarFlyout.tsx`, `tien/index.ts`, `MNghiepVu.tsx`, `MDtThuChiDs.tsx`); "Danh sách thẻ chi phí" thành "Chi phí chờ phân bổ" (`ccdc/index.ts`, `MCcdc.tsx`, `MobileShell.tsx`).
- CSS cuối `app.css`, mục "Điện thoại: Kê khai thuế theo app iFaster (T623)".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` các file giao diện đã sửa: sạch.
- Khung điện thoại 375px: không tràn ngang; lập tờ khai, đi 4 bước, Đã nộp CQT, bộ lọc, tab Báo cáo theo dõi (đơn vị `gn` gói Free, Standard hiện S1a-HKD, mở đúng sổ; Phố Mây hiện dòng báo trống). Web gói Standard mở được danh sách tờ khai.
- Màn tờ khai GTGT chỉ kiểm qua đường mở tạm (đã trả lại), vì 6.2.3 đang ẩn.

## Dở dang, việc tiếp theo

- Không.
- Chờ chốt: tên tờ khai ghi "doanh thu dưới 1 tỷ, kỳ 6 tháng", hộ kinh doanh gói Standard có thể vượt mức này (hỏi Trum, kế toán trưởng). Sơ đồ quy trình thuế web gói Standard vẫn là luồng GTGT đang ẩn hết. Mục "Thu, chi tiền tổng hợp" ở menu Thu chi web chưa đổi tên.

## Bẫy, quyết định mới

- Không. Ghi chú: working copy dùng CRLF (`core.autocrlf true`); ghi file bằng script phải giữ đúng kiểu xuống dòng, không thì diff đổi cả file.
