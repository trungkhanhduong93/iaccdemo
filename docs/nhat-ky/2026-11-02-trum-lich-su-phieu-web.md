# Lịch sử phiếu web kiểu thanh lọc dọc, dòng thời gian (T714)

- Ngày: 02/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- Trum chọn phương án B trong 3 phương án vẽ trên canvas (artifact "Lịch sử phiếu web").
- `src/ui/mobile/MLichSu.tsx`: tách phần dữ liệu thành hàm export dùng chung với web: `useDongLichSu` (nhật ký trong phiên và lịch sử mẫu), `nhomTheoNgay`, `vietTatTen`, `IconLoai`; export kiểu `LoaiThaoTac`. Giao diện điện thoại không đổi.
- `src/ui/generic/ChungTuForm.tsx`, hàm `LichSu`: thay bảng 3 cột bằng khung `.ls-b`. Trái là thanh lọc dọc: tổng thao tác, sửa gần nhất, nhóm Thao tác (Tất cả, Tạo, Sửa, Lưu hoặc Ghi sổ theo gói, Xoá khi có), nhóm Người thao tác. Phải là dòng thời gian nhóm theo ngày, lần sửa hiện giá trị cũ gạch ngang và giá trị mới. Lọc thao tác và người cộng dồn. Áp cho form chứng từ và form danh mục (`CatalogScreen.tsx` gọi chung `LichSu`).
- Cuối `src/styles/app.css`: mục T714. Khung dưới 720px (container query) thì thanh lọc lên trên thành chip.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Playwright gói S, phiếu chi `#/app/tien/2-1-1/chi-3`, 1440x900: 4 nút thao tác (Tất cả 3, Tạo 1, Sửa 1, Lưu 1), 3 nút người, 3 thẻ, "Sửa gần nhất 07/10 09:58", khối sửa Diễn giải cũ và mới. Lọc Sửa còn 1 thẻ; thêm lọc Đồng bộ tự động thì báo không có thao tác khớp. Ép khung 600px thì thanh lọc nằm trên, hiện dòng tóm tắt gọn. Không lỗi trang.
- Cửa sổ 700px thì app đã chuyển giao diện điện thoại, dùng `MLichSu` như cũ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
