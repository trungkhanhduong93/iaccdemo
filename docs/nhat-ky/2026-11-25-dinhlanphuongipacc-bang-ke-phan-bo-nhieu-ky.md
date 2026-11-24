# Báo cáo Bảng kê chi phí phân bổ nhiều kỳ (T934)

- Ngày: 25/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Báo cáo mới 10.4.4 ở phân hệ Tổng hợp (gói Plus, Pro): `src/modules/bao-cao/so-bo-sung.ts` (cột, dòng, dòng Tổng cộng), `danh-sach.ts` (bộ lọc Loại thẻ, mở mọi gói như Sổ chi phí), `src/app/plan.ts`, `src/modules/tong-hop/index.ts`.
- Tính số liệu từng dòng chi tiết thẻ: `bangKePhanBo` ở `src/modules/ccdc/the-phan-bo.tsx`, `bangKePhanBoThang` ở `src/modules/ccdc/index.ts`.
- Đã PB tới đầu kỳ, Giá trị đầu kỳ tính tới hết kỳ trước; Số tháng đã PB tính cả tháng đang xem; Số tháng còn lại = Số tháng PB trừ Số tháng đã PB. Chỉ hiện dòng còn giá trị đầu kỳ.
- Dòng có cửa hàng của thẻ, `theoCn: true`: xem tất cả cửa hàng thì có ô lọc Cửa hàng, chọn một cửa hàng ở thanh trên thì chỉ thẻ của cửa hàng đó.

- Tab Báo cáo của phân hệ Chi phí phân bổ: thêm `tong-hop/10-4-4` vào `baoCao` ở `src/modules/ccdc/quy-trinh.ts`, báo cáo mở ngay trong phân hệ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- Mở trên giao diện gói Pro, tháng 9/2026: số cột, dòng tổng, lọc cửa hàng đúng.
- `python tools/kiem_tra.py --nhanh`: báo hết giờ ở bài thử Thẻ kho T870 (`.bc-ban-du-lieu table.tbl`), lỗi này vẫn có khi cất hết thay đổi của việc này, không do việc này. Chưa chạy hết bộ kiểm.

## Dở dang, việc tiếp theo

- Sửa bài thử T870 của `kiem_tra.py` rồi chạy lại cho hết bộ kiểm.
- Chưa làm bản điện thoại cho báo cáo này (`MBaoCaoDong.tsx`).
- Không có mục Loại thẻ tự sinh theo cột nên bộ lọc Loại thẻ khai tay trong `danh-sach.ts`.

## Bẫy, quyết định mới

- Không.
