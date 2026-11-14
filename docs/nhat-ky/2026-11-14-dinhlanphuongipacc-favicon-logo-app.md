# Favicon và logo app mới (T829)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- dinhlanphuongipacc gửi 2 ảnh: biểu tượng hoá đơn và máy tính nền trong (200x201) làm favicon; cùng biểu tượng trên nền trắng có dải xanh "iPOS.vn" (300x301) làm logo app.
- `public/favicon.png`: thay bằng ảnh nền trong. `index.html` đổi `?v=5` thành `?v=6` để trình duyệt tải lại.
- `public/app-icon.png` (mới): logo app, dùng làm biểu tượng khi thêm trang vào màn hình chính điện thoại: `<link rel="apple-touch-icon">` trong `index.html` và `public/manifest.webmanifest` (mới: tên iPOS Accounting, màu `#0560a6`, 2 biểu tượng).
- `src/assets/acc-dau.png` (mới) và `src/ui/Logo.tsx`: dấu vuông `DauLogo` (hiện khi thu gọn thanh bên) dùng ảnh favicon mới, giữ quy ước cùng hình với favicon.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi; `dist/` có `favicon.png`, `app-icon.png`, `manifest.webmanifest`. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Local: `/favicon.png?v=6`, `/app-icon.png?v=1`, `/manifest.webmanifest?v=1` trả 200; `DauLogo` tải `acc-dau.png` 200x201.

## Dở dang, việc tiếp theo

- Không.
- `tools/xuat_logo_acc.py` vẫn ghi đè `public/favicon.png` và `src/assets/acc-dau.webp` bằng logo cũ nếu ai chạy lại; `acc-dau.webp` không còn dùng. Sửa hoặc bỏ script là việc riêng.
- Ảnh gửi không vuông hẳn (200x201, 300x301), trình duyệt vẫn hiện bình thường.

## Bẫy, quyết định mới

- Không.
