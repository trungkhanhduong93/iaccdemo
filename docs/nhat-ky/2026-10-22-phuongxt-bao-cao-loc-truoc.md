# Điện thoại, mở báo cáo bật bộ lọc trước, Áp dụng mới tải (T626)

- Ngày: 22/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MBaoCaoLoc.tsx`: thêm prop `onApDung` (gọi khi bấm Áp dụng) và khung `MChuaTaiBaoCao` (lời nhắc, nút Chọn điều kiện lọc).
- `MSoBaoCao.tsx`, `MToGiay.tsx`: mở màn thì `moLoc` bật sẵn, `daTai` tắt; chưa Áp dụng thì hiện `MChuaTaiBaoCao` thay số liệu. Đổi báo cáo (đổi `path`) thì về lại trạng thái này. Nút Xuất báo cáo S1a chỉ hiện khi đã tải.
- Cuối `app.css`: mục T626 cho `.m-bc-chua-tai`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/mobile/MBaoCaoLoc.tsx`: Sạch.
- Trình duyệt khung 375px, gói Plus: 2.2.1, 2.2.3, 5.2.3 mở ra bật bộ lọc, chưa có số liệu; bấm Áp dụng thì hiện số liệu, đóng bộ lọc thì hiện lời nhắc.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần `Dự kiến tính năng IACC Cloud.xlsx` ở gốc repo, máy PhuongXT không có file này.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. `MSoBaoCao.tsx` cùng T624 của Trum đang sửa, chỉ đụng khai báo state và nhánh đầu của khúc nội dung.
