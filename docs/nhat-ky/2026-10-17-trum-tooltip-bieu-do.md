# Tooltip 2 biểu đồ cột trang chủ (T306)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Trang mẫu Trum duyệt: https://claude.ai/artifact/1iRkGuzeSp3ozpaP6CrZfF
- `src/ui/Charts.tsx`, `LaiLoChart`: bỏ `<title>` từng tháng; thêm tooltip HTML tự vẽ. Rê chuột, focus bàn phím hoặc chạm vào tháng thì hiện, rời biểu đồ hoặc chạm ra ngoài thì ẩn. Tháng đang chọn có dải nền xanh nhạt.
- Nội dung: tháng đầy đủ ("Tháng 7/2026"); bên phải là biên lãi (Hiệu quả kinh doanh) hoặc "Thu nhiều hơn chi" / "Chi nhiều hơn thu" (Dòng tiền); 2 dòng cột; dòng kết quả đậm xanh lá khi dương, đỏ khi âm, không dấu trừ; Tồn quỹ cuối tháng; `ghiChu` của tháng thành dòng nền vàng.
- Vị trí: bên phải cột nếu đủ chỗ, không thì bên trái cột, cả hai không vừa thì canh giữa khung. Rộng theo chữ, 264 đến 320px, không cắt chữ.
- `app.css` mục T306.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`, `--dien-thoai`: `Không có lỗi.`
- Ảnh 1440x900 gói Free: rê T7/26 Hiệu quả kinh doanh, T1/26 Dòng tiền; tooltip nằm cạnh cột, đủ chữ "Tồn quỹ cuối tháng".
- Chưa chụp điện thoại: trang chủ Free điện thoại không dùng `LaiLoChart`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
