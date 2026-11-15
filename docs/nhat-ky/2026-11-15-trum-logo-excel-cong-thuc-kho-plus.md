# Logo, icon Excel, form công thức chế biến, Xuất chuyển kho, Xuất kho định lượng (T844-T851)

- Ngày: 15/11/2026
- Người: Trum, agent: Claude Code điều phối 5 Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- T844: dấu vuông, favicon, biểu tượng app dùng ảnh `D:\IACC-CLOUD\Logo\icon accounting_Final.png`, viền xanh mỏng, bo 4 góc (`src/assets/acc-dau.png`, `public/favicon.png`, `public/app-icon.png`).
- T851: thêm `IconExcel` (logo Excel đủ màu, SVG) ở `src/ui/IconFigma.tsx`, thay `IconFigmaSheet` ở nút Excel danh sách chứng từ, danh mục, màn Báo cáo, sổ báo cáo điện thoại. Nút xuất ở màn Báo cáo thôi dùng icon tải xuống (T499).
- T845, T847, T848: form công thức chế biến gói Plus (`CongThucPlusForm.tsx`) và gói Pro (`CongThuc.tsx`): dòng NVL cao khoảng 40px, Thêm mới thì chọn lại NVL được, ĐVT dòng NVL chọn được ĐVT quy đổi và lưu vào dòng.
- T846: `DS_NVL` (`CongThuc.tsx:32`) chỉ còn hàng có Theo dõi tồn kho, dùng chung cho Thêm hàng loạt, ô chọn từng dòng, form Plus, app điện thoại.
- T850: gói Plus tab Kho "Xuất chuyển kho" (phiếu Chuyển kho đổi tên, kho nhận chọn ở mọi cửa hàng); Xuất, Nhập điều chuyển chỉ gói Pro (`kho/index.ts`, `dieu-chuyen.ts`, `BangDieuChuyen.tsx`, `SidebarFlyout.tsx`, `kho/quy-trinh.ts`).
- T849: màn Xuất kho định lượng thay tab Xuất bán POS ở Kho (mã 5.1.2), gói Plus và Pro. Mỗi phiếu Xuất bán POS sinh một phiếu XDL, lưới cây món và NVL theo công thức, giá vốn bình quân; gói Pro có tab Hạch toán 632/152 (`XuatDinhLuong.tsx`, `xuat-dinh-luong.ts`).
- QD111 ghi Xuất kho định lượng, Xuất chuyển kho.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần đầu báo `[PR] #/app/kho/5-1-2: không có tiêu đề màn`, thêm `h1.sr-only` vào `XuatDinhLuong.tsx`, chạy lại in "Không có lỗi.".
- Anti tự thử giao diện bằng Playwright ở 5180 cho T845-T848, T850. Claude chỉ xem ảnh `public/app-icon.png`.

## Dở dang, việc tiếp theo

- T852: phiếu Xuất bán POS chưa có tham chiếu ngược sang phiếu Xuất kho định lượng (chiều XDL sang POS đã có). Sửa `src/modules/ban-hang/ChungTuBanHang.tsx`, dùng `useDsPhieuXdl` trong `src/modules/kho/xuat-dinh-luong.ts`.

## Bẫy, quyết định mới

- QD111. Công thức chế biến có 2 form: gói Plus `CongThucPlusForm.tsx` (mở từ Danh mục), gói Pro `CongThuc.tsx`. Sửa form theo ảnh gói nào thì tra đúng file đó.
