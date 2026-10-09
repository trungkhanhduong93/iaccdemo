# Đầu form mọi phiếu, hoá đơn mua ở đầu phiếu, báo cáo Mua hàng, ô chọn danh mục (T61 đến T65)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T61: `ChungTuForm.tsx` đầu form mọi phiếu như Thu chi: tiêu đề chỉ tên phiếu (`tenPhieu` lấy tên loại, hoặc bỏ chữ "Thêm" của `cfg.them`), trạng thái ở giữa, bỏ chip Chưa lưu, Số, tên màn, ô Loại phiếu, Tổng tiền góc phải.
- T62: Mua hàng tích Nhận kèm hoá đơn thì Mẫu số, Ký hiệu, Số, Ngày hoá đơn ở đầu phiếu (`.ct-hd-dau`), bỏ tab Hoá đơn. Gói Free không có tab Ghi sổ ở mọi phiếu. Nhật ký thêm mới, sửa, xoá đã chạy cho mọi phiếu dùng form chung.
- T63: `mua-hang/bao-cao.ts` (mới) tính Tổng hợp mua hàng 4.2.2, Chi tiết mua hàng 4.2.1, Tổng hợp nhập 4.2.4, Chi tiết nhập 4.2.5 từ đúng phiếu mua 4.1.1, theo chi nhánh (`theoCn`, `rows(thang, cn)`). Mở cho mọi gói (`plan.ts`). Sơ đồ Mua hàng kiểu hội tụ như Thu chi. Sổ ngân hàng gói Free ghi Thu, Chi, Tồn, bỏ cột TK. Đóng T25, tách việc mô tả gói thành T60.
- T64: nguồn phiếu Mua hàng là Thủ công hoặc Excel (`nguon: 'excel'`, nhãn trong `NGUON` của `gen.ts`); bỏ Tải từ iPOS Inventory ở nút Thêm mới và ô sơ đồ.
- T65: `ui/ChonDanhMuc.tsx` (mới) ô chọn danh mục có ô tìm, thêm mới tại form; thay ở `ChungTuForm.tsx` (đối tượng, nhân viên, lý do, quỹ, tài khoản ngân hàng) và `BangSua.tsx` (hàng hoá, kho, lý do, đối tượng, khoản mục, công việc).
- Thanh công cụ báo cáo bám chỗ đặt qua kho ngoài `ui/bao-cao/choThanh.ts`.
- `tools/kiem_tra.py`: bước kiểm Báo cáo tài chính chờ trang hiện hẳn (trang khoá hoặc nút chọn kỳ) rồi mới xét.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py` bản đầy đủ 4 gói chạy 3 lần liền sau khi gộp bản của Trum: `Không có lỗi.`
- `python tools/kiem_van.py` các file có chữ đã sửa: sạch.
- Playwright: đầu form ở Mua hàng, Kho, Bán hàng, Thu chi; hoá đơn ở đầu phiếu; tab theo gói; lịch sử phiếu Mua hàng; 4 báo cáo mua hàng khớp nhau; tìm và thêm nhà cung cấp, mặt hàng mới tại form.

## Dở dang, việc tiếp theo

- Không. T60 (mô tả gói "1 điểm bán") ở trạng thái Chờ.
- Nhờ Trum cập nhật Excel tính năng theo QD38 (4.2.1, 4.2.2 mở gói Free; 4.2.4, 4.2.5 mới).

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD38, QD39; bổ sung QD33.
- Bước chọn kỳ Báo cáo tài chính trong `kiem_tra.py` hỏng chập chờn: bộ kiểm chờ cố định 0,2 giây rồi xét trang khoá, máy chậm thì trang khoá chưa hiện nên bộ kiểm bấm tìm nút không có. Đã sửa bằng chờ phần tử.
- Mã việc giữ trên máy lâu thì dễ trùng với người khác (phiên này đổi mã hai lần). Nhận việc nên push ngay như AGENTS.md.
