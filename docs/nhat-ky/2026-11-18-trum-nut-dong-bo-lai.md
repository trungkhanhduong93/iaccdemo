# Nút đồng bộ Thu chi, Bán hàng cùng kiểu, cùng vị trí (T883)

- Ngày: 18/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/CongCuDs.tsx`: `NutDongBo` thành nút xanh `btn pri` có icon và chữ "Đồng bộ lại", thêm prop `tip`. Danh mục Cửa hàng, màn chứng từ có nguồn đồng bộ cũng đổi theo vì dùng chung.
- `src/modules/ban-hang/ChungTuBanHang.tsx`: tooltip "Đồng bộ dữ liệu bán hàng từ máy POS".
- `src/modules/tien/DongBoThuChiFabi.tsx`: tách `NutDongBoThuChiFabi` (nút + hộp Đồng bộ thu chi từ FABi). Nhãn "N phiếu thu chi chưa đồng bộ" vẫn bên phải thanh tab. Mốc lần đồng bộ cuối giữ ở cấp module để nhãn và nút dùng chung.
- `src/ui/generic/VoucherScreen.tsx`: thanh công cụ bảng của phân hệ Thu chi gắn `NutDongBoThuChiFabi` ngay trước nút Excel.
- `src/modules/tien/huong-dan.ts`: câu tour đổi theo vị trí, tên nút mới.
- `src/styles/app.css`: mục cuối T883, nút cao 34px bằng nút Excel.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/tien/huong-dan.ts`: 0 ĐỎ, 1 VÀNG ở dòng 30 (câu cũ, không thuộc việc này).
- Playwright 1440x900 gói Pro: Thu chi tab Tiền mặt, Ngân hàng và Bán hàng 3-1-1 đều có nút "Đồng bộ lại" đứng ngay trước Excel, cao 31px như Excel (zoom 0.9). Bấm nút ở Thu chi mở hộp Đồng bộ thu chi từ FABi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Ghi chú: Playwright trên máy này phải chạy `channel='chrome'`, Chromium riêng của Playwright chưa cài (Anti kẹt 7 lần ở bước này).
