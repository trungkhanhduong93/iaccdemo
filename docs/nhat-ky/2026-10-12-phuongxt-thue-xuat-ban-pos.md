# Cột thuế Xuất bán POS theo loại hình đơn vị (T162)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: chi tiết phiếu Xuất bán POS, bảng Hàng bán đổi theo loại hình đơn vị (`loaiHinhDv`).
  - Hộ kinh doanh: bỏ cột Thuế suất, Tiền thuế, luôn hiện cột Giảm thuế GTGT.
  - Doanh nghiệp: luôn hiện Thuế suất, Tiền thuế; Giảm thuế GTGT vẫn ẩn sẵn, bật được ở Tuỳ chỉnh giao diện.
  - Các cột cố định này không còn trong hộp Tuỳ chỉnh giao diện.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py ChungTuBanHang.tsx`: 0 ĐỎ.
- Bấm thử chi tiết phiếu Xuất bán POS. Phố Mây (doanh nghiệp, Plus) có Thuế suất, Tiền thuế. Cà phê Góc Nhỏ (hộ kinh doanh) không có hai cột đó và có Giảm thuế GTGT. Thử xong trả phiên về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Dữ liệu mẫu chưa có số giảm thuế GTGT, cột đang toàn 0.
- Hộ kinh doanh: Tổng tiền ở dải đáy và mẫu in vẫn cộng thuế GTGT của dữ liệu mẫu. Chờ PhuongXT, Trum chốt cách tính.

## Bẫy, quyết định mới

- Không.
