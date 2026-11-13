# Chứng từ bán hàng lập tay: Tiện ích Trả hàng sang Hàng bán trả lại (T815)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: menu Tiện ích của chứng từ bán hàng lập tay (form có `hdDienTu`, gói Plus) thêm Trả hàng (`coTraBan`), dùng lại khuôn `TraTu`, `moTraHang` của phiếu mua (T727). Chỉ hiện với chứng từ Bán hàng, Hoá đơn thay thế, không hiện với Huỷ bán, Hoá đơn điều chỉnh, hoá đơn đã bị thay thế, chứng từ FABi, và khi gói không mở được màn 3.1.4.
- Bấm Trả hàng mở `/app/ban-hang/3-1-4/moi`, chép cửa hàng, khách hàng, địa chỉ, mã số thuế, kho, hình thức thanh toán, phương thức, dòng hàng (bỏ dòng số lượng 0). Ngày chứng từ là hôm nay, số chứng từ tự sinh, số hoá đơn để trống. Ghi chú, diễn giải "Hàng bán trả lại theo <số chứng từ bán>".
- Mỗi dòng chép sang mang `slMax` (số lượng đã bán, thêm vào `Dong` ở `src/ui/generic/gen.ts`). Phiếu trả lại lập kiểu này có `_traTuBan`; form bật `chiDongCo` cho `BangHangBan` cả khi thêm mới lẫn khi sửa lại sau.
- `src/modules/ban-hang/BangHangBan.tsx`: prop `chiDongCo`: mã hàng, tên hàng, đơn giá, giảm giá, chiết khấu, phí chỉ xem; chỉ sửa Số lượng, `OSoGo` có `max = slMax` nên gõ quá số đã bán bị bỏ phím; ẩn Thêm dòng, Thêm hàng loạt; vẫn Xoá dòng, Xoá hết.
- `luu()`: phiếu trả lại từ chứng từ bán phải còn dòng, mỗi dòng số lượng lớn hơn 0 và không quá `slMax`, sai thì báo tên hàng.
- Tham chiếu hai chiều: phiếu trả lại lưu `_thamChieu`, `_thamChieuDi`, dòng Tham chiếu ghi "Chứng từ bán hàng"; chứng từ bán ghi `_dsTraBan` (`suaPhieu`), dòng Tham chiếu hiện số phiếu trả lại, tên "Hàng bán trả lại". Cột Tham chiếu ở danh sách chứng từ bán hàng (`ChungTuBanHang.tsx`, `hangTay`) có thêm số phiếu trả lại.
- `src/ui/generic/daXoa.ts`: `MAN_TRA_BAN`, `dsTraBanCon` (bỏ phiếu trả đã xoá); `ttThamChieu` tính cả phiếu trả lại nên chứng từ bán còn phiếu trả thì phải xoá phiếu trả trước.
- `src/modules/ban-hang/hddt.tsx`: `chepGoc` bỏ `_dsTraBan` để hoá đơn thay thế, điều chỉnh không chép tham chiếu phiếu trả của chứng từ gốc.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần 1 báo 1 lỗi "Form phiếu thu: Esc không quay về Quy trình" (không dính phần sửa, lúc đó trình duyệt khác cũng đang mở cùng dev server); chạy lại: Không có lỗi.
- `python tools/kiem_van.py` 3 file đã sửa: 0 ĐỎ.
- Trình duyệt, gói Plus: BH2610-0008 (2 dòng, mỗi dòng 30) → Tiện ích có Trả hàng → mở Thêm hàng bán trả lại đủ kho, khách, địa chỉ, mã số thuế, 2 dòng; chỉ có ô Số lượng, không có Thêm dòng. Gõ 45 bị chặn, gõ 5 nhận, tổng tính lại. Số lượng 0 bấm Lưu báo "Nhập số lượng trả lại của Phở bò đặc biệt". Xoá dòng 2, lưu thành TL2610-0261, Tham chiếu có BH2610-0008; mở BH2610-0008 thấy Tham chiếu TL2610-0261. Sửa lại TL2610-0261 vẫn khoá dòng.

## Dở dang, việc tiếp theo

- Không.
- Số lượng tối đa là số trên chứng từ bán, chưa trừ số đã trả ở các phiếu trả lại trước (đúng yêu cầu người dùng). Muốn trừ thì cộng `sl` các phiếu trong `dsTraBanCon(row)` theo mã hàng khi dựng `slMax` ở `moTraHang`.
- Bản điện thoại chưa có Trả hàng, người dùng chỉ yêu cầu web.
- `python tools/xuat_bao_cao_he_thong.py` lỗi `No module named 'build_present'` như phiên trước (thiếu `Present/tools` cạnh repo), chưa làm mới file Excel.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- Không.
