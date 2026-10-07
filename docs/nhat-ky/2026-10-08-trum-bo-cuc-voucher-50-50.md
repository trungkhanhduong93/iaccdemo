# Bố cục danh sách chứng từ 50/50 một trang, sửa chi tiết phiếu và điều hướng (T24)

- Ngày: 08/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: thêm padding 14px 16px cho card thông tin chung 3 cột (Đối tượng, Diễn giải, Ngày chứng từ), chấm dứt hiện tượng chữ và ô nhập bị dính sát viền card.
- `src/ui/generic/ChungTuForm.tsx`: nút Trước và Sau khi chuyển phiếu dùng `{ replace: true }` để không dồn tích vào lịch sử trình duyệt, bấm Esc hoặc Đóng sẽ thoát ngay màn hình thay vì lùi lại từng phiếu cũ.
- `src/styles/app.css`: định nghĩa lớp `.btn-group` cho cụm nút Trước / Sau liền khối, đồng bộ chiều cao 28px, min-width 76px, bo góc ngoài, ngăn vạch mỏng ở giữa.
- `src/styles/app.css`: thêm lớp `.page-voucher`, `.voucher-split`, `.voucher-top`, `.voucher-bottom` cố định chiều cao 100%, không cuộn toàn trang web.
- `src/ui/generic/VoucherScreen.tsx`: tái cấu trúc `VoucherList` theo bố cục 50/50 master-detail: nửa trên 50% là danh sách chứng từ có bộ lọc, bảng cuộn độc lập và phân trang cố định; nửa dưới 50% là khung chi tiết chứng từ (Hàng tiền, Hạch toán, Khác) cuộn độc lập, bấm dòng ở trên là đổi ngay ở dưới.
- `src/ui/generic/VoucherScreen.tsx`, `src/styles/app.css`: bỏ 3 thẻ stat tổng hợp trên đầu danh sách chứng từ để tối đa hoá diện tích chiều dọc cho bảng danh sách phiếu.

## Đã kiểm

- `npm run typecheck`: sạch, không có lỗi.
- `npm run build`: thành công trong 775ms.
- `python -X utf8 tools/kiem_tra.py --nhanh`: đã kiểm tra 207 lượt mở màn, in "Không có lỗi."
- `python -X utf8 tools/kiem_van.py`: cả 3 file code và tài liệu đều sạch.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Bẫy: khi điều hướng giữa các thực thể liên tiếp trong cùng một form (Trước / Sau), bắt buộc dùng `navigate(..., { replace: true })`, tránh làm người dùng phải bấm Esc / Back nhiều lần mới thoát khỏi form.
