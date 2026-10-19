# Lập phiếu thu, chi từ Tất cả quỹ chọn Tiền mặt hay Ngân hàng (T447)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/LichSuQuy.tsx`: thêm `NutLapPhieuQuy`. Đang xem một quỹ thì mở thẳng phiếu theo loại quỹ (thu, chi hoặc bc, unc); Tất cả quỹ thì nút mở menu (`Dropdown`) Thu tiền mặt, Thu ngân hàng hoặc Chi tiền mặt, Chi ngân hàng. Màn Lịch sử thu chi dùng nút này.
- `home/quyThuChi.tsx`: hộp quỹ trên trang chủ (máy tính và bảng quỹ điện thoại) dùng `NutLapPhieuQuy`; trước đây Tất cả quỹ tính là tiền mặt nên luôn mở phiếu tiền mặt.
- `app.css` mục cuối T447: menu `.pop-lap-phieu` z-index 3000 để nổi trên hộp quỹ (`.mq-nen` z-index 1000).

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free 1440x900: hộp Tất cả quỹ, bấm Lập phiếu thu, chọn Thu ngân hàng, chọn cửa hàng Lê Lợi thì mở `moi?loai=bc`. Lịch sử thu chi Tất cả quỹ: menu Chi tiền mặt, Chi ngân hàng. Điện thoại 375px: bảng quỹ Tất cả quỹ hiện menu nổi trên bảng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
