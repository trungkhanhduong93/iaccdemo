# Đổi favicon và dấu logo vuông (T778)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `public/favicon.png` (64x64) và `src/assets/acc-dau.webp` (128x128) thay bằng logo ACC iPOS: tờ chứng từ, đồng tiền, máy tính, sao vàng, dải xanh chữ iPOS.vn, bo tròn 4 góc.
- Nguồn: `D:\IACC-CLOUD\Picture\Logo ACC iPOS 2.png` (1536x1536), Claude vẽ trong phiên này.
- `src/ui/Logo.tsx`: sửa chú thích hàm `DauLogo` ghi nguồn mới.
- Logo chữ ngang "Accounting Powered by iPOS.vn" ở trang đăng nhập, chọn đơn vị, khởi tạo giữ nguyên theo ý Trum.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- `python tools/kiem_van.py src/ui/Logo.tsx`: sạch.
- Xem logo ở cỡ 32px trên nền navy của sidebar: nhận ra hình, chữ iPOS.vn rất nhỏ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Dừng `npm run dev` chạy nền bằng công cụ dừng tác vụ của agent chỉ tắt vỏ shell, tiến trình vite vẫn giữ cổng 5180. Lần chạy sau báo lỗi cổng nhưng `kiem_tra.py` vẫn chạy trên vite cũ. Tắt hẳn bằng PID đang giữ cổng.
