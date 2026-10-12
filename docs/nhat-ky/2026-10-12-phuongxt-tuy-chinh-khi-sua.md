# Tuỳ chỉnh giao diện khi thêm, sửa chứng từ (T160)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: chân form khi thêm mới, sửa (`dangSua`) có nút Tuỳ chỉnh giao diện trước nút Lưu, mở cùng hộp `HopCotPhieu` như lúc xem chi tiết (ô đầu phiếu, cột bảng chi tiết, tổng chân phiếu). Cấu hình nhớ chung giữa xem và sửa. Áp cho mọi chứng từ dùng form chung.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py ChungTuForm.tsx`: 0 ĐỎ, 1 VÀNG có từ trước (câu "Bạn có chắc chắn" ở hộp hỏi đóng phiếu), không do T160.
- Bấm thử Phố Mây gói Plus: thêm phiếu thu tiền mặt, chân form có Huỷ, Tuỳ chỉnh giao diện, Lưu, Lưu và thêm; bấm mở hộp Tuỳ chỉnh giao diện phiếu. Sửa phiếu xuất bán hàng cũng có nút. Thử xong trả phiên như cũ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
