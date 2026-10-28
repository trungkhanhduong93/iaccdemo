# Kịch bản sale test gói Standard (T671)

- Ngày: 28/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `docs/KICH-BAN-SALE-STANDARD.xlsx` để sale tự chạy thử gói Standard trước khi đi bán. PhuongXT chọn: chỉ gói Standard, viết theo tình huống khách, file Excel riêng.
- Sheet Hướng dẫn: link bản phát hành, cách đăng nhập, dữ liệu giả tháng 7–10/2026, thứ tự làm, cách ghi kết quả, ô người test, ngày test.
- Sheet Kịch bản: 11 kịch bản (KB01–KB11), 68 bước, khoảng 70 phút. Mỗi kịch bản ghi khách là ai, mục tiêu, chuẩn bị; mỗi bước có thao tác, câu nói khi demo, kết quả phải thấy, ô Kết quả (Đạt, Lỗi, Bỏ qua) và Ghi chú nền vàng.
- Kịch bản: khởi tạo từ FABi, lãi lỗ tháng, quỹ tiền, mua hàng và công nợ nhà cung cấp, kiểm kê, chi phí trả trước, kê khai thuế hộ kinh doanh, khoá sổ, điện thoại, báo cáo, gói thuê bao.
- Sheet Hỏi đáp khách: 16 câu khách hay hỏi, câu trả lời, màn để chỉ. Câu chưa chốt ghi ở cột Hỏi Trum.
- Sheet Tổng hợp đếm Đạt, Lỗi, Bỏ qua, Chưa test theo kịch bản bằng công thức.

## Đã kiểm

- Nội dung viết theo `docs/TONG-KET-LOGIC-STANDARD.md`, tên cửa hàng, lý do chi theo dữ liệu mẫu trong code.
- Mở lại file bằng openpyxl: đủ 4 sheet, công thức sheet Tổng hợp đúng vùng. File đặt tự tính khi mở Excel.
- Chưa tự chạy từng bước trên bản online.

## Dở dang, việc tiếp theo

- Không. Sale chạy thử, bước Lỗi thì thêm việc mới vào `docs/TIEN-DO.md`.
- Cột Hỏi Trum còn 4 câu chờ chốt: hết 30 ngày dùng thử thì sao, giá Plus và Pro, gói nào có ghi sổ Nợ/Có, lưu trữ và bảo mật dữ liệu.

## Bẫy, quyết định mới

- Không.
