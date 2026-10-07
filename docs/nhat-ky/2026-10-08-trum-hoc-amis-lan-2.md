# Quét AMIS lần 2, sửa danh sách vỡ, thêm thẻ tổng hợp, phân trang, chức năng nhanh (T21, T22, T23)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code quét AMIS và điều phối, Antigravity viết code (2 worker)
- Trạng thái cuối phiên: Xong

## Đã làm

- Quét AMIS (tài khoản IPOS Demo) bằng Chrome mở cổng điều khiển, hồ sơ ở `D:\IACC-CLOUD\.chrome-amis`, chỉ xem. Đã xem: Tổng quan, Quy trình các phân hệ, Thu chi tiền, Danh sách khách hàng, Danh mục, Số dư ban đầu, Báo cáo, Quản lý hoá đơn, form phiếu thu ở chế độ xem.
- T21: danh sách chứng từ vỡ bố cục từ T15. Hàng đang chọn mang lớp `sel`, trùng lớp `.sel` của ô chọn, nên hàng thành flex. Đổi thành `dang-chon` ở `Table.tsx`, `VoucherScreen.tsx`, `app.css`. Ghi bẫy vào `docs/BAY.md`.
- T22, `VoucherScreen.tsx`: 3 thẻ tổng hợp trên đầu danh sách, tính từ chính các dòng đang lọc (thu chi: Tổng thu, Tổng chi, Chênh lệch; mua bán: Tổng tiền, Chưa thanh toán, Chưa ghi sổ). Phân trang 20, 50, 100 dòng (`src/ui/PhanTrang.tsx`). Nút Cột để ẩn hiện cột, nhớ theo màn trong localStorage.
- T22, `Table.tsx`: prop `motDong` giữ ô một dòng, rê chuột xem đủ chữ. Bật cho danh sách chứng từ và mọi danh mục.
- T22, `app.css`: thêm lớp `pt-*`, `.tbl.mot-dong`, và `.icon-btn.sm` 28px. Lớp `icon-btn sm` đã dùng ở 4 chỗ nhưng trước đây chưa có CSS, nên các nút ba chấm trong bảng nhỏ lại từ 34px còn 28px.
- T23, `CatalogScreen.tsx`, `types.ts`: cấu hình `chucNang` thêm cột Chức năng đứng yên bên phải, `nhanLoc` đặt nhãn ô lọc. Đối tượng có Lập hoá đơn, Thu tiền, Lập phiếu mua, Trả tiền, Chi tạm ứng, Xem công nợ. Hàng hoá, kho có xem thẻ kho, tồn kho, điều chuyển.
- T23, `src/modules/tong-hop/SoDuBanDau.tsx`: số dư ban đầu 10.1.3 mở đầu bằng 4 thẻ (tài khoản, công nợ khách hàng, công nợ nhà cung cấp, tồn kho), bấm thẻ ra bảng có dòng tổng. Logic tách số dư giữ nguyên từ T18.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: xong, còn cảnh báo gói JS 500 kB cũ (T13).
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `kiem_van` 5 file giao diện: sạch.
- Chụp gói Free, Medium, Advance cho 2.1.1, 1.5, 10.1.3, 4.1.1 và form mới: thẻ tổng hợp 2.1.1 là 362.070.000 − 213.603.000 = 148.467.000, đúng. Thẻ số dư tài khoản Nợ bằng Có 4.132.890.000.
- Chưa kiểm ở màn hẹp hơn 1440px.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Ghi `docs/BAY.md`: lớp CSS ngắn dễ đụng nhau, `.sel` làm vỡ bảng.
- Cố ý không làm, chờ Trum chốt nếu muốn:
  - Menu bay ra khi rê chuột lên sidebar như AMIS, vì ngược lý do của QD09.
  - Ghim tính năng hay dùng và trung tâm báo cáo chung, vì QD08 ghi cố ý chưa làm.
  - Thẻ công nợ trên danh mục đối tượng, vì phải nối `so-cai.ts` mới khớp số.
