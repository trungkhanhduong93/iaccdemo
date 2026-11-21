# Nhập Excel Tồn kho ban đầu (T896)

- Ngày: 21/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Chưa sửa code. Soi màn Tồn đầu kỳ của IVT (ivt.ipos.vn > Thiết lập > Tồn đầu kỳ > Thêm mới > Nhập dữ liệu), tải file mẫu về `backup/ivt/mau-ton-dau__MAU_NHAP_TON_DAU_KY_*.xlsx` (thư mục `backup/` không lên git).
- IVT chọn một kho trong hộp nhập, file không có cột kho. File IVT có 5 cột: Mã hàng hóa(*), Tên hàng hoá, Mã đơn vị tính(*), Số lượng, Giá. Kèm sheet Danh sách hàng hoá (mã hàng, tên, mã ĐVT, tên ĐVT).
- Trum duyệt cách làm dưới đây ngày 21/11/2026.

## Đã kiểm

- Không có code để kiểm.

## Dở dang, việc tiếp theo

Làm theo đúng các điểm Trum đã duyệt:

1. Mỗi lần nhập một kho. Bước 1 của hộp có ô "Chọn kho cần nhập", mặc định kho đang xem ở màn `src/modules/kho/TonKhoBanDau.tsx`.
2. Kho bị khoá (`khoaTonDau(kho)` khác null) thì chặn ở bước 1, báo lý do: số phiếu kiểm kê hoặc kỳ khoá sổ của cửa hàng.
3. Dùng lại hộp 3 bước `src/ui/generic/HopNhapExcel.tsx` của T892. Thêm một prop tuỳ chọn nhận bộ hàm riêng (cột, kiểm, ghi, tải mẫu, tải dữ liệu, tải lỗi). Không đổi luồng danh mục cũ.
4. File theo khuôn T895 (`taiFileDm` trong `src/ui/generic/mauNhapDm.ts`): sheet Dữ liệu nhập, Dữ liệu mẫu, Hướng dẫn, các sheet DS. Cột: Mã hàng *, Tên hàng (chỉ xem), Mã ĐVT *, Số lượng, Đơn giá *, Thành tiền (chỉ xem). Tên hàng, Thành tiền bỏ qua khi nhập. Chưa có lô, date.
5. Sheet DS hàng hoá chỉ gồm hàng có theo dõi tồn. Sheet DS đơn vị tính gồm cả ĐVT quy đổi của từng mã (`dvtCuaHang`, `QUY_DOI_DVT`).
6. Luật ghi: trùng mã hàng thì ghi đè. Số lượng trống thì giữ cũ, số lượng 0 thì xoá tồn đầu mã đó. Đơn giá bắt buộc, không có giá thì ghi 0, để trống là lỗi dòng. Mã hàng không theo dõi tồn hoặc ĐVT không thuộc mã đó là lỗi dòng. Ghi bằng `luuTonDau`, `xoaTonDau` trong `src/modules/kho/ton-dau.ts`.
7. Nút Excel dòng 123 của `TonKhoBanDau.tsx`: Nhập mở hộp, Xuất tải tồn đầu kho đang xem đúng khuôn.
8. Tên file: `Mau_nhap_Ton_kho_ban_dau_<Gói>.xlsx`, `Du_lieu_Ton_kho_ban_dau_<Mã kho>_<dd-MM-yyyy>.xlsx`, `Loi_nhap_Ton_kho_ban_dau_<dd-MM-yyyy>.xlsx`.

Nghiệm thu:

- Vòng khứ hồi: sửa số lượng 2 dòng, thêm 1 mã chưa có tồn, 1 dòng ĐVT sai, 1 dòng đơn giá trống. Bảng tồn đầu sau nhập khớp file. Chọn kho khoá thì bị chặn, dữ liệu không đổi.
- Chạy lại 18 ca của T895 để chắc 6 danh mục không hỏng. Script ở scratchpad phiên trước có thể đã mất, khung script nằm trong nhật ký 2026-11-21-trum-excel-danh-muc-mau-ivt.
- Đường dẫn màn danh mục trong app là `/app/danh-muc/1-2`, không phải `1.2`.

## Bẫy, quyết định mới

- Không.
