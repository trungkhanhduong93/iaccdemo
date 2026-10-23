# Điện thoại, danh sách thẻ chi phí: nút Thêm mới chọn loại thẻ (T643)

- Ngày: 23/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MCcdc.tsx`: nút Ghi tăng đổi tên Thêm mới. Gói Free bấm thì hiện tấm trượt Chọn loại thẻ (dùng `MChon` như Thu chi), có 2 dòng Thẻ chi phí và Thẻ chi phí dư đầu kỳ. Gói khác bấm thì mở thẳng màn Thẻ chi phí dư đầu kỳ. Đang xem tất cả cửa hàng thì hỏi cửa hàng trước như cũ.
- `src/ui/mobile/MThePhanBo.tsx`: `MTheSua` thêm chế độ `moi`, tiêu đề "Thẻ chi phí dư đầu kỳ", cho chọn Loại thẻ khi gói có nhiều loại. Thẻ mới lấy số theo tiền tố thẻ đầu kỳ (`soTheKeTiep(..., 'dau', ...)`), nhật ký thẻ ghi "Nhập thẻ dư đầu kỳ".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 2 file đã sửa: Sạch.
- Chưa bấm thử bằng tay trên trình duyệt.

## Dở dang, việc tiếp theo

- Bản máy tính: người dùng sẽ gửi ảnh chụp yêu cầu sau, làm thành việc mới.
- T642 (Trum) bỏ gói Free: điều kiện `s.goi === 'F'` trong `handleThemMoi` của `MCcdc.tsx` cần đổi theo mã gói mới.

## Bẫy, quyết định mới

- Không.
