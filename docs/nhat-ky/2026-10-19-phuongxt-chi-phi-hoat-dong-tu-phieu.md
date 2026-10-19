# Chi phí hoạt động trang chủ gói Free cộng từ phiếu chi thật (T483)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Lỗi PhuongXT báo: ở màn Chi phí hoạt động, bấm từng lý do mở danh sách Thu chi không khớp số (lương, thuê nhà ra rỗng; Chi phí khác lệch). Nguyên nhân: số trên màn lấy từ mô hình `tinhToanTongQuan` (cơ cấu chi phí theo doanh thu), không cộng phiếu; dữ liệu mẫu không có phiếu lương, thuê nhà; link chỉ mở tab Tiền mặt.
- `src/modules/home/chiPhiPhieu.ts` (mới): `phieuChiPhi(s)` đọc phiếu chi tiền mặt, chi ngân hàng của Thu chi 2.1.1 đúng như danh sách (phiếu mẫu, phiếu lập thêm, đã sửa, bỏ phiếu đã xoá), lý do thuộc `LY_CHI_PHI`, trừ "Chi phí chờ phân bổ" (đã vào dòng Chi phí phân bổ, khấu hao). `chiPhiThangTuPhieu` cộng theo tháng của ngày phiếu, cửa hàng, chia theo lý do. `usePhieuChiPhi` tính lại khi lập, sửa, xoá phiếu. Lấy thẳng phân hệ `tien`, không qua `registry` (import `registry` từ file trang chủ gây lỗi "Cannot access 'home' before initialization" khi tải lại nóng).
- `src/modules/home/ChiPhiThang.tsx`, `src/ui/mobile/MChiPhiThang.tsx`: mỗi lý do chi phí một dòng (số phiếu, tỷ lệ). Bấm dòng mở ngay bên dưới danh sách phiếu chi tiền mặt, ngân hàng của lý do đó (web: bảng Ngày, Số phiếu, Loại, Cửa hàng khi xem tất cả, Đối tượng, Diễn giải, Số tiền, dòng Cộng; điện thoại: thẻ gọn), không sang phân hệ Thu chi nữa (PhuongXT chốt: Thu chi đã chia tab Tiền mặt, Ngân hàng nên link sang không đúng). Xuất Excel thêm cột Số phiếu, Tiền mặt, Ngân hàng.
- Trang chủ đổi theo: `BaBaiToanFree.tsx`, `MTrangChuFree.tsx` thẻ Chi phí hoạt động, dòng "Lớn nhất", lợi nhuận; `laiLo13Thang` (tháng 7 đến 10) và `soLieuBieuDoFree.ts` `layLaiLoCuaHang` (hộp lãi lỗ theo cửa hàng, điện thoại) dùng chi phí từ phiếu cộng chi phí phân bổ.
- `src/modules/tien/phieu-dinh-ky.ts` (mới), gắn vào `phieuThem` của `tien/index.ts`: phiếu chi ngân hàng thuê mặt bằng ngày 05 (Lê Lợi 65, Nguyễn Trãi 42, Thảo Điền 55 triệu như Sổ bổ sung) và lương ngày cuối tháng của chính tháng đó (64, 47, 55 triệu, tổng 166 triệu như bảng lương Sổ bổ sung), tháng 7 tới 07/10/2026. Lương để cuối tháng để tháng 10 (mới 7 ngày doanh thu) không gánh lương tháng 9 thành lỗ.
- `src/ui/generic/VoucherScreen.tsx`: tách `lyDoThuChi(cfg, r)` dùng chung; `VoucherList` có `key` theo `?lyDo`, `?thang` để đang ở danh sách mà mở link khác thì đọc lại lọc. `src/ui/generic/daXoa.ts`: thêm `apKhoPhieu`, `useBanPhieu` đọc kho phiếu ngoài React.
- CSS cuối `app.css` mục T483.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` 6 file giao diện đã sửa: sạch.
- Trình duyệt, gói Free, Phố Mây Lê Lợi, tháng 10: thẻ Chi phí hoạt động trang chủ 89.097.000 đ bằng tổng màn Chi phí hoạt động (thuê nhà 65.000.000; Chi phí khác 24.097.000 gồm tiền mặt 23.847.000, ngân hàng 250.000). Bấm Chi phí khác mở 5 phiếu (4 tiền mặt, 1 ngân hàng) cộng 24.097.000, web và điện thoại. Tháng 9: thuê nhà 65, lương 64, khác 15,378 triệu. Điện thoại 375px: thẻ trang chủ và màn chi phí cùng số, danh sách Chi phí khác cộng 24.097.000. Xong trả phiên về Phố Mây gói Plus.
- Chưa kiểm: tháng 7, 8 trên giao diện (chỉ có phiếu thuê nhà, lương mẫu vì phiếu thu chi sinh tự động chỉ từ cuối tháng 9).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- PhuongXT chốt trong phiên (chưa ghi `QUYET-DINH.md`, chờ Trum): chi phí hoạt động trang chủ gói Free cộng từ phiếu chi thật có lý do là chi phí, theo ngày phiếu; trang chủ đổi theo; sinh phiếu chi mẫu lương, thuê nhà hằng tháng.
- Không ghi `docs/BAY.md`.
