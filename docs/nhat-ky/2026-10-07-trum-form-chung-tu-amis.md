# Làm lại form chứng từ và danh sách chứng từ theo bố cục AMIS (T15)

- Ngày: 07/10/2026
- Người: Trum, agent: Claude Code và Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- Trum duyệt phương án ngày 07/10. Giữ ngôn ngữ thiết kế hiện tại (QD12), chân form nền navy.
- `src/modules/types.ts`: `Col` thêm `dinh` (cột đứng yên khi cuộn ngang) và `hd` (nội dung ô tiêu đề).
- `src/ui/Table.tsx`: thêm `onDbl` (bấm đúp dòng) và vẽ cột đứng yên trái, phải.
- `src/ui/Dropdown.tsx`: `Select` nhận `disabled`.
- `src/ui/Icon.tsx`: thêm biểu tượng `keyboard`.
- `src/ui/FormToanMan.tsx`: thêm `trai` (nút trước tiêu đề) và `phai` (nút trước tổng tiền).
- `src/data/mock.ts`: thêm `TK_NGAN_HANG`.
- `src/ui/generic/nhom.ts`: `theoLoai`, `nhomCua` (16 nhóm chứng từ), `boO` (bộ ô từng nhóm), nhãn trạng thái thanh toán, hoá đơn.
- `src/ui/generic/gen.ts`: cập nhật kiểu `Dong`, thêm hàm `ttNghiepVu(row)` theo hạt giống `${row.so}-tt`.
- `src/ui/generic/BangSua.tsx`: bảng dòng gõ trực tiếp, ô số hiện số thô khi gõ và định dạng khi rời ô, chọn mã hàng tự điền tên, ĐVT, giá, thuế, tự tính chiết khấu và thuế, có thêm dòng, xoá dòng, xoá hết.
- `src/ui/generic/ChungTuForm.tsx`: form toàn màn hình theo bố cục AMIS. Mở ở chế độ xem, bấm Sửa để sửa, có phím tắt Ctrl+S, Ctrl+E, Esc. Nhóm mua và bán có chọn thanh toán ngay, tự đổi tài khoản 1111 hoặc 1121; thêm tab Hoá đơn, điều khoản thanh toán, đính kèm.
- `src/ui/generic/VoucherScreen.tsx`: danh sách lọc kỳ nhanh, cột Ngày và Số chứng từ đứng yên bên trái, cột chức năng đứng yên bên phải. Thêm cột trạng thái thanh toán và hoá đơn cho nhóm mua bán, vạch vàng cho dòng chưa ghi sổ, thao tác hàng loạt và khung chi tiết bên dưới.
- `src/styles/app.css`: thêm CSS cho cột đứng yên `.dinh`, vạch vàng `.chua-ghi`, khung chi tiết `.ct-panel`, thanh thao tác hàng loạt `.batch-bar`, bảng sửa `.bang-sua`.
- `tools/kiem_tra.py`: kiểm tra `.ct-xem`, mở thử `.ct-panel`, chụp thêm 2 ảnh mua hàng (tổng cộng 25 ảnh).

## Đã kiểm

- `npm run typecheck`: không có lỗi.
- `npm run build`: hoàn tất, không có lỗi.
- `python tools/kiem_tra.py --nhanh`: 148 màn, 39 ô quy trình, 207 lượt mở màn, in dòng "Không có lỗi."
- `python tools/kiem_tra.py`: đủ 4 gói (F, S, M, A), 768 lượt mở màn, chụp đủ 25 ảnh vào `tools/shots/`, in dòng "Không có lỗi."
- `python tools/kiem_van.py` trên các file `.tsx`, `.ts`, `.md`: sạch.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Ghi QD14 vào `docs/QUYET-DINH.md`.
