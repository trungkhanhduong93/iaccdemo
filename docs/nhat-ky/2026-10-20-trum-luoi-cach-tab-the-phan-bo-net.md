# Lưới cách hàng tab, thẻ chi phí phân bổ nét chữ như phiếu (T523)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code, Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css`: sửa margin `.ct-than-card > .ct-than` thành 12px đủ 4 phía, tạo khoảng cách giữa đường kẻ dưới hàng tab Chi tiết/Lịch sử với lưới chi tiết ở mọi form phiếu.
- `src/styles/app.css`: thêm padding-top 12px cho `.fsf .pn-trong .pn-duoi > .pn-khoi-than` để lưới chi tiết trong thẻ chi phí phân bổ cách hàng tab 12px.
- `src/styles/app.css`: thêm quy tắc cho `.fsf .pn-hop.pn-trong` bỏ animation trượt (`animation: none`) và đặt `will-change: auto` để trình duyệt không tách lớp riêng, giúp chữ không bị mờ dưới zoom 0.9. Độ nét mép chữ đo được tăng từ 11.64 lên 14.82.
- `src/styles/app.css`: đổi nhãn ô `.fsf .pn-trong .f label` sang màu `--muted`, ô nhập `.fsf .pn-trong .inp` và `.sel.inp` sang cỡ 14px cho đồng bộ với phiếu thu chi.

## Đã kiểm

- Độ nét mép chữ thẻ chi phí phân bổ tăng từ 11.64 lên 14.82 sau khi bỏ `will-change` và animation.
- Khoảng cách giữa hàng tab và lưới chi tiết trên form phiếu đạt 12px.
- Đã commit ở 279c28b.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/BAY.md`: chữ trong form bị nhoè khi có `will-change: transform` kết hợp tỉ lệ zoom lẻ.
