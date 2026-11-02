# Thu chi lấy lại tiện ích đồng bộ FABi của T691 (T706)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT muốn Thu chi dùng lại tiện ích đồng bộ của T691 thay cho chip Chưa đồng bộ của Trum (T697, T698, T699). Trum đồng ý.
- Đưa 4 file về bản cuối T691 (commit `5cf9fc24`): `src/modules/tien/DongBoThuChiFabi.tsx`, `src/app/ModuleTabs.tsx`, `src/ui/generic/VoucherScreen.tsx`, `src/ui/mobile/MChungTu.tsx`. Sau T691, các file này chỉ có thay đổi đồng bộ Thu chi của T697, T698, T699, không mất việc khác. Thu chi web: nhãn cam "N phiếu thu chi chưa đồng bộ", hộp Xem lý do và nút Đồng bộ trở về bên phải thanh tab. Hàng chip trở về như trước T697. Điện thoại bỏ chip Chưa đồng bộ.
- Hộp Xem lý do thêm cột Mã phiếu FABi, cột Lý do (lý do nghiệp vụ: thu là Thu khác, chi là Chi phí khác như T699). Cột lý do lỗi đổi tên thành Nguyên nhân. Hộp rộng 1040px.
- `DongBoThuChiFabi.tsx` gắn `data-hd` cho tour: `dongBo` (nút Đồng bộ), `chuaDb` (nhãn cam), `hdbLyDo` (bảng hộp lý do), `hdbDong` (nút Đóng hộp lý do, để tour tự đóng như hộp Đồng bộ).
- Tour Thu chi (`src/modules/tien/huong-dan.ts`) còn 14 bước: bỏ bước Loại phiếu và các bước chip Chưa đồng bộ, thêm bước nhãn cam và bước tự bấm nhãn mở hộp Xem lý do. Sơ đồ màn: nhãn và nút Đồng bộ nằm cạnh hàng tab.
- `docs/QUYET-DINH.md` QD91 thêm một dòng ghi Thu chi bỏ chip Chưa đồng bộ.
- Giữ nguyên: Xuất bán POS (chip Đã đồng bộ, Chưa đồng bộ), `HopDongBo.tsx`, `dong-bo-fabi.ts`, CSS T697, T699 (Xuất bán POS còn dùng). Cuối `app.css` thêm mục T706.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (có đợt tour Hướng dẫn nhanh 6 màn web và điện thoại).
- `python tools/kiem_van.py` cho `DongBoThuChiFabi.tsx`, `huong-dan.ts`, `QUYET-DINH.md`: 0 ĐỎ, VÀNG chỉ ở câu có sẵn.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được, thiếu `build_present` trên máy PhuongXT, chưa làm mới file xlsx.
- Mở thử trên máy: nhãn "5 phiếu thu chi chưa đồng bộ" hiện ở thanh tab, hộp Xem lý do đủ 9 cột. Chưa chạy hết tour bằng tay.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD91 thêm dòng T706. Không ghi BAY.
