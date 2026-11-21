# Nhập Excel Tồn kho ban đầu (T896)

- Ngày: 21/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Phiên 1: chưa sửa code. Soi màn Tồn đầu kỳ của IVT (ivt.ipos.vn > Thiết lập > Tồn đầu kỳ > Thêm mới > Nhập dữ liệu), tải file mẫu về `backup/ivt/mau-ton-dau__MAU_NHAP_TON_DAU_KY_*.xlsx` (thư mục `backup/` không lên git).
- IVT chọn một kho trong hộp nhập, file không có cột kho. File IVT có 5 cột: Mã hàng hóa(*), Tên hàng hoá, Mã đơn vị tính(*), Số lượng, Giá. Kèm sheet Danh sách hàng hoá (mã hàng, tên, mã ĐVT, tên ĐVT).
- Trum duyệt cách làm dưới đây ngày 21/11/2026.

- Phiên 2: làm 8 điểm Trum duyệt. Anti viết code, Claude dừng anti sau 30 phút và tự kiểm.
  - `HopNhapExcel.tsx` thêm prop tuỳ chọn `boHam` (tải mẫu, tải dữ liệu, kiểm, ghi, tải lỗi, nội dung thêm ở bước 1, lý do chặn). Không truyền thì luồng danh mục giữ nguyên.
  - File mới `src/modules/kho/nhapTonDauExcel.ts`: cột, sheet DS hàng hoá và DS đơn vị tính, kiểm từng dòng, ghi bằng `luuTonDau`, `xoaTonDau`.
  - `mauNhapDm.ts` xuất `taiFileDm`, `ngayFile`, `SheetDs`, `ODm`; `taiFileDm` nhận thêm sheet DS riêng và câu đầu sheet Hướng dẫn.
  - `TonKhoBanDau.tsx`: nút Excel > Nhập mở hộp, có ô Chọn kho cần nhập; Xuất tải tồn đầu kho đang xem.

## Đã kiểm

- `npm run typecheck`, `npm run build` sạch. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van.py` 3 file: 0 ĐỎ.
- Playwright khứ hồi ở Kho tổng, gói Pro: Xuất ra `Du_lieu_Ton_kho_ban_dau_K01_<ngày>.xlsx`, file mẫu `Mau_nhap_Ton_kho_ban_dau_Pro.xlsx`. Sửa số lượng NVL001, NVL002, thêm NVL007, ĐVT sai ở NVL003, xoá đơn giá NVL004. Sau nhập, Xuất lại: 3 mã khớp file, NVL003 và NVL004 giữ nguyên. File lỗi có 3 dòng: thêm NVL009 vì dòng mẫu này vốn thiếu đơn giá (chip Cần xem lại), đúng luật đơn giá bắt buộc.
- Kho bếp Lê Lợi có phiếu kiểm kê KK2609-0187 ngày 03/09/2026: hộp báo lý do, nút Kiểm tra dữ liệu bị khoá.
- Hồi quy danh mục chỉ chạy Hàng hoá ở Pro và Plus (tải mẫu, tải xuống, kiểm lại file tải xuống ra "Nhập 35 dòng"). Chưa chạy đủ 18 ca T895.

## Dở dang, việc tiếp theo

- Chạy đủ 18 ca T895 cho 6 danh mục khi có dịp, phiên này chỉ chạy Hàng hoá.

## Bẫy, quyết định mới

- File sửa bằng openpyxl giữ chú thích ô thì exceljs báo "Cannot read properties of undefined (reading 'comments')", hộp nhập hiện "Không đọc được file". Script test phải xoá `cell.comment` trước khi lưu. File lưu bằng Excel thật không bị.
