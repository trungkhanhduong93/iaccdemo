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

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Hộp xem hoá đơn của web có khổ giấy cố định 794px: trên điện thoại phải thu nhỏ bằng `zoom` theo nấc bề ngang (CSS chưa chia được độ dài để ra tỷ lệ).
