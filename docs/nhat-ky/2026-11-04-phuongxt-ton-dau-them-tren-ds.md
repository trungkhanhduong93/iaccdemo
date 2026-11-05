# Tồn kho ban đầu sửa ngay trên bảng (T736)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Lần 1 làm dòng nhập đầu bảng trên màn danh mục chung (`themTaiCho`). PhuongXT góp ý muốn đơn giản hơn nên bỏ hẳn cách đó, trả `CatalogScreen.tsx`, `Table.tsx`, `types.ts` về như cũ.
- `src/modules/kho/TonKhoBanDau.tsx` (mới): màn riêng cho 5.1.12, mọi dòng là ô sửa: Kho, Mặt hàng (nguyên vật liệu và hàng có tồn kho, chọn có tìm), ĐVT, Số lượng, Đơn giá, Thành tiền tự tính.
  - Một nút + xanh (kiểu nút Thêm mới) ở tiêu đề cột cuối: thêm dòng trống cuối bảng, cùng kho với dòng cuối, con trỏ vào ô Mặt hàng. PhuongXT bỏ nút + ở từng dòng (05/11/2026).
  - Nút thùng rác ở mỗi dòng xoá dòng. Bỏ cột Trạng thái, bỏ panel thêm, sửa.
  - ĐVT chọn được đơn vị quy đổi của mặt hàng (lấy từ danh mục Quy đổi ĐVT, `quyDoiTuDanhMuc`). Đổi ĐVT thì đơn giá đổi theo, dưới số lượng hiện số ĐVT chính, vd "= 0,012 kg".
  - Thanh trên: tìm theo mã, tên; lọc kho; lọc nhóm hàng hoá; Xoá lọc; số dòng; Nhập, Xuất Excel. Chân bảng: tổng thành tiền.
  - Hàng ô lọc dưới tiêu đề mọi cột (05/11/2026, dùng `OLoc`, `khopLoc` trong `LocCot.tsx`, khai cột ở `COT_LOC`): Kho, ĐVT lọc kiểu tích giá trị; Mã, Tên hàng lọc chữ; Số lượng, Đơn giá, Thành tiền lọc số. Ô lọc cột giữ chữ đang gõ riêng, nên Xoá lọc đổi `key` hàng ô lọc để vẽ lại trống.
  - Nút Thêm hàng loạt trên thanh công cụ (05/11/2026, lúc đầu nằm trong menu Tiện ích, PhuongXT đổi thành nút riêng): mở hộp tích nhiều mặt hàng (dùng lại `ThemHangLoat`), đổ vào kho đang lọc, không lọc thì kho của dòng cuối; hàng đã có ở kho đó tích sẵn, nhãn "Đã có ở <kho>" (thêm prop `nhanDaCo`, mặc định vẫn "Đã có trong phiếu").
  - Cột ô tích luôn hiện đầu bảng, trước cột STT; ô tiêu đề tích hết dòng đang hiện. Tích dòng nào thì hiện nút đỏ "Xoá N dòng" trên thanh công cụ, bấm hỏi lại rồi xoá. Bỏ kiểu bật chế độ Xoá hàng loạt từ menu.
  - Dòng giữ trong phiên (biến `luuPhien`), rời màn quay lại vẫn còn; tải lại trang thì về dữ liệu mẫu.
- `src/modules/kho/data.ts`: bỏ `tonBanDau` (cấu hình danh mục), thêm `tonBanDauMau()` sinh dòng mẫu như cũ.
- `src/modules/kho/index.ts`: 5.1.12 đổi sang `kind: 'custom'`, `comp: TonKhoBanDau`.
- Cuối `src/styles/app.css`: mục T736.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần đầu báo 5.1.12 không có tiêu đề màn, thêm `h1.sr-only`, chạy lại `Không có lỗi.`
- `python tools/kiem_van.py src/modules/kho/TonKhoBanDau.tsx`: sạch.
- 05/11/2026 chạy thử cột ô tích: chưa tích không có nút Xoá; tích 2 dòng hiện "Xoá 2 dòng", xoá còn 16 dòng, nút tự ẩn; tích tất cả hiện "Xoá 16 dòng". Build, `kiem_tra.py --nhanh`, `kiem_van.py` đều qua.
- 05/11/2026 chạy thử Tiện ích (bản trước): Thêm hàng loạt tích Cà phê hạt Robusta, dòng vào cuối bảng kèm đơn giá; Xoá hàng loạt tích 2 dòng, hỏi lại, 18 còn 16 dòng, tổng tính lại. Typecheck, build, `kiem_tra.py --nhanh`, `kiem_van.py` đều qua.
- 05/11/2026 chạy thử bộ lọc: cột Tên hàng gõ "bò" ra 6 dòng; nhóm Tinh bột ra 6 dòng Bánh phở tươi, Gạo tấm; Xoá lọc làm trống ô lọc cột, về 18 dòng. Typecheck, build, `kiem_tra.py --nhanh`, `kiem_van.py` đều qua.
- Chạy thử gói Plus: dòng Thịt bò thăn đổi ĐVT kg sang g, đơn giá 320.000 thành 320, hiện "= 0,012 kg"; bấm + ra dòng trống ngay dưới; bấm xoá thì dòng mất, tổng cộng tính lại.

## Dở dang, việc tiếp theo

- Không. Màn chưa có nút Lưu: sửa xong là giữ luôn trong phiên.

## Bẫy, quyết định mới

- Không.
