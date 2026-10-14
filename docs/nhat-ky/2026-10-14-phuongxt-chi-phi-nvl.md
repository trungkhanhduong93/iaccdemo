# Cách tính chi phí NVL theo chi nhánh, cột Tổng tiền cố định (T232, T239)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/chi-phi-nvl.ts` (mới): 3 cách tính chi phí NVL, lịch đổi cách theo chi nhánh áp dụng từ tháng đầu chưa khoá sổ, món bán trong kỳ, giá thành iPOS Inventory, giá thành nhập tay, NVL tiêu hao (xuất huỷ + xuất điều chỉnh − nhập điều chỉnh), phiếu nhập mua.
- `src/app/session.tsx`: thêm `cachNvl`, `giaThanhTay` theo đơn vị.
- `src/modules/danh-muc/DanhMucChiNhanh.tsx`: gói Free có cột Cách tính chi phí NVL, đổi thì hỏi xác nhận.
- `src/modules/home/ChiPhiNvl.tsx` (mới, `trang-chu/chi-phi-nvl`): bảng mọi chi nhánh; chi tiết theo cách tính (iPOS Inventory hai tab, lọc loại phiếu ở tab tiêu hao; nhập tay gõ giá, nhập, xuất Excel; nhập mua liệt kê phiếu). `excel-gia-thanh.ts` đọc, ghi file mẫu giá thành.
- `BaBaiToanFree.tsx`, `tong-hop/BaoCaoTaiChinh.tsx`: Chi phí NVL gói Free tính theo cấu hình; thẻ, dòng Chi phí NVL mở màn mới. Câu hỏi cột Thu chi đổi Tồn quỹ hiện tại, cuối tháng.
- `src/app/tuTrangChu.ts` (mới), `ModuleTabs.tsx`, `bao-cao/ThanhChon.tsx`: màn mở từ trang chủ có nút Trang chủ.
- `src/ui/xuatBangExcel.ts` (mới), `NutXuatExcel` trong `CongCuDs.tsx`: nút xuất Excel ở Chi phí NVL, Chi phí trong tháng, Lịch sử thu chi.
- T239: `VoucherScreen.tsx`, `ChungTuBanHang.tsx`, `PhieuSanXuat.tsx` cột Tổng tiền `dinh: 'phai'`.
- `app.css`: mục cuối T232.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` các file giao diện đã sửa: Sạch.
- Trình duyệt: đổi cách tính ở Danh mục chi nhánh, nhập giá thành (992 × 28.000 = 27.776.000), nhập Excel 3 món bỏ 1 mã lạ (tổng 181.036.000), KQKD tháng 8 đã khoá giữ số cũ, nút Trang chủ ở KQKD và Mua hàng, lọc Xuất huỷ (4 phiếu, 35.191.000), cột Tổng tiền đứng yên khi cuộn danh sách Thu chi, 4 nút xuất Excel tạo file.
- Chưa kiểm bản điện thoại (`kiem_tra.py --dien-thoai`): màn Chi phí NVL chưa có bản điện thoại, ghi T242.

## Dở dang, việc tiếp theo

- Không. Việc nối tiếp: T242 bản điện thoại màn Chi phí NVL. Giá trị phiếu xuất huỷ mẫu lớn nên chi phí NVL iPOS Inventory có tháng gần 50% doanh thu; muốn giảm thì sửa dữ liệu mẫu xuất huỷ (dùng chung màn kho), hỏi Trum trước.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD58 cách tính chi phí NVL theo chi nhánh.
- `docs/KIEN-TRUC.md`: quy ước nút Trang chủ và nút xuất Excel cho màn mở từ trang chủ.
