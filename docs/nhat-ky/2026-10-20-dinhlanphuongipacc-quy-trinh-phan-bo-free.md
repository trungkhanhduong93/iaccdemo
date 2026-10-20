# Quy trình chi phí phân bổ gói Free (T514)

- Ngày: 20/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ccdc/quy-trinh.ts` (`buocKyFree`): ô Thẻ CPPB dư đầu kỳ mở `ccdc/8-1-1?moi=dau` (form ghi tăng đầu kỳ); Chi tiền mặt, Chi ngân hàng thành ô nhỏ (`nho`), bỏ mô tả; giai đoạn 2 thêm nhóm "Chưa chi tiền cần ghi nhận chi phí trả trước" có ô Thẻ chi phí phân bổ mở `ccdc/8-1-1?moi=the`; giai đoạn 3 đổi tên ô thành Quản lý thẻ chi phí phân bổ, mở danh sách thẻ.
- `src/modules/types.ts`: `NutKyQT.nho`, `BuocKyQT.nhom` (kiểu `NhomKyQT`).
- `src/ui/generic/QuyTrinhScreen.tsx`: `gomHangNho` gom ô nho liền nhau thành 1 hàng; vẽ `nhom` dưới các ô chính, trên ghi chú; lọc gói áp cả ô trong nhóm.
- `src/styles/app.css`: mục cuối file T514 (`.qt-ky-hang-nho`, `.qt-ky-nhom`).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở trình duyệt gói Free, màn Quy trình chi phí phân bổ: bố cục đúng layout đã duyệt; 5 ô trỏ đúng đường dẫn; bấm Thẻ CPPB dư đầu kỳ mở form Thêm thẻ chi phí phân bổ dư đầu kỳ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
