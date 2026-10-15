# Nút bật tắt ở bảng phân quyền (T276)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css`: thêm mục T276 cuối file. Ô tích ở bảng quyền web (`.matrix td.c`) và danh sách quyền điện thoại (`.m-pq-quyen-dong`) thành nút bật tắt 34×20px: bật màu `--blue`, tắt màu xám. Chỉ đổi CSS, ô vẫn là `input type="checkbox"`.

## Đã kiểm

- `npm run build`: chạy xong, không lỗi.
- Chụp màn Vai trò và phân quyền trên web: nút hiện đúng ở cả 6 cột quyền. Chưa chụp điện thoại, vì dùng chung luật CSS.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
