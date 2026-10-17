# Chi tiết cửa hàng cho sửa cách tính NVL, đồng bộ thu chi (T321)

- Ngày: 17/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/DanhMucCuaHang.tsx`: hộp Chi tiết cửa hàng (bấm tên cửa hàng) đổi hai dòng chữ thành ô sửa. Cách tính chi phí NVL (gói Free) là ô chọn; đổi thì vẫn qua hộp xác nhận "Đổi cách tính chi phí NVL" như cột ở bảng, hộp xác nhận hiện đè lên hộp chi tiết. Đồng bộ thu chi FABi là công tắc như cột ở bảng, đổi xong báo toast. Hai chỗ dùng chung hàm lưu nên bảng và hộp luôn khớp.

## Đã kiểm

- Xem trên máy gói Free, Danh mục cửa hàng, Phố Mây Lê Lợi: công tắc tắt, bật được, cột ở bảng đổi theo; chọn Giá thành nhập tay thì hiện hộp xác nhận, Huỷ chỉ đóng hộp xác nhận, Đồng ý thì ô ở hộp và ở bảng cùng đổi. Đã đổi lại như cũ, trả phiên về gói PL.
- Thử bằng chuỗi sự kiện chuột trong trang. Bấm theo toạ độ ảnh chụp ở khung xem của app bị lệch (khung tự đổi cỡ), không dùng được để thử.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.` `python tools/kiem_van.py` cho `DanhMucCuaHang.tsx`: sạch.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu thư mục Present/tools ngoài repo), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
