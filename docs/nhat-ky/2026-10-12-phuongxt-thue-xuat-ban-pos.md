# Cột thuế Xuất bán POS theo loại hình đơn vị (T162)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: chi tiết phiếu Xuất bán POS, bảng Hàng bán đổi theo loại hình đơn vị (`loaiHinhDv`).
  - Hộ kinh doanh: bỏ cột Thuế suất, Tiền thuế, luôn hiện cột Giảm thuế GTGT.
  - Doanh nghiệp: luôn hiện Thuế suất, Tiền thuế; Giảm thuế GTGT vẫn ẩn sẵn, bật được ở Tuỳ chỉnh giao diện.
  - Các cột cố định này không còn trong hộp Tuỳ chỉnh giao diện.
  - Hộ kinh doanh được giảm 20% mức tỷ lệ tính thuế GTGT (PhuongXT chốt). Giảm thuế = doanh thu × tỷ lệ GTGT ngành Dịch vụ ăn uống (3%, mã 301-5 trong danh mục ngành nghề) × 20%, chia cho các món theo doanh thu trước thuế.
  - Hộ kinh doanh: Tổng tiền = doanh thu − giảm thuế GTGT, không cộng tiền thuế. Dải đáy chi tiết phiếu có thêm dòng Giảm thuế GTGT. Danh sách và bảng xem nhanh đổi cột Tiền thuế thành Giảm thuế GTGT, Tổng tiền tính cùng cách.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py ChungTuBanHang.tsx`: 0 ĐỎ.
- Bấm thử chi tiết phiếu Xuất bán POS. Phố Mây (doanh nghiệp, Plus) có Thuế suất, Tiền thuế, Tổng tiền như cũ. Cà phê Góc Nhỏ (hộ kinh doanh) không có hai cột đó và có Giảm thuế GTGT. Phiếu doanh thu 12.604.000 giảm thuế 75.624, Tổng tiền 12.528.376; danh sách ra cùng số. Thử xong trả phiên về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Mẫu in Xuất bán POS của hộ kinh doanh vẫn có thuế suất, tiền thuế.
- Tỷ lệ GTGT đang cố định theo ngành ăn uống, chưa lấy theo ngành nghề từng món.

## Bẫy, quyết định mới

- Không.
