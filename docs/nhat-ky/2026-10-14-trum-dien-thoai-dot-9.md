# Điện thoại đợt 9: trang chủ, tìm kiếm, tab Khác, bộ lọc, lịch, báo cáo đơ (T193–T199)

- Ngày: 13–14/10/2026
- Người: Trum, agent: Claude Code điều phối và sửa gốc báo cáo đơ, Anti B (Antigravity WSL) viết code giao diện, Anti A (Antigravity Windows) đo báo cáo
- Trạng thái cuối phiên: Xong

## Đã làm

- T193 `MTrangChu.tsx`: hai tab "Tổng quan | Cần theo dõi", vuốt ngang bằng `scroll-snap`. Tổng quan có 4 thẻ số (doanh thu thuần, lợi nhuận, tiền hiện có, phải thu khách hàng), biểu đồ doanh thu theo tháng, cơ cấu chi phí, thao tác nhanh. Cần theo dõi có công nợ phải thu quá hạn, hàng tồn dưới định mức, hạn nộp tờ khai GTGT; bấm dòng mở màn tương ứng.
- T194 `MNghiepVu.tsx`: chỉ hiện màn gói Free hoặc Standard mở được, áp cho mọi gói. Phân hệ không còn màn thì ẩn.
- T195 `MTimKiem.tsx` (mới): kính lúp ở trang chủ mở lớp phủ tìm màn theo tên hoặc mã, không cần dấu, cùng bộ lọc T194.
- T196 `src/ui/Table.tsx`: gốc đơ là `tdStyle` gọi `tinhRongNum` cho từng ô, mỗi lần quét lại toàn bộ dòng. Sổ quỹ tiền mặt tốn 6,6 giây CPU chỉ cho hàm này. Nay bề rộng cột số tính một lần mỗi cột trong một lần vẽ.
- T197 `MKhac.tsx`: các nhóm thành thẻ riêng có tiêu đề in hoa ngoài thẻ, tách Danh mục và Thiết lập, nút Đăng xuất riêng.
- T198 `MLoc.tsx`, `MChungTu.tsx`: tấm lọc có các dòng Thời gian, Đối tượng, Nguồn; chạm dòng mở trang danh mục có ô tìm, chọn nhiều, Chọn tất cả, Bỏ chọn. `GtLocMobile` đổi sang mảng.
- T199 `ChonNgay.tsx`: `ChonKhoangNgay`, `LichDon`, `ONgay` trên điện thoại mở tấm lịch từ đáy, lưới một tháng, chip nhanh, nút Huỷ, Xong dính đáy. Bản máy tính giữ nhánh cũ. Ô Thời gian ở màn lập phiếu điện thoại (`MLapPhieu.tsx`) chạm vào mở lịch, giữ giờ đã có.
- `app.css` mục `Điện thoại: trang chủ, tìm kiếm, tab Khác, bộ lọc, lịch (T193–T199)`, mọi luật trong `@media (max-width: 767px)`.
- `tools/kiem_tra.py --dien-thoai`: hàm `kiem_tra_dot_9` kiểm 6 bước (Cần theo dõi, tìm "phieu chi", Nghiệp vụ gói PL, tab Khác, lọc đối tượng, lịch ở lập phiếu chi).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai` (cổng 5181): Không có lỗi.
- Đo Sổ quỹ tiền mặt (dev server, không giả lập CPU chậm): 390px từ khoảng 8,5 giây xuống khoảng 1 giây; 1440px từ 1,9 giây xuống dưới 0,8 giây. `tinhRongNum` từ 6.600 ms còn 66 ms CPU.
- Xem ảnh 390px: trang chủ hai tab, Cần theo dõi, tìm kiếm, tab Khác, tấm lọc, trang Đối tượng, lịch ở lập phiếu chi.
- Không so ảnh bản máy tính từng điểm. `ChonNgay.tsx` chỉ thêm nhánh điện thoại, `Table.tsx` cho cùng bề rộng như trước.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- "Chứng từ chưa ghi sổ" chưa có trong Cần theo dõi vì dữ liệu giả chưa có trạng thái này cho mọi loại phiếu.
- Tìm kiếm màn chưa tìm báo cáo (Sổ quỹ, B01...). Muốn tìm cả báo cáo thì thêm nguồn từ `layNhomBaoCao`.
- Tìm kiếm có thêm hai dòng "Phiếu chi", "Phiếu thu" trỏ tới Thu chi tiền mặt (2.1.1), viết cứng trong `MTimKiem.tsx`.

## Bẫy, quyết định mới

- `Table.tsx`: hàm tính bề rộng gọi trong `tdStyle` chạy cho mỗi ô, nên chi phí tăng theo bình phương số dòng. Bảng ít dòng không lộ, sổ vài trăm dòng treo vài giây. Tính gì theo cả cột thì tính một lần ngoài vòng lặp ô.
- Anti B viết CSS và `.tsx` lệch tên lớp (`m-tc-tab` và `m-tc-tab-btn`, `m-tk-phu` và `m-tk-overlay`), bước kiểm lại dùng tên trong CSS. Typecheck, build vẫn xanh. Claude bắt được khi so danh sách lớp CSS mới với lớp dùng trong `.tsx`, rồi đổi tên trong `.tsx`.
- Anti A đo ra treo nhưng sửa vòng ngoài (`useMemo`, đặt style trực tiếp ở `MToGiay`) mà không đúng gốc. Claude ghi CPU profile qua CDP, thấy ngay hàm nóng, hoàn lại 3 file Anti A sửa.
