# Hộp lịch điện thoại bị cắt thành dải nền tối trên iPhone (T579)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MChonKhoangNgay.tsx`: hộp lịch (lớp `.m-kn-nen`) render bằng `createPortal` ra `document.body`. Trước đó hộp nằm trong `.m-pos-chip-hang` (cuộn ngang, `overflow-x: auto`, `-webkit-overflow-scrolling: touch`), Safari iPhone cắt lớp `position: fixed` theo khung hàng chip nên chỉ thấy dải nền tối, không thấy hộp lịch. Sửa luôn cho bộ lọc danh sách (`MLoc.tsx`) và bộ lọc báo cáo (`MBaoCaoLoc.tsx`) vì dùng chung.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (bản clone riêng, cổng 5183): Không có lỗi.
- Chưa thử trên iPhone thật: máy tính không tái hiện được lỗi cắt này. PhuongXT xem lại trên điện thoại sau khi robot deploy.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Ghi chú: lớp phủ `position: fixed` đặt trong khối cuộn ngang thì dùng portal ra `body`, như `MDanhMuc.tsx` đã làm.
