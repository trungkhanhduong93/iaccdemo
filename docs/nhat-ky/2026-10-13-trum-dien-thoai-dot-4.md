# Điện thoại đợt 4: xem phiếu (T177)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Anti A (Antigravity Windows) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx`: màn xem phiếu theo bố cục IVT (ảnh 05): loại phiếu, số phiếu, chip trạng thái; thẻ thông tin (thời gian, đối tượng, chi nhánh, kho, diễn giải, nguồn, tham chiếu); dòng phiếu dạng thẻ (hàng hoá, thu chi, kiểm kê); khối tổng; Hạch toán thu gọn (ẩn với phiếu thu chi, kiểm kê, chuyển kho, gói không ghi sổ, như bản máy tính); Lịch sử thao tác; thanh đáy có tổng, nút chính (Ghi sổ, Bỏ ghi sổ...) và nút "⋯" mở Sửa, In, Sao chép, Xoá.
- `src/ui/mobile/MChungTu.tsx`: mở `/:id` ra `MXemPhieu`; danh sách điều chuyển, sản xuất lấy từ `useDsPhieuDcn`, `useDsPhieuSx` như bản máy tính.
- Tách lớp ngoài, lớp trong ở `MChungTu`, `MXemPhieu` để không trả sớm trước hook (bản Anti A trả sớm theo `id`, `row`; xoá phiếu giữa chừng có thể làm React báo đổi số hook).
- `src/ui/mobile/manMobile.ts`, `app.css` mục `Điện thoại đợt 4 (T177)`.
- `tools/kiem_tra.py --dien-thoai`: so tổng tiền 4 phiếu giữa điện thoại và máy tính.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai`, lượt đủ 4 gói: Không có lỗi.
- Tổng tiền điện thoại bằng máy tính: PC2610-0261 72.000.000 đ, NK2610-0260 8.024.000 đ, KK2610-0258 0 đ, XDCK2610-0253 740.000 đ.
- Thử Xoá UNC2610-0259 trên 390px: hỏi xác nhận, xoá xong về danh sách, không lỗi console.
- So 25 ảnh bản máy tính trước và sau: không khác ngoài vùng nút có hiệu ứng.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Đợt 5: lập, sửa phiếu (mục 7 của `docs/ke-hoach-mobile-ivt.md`). Sửa, Sao chép trên điện thoại hiện vẫn ra màn "chưa có trên điện thoại".

## Bẫy, quyết định mới

- Giao Anti B (agy trong WSL) làm đợt này thì kẹt: gọi `npm` Windows qua `cmd.exe` bị exit 137. Đóng tab Orca không dừng agy trong WSL; nó tự cài `@typescript/typescript-linux-x64`, sửa `package.json`, gỡ bản win32 khỏi `node_modules`. Đã hoàn lại `package.json`, `package-lock.json`, chạy `npm ci`. Việc code giao Anti A.
