# Bộ test case gói Standard (T670)

- Ngày: 27/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `docs/TEST-CASE-STANDARD.xlsx` gồm 273 test case cho mọi màn hình phân hệ gói Standard. Sheet Web có 152 ca, sheet App (điện thoại) có 121 ca.
- 28/10/2026: theo ý PhuongXT tách web và app thành 2 sheet. Phần app viết đủ từng màn trong `src/ui/mobile/`: tab đáy, trang chủ, tìm kiếm, từng nghiệp vụ, xem phiếu, tab Báo cáo, tab Khác.
- Sheet Web, App: mã ca (W-…, A-…), phân hệ, màn, đường dẫn, loại kiểm (Hiển thị, Chức năng, Ràng buộc, Tích hợp), mục đích, tiền điều kiện, các bước, kết quả mong đợi, ưu tiên; cột nền vàng để người test điền kết quả, trạng thái chọn từ danh sách.
- Sheet Tổng hợp có 2 bảng Web, App và dòng Cả hai, đếm số ca Đạt, Lỗi, Bỏ qua, Chưa test theo phân hệ bằng công thức.

## Đã kiểm

- Danh sách màn lấy từ `hienMan(sc, 'S', ...)` trong `src/app/registry.ts`, chạy trên dev server, đủ 10 phân hệ hiện ở gói S.
- Màn app lấy từ code `src/ui/mobile/` (đọc code, chưa mở app chạy thật để đối chiếu). Danh sách báo cáo trên app suy từ luật lọc, nên soát lại khi chạy ca A-BC-001.
- Mở lại file bằng openpyxl: đủ 152 dòng Web, 121 dòng App, công thức sheet Tổng hợp đúng vùng. Chưa tính sẵn giá trị công thức (công cụ LibreOffice không chạy trên Windows); file đặt tự tính khi mở Excel.
- Chưa chạy từng test case trên app.

## Dở dang, việc tiếp theo

- Không. Người test điền cột nền vàng; ca Lỗi thì thêm việc mới vào `docs/TIEN-DO.md`.
- Kết quả mong đợi viết theo `docs/TONG-KET-LOGIC-STANDARD.md`, chưa ghi câu báo lỗi cụ thể của từng ô.

## Bẫy, quyết định mới

- Không.
