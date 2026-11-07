# Cột trái trang đăng nhập theo mẫu C2 (T772)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code, Antigravity review
- Trạng thái cuối phiên: Xong

## Đã làm

- Trum duyệt mẫu C2 trên canvas https://claude.ai/artifact/2pJtBkB9goLCgmgUwAMnPt sau khi xem các mẫu A, B, C, C1.
- 4 ảnh `src/assets/dang-nhap/slide-1.webp` tới `slide-4.webp` thay bằng hình minh hoạ đã tách nền, đổi tone xanh `#0560a6` và cam `#f28020`, gom về 48 màu cho nét. Nguồn: 3 hình trong `D:\IACC-CLOUD\Picture` (Vecteezy, Project_172-04) và `anh-bia.webp` của bộ trình chiếu iPOS Inventory.
- `Login.tsx`, hàm `AuthBrand`: nền theo video IVT gồm khối nghiêng góc trên trái, vầng sáng, vòng cam góc dưới phải, lưới ô bo góc chỉ hiện ở rìa. Hình, bóng, chữ canh giữa xếp dọc, nút trước và sau tròn hai bên các chấm.
- CSS sửa ngay trong mục T769 cuối `app.css`, bỏ `.auth-phu`, `.auth-nuts`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- Ca đăng nhập đợt 8 chạy riêng: phần đăng nhập qua hết, còn lỗi Thu chi có sẵn (T771).
- Đo vị trí ở 1440x900, 1366x768, 1280x720 và trang quên mật khẩu: chữ nằm dưới hình, hàng nút trong khung, không cuộn ngang. Chụp so với mẫu: khớp.
- Anti review `pre-push-qa`: XANH.
- `python tools/kiem_van.py src/modules/auth/Login.tsx`: sạch.

## Dở dang, việc tiếp theo

- Hình slide 1, 2, 3 còn chữ BUDGET, ACCOUNTING, ký hiệu £, €. Muốn bỏ phải sửa tay hoặc thay hình.
- Chưa kiểm giấy phép hình Vecteezy trước khi phát hành.

## Bẫy, quyết định mới

- QD104 ghi quyết định của Trum về cột trái.
- Script xử lý hình: tách nền bằng loang từ mép ảnh, đổi tone theo độ bão hoà, gom 48 màu ở độ phân giải gốc rồi mới thu nhỏ. Gom màu sau khi thu nhỏ thì hình vẫn lấm tấm nhiễu JPEG.
