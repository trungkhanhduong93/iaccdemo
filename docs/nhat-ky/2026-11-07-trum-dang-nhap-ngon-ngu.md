# Chữ slide mới, nút chọn ngôn ngữ ở trang đăng nhập (T774)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `Login.tsx`: sửa tiêu đề, mô tả slide 1, 2, 4 đúng chữ Trum đưa. Slide 3 giữ nguyên.
- Thêm `ChonNgonNgu` ở góc phải thanh logo, có ở cả Đăng nhập và Quên mật khẩu. Nút có cờ ngôn ngữ đang chọn và mũi tên. Menu `Dropdown` dùng chung có 4 dòng: Tiếng Việt, English, 한국어, 中文.
- Cờ vẽ bằng SVG inline trong `CoNgonNgu`, không dùng emoji vì Windows hiện thành chữ "VN".
- Chọn ngôn ngữ chỉ đổi cờ trên nút, chưa dịch chữ trên trang.
- `app.css` mục T769: luật `.auth-nn*`. Tiêu đề slide thêm `text-wrap: balance` để không rớt một chữ xuống dòng riêng.
- Coordinator gỡ đoạn `useEffect` gắn `aria-label` vào nút bằng DOM. Nút đã có `title` "Ngôn ngữ" làm tên.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: in "Không có lỗi." Ca đăng nhập đợt 8: phần đăng nhập qua, còn lỗi Thu chi có sẵn (T771).
- Đo logo vẫn canh giữa thanh (lệch 0px). Chụp menu mở ở 1440x900, chọn English thì nút đổi cờ Mỹ. Điện thoại 390px không cuộn ngang.
- `python tools/kiem_van.py src/modules/auth/Login.tsx`: sạch.

## Dở dang, việc tiếp theo

- T776: màn Tính giá vốn sang trang 2 mất đường kẻ dưới dòng tổng, trống khoảng dưới bảng. Trum báo giữa phiên, chưa làm.

## Bẫy, quyết định mới

- QD105 ghi quyết định của Trum về nút ngôn ngữ.
