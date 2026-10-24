# Chi tiết phiếu kiểm kê điện thoại: Sao chép, Sửa ở thanh dưới (T660)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MXemPhieu.tsx`: chi tiết phiếu kiểm kê có nút Sao chép, Sửa ở thanh dưới cùng, cạnh nút ba chấm. Menu ba chấm của phiếu kiểm kê chỉ còn Xoá chứng từ. Phiếu đã sinh phiếu điều chỉnh thì không có nút Sửa (T657). Gói S không có Ghi sổ thì Sửa là nút xanh chính; gói Plus, PR thì Sửa là nút viền, Ghi sổ là nút chính.
- `app.css`: mục T660 cuối file, nút Sao chép, Sửa, nút chính chia đều bề ngang.
- Lần 2 theo ảnh PhuongXT: phiếu kiểm kê bỏ hẳn nút ba chấm, Xoá (chữ đỏ) hiện ở thanh dưới cùng Sao chép, Sửa. Phiếu Xuất, Nhập điều chỉnh bỏ nút Sửa (gói S trước còn hiện), không còn thao tác nào nên ẩn thanh dưới.
- `MXemPhieu.tsx`, `MDtThuChiXem.tsx`: mọi màn chi tiết điện thoại bỏ Xuất Excel trong menu ba chấm.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Khổ 360px, gói PR: KK2610-0256 thanh dưới ba chấm / Sao chép / Ghi sổ; KK2610-0251 ba chấm / Sao chép / Bỏ ghi sổ; không chữ nào tràn. Chèn tạm nút Sửa bằng công cụ trình duyệt: bốn nút vừa, ba nút chữ mỗi nút 87px. Bấm Sao chép mở form lập phiếu điền sẵn kho, cửa hàng. Menu ba chấm chỉ còn Xoá chứng từ.
- Lần 2, khổ 360px: gói PR thanh dưới Xoá / Sao chép / Bỏ ghi sổ mỗi nút 105px; chèn tạm Sửa thì 4 nút mỗi nút 77px, không tràn. Gói S: Xoá / Sao chép, bấm Xoá ra hộp xác nhận. NDC2610-0256 không còn thanh dưới. Chưa mở được menu ba chấm phiếu thu chi trên trình duyệt, chỉ kiểm bằng tìm chữ trong code.
- Chưa thấy nút Sửa thật: mọi phiếu kiểm kê mẫu đều đã sinh phiếu điều chỉnh. Chưa xem trên điện thoại thật.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
