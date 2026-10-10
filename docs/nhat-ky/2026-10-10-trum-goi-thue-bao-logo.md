# Thiết kế lại màn hình Gói thuê bao và bộ logo nhận diện 4 gói (T119)

- Ngày: 10/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/GoiLogo.tsx`: Tạo bộ nhận diện vector SVG cho 4 gói Free, Standard, Plus, Pro với dải màu gốc, gradient đa tầng, viền phản quang và bóng đổ phát quang. Biểu tượng vector riêng cho từng gói: Cánh lá mầm (Free), Chiếc khiên chuẩn hoá (Standard), Ngôi sao tăng trưởng 4 cánh (Plus), Vương miện hoàng gia (Pro).
- `src/ui/Page.tsx`: Cập nhật component `Pk` hỗ trợ prop `logo` tuỳ chọn nhúng icon SVG, nâng cấp gradient cho nhãn gói toàn ứng dụng.
- `src/modules/he-thong/GoiThueBao.tsx`: Thiết kế lại toàn bộ màn hình Gói thuê bao theo chuẩn SaaS cao cấp: Thẻ hiện trạng bản quyền (Hero Banner) với logo 52px glow, tên đơn vị, MST, chế độ kế toán, hạn dùng; bộ chọn chu kỳ Năm / Tháng với badge Tiết kiệm 20%; 4 thẻ gói dịch vụ chuẩn hoá phân khúc F&B, bảng giá, CTA nâng cấp/chuyển gói, tiến độ tính năng mini, danh sách 5 tính năng cốt lõi; bảng ma trận so sánh 120 tính năng có tìm kiếm thời gian thực, lọc khác biệt và highlight cột gói đang dùng; khối FAQ giải đáp thắc mắc và modal xác nhận chuyển gói đồng bộ chế độ kế toán.
- `src/modules/he-thong/HeThong.tsx`: Tách và xuất `GoiThueBao` từ module `GoiThueBao.tsx`.
- `src/styles/app.css`: Thêm mục CSS cho Gói thuê bao và Logo 4 gói (T119) ở cuối file.
- `docs/QUYET-DINH.md`: Bổ sung quyết định QD44.
- `CHANGELOG.md`: Thêm dòng T119 cho ngày 10/10/2026.

## Đã kiểm

- `npm run typecheck`: Không có lỗi.
- `npm run build`: Chạy xong 663ms, không có lỗi.
- `python tools/kiem_tra.py --nhanh`: 241 lượt mở màn, in dòng `Không có lỗi.`.
- `python tools/kiem_van.py`: GoiThueBao.tsx, GoiLogo.tsx, Page.tsx, CHANGELOG.md sạch, 0 ĐỎ, 0 VÀNG.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD44 trong `docs/QUYET-DINH.md`.
