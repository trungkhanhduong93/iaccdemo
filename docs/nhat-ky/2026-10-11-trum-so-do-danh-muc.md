# Sơ đồ danh mục, danh mục theo thông tư, chọn cột, lịch chọn ngày (T146, T147, T148, T149)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- T146: `danh-muc/quy-trinh.ts` đổi sang sơ đồ làn (`hoiTu`), 7 làn đánh số, khối cuối Sẵn sàng nhập liệu. `QuyTrinhScreen.tsx` thêm số làn khi `danhSo`, mũi tên giữa các ô trong làn, ẩn link Tất cả báo cáo khi phân hệ không có báo cáo (`khongBaoCao` trong `types.ts`).
- T146: danh mục 1.13 chuyển từ `danh-muc/index.ts` sang `tscd/index.ts` (slug `1-13`). Sửa link ở `SidebarFlyout.tsx`, `tscd/quy-trinh.ts`.
- T147: `ScreenDef.cheDo` mới, `hienMan` ở `registry.ts` lọc theo thông tư cho mọi màn. 1.1 và 1.15 chỉ hiện ở TT133, TT99. Hàm `cols` của danh mục nhận thêm `cheDo`; cột TK xét `kieuGhiSo(cheDo)`. Khối, trường tài khoản trong `truong-dm.ts` khai `cheDo` thay `goi`.
- T147: sơ đồ quy trình lọc ô bằng `hienMan` (theo cả gói và thông tư), nên ô sổ không áp dụng cho thông tư đang dùng cũng ẩn trên sơ đồ các phân hệ khác.
- T148: bỏ `thuocNhom` ở cột, form, dữ liệu 5 danh mục nhóm. `HeThongTaiKhoan.tsx`: ô chọn cha đổi tên Thuộc tài khoản, thêm ô tích Tổng hợp (khoá khi có tài khoản con), nút mở cây chỉ hiện khi có con thật.
- T148: giật cột do `Table.tsx` đo bề rộng rồi ép `minWidth` sau mỗi lần đổi `rows`; nay chỉ ép khi bảng cuộn ảo. Cột Mã 100, Tên 220, Trạng thái 120 cố định ở `CatalogScreen.tsx`.
- T148: mọi danh mục (thường, kiểu danh sách chứng từ, Hệ thống tài khoản, Chi nhánh) dùng `useCotDs` + `NutTuyChinhCot`. Cột bổ sung sinh từ trường form ở `TuyChonCotDM.tsx` (`sinhCotBoSung`), lọc theo gói, thông tư, mặc định ẩn.
- T149: `ChonNgay.tsx` có `ONgay` dùng chung (chuyển từ `ChungTuForm.tsx`). Thay ô gõ tay ở form danh mục (trường `ngay`), `the-phan-bo.tsx` (2 chỗ), Ngày đầu năm ở `HeThong.tsx`, Ngày hoá đơn ở `ChungTuForm.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (Vite chạy sẵn ở cổng 5180, đặt `PYTHONIOENCODING=utf-8`): đã kiểm 218 lượt mở màn, `Không có lỗi.`
- Chưa xem bằng mắt sơ đồ mới, nút chọn cột, lịch chọn ngày, và ca gói Plus đổi sang TT58 ở Hệ thống.

## Dở dang, việc tiếp theo

- Phân hệ Tài sản cố định giờ có 2 danh sách: 7.1.1 Danh sách TSCĐ và 1-13 Danh mục tài sản cố định (menu bay ghi "Danh mục loại TSCĐ"). Cần Trum chốt gộp hay đổi 1-13 thành danh mục loại tài sản.
- Ô ngày ở `onboarding/OnboardFabi.tsx:394`, `KhoiTao.tsx:110` chưa thay vì T138 của PhuongXT đang dở.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD48.
- `tools/kiem_tra.py` lỗi `UnicodeEncodeError` trên console cp1252 nếu không đặt `PYTHONIOENCODING=utf-8`.
