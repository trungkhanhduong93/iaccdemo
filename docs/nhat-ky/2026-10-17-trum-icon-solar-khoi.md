# Bộ icon Solar khối 3D, đổi 9 icon sai nghĩa (T320)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Trang xem trước để Trum chốt: https://claude.ai/artifact/H59WiEziF4UvzqSo5nNQAe. Bản 1 đổi nghĩa icon, bản 2 so 4 kiểu, bản 3, 4 chốt Solar khối 3D và cỡ.
- `tools/xuat_bieu_tuong.py`: đổi bảng SOLAR (`truck` thành `bag-4`, `grid` thành `bill-list`, `clipboard` thành `clipboard-check`, `banggia` thành `tag`), thêm khoá `dieuchuyen`, `giathanh`, `phanbo`, `tienich`, `nhapkho`, `xuatkho`. Bộ khối đo hộp bao để lớp lớn là thân. Tách `DAO_TAY` (bộ nét) với `DAO_TAY_DAC` (bộ khối). Sinh lại `src/ui/icon-dac.ts`.
- `src/ui/Icon.tsx`: hằng `BO_ICON` (`'khoi'` hoặc `'net'`), gắn `data-ic` lên thẻ `html`. Chế độ `khoi`, `hai` vẽ thân DAC khi `BO_ICON = 'khoi'`.
- `index.html`: 2 gradient `ic-g-xanh`, `ic-g-cam`.
- `app.css`: mục cuối T320, mọi luật bọc trong `:root[data-ic="khoi"]`. Khối chuyển màu, đổ bóng; thanh bên khối một màu; icon khối từ 20px; Thao tác nhanh, Lập nhanh, thẻ Nghiệp vụ 32px; `.m-lp-dong-ic` 20px.
- Khoá icon: `ccdc/index.ts` (`phanbo`), `gia-thanh/index.ts`, `gia-thanh/quy-trinh.ts` (`giathanh`), `tien-ich/index.ts`, `QuyTrinhScreen.tsx` (`tienich`), `kho/index.ts` điều chuyển (`dieuchuyen`), `thaoTacNhanh.ts` (`nhapkho`, `xuatkho`).
- Rebase lên `main`: xung đột cuối `app.css` với mục T322, T316, giữ cả ba mục.

## Đã kiểm

- `npm run typecheck`, `npm run build` sau khi rebase: không lỗi.
- `kiem_tra.py --nhanh` (dev cổng 5181, `KIEM_TRA_URL`): `Không có lỗi.`
- `BO_ICON = 'net'`: Anti chạy typecheck, `kiem_tra.py --nhanh` xanh, chụp thanh bên đúng bộ nét cũ.
- `kiem_tra.py --dien-thoai`: lỗi chờ `.m-nv-luoi`. Bản gốc trước T320 lỗi y hệt, do T311 đã bỏ lớp này. Việc sửa đã có ở T323.
- Ảnh Anti chụp ở `%TEMP%/T320-anh/`: thanh bên, Thao tác nhanh, danh sách phiếu, Nghiệp vụ điện thoại.

## Dở dang, việc tiếp theo

- Không. Thanh dưới điện thoại vẫn dùng icon nét (tab đang chọn mới là khối), chưa nằm trong T320. Trum muốn đổi thì mở việc mới.

## Bẫy, quyết định mới

- QD71 trong `docs/QUYET-DINH.md`.
- Quay về bộ Solar nét: đổi `BO_ICON` trong `src/ui/Icon.tsx` thành `'net'`.
