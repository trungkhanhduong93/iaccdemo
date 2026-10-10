# Cột Ngày tạo, Người tạo ở danh sách phiếu (T132)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `daXoa.ts`: `themPhieu(man, row, ai)` ghi `_ngayTao` (giờ lưu, ngày giả 07/10/2026 như nhật ký thao tác) và `_nguoiTao`; `bayGio` export.
- `ChungTuForm.tsx`: bốn chỗ thêm phiếu (phiếu mới, phiếu thu chi trả ngay, thanh toán sau, phiếu điều chỉnh) truyền người đăng nhập.
- `VoucherScreen.tsx`: `taoCua` lấy ngày, người tạo đã lưu; phiếu mẫu nguồn FABi, iPOS Inventory, hoá đơn ghi Hệ thống lúc giờ chứng từ; phiếu mẫu nhập tay ghi một trong bốn nhân viên đầu danh mục, sau giờ chứng từ 3 tới 42 phút. Hai cột Ngày tạo, Người tạo đứng trước Nguồn.
- `ban-hang/ChungTuBanHang.tsx`: danh sách Xuất bán POS thêm hai cột, Hệ thống tạo lúc 23:30 ngày chứng từ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt gói Plus: danh sách Mua hàng có Ngày tạo sau giờ chứng từ, Người tạo là nhân viên; Xuất bán POS ghi 23:30, Hệ thống.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Danh sách danh mục, thẻ chi phí phân bổ chưa có hai cột này (không phải danh sách phiếu).

## Bẫy, quyết định mới

- Không.
