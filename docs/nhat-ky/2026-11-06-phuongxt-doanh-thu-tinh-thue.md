# Đổi chữ Doanh thu tính thuế ở bán hàng (T755)

- Ngày: 06/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `BangHangBan.tsx`, `ChungTuBanHang.tsx`: cột "Doanh thu trước thuế" đổi thành "Doanh thu tính thuế" ở bảng hàng phiếu bán, danh sách chứng từ, chi tiết hàng bán, tuỳ chỉnh cột.
- Chú thích trong `types.ts`, `MXuatBanPos.tsx` đổi theo.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` hai file bán hàng: 0 ĐỎ.

## Dở dang, việc tiếp theo

- Không

## Bẫy, quyết định mới

- Không
