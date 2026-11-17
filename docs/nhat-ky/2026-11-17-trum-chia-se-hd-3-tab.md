# Popup Chia sẻ hoá đơn 3 tab theo mẫu C (T874)

- Ngày: 17/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/HopChiaSeHd.tsx`: làm lại popup theo mẫu C. Đầu popup có biểu tượng hoá đơn, "Gửi hoá đơn <số>", tên người mua. Ba tab Ứng dụng chat, Email, Liên kết. Bỏ số tiền khỏi tin nhắn mặc định.
- Tab Ứng dụng chat: lưới 2x2 Zalo, Messenger, Telegram, WhatsApp, kênh dùng lần trước lên đầu (localStorage `cs_hd_last_channel`). Nút "Ứng dụng khác trên máy" gọi `chiaSeFile`.
- Tab Email: thẻ email người nhận, tiêu đề, nội dung, chọn PDF, XML. "Gửi email" tải file đã chọn rồi mở Gmail soạn thư.
- Tab Liên kết: mã QR tra cứu, tải mã QR (svg), in mã, liên kết tra cứu kèm nút Sao chép, mã tra cứu, trang tra cứu.
- `src/modules/ban-hang/hddt.tsx`: thêm `export` cho `MaQr` để popup dùng lại mã QR của tờ hoá đơn.
- `src/styles/app.css`: thay mục CSS T793 (class `cs-hd-*`), popup 540x660px, thân cuộn bên trong.
- Thêm `public/logo-chia-se/zalo.png`, `messenger.png`, `whatsapp.png`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py src/modules/ban-hang/HopChiaSeHd.tsx`: sạch.
- Playwright ở 1600x800 và 1366x768: popup cao bằng nhau ở 3 tab (lệch 0px), tiêu đề 1 dòng, không lỗi console. Ảnh ở `backup/review-T874/`.

## Dở dang, việc tiếp theo

- Không. Logo Gmail trong spec chưa có chỗ dùng vì lưới chat không còn ô Gmail; cần thì Trum chỉ vị trí.

## Bẫy, quyết định mới

- Không.
