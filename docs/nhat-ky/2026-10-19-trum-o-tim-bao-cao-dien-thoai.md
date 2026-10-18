# Ô tìm kiếm báo cáo điện thoại cách đều và cùng kiểu danh sách (T443)

- Ngày: 19/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/styles/app.css`: thêm mục CSS cho T443 ở cuối file; chỉnh `.m-sbc-tim-hang` padding 8px 12px (cách đều trên dưới 8px, không còn dính sát viền thanh kỳ/chip lọc); đổi ô tìm kiếm `.m-ds-tim-inp` sang nền `#f1f5f9`, viền trong suốt, bo góc 8px, cao 38px, focus viền xanh nền trắng đồng bộ với phong cách danh sách điện thoại (T434); căn chỉnh icon kính lúp và nút xóa.
- `src/ui/mobile/MToGiay.tsx`: bổ sung ô tìm kiếm `.m-sbc-tim-hang` cho các màn tờ giấy (Nhập xuất tồn, Thẻ kho, KQKD). Kết nối state `q` lọc danh sách dòng và phân trang bảng.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: xong trong 1.20s, không lỗi.
- `python tools/kiem_tra.py --nhanh` trên cổng 5193: in "Không có lỗi."
- `python tools/kiem_van.py src/ui/mobile/MToGiay.tsx`: 0 ĐỎ.
- Chụp ảnh kiểm tra trước/sau 360px cho 3 báo cáo: `backup/T443-bang-ke-mua-hang-360-sau.png`, `backup/T443-s1a-hkd-360-sau.png`, `backup/T443-nhap-xuat-ton-360-sau.png`. Khoảng cách trên dưới đều (8px), kiểu dáng bo tròn nền xám, không cuộn ngang ở 360px.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
