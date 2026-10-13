# Điện thoại đợt 2: Trang chủ, Nghiệp vụ, Khác (T175)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Anti A (Antigravity Windows) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MTrangChu.tsx`: đầu trang tên đơn vị, vai trò, nút tìm, chuông; khối Thao tác nhanh 4 ô (Thu tiền, Chi tiền, Nhập kho, Xuất kho) mở form thêm mới; 4 thẻ số liệu lấy từ `tinhToanTongQuan` (doanh thu thuần, lợi nhuận gộp, lợi nhuận trước thuế, tiền khả dụng). Gắn cho `trang-chu/tong-quan`, `trang-chu/ban-lam-viec` ở `manMobile.ts`.
- `src/ui/mobile/MNghiepVu.tsx`: lưới ô phân hệ dùng `Icon` của web; bấm ô ra `/app/nghiep-vu?m=<key>` liệt kê màn, màn ngoài gói có ổ khoá.
- `src/ui/mobile/MKhac.tsx`: thẻ người dùng, nhóm Danh mục & thiết lập (màn `danh-muc`, `he-thong`), nhóm Đơn vị (chọn đơn vị, xem thử gói), Đăng xuất.
- `src/ui/mobile/MobileShell.tsx`: tiêu đề, nút quay lại khi đang xem màn của một phân hệ trong tab Nghiệp vụ.
- `src/App.tsx`: route `nghiep-vu`, `khac` ra màn thật ở điện thoại, về `/app` ở máy tính.
- `src/styles/app.css`: biến `--m-*` theo số đo bảng 5.2 của kế hoạch, thanh dưới dạng nổi bo góc có bóng; mục mới `Điện thoại đợt 2 (T175)`.
- `tools/kiem_tra.py --dien-thoai`: ở 390px, 4 gói, bấm mọi ô phân hệ và mọi màn trong danh sách.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --dien-thoai`: 51 lượt ở 3 bề rộng, bấm được F 14, S 90, PL 85, PR 85 màn, Không có lỗi.
- `python tools/kiem_tra.py`: đủ 4 gói, Không có lỗi. So 25 ảnh bản máy tính trước và sau: không khác ngoài vùng nút có hiệu ứng.
- Xem ảnh 390px của Trang chủ, Nghiệp vụ, Khác bằng mắt.
- Chưa thử trên điện thoại thật. Chưa soát vì sao gói Standard bấm được nhiều màn hơn Plus (90 so với 85), có thể do bộ sổ TT58.

## Dở dang, việc tiếp theo

- Đợt 3: danh sách chứng từ, danh mục, lọc, màn trống (mục 7 của `docs/ke-hoach-mobile-ivt.md`).

## Bẫy, quyết định mới

- Không.
