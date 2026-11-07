# Phóng to hình minh hoạ cột trái trang đăng nhập (T773)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Trum báo hình ở cột trái nhỏ trên màn 1725x906. Nguyên nhân: `.auth-hinh` cố định tối đa 496x300px theo mẫu vẽ cho cột 576px, cột thật rộng 690px, app còn thu 0.9 (`scale.css`).
- `.auth-hinh` đổi sang rộng 100%, tối đa 680px, khoá tỉ lệ `aspect-ratio: 496 / 300`, cao tối đa `46vh`. Giữ tỉ lệ khung của mẫu nên 4 hình vẫn cân nhau như mẫu đã duyệt.
- `.auth-bong` tối đa 500px cho khớp khung mới.

## Đã kiểm

- Đo ở 1725x906, 1920x1080, 1440x900, 1366x768, 1280x720: chữ nằm dưới hình, hàng nút trong khung, không cuộn ngang. Trên 1725x906 hình slide 2 từ khoảng 350x245 lên 522x370.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: in "Không có lỗi." Ca đăng nhập đợt 8: phần đăng nhập qua, còn lỗi Thu chi có sẵn (T771).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Mẫu canvas vẽ khung cố định theo một cỡ cột. Đưa vào app phải cho khung co giãn theo cột và chiều cao màn, giữ tỉ lệ khung của mẫu, nếu không hình nhỏ trên màn rộng, hoặc hình cao bị to hơn các hình khác.
