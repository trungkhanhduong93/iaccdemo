# Bộ lọc danh sách Hoá đơn điện tử, đổi tên, icon menu (T800)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/hoa-don/HoaDonDienTu.tsx` (DsHoaDon): Bộ lọc nâng cao thêm ô chữ Mã tra cứu, Số hoá đơn, Tên khách (gộp tên đơn vị và người mua), Mã số thuế, tìm gần đúng, gõ không dấu được.
- Cùng file: ô chọn nhiều Mẫu số - Ký hiệu, Trạng thái hoá đơn (Dự thảo, Đã phát hành), Trạng thái thuế, Loại hoá đơn, dùng `ChonHaiCot` (hai khung Chưa chọn, Đã chọn, có ô tìm) như ô Loại phiếu ở danh sách Thu, chi tiền.
- Trạng thái thuế lọc theo 5 mục người dùng đưa: Hoá đơn chưa gửi TCTN, bị TCTN từ chối, đã gửi TCTN, không hợp lệ, hợp lệ (bảng `TT_THUE`).
- Cùng file: `HopMailHd`, menu ⋯ Gửi email mở popup điền email. Điền sẵn email trên hoá đơn hoặc lần gửi trước (`mailDaGui`), một ô email sửa được, sai dạng (thiếu @) chặn Gửi. Mũi tên mở danh sách tự làm (`goiYMail`, không dùng datalist vì Chrome lọc mất gợi ý khi ô đã có chữ): email trên hoá đơn, đã gửi hoá đơn này, hoá đơn khác của cùng khách, mỗi dòng ghi nguồn.
- Cùng file: bỏ nút Tải lại ở thanh công cụ tab Hoá đơn điện tử (đã có nút Lọc).
- Cùng file (ThongBaoSaiSot): hàng nút chỉ hiện khi tích ít nhất một thông báo, không chọn thì bảng lên sát thanh lọc. Thêm nút Gửi email (gửi mẫu TBSS tới email người mua, bỏ qua thông báo chưa có email). Cột Xem TBSS đặt tiêu đề Thao tác. Popup Xem TBSS có nút Gửi CQT khi thông báo chưa gửi. CSS mục T800 cuối `app.css`.
- `app.css` (mục T793): `.hddt-hop.cs-hd` rộng 520px lên 600px, cao tối đa `100vh - 24px`, popup Chia sẻ hết cuộn.
- `src/modules/hoa-don/index.ts`: tên ngắn menu đổi "Hoá đơn" thành "Hoá đơn điện tử".
- `src/ui/FigmaIcon.tsx`: thêm icon duotone `hoa-don` (tờ hoá đơn mép răng cưa), sidebar trước đó rơi về icon Trang chủ vì phân hệ chưa có trong `MOD_DUOTONE_MAP`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/xuat_bao_cao_he_thong.py` lỗi sẵn (thiếu module `build_present`), chưa làm mới file Excel báo cáo.
- Xem tay trên trình duyệt: sidebar hiện "Hoá đơn điện tử" kèm icon hoá đơn, ô Trạng thái thuế mở hai khung có đủ 5 mục.

## Dở dang, việc tiếp theo

- Không.
- Lưu ý: phần đầu T800 (dòng TIEN-DO, một phần bộ lọc) lọt vào commit 7742c063 của T799 do hai phiên chung một thư mục (QD21).

## Bẫy, quyết định mới

- Không.
