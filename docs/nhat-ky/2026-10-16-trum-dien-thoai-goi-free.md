# Điện thoại gói Free: bộ lọc nổi, ẩn màn ngoài gói, nút Thêm, 5 tab Thu chi (T299)

- Ngày: 16/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLoc.tsx`: bộ lọc danh sách chứng từ thành tấm nổi từ đáy, bấm nền tối thì đóng. Mọi gói dùng chung.
- `MDanhSach.tsx`: ô ngày tháng chỉ hiển thị, bỏ mũi tên, bấm không mở gì. Bộ lọc chỉ mở bằng nút lọc.
- `MNghiepVu.tsx`, `MQuyTrinh.tsx`, `MBaoCao.tsx`, `MBaoCaoTheoDoi.tsx`, `MTrangChu.tsx`: gói Free chỉ giữ màn `moDuoc(sc, s.goi)`, không hiện ổ khoá. Gói khác giữ luật T194.
- `MChungTu.tsx`: Thu chi gói Free còn 5 tab Tất cả, Tiền mặt (thu, chi), Ngân hàng (bc, unc), Chuyển quỹ, Báo cáo theo dõi. Thêm mới ở Tiền mặt chỉ có Thu, Chi tiền mặt; Ngân hàng chỉ có Thu, Chi ngân hàng; Chuyển quỹ mở thẳng phiếu. Kho, Mua hàng gói Free còn 1 tab danh sách và Báo cáo theo dõi vì các tab kia ngoài gói.
- `app.css` mục T299: nút Thêm nổi cách mép trên thanh dưới 12px, màn cấp 2 về sát đáy; danh sách có đệm đáy đủ.
- `tools/kiem_tra.py`: bài đợt 9 chờ lớp `.m-loc-tam` của tấm lọc mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`, `--dien-thoai`: `Không có lỗi.`
- Anti chụp ảnh 390x844 gói Free và Pro, tự xem: 5 tab, tấm lọc, nút Thêm, 2 loại phiếu ở Tiền mặt, không còn ổ khoá.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
