# Trang đăng nhập theo iFaster (T769)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity làm phần giao diện, OpenCode làm phần kiểm
- Trạng thái cuối phiên: Xong

## Đã làm

- Trum duyệt mẫu https://claude.ai/artifact/2pJtBkB9goLCgmgUwAMnPt, bố cục lấy theo trang đăng nhập iFaster.
- `Login.tsx`: cột trái là slider 4 ảnh chụp màn thật của app, tự chuyển sau 6 giây, có chấm và nút trước, sau. Cột phải có thanh logo, khung nhắc tài khoản FABi, ô nhập chỉ có placeholder, nút mắt, Nhớ đăng nhập, Thử mở từ FABi, Đăng ký sử dụng ngay.
- Quên mật khẩu dùng chung khung với Đăng nhập.
- Ảnh slider nằm ở `src/assets/dang-nhap/slide-1.webp` tới `slide-4.webp`, chụp từ dev ở gói Pro, cỡ 1280x800.
- CSS ở mục T769 cuối `app.css`. Mục cũ chỉ xoá 3 luật `.auth-l h1`, `.auth-l h1 em`, `.auth-l p`.
- `tools/kiem_tra.py`: ca đăng nhập đợt 8 thêm phần kiểm 1440x900 (slider, nút mắt, link phụ, quên mật khẩu) và 390x844 (ẩn cột trái, có logo, không cuộn ngang, ô cao 44px).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: in "Không có lỗi." Cả ba chạy sau lần sửa cuối.
- Chạy riêng ca đăng nhập đợt 8: phần đăng nhập qua hết. Còn 1 lỗi "Nghiệp vụ: không tìm thấy phân hệ Thu chi". Bản `kiem_tra.py` trước khi sửa cũng báo y vậy, đã ghi thành T771.
- `python tools/kiem_van.py src/modules/auth/Login.tsx`: sạch.
- Chụp 1440x900 và 390x844 so với mẫu: khớp bố cục.
- Không giao anti review chéo vì diff chỉ có giao diện. Hàm `vao()` giữ nguyên.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD103 ghi quyết định của Trum về trang này.
- Luật cũ `.auth-r { align-items: center }` ở đầu `app.css` vẫn còn. Mục mới phải đặt lại `align-items: stretch`, không thì thanh logo co lại bằng bề ngang logo.
- Chấm slider theo tên đã chốt: khung `.auth-cham`, chấm là `button`, chấm đang chọn có class `on`. `kiem_tra.py` chọn theo tên này.
