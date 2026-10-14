# Thanh bên: ẩn Quy trình Danh mục, vào thẳng danh sách phiếu, bỏ menu phụ, Kho gói Free thành Kiểm kê (T225 đến T228)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T225: phân hệ Danh mục bỏ `quyTrinh` (`src/modules/danh-muc/index.ts`), tab Quy trình ẩn; menu phụ bỏ mục Sơ đồ danh mục (`SidebarFlyout.tsx`). File `danh-muc/quy-trinh.ts` giữ để mở lại.
- T226: `manDau` (`src/app/registry.ts`): bấm phân hệ vào danh sách chứng từ đầu tiên gói đang thấy (`nhom === 'Chứng từ'`), không có thì màn đầu tiên không phải Quy trình. Phân hệ chỉ có màn khoá (Tài sản cố định, Giá thành ở gói Plus; Kê khai thuế ở gói Free) vẫn vào Quy trình.
- T226: `tools/kiem_tra.py` bước duyệt thanh bên: trang mở ra không có sơ đồ thì vào tab Quy trình để gom ô sơ đồ, giữ độ phủ (48 ô quy trình gói Plus như trước).
- T227: `Shell.tsx` thêm `coMenuPhu = false`, tắt menu phụ (`SidebarFlyout`) khi rê chuột vào phân hệ.
- T228: `tenPhanHe`, `TEN_THEO_GOI` (`registry.ts`): gói Free gọi phân hệ Kho là Kiểm kê ở thanh bên (`Shell.tsx`), tìm kiếm Ctrl K (`CommandPalette.tsx`), tab Nghiệp vụ điện thoại (`mobile/MNghiepVu.tsx`).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`, 203 lượt mở màn.
- `python tools/kiem_van.py` các file đã sửa: Sạch.
- Trình duyệt: gói Free thanh bên Thu chi 2-1-1, Bán hàng 3-1-1, Mua hàng 4-1-1, Kiểm kê 5-1-10, Danh mục 1-2; gói Plus Kho 5-1-2, Kê khai thuế 6-1-1, Tổng hợp 10-1-1, phân hệ vẫn tên Kho; rê chuột vào Thu chi không còn `.sb-flyout`; Ctrl K gõ "kiem ke" ra "Kiểm kê · Chứng từ".

## Dở dang, việc tiếp theo

- Sơ đồ Quy trình của Kho gói Free vẫn tiêu đề "Nghiệp vụ kho" (`kho/quy-trinh.ts`), chưa đổi theo tên Kiểm kê.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel tính năng và `Present/tools` chỉ máy Trum có.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`. Lưu ý: `kiem_tra.py` gom ô sơ đồ Quy trình bằng cách bấm từng phân hệ ở thanh bên; đổi màn mở mặc định của phân hệ mà không sửa script thì bước kiểm vẫn báo không lỗi nhưng bỏ sót sơ đồ.
