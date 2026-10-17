# Bảng kết quả kinh doanh, nhắc khoá sổ, hộp lãi lỗ theo cửa hàng trên điện thoại (T341)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MTrangChuFree.tsx`: khối Kết quả kinh doanh bỏ thẻ màu, thành bảng gọn như web (Doanh thu, Giá vốn nguyên vật liệu, Chi phí hoạt động, Chi phí phân bổ, khấu hao, Lợi nhuận; chú thích dòng dưới tên). Dải nhắc tháng chưa khoá sổ lên ngay dưới thanh Thao tác nhanh.
- `src/styles/app.css`: mục T341 cho bảng mới; bỏ lớp `tll-*` của thẻ màu cũ (không còn chỗ dùng). Mục T341 thứ hai: trên điện thoại (≤767px) hộp Lãi lỗ theo cửa hàng ẩn nút X vì chân hộp đã có nút Đóng; bảng chi tiết không xuống dòng, vuốt ngang được, cột Cửa hàng ghim bên trái.
- Gốc lỗi bảng không vuốt được: `.bbt-modal-cn-bang-hop` có `overflow-x: auto` nhưng dòng `overflow: hidden` ngay sau đè mất. Chỉ sửa cho điện thoại, bản web không đổi.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Worker đối chiếu 5 dòng tháng 10 khớp web (Doanh thu 616.423.000 đ, Lợi nhuận 51.957.923 đ).
- Playwright 390px: hộp Theo cửa hàng không còn nút X; bảng rộng 581px trong khung 348px, `overflow-x: auto`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
