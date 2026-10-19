# Gói Free hiện lại nhóm báo cáo bán hàng (T452, T458 đến T460)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/index.ts`: bỏ `goi: ['S', 'PL', 'PR']` ở `baoCaoMoi` (đặt từ T216), các báo cáo 3-2-6 đến 3-2-9 mở cho mọi gói.
- `bao-cao/danh-sach.ts`: `AN_NHOM_BC` gói Free chỉ còn ẩn `thue`, bỏ `ban-hang` (đặt từ T218).
- T458: PhuongXT chốt gói Free chỉ hiện Tổng hợp bán hàng (3-2-7), Bảng kê chi tiết bán hàng (3-2-8). `baoCaoMoi` nhận thêm `goi`; 3-2-6 Bán hàng theo ngày đặt `['S', 'PL', 'PR']`.
- T459: `ban-hang/quy-trinh.ts`, `buocKyFree` bước 3 Doanh thu bán hàng thay Sổ doanh thu bán hàng (3-2-5) bằng Tổng hợp bán hàng (3-2-7), Bảng kê chi tiết bán hàng (3-2-8); bỏ bước 4 Xuất kho nguyên liệu. Nút Tất cả báo cáo tự xuống cột cuối.
- T460: bỏ ô Đơn POS từ FABi ở bước 1 Quy trình Bán hàng gói Free. Cuối `app.css` mục T460: `.qt-ky-o-ten > .qt-ky-o-mo { flex-basis: 100% }`, mô tả luôn xuống dòng dưới tên ở mọi ô sơ đồ bước theo kỳ (mọi phân hệ gói Free), trước đây tên ngắn thì mô tả nằm cùng hàng.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free: màn Báo cáo có tab Bán hàng 3 báo cáo (Bán hàng theo ngày, Tổng hợp bán hàng, Chi tiết bán hàng); mở Tổng hợp bán hàng ra bảng có dữ liệu. Sau T458: gói Free nhóm Kế toán bán hàng 2 báo cáo, không còn Bán hàng theo ngày; gói Plus vẫn đủ 3. T459: Quy trình Bán hàng gói Free 1640x900 còn 3 bước chia đều, bước 3 có 2 báo cáo và nút Tất cả báo cáo. T460: bước 1 chỉ còn Xuất bán POS, mọi ô mô tả nằm dưới tên.

## Dở dang, việc tiếp theo

- Không. Các báo cáo bán hàng theo Excel (3.2.1 đến 3.2.5) vẫn theo gói trong `features.json`, không đổi.

## Bẫy, quyết định mới

- Không.
