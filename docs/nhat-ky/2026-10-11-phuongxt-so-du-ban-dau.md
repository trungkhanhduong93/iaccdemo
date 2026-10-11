# Màn Số dư ban đầu theo gói (T141)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT chốt: gói Free chỉ khai số dư tiền; gói khác cần các loại số dư khác.
- `src/modules/tong-hop/SoDuBanDau.tsx` làm lại theo gói, chế độ (`kieuGhiSo`):
  - Gói Free: chỉ Số dư tiền, không hiện lưới thẻ.
  - Chế độ không dùng tài khoản (TT58, TT152 ở gói Standard): Số dư tiền, Công nợ khách hàng, Công nợ nhà cung cấp, Tồn kho; cột Số dư, Còn phải thu, Còn phải trả, Giá trị tồn.
  - Chế độ Nợ/Có (TT133, TT99): thêm Số dư tài khoản; cột Số hiệu TK, Dư Nợ, Dư Có.
  - Số dư tiền theo danh mục quỹ tiền 1.12: quỹ tiền mặt từng chi nhánh, 2 tài khoản ngân hàng, tách từ số dư 1111, 1121 của sổ cái. Tồn kho có kho, mã hàng, ĐVT, số lượng.
  - Dòng phụ dưới tiêu đề: số dư tại ngày bắt đầu năm tài chính.
- Gói Free ẩn phân hệ Tổng hợp, nên thêm tab Số dư ban đầu ở Thu chi (`src/modules/tien/index.ts`), chỉ gói Free.
- `ScreenDef` thêm trường `goi` (`src/modules/types.ts`): màn ngoài Excel chỉ có ở các gói này, gói khác ẩn hẳn; `moDuoc`, `hienMan` ở `src/app/registry.ts` đọc trường này. Dùng cách này để không thêm mã tính năng, số tính năng các gói giữ nguyên (Pro vẫn 134/134).
- `THEO_ROADMAP` (`src/app/plan.ts`) mở 10.1.3 cho gói Standard.
- Khai số dư trực tiếp trên bảng (PhuongXT yêu cầu): Thêm mới chèn một dòng trống, ô tên là ô chọn quỹ, khách hàng, nhà cung cấp, hàng hoặc tài khoản chưa có số dư; ô số tiền (Số dư, hoặc Dư Nợ, Dư Có) và ô số lượng tồn gõ thẳng, dòng tổng cộng lại ngay. Mỗi dòng có nút xoá, bấm thì hỏi lại bằng `HopXacNhan` rồi mới xoá. Danh sách tài khoản chọn được bỏ loại 5 đến 9 vì không có số dư cuối kỳ. Dữ liệu giữ trong màn, tải lại trang về mẫu.
- `docs/KIEN-TRUC.md`: ghi cách dùng trường `goi`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: không có mục ĐỎ.
- Bấm thử: gói Free mở Thu chi, tab Số dư ban đầu, 5 quỹ, tổng 691.050.000 đ; gói Standard (TT58) Tổng hợp, Số dư ban đầu có 4 thẻ, không cột tài khoản, Thu chi không có tab Số dư ban đầu; gói Plus (TT133) 5 thẻ, tab tiền có cột Số hiệu TK, Dư Nợ, Dư Có, tổng tiền khớp gói Free.

## Dở dang, việc tiếp theo

- Không. Nút Nhập Excel, Xuất Excel vẫn là nút mẫu. Số dư sửa trên màn chưa lưu lại khi tải trang.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`, `docs/QUYET-DINH.md`.
