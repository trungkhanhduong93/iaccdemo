# Hướng dẫn Kê khai thuế: điền mã số thuế là xong (T138)

- Ngày: 30/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn chờ góp ý)

## Đã làm

- `src/modules/home/HuongDan.tsx`: nút bước 3/3 tour Trang chủ đổi từ "Mở Kê khai thuế" thành "Cập nhật nhanh thông tin mã số thuế".
- `src/modules/home/HuongDan.tsx`: `GoiYKeKhai` bỏ bong bóng "Thông tin kê khai đã xong, giờ lập tờ khai". Khai xong loại hình, mã số thuế thì về Trang chủ khen "thông tin kê khai thuế đã sẵn sàng", kết thúc hướng dẫn. Bỏ props `onLap`, `chon` ở `ToKhaiHKD.tsx`, `MToKhaiHKD.tsx`.
- `src/modules/onboarding/KhoiTaoFabi.tsx`: nút "Bắt đầu kết nối dữ liệu" bỏ chữ "(chỉ mất 30 giây)".
- `src/modules/onboarding/OnboardFabi.tsx`: popup Kê khai thuế mở ra đặt sẵn `cnChinh` là cửa hàng đầu tiên đã kết nối, vẫn bấm Chính ở dòng khác để đổi.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` hai file đã sửa: 0 ĐỎ.
- Chưa bấm thử trên trình duyệt đúng luồng điền mã số thuế rồi về Trang chủ.

## Dở dang, việc tiếp theo

- PhuongXT xem bản online luồng hướng dẫn Kê khai thuế mới. Bước phiếu chi vẫn chờ Trum (T552).

## Bẫy, quyết định mới

- Không.
