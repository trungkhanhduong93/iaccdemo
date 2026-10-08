# Cải tiến chân quy trình, nút cột tài khoản, chiều cao dòng bảng và dọn nút thu gọn (T46)

- Ngày: 09/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/LocCot.tsx`: Thêm xử lý mở date picker trực tiếp khi click vào ô input lọc ngày hoặc icon lịch, đồng bộ 2 chiều giữa định dạng `dd/mm/yyyy` và `input[type="date"]`.
- `src/ui/LocNangCao.tsx`: Thiết kế lại hộp Tuỳ chỉnh cột hiển thị & Đóng băng theo đúng thiết kế ảnh: icon 3 cột dọc, badge số lượng, nút Hiện tất cả, khối mô tả hướng dẫn kèm icon minh hoạ, nút đóng băng trái/phải cho từng cột, switch toggle on/off, các nút "Khôi phục mặc định", "Độ rộng tự động" và "Xong".
- `src/ui/generic/QuyTrinhScreen.tsx`: Thiết kế lại khu vực bổ trợ dưới sơ đồ quy trình thành lưới 3 khối trực quan (Danh mục nghiệp vụ, Tiện ích phân hệ, Thiết lập & Hướng dẫn).
- `src/ui/generic/ChungTuForm.tsx`: Thiết kế lại nút bật/tắt cột tài khoản dạng pill sáng rõ nét, có badge trạng thái "Đang hiện" / "Đang ẩn", không còn bị chìm tối.
- `src/ui/Table.tsx`: Thêm dòng trống `tr.tbl-spacer` ở cuối `tbody` để hấp thụ khoảng trống thừa của bảng khi danh sách có ít dòng.
- `src/styles/app.css`: Sửa CSS để `tr.tbl-spacer` tự dãn và các dòng dữ liệu cố định chuẩn 36px đồng đều; thêm style cho `.btn-tk-toggle`, `.qt-hub-grid`, `.ds-hop-cot`, `.ds-btn-freeze`.
- `src/ui/generic/VoucherScreen.tsx`, `src/modules/ban-hang/ChungTuBanHang.tsx`: Xoá nút thu gọn cạnh nút Thêm mới ở thanh danh sách; truyền thêm `dongBang` và `onDoRongTuDong` vào `NutTuyChinhCot`.

## Đã kiểm

- `npm run typecheck`: Xong, không lỗi.
- `npm run build`: Xong, tạo bundle dist sạch.
- `python -X utf8 tools/kiem_tra.py --nhanh`: 208 lượt mở màn, in "Không có lỗi."
- `python -X utf8 tools/kiem_van.py`: 5 file đều sạch.

## Dở dang, việc tiếp theo

- Đang giữ commit trên máy, chưa push remote theo đúng yêu cầu Trum ("làm xong khoan push").

## Bẫy, quyết định mới

- Không.
