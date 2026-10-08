# Biểu tượng theo iFaster (T37)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- Xem iFaster: biểu tượng dùng UnoCSS với 3 nguồn. Bộ riêng `i-me:` của iPOS nằm sẵn trong file CSS công khai. Feather (`i-fe:`) và Solar (`iconify--solar`) là bộ mã nguồn mở.
- `tools/xuat_bieu_tuong.py` (mới): tải SVG `menu_*` từ CSS iFaster và Solar bản đặc từ API Iconify, đổi màu cứng sang `currentColor`, sinh `src/ui/icon-dac.ts` với 54 biểu tượng.
- `src/ui/Icon.tsx`: tên có trong `DAC` thì vẽ khối đặc với viewBox riêng, lớp `dac`. Còn lại 18 biểu tượng nét mảnh như cũ.
- `app.css`, mục T37: `.ic.dac` tô đặc. Biểu tượng sidebar 20px, màu xám `#8197a8`, mục đang chọn màu trắng.
- Tiện ích lúc đầu dùng `widget-bold`, trùng hình 4 ô với Trang chủ. Đã đổi sang `magic-stick-3-bold`.

## Đã kiểm

- `python tools/xuat_bieu_tuong.py --kiem`: không có tên sai.
- Code dùng 68 tên biểu tượng, bộ mới có đủ 72, không tên nào rơi về biểu tượng mặc định.
- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`, chạy cả trước và sau khi gộp T36 của PhuongXT.
- Chụp và so bằng mắt sidebar mở, sidebar thu gọn, danh sách 2.1.1, Quy trình Tiền với sidebar iFaster. Không có svg trống.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD23. Nguồn CC BY 4.0 của Solar ghi ở đầu `src/ui/icon-dac.ts`, không được xoá.
