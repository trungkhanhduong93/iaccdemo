# Biểu tượng riêng cho các màn danh mục (T40)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/xuat_bieu_tuong.py`: thêm 14 biểu tượng Solar bản đặc cho danh mục, sinh lại `src/ui/icon-dac.ts` với 68 biểu tượng. Đối tượng, Mục chi phí, Tài sản cố định dùng lại `users`, `receipt`, `building`.
- `types.ts`: `ScreenDef` có thêm trường `icon`.
- `danh-muc/index.ts`: bảng `BIEU_TUONG` theo mã màn 1.1 tới 1.16. Màn Chi nhánh dùng `chinhanh`.
- Biểu tượng riêng hiện ở menu Khác (`ModuleTabs.tsx`), ô tìm Ctrl K (`CommandPalette.tsx`), hàng Danh mục dưới sơ đồ (`QuyTrinhScreen.tsx`, bỏ hình `folder` viết cứng) và sơ đồ Khởi tạo danh mục (`danh-muc/quy-trinh.ts`).

## Đã kiểm

- `python tools/xuat_bieu_tuong.py --kiem`: không có tên sai. `icon-dac.ts` có 68 mục.
- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Chụp sơ đồ Khởi tạo danh mục và menu Khác ở gói A, không có svg trống.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: bổ sung QD23 về trường `icon` của màn.
