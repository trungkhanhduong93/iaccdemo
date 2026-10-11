# Form hàng hoá, nhóm hàng hoá theo gói (T144)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (chờ danh sách loại hàng hoá của iPOS Inventory)

## Đã làm

- `src/modules/danh-muc/truong-dm.ts`:
  - Form hàng hoá (1.2): ô Tính chất / Loại đổi tên Loại hàng hoá (cả form nhóm hàng hoá, câu hỏi áp ngầm định); ô Đơn vị tính, ĐVT phụ hiện mã và tên ("KG - kg"), giá trị lưu vẫn là tên; gói Free bỏ ĐVT phụ (gói Free không có quy đổi ĐVT) và khối Hạch toán.
  - Form nhóm hàng hoá: gói Free, Standard bỏ ô Thuộc nhóm, Loại hàng hoá, khối Ngầm định cho hàng hoá; không hỏi áp ngầm định của nhóm khi chọn nhóm ở form hàng hoá (`goiHoiDoi`).
  - `TruongDM` thêm `goi` (chỉ hiện ô ở các gói này), `nhanDs` (nhãn trong ô chọn); `KhoiDM` thêm `goi`; `CauHinhDM` thêm `goiHoiDoi`.
- Gói Free, Standard: form đối tượng (1.5) ẩn ô TK công nợ; form nhóm đối tượng bỏ Thuộc nhóm, khối Hạch toán; form kho (1.8) ẩn khối Hạch toán, Ngầm định. Gói Free: form kho ẩn ô Nhóm kho (T143).
- `src/ui/generic/CatalogScreen.tsx`: đọc các trường trên; nút Áp cho N hàng hoá trong nhóm chỉ ở gói Plus, Pro. Giữ nút Huỷ, Lưu và thêm, Lưu.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: không có mục ĐỎ.
- Bấm thử Góc Nhỏ gói Free: Thêm hàng hoá có khối Thông tin chung, Giá và thuế, Tồn kho, Trạng thái, không ĐVT phụ, ô đơn vị tính hiện "TO - Tô"; Sửa nhóm hàng hoá chỉ còn Mã, Tên, Diễn giải, Đang sử dụng, chân form Huỷ, Lưu và thêm, Lưu. Phố Mây gói Plus giữ đủ khối Hạch toán, ĐVT phụ, Thuộc nhóm, Ngầm định, nút Áp cho hàng hoá. Gói Free: form đối tượng không TK công nợ, nhóm đối tượng chỉ còn Mã, Tên, Diễn giải, Đang sử dụng, kho chỉ còn Thông tin chung (không Nhóm kho), Liên hệ, Trạng thái. Thử xong trả phiên như cũ.

## Dở dang, việc tiếp theo

- Danh sách Loại hàng hoá đang là Hàng hoá, Thành phẩm, Nguyên vật liệu, Công cụ dụng cụ, Dịch vụ; PhuongXT muốn lấy đúng 5 loại của iPOS Inventory, chờ PhuongXT gửi danh sách rồi sửa ô `loai` ở '1.2' và 'nhom-hang-hoa' (`truong-dm.ts`), đối chiếu dữ liệu mẫu `loai` của hàng hoá.
- Ô Kho mặc định ở form hàng hoá gói Free vẫn liệt kê mọi kho mẫu.

## Bẫy, quyết định mới

- Không.
