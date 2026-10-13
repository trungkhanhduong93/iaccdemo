# Báo cáo mua hàng: cột tiền, bấm sang chi tiết, bảng kê theo hàng hoá (T200)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/mua-hang/bao-cao.ts`: Tổng hợp mua hàng 4.2.2, Chi tiết mua hàng 4.2.1 có cột Thành tiền, Chiết khấu, Tiền trước thuế (trước là Tiền hàng), Thuế GTGT, Tổng tiền (`cotTien`, `tienDong`). Thành tiền là tiền dòng hàng, Chiết khấu lấy `ck` của dòng (phiếu mẫu chưa có nên bằng 0), Tiền trước thuế = Thành tiền - Chiết khấu.
- Tổng hợp mua hàng: tên nhà cung cấp bấm mở Chi tiết mua hàng lọc sẵn nhà cung cấp đó, cùng kỳ (`datLocDaXem`).
- Chi tiết mua hàng ẩn khỏi danh sách báo cáo, menu, tìm kiếm: `CHI_MO_TU_BC` ở `bao-cao/danh-sach.ts`; `hienMan` ở `registry.ts` thêm tham số `moThang`, `Screen.tsx` truyền `true` để vẫn mở được. `ThanhChon.tsx` giữ báo cáo đang xem trong ô chọn báo cáo.
- Bảng kê mua hàng theo hàng hoá (màn mới `mua-hang/4-2-7`, `bangKeMuaTheoHang`): mỗi mặt hàng của phiếu mua một dòng; Ngày, Số phiếu, Nhà cung cấp, Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá và các cột tiền như trên. Lọc Nhà cung cấp, Mặt hàng; gom nhóm theo nhà cung cấp, mặt hàng, ngày. Mở mọi gói (`MO_IFASTER`).
- Tổng hợp mua hàng in khổ ngang (thêm cột). PhuongXT đổi tên thành Tổng hợp mua hàng theo NCC (`mua-hang/index.ts`, ô trên sơ đồ quy trình).
- Mua hàng theo ngày 4.2.6: dùng chung cột tiền (Giảm giá thành Chiết khấu, Tiền hàng sau giảm giá thành Tiền trước thuế), bỏ Đã trả hàng; Còn nợ = Tổng tiền - Đã thanh toán (75% tổng). Trước đây giảm giá cố định 2% nên Tổng tiền lệch Tổng hợp mua hàng; nay cộng từ dòng phiếu như các báo cáo mua hàng khác.
- `docs/KIEN-TRUC.md`: ghi quy ước báo cáo chỉ mở từ báo cáo khác.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chụp màn Playwright 1600px gói Plus: Tổng hợp mua hàng đủ cột; bấm Công ty TNHH Thực phẩm Tươi An Phú mở Chi tiết mua hàng, dòng Điều kiện lọc đúng nhà cung cấp, tổng 89.960.500 khớp dòng ở Tổng hợp; Bảng kê theo hàng hoá 208 dòng.
- Nhóm Mua hàng ở màn Báo cáo (gói Free, Plus): Tổng hợp mua hàng, Công nợ nhà cung cấp, Mua hàng theo ngày, Bảng kê mua hàng theo hàng hoá; không còn Chi tiết mua hàng.

## Dở dang, việc tiếp theo

- Phiếu mua mẫu chưa có chiết khấu nên cột Chiết khấu trống. Muốn có số thì sinh `ptCk`, `ck` cho dòng phiếu mua ở `dongCua` (`src/ui/generic/gen.ts`), ảnh hưởng mọi màn đọc phiếu mua.
- Bảng kê theo hàng hoá rộng hơn màn 1600px, cột Thuế GTGT, Tổng tiền phải cuộn ngang.

## Bẫy, quyết định mới

- Không.
