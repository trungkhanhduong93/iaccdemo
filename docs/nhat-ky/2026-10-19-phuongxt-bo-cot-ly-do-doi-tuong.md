# Phiếu thu, chi gói Free bỏ cột Lý do, Đối tượng ở bảng chi tiết (T448)

- Ngày: 19/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ui/generic/ChungTuForm.tsx`: khi `khoaLyDtFree` (gói Free, phiếu thu, chi tiền mặt, ngân hàng; T346) thì truyền thêm `ly`, `dt` vào `an` của `BangSua`, bảng chi tiết không hiện hai cột này ở thêm mới, sửa, xem. Dữ liệu dòng vẫn lấy lý do, đối tượng từ phần trên khi lưu (như T346), sổ sách, báo cáo không đổi.
- Chỉ làm gói Free. Gói khác vẫn cho chọn lý do, đối tượng riêng từng dòng. Bản điện thoại không có bảng cột nên không đổi.

## Đã kiểm

- `npm run typecheck`, `npm run build`, `python tools/kiem_tra.py --nhanh`: không lỗi.
- Trình duyệt gói Free: thêm mới Chi tiền mặt, xem và bấm Sửa phiếu PC2610-0261: bảng chi tiết chỉ còn #, Diễn giải, Thành tiền.

## Dở dang, việc tiếp theo

- Không. Hộp Cột hiển thị của form vẫn liệt kê Lý do, Đối tượng; bật lên cũng không hiện ở gói Free.

## Bẫy, quyết định mới

- Không.
