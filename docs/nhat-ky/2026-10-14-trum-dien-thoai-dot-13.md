# Điện thoại đợt 13: chỉnh giao diện đang có, tiện ích bổ sung (T208, T192)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối, kiểm và sửa; Anti B (Antigravity WSL) làm T208; Anti A (Antigravity Windows) làm T192
- Trạng thái cuối phiên: Xong

## Đã làm

- T208:
  - `MobileShell.tsx`: trang chủ không còn thanh trên chung (logo ACCOUNTING, chọn chi nhánh). Đầu trang IVT sát mép trên, có đệm vùng an toàn.
  - `MTrangChu.tsx`: chip "CN: …" chọn chi nhánh, số liệu trang chủ đổi theo.
  - `MTimKiem.tsx`: kính lúp tìm cả báo cáo, chia hai mục Màn hình, Báo cáo. Bỏ hai dòng Phiếu chi, Phiếu thu viết cứng, thay bằng so khớp tên loại phiếu của màn.
  - Bảng sổ chữ 13px, dòng tổng in đậm, dòng xen màu. Đệm đáy mọi màn, hàng chip một hàng cuộn ngang.
  - Cấu hình kế toán: hàng nút Lưu cố định sát đáy, nền trắng kéo tới đáy màn, thanh dưới nổi đè lên trên.
- T192: `MHoaDonDauVao.tsx`, `MDuyetChungTu.tsx`, `MCanhBao.tsx`, `MDoiSoat.tsx` (mới) cho 11.4, 11.5, 11.6, 11.7. Màn 11.16 trên điện thoại chuyển về trang chủ. Màn 11.11 thiết kế mẫu in giữ chỉ máy tính.
- `TienIch.tsx`: tách dữ liệu mẫu hoá đơn đầu vào, chứng từ chờ duyệt, cảnh báo thành hàm, hằng export để bản điện thoại dùng chung; bản máy tính gọi lại đúng hàm đó. `DoiSoat.tsx` thêm `export` cho `CAP`.
- `tools/kiem_tra.py`: `kiem_tra_dot_13_a`, `kiem_tra_dot_13_b`. Bước kiểm đi qua mọi màn chấp nhận 11.16 chuyển về trang chủ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai` (cổng 5181): Không có lỗi.
- Rà `manMobile()` mọi màn ở gói Pro: chỉ còn 11.11 ra `MChiMayTinh`.
- Xem 9 ảnh 390px của đợt 13.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Hết kế hoạch `docs/ke-hoach-mobile-dot-11.md`. Mọi màn có bản điện thoại, trừ 11.11.
- Thẻ "Hao hụt nguyên vật liệu" ở trang chủ và mục "Chứng từ chưa ghi sổ" ở Cần theo dõi vẫn chờ dữ liệu giả.

## Bẫy, quyết định mới

- Hàng nút `position: sticky` trong `main.m-than` dính theo lề trong của khung cuộn. Khung có đệm đáy lớn cho thanh dưới, nên nút treo giữa màn, lộ nội dung bên dưới. Dùng `position: fixed`, nền kéo tới đáy, và chừa đệm cho `main` bằng `:has()`.
- Bước kiểm "nội dung lộ dưới nút" phải dùng `elementFromPoint`, không so toạ độ, vì thẻ nội dung nằm dưới lớp nền trắng vẫn có toạ độ giao nhau.
- Máy hết RAM giữa phiên, Claude Code tắt lệnh nền chạy dev server, nhưng tiến trình node của vite vẫn sống và giữ cổng 5181.
