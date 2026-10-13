# Nút đồng bộ POS, chấm trạng thái, trường phương thức thanh toán ở danh mục (T181)

- Ngày: 13/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Anti A) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `types.ts`: `nutPhu` thêm cờ `chiIcon`. Bật cờ thì `CatalogScreen.tsx` vẽ nút vuông chỉ có icon, chữ nằm ở `title`.
- `danh-muc/index.ts`: thêm nút icon "Đồng bộ theo POS" ở hàng hoá 1.2, đơn vị tính 1.3, kho 1.8. Ở phương thức thanh toán, nút này thay nút chữ "Đồng bộ từ FABi". Bấm thì báo số dòng đã đồng bộ.
- `DanhMucChiNhanh.tsx`: thêm nút icon "Đồng bộ theo POS" và cột POS ID. `posId` của 3 chi nhánh mẫu ghi ở `data/mock.ts`, chi nhánh thêm từ FABi lấy `2000<n>`.
- File mới `src/ui/ChamTrangThai.tsx`: chấm tròn, xanh lá là đang dùng, đỏ là ngừng dùng. Bấm thì đổi trạng thái, không mở form.
  - Cột Trạng thái của mọi bảng danh mục chung (`CatalogScreen.tsx`) đổi từ chip sang chấm.
  - Trạng thái bấm đổi giữ trong state `ttGhiDe` của màn, Lưu ở form cũng ghi vào đó.
  - Cột Sử dụng ở bảng quy đổi đơn vị tính (`QuyDoiDvt.tsx`) cũng đổi sang chấm.
  - Giữ nguyên các công tắc ở bộ lọc, đầu khối form, công thức sản xuất và ô Đang sử dụng trong form.
- Phương thức thanh toán, chỉ gói Plus, Pro như T144:
  - "Loại chứng từ thu tiền" đổi thành "Chứng từ mặc định". Ô chọn gồm 5 loại phiếu của phân hệ Thu chi, theo `tien/index.ts`.
  - "TK Nợ" đổi thành "Tài khoản Nợ ngầm định".
  - Đối tượng, công việc, mục chi phí thành ô chọn mã, mỗi dòng hiện "mã - tên".
  - Thêm ô "Mã quỹ tiền" và cột Quỹ tiền.
  - Dữ liệu mục chi phí 1.6, công việc 1.7, quỹ 1.12 chuyển từ `index.ts` sang `danh-muc/data.ts` để form dùng chung. Số liệu không đổi.
- CSS: mục `Danh mục: đồng bộ POS, chấm trạng thái (T181)` cuối `app.css`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi.", 183 lượt mở màn.
- Chụp 1440px ở gói Plus:
  - Hàng hoá, chi nhánh, phương thức thanh toán có nút icon; chi nhánh có cột POS ID.
  - Bấm chấm dòng đầu thì xanh đổi đỏ, màn không mở form, không lỗi console.
  - Bấm nút POS hiện "Đã đồng bộ 4 phương thức thanh toán theo POS".
  - Form sửa phương thức thanh toán hiện đủ 5 ô hạch toán ngầm định.
- Chưa kiểm: so ảnh từng điểm ảnh các màn khác của bản máy tính. Màn danh mục đổi có chủ ý.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
