# Tồn kho ban đầu theo mẫu C trên máy tính (T879, T880, T881)

- Ngày: 18/11/2026
- Người: Trum, agent: Claude Code (anti giao đầu phiên dừng vì Gemini quá tải, Claude tự làm)
- Trạng thái cuối phiên: Xong (T882 bản điện thoại dời sang phiên sau)

## Đã làm

- T879: thêm `src/modules/kho/ton-dau.ts`. File giữ dữ liệu tồn đầu theo từng kho trong phiên. Danh sách lấy mọi nguyên vật liệu và hàng hoá có theo dõi tồn. Có 3 chip, ĐVT gốc và ĐVT quy đổi, giá nhập gần nhất, luật khoá. Thêm 2 dòng mẫu ở Kho tổng (chỉ có số lượng, chỉ có đơn giá) để chip Cần xem lại có số.
- T880: viết lại `src/modules/kho/TonKhoBanDau.tsx` theo mẫu C, thay màn sửa tại chỗ T736.
  - Hàng lọc gồm: Tìm, Kho hàng (bắt chọn 1 kho), Nhóm hàng hoá, Hàng hoá, nút Lọc.
  - Nút Thêm mới tách đôi: phần chữ mở Thiết lập hàng loạt với các mặt hàng Không có tồn đầu, mũi tên mở lệnh theo chip.
  - Chip Có tồn đầu, Không có tồn đầu, Cần xem lại. Có nút Excel, nút tuỳ chỉnh cột.
  - Bảng chỉ xem. ĐVT và nhóm hiện dạng "MÃ - Tên". Có dòng Tổng cộng.
- T881: thêm `src/modules/kho/HopTonDau.tsx`.
  - Modal Thiết lập hàng loạt: hàng lọc dưới tiêu đề, ô chọn ĐVT quy đổi, ô nhập số lượng và đơn giá.
  - Popup Thay thế hàng loạt cho cột Số lượng và cột Đơn giá. Đơn giá chọn được Giá nhập gần nhất hoặc Tự nhập giá.
  - Chép sang kho khác: ghi đè, kho bị khoá thì mờ đi. Xoá hàng loạt. Thông báo khoá.
- CSS: 2 mục T880, T881 cuối `src/styles/app.css`, tiền tố `td-`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho TonKhoBanDau.tsx, HopTonDau.tsx: Sạch.
- Playwright 1440x900, gói Plus, ảnh trong `backup/review-T879/` (đặt cạnh mẫu `backup/mau-T879/`): menu chip Có tồn đầu, Cần xem lại, Thiết lập, Thay thế giá, Chép, Xoá, thông báo khoá. Bấm thử Lưu, Lấy giá, Chép, Xoá đổi đúng số đếm chip. Không lỗi console.

## Dở dang, việc tiếp theo

- T882 bản điện thoại: chưa làm. Trum dời sang phiên sau. Mẫu ở `backup/mau-T879/Dt*.dc.html`, spec ở mục Việc T882 trong `backup/spec-T879-T882.md`. Hiện màn này trên điện thoại vẫn hiện "Chỉ dùng trên máy tính" (`src/ui/mobile/manMobile.ts`).

## Bẫy, quyết định mới

- Luật khoá tồn đầu (Trum chốt 18/11/2026): kho bị khoá khi cửa hàng chứa kho đã khoá sổ tới tháng của ngày số dư, hoặc kho có phiếu kiểm kê ghi sổ sau ngày số dư. Bị khoá thì chỉ báo khi bấm lệnh.
- Ngày số dư tồn kho đặt 01/09/2026 (`NGAY_SO_DU` trong ton-dau.ts), theo mẫu đã duyệt. Với dữ liệu mẫu, 5 kho cửa hàng đều đã có phiếu kiểm kê sau ngày này nên bị khoá, chỉ Kho tổng sửa được. Chép sang kho khác vì vậy chưa thử được trên dữ liệu mẫu.
- Giá nhập gần nhất tạm lấy giá danh mục nguyên vật liệu, hàng hoá lấy 65% giá bán (có ghi chú `shortcut:`).
- Nhóm "Tinh bột", "Pha chế", "Bia, rượu" chưa có trong danh mục nhóm hàng hoá nên chỉ hiện tên, không có mã.
