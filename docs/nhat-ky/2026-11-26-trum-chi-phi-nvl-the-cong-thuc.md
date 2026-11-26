# Màn Chi phí NVL tháng kiểu thẻ công thức (T944)

- Ngày: 26/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Thêm `src/modules/home/TheCongThucNvl.tsx`: hàng thẻ Tồn đầu kỳ + Mua trong tháng − Tồn cuối kỳ = Chi phí NVL. Thẻ cuối nền cam, số to, thanh % trên doanh thu. Cách tính Tổng chi phí mua hàng chỉ có Mua trong tháng = Chi phí NVL. Dùng chung máy tính, điện thoại.
- Thẻ chỉ cộng cửa hàng đã tính được chi phí. Có cửa hàng chưa kiểm kê thì bốn số vẫn khớp công thức, thẻ cuối ghi "Chưa gồm N cửa hàng chưa kiểm kê".
- `ThanhTyLeNvl`, `mucTyLeNvl`: thanh tỷ lệ tô màu, dưới 35% xanh, 35–40% vàng, trên 40% đỏ. Ngưỡng do Claude đặt mặc định, Trum chưa chốt.
- `ChiPhiNvl.tsx`: thay thẻ tổng một dòng bằng thẻ công thức; cột Tỷ lệ trên doanh thu có thanh cạnh số, cả dòng Cộng.
- `MChiPhiNvl.tsx`: thay thẻ tổng bằng thẻ công thức xếp dọc, dấu phép tính ở mép trái; dòng cửa hàng có thanh tỷ lệ.
- CSS mục "Chi phí NVL: thẻ công thức, thanh tỷ lệ trên doanh thu (T944)" cuối `app.css`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `kiem_van.py` 3 file tsx: Sạch.
- Playwright gói Standard, tháng 10: máy tính 4 thẻ, 5 thanh tỷ lệ (thẻ chính, 3 cửa hàng, dòng Cộng); điện thoại 4 thẻ, 4 thanh. Không lỗi trang. Xem ảnh máy tính, điện thoại.
- `python tools/kiem_tra.py --nhanh`: dừng ở mục Thẻ kho (T933, có sẵn trên `main`). Các mục trước không báo lỗi.
- Chưa xem ca có cửa hàng chưa kiểm kê (tháng đã qua) bằng mắt.

## Dở dang, việc tiếp theo

- Không. Trum muốn đổi ngưỡng màu thì sửa `mucTyLeNvl` trong `TheCongThucNvl.tsx`.

## Bẫy, quyết định mới

- Lớp `.tot` đã có sẵn trong `app.css` (khung tổng tiền). Đặt tên lớp mức màu là `nvl-tl-tot`, đừng dùng `tot` trần.
