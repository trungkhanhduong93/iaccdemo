# Bộ báo cáo gói Free theo iFaster, chia báo cáo theo gói và thông tư (T97)

- Ngày: 10/10/2026
- Người: Trum, agent: Claude Code (điều phối Antigravity viết code)
- Trạng thái cuối phiên: Xong

## Đã làm

- Đọc bộ báo cáo hộ kinh doanh của iFaster (ifaster.ipos.vn, tài khoản hộ kinh doanh Trum đưa, chỉ đọc): 20 báo cáo trong 7 nhóm. Ghép vào repo theo bảng trong QD42, Trum duyệt.
- `plan.ts`: `THEO_ROADMAP` mở thêm cho gói Free 3.2.5, 2.2.5, 5.2.2. `BO_SUNG` thêm 2.2.8, 2.2.9, 4.2.6, 10.4.3. `gopFeatures` áp `THEO_ROADMAP` cho cả mã trong `BO_SUNG`.
- `danh-sach.ts`: `CauHinhBC` có `cheDo`; 2.2.7, 10.4.1 chỉ TT58, 6.2.5 TT152 và TT58. 3.2.5 TT152 ghi S2a-HKD. Cấu hình 4 báo cáo mới.
- `registry.ts`: hàm `apDung`; `hienMan(sc, goi, cheDo)` ẩn báo cáo không áp dụng thông tư. Các nơi gọi truyền `s.cheDo`: hộp tìm, thanh tab, flyout sidebar, Tất cả báo cáo, thanh chọn báo cáo, màn báo cáo, sơ đồ Quy trình.
- `so-bo-sung.ts`, `mua-hang/bao-cao.ts`: số liệu 4 báo cáo mới; khai màn ở `tien`, `mua-hang`, `tong-hop`.
- Coordinator sửa: tên quỹ, tên chi nhánh trong 2.2.8, 10.4.3 Anti bịa là Q.1, Q.5; đổi về Lê Lợi, Nguyễn Trãi, bộ lọc quỹ lấy từ `CHI_NHANH`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py` đủ 4 gói: 745 lượt mở màn, `Không có lỗi.` `kiem_van.py` 3 file có chữ mới: sạch.
- Ma trận báo cáo theo gói và thông tư (script gọi `hienMan` thẳng), sau khi gộp T99 của PhuongXT: Free/TT152 17 báo cáo, đúng danh sách QD42. S/TT58 50, PL và PR với cả TT133, TT99 đều 47; so với trước chỉ thêm 4 báo cáo mới.
- Gộp với T99 (bỏ 3.2.1, 3.2.3 ở mọi gói): Trum chốt giữ T99, xoá hai dòng mở 3.2.1, 3.2.3 cho gói Free trong `THEO_ROADMAP`.
- Gói Free mở 2.2.8 (12 dòng), 2.2.9 (24), 4.2.6 (62), 10.4.3 (28), 3.2.5 (63): không lỗi console. 3.2.5 đầu tờ ghi Mẫu số S2a-HKD.

## Dở dang, việc tiếp theo

- Cập nhật Excel tính năng (T33): thêm 2.2.8, 2.2.9, 4.2.6, 10.4.3; sửa gói của 3.2.5, 2.2.5, 5.2.2. Xong thì xoá các dòng tương ứng ở `BO_SUNG`, `THEO_ROADMAP`.
- Cột, bộ lọc báo cáo cũ (5.2.2, 4.2.2...) chưa chỉnh theo từng cột iFaster; chỉ 4 báo cáo mới làm theo cột iFaster.

## Bẫy, quyết định mới

- QD42.
- Mật khẩu tài khoản iFaster nằm trong lịch sử phiên ngày 10/10: chủ tài khoản cần đổi.
