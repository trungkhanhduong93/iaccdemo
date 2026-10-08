# Giao diện gọn 85% cho màn 14 inch, tìm kiếm thanh trên và lọc bảng (T44)

- Ngày: 09/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/scale.css`: đặt tỉ lệ thu phóng mặc định `--zoom: .9` cho màn hình Full HD / 14 inch trở xuống, dưới 1280px thu 85%.
- `src/app/Shell.tsx`: bỏ nút "Thêm nhanh" trên sidebar, bỏ nút "Tìm kiếm" ở sidebar, chuyển hàm mở tìm kiếm `onSearch` sang `Topbar`.
- `src/app/Topbar.tsx`: thêm nút tìm kiếm kèm phím tắt Ctrl K lên thanh trên nằm cạnh ô chọn Chi nhánh.
- `src/app/Shell.tsx`, `src/styles/app.css`: đổi badge phiên bản ở logo sidebar thành dạng viên thuốc bo tròn theo mẫu iPOS Inventory, bỏ chữ "Phiên bản"; cập nhật màu gói Pro thành vàng đồng `#b1852b`.
- `src/ui/LocCot.tsx`, `src/styles/app.css`: bổ sung ô nhập trực tiếp cho mọi cột trong hàng lọc (chữ, số, phân loại), cho phép bấm vào ô để gõ lọc ngay lập tức; phễu chọn điều kiện nâng cao giữ nguyên ở mép phải.
- `src/ui/Table.tsx`, `src/styles/app.css`: đo chính xác chiều cao hàng tiêu đề `r1Ref.current.offsetHeight` và gán vào `top` hàng lọc, xử lý triệt để khoảng hở giữa hàng tiêu đề và hàng lọc khi cuộn bảng.
- `CHANGELOG.md`, `docs/QUYET-DINH.md`, `docs/TIEN-DO.md`: ghi nhận quyết định QD28 và hoàn thành việc T44.

## Đã kiểm

- `npm run typecheck`: sạch, không có lỗi.
- `npm run build`: thành công trong 915ms.
- `python -X utf8 tools/kiem_tra.py --nhanh`: 208 lượt mở màn, in "Không có lỗi."
- `python -X utf8 tools/kiem_van.py`: cả 4 file code và tài liệu đều sạch.
- Playwright: kiểm tra đo khoảng hở cuộn thực tế bằng 0px, tìm kiếm trực tiếp trên hàng lọc khớp dữ liệu chính xác.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Quyết định: QD28 trong `docs/QUYET-DINH.md`.
- Bẫy: khi dùng CSS zoom ở html, `style.top` nhận đơn vị CSS chưa zoom. Cần đo bằng `r1.offsetHeight` thay vì `getBoundingClientRect().height` (đã nhân zoom), tránh lệch vị trí cuộn.
