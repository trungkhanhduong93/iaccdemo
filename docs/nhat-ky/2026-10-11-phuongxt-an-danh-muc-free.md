# Gói Free ẩn bớt danh mục, kho mặc định mỗi chi nhánh (T143)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Gói Free ẩn danh mục Nhóm mục chi phí, Nhóm công việc, Nhóm kho: thêm `goi: ['S', 'PL', 'PR']` cho 3 màn ngoài Excel ở `src/modules/danh-muc/index.ts` (trường `goi` làm ở T141). Phương thức thanh toán giữ cho gói Free (PhuongXT đổi ý).
- Danh mục Kho (1.8) vẫn hiện ở gói Free nhưng: chỉ có kho mặc định của từng chi nhánh (kho đầu tiên theo iPOS Inventory), không có nút Thêm kho, bỏ cột Nhóm kho; ghi chú "Gói Free: mỗi chi nhánh tự có một kho mặc định theo iPOS Inventory, không thêm kho mới".
- `CatalogCfg` (`src/modules/types.ts`) thêm `khongThem` (gói không có nút thêm mới) và `locGoi` (lọc dòng theo gói); `src/ui/generic/CatalogScreen.tsx` đọc hai trường này.
- Danh mục chi nhánh (`DanhMucChiNhanh.tsx`) gói Free: cột Kho ghi một kho mặc định kèm nhãn Mặc định, có dòng giải thích.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: không có mục ĐỎ.
- Bấm thử Góc Nhỏ gói Free: tab Danh mục còn Quy trình, Hàng hoá, Nhóm hàng hoá, Đối tượng, Nhóm đối tượng, Kho, Chi nhánh, Quỹ tiền, Phương thức thanh toán, Lý do; Kho có 3 kho bếp, không nút thêm, không cột Nhóm kho. Phố Mây gói Plus: Kho đủ 7 kho, có nút Thêm kho, cột Nhóm kho, cột tài khoản. Thử xong trả phiên như cũ.

## Dở dang, việc tiếp theo

- Các ô chọn kho trên phiếu kho của gói Free (kiểm kê, xuất nhập) vẫn liệt kê mọi kho mẫu.

## Bẫy, quyết định mới

- Không.
