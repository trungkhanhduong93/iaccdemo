# Nút Đồng bộ thu chi cạnh nút Excel (T698)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `DongBoThuChiFabi.tsx`: nút Đồng bộ đổi sang `NutDongBo` (nút vuông như Xuất bán POS), bỏ khung `.dbtc-tab`.
- `ModuleTabs.tsx`: bỏ tiện ích khỏi thanh tab phân hệ Thu chi.
- `VoucherScreen.tsx`: Thu chi gắn tiện ích ngay trước nút Excel ở thanh công cụ danh sách. Chip Chưa đồng bộ vẫn giữ Đồng bộ lại và Xuất Excel như T697.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Chưa mở trình duyệt xem bằng mắt.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. CSS `.dbtc-tab` trong `app.css` không còn dùng.
