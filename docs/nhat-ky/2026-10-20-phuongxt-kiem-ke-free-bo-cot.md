# Báo cáo kiểm kê gói Free bỏ cột tồn, nhập, xuất (T502)

- Ngày: 20/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/types.ts`: cột (`Col`) có thêm `goi`, khai cột báo cáo bảng kê chỉ có ở các gói nào.
- `src/ui/generic/ReportScreen.tsx`: báo cáo bảng kê bỏ cột không thuộc gói đang dùng. Web, điện thoại, in, xuất Excel đều lấy cột từ đây nên cùng đổi.
- `src/modules/kho/bao-cao.ts`: Báo cáo kiểm kê (5.2.15), 5 cột Tồn đầu, Nhập trong kỳ, Xuất trong kỳ, Tồn cuối hệ thống, Tồn cuối thực tế chỉ có ở gói Standard, Plus, Pro. Gói Free còn Mã hàng, Tên hàng, ĐVT, Kho, Thừa, Thiếu.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Mở báo cáo trên trình duyệt: gói Free máy tính và điện thoại chỉ còn Thừa, Thiếu dưới nhóm Số lượng; gói Plus đủ 7 cột.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được trên máy PhuongXT: thiếu file `Dự kiến tính năng IACC Cloud.xlsx` ở gốc repo.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
