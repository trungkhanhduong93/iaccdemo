## Tiết kiệm token

Mỗi lần agent gọi công cụ, cả cuộc trò chuyện được gửi lại từ đầu. Phiên càng dài, càng nhiều ảnh chụp thì mỗi lần gọi càng tốn.

- Mỗi việc một phiên. Push xong thì nhắc người dùng mở phiên mới cho việc sau.
- Kiểm giao diện bằng <lệnh kiểm tự động của repo, không có thì bỏ vế này>. Chỉ mở trình duyệt, chụp màn hình khi người dùng nhờ hoặc khi lỗi chỉ thấy bằng mắt. Mỗi lỗi chụp tối đa 1 tấm.
- Người dùng góp ý giữa chừng thì gom vào danh sách, sửa hết rồi mới chạy các lệnh kiểm một lần.
- Dò code qua nhiều file thì giao subagent, chỉ lấy kết quả `file:dòng` về phiên chính.
- Phiên quá 60 lần gọi công cụ mà việc chưa xong thì ghi nhật ký dở dang, push, đề nghị người dùng mở phiên mới.
