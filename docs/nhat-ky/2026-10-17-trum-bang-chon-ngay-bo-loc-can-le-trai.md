# Bảng chọn ngày và bộ lọc nâng cao căn theo lề trái (T352)

- Ngày: 17/10/2026
- Người: Trum, agent: Antigravity (Gemini 3.8 Flash High)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/LocNangCao.tsx`: đổi `align="start"` cho Popover Bộ lọc nâng cao. Hộp 720px căn theo lề trái nút phễu, bung tràn sang phải, không che các ô lọc bên trái.
- `src/ui/generic/VoucherScreen.tsx`: bỏ `align="end"` ở ô Thời gian trong danh sách chứng từ, dùng mặc định `align="start"` của `ChonKhoangNgay`. Bảng lịch 600px bung sang phải, không đè lên thanh bên (sidebar).
- `src/ui/generic/ReportScreen.tsx`: bỏ `align="end"` ở ô Khoảng ngày trong thanh công cụ báo cáo.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: bỏ `align="end"` ở ô Thời gian màn Xuất bán POS.
- `src/modules/kho/CongThuc.tsx`: bỏ `align="end"` ở ô Ngày áp dụng danh sách Định mức nguyên vật liệu.
- `src/modules/kho/PhieuSanXuat.tsx`: bỏ `align="end"` ở ô Thời gian danh sách Phiếu sản xuất.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: hoàn thành, không lỗi.
- `python tools/kiem_tra.py --nhanh` (cổng 5180): Không có lỗi.
- Chạy Playwright tự động đo toạ độ và chụp ảnh thực tế tại `%TEMP%/T352-anh/`:
  + `01_popover_ngay.png`: nút ngày x=233.2, popover ngày x=233.2, rộng 540px, bung sang phải, thanh bên không bị che.
  + `02_popover_boloc.png`: nút phễu x=908.1, popover x=784.8, rộng 648px, bung sang phải và tự khống chế trong màn hình, không che ô lọc trái.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: hoàn thiện QD72 quy định căn lề trái (`align="start"`) cho bảng chọn ngày và bộ lọc nâng cao ở thanh công cụ.
