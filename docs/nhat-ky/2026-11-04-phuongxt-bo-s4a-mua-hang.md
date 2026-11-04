# Bỏ S4a khỏi tab Báo cáo Mua hàng, gọn hàng dưới màn Quy trình (T729, T730)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/mua-hang/quy-trinh.ts`: bỏ `tien/2-2-5` khỏi `baoCao` của sơ đồ Quy trình Mua hàng. Tab Báo cáo của phân hệ lấy thêm báo cáo từ khung này (`cuaPhanHe.ts`), nên Sổ công nợ S4a-DNSN hết hiện ở tab Báo cáo và khung Báo cáo của sơ đồ Mua hàng.
- T730 `src/ui/generic/QuyTrinhScreen.tsx`, hàm `HangDuoi`: bỏ cột Tiện ích liên quan, Thiết lập & Thao tác ở mọi gói. Hàng dưới chỉ còn Danh mục liên quan, dùng sẵn bố cục `qt-hub-grid mot-cot` của gói Free (T121).
- T730 `src/modules/mua-hang/quy-trinh.ts`: bỏ ô Nhận hoá đơn đầu vào (`tien-ich/11-4`) ở làn Hoá đơn, trả lại của sơ đồ Mua hàng, mọi gói.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi (chạy sau mỗi việc).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
