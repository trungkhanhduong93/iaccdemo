# Điện thoại, danh sách thẻ chi phí: Kỳ số liệu theo tháng, số phân bổ tháng này (T645)

- Ngày: 23/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Dựng mẫu giao diện, người dùng đã duyệt bản 6: https://claude.ai/artifact/5bcpuN8Ht3kxY5J2rGfAk4 (riêng tư, chủ là dinhlanphuongipacc).
- Chưa sửa code. Đặc tả đã chốt nằm ở mục dưới.

## Đã kiểm

- Không có code để kiểm.

## Dở dang, việc tiếp theo

Sửa `src/ui/mobile/MCcdc.tsx` (khúc danh sách, `list`, `kyHienTai`, `locVal`) và `src/ui/mobile/MLoc.tsx`. CSS mới gom cuối `src/styles/app.css`, mục T645. Trum đang giữ `MCcdc.tsx`, `app.css` ở T642, T552: ai push sau gộp tay.

1. Bộ lọc giữ như các danh sách khác (tấm `MLoc`: mỗi dòng một ô có viền, nút Đặt lại, Áp dụng dính đáy). Chỉ đổi:
   - Dòng Thời gian thành **Kỳ số liệu**, bấm thì chọn **tháng** thay vì chọn khoảng ngày. Mở tấm trượt "Chọn kỳ số liệu" kiểu `MChon`, liệt kê **12 tháng của năm tài chính hiện tại** (`dsKyNam(s)` trong `src/app/session.tsx`). Tháng hiện tại có chữ phụ "Tháng hiện tại". Mặc định là tháng hiện tại (hiện code để cứng `kyHienTai = 202610`).
   - Thêm dòng công tắc **Ẩn thẻ hết phân bổ**, mặc định bật, như web (`src/modules/ccdc/index.ts:106`: giữ thẻ có `kyNay > 0 || con > 0`).
   - Đặt lại: kỳ về tháng hiện tại, công tắc bật lại.
   - Cần thêm tuỳ chọn cho `MLoc` (vd prop `kyThang`) để các màn khác không đổi.
2. Thẻ ghi tăng sau tháng đang chọn luôn ẩn, không phụ thuộc công tắc.
3. Hàng chip gồm nút phễu, chip `Tháng 10/2026` ở chỗ chip thời gian, chip `CN: ...`.
4. Thẻ tổng giữ số thẻ, Tổng giá trị, thêm 2 hàng, nhãn căn trái, số căn phải:
   - Phân bổ tháng này: tổng số phân bổ các thẻ ở tháng đang chọn. Chọn tháng khác thì nhãn thành "Phân bổ tháng 09/2026".
   - Giá trị còn lại: tổng giá trị chưa phân bổ tới hết tháng đang chọn.
5. Ở từng thẻ:
   - Dưới tên thẻ thêm dòng nhỏ màu xám: `Ghi tăng dd/mm/yyyy · PB từ dd/mm/yyyy` (ngày bắt đầu phân bổ sớm nhất của các dòng).
   - Dưới cùng, trải hết bề ngang, 2 hàng nhãn trái số phải: Phân bổ tháng này, Còn lại. Bỏ chữ "Còn ..." ở dòng tên.
   - Nhãn Đang phân bổ, Đã phân bổ xong tính tới hết tháng đang chọn.
6. Tính số: dùng `daPhanBoKy`, `daPhanBoToiKy` trong `src/modules/ccdc/the-phan-bo.tsx` với kỳ đang chọn.
7. Bản máy tính chưa làm, chờ người dùng gửi ảnh yêu cầu.

## Bẫy, quyết định mới

- Không.
