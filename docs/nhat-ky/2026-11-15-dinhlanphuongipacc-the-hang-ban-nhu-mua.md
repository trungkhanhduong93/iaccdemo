# Thẻ mặt hàng Bán hàng, Hàng bán trả lại điện thoại giống phiếu mua (T854)

- Ngày: 15/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLapPhieu.tsx`, khối MẶT HÀNG của nhóm bán (`nhom === 'ban'`): dòng thêm tay dùng `TheHangMua` thay `TheHangMoi`. Mỗi dòng có Số lượng gộp ĐVT, Đơn giá, Chiết khấu %/đ, VAT, Tổng tiền, nút Nhân bản, Xoá như lập phiếu mua.
- Thẻ `m-t601-hang-card` bọc danh sách cho cả Bán hàng, không chỉ Hàng bán trả lại.
- Khối Tổng cộng chuyển xuống dưới danh sách mặt hàng (trước đây nằm trên các dòng thêm tay).
- Phần đầu Bán hàng dùng thẻ đầu như Hàng bán trả lại (`khuonMua`): chip thanh toán, nguồn, cửa hàng; Khách hàng, Kho xuất, Ngày chứng từ, Ghi chú. Bán hàng chưa có thu tiền ngay nên không có hai tích Đã thanh toán, Lập kèm hoá đơn. Chân phiếu Huỷ, Lưu phiếu như phiếu mua.
- Nhóm kho (trừ Nhập kho) vẫn dùng `TheHangMoi`, không đổi. `TheHangMoi` còn trong file cho nhóm đó.

## Đã kiểm

- Trình duyệt 375x812: lập Hàng bán trả lại, thêm Bún chả Hà Nội, thẻ giống phiếu mua, Tổng tiền 64.800, không lỗi console. Lập Bán hàng, thêm món, lưu được BH2610-0261.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.
- Bán hàng điện thoại chưa có tích Đã thanh toán (lập phiếu thu ngay), Lập kèm hoá đơn như Hàng bán trả lại. Cần thì làm việc riêng.
- `MLapPhieu.tsx` Trum đang giữ ở T552. Phiên này chỉ sửa khối MẶT HÀNG nhóm bán.

## Bẫy, quyết định mới

- Không.
