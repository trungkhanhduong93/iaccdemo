# Điện thoại, nhãn VAT và xem hoá đơn điện tử ở Bán hàng, Xuất bán POS (T835)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MDsChungTuChuan.tsx` (`MDsDongPhieu`): prop `vat`, nhãn VAT nhỏ trên số chứng từ, kiểu như `.ds-so-vat` của web (T802).
- `MBanHangTay.tsx`: danh sách tab Bán hàng có nhãn VAT khi chứng từ có `_hd`; chi tiết, ô Số hoá đơn bấm mở `HopXemHd`.
- `MXuatBanPos.tsx`: danh sách đơn POS có nhãn VAT khi đơn có hoá đơn FABi (`donPosCua(...).hoaDon`); chi tiết, Số hoá đơn bấm xem. Chứng từ đưa vào hộp xem dựng bằng `hdFabi` như dòng danh sách web.
- `ChungTuBanHang.tsx`: export `hdFabi` (không đổi nội dung).
- `hddt.tsx` (`HopXemHd`): prop `dienThoai`: chỉ bản hoá đơn, tiêu đề "Hoá đơn điện tử số ..." không ký hiệu, nhãn trạng thái (Hợp lệ, Dự thảo) nhỏ kiểu nhãn VAT ở hàng tiêu đề cạnh nút đóng; chân chỉ Chia sẻ PDF, Đóng; không quay về thông tin hoá đơn, không Tải PDF, XML, không In. Web không đổi.
- `app.css` mục T835: điện thoại (dưới 768px) tờ hoá đơn 794px thu nhỏ bằng `zoom` theo bề ngang màn (0,42 đến 0,85), người dùng chụm ngón để phóng to; hai nút chân cỡ như chân xem phiếu mua (cao 44px, bo 12px, chữ 14/15px).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`: Không có lỗi. `kiem_van.py` 4 file giao diện: sạch.
- Trình duyệt 375x812, gói Plus: tab Bán hàng có nhãn VAT đúng các chứng từ web có VAT (HDDC2610-0001, HDTT2610-0001, BH2610-0013...); BH2610-0013 bấm 00000126 mở hoá đơn vừa màn (tờ 12px đến 361px, không tràn ngang), nhãn Hợp lệ cùng hàng tiêu đề; Chia sẻ PDF mở hộp chia sẻ vừa màn; Đóng tắt hộp. Xuất bán POS: 476/1466 đơn có nhãn VAT, mở đơn có hoá đơn, bấm số 00002146 xem được hoá đơn 1C26TPM.
- Thẻ meta viewport không chặn phóng to.

## T836 (sau khi push)

- `MBanHangTay.tsx`: thẻ danh sách chứng từ đã có hoá đơn (`hdCua`) bỏ dòng "Đã xuất HĐ ...", chỉ còn nhãn VAT; hoá đơn thay thế, điều chỉnh vẫn ghi tên loại; chưa xuất vẫn ghi trạng thái (Chưa xuất HĐĐT, Hoá đơn dự thảo, Không xuất HĐ). Đã kiểm ở 375px gói Plus; typecheck, build, `kiem_tra --nhanh`, `kiem_van` sạch.

## T838

- `MBanHangTay.tsx`: chi tiết hoá đơn thay thế, điều chỉnh, huỷ bán trước đây chỉ có Thông tin hoá đơn khi chính chứng từ đã xuất. Nay theo web T787, T798: dòng "Thay thế cho / Điều chỉnh cho / Huỷ bán do thay thế" là hoá đơn gốc (`hdGocCua`) kèm nhãn Đã xuất HĐĐT, bấm số mở `HopXemHd` hoá đơn gốc; Ký hiệu hoá đơn gốc; Chứng từ gốc (mở chi tiết chứng từ đó); Loại điều chỉnh; khối "Hoá đơn mới" kèm nhãn khi đã phát hành; chưa phát hành có "Xem dự thảo" (`HopXemHd nhap`, số 00000000). `xemHd` đổi thành hoá đơn đang xem `{ r, hd, nhap }`.
- Kiểm 375px gói Plus: HDTT2610-0001, HDDC2610-0001, HDTT2610-0002, HBH2610-0001 hiện đúng; bấm 00000125 xem hoá đơn gốc (Hợp lệ), Xem dự thảo (Dự thảo), BH2610-0012 mở chứng từ gốc. Typecheck, build, `kiem_tra --nhanh`, `kiem_van` sạch.
- Theo góp ý sau đó: Ngày chứng từ bỏ giờ; Thông tin hoá đơn gộp một thẻ, thứ tự Số hoá đơn (hoá đơn mới, dự thảo thì "Dự thảo" bấm xem), Ngày hoá đơn, Ký hiệu, Loại điều chỉnh, Hoá đơn gốc (chỉ số, bấm xem); bỏ Mã tra cứu (đã ở thẻ tổng tiền), Ký hiệu hoá đơn gốc, Chứng từ gốc, nhãn Đã xuất HĐĐT ở hoá đơn gốc; bỏ CSS `m-t838-*`.
- Chưa làm: phát hành hoá đơn dự thảo từ điện thoại (web có nút Phát hành ở form, màn Hoá đơn điện tử).

## T839 (15/11/2026)

- Nhãn Dự thảo màu đỏ (`--red`, `--red-t`): danh sách Bán hàng web (`ChungTuBanHang.tsx`, `.ds-so-vat.nhap` cạnh nhãn VAT), danh sách điện thoại (`MDsDongPhieu` prop `duThao`, `.m-t835-vat.nhap`), chip thẻ tổng tiền điện thoại (`.m-t600-chip-tt.nhap`), nhãn tiêu đề hộp xem hoá đơn điện thoại, chữ Dự thảo trên chip loại hoá đơn ở form web (`ChungTuForm.tsx`, `.ct-hd-nhap`).
- Sự cố: phiên khác (T837) làm cùng thư mục này. Commit T838 đầu (`317b282f`, đã push) cuốn theo phần sửa dở của phiên đó trong `MBanHangTay.tsx` (dòng danh sách khách hàng, loại chứng từ, lọc Loại chứng từ, `duThao`), còn khai báo `duThao` trong `MDsChungTuChuan.tsx` chưa commit nên main `4ccf8f19` không qua typecheck. Commit T839 kèm khai báo đó để main build lại được.
- Kiểm: 375px gói Plus, nhãn Dự thảo đỏ ở HDDC2610-0002, HDTT2610-0002, VAT vẫn xanh; web 1024px cùng hai chứng từ; form web HDDC2610-0002 chữ Dự thảo đỏ. Typecheck, build, `kiem_tra --nhanh`, `kiem_van` sạch.

## T840 (15/11/2026)

- `MBanHangTay.tsx`: huỷ bán không hiện Thông tin hoá đơn (hoá đơn gốc). Dòng Tham chiếu ở Thông tin chung dựng như `ChungTuForm.tsx` web (QD107, T787, T815): `_hdGoc` (Chứng từ gốc), `_huyBan`, `_hdTt`, `dsHdMoiCon`, `dsTraBanCon`; chỉ hiện chứng từ còn trong danh sách; bấm mở chi tiết (hàng bán trả lại mở màn 3.1.4).
- Kiểm 375px gói Plus: HBH2610-0001 tham chiếu BH2610-0010, HDTT2610-0001; HDTT2610-0001 tham chiếu BH2610-0010, HBH2610-0001; BH2610-0010 tham chiếu HDTT2610-0001, HBH2610-0001; HDDC2610-0001 với BH2610-0011 hai chiều; bấm HDTT2610-0001 từ huỷ bán mở đúng chứng từ. Build, `kiem_tra --nhanh`, `kiem_van` sạch.

## T841 (15/11/2026)

- `MXemPhieu.tsx` (phần Hàng bán trả lại `laTraBan` của T830): thẻ đầu dùng khuôn phiếu mua (`m-t600-the-dau m-t655-dau`): cửa hàng, nguồn (`NGUON`), Tổng tiền theo `row.tong` (khớp danh sách; thẻ cũ tính lại từ dòng hàng có cộng VAT nên lệch, vd TL2610-0259 9.713.440 thay vì 8.933.078), khung thanh toán chip, Đã trả / tổng (`soDaTra`). Bỏ ô Cửa hàng, Nguồn chứng từ; Thông tin chung bỏ Địa chỉ, Mã số thuế, Người giao dịch, Thanh toán.
- Kiểm 375px gói Plus: TL2610-0259, TL2610-0255 đúng; build, `kiem_tra --nhanh`, `kiem_van` sạch.

## T842 (15/11/2026)

- `MLapPhieu.tsx` (form Hàng bán trả lại `laTraBan` của T830): ẩn ô Địa chỉ, Mã số thuế, Người giao dịch, Phương thức (giá trị vẫn lưu theo khách hàng, chứng từ gốc, mặc định Tiền mặt), bỏ khối Tổng thanh toán (tự tính) ở thẻ đầu; thêm khối Tổng cộng dưới danh sách mặt hàng (`m-t601-tong-khu`) và chân ghim kiểu phiếu mua có dòng Tổng tiền (n dòng) (`m-t656-tong`).
- Kiểm 375px gói Plus: Trả lại từ BH2610-0009, form không còn các ô trên, Tổng cộng 2.200.000, chân ghim Tổng tiền (2 dòng) 2.200.000 đ, lưu được. Build, `kiem_tra --nhanh`, `kiem_van` sạch.

## Dở dang, việc tiếp theo

- Phiên đã dài: việc tiếp theo nên mở phiên mới, mỗi phiên một bản clone riêng (QD21).

- Không.

## Bẫy, quyết định mới

- Hộp xem hoá đơn của web có khổ giấy cố định 794px: trên điện thoại phải thu nhỏ bằng `zoom` theo nấc bề ngang (CSS chưa chia được độ dài để ra tỷ lệ).
