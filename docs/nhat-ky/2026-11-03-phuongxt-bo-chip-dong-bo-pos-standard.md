# Xuất bán POS gói Standard bỏ chip đồng bộ (T717)

- Ngày: 03/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: gói Standard (`s.goi === 'S'`) ẩn hàng chip Tất cả, Đã đồng bộ, Chưa đồng bộ; danh sách luôn ở chế độ Tất cả nên nút Đồng bộ lại không còn. Gói Plus, Pro giữ nguyên.
- `src/ui/mobile/MXuatBanPos.tsx`: gói Standard bỏ ô lọc Trạng thái (Đã, Chưa đồng bộ).
- `src/modules/ban-hang/huong-dan.ts`: tour màn 3-1-1 (chỉ gói S) bỏ các bước chip, bảng Chưa đồng bộ, lưu ý bốn lý do và hàng chip trong sơ đồ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/ban-hang/huong-dan.ts`: Sạch.
- Chưa xem bằng mắt trên đơn vị gói Standard.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
