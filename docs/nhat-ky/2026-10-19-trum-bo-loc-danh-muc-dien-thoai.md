# Bộ lọc danh mục điện thoại theo kiểu danh sách chứng từ (T440)

- Ngày: 19/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MDanhMuc.tsx`: đổi modal bộ lọc danh mục sang bảng lọc trượt từ đáy lên (`m-loc-tam`) có tay kéo (`m-tam-keo`), nút Đặt lại và Áp dụng; các ô điều kiện Trạng thái và trường danh mục dùng `m-loc-dong`, bấm mở trang con trượt lên (`m-loc-trang-con`) chọn giá trị và có ô tìm kiếm.
- `src/ui/mobile/MLoc.tsx`: thêm tay kéo `m-tam-keo` ở đầu tấm lọc để đồng bộ kiểu dáng.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: xong trong 1.45s, không lỗi.
- `python tools/kiem_tra.py --nhanh` trên cổng 5192: in "Không có lỗi."
- `python tools/kiem_van.py`: 0 ĐỎ.
- Chụp ảnh kiểm tra `backup/T440-loc-danh-muc-360-truoc.png`, `backup/T440-loc-danh-muc-360-sau.png` và `backup/T440-loc-chung-tu-360.png`, không cuộn ngang ở 360px.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
