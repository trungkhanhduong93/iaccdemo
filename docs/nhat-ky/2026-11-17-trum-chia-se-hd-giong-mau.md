# Popup Chia sẻ hoá đơn giống mẫu C (T875)

- Ngày: 17/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css`, mục T874: popup đặt `zoom: calc(1 / var(--zoom))` để hiện đúng 540x660 px dù app thu nhỏ trang 0.9. Chỉnh cỡ chữ, ô, nút theo mẫu.
- `src/modules/ban-hang/HopChiaSeHd.tsx`: icon cho thanh tab, nút X, Ứng dụng khác, Mở kênh, Tải PDF, Gửi email, Tải mã QR, In mã, Sao chép.
- Tab chat: nhãn "Chọn ứng dụng", "Dùng lần trước" thành chữ xám, dòng file có nhãn PDF đỏ.
- Tab Email: ô đính kèm có nhãn PDF đỏ, XML xanh ngọc, ghi "Bản thể hiện", "File gốc có chữ ký", không ghi tên file. Hết tràn ngang.
- Tab Liên kết: QR 132px bên trái, chữ và nút bên phải. Liên kết tra cứu đổi thành `invoice.ipos.vn/tra-cuu/<mã tra cứu>`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py src/modules/ban-hang/HopChiaSeHd.tsx`: sạch.
- Playwright ở 1600x800 và 1366x768: popup 540x660 px ở cả 3 tab, thân không cuộn ngang, không lỗi console. Ảnh ở `backup/review-T875/`, mẫu gốc ở `backup/mau-T874/`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không ghi thêm. Lý do T874 lệch mẫu: worker không mở được canvas mẫu, nghiệm thu chỉ đo số. T875 đưa mã HTML mẫu vào `backup/mau-T874/` và so ảnh với mẫu.
