# Thêm đơn vị kế toán chia 2 bước (T138)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn việc khác)

## Đã làm

- `src/modules/onboarding/OnboardFabi.tsx`: popup Kết nối dữ liệu FABi khi Thêm đơn vị kế toán (`kieu === 'them'`, biến `haiBuoc`) chia 2 bước, có thanh bước `BUOC_THEM`. Bước 1: loại hình Hộ kinh doanh, Doanh nghiệp; MST (doanh nghiệp bắt buộc), tên (bắt buộc), địa chỉ, nút Tra cứu; danh sách cửa hàng. Bước 2: ngày bắt đầu làm việc, tiền về quỹ, khung dữ liệu sẽ đồng bộ, Quay lại, Đồng bộ dữ liệu ngay.
- Bấm đồng bộ: lưu tên, viết tắt, MST, địa chỉ vào `dvMoi`; loại hình, tên, MST, địa chỉ vào `ttDv`; chế độ theo loại hình (`cheDoMoi`).
- Popup Thông tin kê khai thuế lấy sẵn loại hình, MST, địa chỉ từ `ttDv` của đơn vị.
- Luồng mở từ FABi giữ 1 bước. Điện thoại dùng chung component nên cũng 2 bước, không sửa CSS.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/onboarding/OnboardFabi.tsx`: Sạch.
- Bấm thử máy tính: doanh nghiệp, Tra cứu, Tiếp tục, Đồng bộ; phiên lưu đúng `dvMoi`, `ttDv`, chế độ TT58. Điện thoại 375px: bước 1, bước 2 không tràn ngang.
- Chưa bấm thử luồng Hộ kinh doanh.

## Dở dang, việc tiếp theo

- Không với phần này. Các mục dở của T138 ở nhật ký trước vẫn còn.

## Bẫy, quyết định mới

- Không.
