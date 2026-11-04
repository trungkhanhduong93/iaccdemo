# Bỏ tab Ghi sổ ở form chứng từ (T726)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: màn xem chi tiết, thêm mới, sửa chứng từ bỏ tab Ghi sổ (gói Plus doanh nghiệp, TT58). Chỉ chế độ Nợ/Có (gói Pro) còn tab Hạch toán, giống form bán hàng (T640).
- Nút Ghi sổ, Bỏ ghi sổ và chữ trạng thái trên đầu phiếu giữ nguyên.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
