# Đổi tên chip nguồn chứng từ Bán hàng (T805)

- Ngày: 12/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: chip gói Plus đổi "Xuất bán POS" thành "Đồng bộ từ POS", "Bán hàng" thành "Lập thủ công". Bộ lọc Loại chứng từ, cột Loại chứng từ giữ nguyên.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Ghi QD109 vào `docs/QUYET-DINH.md`.
