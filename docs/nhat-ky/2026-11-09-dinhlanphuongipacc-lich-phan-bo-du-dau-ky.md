# Lịch phân bổ thẻ dư đầu kỳ theo ngày bắt đầu làm việc (T782)

- Ngày: 09/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `app/session.tsx`: thêm `ngayLamViecHienTai()`, `SessionProvider` ghi lại Ngày bắt đầu làm việc (ô ở Hệ thống, Thông tin đơn vị, khoá `ngayDauNam`) mỗi lần vẽ, cho hàm ngoài React dùng.
- `ccdc/the-phan-bo.tsx`: `ngayBd` của thẻ dư đầu kỳ luôn lấy Ngày bắt đầu làm việc, nên kỳ đầu của lịch là tháng của ngày đó. Số kỳ = Số tháng PB − Số tháng đã PB, mỗi kỳ = (Số tiền − Giá trị đã PB khai trên thẻ) ÷ số kỳ còn, kỳ cuối nhận phần lẻ (giữ như cũ).
- Cột Ngày bắt đầu PB của thẻ dư đầu kỳ chỉ xem, không gõ được nữa. Thẻ ghi tăng trong kỳ giữ nguyên.
- Điện thoại (`MThePhanBo.tsx`) dùng chung `lichDong` nên đổi theo, không sửa file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trình duyệt: đặt Ngày bắt đầu làm việc 01/10/2026, thẻ TPBDK2512-0001 (120 tr, đã PB 60 tr, 24 tháng, đã PB 12 tháng) ra 12 kỳ từ 31/10/2026, mỗi kỳ 5.000.000.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
