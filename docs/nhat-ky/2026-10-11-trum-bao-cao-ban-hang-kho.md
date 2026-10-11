# Báo cáo bán hàng, kho bổ sung (T157)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code điều phối, worker Claude viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ban-hang/bao-cao.ts`: 3-2-6 Bán hàng theo ngày, 3-2-7 Tổng hợp bán hàng, 3-2-8 Chi tiết bán hàng, lấy dòng món của Xuất bán POS 3.1.1.
- `kho/bao-cao.ts`: 5-2-9 đến 5-2-14 tổng hợp, chi tiết nhập, xuất, hàng trả; số phiếu bấm mở phiếu.
- `kho/TheKho.tsx`: Thẻ kho đọc `?ma=&kho=&ky=`; `XuatNhapTon.tsx` bấm mã hàng mở thẻ kho đã lọc. Bỏ `anTam` của 5.2.1, 5.2.3.
- `ui/bao-cao/ToGiay.tsx`: báo cáo khai `phanTrang` chỉ vẽ 100 dòng của trang đang xem, khung đo chia trang in chỉ vẽ khi in.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `kiem_tra.py --nhanh`: đạt trên bản gộp với T154, T156.
- Đối chiếu tháng 9/2026: tổng hợp nhập = chi tiết nhập = 727.955.000; bán hàng tổng hợp = chi tiết, doanh thu 2.861.830.200.
- Thời gian mở (Playwright, Chrome): 3-2-8 1,17 giây, 101 dòng trên màn hình (trước 6,64 giây, 4.862 dòng). Excel 3-2-8 đủ 2.430 dòng; in 85 trang.

## Dở dang, việc tiếp theo

- Báo cáo kho chưa gồm phiếu điều chuyển: làm sau T155.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD52; QD45 bỏ 5.2.1, 5.2.3 khỏi danh sách ẩn.
- Báo cáo dài chậm do `ToGiay.tsx` vẽ bảng 2 lần (tờ xem và khung đo chia trang in). Đã ghi `docs/BAY.md`.
