# Hướng dẫn nhanh Thu chi, Xuất bán POS thêm thao tác đồng bộ (T701)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tien/huong-dan.ts` (màn 2-1-1, gói S): thêm bước bấm nút Đồng bộ (chọn kỳ, loại phiếu, cửa hàng), bước chip Chưa đồng bộ (Nguyên nhân, Xử lý, Đồng bộ lại). Lưu ý thêm: tab Tiền mặt chỉ đồng bộ phiếu tiền mặt, hai lý do chưa đồng bộ. Sơ đồ khung thêm hàng chip và nút Đồng bộ, Excel.
- `src/modules/ban-hang/huong-dan.ts` (màn 3-1-1, gói S): thêm bước nút Đồng bộ, chip Đã đồng bộ, chip Chưa đồng bộ; lưu ý bốn lý do món chưa đồng bộ; sơ đồ khung thêm nút Đồng bộ và hàng chip.
- Bước nào có thêm chữ `dt` cho điện thoại: điện thoại chỉ xem, chọn trạng thái POS trong Bộ lọc, đồng bộ làm trên máy tính.
- `src/ui/CongCuDs.tsx`: `NutDongBo` gắn `data-hd="dongBo"` để tour khoanh đúng nút.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần đầu báo 2 lỗi chỗ khoanh khoá `dongBo` (tour khoanh qua selector, kiem_tra chỉ nhận `data-hd`); gắn `data-hd` vào `NutDongBo`, chạy lại `Không có lỗi.`
- `kiem_van` hai file `huong-dan.ts`: mỗi file 0 ĐỎ, 1 VÀNG.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Hướng dẫn Thu chi giờ 9 bước, nhiều hơn mức 3 đến 5 bước của QD86.
