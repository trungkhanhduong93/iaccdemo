# Tồn kho ban đầu: thanh lọc gọn, Thêm mới chọn hàng, Sửa và Lưu, nhiều dòng theo ĐVT (T922)

- Ngày: 24/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `kho/index.ts`: gói Plus xếp tab Tồn kho ban đầu xuống cuối, sau Tính giá vốn.
- `TonKhoBanDau.tsx`: bỏ chip Cần xem lại, ô số lượng, đơn giá chưa điền để trống, bỏ nhãn Thiếu số lượng, Thiếu đơn giá, bỏ dòng "Số dư tại ngày", cột ĐVT và Nhóm chỉ hiện tên.
- Thanh lọc dùng `BoLoc` như danh sách mua hàng: ô tìm, Kho hàng ngoài thanh; Nhóm hàng hoá, Hàng hoá trong phễu.
- Nút Thêm mới mở thẳng hộp `ThemHangLoat` (thêm tham số `tieuDe`, `chonLaiDaCo`), cho tích cả hàng đã có tồn đầu, vẫn gắn nhãn "Đã có tồn đầu ở <kho>". Bỏ bước Thiết lập hàng loạt khỏi màn.
- Nút Sửa: mọi dòng gõ được ĐVT, số lượng, đơn giá; Lưu, Huỷ cạnh Thêm mới; số gõ giữ bản nháp tới khi Lưu. Dòng mới thêm xếp cuối bảng.
- Menu mũi tên: Xoá hàng loạt, Sao chép sang kho khác (đổi tên) chỉ hiện khi đã tích dòng.
- `ton-dau.ts`: mỗi mặt hàng nhiều dòng miễn khác ĐVT (id = mã|ĐVT); `luuTonDau`, `xoaTonDau`, `chepTonDau` theo dòng, thêm `xoaTheoMa`. `nhapTonDauExcel.ts` vẫn ghi đè theo mã. Ô chọn Kho hàng, hộp Sao chép, hộp Nhập Excel chỉ liệt kê kho của cửa hàng đang đứng, Tất cả cửa hàng thì thấy mọi kho.
- `ton-dau.ts` `khoaTonDau`: tính phiếu kiểm kê như màn Kiểm kê thấy (`apKhoPhieu`), bỏ phiếu đã xoá, tính cả phiếu lập trong phiên. Trước đó chỉ đọc phiếu mẫu nên xoá phiếu vẫn bị khoá.
- `app.css`: mục cuối "Tồn kho ban đầu: ô gõ số lượng, đơn giá liền bảng (T922)".

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong. `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Chạy thử trên localhost, đăng nhập bản mẫu: Kho bếp Lê Lợi có 4 phiếu kiểm kê tháng 9 (KK2609-0187, 0204, 0224, 0240), xoá đủ 4 thì kho mở khoá, đúng luật.
- Chưa xem bằng mắt thanh lọc mới, ô ĐVT chọn lại, hộp Thêm mới tích hàng đã có, nhiều dòng một mặt hàng.

## Dở dang, việc tiếp theo

- Chưa quy đổi số lượng, đơn giá về ĐVT chính khi chọn ĐVT khác: màn lưu đúng ĐVT đã chọn. Cần chốt dùng bảng quy đổi nào (QUY_DOI_DVT áp theo từng hàng).
- Xuất Excel ra nhiều hàng cùng mã khi mặt hàng có nhiều dòng; nhập lại báo "Mã hàng trùng dòng". Muốn Excel nhận nhiều dòng cùng mã khác ĐVT thì làm việc mới.
- Hộp "Kho đã kiểm kê sau ngày số dư" chỉ nêu phiếu sớm nhất; kho có nhiều phiếu thì xoá lần lượt. Chưa báo đủ danh sách.
- Mốc tồn đầu `NGAY_SO_DU` (01/09/2026) vẫn là hằng số, chưa nối với Ngày bắt đầu làm việc ở Hệ thống, Thông tin đơn vị.
- `HopThietLapTonDau` trong `HopTonDau.tsx` không còn nơi dùng, có thể xoá khi dọn.
- Điện thoại (T882) chưa làm.

## Bẫy, quyết định mới

- Không.
