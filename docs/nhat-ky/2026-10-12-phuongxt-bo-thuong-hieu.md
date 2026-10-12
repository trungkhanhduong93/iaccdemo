# Bỏ danh mục Thương hiệu (T166)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/index.ts`: bỏ màn danh mục Thương hiệu (`thuong-hieu`) khỏi phân hệ Danh mục, mọi gói, mọi đơn vị.
- `src/modules/danh-muc/quy-trinh.ts`: bỏ ô Thương hiệu ở lần Nền tảng của Khởi tạo danh mục.
- `src/modules/danh-muc/truong-dm.ts`: bỏ form thêm, sửa thương hiệu.
- Giữ ô, cột Thương hiệu ở Hàng hoá, Kho, Bảng giá. Danh sách chọn vẫn lấy từ `DS_THUONG_HIEU` trong `danh-muc/data.ts`.
- `docs/QUYET-DINH.md`: QD49 ghi danh mục Thương hiệu đã bỏ. PhuongXT chốt bỏ dù trước đó Trum chốt có danh mục này.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Bấm thử Phố Mây gói Plus: Khởi tạo danh mục không còn ô Thương hiệu; mở đường dẫn cũ `danh-muc/thuong-hieu` thì về màn Khởi tạo danh mục.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD49 đổi một phần, xem ở trên.
