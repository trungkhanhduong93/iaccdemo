# Thẻ chi phí: đơn giá, ngừng phân bổ, khống chế, cột kỳ này; nút Tuỳ chỉnh, phím tắt, Tiện ích (T296, T297)

- Ngày: 16/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

T296, thẻ chi phí (`ccdc/the-phan-bo.tsx`, `ccdc/index.ts`):

- Thẻ CCDC tạo từ phiếu chi (`_goc`): số tiền chỉ đọc, đơn giá = số tiền / số lượng hiện sẵn, sửa số lượng thì tính lại.
- Ngừng phân bổ: `lichDong` cho các kỳ từ tháng ngừng về 0, kỳ liền trước tháng ngừng nhận toàn bộ phần còn lại (`don`, trạng thái Phân bổ hết còn lại, chỉ xem); ngừng ngay kỳ đầu thì kỳ đầu nhận hết.
- Thẻ dư đầu kỳ khống chế khi gõ: giá trị đã phân bổ không vượt số tiền, số tháng đã phân bổ không vượt số tháng; lưu thì kiểm thêm.
- Ngày bắt đầu phân bổ bằng hoặc sau ngày ghi tăng (khống chế khi chọn, kiểm khi lưu, đổi ngày ghi tăng thì dời theo); ngày, tháng ngừng không trước ngày bắt đầu.
- Danh sách thẻ: cột Phân bổ trong kỳ (`kyNay`), cộng ở dòng Tổng.
- `tienIch`: Xoá mọi thẻ, Sao chép thẻ dư đầu kỳ.

T297, form toàn màn:

- `ChungTuForm.tsx`, `ban-hang/ChungTuBanHang.tsx`: nút Tuỳ chỉnh giao diện thành nút vuông chỉ biểu tượng ở góc trên phải; bỏ nút ở thanh dưới.
- `CatalogScreen.tsx`: form toàn màn có lưới có nút Tuỳ chỉnh (bật tắt cột theo tab, nhớ trên máy, dùng `HopCotPhieu`), nút phím tắt, Ctrl+S, Ctrl+Shift+S, Ctrl+Q, Ctrl+O, Ctrl+Delete; menu Tiện ích (Sao chép, Xoá có hỏi lại); dòng xoá ẩn trong phiên (`daXoaDm`). `truong-dm.ts`: `CauHinhDM.tienIch`.
- `ui/BangPhimTat.tsx` (mới): hộp phím tắt mỗi phím một ô, nút Xem phím tắt, `phimDong` (Ctrl+Insert thêm dòng, Alt+Delete xoá dòng đang đứng).
- Phím tắt phiếu: Ctrl+S lưu, Ctrl+Shift+S lưu và thêm, Ctrl+E sửa, Ctrl+Q huỷ thay đổi, Ctrl+Insert thêm dòng, Alt+Delete xoá dòng, Ctrl+O sao chép, Ctrl+Delete xoá chứng từ khi xem (hỏi lại, cùng luật Tiện ích Xoá), Esc đóng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van --loai giao-dien` các tệp đã sửa: không ĐỎ.
- Thử tay: thẻ từ phiếu chi số lượng 5 thì đơn giá 1.369.000; TPB2608-0003 ngừng 12/2026 thì 30/11/2026 nhận 26.499.999, sau đó 0; gõ 40.000.000 đã phân bổ tự về 36.000.000; chọn ngày bắt đầu trước ngày ghi tăng tự về ngày ghi tăng; cột Phân bổ trong kỳ khớp; phiếu chi, mua hàng, POS, thẻ có nút ở góc trên phải; Ctrl+Insert, Alt+Delete, Ctrl+Q, Ctrl+Delete chạy đúng ở phiếu chi và thẻ; Sao chép TPBDK2512-0002 mở thẻ mới TPBDK2512-0004; Xoá TPB2601-0001 ẩn khỏi danh sách.
- `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- Sao chép phiếu (Ctrl+O, Tiện ích) vẫn chỉ báo, chưa tạo phiếu thật như trước.
- Xoá thẻ chỉ ẩn trong phiên, tải lại trang thì hiện lại (bản mẫu chưa có nơi lưu).

## Bẫy, quyết định mới

- Không.
