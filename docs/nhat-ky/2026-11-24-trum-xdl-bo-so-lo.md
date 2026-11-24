# Form Xuất kho định lượng bỏ cột Số lô, kéo giãn cột (T913)

- Ngày: 24/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/XuatDinhLuong.tsx`: bỏ cột Số lô ở nhóm Hàng hoá và trường `soLo` trong dòng lưới.
- Cùng file: lưới chi tiết phiếu dùng `useDoRongCot('xuat-dinh-luong-ct')`, kéo mép tiêu đề giãn được mọi cột. Cột Ghi chú kéo rộng thì hết bị cắt ba chấm vì độ rộng inline thắng `max-width: 200px` của `td.xdl-cat`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa kéo thử bằng tay trên trình duyệt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
