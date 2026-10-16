# Đổi khái niệm chi nhánh thành Cửa hàng (T294)

- Ngày: 16/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/doi_cua_hang.py` (mới): script đổi trong `src/` và `tools/kiem_tra.py`: chữ chi nhánh thành cửa hàng (có dấu, không dấu, hoa), tên code `CHI_NHANH` thành `CUA_HANG`, `chiNhanh` thành `cuaHang`, `ChiNhanh` thành `CuaHang`, `chi-nhanh` thành `cua-hang`; đổi tên tệp `DanhMucChiNhanh.tsx` thành `DanhMucCuaHang.tsx`, `MChiNhanh.tsx` thành `MCuaHang.tsx`. Giữ chi nhánh ngân hàng (Vietcombank, chi nhánh...; ô Chi nhánh ngân hàng; trường `chiNhanhNh`), tên biểu tượng `chinhanh` (`icon-dac.ts` sinh tự động), bỏ qua `features.json`.
- Chạy script trên bản mới nhất sau khi PhuongXT push T290, T291, T293: 99 tệp đổi, 2 tệp đổi tên.
- `docs/QUYET-DINH.md`: QD66 (thay phần chi nhánh của QD17). `docs/KIEN-TRUC.md`: tên mới `cuaHangHienTai`, `CUA_HANG`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van --loai giao-dien` 97 tệp: không ĐỎ.
- Thử tay: Danh mục cửa hàng, thanh trên Cửa hàng · Tất cả cửa hàng hiện đúng.
- `python tools/kiem_tra.py --dien-thoai` dừng ở `.m-thanh-duoi a` nth(1); bản gốc trên GitHub cũng hỏng như vậy (trước T294), ghi thành T295.

## Dở dang, việc tiếp theo

- Trum đang làm T282, T292 chưa push: trước khi `git pull`, chạy `python tools/doi_cua_hang.py` trên máy mình để đổi cả phần code đang dở, giảm xung đột.
- Code mới dùng cửa hàng, `cuaHang`. Còn sót thì chạy lại `tools/doi_cua_hang.py`.

## Bẫy, quyết định mới

- QD66.
