# Danh mục theo iFaster, công thức theo iPOS Inventory (T154, T156)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code điều phối, worker Claude viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `HeThongTaiKhoan.tsx`: Cấp chọn 1–5 cùng hàng ô Tổng hợp, Thuộc tài khoản lọc theo cấp, Loại tài khoản chọn Loại 0–9.
- `QuyDoiDvt.tsx`: hộp quy đổi theo iFaster (bỏ Áp dụng cho); `ChonNhieu` kiểu iFaster dùng chung cho form danh mục, công thức.
- `truong-dm.ts`, `danh-muc/index.ts`, `data.ts`: thuế ngành nghề chỉ đọc; Quy đổi ĐVT 1.4 có Từ, Đến, Tỷ lệ, Diễn giải tự sinh, Hàng hoá áp dụng chọn nhiều, Mô tả; nhóm hàng bỏ loại hàng, tồn kho, nút Áp cho; công việc còn mã, tên, mô tả, trạng thái; bảng giá theo iFaster.
- `ChonNgay.tsx`: lịch vừa khít, hết khoảng trống bên phải; sửa lỗi lùi tháng từ tháng 1 bị lặp.
- `kho/CongThuc.tsx`: form công thức sơ chế, chế biến theo bố cục iPOS Inventory, bỏ mức tăng, giảm tối đa, tổng chi phí kèm food cost %.

## Đã kiểm

- Worker chạy `npm run typecheck`, `npm run build`, `kiem_tra.py --nhanh`: đạt. Coordinator chạy lại trên bản gộp với T157 trước khi commit.
- Xem ảnh form tài khoản, ô chọn nhiều, hộp quy đổi, công thức chế biến: đúng mẫu.

## Dở dang, việc tiếp theo

- Ô chọn nhiều ở `ReportScreen.tsx` (LocChonNhieu), `home/TongQuan.tsx` (lọc chi nhánh), `onboarding/OnboardFabi.tsx` (ChonKenh) chưa đổi sang kiểu iFaster.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD51; sửa câu cũ ở QD47 (nút Áp cho), QD49 (tỷ lệ sửa được).
