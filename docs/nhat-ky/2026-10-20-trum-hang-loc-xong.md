# Hàng lọc, nút Lọc, Thêm mới, Đồng bộ thống nhất mọi màn web (T510, T511)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- T510: soát bằng ảnh code còn dở trong `D:\IACC-CLOUD\Web-t510` theo 8 luật ở `backup/spec-T510-T511-tiep.md`. Sửa nút Thêm mới có nhiều loại thành nút xanh, mũi tên trắng dính liền (mục T510 cuối `app.css`). Commit `0730b7d`.
- T511: đưa hàng lọc mẫu sang `CatalogScreen.tsx` (Chi phí phân bổ và danh mục thường), `ReportScreen.tsx` (ô Thời gian, nút Lọc, Excel và Tuỳ chỉnh xuống hàng 2), `DanhMucCuaHang.tsx` (bỏ tiêu đề, hàng lọc, nút Đồng bộ FABi), `ChungTuBanHang.tsx`, `ToKhaiHKD.tsx`, `CongThuc.tsx`, `PhieuSanXuat.tsx`. CSS mới ở mục `Hàng lọc danh mục, báo cáo (T511)` cuối `app.css`. Commit `3716ea1`.
- Sửa thêm sau review: nút "Xoá bộ lọc" ở danh mục trống giờ xoá cả điều kiện trong Bộ lọc nâng cao (`CatalogScreen.tsx`).
- Gộp xung đột `app.css` khi pull: giữ cả mục T516 và mục T510.

## Đã kiểm

- `npm run typecheck`: sạch. `npm run build`: xong, không lỗi.
- `kiem_tra.py --nhanh` trên cổng 5181: "Không có lỗi." (chạy sau T510, sau T511, sau sửa review).
- `kiem_van.py` các file .tsx đã sửa: sạch (Anti chạy).
- Ảnh soát 1440x900: `backup/a1-*.png` (19 ảnh T510), `backup/a2-*.png` (16 ảnh T511). Anti xem ảnh, Claude không xem.
- Review chéo bằng một worker Antigravity khác (pre-push-qa): VÀNG, 1 lỗi Xoá bộ lọc, đã sửa.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không ghi vào `docs/BAY.md`. Lưu ý điều phối: `kich_hoat_xoay.ps1` tắt mọi `agy.exe` trên máy, kể cả anti của phiên khác. Trước khi xoay phải xem `orca terminal list`.
