# Phiếu mua điện thoại gọn hơn (T656)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLapPhieu.tsx`: sheet Chọn kho nhận bỏ chế độ Áp dụng, chạm là chọn, cùng kiểu sheet Chọn nhà cung cấp.
- `MLapPhieu.tsx` (`TheHangMua`): thẻ hàng hai cột, ĐVT nằm trong ô Số lượng, tiền chiết khấu, VAT xuống dòng dưới ô.
- `MXemPhieu.tsx`: chi tiết phiếu ẩn dòng Tiền chiết khấu, VAT của từng mặt hàng và của khối Tổng cộng khi bằng 0.
- `MLapPhieu.tsx`: tạo mới gộp tích Nhận kèm hoá đơn cùng hàng Đã thanh toán, ô hoá đơn hiện ngay dưới; bỏ thẻ Thông tin hoá đơn VAT phía dưới.
- `MLapPhieu.tsx`: Tổng tiền ghim ở chân trên nút Huỷ, Lưu khi tạo mới và sửa; khối Tổng cộng bỏ dòng Số lượng, Tổng tiền.
- `app.css`: mục T656 cuối file, thẻ đầu gọn hơn.
- `MLapPhieu.tsx`: màn sửa dùng chung thẻ đầu với tạo mới; bỏ thẻ tổng tiền to, radio thanh toán, tab Phiếu nhập/Hạch toán/Lịch sử, khối NCC và hoá đơn kiểu cũ. Tích Đã thanh toán ở màn sửa mở sheet Thanh toán, trả đủ rồi thì tích sẵn, khoá.
- `MThanhToanNgay.tsx`: bỏ hai nút Tiền mặt, Chuyển khoản; bảng chọn quỹ một danh sách hai nhóm, chọn quỹ nào thì lập phiếu chi hoặc uỷ nhiệm chi theo quỹ đó.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở khổ 375px: màn tạo mới, màn sửa MH2610-0021, chi tiết MH2610-0021 hiện đúng, không tràn ngang, chân ghim không che nội dung.
- Chưa xem trên điện thoại thật.

## Dở dang, việc tiếp theo

- Không. Thẻ hàng các phiếu khác (`TheHangMoi`) vẫn nhãn "Giảm giá", chưa đổi.

## Bẫy, quyết định mới

- Không.
