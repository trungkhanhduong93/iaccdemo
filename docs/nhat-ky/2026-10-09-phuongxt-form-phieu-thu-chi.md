# Form phiếu thu chi: đối tượng, lý do, ghi chú, tháng lãi lỗ, tổng tiền đáy form (T49)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Phạm vi phân hệ Tiền (5 loại phiếu ở 2.1.1), cờ `laTien` trong `ChungTuForm.tsx`; phân hệ khác giữ nguyên trừ các mục ghi "mọi phiếu".
- Đầu form: bỏ chip Số phiếu, chip tên màn, ô Loại phiếu, Tổng tiền góc phải. Tiêu đề chỉ là tên loại phiếu. Chính giữa đầu form là trạng thái Thêm mới / Đang chỉnh sửa <số> / Chi tiết phiếu <số> (prop `giua` mới của `FormToanMan.tsx`). Gói Free không hiện chip trạng thái ghi sổ khi xem phiếu.
- Đối tượng chọn từ danh mục (`DS_DOI_TUONG` xuất từ `BangSua.tsx`), chọn xong điền Mã số thuế. Người giao, nhận và Nhân viên thực hiện gộp thành Người giao dịch.
- Lý do đứng trên Diễn giải. Chọn lý do thì Diễn giải, Ghi chú và lý do mọi dòng đổi theo. Gõ Ghi chú thì Diễn giải chép theo, sửa Diễn giải không đổi Ghi chú. Đối tượng đầu phiếu đổi thì đối tượng mọi dòng đổi theo.
- Ngày chứng từ có lịch (`ONgay` dùng `LichDon`). Gói Free có Tháng hạch toán lãi lỗ (`thangLaiLo`): tháng của ngày chứng từ và các tháng trước chưa khoá sổ; phiếu chuyển quỹ không có.
- Bảng chi tiết (`BangSua.tsx`): cột Lý do (`Dong.ly` trong `gen.ts`), đối tượng dòng mới theo đầu phiếu, bỏ dòng Tổng cộng ở phiếu thu chi (`khongTong`). Tổng tiền (kèm số dòng) ở dải cố định đáy form, số đo mép cột Thành tiền (`TongDay`, prop `day` của `FormToanMan`).
- Bỏ tab Hạch toán (Ghi sổ ở gói Free) ở phiếu thu chi.
- Mọi phiếu: menu Tiện ích đổi Nhân bản thành Sao chép; thêm Tuỳ chỉnh giao diện phiếu (`HopCotPhieu`, `cotTuyChon`, prop `an` của `BangSua`), cột ẩn nhớ trong localStorage khoá `iacc-cot-phieu:<phân hệ>/<màn>`.
- Mọi phiếu ở form chung: lưu phiếu mới thì hiện đầu danh sách, số phiếu tăng dần; sửa phiếu có sẵn rồi lưu thì danh sách hiện nội dung mới (`themPhieu`, `suaPhieu`, `soKeTiep` trong `generic/daXoa.ts`, `VoucherScreen.tsx` gộp vào). Giữ tới khi tải lại trang.
- CSS: các mục T49 cuối `app.css` (ô ngày, trạng thái giữa, dải tổng tiền, hộp cột).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: 209 lượt mở màn, in `Không có lỗi.`
- `python tools/kiem_van.py` cho các file có chữ đã sửa: sạch.
- Playwright: 4 loại phiếu ở gói Free và Plus (nhãn, cột); đổi lý do, đối tượng, ghi chú, tháng lãi lỗ, chọn ngày; trạng thái giữa lệch 0px ở 1920px và 1280px; số Tổng tiền trùng mép cột Thành tiền ở 1920px và 1366px; ẩn cột Đối tượng rồi tải lại vẫn giữ; lưu, lưu và thêm, sửa phiếu có sẵn rồi lưu: danh sách và tổng cập nhật đúng.

## Dở dang, việc tiếp theo

- Không.
- Màn Bán hàng 3.1.1 có form riêng, chưa có lưu phiếu mới vào danh sách.
- `ChungTuForm.tsx` trùng file T47 của Trum; PhuongXT chọn làm không hỏi trước. Trum cần kéo bản mới trước khi sửa tiếp file này.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD33.
