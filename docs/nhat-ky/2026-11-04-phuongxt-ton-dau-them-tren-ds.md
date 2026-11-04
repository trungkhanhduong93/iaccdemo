# Tồn kho ban đầu thêm mới ngay trên danh sách (T736)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/TonDauNhap.tsx` (mới): hook `useONhapTonDau` trả ô nhập cho từng cột: Kho, Mặt hàng (nguyên vật liệu và hàng có tồn kho, chọn có tìm), Số lượng, Đơn giá (điền sẵn giá của mặt hàng), Thành tiền tự tính, nút Lưu, Huỷ. Enter lưu, giữ kho, con trỏ về ô Mặt hàng để nhập tiếp. Esc đóng dòng nhập. Thiếu mặt hàng hoặc số lượng thì viền đỏ, không lưu.
- `src/modules/types.ts`: `CatalogCfg.themTaiCho` cho màn danh mục thêm bằng dòng nhập đầu bảng.
- `src/ui/Table.tsx`: prop `dongDau` vẽ một dòng ô nhập đầu `tbody` theo khoá cột.
- `src/ui/generic/CatalogScreen.tsx`: màn có `themTaiCho` thì nút Thêm mới, `?moi=` từ sơ đồ Quy trình mở dòng nhập thay panel; dòng vừa thêm nằm ngay dưới dòng nhập, mới nhất trên cùng. Bấm dòng có sẵn vẫn mở panel sửa như cũ.
- `src/modules/kho/data.ts`: `tonBanDau` bật `themTaiCho`.
- Cuối `src/styles/app.css`: mục T736 cho dòng nhập (nền `--tint`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py src/modules/kho/TonDauNhap.tsx`: sạch.
- Chạy thử gói Plus màn Kho, Tồn kho ban đầu: Thêm mới hiện dòng nhập, chọn Tôm sú, gõ 12, Enter thì dòng mới lên đầu, đếm 18 thành 19.

## Dở dang, việc tiếp theo

- Không. Sửa dòng có sẵn vẫn mở panel; muốn sửa ngay trên bảng thì làm việc mới.

## Bẫy, quyết định mới

- Không.
