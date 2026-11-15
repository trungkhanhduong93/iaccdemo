# Điện thoại, lập Bán hàng: thanh toán ngay, HĐĐT, kênh bán, thuế tỷ lệ (T855)

- Ngày: 15/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLapPhieu.tsx`, nhánh `khuonMua`, theo web `ChungTuForm.tsx` T785, T450:
  - Bán hàng (`laBanTay`): ô Kênh bán bắt buộc (sheet chọn từ `KENH_BAN`, mặc định Tại quán khi thêm mới), lưu `kenh` vào phiếu.
  - Bán hàng: tích Thanh toán ngay, chọn quỹ; lưu thì sinh phiếu thu (quỹ tiền mặt) hoặc báo có (quỹ ngân hàng) bên Thu chi, lý do Thu tiền bán hàng, giữ ở `_ctTt`. Dùng chung hàm `ctTtTra` với Hàng bán trả lại.
  - Bán hàng: công tắc Xuất HĐĐT (mặc định bật khi thêm mới nếu Cấu hình HĐĐT bật). Lưu thì gọi `phatHanhHd`: ký hiệu theo cửa hàng, ngày hoá đơn hôm nay, người mua theo khách (khách không có mã số thuế là không lấy hoá đơn). Phiếu đã xuất thì hiện chữ Đã xuất HĐĐT thay công tắc.
  - Góp ý thêm của người dùng: ô Kênh bán đứng trước Ngày chứng từ (Khách hàng, Kho xuất, Kênh bán, Ngày chứng từ, Ghi chú). Công tắc ghi Xuất HĐĐT. Bật công tắc thì nút ở chân ghi Lưu và Xuất HĐĐT, tắt thì ghi Lưu phiếu.
  - GTGT theo % doanh thu (`tyLeBan`): Bán hàng, Hàng bán trả lại bỏ ô VAT trên `TheHangMua` (prop `khongVat`), thuế dòng 0, Tổng cộng hiện Giảm trừ thuế (`giamThueHang`), tổng thanh toán trừ giảm trừ thuế. Phương pháp khấu trừ giữ ô VAT, Tiền thuế.
- `src/ui/mobile/MBanHangTay.tsx` (màn xem Bán hàng điện thoại, không phải `MXemPhieu.tsx`): mục Tham chiếu thêm phiếu thu, báo có lập khi Thanh toán ngay (`ctTtCon`) và phiếu thu lập sau (`dsTtCon`), đứng đầu như phiếu mua, bấm mở bên Thu chi.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong. `python tools/kiem_tra.py --nhanh` (cổng 5184, `KIEM_TRA_URL`): Không có lỗi.
- `python tools/xuat_bao_cao_he_thong.py` hỏng: thiếu module `build_present`, chưa làm mới file Excel.
- Khung 375x812, gói PL: Bán hàng thêm Phở bò tái, tích Thanh toán ngay, HĐĐT bật: lưu BH2610-0261 64.610 đ, xuất hoá đơn 2C26TAA, màn xem có Đã thu 64.610/64.610, Kênh bán Tại quán, Giảm thuế GTGT 390. Hàng bán trả lại lưu TL2610-0261 28.826 đ, không ô VAT. `?ppGtgt=khauTru`: ô VAT, Tiền thuế vẫn hiện.
- Màn xem BH2610 vừa lập có Tham chiếu PT2610-0261, bấm mở đúng phiếu thu.

## Dở dang, việc tiếp theo

- Không.
- Chưa có popup sửa người mua trên hoá đơn như web (`HopNguoiMua`); khách công ty thiếu tên đơn vị, địa chỉ thì báo lỗi ở ô Khách hàng.
- `MLapPhieu.tsx` Trum đang giữ ở T552: hỏi Trum trước khi push.

## Bẫy, quyết định mới

- Không.
