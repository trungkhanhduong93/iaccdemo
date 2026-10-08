# Thanh trên, gói Free ẩn tính năng ngoài gói, vai trò theo tài khoản (T36)

- Ngày: 08/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `Topbar.tsx`, `app.css`: nút đơn vị hiện đủ tên, dòng nhỏ "Công ty · MST"; ô chi nhánh có dòng nhỏ "Chi nhánh", rộng 240 tới 400px; nút "Trải nghiệm gói" màu cam có bóng sáng nhấp nháy nhẹ, chỉ còn chọn gói.
- `Login.tsx`: vai trò, tên lấy theo email trong `NGUOI_DUNG`; email lạ vào vai trò kế toán trưởng.
- `plan.ts`: `anNgoaiGoi()`. `registry.ts`: `hienMan()`, `hienPhanHe()`; `phanHeKhoa()` không khoá phân hệ có màn không gắn gói (Hệ thống trước đây hiện khoá ở gói Free).
- Gói Free ẩn tính năng ngoài gói ở `Shell.tsx` (sidebar, Thêm nhanh), `ModuleTabs.tsx`, `CommandPalette.tsx`, `BaoCaoScreen.tsx`, `QuyTrinhScreen.tsx` (ô, làn, bước, khung Báo cáo, hàng danh mục, tiện ích).
- `QuyTrinhScreen.tsx`, `tien/quy-trinh.ts`: sơ đồ hội tụ bỏ khung Báo cáo bên phải; khối cuối "Sổ sách, báo cáo" có thêm Sổ tài khoản, Sổ nhật ký và link Tất cả báo cáo.
- `tools/kiem_tra.py`: gói Free báo lỗi nếu còn mục có khoá trên sidebar, tab, sơ đồ; ngưỡng số màn của gói Free là 30.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py` đủ 4 gói: 629 lượt mở màn, "Không có lỗi." Gói Free 38 màn, ba gói kia 149 màn.
- Xem trên trình duyệt: gói Free đơn vị Góc Nhỏ, gói Medium đơn vị Phố Mây; menu Trải nghiệm gói; thanh trên ở 1366×768.

## Dở dang, việc tiếp theo

- Trang chủ (Tổng quan, Bàn làm việc) và cột Chức năng của danh mục có thể còn nút dẫn tới tính năng ngoài gói Free. Chưa rà.
- T25 vẫn còn sổ quỹ, sổ ngân hàng, sổ công nợ.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD22.
