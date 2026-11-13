# Màn Nhập khác đổi tên Nhập kho, bỏ phiếu kiểm kê khỏi danh sách (T818)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/index.ts`: màn 5.1.1 tên Nhập kho (tiêu đề, nhãn tab), nút Thêm phiếu nhập kho. Phiếu mẫu nguồn Thủ công (`nguon: 'tay'`), không còn phiếu iPOS Inventory do Hệ thống tạo. Bỏ ghi chú mẫu "Nhập thừa khi kiểm kê", thay bằng các lý do nhập tay. Hàng thừa khi kiểm kê vẫn ở tab Kiểm kê, tab con Nhập điều chỉnh.
- `src/ui/generic/VoucherScreen.tsx`: màn Nhập kho đổi cột Người tạo thành Người thực hiện, lấy nhân viên thực hiện đã lưu trên phiếu.
- `src/ui/generic/ChungTuForm.tsx`: form Nhập kho ghi Người thực hiện thay Nhân viên thực hiện. Phiếu mẫu lấy cùng người với cột danh sách.
- `src/ui/generic/gen.ts`: thêm hàm `nguoiTaoMau` dùng chung cho danh sách và form.
- `src/modules/kho/quy-trinh.ts`, `src/app/SidebarFlyout.tsx`, `src/ui/mobile/MChungTu.tsx`: chữ Nhập khác, Phiếu nhập khác đổi thành Phiếu nhập kho, Nhập kho.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 4 file sửa: 0 ĐỎ.
- `python tools/xuat_bao_cao_he_thong.py` lỗi `No module named 'build_present'` (máy thiếu thư mục `Present/tools` cạnh repo), chưa làm mới file Excel.
- Mở màn Nhập kho gói Plus: 6 phiếu đều Thủ công, cột Người thực hiện; mở phiếu NK2610-0260 thấy Người thực hiện khớp danh sách.

## Dở dang, việc tiếp theo

- Không.
- Chưa đổi: báo cáo Tổng hợp, Chi tiết nhập kho vẫn ghi loại "Nhập khác" (`kho/index.ts` hằng `NHAP`), dữ liệu mẫu `kho/data.ts` dòng loại NK. Để vậy vì trong báo cáo nhập kho, nhãn "Nhập kho" dễ lẫn với tên báo cáo. Đổi khi người dùng muốn.

## Bẫy, quyết định mới

- Không.
