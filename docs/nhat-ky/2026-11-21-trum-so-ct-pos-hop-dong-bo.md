# Số chứng từ POS, hộp đồng bộ theo IVT, Xuất kho định lượng sang Bán hàng (T886-T888, T897-T900)

- Ngày: 21/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity làm T898
- Trạng thái cuối phiên: Xong

## Đã làm

- T897: `soXb(seed)` trong `ChungTuBanHang.tsx` đánh số XB + YYMM + 4 số theo ngày, giờ trong tháng. Phiếu POS `so` = số XB, `maHd` = mã FABi. Cột Mã hoá đơn hiện # và 5 ký tự cuối. Chi tiết phiếu ô Mã hoá đơn ghi đủ.
- T897: `MXuatBanPos.tsx`, `xuat-dinh-luong.ts` (tham chiếu), `SoChungTu.tsx` (số XB và mã FABi đều mở được phiếu) dùng `soXb`. `bao-cao.ts` cột "Số hoá đơn" đổi thành "Mã hoá đơn", giữ mã FABi vì báo cáo gom theo kênh, không phải phiếu.
- T898: anti làm lại `HopDongBo.tsx` và mục CSS T898 cuối `app.css` theo `backup/mau-T898-hop-dong-bo-ivt.png`.
- T899: `VoucherScreen.tsx` ẩn nút Đồng bộ lại khi tab Chuyển quỹ (`nhomChon.k === 'cq'`).
- T886: `XuatDinhLuong.tsx` dùng `BoLoc` như Xuất huỷ, cửa hàng vào phễu, thêm lọc cột, nút Excel.
- T887: màn 5.1.2 khai báo ở `ban-hang/index.ts` (sau 3.1.1), bỏ khỏi Kho; báo cáo xuất kho đọc phiếu từ Bán hàng; sửa link ở `SidebarFlyout.tsx`, `thaoTacNhanh.ts`, `kho/quy-trinh.ts`.
- T888: `kho/index.ts` gói Plus có 5-1-4, 5-1-4-2; 5-1-4-3 chỉ Pro.
- T900: `TonKhoBanDau.tsx` thêm hàng lọc cột `OLoc`.
- Viết QD112, QD114.

## Đã kiểm

- `npm run typecheck`: sạch. `npx vite build`: xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Playwright: gói Plus, Bán hàng có cột Số chứng từ, Mã hoá đơn; thanh tab Plus, Pro đúng thứ tự; Xuất kho định lượng mở ở /app/ban-hang/5-1-2 (3850 phiếu); /app/kho/5-1-4-3 ở Plus tự chuyển màn như màn ngoài gói khác. Ảnh hộp đồng bộ khớp bố cục mẫu IVT.
- `kiem_van.py` huong-dan.ts, HopDongBo.tsx, QUYET-DINH.md: 0 ĐỎ.

## Dở dang, việc tiếp theo

- Không. Anti T897, T887 quá hạn 20 phút chưa sửa dòng nào, Claude dừng và tự làm.

## Bẫy, quyết định mới

- QD112, QD114 trong `docs/QUYET-DINH.md`.
