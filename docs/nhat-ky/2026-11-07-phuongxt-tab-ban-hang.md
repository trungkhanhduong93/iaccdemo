# Tab Xuất bán POS, Bán hàng ở danh sách Bán hàng (T762)

- Ngày: 07/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: gói Plus bỏ chip Đã đồng bộ, Chưa đồng bộ cùng hai bảng theo món (dữ liệu `rowsPosOk`, `rowsPosLoi`, cột `colsPosOk`, `colsPosLoi`, nút Đồng bộ lại). Thay bằng chip Tất cả, Xuất bán POS (`nguon === 'FABi'`), Bán hàng (lập tay, nhập Excel), dùng chung bảng và nút Đồng bộ, Excel, Tuỳ chỉnh cột.
- Chip chỉ hiện ở gói Plus. Gói Pro trước có chip Đã, Chưa đồng bộ, giờ không còn chip vì chỉ có hoá đơn FABi.
- `POS_OK_MAU`, `POS_LOI_MAU`, `MON_POS` giữ lại vì điện thoại `MXuatBanPos.tsx` còn dùng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` file đã sửa: 0 ĐỎ.
- Chưa mở trình duyệt xem màn gói Plus bằng mắt.
- `python tools/xuat_bao_cao_he_thong.py` lỗi thiếu `build_present` (như phiên T761), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Điện thoại `MXuatBanPos.tsx` vẫn lọc Trạng thái Đã, Chưa đồng bộ; chưa hỏi có đổi theo web không.

## Bẫy, quyết định mới

- Không.
