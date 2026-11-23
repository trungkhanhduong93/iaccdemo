# Cảnh báo kiểm kê cuối tháng, chốt theo tồn hệ thống (T902)

- Ngày: 23/11/2026
- Người: Trum, agent: Claude Code, Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ bản thiết kế 3 màn trên artifact, Trum duyệt. Lưu bản vẽ ở `backup/mau-T902/ban-ve.html`, spec ở `backup/spec-T902.md`. Thư mục `backup/` không lên git.
- Giao 2 anti. Anti 2 làm `KhoaSoStandard.tsx`, `MKhoaSo.tsx`, `MChiPhiNvl.tsx`, CSS. Anti 1 chạy 20 phút chưa sửa dòng nào, Claude dừng và tự làm phần 1.
- `chi-phi-nvl.ts`: thêm `cnChuaKiemKe`, `canKiemKeCuoiThang`, `xemTruocChotHt`, `chotTonHeThong`. `nvlCuaHang` trả `chuaKk`, không tính chi phí cửa hàng chưa kiểm kê. Cửa hàng đã chốt thì tồn cuối lấy tồn hệ thống.
- `khoStandard.ts`: `soLieuKiemKe` tính cả phiếu kiểm kê lập trong phiên, bỏ phiếu đã xoá. `daXoa.ts`: thêm `banPhieuHienTai`.
- Thêm `HopChotTonHt.tsx`, hộp dùng chung web và điện thoại. `ChiPhiNvl.tsx`: khung cảnh báo, chip, tổng "Chưa gồm…", ghi chú tạm tính tháng đang chạy.
- CSS gom cuối `app.css`, mục T902.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho 5 file `.tsx`: sạch.
- Script Playwright 11 ca: tháng 9 có cảnh báo, hộp chốt, chốt xong cảnh báo mất; tháng 10 có ghi chú tạm tính; tháng 8 không cảnh báo; Khoá sổ có 2 nút, chốt xong bước xanh; điện thoại có cảnh báo, hộp chốt không tràn ngang. Ảnh ở `backup/review-T902/`.

## Dở dang, việc tiếp theo

- Không.
- Dữ liệu mẫu tháng 9 cả 3 cửa hàng đã có phiếu kiểm kê, nên bản demo chỉ thấy cảnh báo khi xoá phiếu kiểm kê tháng 9 của một cửa hàng.
- Thẻ Chi phí NVL ở trang chủ chưa có dòng "Chưa gồm…", chờ Trum quyết có làm không.
- Tồn đầu kỳ tháng 9 ra 0 đ vì dữ liệu mẫu tháng 8 không có phiếu mua. Có từ trước T902.

## Bẫy, quyết định mới

- QD115 trong `docs/QUYET-DINH.md`.
- Bẫy script Playwright import module Vite trong `docs/BAY.md`.
