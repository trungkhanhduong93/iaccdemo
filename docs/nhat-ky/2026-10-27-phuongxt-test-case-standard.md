# Bộ test case gói Standard (T670)

- Ngày: 27/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `docs/TEST-CASE-STANDARD.xlsx`: 161 test case cho mọi màn hình phân hệ gói Standard, chia 14 nhóm (khung app, khởi tạo FABi, trang chủ, danh mục, thu chi, bán hàng, mua hàng, kiểm kê, chi phí phân bổ, kê khai thuế, báo cáo, hệ thống, doanh nghiệp TT58, app điện thoại).
- Sheet Test case: mã ca, phân hệ, màn, đường dẫn, loại kiểm (Hiển thị, Chức năng, Ràng buộc, Tích hợp), mục đích, tiền điều kiện, các bước, kết quả mong đợi, ưu tiên; cột nền vàng để người test điền kết quả, trạng thái chọn từ danh sách.
- Sheet Tổng hợp đếm số ca Đạt, Lỗi, Bỏ qua, Chưa test theo phân hệ bằng công thức.

## Đã kiểm

- Danh sách màn lấy từ `hienMan(sc, 'S', ...)` trong `src/app/registry.ts`, chạy trên dev server, đủ 10 phân hệ hiện ở gói S.
- Mở lại file bằng openpyxl: đủ 161 dòng, công thức sheet Tổng hợp đúng vùng. Chưa tính sẵn giá trị công thức (công cụ LibreOffice không chạy trên Windows); file đặt tự tính khi mở Excel.
- Chưa chạy từng test case trên app.

## Dở dang, việc tiếp theo

- Không. Người test điền cột nền vàng; ca Lỗi thì thêm việc mới vào `docs/TIEN-DO.md`.
- Kết quả mong đợi viết theo `docs/TONG-KET-LOGIC-STANDARD.md`, chưa ghi câu báo lỗi cụ thể của từng ô.

## Bẫy, quyết định mới

- Không.
