# Kế hoạch giao diện điện thoại, phần còn lại (đợt 11–13)

Lập ngày 14/10/2026, sau đợt 10 (T202–T204). Rà bằng `manMobile()` trên mọi màn của `MODULES`: 54 màn còn ra `MChiMayTinh`, thêm 4 loại phiếu chưa lập được trên điện thoại.

## Chỉnh giao diện đang có (T208)

1. Trang chủ bỏ thanh trên chung (logo ACCOUNTING, chọn chi nhánh) để giống IVT. Chip "Kho: Tất cả" ở trang chủ đổi thành chọn chi nhánh và kho.
2. Kính lúp tìm cả báo cáo, không chỉ màn nghiệp vụ.
3. Bảng sổ (`MSoBaoCao`) gọn hơn: chữ 13px, đệm ô 8px, dòng tổng in đậm nền nhạt, dòng xen kẽ màu.
4. Mọi màn có đệm đáy đủ để thanh dưới nổi không che dòng cuối.
5. Danh sách chứng từ: chip trạng thái và chip loại phiếu cuộn ngang một hàng, không xuống dòng.

## Màn còn thiếu

| Mã | Màn | Cách làm | Đợt |
|---|---|---|---|
| T190 | Màn tác vụ `kind: 'tool'` (2.1.3, 5.1.7, 5.1.8, 7.1.3, 9.1.1, 9.1.2, 10.1.2, 10.1.5, 10.1.7–10.1.9, 11.3, 11.8–11.10, 11.12–11.15, X1, X3), Kiểm tra cuối kỳ 10.1.4, Khoá sổ 10.1.6 | Một màn chung `MTacVu`: mô tả, chọn kỳ, các tuỳ chọn, nút Thực hiện dính đáy, kết quả | 11 |
| T210 | Sơ đồ quy trình của 11 phân hệ (`kind: 'quytrinh'`) | Danh sách bước dọc, mỗi bước một thẻ có số thứ tự, bấm mở màn | 11 |
| T191 | Hệ thống: Người dùng, Vai trò và phân quyền, Nhật ký thao tác, Gói thuê bao, Thông tin đơn vị, Cấu hình kế toán | Danh sách thẻ, form nổi từ đáy như `MFormDm` | 11 |
| T187 | Danh mục tài khoản 1.1, Danh mục chi nhánh | Tài khoản: cây thu gọn theo cấp, ô tìm. Chi nhánh: thẻ như `MDanhMuc` | 11 |
| T209 | Lập phiếu kiểm kê, điều chỉnh, sản xuất, điều chuyển | Mở rộng các bước của `MLapPhieu` | 12 |
| T186 | Xuất bán POS 3.1.1 | Danh sách đơn theo ngày dạng thẻ, xem chi tiết đơn | 12 |
| T188 | Công thức sơ chế 5.1.5, chế biến 9.1.3 | Danh sách công thức, xem thành phần định lượng | 12 |
| T189 | Số dư ban đầu (`tien/so-du-ban-dau`, 10.1.3) | Tab Tiền, Công nợ, Tồn kho; danh sách thẻ, sửa số dư bằng form nổi | 12 |
| T192 | Tiện ích 11.4–11.7, 11.16, X2 | Danh sách thẻ, xem chi tiết. 11.11 thiết kế mẫu in giữ chỉ máy tính | 13 |
| T208 | Chỉnh giao diện đang có (mục trên) | | 13 |

## Chia việc

- Mỗi đợt hai anti làm song song, không sửa chung file. Anti B (WSL) không chạy được npm. Anti A (Windows) tự chạy typecheck.
- `manMobile.ts` mỗi anti chỉ thêm luật ở dòng mốc của mình. `app.css` mỗi anti thêm một mục riêng cuối file, một lần sửa ở cuối việc.
- Claude soát diff, so tên lớp CSS với `.tsx`, chạy `kiem_tra.py --nhanh`, `--dien-thoai`, xem ảnh 390px rồi push sau mỗi đợt.

| Đợt | Anti B | Anti A |
|---|---|---|
| 11 | T190, T210 | T191, T187 |
| 12 | T209 | T186, T188, T189 |
| 13 | T208 | T192 |
