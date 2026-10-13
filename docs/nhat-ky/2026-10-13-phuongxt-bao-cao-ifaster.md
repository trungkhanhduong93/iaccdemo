# Mở lại báo cáo theo danh sách iFaster (T185)

- Ngày: 13/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT đưa ảnh màn Báo cáo của iFaster (itaxdev.ipos.vn), chọn các nhóm Quỹ tiền, Công nợ, Quản trị, Kho, Mua hàng, Bán hàng. PhuongXT chốt: mở mọi gói (ẩn bớt sau), Sổ quỹ tiền mặt, Sổ ngân hàng giữ như cũ, công nợ gộp một sổ, không đổi màn Báo cáo sang dạng ô nhóm như iFaster, khung báo cáo giữ như IACC.
- Đối chiếu tên iFaster với mã IACC: Tổng hợp quỹ tiền 2.2.8, Báo cáo dòng tiền 2.2.9, Công nợ nhà cung cấp, khách hàng gộp vào Sổ công nợ 2.2.5, Báo cáo kết quả kinh doanh 10.2.3, Sổ chi phí 10.4.3, Nhập xuất tồn 5.2.3, Tổng hợp, Chi tiết xuất kho 5.2.11, 5.2.12, Tổng hợp, Chi tiết nhập kho 5.2.9, 5.2.10, Báo cáo mua hàng 4.2.2, Chi tiết mua hàng 4.2.1, Mua hàng theo ngày 4.2.6, Báo cáo bán hàng 3.2.7, Chi tiết bán hàng 3.2.8, Bán hàng theo ngày 3.2.6. Tên màn giữ tên IACC.
- `src/modules/bao-cao/danh-sach.ts`: thêm `MO_IFASTER` (16 mã trên), `giuBC` giữ các mã này ở mọi chế độ.
- `src/app/registry.ts`: `apDung` cho qua các mã `MO_IFASTER` không xét `anTam`, `cheDo`, `th`, `hkd` (2.2.5, 10.2.3 trước bị ẩn tạm ở TT133, TT99, lọc theo trường hợp thuế TT58). `conBaoCao`: phân hệ ẩn ở gói mà còn báo cáo hiện được thì nhóm báo cáo vẫn hiện.
- `src/modules/bao-cao/TrungTam.tsx`: `layNhomBaoCao` giữ nhóm của phân hệ ẩn ở gói khi còn báo cáo hiện được; gói Free thấy nhóm Kế toán tổng hợp (Báo cáo kết quả kinh doanh, Sổ chi phí) dù phân hệ Tổng hợp ẩn trên thanh trái.
- `src/modules/ban-hang/index.ts`, `src/modules/kho/index.ts`: báo cáo mới 3.2.6 đến 3.2.8, 5.2.9 đến 5.2.14 bỏ giới hạn `goi: ['S', 'PL', 'PR']` để gói Free mở được (5.2.13, 5.2.14 vẫn ẩn vì không nằm trong danh sách giữ).
- `docs/KIEN-TRUC.md`: ghi quy ước `MO_IFASTER`.

Sau đó PhuongXT góp ý thêm:

