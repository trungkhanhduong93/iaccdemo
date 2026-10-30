# Thanh bên, Thông tin đơn vị, Thông tin kê khai gói Standard (T692)

- Ngày: 30/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/Shell.tsx`: thanh bên lọc bỏ phân hệ `thao-tac-nhanh`. Module, bảng nổi `ThaoTacNhanhFlyout` vẫn còn trong code, chưa xoá.
- `src/modules/he-thong/HeThong.tsx`: gói Standard ẩn ô Phương pháp tính giá xuất kho; Nhóm doanh thu chỉ còn Nhóm 1, 2 (đơn vị đang lưu nhóm 3, 4 thì vẫn hiện nhóm đó).
- `src/modules/thue/ToKhaiHKD.tsx`: nút Thiết lập thông tin trên thanh công cụ, hộp `HopThongTin` (MST, tên hộ kinh doanh, người nộp thuế, điện thoại, email, bảng điểm bán). Lưu MST, tên vào `ttDv` của phiên. `?thongtin=1` mở sẵn hộp. Bước 1 tờ khai lấy đơn vị qua `donViHienTai` để thấy MST vừa khai.
- `src/app/session.tsx`: hàm `denBoMst(goi)`, gói Free, Standard trả `/app/thue/to-khai?thongtin=1`, gói khác `/app/he-thong/thong-tin`. Dùng ở `Topbar.tsx`, `MTrangChuStandard.tsx`.
- `src/styles/app.css`: mục cuối file cho `.tk-tt`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa mở trình duyệt xem hộp Thông tin kê khai bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
