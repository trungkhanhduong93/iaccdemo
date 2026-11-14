# Điện thoại gói Plus: mục Bán hàng dưới Xuất bán POS (T831)

- Ngày: 14/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Người dùng chọn tách 2 mục: web gói Plus (T753) gộp chứng từ FABi và lập tay vào màn 3.1.1 Bán hàng; điện thoại giữ Xuất bán POS là chứng từ FABi, thêm mục Bán hàng là chứng từ lập tay, nhập Excel của 3.1.1.
- `src/ui/mobile/MNghiepVu.tsx`: gói Plus thêm mục Bán hàng (`/app/ban-hang/3-1-1?tay=1`) ngay sau Xuất bán POS, trên Hàng bán trả lại. Gói Pro vẫn là màn 3.1.7 (T830), gói Free, Standard không đổi.
- `src/ui/mobile/MXuatBanPos.tsx`: lớp ngoài `MXuatBanPos` chọn màn. Gói Plus có `?tay=1` hoặc có mã chứng từ trên đường dẫn (xem, lập, sửa) thì mở `MChungTu` với cấu hình `BAN_TAY`, phiếu mẫu `mauTay()`, chung kho dữ liệu `ban-hang/3-1-1` với web. Còn lại là danh sách FABi cũ (`MXuatBanPosFabi`).
- `src/ui/mobile/MDsChungTuChuan.tsx`: `HangTabsBanHang` nhận ra 3.1.1 có `sc.voucher` là mục Bán hàng lập tay, chỉ hiện một tab Bán hàng.
- `src/ui/mobile/MobileShell.tsx`: tiêu đề thanh trên ghi Bán hàng ở danh sách lập tay, xem, lập chứng từ gói Plus.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `KIEM_TRA_URL=http://localhost:5183/ python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (cổng 5182 đang bận nên dev chạy 5183).
- `kiem_van.py` 4 file đã sửa: không có mục ĐỎ.
- Trình duyệt 375px: gói Plus menu ra Xuất bán POS, Bán hàng, Hàng bán trả lại; mục Bán hàng ra 29 chứng từ lập tay, xem BH2610-0008 được, lập mới ra form "Lập bán hàng"; Xuất bán POS vẫn là danh sách FABi. Gói Pro vẫn Bán hàng 3.1.7; gói Standard không có mục Bán hàng.

## Dở dang, việc tiếp theo

- Không.
- Xoá chứng từ lập tay trên điện thoại gói Plus thì `MXemPhieu` quay về đường dẫn `/app/ban-hang/3-1-1` không kèm `?tay=1`, nên về danh sách Xuất bán POS thay vì Bán hàng. Muốn sửa phải đụng `MXemPhieu.tsx` (Trum giữ ở T497, T552).
- Chứng từ lập mới trên điện thoại lưu qua `MLapPhieu`, không qua `hangTay` như web, nên cột Loại chứng từ, trạng thái hoá đơn có thể khác web.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy lại được (lỗi `No module named 'build_present'` như các phiên trước).

## Bẫy, quyết định mới

- Không.
