# Gói Standard giảm thuế GTGT theo FABi (T937)

- Ngày: 25/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `giam-thue.ts`: thêm `coCauHinhGiamVat(goi)`, chỉ gói Plus, Pro trả true. `cauHinhGiamVat` gặp gói khác thì trả `GIAM_VAT_MAC_DINH`, bỏ qua cấu hình đã lưu.
- `HeThong.tsx`, màn Cấu hình kế toán: gói Standard thấy thẻ Giảm thuế GTGT chỉ có ghi chú "giảm thuế GTGT theo cấu hình trên FABi", không có nút bật tắt, nghị quyết, % giảm, hiệu lực. Nút Lưu không ghi `giamVat` ở gói này.
- `truong-dm.ts`: `hopPp` truyền gói vào `cauHinhGiamVat`, ô tích Giảm thuế theo quy định ở Danh mục hàng hoá theo cùng luật.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_van.py src/modules/he-thong/HeThong.tsx`: Sạch.
- Script Playwright riêng, đơn vị `pm`, GTGT theo % doanh thu: gói S hiện ghi chú FABi, không có nút bật tắt; gói PL, PR vẫn đủ nút bật tắt và dòng nghị quyết.
- `python tools/kiem_tra.py --nhanh`: dừng ở mục Thẻ kho chờ `.bc-ban-du-lieu table.tbl`, đúng lỗi T933 có sẵn trên `main`. Các mục chạy trước đó không báo lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
