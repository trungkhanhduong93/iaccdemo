# Điện thoại, thẻ dư đầu kỳ dùng chung form Thêm thẻ chi phí (T644)

- Ngày: 23/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MCcdc.tsx`: thẻ dư đầu kỳ mở cùng form với Thêm thẻ chi phí (cờ `ftDau`), không dùng màn sửa thẻ như T643 nữa. Thẻ đầu kỳ có thêm Giá trị đã phân bổ, Giá trị còn cần phân bổ, Số tháng đã phân bổ, Số tháng còn phân bổ, theo thứ tự đã duyệt ở mẫu artifact bản 6. Có ghi chú dưới Ngày ghi tăng.
- Ngày ghi tăng mặc định là ngày trước ngày đầu năm tài chính. Lưu thì kiểm: ngày phải trước ngày đầu năm (`truocDauNam`), số tháng đã phân bổ phải nhỏ hơn số tháng phân bổ. Lúc gõ, giá trị đã phân bổ không vượt Số tiền, số tháng đã phân bổ không vượt Số tháng phân bổ, như web.
- Thẻ đầu kỳ có nhóm Thông tin mua nhập tay, không bắt buộc: Số chứng từ, Ngày chứng từ, Ghi chú. Người dùng yêu cầu giữa phiên, mẫu artifact chưa vẽ nhóm này.
- Tiêu đề form đổi thành "Thêm thẻ chi phí" và "Thêm thẻ chi phí dư đầu kỳ", nhãn "Bắt đầu phân bổ" đổi thành "Ngày bắt đầu phân bổ".
- Ô nhập có viền (`.m-gt-o-nhap`), cùng rộng 140px để thẳng hàng, ở cả hai màn. CSS ở cuối `src/styles/app.css`, mục T644.
- `src/ui/mobile/MThePhanBo.tsx`: trả về như trước T643 (bỏ chế độ `moi` của `MTheSua`).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/mobile/MCcdc.tsx`: Sạch.
- Bấm thử trên trình duyệt cỡ điện thoại, gói Plus: Thêm mới, chọn cửa hàng, mở form thẻ đầu kỳ. Nhập 24.000.000 đ, đã phân bổ 8.000.000 đ, 12 tháng, đã phân bổ 4 tháng: hiện còn cần 16.000.000 đ, còn 8 tháng, mỗi tháng 2.000.000 đ. Lưu ra thẻ TPBDK2512-0001.
- Chưa bấm thử gói Free, cũng chưa thử chọn Ngày chứng từ.

## Dở dang, việc tiếp theo

- Bản máy tính: chờ người dùng gửi ảnh yêu cầu.
- T642 (Trum) bỏ gói Free: điều kiện `s.goi === 'F'` trong `handleThemMoi` của `MCcdc.tsx` cần đổi theo mã gói mới.

## Bẫy, quyết định mới

- Không.
