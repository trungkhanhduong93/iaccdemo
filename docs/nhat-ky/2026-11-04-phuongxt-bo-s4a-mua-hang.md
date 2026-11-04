# Bỏ S4a khỏi tab Báo cáo Mua hàng (T729)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/mua-hang/quy-trinh.ts`: bỏ `tien/2-2-5` khỏi `baoCao` của sơ đồ Quy trình Mua hàng. Tab Báo cáo của phân hệ lấy thêm báo cáo từ khung này (`cuaPhanHe.ts`), nên Sổ công nợ S4a-DNSN hết hiện ở tab Báo cáo và khung Báo cáo của sơ đồ Mua hàng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
