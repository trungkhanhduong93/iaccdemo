# Cột Tham chiếu ở danh sách phiếu (T127)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `VoucherScreen.tsx`: hàm `thamChieuCua` gom phiếu tham chiếu của chứng từ: phiếu thu, chi trả ngay (`_ctTt`), thanh toán sau (`_dsTt`), phiếu điều chỉnh (`_dsDc`), phiếu gốc (`_thamChieu`, `_thamChieuDi`). Cột Tham chiếu ở mọi danh sách phiếu dùng khung chung, đứng trước Nguồn; số phiếu bấm mở được. Dòng có trường `thamChieu` dạng chữ để lọc theo cột.
- `ChungTuForm.tsx`: phiếu thu, chi sinh từ mua, bán ghi thêm `_thamChieuDi` (đường dẫn phiếu gốc). `kho/dieu-chinh.ts` cũng ghi `_thamChieuDi` về phiếu kiểm kê.
- `app.css`: mục cuối "Cột Tham chiếu ở danh sách phiếu (T127)".

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt gói Plus: danh sách Kiểm kê hiện XDC2610-0248, NDC2610-0248; danh sách Điều chỉnh kho hiện KK2610-0248.

## Dở dang, việc tiếp theo

- Phiếu mẫu mua, bán, thu chi chưa có tham chiếu nên cột trống; chỉ phiếu lưu trong phiên mới có. Xuất bán POS dùng danh sách riêng, chưa có cột này.

## Bẫy, quyết định mới

- Không.
