# Bộ lọc bán hàng như Mua hàng, form hoá đơn thay thế, điều chỉnh (T801)

- Ngày: 12/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: bộ lọc danh sách Bán hàng làm giống Mua hàng. Các ô Cửa hàng, Nguồn, Loại chứng từ, Kênh bán, Phương thức thanh toán, Hàng hoá, Theo dõi tồn kho dùng `ChonHaiCot` có hộp tích, chọn được nhiều. Ô Khách hàng dùng `OChonMot` gõ để tìm.
- Cùng file: thêm ô Loại chứng từ (gói Plus) gồm Xuất bán POS (chứng từ FABi), Xuất bán, Hoá đơn điều chỉnh, Hoá đơn thay thế, Huỷ bán hàng. Ô này hiện sẵn ở thanh lọc.
- `src/ui/generic/ChungTuForm.tsx`: form hoá đơn thay thế, điều chỉnh có khoảng cách hàng 6px, nên hàng Lý do, Email cách đều các ô phía trên. Ô Email lùi 8px cho thẳng cột hoá đơn. Chứng từ Huỷ bán ẩn ô Ghi chú.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy trên bản chỉ có T801, xuất ra thư mục tạm bằng `git checkout-index`. Cả hai không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` Lần đầu báo hết giờ chờ ở tour điện thoại Xuất bán POS, chạy lại thì qua.
- Đo trên trình duyệt: hàng Lý do cách hàng trên 5–6px, ô Email thẳng ô Số hoá đơn. Chứng từ Huỷ bán không còn ô Ghi chú.

## Dở dang, việc tiếp theo

- Không. T802 (nhãn VAT, cột Thao tác) do phiên khác làm cùng thư mục, phần đó còn trên máy, chưa commit.

## Bẫy, quyết định mới

- Không.
