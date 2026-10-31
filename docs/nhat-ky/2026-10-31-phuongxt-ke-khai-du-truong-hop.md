# Thông tin kê khai thuế đủ trường hợp, báo gói cao hơn (T704)

- Ngày: 31/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `OnboardFabi.tsx`, hộp Thông tin kê khai thuế: hộ kinh doanh hiện lại đủ nhóm 1 tới 4; nhóm 2 chọn được theo % doanh thu hoặc theo lợi nhuận. Doanh nghiệp chọn riêng thuế GTGT (trực tiếp, khấu trừ) và thuế TNDN (theo % doanh thu, theo lợi nhuận), đủ 4 trường hợp TT58 (trường `gtgt`, `tndn` trong `Nhap`).
- Cùng file: chọn ngoài phần gói đang dùng kê khai được (`keKhaiDuoc`) thì hiện Note vàng "Gói Plus, Pro mới đáp ứng". Gói Standard bấm Hoàn tất vẫn lưu doanh nghiệp theo % doanh thu; gói khác lưu đúng `ppGtgt`, `ppTndn` đã chọn.
- Hộp thu gọn: lớp `ktf-gon` (mục cuối `app.css`), card padding nhỏ hơn, ô MST và tên đơn vị chung một hàng. Doanh nghiệp vừa màn cao 880px (739px).
- `HeThong.tsx`, `MHeThong.tsx` (Thông tin đơn vị): gói Standard chọn được đủ nhóm, mọi phương pháp thuế GTGT, TNDN, có cảnh báo gói như trên. Đơn vị còn `choKeKhai` thì Loại hình hiện "Chưa thiết lập", các ô thuế để trống; chọn loại hình rồi Lưu thì bỏ `choKeKhai`.
- `ToKhaiHKD.tsx`: nút Thiết lập thông tin chuyển sang Hệ thống, Thông tin đơn vị. Nhãn Bổ sung MST giữ như cũ (PhuongXT chốt).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `OnboardFabi.tsx`, `HeThong.tsx`, `MHeThong.tsx`, `ToKhaiHKD.tsx`: sạch.
- Trình duyệt: hộp kê khai doanh nghiệp đủ 4 lựa chọn, cảnh báo đúng; Thông tin đơn vị trống khi chưa khai (web, điện thoại); nút Thiết lập thông tin mở Thông tin đơn vị.

## Dở dang, việc tiếp theo

- Không. Hộ kinh doanh có cửa hàng, kênh bán vẫn cao 938px ở màn 880px. Thử chọn nhóm bằng sổ danh sách không đủ nên trả lại thẻ cũ. Muốn vừa một trang thì gọn phần cửa hàng, kênh bán.

## Bẫy, quyết định mới

- Không.
