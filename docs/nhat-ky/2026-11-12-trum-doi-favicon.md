# Đổi favicon web (T806)

- Ngày: 12/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `public/favicon.png`: thay bằng `D:\IACC-CLOUD\gitbook-docs\icon accounting_Final.png`, cắt vuông 300×300, thu về 64×64.
- `index.html`: đường dẫn favicon thêm `?v=2` để trình duyệt bỏ bản cũ đã lưu.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, `dist/favicon.png` có mặt.
- Không chạy `kiem_tra.py` vì không sửa `src/`.

## Dở dang, việc tiếp theo

- Không.
- `src/ui/Logo.tsx` (dấu vuông) vẫn là logo ACC iPOS của T778, chưa đổi theo favicon mới. Muốn đồng bộ thì mở việc mới.
