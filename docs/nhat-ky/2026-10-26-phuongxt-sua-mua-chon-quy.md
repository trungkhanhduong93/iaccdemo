# Sửa phiếu mua điện thoại: tích Đã thanh toán chọn quỹ như tạo mới (T662)

- Ngày: 26/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLapPhieu.tsx`: thêm state `traKhiSua`. Màn sửa phiếu mua chưa trả, tích Đã thanh toán gọi `doiHinhThucTtMua` như tạo mới: hiện ô Quỹ thanh toán, không mở sheet `MThanhToanNgay`.
- Biến `traNgay` (sửa: `traKhiSua`, tạo mới: `hinhThucTt !== 'congno'`) quyết định hiện ô quỹ và bắt chọn quỹ khi Lưu. `canTra` (sửa: số còn nợ) dùng ở đầu bảng Chọn quỹ và cảnh báo quỹ không đủ.
- Lưu ở màn sửa khi đã tích: lưu thay đổi rồi gọi `lapPhieuChiTraNcc` lập phiếu chi số còn nợ, ngày bằng ngày chứng từ, về màn xem phiếu mua.
- Sheet `MThanhToanNgay` vẫn giữ cho tiện ích Thanh toán ở màn chi tiết (`?thanhtoan=1`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trình duyệt cỡ điện thoại, gói Plus Phố Mây: sửa MH2610-0022 (chưa thanh toán), tích Đã thanh toán hiện ô quỹ "Quỹ tiền mặt Nguyễn Trãi", không bật sheet; Lưu xong phiếu thành Đã thanh toán, tham chiếu phiếu chi mới.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
