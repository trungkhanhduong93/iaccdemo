# Chi phí phân bổ dùng khung danh sách T582 (T583)

- Ngày: 22/10/2026
- Người: Trum, agent: Antigravity code theo `backup/spec-T583.md`, Claude Code nghiệm thu
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MCcdc.tsx`: danh sách thẻ chi phí đổi từ `MDanhSach` sang `MDsChungTuChuan`. Hàng lọc có phễu, chip khoảng ngày, chip cửa hàng, chip trạng thái khi đang lọc. Có thẻ tổng, nhóm theo ngày ghi tăng, sắp xếp Mới nhất. Tìm bằng kính lúp của khung.
- Lọc trạng thái (Tất cả, Đang phân bổ, Đã phân bổ xong) và cửa hàng chuyển vào `MLoc`. Đổi cửa hàng trong màn lọc thì đổi cửa hàng phiên như màn Mua hàng.
- Dòng thẻ dùng cùng lớp với `MDsDongPhieu`. Dòng 1 là số thẻ kèm nhãn trạng thái. Dòng 2 là tên khoản, số tháng, số còn lại. Tiền nằm bên phải. Nhãn "Hết phân bổ" đổi thành "Đã phân bổ xong".
- Nút nổi "Ghi tăng" giữ `handleBatDauThem`. Bấm dòng vẫn mở chi tiết thẻ. Thanh tab dùng lớp `m-tc-tabs` như các màn khác.
- `src/styles/app.css`: thêm mục T583 cuối file, chỉnh nhãn trạng thái trong dòng cho gọn.
- Khi nghiệm thu, Claude bỏ phần anti tự thêm để đồng bộ trạng thái lọc lên URL (`?tt=`). Spec không xin phần này. Nó còn làm mất bộ lọc khi mở chi tiết thẻ, vì `nav('?mo=…')` xoá `tt`. Claude cũng bỏ cỡ chữ 11px ghi đè cỡ chip chuẩn.

## Đã kiểm

- `npm run typecheck`: 0 lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Chưa chụp màn 390px bằng mắt. Thẻ tổng vẫn ghi "N chứng từ" vì `MDsChungTuChuan` chưa có prop đổi chữ này, mà spec cấm sửa file khung.

## Dở dang, việc tiếp theo

- Không. Muốn thẻ tổng ghi "N thẻ chi phí" thì mở việc mới: thêm prop nhãn đếm cho `MDsChungTuChuan`.

## Bẫy, quyết định mới

- Không.
