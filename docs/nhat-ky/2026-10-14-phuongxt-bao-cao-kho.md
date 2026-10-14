# Báo cáo nhập, xuất kho: tách số lượng, giá vốn, bộ lọc, mở chi tiết (T212, T213, T214, T215)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T212: `tongHopKho` (`src/modules/kho/bao-cao.ts`): mỗi loại phiếu thành nhóm cột hai tầng Số lượng, Giá trị; cột tổng gom dưới nhóm Tổng. Dòng Tổng cộng không cộng số lượng (khác đơn vị tính). Áp cho Tổng hợp nhập kho 5.2.9 và Tổng hợp xuất kho 5.2.11 (chung hàm).
- T213: `chiTietKho`: cột Đơn giá, Thành tiền đổi tên Giá vốn, Tiền vốn (5.2.10, 5.2.12; 5.2.14 chung hàm, đang ẩn).
- T214: `CauHinhBC.boTuSinh` (`bao-cao/danh-sach.ts`): tên bộ lọc tự sinh từ cột không hiện; `ReportScreen.tsx` bỏ qua khi tự sinh. Chi tiết xuất kho 5.2.12 bỏ Đối tượng. Tổng hợp xuất kho vốn không có bộ lọc này.
- T215: `tongHopKho` nhận slug báo cáo chi tiết (`kho/index.ts`: 5-2-10, 5-2-12); bấm mã, tên hàng mở chi tiết lọc sẵn hàng (`locHang`), cùng kỳ, giữ bộ lọc đang xem.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` các file đã sửa: Sạch.
- Trình duyệt: tiêu đề hai tầng ở 5.2.9, 5.2.11 đúng; 5.2.10, 5.2.12 hiện Giá vốn, Tiền vốn; nút phễu 5.2.12 không còn Đối tượng, 5.2.10 vẫn có; bấm Thịt bò thăn ở 5.2.9 (76.480.000) mở 5.2.10 chỉ còn hàng đó, tổng 76.480.000; 5.2.11 sang 5.2.12 cũng khớp (118.720.000).

## Dở dang, việc tiếp theo

- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel tính năng và thư mục `Present/tools` chỉ máy Trum có.

## Bẫy, quyết định mới

- Không.
