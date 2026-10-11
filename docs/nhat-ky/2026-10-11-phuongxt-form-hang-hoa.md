# Form hàng hoá, nhóm hàng hoá theo gói (T144)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/truong-dm.ts`:
  - Form hàng hoá (1.2): ô Tính chất / Loại đổi tên Loại hàng hoá (cả form nhóm hàng hoá, câu hỏi áp ngầm định); ô Đơn vị tính, ĐVT phụ hiện mã và tên ("KG - kg"), giá trị lưu vẫn là tên; gói Free bỏ ĐVT phụ (gói Free không có quy đổi ĐVT) và khối Hạch toán.
  - Form nhóm hàng hoá: gói Free, Standard bỏ ô Thuộc nhóm, Loại hàng hoá, khối Ngầm định cho hàng hoá; không hỏi áp ngầm định của nhóm khi chọn nhóm ở form hàng hoá (`goiHoiDoi`).
  - `TruongDM` thêm `goi` (chỉ hiện ô ở các gói này), `nhanDs` (nhãn trong ô chọn); `KhoiDM` thêm `goi`; `CauHinhDM` thêm `goiHoiDoi`.
- Gói Free, Standard: form đối tượng (1.5) ẩn ô TK công nợ; form nhóm đối tượng bỏ Thuộc nhóm, khối Hạch toán; form kho (1.8) ẩn khối Hạch toán, Ngầm định. Gói Free: form kho ẩn ô Nhóm kho (T143).
- Quỹ tiền (1.12): ô Chi nhánh áp dụng chọn nhiều chi nhánh (kiểu ô mới `chonNhieu`, lưu "A, B", chọn đủ là "Tất cả", danh sách theo chi nhánh mẫu thay danh sách cũ có Phan Xích Long); quỹ tiền mặt ẩn ô số tài khoản.
- Phương thức thanh toán: gói Free, Standard bỏ Loại chứng từ thu tiền, Diễn giải, khối Hạch toán ngầm định và các cột tương ứng ở danh sách, không có nút thêm (`khongThem`); mọi gói có nút Đồng bộ từ FABi (`nutPhu` trong `CatalogCfg`, bấm báo số phương thức đã đồng bộ). Gói Plus, Pro giữ nguyên vì tự hạch toán theo phương thức (T137) cần các ô này.
- Lý do (1.16): ô Dùng cho nghiệp vụ và cột Dùng cho ở danh sách cùng chữ Thu tiền, Chi tiền, Nhập kho, Xuất kho: đổi dữ liệu mẫu `LY_DO` (`data/mock.ts`, trước ghi Phiếu thu, Phiếu chi...) và bộ lọc lý do phiếu thu, chi ở `ui/generic/nhom.ts`. Gói Free chỉ Thu tiền, Chi tiền và danh sách chỉ lý do thu, chi; gói khác đủ 4 loại.
- Loại hàng hoá theo iPOS Inventory (PhuongXT gửi): 5 loại Nguyên vật liệu, Thành phẩm, Hàng bán thẳng, Khác (Công cụ dụng cụ), Ghi chú; gói Pro thêm Bán thành phẩm; áp cho form hàng hoá và nhóm hàng hoá (`LOAI_HANG`, `LOAI_HANG_PRO` ở `truong-dm.ts`). Dữ liệu mẫu: nhóm Đồ uống, Bia, nước ngọt thành Hàng bán thẳng; mã CCDC thành Khác (Công cụ dụng cụ).
- `src/ui/generic/CatalogScreen.tsx`: đọc các trường trên; nút Áp cho N hàng hoá trong nhóm chỉ ở gói Plus, Pro. Giữ nút Huỷ, Lưu và thêm, Lưu.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: không có mục ĐỎ.
- Bấm thử Góc Nhỏ gói Free: Thêm hàng hoá có khối Thông tin chung, Giá và thuế, Tồn kho, Trạng thái, không ĐVT phụ, ô đơn vị tính hiện "TO - Tô"; Sửa nhóm hàng hoá chỉ còn Mã, Tên, Diễn giải, Đang sử dụng, chân form Huỷ, Lưu và thêm, Lưu. Phố Mây gói Plus giữ đủ khối Hạch toán, ĐVT phụ, Thuộc nhóm, Ngầm định, nút Áp cho hàng hoá. Gói Free: form đối tượng không TK công nợ, nhóm đối tượng chỉ còn Mã, Tên, Diễn giải, Đang sử dụng, kho chỉ còn Thông tin chung (không Nhóm kho), Liên hệ, Trạng thái. Thử xong trả phiên như cũ.

## Dở dang, việc tiếp theo

- Ô Kho mặc định ở form hàng hoá gói Free vẫn liệt kê mọi kho mẫu (để làm sau nếu cần).

## Bẫy, quyết định mới

- Không.
