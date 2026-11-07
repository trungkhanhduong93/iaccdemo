# Phiếu chuyển quỹ: Đến quỹ (T779)

Người làm: dinhlanphuongipacc, 08/11/2026.

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: phiếu chuyển quỹ lưu `_tuQuy`, `_denQuy`; mở lại phiếu đọc hai trường này, chưa có thì suy như cũ (rút tiền đi từ ngân hàng về quỹ tiền mặt, còn lại từ quỹ tiền mặt cửa hàng sang tài khoản ngân hàng đầu).
- `src/ui/mobile/MDtThuChiXem.tsx`: màn xem phiếu chuyển quỹ thêm khối Đến quỹ dưới Từ quỹ, cùng luật suy với máy tính. Không sửa `MXemPhieu.tsx` (Trum giữ ở T552).

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt: phiếu mẫu CQ2610-0257 trên điện thoại hiện Từ quỹ Lê Lợi, Đến quỹ Vietcombank. Lập phiếu trên máy tính chọn Đến quỹ Nguyễn Trãi, mở ở cỡ điện thoại hiện đúng Nguyễn Trãi.

## Dở dang

- Form lập phiếu chuyển quỹ trên điện thoại (`MDtThuChiLap.tsx`) chỉ có một ô Quỹ, chưa có Đến quỹ. File này Trum giữ ở T552.
- Chưa push, chờ người dùng bảo.
