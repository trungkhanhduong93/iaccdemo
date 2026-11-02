# Quy định chữ số và dấu phân cách Việt Nam, Quốc tế (T710)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/format.ts`: thêm kiểu chữ số `KieuSo` ('vn', 'qt'), `datKieuSo`, `locSo()`, `dauNgan()`, `dauThap()`, `docSoChu()`. `money`, `soLuong`, `short`, `pct`, `rutGonSo`, `soQT`, `nhapSoQT` theo kiểu đang chọn.
- `src/ui/OSoGo.tsx`: `goSoVN`, `docSoVN` và ô `OSoGo` gõ theo dấu ngăn nghìn, dấu thập phân của kiểu đang chọn. Các form điện thoại dùng 2 hàm này nên tự đổi theo, không phải sửa.
- `src/app/session.tsx`: thêm `kieuSo` theo đơn vị; `SessionProvider` đặt kiểu trước khi vẽ, đổi kiểu thì vẽ lại toàn bộ (`Fragment key`).
- Màn Cấu hình kế toán: web (`HeThong.tsx`, thẻ "Quy định chữ số và dấu phân cách", ô chọn Việt Nam, Quốc tế, ví dụ số) và điện thoại (`MHeThong.tsx`, 2 nút chọn). Bấm Lưu mới áp dụng.
- Thay `toLocaleString('vi-VN')` viết cứng ở 22 file bằng `locSo()`; đổi chỗ đọc ngược số ở `LocCot.tsx`, `tuyChinhBC.ts`, `ToGiay.tsx` sang `docSoChu`; % viết cứng dấu phẩy ở `ApDauBang.tsx`, tờ khai HKD, danh mục ngành nghề, `tt58.ts`, `ban-hang/data.ts` sang `dauThap()`.
- CSS cuối `app.css` mục T710.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `HeThong.tsx`: sạch.
- Trình duyệt: chọn Quốc tế, Lưu, danh sách Phiếu chi hiện `72,000,000`; gõ `1234567.5` ra `1,234,567.5`, đọc ra 1234567.5. Kiểu Việt Nam gõ `1234567,5` ra `1.234.567,5`. Đã trả phiên thử về mặc định Việt Nam.
- Chưa mở từng form chứng từ để gõ tay; chưa kiểm mẫu in, xuất Excel.

## Dở dang, việc tiếp theo

- Không.
- Còn viết cứng dấu phẩy: `ReportScreen.tsx:1205` (Trum đang giữ T594), `thiet-ke/OSo.tsx`, `thiet-ke/CaiTrang.tsx` (cỡ chữ mẫu in), `danh-muc/index.ts:124`, `truong-dm.ts` `soPhay` (thuế suất lưu dạng chuỗi có phẩy). Cần thì mở việc mới.
- Trợ lý (`TroLy.tsx`) vẫn đọc số người dùng gõ theo kiểu Việt Nam.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md` QD92.
