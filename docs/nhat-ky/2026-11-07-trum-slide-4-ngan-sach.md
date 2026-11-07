# Thay hình slide 4 trang đăng nhập (T777)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/assets/dang-nhap/slide-4.webp` thay bằng hình nhóm lập ngân sách bên máy tính bỏ túi, nguồn `D:\IACC-CLOUD\Picture\vecteezy_illustration-of-making-budgeting-and-financial-spending_12981886.jpg`. Cỡ 1003x600, nền trong suốt.
- Xử lý theo cách của T772: cắt bỏ khung xanh, tách nền bằng loang từ mép.
- Xanh lá đổi sang xanh `#0560a6`, đỏ và vàng đổi sang cam `#f28020`, da giữ nguyên. Gom 48 màu ở độ phân giải gốc rồi mới thu nhỏ.
- `Login.tsx`: sửa `alt` của slide 4 cho khớp hình mới. Tiêu đề, mô tả slide 4 giữ nguyên.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- `python tools/kiem_van.py src/modules/auth/Login.tsx`: sạch.
- Xem hình đã xử lý trên nền xanh nhạt của cột trái: nền tách sạch, không còn xanh lá.

## Dở dang, việc tiếp theo

- Không.
- Hình mới vẫn có chữ BUDGET trên máy tính. Đồng tiền £ sau khi gom màu thành mảng cam trơn.
- Hình là ngân sách, tiêu đề slide 4 vẫn nói về kho hàng F&B. Trum muốn khớp thì đổi tiêu đề, mô tả slide 4 trong `Login.tsx`.
- Chưa kiểm giấy phép hình Vecteezy trước khi phát hành (như T772).

## Bẫy, quyết định mới

- Không.
