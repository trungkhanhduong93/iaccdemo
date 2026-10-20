# Lập phiếu điện thoại theo logic web (T526)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/ChonCuaHangTruoc.tsx`: thêm `layChiNhanhNho`, `luuChiNhanhNho`, nhớ chi nhánh trong `sessionStorage` khi lập phiếu từ Tất cả chi nhánh.
- `src/ui/mobile/MobileShell.tsx`, `MChungTu.tsx`, `MDtThuChiDs.tsx`: bấm thêm mới ở Tất cả chi nhánh thì mở bảng chọn chi nhánh, đã nhớ thì dùng luôn.
- `src/ui/mobile/MDtThuChiLap.tsx`: ô quỹ lọc theo loại tiền và chi nhánh, đổi chi nhánh thì xoá quỹ sai; phiếu mới để trống, ngày là hôm nay; gói Free chỉ Diễn giải và Thành tiền.
- `src/styles/app.css` mục cuối T526: ô nhập nền trắng, ô chỉ đọc nền xám, màu chip loại thu chi.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Anti tự chạy Playwright 390x844 luồng chọn chi nhánh và lọc quỹ: đạt. Claude chưa tự bấm thử trên điện thoại.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
