# Bộ kiểm --nhanh xanh lại trên main (T957, gộp T933)

- Ngày: 28/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity sửa
- Trạng thái cuối phiên: Xong

## Đã làm

- `tools/kiem_tra.py` mục T870/T871: mở Thẻ kho 5.2.1 với `?ma=NVL001&kho=Kho tổng&ky=9`. Từ T923 màn phải có Kho và Mặt hàng mới dựng bảng, nên bản cũ chờ bảng quá 8 giây rồi làm dừng cả bộ kiểm.
- `tools/kiem_tra.py` mục T233: bỏ bấm nút `.btn-tk-toggle`. T961 đã thay nút này bằng ô tích `input.bat-tat` "Ẩn cột tài khoản", cột tài khoản hiện sẵn. Ô TK Nợ, TK Có đọc theo vị trí cột vì T948 đổi sang ô chọn danh mục. Lý do lấy ở đầu phiếu khi bảng không còn cột Lý do.
- `tools/kiem_tra.py` hàm `main`: bộ chọn tiêu đề màn nhận thêm `.dnh .bbt-tt-nhanh` (Dashboard nhà hàng T956) và `.dm-bang .ds-toolbar-figma` (Hệ thống tài khoản). Hai màn này không dùng `h1`, không có lỗi console.

## Đã kiểm

- `python -u tools/kiem_tra.py --nhanh`: exit 0, in `Không có lỗi.` (Claude chạy lại sau khi anti báo xong).
- Không sửa `src/`, nên không chạy typecheck, build.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
