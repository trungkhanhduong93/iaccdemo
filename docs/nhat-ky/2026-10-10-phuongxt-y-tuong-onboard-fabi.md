# Ý tưởng màn onboard từ FABi (T138)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (mới đề xuất, chưa sửa code)

## Đã làm

- Đọc màn khởi tạo có sẵn `src/modules/onboarding/KhoiTao.tsx` (`/khoi-tao`, 4 bước: chế độ kế toán, thông tin đơn vị, kết nối FABi và Inventory, số dư đầu kỳ). Màn này theo kiểu tự đăng ký.
- Đề xuất luồng mới cho người bấm từ FABi sang: hỏi ít, xác nhận nhiều, vì FABi đã có tài khoản, chi nhánh, món, kênh bán.
  0. Màn chào: đăng nhập bằng tài khoản FABi; "Chào <tên>, bắt đầu sổ sách cho <thương hiệu> trong 3 bước"; dòng "Đã nhận từ FABi: 3 chi nhánh, 86 món, 4 kênh bán".
  1. Thông tin đơn vị: mã số thuế lấy từ FABi, Tra cứu điền tên, địa chỉ. Câu hỏi then chốt: Hộ kinh doanh hay Doanh nghiệp, từ đó chọn chế độ (TT152 hoặc TT133, TT58) và gợi ý gói. Ngày bắt đầu dùng sổ, mặc định đầu tháng.
  2. Chi nhánh và kho: danh sách chi nhánh FABi có ô tích chọn chi nhánh lên sổ, gán kho (Free mặc định một kho mỗi chi nhánh).
  3. Cách đồng bộ bán hàng: Chi tiết theo hoá đơn hay Tổng hợp theo kênh (T113), giờ chốt cuối ngày, xem trước số chứng từ Xuất bán POS sẽ sinh.
  4. Số dư đầu kỳ, cho bỏ qua: tiền mặt và tiền gửi, nhập Excel, để sau. Gói Free gọn một màn.
  5. Hoàn tất: thanh tiến trình lấy doanh thu 30 ngày từ FABi rồi vào Trang chủ có thẻ Việc cần làm (khai báo tài khoản ngân hàng, đối chiếu đơn POS lỗi T118, mời kế toán).
- Nên có: lưu dở để quay lại đúng bước; gợi ý gói theo dữ liệu FABi; khung bên phải "Bạn sẽ có gì" đổi theo lựa chọn.

## Đã kiểm

- Chưa sửa code, không có gì để kiểm.

## Dở dang, việc tiếp theo

- Chờ PhuongXT chốt 3 điểm rồi mới làm:
  1. Tạo màn mới `/khoi-tao-fabi`, giữ màn `/khoi-tao` cho người tự đăng ký (agent đề xuất), hay làm lại màn cũ.
  2. Onboard có cho chọn gói, hay mặc định Free rồi gợi ý nâng cấp sau.
  3. Dùng câu hỏi Hộ kinh doanh, Doanh nghiệp để chọn chế độ kế toán; cần hỏi thêm Trum vì là nghiệp vụ.
- Chốt xong thì đổi T138 sang Đang làm, đọc lại `KhoiTao.tsx`, `app/che-do.ts`, `app/plan.ts`.

## Bẫy, quyết định mới

- Không.
