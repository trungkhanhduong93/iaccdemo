# Thẻ mặt hàng Bán hàng, Hàng bán trả lại điện thoại giống phiếu mua (T854)

- Ngày: 15/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLapPhieu.tsx`, khối MẶT HÀNG của nhóm bán (`nhom === 'ban'`): dòng thêm tay dùng `TheHangMua` thay `TheHangMoi`. Mỗi dòng có Số lượng gộp ĐVT, Đơn giá, Chiết khấu %/đ, VAT, Tổng tiền, nút Nhân bản, Xoá như lập phiếu mua.
- Thẻ `m-t601-hang-card` bọc danh sách cho cả Bán hàng, không chỉ Hàng bán trả lại.
- Khối Tổng cộng chuyển xuống dưới danh sách mặt hàng (trước đây nằm trên các dòng thêm tay).
- Nhóm kho (trừ Nhập kho) vẫn dùng `TheHangMoi`, không đổi. `TheHangMoi` còn trong file cho nhóm đó.

## Đã kiểm

- Trình duyệt 375x812: lập Hàng bán trả lại, thêm Bún chả Hà Nội, thẻ giống phiếu mua, Tổng tiền 64.800, không lỗi console.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.
- Chưa mở thử màn Bán hàng lập tay bằng mắt, chỉ Hàng bán trả lại. Hai màn đi chung nhánh code.
- `MLapPhieu.tsx` Trum đang giữ ở T552. Phiên này chỉ sửa khối MẶT HÀNG nhóm bán.

## Bẫy, quyết định mới

- Không.
