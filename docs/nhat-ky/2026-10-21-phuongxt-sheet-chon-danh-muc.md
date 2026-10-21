# Điện thoại: sheet chọn danh mục ở màn lập chứng từ (T539)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MChon.tsx`: thêm `MThanhThem` (hàng biểu tượng ⊕ Thêm mới, ↻ Tải lại như sheet đối tượng T538). Sheet nào có `onThem` thì hiện hàng này dưới ô tìm, thay nút xanh to.
- `MLapPhieu.tsx`, `MLapPhieuKho.tsx`: sheet chọn hàng hoá dùng `MThanhThem` thay nút "Thêm hàng hoá". Sheet chọn kho bỏ `onThem`, không tạo kho mới tại phiếu.
- `MLapPhieu.tsx`: bỏ nút "+ Tạo quỹ mới" ở bảng chọn quỹ thanh toán, vì web cũng không cho thêm quỹ tại phiếu (`khongThem` ở `ChungTuForm.tsx`). Thêm lý do tại phiếu điền sẵn Dùng cho đúng Thu tiền hoặc Chi tiền (trước đây luôn Chi tiền).
- `MDtThuChiLap.tsx`: sheet lý do thu, chi có ⊕ mở form thêm lý do nghiệp vụ, lưu xong chọn luôn và tự điền tài khoản; danh sách gồm cả lý do vừa thêm; sheet có ô tìm.
- `MDanhMuc.tsx`: danh mục Kho (1.8) trên điện thoại không có nút thêm mới, `?moi=1` cũng không mở form.
- `MDtThuChiLap.tsx`: đổi thứ tự ô theo ý PhuongXT (đã xem bản mẫu trước): Thông tin chung gồm Ngày chứng từ, Số phiếu, Quỹ, Lý do (kèm Tháng ghi nhận chi phí, Thẻ chi phí, dòng Nợ/Có); nhóm Đối tượng gồm Đối tượng, Địa chỉ, Người giao dịch, Ghi chú. Bỏ nhóm Hạch toán.
- `MDtThuChiXem.tsx`: sheet Thao tác chứng từ của phiếu thu chi bỏ mục Bỏ ghi sổ (Ghi sổ) và In phiếu. Hộp hỏi bỏ ghi sổ (`hoiBoGhi`) vẫn giữ vì màn cha truyền vào. Gói Free ẩn tab Đính kèm, chỉ còn Chi tiết, Lịch sử. Dòng cửa hàng đầu màn bỏ ngày giờ (đã có Ngày chứng từ), tab Chi tiết bỏ dòng Quỹ (đã có khung quỹ ở trên). Nhãn Chi phí ở dòng Lý do chi nằm dưới tên lý do, chỉ hiện khi lý do thuộc `LY_CHI_PHI` (trước đây hiện cả ở phiếu thu). Nhãn nguồn Thủ công/FABi chữ nhỏ nằm cạnh tên cửa hàng (đã thử để dưới tiêu đề, PhuongXT không chọn), nhãn loại phiếu chữ 13px; khoảng xám dưới thanh đầu còn 8px. Nhãn chip trong `.m-app` bị luật chung 10.5px `!important` đè, muốn đổi cỡ phải dùng `.m-app ... !important`. Tab Chi tiết bỏ dòng Số phiếu vì tiêu đề đã có.
- Nhãn tham chiếu chứng từ khác trên điện thoại thống nhất là "Tham chiếu" như web: Thẻ chi phí (`MDtThuChiXem.tsx`, `MDtThuChiLap.tsx`), Xử lý chênh lệch ở phiếu kiểm kê (`MXemPhieu.tsx`); link thẻ chi phí ở `MXemPhieu.tsx` chỉ ghi số thẻ.
- `MDtThuChiLap.tsx`: sửa phiếu không còn mất lý do, vì lý do và người giao dịch đoán giống màn xem (`_lyDo`, rồi dòng đầu của `_dong` hoặc `dongCua(theoLoai(cfg, loai))`, rồi `doanLyDoThuChi`). Sao chép chứng từ đọc `location.state.saoChep` như `MLapPhieu.tsx`: phiếu mới mang loại, cửa hàng, số tiền, quỹ, đối tượng, địa chỉ, người giao dịch, lý do, ghi chú, dòng; số phiếu, ngày, thẻ chi phí lấy mới.
- Cuối `app.css`: `HopXacNhan` (hộp hỏi xoá…) trên điện thoại là popup nhỏ giữa màn, rộng tối đa 360px, thay vì phủ kín màn.
- `MCcdc.tsx`: xem thẻ chi phí (mở từ dòng Tham chiếu), bấm Xoá thẻ này thì hỏi `HopXacNhan` "Xoá thẻ …?" trước khi xoá; thẻ thuộc kỳ khoá sổ vẫn báo không xoá như cũ.
- `MDtThuChiDs.tsx`: nút Thêm phiếu thu, chi chỉ hiện loại phiếu của tab đang chọn: Tiền mặt (chi, thu tiền mặt), Ngân hàng (chi, thu ngân hàng), Chuyển quỹ mở thẳng phiếu chuyển quỹ, Tất cả đủ 5 loại. Gom việc mở phiếu mới vào `moPhieuMoi`. Nút nổi đổi chữ thành "Thêm mới" (web vẫn ghi theo `them` trong `modules/tien/index.ts`).
- Cuối `app.css` mục T539: khung hàng biểu tượng trong sheet, ô tìm `.m-tam-tim-inp`, `.m-lp-tim-hang-inp` 16px.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Script thử khổ 390px: phiếu chi, sheet lý do có ⊕, bấm mở form "Thêm lý do"; phiếu nhập kho, sheet kho không còn nút thêm; sheet hàng hoá có hàng biểu tượng, ↻ hiện "Đang tải dữ liệu"; danh mục Kho không có nút thêm, danh mục Đối tượng vẫn có.
- Script in thứ tự ô ở phiếu chi, phiếu thu gói PL và phiếu chi gói Free: đúng thứ tự mới, không tràn ngang, không lỗi console.
- Xem phiếu chi gói Free: tab Chi tiết, Lịch sử; gói PL: đủ 3 tab.
- Phiếu chi chi-1 gói Free: xem và sửa cùng lý do "Tạm ứng cho nhân viên"; sao chép ra phiếu mới đủ số tiền, lý do, đối tượng; hộp xoá 342x139px giữa màn.
- Mở PC2610-0261, bấm Tham chiếu TPB2610-0011, Xoá thẻ: hiện hộp hỏi; Huỷ thì thẻ còn, Xoá thẻ thì xoá.
- Danh sách thu chi gói Free và PL: từng tab bấm thêm mới ra đúng loại phiếu của tab.
- Chưa thử trên iPhone thật.

## Dở dang, việc tiếp theo

- Không.
- Danh mục Lý do nghiệp vụ trên điện thoại vẫn chỉ xem (Trum chốt ở T353), web thì thêm được. Muốn mở thêm mới ở danh mục thì hỏi Trum.
- Web vẫn cho thêm kho tại phiếu (`ChonDanhMuc dm="kho"` ở `ChungTuForm.tsx`, `BangSua.tsx`) và ở danh mục Kho gói trên Free. T539 chỉ chặn trên điện thoại.

## Bẫy, quyết định mới

- Không ghi BAY. Lưu ý: màn xem sinh dòng mẫu bằng `dongCua(theoLoai(cfgMan, loai))`; form dùng `cfg` chung sẽ ra dòng, lý do khác cho cùng phiếu.
