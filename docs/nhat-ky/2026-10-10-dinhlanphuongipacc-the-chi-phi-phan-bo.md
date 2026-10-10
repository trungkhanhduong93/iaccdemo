# Thẻ chi phí phân bổ, ngày đầu năm (T107)

- Ngày: 10/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Danh mục lý do 1.16 thêm 4 lý do chi: LD14 Chi phí CCDC, LD15 Chi phí thuê nhà, LD16 Chi phí TSCĐ, LD17 Chi phí chờ phân bổ (`data/mock.ts`). Ô Lý do chi giữ "Chi phí khác" ở cuối vì form lấy lý do cuối khi không đoán được (`generic/nhom.ts`).
- Sơ đồ Quy trình Chi phí phân bổ: Chi tiền mặt, Chi ngân hàng (mở phiếu với `?ly=LD17`) rồi Thẻ chi phí phân bổ, Thẻ CPPB dư đầu kỳ (mở danh sách 8.1.1) (`ccdc/quy-trinh.ts`). Form phiếu thu chi đọc `?ly=<mã lý do>` để chọn sẵn lý do (`ChungTuForm.tsx`).
- Màn 8.1.1 đổi tên tab thành Danh sách thẻ chi phí, hai nút Ghi tăng và Ghi tăng dư đầu kỳ. Cấu hình thẻ ở `ccdc/the-phan-bo.ts`:
  - Loại thẻ Chi phí trả trước (mặc định), Công cụ dụng cụ, Tài sản cố định; mã tự sinh CPTT.0001, CCDC.0001, TSCD.0001, gõ tay thì không ghi đè.
  - Số lượng, đơn giá chỉ thẻ CCDC; Số hiệu, Mô tả chi tiết chỉ thẻ TSCĐ; thẻ dư đầu kỳ có Giá trị đã phân bổ, Giá trị cần phân bổ, Số tháng đã phân bổ, Số tháng còn phân bổ.
  - Ngày ghi tăng, Số thẻ ở góc phải trên như Ngày chứng từ, Số phiếu. Số thẻ, Số tiền phân bổ hằng kỳ, Giá trị cần phân bổ, Số tháng còn phân bổ chỉ đọc.
  - Tab Chi tiết phân bổ: lịch đều theo cuối tháng từ ngày bắt đầu, kỳ cuối nhận phần lẻ, sửa được số tiền từng dòng; lưu mà tổng lệch giá trị cần phân bổ thì hỏi dồn vào kỳ cuối, không cho lưu khi lệch. Tab Lịch sử dùng chung bảng lịch sử phiếu.
  - Sửa thẻ: Ngừng phân bổ, Ngày ngừng phân bổ (mặc định hôm nay); dòng từ ngày ngừng mờ đi.
  - Số trên thẻ kiểu quốc tế: phẩy ngăn nghìn, chấm thập phân (`format.ts`: `soQT`, `nhapSoQT`, `docSoQT`).
- Panel danh mục chung (`CatalogScreen.tsx`, `truong-dm.ts`) có thêm tuỳ chọn, danh mục khác không đổi: `toanMan` (mở toàn màn hình như phiếu, 2/3 ô nhập, 1/3 tab), `bien` (nhiều kiểu thêm mới, mở bằng `?moi=<kiểu>`), `hien`, `goc`, `chiDoc`, `lien`, `dauNam`, `caHang: false` cho ô tích, `bang` (lưới tự tính, gõ được), `kiemLuu` (hỏi trước khi lưu), `soQuocTe`, nhãn chi nhánh và chọn chi nhánh như form phiếu.
- Lưu phiếu chi mới lý do Chi phí chờ phân bổ thì hỏi tạo thẻ ngay; Đồng ý mở thẻ điền sẵn tên (diễn giải dòng), số tiền, ngày, số chứng từ, có nút Xem phiếu gốc (`ChungTuForm.tsx`).
- Thông tin đơn vị có Ngày đầu năm, mặc định 01/01 năm hiện tại, lưu theo từng đơn vị trong phiên (`session.tsx`: `ngayDauNam`, `truocDauNam`; `HeThong.tsx`). Thêm mới mọi chứng từ và thẻ thường phải từ ngày này; thẻ dư đầu kỳ phải trước ngày này.
- `HopXacNhan` (`LocNangCao.tsx`) nhận nhãn nút huỷ tuỳ chọn `nutHuy`. CSS mới gom ở mục riêng cuối `app.css`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Bấm thử trên bản thử ở 1440x900: thêm thẻ thường, thẻ dư đầu kỳ, đổi loại thẻ, lịch phân bổ, gõ lại dòng và hộp hỏi khi lệch, ngừng phân bổ, chặn ngày đầu năm, tạo thẻ từ phiếu chi ngân hàng và mở phiếu gốc.
- Chưa thử khi lưu phiếu chi với ngày trước ngày đầu năm qua giao diện, chỉ đọc lại code.

## Dở dang, việc tiếp theo

- Không. Bản mẫu chưa lưu thật thẻ (nút Lưu chỉ báo đã lưu), giống các danh mục khác.

## Bẫy, quyết định mới

- Không ghi `docs/QUYET-DINH.md`: các quy tắc thẻ, ngày đầu năm, số kiểu quốc tế trên thẻ do dinhlanphuongipacc chốt, chờ Trum xem để ghi thành QD. Định dạng số quốc tế mới áp cho form thẻ, các màn khác vẫn kiểu Việt Nam.
