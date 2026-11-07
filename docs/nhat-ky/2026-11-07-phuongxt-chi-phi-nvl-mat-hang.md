# Chi phí NVL trang chủ: bảng mặt hàng, đổi tên, nút Kiểm kê ngay (T768)

- Ngày: 07/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/home/chi-phi-nvl.ts`: thêm `nvlHangKy` tính từng mặt hàng NVL theo số lượng (tồn đầu, mua, tồn cuối theo kiểm kê, sử dụng), giá gần nhất lấy giá trong danh mục NVL. Kiểm kê định kỳ: chi phí = sử dụng × giá gần nhất; số tổng cửa hàng (`nvlCuaHang`) cộng từ mặt hàng nên trang chủ, báo cáo kết quả kinh doanh khớp bảng. Bỏ `tonKiemKe` tính theo tiền. Tồn cuối giữ 35–45% của tồn đầu cộng mua để tồn không phình qua các tháng.
- `src/modules/home/ChiPhiNvl.tsx`: mọi cửa hàng giữ bảng cửa hàng, bấm cửa hàng hoặc chọn cửa hàng ở thanh trên thì ra bảng mặt hàng (thay bảng phiếu mua hàng). Thêm nút xanh Kiểm kê ngay mở `/app/kho/5-1-10/moi`, bỏ ô lọc tháng (tháng lấy từ `?thang=` của trang chủ). Xuất Excel theo bảng đang xem.
- Đổi chữ Giá vốn NVL, Giá vốn nguyên vật liệu thành Chi phí NVL, Chi phí nguyên vật liệu ở thẻ trang chủ web (`BaBaiToanStandard.tsx`), màn chi tiết web, app (`MChiPhiNvl.tsx`), ô Phương pháp tính chi phí NVL ở Thông tin đơn vị (`HeThong.tsx`, `MHeThong.tsx`), ghi chú Danh mục cửa hàng, dòng giải thích thẻ app `MTrangChu.tsx`.
- `MChiPhiNvl.tsx`: thêm nút Kiểm kê ngay dưới dòng phương pháp.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` các file giao diện đã sửa: sạch.
- Mở trình duyệt: tổng bảng mặt hàng khớp thẻ tổng và dòng cửa hàng; bấm cửa hàng ra bảng mặt hàng; nút Kiểm kê ngay khi đang xem tất cả cửa hàng thì hiện hộp Chọn cửa hàng trước (cách app vẫn làm).

## Dở dang, việc tiếp theo

- Không. Điện thoại: bấm một cửa hàng ở màn Chi phí NVL vẫn ra danh sách phiếu mua hàng, chưa đổi sang bảng mặt hàng như web; làm khi người dùng yêu cầu.

## Bẫy, quyết định mới

- Không.
