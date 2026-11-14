# Điện thoại, tab Bán hàng lập tay, bỏ Báo cáo theo dõi (T833)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MDsChungTuChuan.tsx` (`HangTabsBanHang`): bỏ tab Báo cáo theo dõi ở menu Bán hàng; gói Plus thêm tab Bán hàng (`/app/ban-hang/3-1-1?tab=tay`), gói Pro giữ tab Bán hàng 3.1.7. Gói Standard không đổi. Prop `onMoTheoDoi` đổi thành `tay`.
- `MChungTu.tsx`, `MXuatBanPos.tsx`: thôi gắn Báo cáo theo dõi vào thanh tab Bán hàng.
- `MBanHangTay.tsx` (mới): danh sách chứng từ bán hàng lập tay (tìm, lọc thời gian, cửa hàng, khách hàng, trạng thái HĐĐT, nút nổi Lập chứng từ bán hàng) và chi tiết theo khuôn chi tiết Xuất bán POS (thẻ Chứng từ, Khách hàng, Hoá đơn, dòng hàng, khung tổng). Chân chi tiết có Trả lại, Xuất HĐĐT theo luật web (T763, T815); hết tiện ích thì chỉ có Đóng. Xuất HĐĐT dùng chung hộp `HopXuatHddt` của web.
- `MXuatBanPos.tsx`: lớp ngoài chọn màn theo gói Plus: `?tab=tay` danh sách, `/moi` lập chứng từ bằng `MLapPhieu` với cấu hình `BAN_TAY` (lưu cùng màn `ban-hang/3-1-1` như web), `/<id>` mở chi tiết. Lập xong bấm Đóng về lại tab Bán hàng (`datVeTabTay`, `layVeTabTay`).
- `manMobile.ts`: gói Pro, màn 3.1.7 dùng `MBanHangPro` (danh sách, chi tiết mới; lập, sửa vẫn qua `MChungTu`).
- `MLapPhieu.tsx` (Trum đang giữ ở T552, người dùng đồng ý sửa ít nhất): nhận `traTu.ban` để lập Hàng bán trả lại từ chứng từ bán: diễn giải "Hàng bán trả lại theo ...", chép hình thức thanh toán, tham chiếu `_traTuBan`, ghi `_dsTraBan` vào chứng từ bán, dòng hàng chỉ sửa số lượng (thẻ `TheHangMua` chiSl, nhãn Đã bán), kiểm số lượng không quá số đã bán, ẩn Thêm mặt hàng.
- `app.css`: mục T833 cuối file, chân chi tiết hai nút, hộp Xuất HĐĐT vừa bề ngang điện thoại.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 4 file giao diện đã sửa: sạch.
- Trình duyệt 375x812: gói Plus thấy tab Xuất bán POS, Bán hàng, Hàng bán trả lại; mở BH2610-0009, Xuất HĐĐT phát hành được, chi tiết hiện số hoá đơn, nút Xuất HĐĐT ẩn; Trả lại mở lập Hàng bán trả lại điền sẵn, đổi 5 tô, lưu TL2610-0261 tổng 1.225.000 đ, chứng từ bán hiện tham chiếu. Gói Standard chỉ còn tab Xuất bán POS. Gói Pro tab Bán hàng 3.1.7 hiện danh sách, chi tiết có Trả lại, Xuất HĐĐT.
- Chưa kiểm trên web bản máy tính sau khi trả lại từ điện thoại (dữ liệu dùng chung, luật như T815).

## Dở dang, việc tiếp theo

- Không.
- Form lập phiếu điện thoại (`MLapPhieu.tsx`) chưa có giảm thuế GTGT theo % doanh thu: phiếu trả lại lập từ điện thoại bỏ VAT (ts, thue = 0) nhưng chưa trừ giảm thuế như web. Có từ trước T833 ở form Hàng bán trả lại điện thoại.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được (thiếu `build_present`, như các phiên trước).

## Gộp với phiên khác (cuối ngày 14/11/2026)

- Cùng lúc một phiên khác đã push T830 (Hàng bán trả lại đủ trường như web), T831 (mục Bán hàng riêng trong menu Nghiệp vụ, gói Plus `?tay=1`), nhận T832 (bỏ tab thừa). Người dùng chọn giữ bố cục menu của phiên đó: Bán hàng không còn là tab cạnh Xuất bán POS mà là mục riêng.
- Việc của phiên này đổi mã: T830 thành T833, T831 thành T834, T832 thành T835 (cả class CSS `m-t83x`).
- Gộp: mục Bán hàng gói Plus (`/app/ban-hang/3-1-1?tay=1`, `/<id>`) mở `BanTayPlus` (danh sách, chi tiết của phiên này); `/moi`, `?sua=1` mở `MChungTu` cấu hình lập tay như phiên kia. `HangTabsBanHang` giữ bản phiên kia (bỏ prop `tay`), chỉ bỏ thêm nút Báo cáo theo dõi. Trả lại dùng form Hàng bán trả lại mới của phiên kia, thêm phần `traTu.ban` của phiên này.
- Nhánh dự phòng trước khi gộp: `luu/ban-hang-dien-thoai-truoc-gop` (chỉ ở máy).

## Bẫy, quyết định mới

- Không.
