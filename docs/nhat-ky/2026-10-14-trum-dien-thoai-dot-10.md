# Điện thoại đợt 10: sổ quỹ dạng bảng, báo cáo cuộn tự do, trang chủ theo IVT (T202–T204)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối, kiểm và sửa; Anti B (Antigravity WSL) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- T202: trên điện thoại, Sổ quỹ tiền mặt (2.2.1) mở bằng `MSoBaoCao` như Sổ ngân hàng: chip Thời gian, Kho/CN, ô lọc dòng, bảng cuộn. `manMobile.ts` thêm luật riêng cho 2.2.1. Dữ liệu lấy từ `soQuyCn` của `src/modules/tien/SoQuy.tsx` (nay export), gộp nhiều chi nhánh bằng `gopSo`. Bản máy tính vẫn dùng `SoQuy`.
- T203: báo cáo trên điện thoại bỏ cột ghim trái và tiêu đề dính, khung bảng cuộn tự do hai chiều. Bỏ đoạn đo cột `--m-cot1-w` trong `MSoBaoCao.tsx`.
- T204: `MTrangChu.tsx` theo bố cục IVT: đầu trang nền vàng kem, logo có nhãn gói, tên đơn vị, vai trò, khối kính lúp và chuông có số; tab viên thuốc "Quản trị | Cần theo dõi", chip "Kho: Tất cả". Tab Quản trị có các thẻ Thao tác nhanh, Tổng quan tài chính, Tổng tồn kho (hết hàng, dưới ngưỡng, vượt ngưỡng). Tiếp theo là Chi phí nguyên vật liệu tháng, Tỷ lệ chi phí nguyên vật liệu theo năm, Tỷ lệ tồn tại các kho.
- `app.css` mục `Điện thoại: sổ quỹ dạng bảng, báo cáo cuộn tự do, trang chủ theo IVT (T202–T204)`, mọi luật trong `@media (max-width: 767px)`.
- `tools/kiem_tra.py --dien-thoai`: hàm `kiem_tra_dot_10` kiểm trang chủ, sổ quỹ dạng bảng và lọc dòng, cuộn ngang và dọc Sổ ngân hàng không ghim.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai` (cổng 5181): Không có lỗi.
- Sổ quỹ ở điện thoại: 179 dòng, gõ "Thu" còn 92. Cuộn khung Sổ ngân hàng 300px ngang và dọc, ô đầu và tiêu đề trôi đúng 300px.
- Xem ảnh 390px trang chủ đầu và cuối, Sổ quỹ, Sổ ngân hàng.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Thẻ "Hao hụt nguyên vật liệu" của IVT chưa làm vì dữ liệu giả chưa có hao hụt.
- Trang chủ vẫn còn thanh trên của khung điện thoại (logo ACCOUNTING, chọn chi nhánh) phía trên đầu trang mới. Ảnh IVT không có thanh này. Muốn bỏ thì sửa `MobileShell.tsx`, cần Trum chốt vì mất chỗ chọn chi nhánh ở trang chủ.

## Bẫy, quyết định mới

- Anti B chép nguyên hàm sinh dữ liệu sổ quỹ vào `MSoBaoCao.tsx` vì spec cấm sửa file `tien/`. Claude export hàm gốc và xoá bản chép, để hai bản không lệch số về sau.
- Trang điện thoại cuộn trong `main.m-than`, khung báo cáo cuộn trong `.m-sbc-bang-wrap`, không phải `window`. Bước kiểm gọi `window.scrollTo` sẽ không cuộn gì mà vẫn chụp ảnh như đã cuộn.
