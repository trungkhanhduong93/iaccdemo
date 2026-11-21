# File Excel danh mục theo mẫu IVT (T895)

- Ngày: 21/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/mauNhapDm.ts`: thêm hàm `taiFileDm` dựng workbook chung cho file mẫu, Tải xuống, file lỗi, Xuất Excel. Bỏ `themSheetHuongDan`, `themValidationChoSheet`, sheet ẩn `Danh sach`.
- Tên file: `Mau_nhap_<Danh_muc>_<Gói>.xlsx` (gói lấy từ `GOI[s.goi].ten`), `Du_lieu_<Danh_muc>_<dd-MM-yyyy>.xlsx`, `Loi_nhap_<Danh_muc>_<dd-MM-yyyy>.xlsx`. Ngày lấy `HOM_NAY` của demo.
- Sheet theo thứ tự: Dữ liệu nhập, Dữ liệu mẫu (chỉ file mẫu), Hướng dẫn (dòng 1 ghi danh mục, màn, gói), rồi các sheet `DS …` có cột Mã, Tên, tiêu đề đậm, cố định dòng 1.
- Mỗi cột có danh sách một sheet DS. Cột trùng nội dung dùng chung sheet: ĐVT với ĐVT phụ, các ô TK chung `DS tài khoản`, ô Có/Không chung `DS có không`.
- Ô thả xuống trỏ cột chứa đúng giá trị file xuất ghi ra: ô TK trỏ cột Mã (số TK), còn lại trỏ cột Tên.
- `layCotMauDm`: ô TK lấy `heThongTk(s.cheDo)` như form Thêm mới. File nhận mọi TK của thông tư, sheet DS chỉ liệt kê TK chi tiết (`dsTraCuu`). Ô Nhóm lấy mã từ danh mục nhóm (`DM_NHOM`). Mang thêm `maDs` của trường cho kho, NCC, thương hiệu, cửa hàng.
- `kiemFileNhapDm`: đọc sheet `Dữ liệu nhập`, không có thì `Du lieu`, không có nữa thì sheet đầu không phải DS, Hướng dẫn, Dữ liệu mẫu, Danh sach.
- `src/ui/generic/CatalogScreen.tsx`: nút Xuất Excel ở 6 danh mục nhập được gọi `taiDuLieuDm` với dòng đang lọc, toast "Đã xuất N dòng". Danh mục khác giữ toast cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong. `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Script Playwright 6 danh mục × 3 gói (scratchpad `t895/e2e.py`): mỗi ca tải Xuất Excel, file mẫu, Tải xuống. Không sheet DS nào rỗng, mọi công thức ô thả xuống trỏ sheet có thật. Ví dụ Hàng hoá Pro: 12 sheet DS, `DS tài khoản` 183 dòng, 7.020 ô thả xuống.
- Khứ hồi 18 ca trên file Xuất Excel (sửa tên 1 dòng, thêm 1 dòng mã trống, nhập lại): 15 ca 0 lỗi, 3 ca Lý do nghiệp vụ chỉ lỗi THU01 "Lý do nghiệp vụ không sửa được" như T892.
- File bản cũ (chỉ sheet `Du lieu`) ở Đối tượng, Lý do nghiệp vụ gói S, PR nhập được, kết quả như trên. File lỗi tải về đúng khuôn, cột Lý do lỗi cuối.
- Chưa mở bằng Excel thật: Trum mở thử 1 file, bấm ô thả xuống, xem sheet DS.

## Dở dang, việc tiếp theo

- Không. Việc phát sinh, chưa ghi bảng tiến độ, chờ Trum quyết:
  - Ô Tỉnh / Thành phố, Ngân hàng ở Đối tượng là ô gõ chữ trên form, không có danh sách nguồn, nên chưa có sheet DS (spec cấm bịa danh sách).
  - Dữ liệu mẫu có TK tổng hợp 153 ở nhóm hàng hoá NHH17 đến NHH20, 334 ở nhóm đối tượng NDT14 đến NDT19. File vẫn nhận vì form nhận mọi TK, nhưng sheet DS chỉ có TK chi tiết.
  - `docFileNhapDm`, `nhapCacDongDat` trong `mauNhapDm.ts` không còn nơi nào gọi.

## Bẫy, quyết định mới

- Không.
