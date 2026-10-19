# Gói Free hiện lại nhóm báo cáo bán hàng (T452)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/index.ts`: bỏ `goi: ['S', 'PL', 'PR']` ở `baoCaoMoi` (đặt từ T216), các báo cáo 3-2-6 đến 3-2-9 mở cho mọi gói.
- `bao-cao/danh-sach.ts`: `AN_NHOM_BC` gói Free chỉ còn ẩn `thue`, bỏ `ban-hang` (đặt từ T218).

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free: màn Báo cáo có tab Bán hàng 3 báo cáo (Bán hàng theo ngày, Tổng hợp bán hàng, Chi tiết bán hàng); mở Tổng hợp bán hàng ra bảng có dữ liệu.

## Dở dang, việc tiếp theo

- Không. Các báo cáo bán hàng theo Excel (3.2.1 đến 3.2.5) vẫn theo gói trong `features.json`, không đổi.

## Bẫy, quyết định mới

- Không.
