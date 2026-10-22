# Xuất bán POS, 3.2.8 theo dòng hàng; phiếu mua chọn quỹ, tự sinh phiếu chi; Thanh toán ngay khoá số tiền gói Free (T628, T629, T630)

- Ngày: 22/10/2026
- Người: Trum, agent: Claude Code điều phối 3 Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- T628: `MXuatBanPos.tsx` tách mỗi phiếu thành các dòng hàng, gọi `MDsChungTuChuan` với `nhomTheoNgay={false}`. `MDsDongPhieu` thêm prop `tieuDe`, `soLuong`, `dvt`. Hàm `layMaKh` trong `MDsChungTuChuan.tsx` đổi tên khách sang mã, khách lẻ ghi "Khách lẻ". Danh sách sắp theo ngày giờ.
- T628: `MBaoCaoChiTietMauD.tsx` nhánh 3.2.8 bỏ nhóm ngày, mỗi thẻ một dòng hàng. Thẻ tổng 4 ô giữ nguyên. Nhánh Chi tiết nhập kho không đổi.
- T629: `MLapPhieu.tsx` phiếu mua thêm mới: bấm Tiền mặt ngay hoặc Chuyển khoản ngay thì hiện ô Quỹ ngay dưới, không bật sheet. Tiền mặt tự điền quỹ tiền mặt của cửa hàng trên phiếu. Đổi cửa hàng thì điền lại quỹ.
- T629: lưu phiếu mua thanh toán ngay thì tự tạo phiếu chi (tiền mặt) hoặc uỷ nhiệm chi (chuyển khoản) vào `tien/2-1-1`, trả hết tổng tiền. Tham chiếu hai chiều qua `_thamChieu`, `_dsTt`, `_ctTt`. Trừ số dư quỹ trong bảng tham khảo.
- T629: tạo `MThanhCong.tsx` (bảng Lưu phiếu thành công, props chung theo T552), đợt này chỉ gắn phiếu mua. Xem chi tiết mở phiếu mua vừa lưu, Lập phiếu mới xoá trắng form, Đóng về danh sách.
- T630: `MThanhToanNgay.tsx` tự điền đủ số còn nợ. Gói Free ô số tiền chỉ đọc, gói khác sửa được để trả một phần. Màn sửa phiếu mua bỏ sheet Thanh toán ngay riêng, dùng `MThanhToanNgay`.
- CSS 3 mục cuối `app.css` (T628, T629, T630).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- Chưa bấm thử trên khung 390px: các worker không chạy dev server, tui chỉ chạy kiem_tra nhanh. `--dien-thoai` chưa chạy vì T525 còn kẹt ở đợt 5.

## Dở dang, việc tiếp theo

- Không.
- Việc còn lại của T552: gắn `MThanhCong` cho các phiếu điện thoại khác (`MLapPhieuKho.tsx`, `MDtThuChiLap.tsx`, phiếu bán trong `MLapPhieu.tsx`).
- Quỹ ngân hàng đang hiện cả 3 tài khoản, chưa lọc theo cửa hàng, vì dữ liệu giả không gắn tài khoản với cửa hàng.

## Bẫy, quyết định mới

- Không.
