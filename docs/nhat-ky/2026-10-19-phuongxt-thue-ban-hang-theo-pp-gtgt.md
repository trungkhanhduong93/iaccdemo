# Ẩn hiện thuế bán hàng theo phương pháp GTGT (T450)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `app/session.tsx`: thêm `gtgtTyLe(s)`. Đúng khi hộ kinh doanh, hoặc doanh nghiệp gói Free, Standard chọn GTGT theo % doanh thu. Gói Plus, Pro luôn khấu trừ (ô chọn ở Thông tin đơn vị bị khoá), nên không đọc `s.ppGtgt`, vì `ppGtgt` mặc định là `tyLe` cho cả gói Plus.
- `modules/ban-hang/giam-thue.ts` (mới): chuyển `giamThueHkd` ra đây để form chung dùng được, tránh vòng import với `ChungTuBanHang.tsx`. `ChungTuBanHang.tsx` vẫn export lại hàm này.
- `ban-hang/ChungTuBanHang.tsx` (Xuất bán POS: danh sách, khung chi tiết, form xem): trước đây xét theo loại hình hộ kinh doanh, nay xét theo `gtgtTyLe`. Biến `hkd` đổi tên thành `tyLe`.
- `ui/generic/BangSua.tsx`: thêm prop `giamThue` (hàm tính từ tiền sau CK). Có prop này thì bảng bỏ Thuế suất, Tiền thuế, thêm cột Giảm thuế GTGT ở cả hai chế độ xem và sửa, cộng ở dòng tổng, có ô lọc. `cotTuyChon` có thêm `coGiamThue`.
- `ui/generic/ChungTuForm.tsx`: chứng từ nhóm `ban` có thuế (trừ phiếu `thue: 0` như Bán nội bộ) mà `gtgtTyLe` đúng thì tiền thuế bằng 0, dải tổng ghi Giảm thuế GTGT, Tổng tiền = tiền hàng − CK − giảm thuế.
- `ui/generic/VoucherScreen.tsx`: thêm `giamGtgtCua`. `useDongChungTu` đổi dòng chứng từ bán hàng thành thue 0, có `giamThue`, tổng trừ giảm thuế, nên danh sách web và điện thoại đều theo. Cột Tiền thuế đổi thành Giảm thuế GTGT. Khung chi tiết và tab Khác theo cùng quy tắc.
- Báo cáo: `types.ts` thêm `ReportCfg.theoGtgt` và tham số thứ 4 `tyLe` cho `rows`. `ReportScreen.renderReport` lọc cột `thue`, `vat` hoặc `giamThue`. Đã bật cho 3-2-6, 3-2-7, 3-2-8, 3-2-9 (`ban-hang/index.ts`, 3-2-7 và 3-2-9 không có cột thuế) và 3.2.3. Đã sửa `ban-hang/bao-cao.ts`, `ban-hang/data.ts`.
- `ui/mobile/MXuatBanPos.tsx`: đổi `hkd` thành `gtgtTyLe`. Báo cáo điện thoại đi qua `renderReport` nên tự theo.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt, Phố Mây gói Standard, GTGT theo % doanh thu: danh sách, chi tiết Xuất bán POS hiện Giảm thuế GTGT, không có Thuế suất, Tiền thuế. Hàng bán trả lại: danh sách, xem, thêm mới cũng vậy. Phiếu TL dòng 1 có tiền hàng 5.237.000, giảm 31.422, tổng 5.205.578. Báo cáo 3-2-6, 3-2-8 có cột Giảm thuế GTGT, tổng 2.769.667.701.
- Đổi ở Thông tin đơn vị sang khấu trừ rồi bấm Lưu: các màn trên đổi lại thành Thuế suất, Tiền thuế, Thuế GTGT. Phiếu TL tổng 5.655.960, báo cáo tổng 3.015.984.205.
- Điện thoại 375px, GTGT theo % doanh thu: đơn Xuất bán POS ghi "giảm thuế" từng món, khối tổng có Giảm thuế GTGT.
- Chưa kiểm 3.2.3 Doanh thu theo ngày trên trình duyệt vì gói Standard không mở màn này. Màn này dùng cùng đường lọc cột như 3-2-6.
- Kiểm xong đã trả phiên trình duyệt về gói Plus, cửa hàng Tất cả.

## Dở dang, việc tiếp theo

- T451: trên điện thoại, màn xem và lập phiếu bán hàng chung (`MXemPhieu.tsx`, `MLapPhieu.tsx`, ví dụ Hàng bán trả lại) còn ghi "Thuế x%", VAT trên dòng hàng. Chưa sửa vì hai file này đang thuộc T449 của Trum. Danh sách điện thoại đã đúng tổng tiền vì dùng `useDongChungTu`.

## Bẫy, quyết định mới

- Không. Lưu ý: `s.ppGtgt` là trường chung của phiên, không theo đơn vị, và mặc định là `tyLe`. Muốn biết đơn vị đang áp phương pháp nào thì dùng `gtgtTyLe(s)`, không đọc thẳng `s.ppGtgt`.
