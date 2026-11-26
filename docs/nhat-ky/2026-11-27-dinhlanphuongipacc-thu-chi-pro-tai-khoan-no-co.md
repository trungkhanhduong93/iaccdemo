# Phiếu thu chi Pro: tài khoản Nợ, Có và chi tiết theo tài khoản (T948)

- Ngày: 27/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong (web)

## Đã làm

- `src/modules/tien/dinh-khoan-pro.ts` (mới): tài khoản Nợ, Có của phiếu thu, chi theo quỹ (danh mục 1.12), lý do (1.16), TK công nợ đối tượng (1.5); lý do thu nợ, bán hàng, đi vay, trả nhà cung cấp, đặt cọc, trả nợ vay hoặc lý do trống tài khoản thì lấy TK công nợ của đối tượng. Chuyển quỹ: Nợ quỹ đến, Có quỹ đi. Kiểm lỗi khi lưu: thiếu Nợ, Có, tài khoản tổng hợp, thiếu mã chi tiết.
- `he-thong-tk.ts`: thêm `chiTietTheoTk` (đối tượng 131, 331; công việc, thành phẩm 154, 631; vật tư hàng hoá 152, 153, 155, 156).
- `BangSua.tsx`: bản Pro phiếu thu chi có TK Nợ, TK Có chọn từ tài khoản chi tiết ngay sau Diễn giải; cột chi tiết theo cặp Nợ, Có (Đối tượng, Công việc, Thành phẩm, VTHH) sau Số tiền, chỉ hiện khi dòng có tài khoản theo dõi; ô chọn chỉ hiện mã. Cột Thành tiền của phiếu thu chi đổi thành Số tiền.
- `ChungTuForm.tsx`: Nợ, Có tự tính lại khi đổi quỹ, lý do, đối tượng; đối tượng đầu phiếu gợi ý vào Đối tượng Nợ, Có; Tuỳ chỉnh giao diện thêm thẻ Tuỳ chọn chung "Lý do nghiệp vụ hiển thị đầu phiếu" (tích: lý do chỉ ở đầu phiếu; bỏ tích: chỉ ở từng dòng); tạm ẩn cột Khoản mục ở thu chi (`anKmTam`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- Xem tay trên trình duyệt bản Pro, phiếu chi: Nợ 152, Có 1111; đổi lý do sang trả nhà cung cấp thì Nợ 331 và Đối tượng Nợ điền sẵn; lưu thiếu VTHH thì báo lỗi; bỏ tích lý do đầu phiếu thì cột Lý do hiện ở dòng.
- Chưa chạy `python tools/kiem_tra.py --nhanh` (cổng 5180 đang bị tiến trình khác giữ).

## Dở dang, việc tiếp theo

- Điện thoại (`MLapPhieu.tsx`, `MDtThuChiLap.tsx`) chưa có Nợ, Có chi tiết theo tài khoản như web.
- Cột Đối tượng cũ ở gói khác vẫn lưu theo tên, chưa đổi sang mã.
- Tài khoản 141, 334, 341 chưa được coi là theo dõi đối tượng.

## Bẫy, quyết định mới

- Không.
