# Hàng bán trả lại trên điện thoại đủ trường như web, Bán hàng thành mục riêng (T830)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLapPhieu.tsx`: form Hàng bán trả lại (3.1.4) thay thẻ đầu bằng thẻ kiểu phiếu mua, có Khách hàng, Địa chỉ, Mã số thuế, Người giao dịch, Kho nhập, Ngày chứng từ, Ghi chú, tích Đã thanh toán (Quỹ thanh toán, Phương thức), gói Pro chưa trả thì Hạn thanh toán, tích Lập kèm hoá đơn (Số, Ký hiệu, Ngày hoá đơn). Bỏ ô Diễn giải, Ghi chú chép sang diễn giải. Chọn khách hàng thì điền mã số thuế theo danh mục. Lưu đủ trường như web (`_diaChi`, `_mst`, `_nguoiGiao`, `_httt`, `_quy`, `_pttt`, `_hanTt`, `_nhanKemHd`, hoá đơn). Đã thanh toán thì sinh phiếu chi (quỹ tiền mặt) hoặc uỷ nhiệm chi (quỹ ngân hàng) bên Thu chi, gắn ở `_ctTt`, như web.
- `src/ui/mobile/MXemPhieu.tsx`: xem Hàng bán trả lại bỏ dòng diễn giải to ở đầu thẻ tổng quan; tab Chi tiết có Thông tin chung (khách hàng, địa chỉ, MST, người giao dịch, kho nhập, ngày, thanh toán, quỹ, phương thức, hạn thanh toán, ghi chú, tham chiếu), nhóm Hoá đơn khi lập kèm hoá đơn.
- `src/ui/mobile/MDsChungTuChuan.tsx`: thanh tab bán hàng bỏ tab Hàng bán trả lại và Bán hàng; mở hai màn này thì thanh tab chỉ có tab của màn đó.
- `src/ui/mobile/MNghiepVu.tsx`: Bán hàng 3.1.7 (chỉ gói Pro) thành mục riêng trong nhóm Kế toán bán hàng, dưới Xuất bán POS, trên Hàng bán trả lại.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` chạy với `KIEM_TRA_URL=http://localhost:5182/` vì cổng 5180 đang bị phiên khác (worktree `quizzical-borg-c954c7`) giữ.
- `python tools/kiem_van.py` hai file: 0 ĐỎ.
- Chưa mở trình duyệt xem bằng mắt: trình duyệt trong app chặn localhost.

## Dở dang, việc tiếp theo

- Không.
- Sửa phiếu trả lại đã có phiếu chi kèm: ô Đã thanh toán khoá, không đổi, không xoá phiếu chi (web có đồng bộ lại khi đổi hình thức). Cần thì làm việc riêng.
- `MXemPhieu.tsx`, `MLapPhieu.tsx` Trum đang giữ ở T497, T552.
- `python tools/xuat_bao_cao_he_thong.py` lỗi `No module named 'build_present'` như các phiên trước, chưa làm mới file Excel.

## Bẫy, quyết định mới

- Không.
