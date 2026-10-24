# Chi tiết phiếu kiểm kê điện thoại: Sao chép, Sửa ở thanh dưới (T660)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MXemPhieu.tsx`: chi tiết phiếu kiểm kê có nút Sao chép, Sửa ở thanh dưới cùng, cạnh nút ba chấm. Menu ba chấm của phiếu kiểm kê chỉ còn Xoá chứng từ. Phiếu đã sinh phiếu điều chỉnh thì không có nút Sửa (T657). Gói S không có Ghi sổ thì Sửa là nút xanh chính; gói Plus, PR thì Sửa là nút viền, Ghi sổ là nút chính.
- `app.css`: mục T660 cuối file, nút Sao chép, Sửa, nút chính chia đều bề ngang.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Khổ 360px, gói PR: KK2610-0256 thanh dưới ba chấm / Sao chép / Ghi sổ; KK2610-0251 ba chấm / Sao chép / Bỏ ghi sổ; không chữ nào tràn. Chèn tạm nút Sửa bằng công cụ trình duyệt: bốn nút vừa, ba nút chữ mỗi nút 87px. Bấm Sao chép mở form lập phiếu điền sẵn kho, cửa hàng. Menu ba chấm chỉ còn Xoá chứng từ.
- Chưa thấy nút Sửa thật: mọi phiếu kiểm kê mẫu đều đã sinh phiếu điều chỉnh. Chưa xem trên điện thoại thật.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
