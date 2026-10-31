# Ô chọn mã hàng chia tab Thực đơn, NVL (T705)

- Ngày: 31/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/ChonDanhMuc.tsx`: thêm prop `tabs` (kiểu `TabDm`). Có tab thì hộp chọn hiện thanh tab `.seg.dm-tabs` giữa nút ⊕/↻ và ô tìm, mở ở tab chứa mục đang chọn, chưa chọn thì mở tab `macDinh`. Tab `khongThem` ẩn nút ⊕.
- `src/ui/generic/BangSua.tsx`: phiếu dòng NVL (`cfg.dong === 'nvl'`) truyền 2 tab: Thực đơn là `HANG` (mọi mặt hàng FABi, theo dõi tồn hay không, không cho thêm), NVL là `NVL` cộng hàng vừa thêm tại form (mặc định). Tra mã hàng ở cả `NVL` và `HANG` (`dsTraHang`) để chọn món thực đơn điền đúng tên, ĐVT, giá.
- `src/ui/mobile/MLapPhieu.tsx`: phiếu dòng NVL, cả sheet chọn hàng phiếu mua và sheet nhập, xuất có thanh tab Thực đơn, NVL (`tabHangThanh`), lọc nhóm theo tab, tab Thực đơn ẩn nút thêm hàng.
- `src/ui/mobile/MChon.tsx`: `MThanhThem` cho `onThem` tuỳ chọn, không có thì ẩn nút ⊕.
- Cuối `src/styles/app.css`: mục T705.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: 0 ĐỎ.
- Mở Phiếu nhập khác trên web và điện thoại (375x812): 2 tab, NVL 12 mục, Thực đơn 9 mục, chọn BIA01 điền đúng tên, mở lại ở tab Thực đơn.

## Dở dang, việc tiếp theo

- Không.
- Kiểm kê, điều chuyển, sản xuất (web `BangKiemKe`, `BangDieuChuyen`, `BangSanXuat`; điện thoại `MLapPhieuKho.tsx`) chưa chia tab. Cần thì Trum, PhuongXT chốt rồi làm việc mới.

## Bẫy, quyết định mới

- Không. Lưu ý: phiếu nhập, xuất khác trên điện thoại nằm ở `MLapPhieu.tsx`; `MLapPhieuKho.tsx` chỉ dùng cho kiểm kê, điều chỉnh, sản xuất, điều chuyển.
