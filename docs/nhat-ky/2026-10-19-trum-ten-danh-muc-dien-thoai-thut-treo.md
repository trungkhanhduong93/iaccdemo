# Tên dài danh mục điện thoại thụt treo (T442)

- Ngày: 19/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Tách số thứ tự thành cột riêng (`.m-the-dm-v2-stt`) với `flex: none`, gom tên và mã vào khối riêng (`.m-the-dm-v2-khoi-ten`) trong `src/ui/mobile/MDanhMuc.tsx`.
- Thêm CSS thụt treo tại `src/styles/app.css`: tên và mã xuống dòng thẳng hàng với chữ đầu tiên của tên, không chui dưới số thứ tự.
- Giới hạn tên tối đa 2 dòng (`-webkit-line-clamp: 2`), quá 2 dòng tự động cắt `…`, mã giữ cùng khối với tên.
- Chụp ảnh trước/sau kiểm tra tại `backup/T442-ncc-360-truoc.png` và `backup/T442-ncc-360-sau.png`.

## Đã kiểm

- `npm run typecheck`: chạy xong, không có lỗi.
- `npm run build`: chạy xong, không có lỗi.
- `python tools/kiem_tra.py --nhanh` (port 5192): không có lỗi.
- `python tools/kiem_van.py`: 0 ĐỎ.
- Playwright: kiểm tra trên khung 360px danh mục Nhà cung cấp / Đối tượng (`#/app/danh-muc/1-5`), tên dài xuống dòng thẳng lề, thụt treo chuẩn, không cuộn ngang.

## Dở dang, việc tiếp theo

- Không. Làm tiếp T432.

## Bẫy, quyết định mới

- Không.
