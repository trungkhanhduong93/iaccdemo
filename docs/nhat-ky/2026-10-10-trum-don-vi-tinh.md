# Danh mục đơn vị tính (T88)

- Ngày: 10/10/2026
- Người: Trum, agent: Claude Code (định giao Antigravity, worker không khởi động được nên tự làm)
- Trạng thái cuối phiên: Xong

## Đã làm

- `danh-muc/data.ts`: thêm `DON_VI_TINH` (36 dòng mã, tên, mô tả) và `TEN_DVT`. Mã viết hoa không dấu theo tên: CAI là Cái, LIT là Lít (mã cũ là L), KG là kg.
- `danh-muc/index.ts`: bảng 1.3 lấy dòng từ `DON_VI_TINH`, giữ ba cột Mã, Tên đơn vị tính, Mô tả.
- `truong-dm.ts`: ô ĐVT, ĐVT phụ (1.2), ĐVT gốc, ĐVT quy đổi (1.4) dùng `TEN_DVT`. ĐVT của 1.13, 1.14 đổi từ ô gõ thành ô chọn.
- `CatalogScreen.tsx`: ô `dvt` không khai danh sách thì cũng lấy `TEN_DVT`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Playwright gói Pro: 1.3 có 36 dòng, dòng CAI tên Cái. Panel 1.2 dòng Phở bò tái: ô ĐVT hiện Tô, mở ô có 37 mục (36 đơn vị và dòng chọn). Panel 1.14 hiện Tô. Panel 1.13 để trống vì dữ liệu giả TSCĐ không có ĐVT. Không lỗi console.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
