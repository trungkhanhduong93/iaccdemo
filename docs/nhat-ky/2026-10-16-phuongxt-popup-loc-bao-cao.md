# Popup lọc trước khi xem báo cáo (T288)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/bao-cao/TrungTam.tsx`: 3 chỗ liên kết mở báo cáo (danh sách nhóm, Đã ghim, Báo cáo gần đây) gửi kèm state `hoiLoc: true`.
- `src/ui/generic/ReportScreen.tsx`:
  - Kho `khoHoiLoc` theo đường dẫn, kèm hook `useHoiLoc`.
  - `ReportToolbar` thấy state `hoiLoc` thì bật popup Điều kiện xem báo cáo (`HopHoiLoc`), có đủ các ô lọc của báo cáo (Khoảng ngày, Tìm, ô lọc khai tay, ô tự sinh theo danh mục, Ẩn dòng không phát sinh).
  - Bấm Xem báo cáo thì áp dụng lọc như nút Lọc và thay state thành `hoiLoc: false`, nên tải lại hay quay lại không hỏi lần nữa. Huỷ hoặc Esc thì quay về trang trước (`nav(-1)`).
  - `ReportPaper` vẫn tính bảng và dựng bộ lọc để popup có lựa chọn. Chỉ là trong lúc chờ, tờ báo cáo được thay bằng dòng "Chọn điều kiện lọc rồi bấm Xem báo cáo".
- `src/styles/app.css`: mục cuối "Popup điều kiện lọc trước khi xem báo cáo (T288)". Ô trong popup dùng lớp `ds-o` để có viền như ô ở thanh lọc.
- Mở thẳng bằng đường dẫn, từ trang chủ, từ tab phân hệ (chuyển hướng) hoặc tải lại trang thì không bật popup, báo cáo hiện ngay như cũ. Nhờ vậy `kiem_tra.py` và các liên kết có sẵn bộ lọc vẫn chạy.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` 2 file đã sửa: sạch.
- Trên máy, gói Plus, rộng 1500px:
  - Bấm Sổ quỹ tiền mặt ở Tất cả báo cáo: hiện popup, chưa có bảng.
  - Chọn Quỹ tiền mặt Lê Lợi rồi bấm Xem báo cáo: bảng hiện, có dòng "Điều kiện lọc: Quỹ tiền: Quỹ tiền mặt Lê Lợi".
  - Bấm Huỷ: về Tất cả báo cáo.
  - Mở thẳng `#/app/bao-cao/2-2-3`: hiện ngay, không có popup.
- Chưa sửa bản điện thoại (T281 của Trum đang sửa `src/ui/mobile/*`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Lấy bản mới về giữa phiên thì `CHANGELOG.md`, `docs/TIEN-DO.md`, `app.css` xung đột vì cả hai bên cùng thêm dòng vào cùng một chỗ. Đã gộp, giữ cả hai bên. Không ghi vào `BAY.md` vì đây là trường hợp quen thuộc khi ba người cùng sửa.
