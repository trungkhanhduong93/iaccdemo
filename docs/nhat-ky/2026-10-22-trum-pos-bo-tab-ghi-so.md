# Chi tiết Xuất bán POS: bỏ tab Ghi sổ, gom ô đầu phiếu (T640, T641)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: thanh tab chi tiết Xuất bán POS chỉ còn Hàng bán. Chế độ nợ có vẫn giữ tab Hạch toán.
- T641, `ChungTuBanHang.tsx` và cuối `app.css` (mục T641): đầu phiếu gom Số đơn POS với Thời gian xuất, Kênh bán hàng với Thanh toán, Số hoá đơn với Ký hiệu thành một hàng. Bỏ Ngày chứng từ vì trùng Thời gian xuất. Ghi chú dời vào nhóm Hoá đơn, dưới Mã tra cứu.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- T641: đo bằng Playwright ở khổ 1440, 6 phiếu, không ô nào bị cắt chữ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
