# Câu cảnh báo nâng cấp gói khi kê khai thuế, gọn màn mở từ FABi (T138)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn việc khác, phần này xong)

## Đã làm

- `OnboardFabi.tsx`, bước Thông tin kê khai thuế: ô Hộ kinh doanh bỏ "Chế độ kế toán TT152". Cảnh báo ngoài gói đổi thành "Tính năng kê khai thuế chưa hỗ trợ cho cách tính thuế này tại gói Accounting Standard. Vui lòng nâng cấp lên Accounting Plus để trải nghiệm." Doanh nghiệp gợi ý "Accounting Plus hoặc Accounting Pro".
- `HeThong.tsx`, `MHeThong.tsx`, Thông tin đơn vị: cảnh báo ngoài gói Standard đổi theo câu trên, cả web và điện thoại.
- `HeThong.tsx`: bỏ cảnh báo "Lưu sẽ đổi chế độ kế toán... Đổi loại hình không tự đổi gói" khi đổi loại hình.
- `KhoiTaoFabi.tsx`: web bỏ "chỉ với 1 chạm" ở câu giới thiệu; điện thoại bỏ hàng cam kết Miễn phí, Dữ liệu an toàn.

## Đã kiểm

- typecheck, build, `kiem_tra.py --nhanh` không lỗi; `kiem_van.py` 0 ĐỎ (1 VÀNG câu nâng cấp Plus, Pro ở `KhoiTaoFabi.tsx` có sẵn từ trước).
- Chưa xem bằng mắt trên trình duyệt.

## Dở dang, việc tiếp theo

- Không với phần này. CSS `.ktf-b1-cam` giờ không dùng ở màn mở từ FABi trên điện thoại, chưa xoá.

## Bẫy, quyết định mới

- Không.