- Màn Báo cáo (`TrungTam.tsx`, mục CSS T185 cuối `app.css`): khối Ghim và mở gần đây chuyển xuống dưới cùng cột trái (cột trái cao hết màn, khối ghim sát đáy), mỗi dòng kèm ký hiệu mẫu (`kyHieuBC`), tên xuống dòng không cắt.
- Bỏ Sổ công nợ 2.2.5 khỏi `MO_IFASTER`; TT58 vẫn giữ S4a-DNSN trong `GIU_TT58`.
- Công nợ nhà cung cấp, Công nợ khách hàng theo iFaster (đọc itaxdev.ipos.vn 13/10/2026, tài khoản PhuongXT đăng nhập, MST 010676557711, chỉ xem): file mới `src/modules/bao-cao/cong-no.tsx`. Cột #, đối tượng (tên · mã), Số đơn phát sinh, Nợ đầu kỳ (I), Tiền mua hàng hoặc Tiền bán hàng (II), Tiền trả hàng (III), Tiền thanh toán (IV), Nợ cuối kỳ (V = I+II-III-IV), dòng Tổng cộng; tiêu đề số hai dòng (tên, ký hiệu). Bấm tên mở popup "Lịch sử công nợ - <tên>": #, Thời gian, Kho hàng, Chứng từ, Ghi chú, Diễn giải, Mua hàng hoặc Bán hàng, Trả hàng, Tiền thanh toán, Công nợ; dòng Đầu kỳ, các phiếu, dòng Cuối kỳ. Công nợ nhà cung cấp dùng lại mã 4.2.3 (Mua hàng, trước là Sổ công nợ nhà cung cấp kiểu tổng hợp); Công nợ khách hàng thêm màn 3-2-9 ở Bán hàng. Lọc theo chi nhánh trên thanh trên, bộ lọc Nhà cung cấp, Khách hàng (chọn nhiều).
- Báo cáo dòng tiền 2.2.9 (`so-bo-sung.ts`) nhóm lại theo iFaster: cột Kỳ này (Tổng kỳ này, Tiền mặt, Ngân hàng) và Kỳ trước; I. Tiền đầu kỳ (Tiền mặt, Tiền gửi ngân hàng), II. Tổng tiền thu (bán hàng, công nợ khách hàng, từ nhà cung cấp, Thu khác), III. Tổng tiền chi (mua hàng, trả nhà cung cấp, trả khách hàng, Chi khác), IV. Dòng tiền thuần, V. Tiền cuối kỳ. Thu khác, Chi khác gom khoản iFaster không tách (lương, lãi vay, nộp tiền mặt vào ngân hàng) để tiền cuối kỳ khớp sổ cái.
- `src/ui/Table.tsx` (dùng chung): bảng có cột khai `nhom` vẽ thêm hàng tiêu đề nhóm (`tbl-nhom`); cột lẻ căn giữa cả hai tầng, cột con căn giữa như iFaster. Hàng tiêu đề cột có lớp `tbl-cot`, bốn chỗ đo cột đổi từ `thead tr:first-child > th` sang `thead tr.tbl-cot > th`. Bảng không khai `nhom` không đổi.
- Tổng hợp quỹ tiền 2.2.8: tên quỹ bấm mở Sổ quỹ tiền mặt 2.2.1 hoặc Sổ ngân hàng 2.2.3, lọc sẵn quỹ đó, cùng kỳ (`datLocDaXem` mới ở `tuyChinhBC.ts`); tên quỹ lấy theo `tenQuyTm`, `tenTkNh` cho khớp bộ lọc sổ.
- `Screen.tsx`: màn khoá (`Locked`) của báo cáo, nhóm báo cáo chưa có ở gói có nút "‹ Tất cả báo cáo" cạnh tiêu đề.
- Sửa lỗi CSS có sẵn: mục T183 trong `app.css` thiếu dấu `}` đóng `@media (max-width: 767px)` (khối Quy đổi đơn vị tính trên mobile), nên mọi CSS thêm sau đó (T182, T184) chỉ chạy dưới 767px. Đã thêm dấu đóng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Script Playwright tạm mở Tất cả báo cáo rồi từng báo cáo ở 4 gói: không trang trắng, không lỗi console, không màn "không dùng", "Nâng cấp".
- Chụp màn Playwright 1600px: Báo cáo dòng tiền tiêu đề 2 tầng; Công nợ nhà cung cấp vừa khung; popup lịch sử công nợ đủ cột, công nợ cuối kỳ khớp dòng tổng hợp; màn khoá nhóm Chi phí phân bổ gói Free có nút Tất cả báo cáo; Tất cả báo cáo gói Standard có khối ghim dưới cùng.
- Tổng hợp quỹ tiền bấm Techcombank mở Sổ ngân hàng, dòng Điều kiện lọc: Quỹ tiền: Techcombank 1903 4455 6677 88.

## Dở dang, việc tiếp theo

- Số dư sổ quỹ, sổ ngân hàng (số mẫu sinh ngẫu nhiên theo chi nhánh) chưa khớp số của Tổng hợp quỹ tiền (tính từ sổ cái); bấm quỹ mở đúng sổ, đúng bộ lọc nhưng số đầu kỳ khác.
- Công nợ nhà cung cấp, khách hàng là số mẫu sinh theo đối tượng, chi nhánh, tháng; chưa nối phiếu mua, bán, thu chi thật. Chứng từ trong lịch sử chưa bấm mở phiếu.

- PhuongXT sẽ báo báo cáo nào cần ẩn ở gói nào: bỏ mã khỏi `MO_IFASTER` hoặc thêm điều kiện lọc.
- Chưa chạy `python tools/xuat_bao_cao_he_thong.py` (máy này thiếu `../Present/tools/build_present`, xem nhật ký T171).

## Bẫy, quyết định mới

- Không.
