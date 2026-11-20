# Hộp Nhập Excel danh mục theo luồng IVT (T892)

- Ngày: 21/11/2026
- Người: Trum, agent: Claude Code, 5 worker Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Viết spec theo bản vẽ Trum chốt (https://claude.ai/artifact/URAL9XkFKkkXtywSG5iY16). Spec ở `backup/spec-T892.md`, mẫu HTML ở `backup/mau-T892/`, chỉ có trên máy Trum.
- Tạo `src/ui/generic/nhapDmKieu.ts`: kiểu dùng chung của hộp nhập.
- `mauNhapDm.ts`: cột mẫu theo gói đang dùng, file mẫu có sheet Dữ liệu mẫu riêng và ghi chú ô tiêu đề, tải dữ liệu đang có, đọc kiểm (mã trùng cập nhật, mã trống tự sinh, luật ô trống), file lỗi, ghi theo lô có báo tiến độ.
- `danhMucStore.ts`: lớp ghi đè dòng mẫu `ghiDeCatalogRow`, `apGhiDe`, đánh dấu dòng vừa nhập. Nhóm hàng hoá, Nhóm đối tượng có kho riêng, không còn lẫn vào Hàng hoá, Đối tượng.
- `CatalogScreen.tsx`: mở hộp ở cả 3 gói, truyền danh sách theo bộ lọc, trang đang xem, tô dòng vừa nhập.
- `HopNhapExcel.tsx` viết lại theo bản vẽ; tạo `NhapXlKiemTra.tsx` (Bước 2), `NhapXlKetQua.tsx` (Đang nhập, Bước 3). CSS mục T892 cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Chạy thử luồng bằng Playwright, gói S, Hàng hoá: tải dữ liệu đang có, sửa 2 dòng, thêm 3 dòng (1 mã trống), 2 dòng lỗi. Bước 2 đếm Tất cả 7, Thêm mới 3, Cập nhật 2, Lỗi 2. Nhập xong danh sách tô 3 dòng thêm, 2 dòng sửa.
- File mẫu gói S, PL, PR ra đúng cột theo form Thêm mới, ô tiêu đề có ghi chú.
- File lưu lại qua Excel thật đọc được. File ghi bằng openpyxl có ghi chú ô thì exceljs báo "Không đọc được file".
- Chưa kiểm luồng nhập ở 5 danh mục còn lại, chưa so ảnh từng điểm ảnh với bản vẽ.

## Dở dang, việc tiếp theo

- Không. Việc phát sinh: T891 (nhóm hàng trong dữ liệu mẫu nằm ngoài danh mục, nên tải dữ liệu đang có rồi nhập lại thì báo lỗi), T893 (form Sửa không lưu dòng mẫu).

## Bẫy, quyết định mới

- Không.
