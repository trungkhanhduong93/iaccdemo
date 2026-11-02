# Thiết kế lịch sử phiếu bản E, ghi việc T715

- Ngày: 02/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong phần thiết kế, T715 chưa code

## Đã làm

- Vẽ trên canvas của Trum (https://claude.ai/artifact/QaPYiYTEUF9CUvWEAvTsiB): 3 phương án ruột tab Lịch sử (A, B, C), 3 kiểu cột trái cho B (B1, B2, B3), bản D (bỏ cột trái, lọc trong nút phễu), bản E web và app.
- Trum chốt bản E: bỏ cột trái và bộ lọc, mỗi thao tác ghi Thao tác, Người làm, Thời điểm, Nội dung đầy đủ; sửa, xoá, huỷ có bảng Trước/Sau nổi bật và khối Lý do.
- Chép hai khung bản E vào `docs/thiet-ke/T715-lich-su-web.dc.html`, `docs/thiet-ke/T715-lich-su-app.dc.html`.
- Viết spec `docs/ke-hoach-lich-su-ban-e.md`, thêm dòng T715 vào `docs/TIEN-DO.md`.

## Đã kiểm

- `python tools/kiem_van.py docs/ke-hoach-lich-su-ban-e.md`: Sạch.

## Dở dang, việc tiếp theo

- T715: làm theo `docs/ke-hoach-lich-su-ban-e.md`. Đổi trạng thái T715 sang Đang làm trước khi sửa.
- Việc riêng chưa ghi mã: hộp bắt nhập lý do khi sửa, xoá, huỷ phiếu. Chờ Trum chốt có bắt buộc hay không.

## Bẫy, quyết định mới

- Không.
