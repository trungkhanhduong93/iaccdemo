# Biểu đồ tròn tồn quỹ ở trang chủ Free (T291)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/BaBaiToanFree.tsx`:
  - Cột 2 Quản lý thu chi: 5 thẻ quỹ đổi thành component `VongQuy`, vẽ vòng SVG 176px. Mỗi lát một quỹ, giữa vòng ghi tổng tồn.
  - Bên phải vòng là chú thích từng quỹ: chấm màu, dòng trên là tên quỹ, dòng dưới là số tiền và %.
  - Rê chuột vào lát hoặc dòng chú thích: các lát khác mờ đi, giữa vòng đổi thành % và số tiền của quỹ đó. Bấm thì mở hộp biểu đồ thu chi của quỹ (`ModalQuy`) như thẻ cũ.
  - Màu lát lấy từ `MAU_QUY` theo thứ tự quỹ.
- `src/styles/app.css`: mục cuối "Biểu đồ tròn tồn quỹ ở cột Quản lý thu chi trang chủ Free (T291)". Cột hẹp thì chú thích tự xuống dưới vòng.
- PhuongXT chọn kiểu qua bản vẽ thử trong chat, theo thứ tự:
  - 4 kiểu: vòng kèm chú thích, bánh đặc, vòng 2 lớp, nửa vòng → chọn vòng kèm chú thích.
  - 3 cách vẽ lại kiểu đó → chọn A1 (vòng trái, chú thích phải).
  - Sửa A1: tên ở trên, tiền và % ở dưới, vòng to hơn.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py src/modules/home/BaBaiToanFree.tsx`: sạch.
- Trên máy, Hộ kinh doanh Cà phê Góc Nhỏ gói Free:
  - Rộng 1700px: vòng và chú thích nằm cạnh nhau, tên quỹ không bị cắt, trang không tràn ngang.
  - Bấm lát Vietcombank: mở hộp thu chi Vietcombank.
  - Màn hẹp: chú thích xuống dưới vòng.
  - Thử xong đã trả phiên về Phố Mây gói Plus.
- Chưa sửa bản điện thoại (T281 của Trum đang sửa `src/ui/mobile/*`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
