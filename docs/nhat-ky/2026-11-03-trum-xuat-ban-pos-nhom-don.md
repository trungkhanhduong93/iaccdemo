# Danh sách Xuất bán POS điện thoại nhóm theo đơn (T716)

- Ngày: 03/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXuatBanPos.tsx`: danh sách nhóm theo ngày, dưới mỗi ngày là một thẻ cho mỗi đơn POS thay cho một thẻ mỗi món (bỏ cách tách của T628).
- Thẻ đơn: dòng đầu Mã hoá đơn POS rút gọn 5 ký tự cuối dạng `#ABCDE` (ô tìm vẫn tìm theo mã đủ), dòng phụ khách hàng · cửa hàng, dòng Thành tiền, bên phải Tổng tiền in đậm. Bỏ Số đơn POS theo ý Trum. Khách có hoá đơn GTGT hiện tên khách, còn lại hiện Khách lẻ.
- Tổng mỗi ngày giờ cộng Tổng tiền của đơn.
- Bấm thẻ vẫn mở tấm chi tiết đơn như cũ.
- `MDsChungTuChuan.tsx`: `MDsDongPhieu` thêm prop tuỳ chọn `dongPhu2` cho dòng phụ thứ hai.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
