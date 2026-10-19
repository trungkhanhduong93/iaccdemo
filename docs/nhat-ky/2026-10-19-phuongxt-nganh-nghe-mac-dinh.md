# Hàng hoá mới mặc định ngành nghề 301-5; đối tượng gói Free 2 loại (T469, T470, T471)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `danh-muc/truong-dm.ts`, cấu hình `1.2` Hàng hoá: thêm `moi` trả `nganhNghe: '301-5'` cùng nhóm ngành, Thuế GTGT, Thuế TNCN (TNDN) theo `dienNganhNghe`. `CatalogPanel` gọi `moi` khi thêm mới, nên áp cho danh mục Hàng hoá, nút Thêm ở ô chọn hàng trong phiếu (máy tính), form thêm danh mục trên điện thoại (`MFormDm` ở `MLapPhieu`, `MLapPhieuKho`, `MDanhMuc`).
- `ui/ChonDanhMuc.tsx`, hộp thêm nhanh 4 ô (`HopThemHang`, phiếu mua hàng, kiểm kê, T388): giá trị đầu lấy `cauHinh.moi` rồi mới tới giá trị điền từ phiếu, nên hàng thêm nhanh cũng mang ngành nghề 301-5.
- Chọn Nhóm hàng hoá sau đó không đè ngành nghề đã có (như T151), người dùng đổi ngành nghề ở ô Nhóm ngành nghề con. Ô chỉ hiện ở TT152, TT58.
- T470: `danh-muc/index.ts` danh mục 1.5 thêm `locGoi` (gói Free bỏ dòng loại Khách hàng, áp cả máy tính lẫn điện thoại như T144 với Lý do nghiệp vụ); `truong-dm.ts` ô Loại đối tượng tách 2 bản theo gói: Free chỉ Nhà cung cấp, Nhân viên; Standard, Plus, Pro đủ 3 loại.
- T471: `truong-dm.ts` danh mục 1.5 `kieuDt` (Tổ chức, Cá nhân, thêm mới sẵn Tổ chức) là nút chọn tròn cạnh tên khối Thông tin chung theo mẫu PhuongXT gửi: `KhoiDM.chonDau` mới, `CatalogScreen.tsx` vẽ sau tên khối, bấm không gập khối, chỉ xem thì khoá; CSS mục cuối `app.css` (T471); Tổ chức hiện `mst` nhãn MST/CCCD chủ hộ, bắt buộc; Cá nhân hiện `cccd` (lưu riêng, cột Mã số thuế không lẫn CCCD); bỏ ô Mã số thuế cũ cuối khối. `index.ts`: đối tượng có sẵn có MST là Tổ chức, không có (khách lẻ, nhân viên) là Cá nhân, để sửa không bị đòi MST. `CatalogScreen.tsx` câu báo, ô chọn trống chỉ hạ chữ đầu của nhãn (`thuongDau`), giữ MST, CCCD, GTGT viết hoa.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free (TT152): Danh mục Hàng hoá, Thêm mới: Nhóm ngành nghề con hiện 301-5 · Dịch vụ ăn uống, Thuế GTGT 3, Thuế TNCN 1,5. Hộp thêm nhanh không có ô ngành nghề nên không nhìn thấy, không bấm lưu thử để khỏi tạo hàng trong dữ liệu mẫu.
- T470: gói Free Danh mục đối tượng chỉ còn Nhà cung cấp 6, Nhân viên 6, không còn chữ Khách hàng; Thêm mới ô Loại đối tượng chỉ Nhà cung cấp, Nhân viên. Gói Plus vẫn đủ Khách hàng, Nhà cung cấp, Nhân viên.
- T471: Thêm đối tượng: thanh Thông tin chung có ◉ Tổ chức ◯ Cá nhân, thứ tự ô MST/CCCD chủ hộ, Mã, Tên, Loại, Nhóm; bấm Lưu khi trống báo "Vui lòng nhập MST/CCCD chủ hộ"; đổi sang Cá nhân thì ô thành CCCD, hết báo MST. Không lưu đối tượng nào.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
