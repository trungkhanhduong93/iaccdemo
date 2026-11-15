# Phiếu trả lại điện thoại giống hệt khuôn lập phiếu mua, bỏ Phương thức Hàng bán trả lại (T853)

- Ngày: 15/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLapPhieu.tsx`, `TheHangMua`: bỏ nhánh riêng `chiSl`, phiếu trả lại dùng chung markup lập phiếu mua với cờ `khoa`. Đơn giá, Chiết khấu, VAT chỉ đọc; không bút sửa, không đổi kiểu %/đ, không đổi ĐVT, không Nhân bản; Số lượng không quá `slMax`, giữ dòng "Đã bán / Đã mua"; Ghi chú sửa được; vẫn Xoá dòng.
- `MLapPhieu.tsx`: Hàng bán trả lại bọc mặt hàng trong thẻ `m-t601-hang-card` như phiếu mua, khối Tổng cộng luôn đủ Thành tiền, Tiền chiết khấu, Tiền thuế.
- `app.css`: bỏ `.m-t601-box.khoa` (T843), thêm mục T853 cuối file.
- Hàng bán trả lại bỏ Phương thức: màn xem điện thoại đã bỏ ở commit T841 (`eb70018b`), phiên này bỏ ở form lập và xem web (`ChungTuForm.tsx`, điều kiện `!traLai`). Form lập điện thoại đã ẩn từ T842. Dữ liệu `_pttt` vẫn lưu mặc định như trước.

## Đã kiểm

- Trình duyệt 375x812: Hàng bán trả lại từ BH2610-0009 và Trả lại hàng mua từ MH2610-0021 cùng khuôn phiếu mua, gõ quá số gốc thì về số gốc, lưu được phiếu, không lỗi console.
- Web 1366x800: form Hàng bán trả lại chọn Tiền mặt ngay không còn ô Phương thức.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.
- Hàng bán trả lại điện thoại chưa có ô Tìm hàng hoá trên danh sách mặt hàng như phiếu mua, Trả lại hàng mua. Cần thì làm việc riêng.
- `MLapPhieu.tsx`, `MXemPhieu.tsx` Trum đang giữ ở T552, T497.

## Bẫy, quyết định mới

- Việc nhận T844 trên máy nhưng chưa push commit nhận việc, Trum lấy T844-T851 trước nên đổi sang T853. Không ghi BAY: luật đã có (push commit nhận việc ngay).
