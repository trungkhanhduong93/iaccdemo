# Bộ lọc báo cáo bên trái, cột hẹp, thiết kế lại mẫu in (T111, T112)

- Ngày: 10/10/2026
- Người: Trum, agent: Claude Code điều phối; Antigravity làm T111, Claude Code (worker) làm T112
- Trạng thái cuối phiên: Xong

## Đã làm

- T111, `ReportScreen.tsx`: ô Khoảng ngày nằm đầu cột Bộ lọc, nút Xem báo cáo nằm ở đáy cột. Cột thu gọn có nút Xem báo cáo và chip tháng đang xem. 18 màn không có cột Bộ lọc (BCTC, tờ khai...) giữ hai thứ này trên thanh trên. `useCoBoLoc`, `datCoBoLoc` cho thanh trên biết màn có cột Bộ lọc không. `LOAI_TRU_TU_SINH` thêm 10.2.5.
- T111, `chiaCot.ts`: thêm loại cột `tyle` (tỷ lệ, %, hệ số, thuế suất). Mọi cột có độ rộng tối thiểu theo từ dài nhất của tiêu đề; thiếu chỗ thì lấy từ cột chữ dài. Excel xuất ra (`xuatXlsx.ts`) cũng theo độ rộng mới.
- T112, `ThietKeMauIn.tsx`, `CaiTrang.tsx`: màn Thiết kế mẫu in làm lại: thanh trên (tên mẫu, chế độ, mẫu số, khổ, In thử, Khôi phục mặc định, Lưu); trái danh sách mẫu theo nhóm Tiền, Kho, Tài sản, Khác có ô tìm; giữa tờ in trên nền xám, thanh thu phóng; phải 8 nhóm thuộc tính thu gọn được, bấm khối trên tờ thì mở đúng nhóm.
- T112, `InChungTu.tsx`, `mau-in.ts`: vẽ lại khung phiếu (đầu trang hai bên, hộp Nợ/Có, lưới thông tin, bảng kẻ mảnh có tiêu đề nhóm và hàng ký hiệu cột, ô ký chia đều). Thêm trường còn thiếu theo thông tư: phiếu thu, chi TT133/TT99 có "Đã nhận đủ số tiền", tỷ giá, số tiền quy đổi; nhập, xuất kho có nhóm Số lượng (theo chứng từ, thực nhập/thực xuất), dòng Bộ phận; 05-VT, 06-VT, 01-TSCĐ, 02-TSCĐ đủ cột. TT58 giữ như T108. Ký hiệu mẫu số không đổi; mẫu chưa có ký hiệu thì không in dòng Mẫu số.
- T112, `duLieuIn.ts`: số tiền, số bằng chữ, dòng Cộng đọc từ một nguồn (trước đây bằng chữ lấy `row.tong` nên lệch dòng Cộng). Nợ/Có in trên phiếu chỉ lấy bút toán của chính phiếu (`noCoCuaMau`).
- CSS hai mục T111, T112 cuối `app.css` lọt vào commit Gói thuê bao (T119) của phiên khác (cùng thư mục), không tách lại.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: 241 lượt, `Không có lỗi.` (chạy với `PYTHONIOENCODING=utf-8`, không thì script lỗi in tiếng Việt ra console).
- `kiem_van.py`: ReportScreen.tsx, ThietKeMauIn.tsx, mau-in.ts, InChungTu.tsx sạch.
- Worker A: Playwright 122 màn × 3 chế độ, 0 tiêu đề cột vỡ giữa chữ; đổi ngày rồi Xem báo cáo thì kỳ trên tờ đổi theo. Tự chụp Sổ TSCĐ S4b-DNSN tháng 9 (TT58): cột Tỷ lệ (%) khấu hao ngắt theo từ.
- Worker B: Playwright 17 mẫu × 3 chế độ, 0 lỗi tràn trang, đủ trường; 27 tờ có số bằng chữ khớp số Cộng; in thật từ form 83 phiếu, 0 lỗi; mẫu riêng kiểu cũ trong localStorage vẫn mở được.
- Chưa in ra giấy thật. Chưa đối chiếu bố cục với văn bản gốc thông tư.

## Dở dang, việc tiếp theo

- T120: `ChungTuForm.tsx` hàm `moIn` (khoảng dòng 317–321) không truyền dòng chi tiết đang có trên form vào phiếu in.
- Màn 3.1.3, 4.1.3, 4.1.5, 4.1.6, 5.1.3, 5.1.6, 7.1.2, 8.1.2, 8.1.3 chưa kiểm in thật từ form (script không mở được form theo đường dẫn); mẫu của các màn này đã kiểm ở màn thiết kế.

## Bẫy, quyết định mới

- Không. Ghi chú: hai phiên chạy chung thư mục `D:\IACC-CLOUD\Web` (vi phạm QD21) làm CSS của việc này lọt vào commit T119.
