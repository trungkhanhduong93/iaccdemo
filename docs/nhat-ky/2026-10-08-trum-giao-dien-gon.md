# Giao diện gọn cho màn nhỏ, công cụ danh sách chứng từ (T42)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) sửa code qua 2 lượt song song và 1 lượt sửa lỗi
- Trạng thái cuối phiên: Xong

## Đã làm

- Lượt A (toàn app):
  - `src/styles/scale.css` thu nhỏ giao diện bằng `zoom` trên `html`: dưới 1700px còn 90%, dưới 1450px còn 85%.
  - `src/ui/zoom.ts` có hàm `heSoZoom()`. `Dropdown.tsx` và `QuyTrinhScreen.tsx` dùng hàm này để quy đổi toạ độ.
  - `Page.tsx` bỏ dòng đường dẫn.
  - `CatalogScreen.tsx`, `SoDuBanDau.tsx`, `HeThong.tsx`: nút thêm chính ghi "Thêm mới".
- Lượt B (danh sách chứng từ và 3.1.1):
  - Số đếm trong chip làm lại.
  - Nút "Thêm mới" kèm menu xổ gom thêm theo loại, tải dữ liệu, Excel, thao tác hàng loạt.
  - Dòng tổng dính đáy, chân phân trang mới (`PhanTrang.tsx`).
  - Khung lọc từng cột theo kiểu chữ, số, ngày, phân loại (`LocCot.tsx`).
- Lượt sửa lỗi:
  - Khung app bù chiều cao khi có zoom, để không còn dải trống ở đáy.
  - Danh sách ít dòng thì dòng giữ cao tự nhiên, khoảng trống nằm trên dòng tổng.
  - Cột số tự tính độ rộng tối thiểu, không còn bị cắt.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Đo Mua hàng 4.1.1 gói A ở 1600, 1440, 1920px:
  - Khung app cao bằng cửa sổ.
  - Các dòng cao bằng nhau. Dòng tổng nằm dưới dòng cuối.
  - Không ô số nào bị cắt. Không có lỗi trang.
- Mở menu Thêm mới ở 2.1.1: đủ các nhóm Thêm theo loại, Dữ liệu, Hàng loạt.

## Dở dang, việc tiếp theo

- Cột Nguồn ở 4.1.1 còn hẹp, chữ bị cắt ("Thủ công"). Ô lọc ngày dưới tiêu đề hơi chật ở 1600px.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD26.
- Thu nhỏ bằng `zoom` làm lệch mọi chỗ JS đo vị trí, và làm khung cao `100vh` hụt đáy. Code mới đo vị trí thì dùng `heSoZoom()`.
