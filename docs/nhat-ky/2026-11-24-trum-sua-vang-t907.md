# Sửa điểm VÀNG sau T907, mã công thức bấm được, tiêu đề 2 tầng (T908)

- Ngày: 24/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `kho/san-xuat.ts` `keoNvlCb`: thành phẩm ghi ĐVT của công thức khi công thức có ĐVT riêng. Trà đào ở Xuất chế biến giờ làm theo Bình, đúng với định lượng.
- `danh-muc/data.ts`: thêm ĐVT Bình vào danh mục ĐVT.
- Xuất kho định lượng, chi tiết: mã công thức bấm được, mở đúng công thức chế biến. Gói Plus mở ở Danh mục, gói Pro mở ở Kho. Dữ liệu phiếu thêm `ctId`.
- `app.css` mục T908: bảng tiêu đề 2 tầng trong form toàn màn tô hai hàng cùng màu, ô trống trên cột lẻ bỏ kẻ dưới. Cột #, Ghi chú, Xử lý liền một khối. Áp cho mọi bảng 2 tầng trong form.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` hai file đã sửa: 0 ĐỎ, 3 VÀNG là chuỗi SVG cũ.
- Chụp gói Plus phiếu XDL2610-0155: tiêu đề liền khối, dòng tổng không thành link. Bấm CTCB008 mở `#/app/danh-muc/cong-thuc-che-bien/cb8`.
- Chưa chụp Xuất chế biến với Trà đào theo Bình.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
