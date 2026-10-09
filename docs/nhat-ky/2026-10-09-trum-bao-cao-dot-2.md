# Báo cáo đợt 2: Tất cả báo cáo, cột lọc, bảng, tờ báo cáo, mẫu in (T58, T59, T66, T67, T71, T72, T74, T75)

- Ngày: 09/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- T58 `TrungTam.tsx`, `ThanhChon.tsx`, `ModuleTabs.tsx`, `app.css`: Tất cả báo cáo dạng danh sách gọn hai cột theo nhóm, biểu tượng theo loại (sổ `receipt`, bảng kê `doc`, tờ khai `percent`, báo cáo `chart`), Ghim (`bc-ghim`), Mở gần đây (`bc-gan-day`, ghi trong `ThanhChon.tsx`). Ẩn thanh tab khi phân hệ Báo cáo chỉ có một tab.
- T67 `Table.tsx`, `app.css`: `thead` dính cả khối, bỏ đo chiều cao hàng tiêu đề và các luật vá khe cũ của T44, T45, T50, T56. Hàng tiêu đề trên bỏ `border-bottom`, kẻ bằng `box-shadow`; nền tiêu đề phủ thêm 2px phía trên. Đã thử `border-collapse: separate`: hết khe nhưng lệch đường kẻ cột dính Số chứng từ, nên trả về viền gộp.
- T66 `ReportScreen.tsx`, `tuyChinhBC.ts`, `app.css`: cột Bộ lọc bên trái trong `ReportPaper`, bộ lọc tự sinh theo cột (chữ chọn nhiều, số từ đến qua `khoang`, `datKhoang`), loại trừ 10.2.2, 10.2.3, 10.2.4, 10.3.1 và tờ khai. Bỏ nút phễu trên thanh công cụ.
- T59 `ThietKeMauIn.tsx`, `app.css`: tab cột phải một hàng, ô tìm mẫu, xem trước vừa khung.
- T75 (đặt mã T68 lúc đầu, đổi vì trùng mã PhuongXT) `ReportScreen.tsx`, `ToGiay.tsx`, `tuyChinhBC.ts`, `app.css`: nút Tờ in / Bảng và Khổ lên thanh công cụ (cổng `#bc-xem-cho`); bộ lọc tự sinh chỉ theo danh mục; tờ giấy bóng `--sh-giay`.
- T71 `ReportScreen.tsx`, `app.css`: tờ báo cáo theo kiểu Ledger Studio (index.html của LedgerStudio dòng 120-140, 4180-4200), màu nhấn dùng `--blue`.
- T72 `ReportScreen.tsx`, `tuyChinhBC.ts`, `ToGiay.tsx`, `xuatXlsx.ts`, `chiaCot.ts` (mới): nút Xem báo cáo, trạng thái nháp và đã xem; `chiaCot` chia % độ rộng cột theo loại cột và khổ, dùng chung cho tờ, bản in, Excel. Coordinator sửa thêm: tiêu đề bắt đầu bằng "Tên" là cột chữ dài.
- T74 `Table.tsx`, `VoucherScreen.tsx`, `gen.ts`, `app.css`: bảng theo AG Grid alpine của ivtstag (đo bằng Playwright): cột cố định đo `offsetWidth` thật bằng ResizeObserver, mỗi ô tự vẽ đường kẻ, bấm số chứng từ mở phiếu, bỏ đúp chuột, ngày kèm giờ. Coordinator thêm lại bóng phủ 2px trên `thead`.

## Đã kiểm

- Mỗi việc: `npm run typecheck`, `npm run build` không lỗi; `python tools/kiem_tra.py --nhanh` in `Không có lỗi.`; `kiem_van` sạch.
- T67: đo bằng Playwright lúc lăn chuột ở 1440x900, 1536x864: đỉnh hàng lọc luôn bằng đáy hàng tiêu đề (213.56px). Dựng lại lỗi khe ở Chrome có giao diện, tỉ lệ 150%, trang zoom 0.85, danh sách Mua hàng gói Pro; sau sửa không còn khe.
- T66: Bảng cân đối số phát sinh lọc Phát sinh Nợ từ 1 tỷ còn 8 dòng, dòng tổng tính lại.
- T58: mở 3 báo cáo rồi về Tất cả báo cáo, mục Mở gần đây hiện đúng 3 báo cáo theo thứ tự mới nhất.

## Dở dang, việc tiếp theo

- Tiếp: T76 Hệ thống tài khoản (dữ liệu `danh-muc/he-thong-tk.ts` đã viết), T70 panel danh mục và Tuỳ chỉnh báo cáo, T73 tối ưu phản hồi. Spec giao Anti ở scratchpad của phiên, viết lại nếu phiên mới.
- Tên báo cáo trên thanh trên bị cắt ở màn 1440px từ T72 (thanh chật). Chưa sửa.

## Bẫy, quyết định mới

- QD40.
- Bẫy (ghi vào `docs/BAY.md`): bảng `border-collapse: collapse` có hàng tiêu đề dính thì viền giữa hai hàng không dính theo, ở tỉ lệ màn hình lẻ thành khe lộ chữ. Chạy thử headless không thấy, phải bật Chrome có giao diện với `device_scale_factor` 1.5.
