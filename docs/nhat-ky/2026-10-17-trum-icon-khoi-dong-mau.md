# Bộ icon Khối đồng màu, icon thao tác Linear (T332, T340)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Trang xem trước để Trum chốt: https://claude.ai/artifact/H59WiEziF4UvzqSo5nNQAe, bản 5 đến 10. So nét 1.2 đến 2px, khối cũ, khối sáng, khối đồng màu, nét trên nền nhạt, ô vuông, 5 kiểu icon thao tác.
- T332 (quay về bộ nét 2px) không push. Commit giữ ở nhánh `bak/T332`, phần CSS nét dự phòng mang sang T340 với nét 1.6px.
- `tools/xuat_bieu_tuong.py`: bộ khối tách lớp bằng Playwright, đo diện tích thật. Lớp phụ dưới 27% là `l2` (cam), từ 27% là `l3` (xanh nhạt). Bỏ `DAO_TAY_DAC`. Bảng `THAO_TAC_DEF` tải bản Solar Linear, xuất `THAO_TAC` vào `src/ui/icon-dac.ts`.
- `src/ui/Icon.tsx`: khoá trong `THAO_TAC` luôn vẽ kiểu nét một màu.
- `index.html`: gradient xanh, xanh nhạt, cam mới.
- `app.css`: mục T332, T340 nét dự phòng 1.6px; mục T340 màu khối, bỏ bóng trừ ô 28–32px, thanh bên 50%, 75%, 100%, icon thao tác Linear. Mục T320 bỏ bóng.
- Rebase lên `main`: xung đột cuối `app.css` với mục T341, giữ cả hai.

## Đã kiểm

- Đo icon nét ở màn 100%: nét 1.5px có 8–14% điểm ảnh tô đậm hẳn, 2px có 21–28% nhưng dính ở 16–20px.
- Đo diện tích lớp phụ 20 icon: chi tiết 0.03–0.23, mặt khối 0.30–0.50.
- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh` (dev cổng 5181): `Không có lỗi.`
- Ảnh Anti chụp ở `%TEMP%/T340-anh/`: thanh bên, Thao tác nhanh, danh sách phiếu, form chứng từ, Nghiệp vụ điện thoại. Thân xanh đồng nhất, cam chỉ ở chi tiết, nút và kính lúp là nét Linear.
- `kiem_tra.py --dien-thoai` không chạy lại, lỗi cũ chờ T323.

## Dở dang, việc tiếp theo

- Không. Anti để giữ khối các khoá: layers, store, pos, flow, bill, doc, card, wallet, file, filein, sparkle. Trum thấy cái nào nên là nét thì thêm vào `THAO_TAC_DEF`.

## Bẫy, quyết định mới

- QD71 bổ sung phần T332, T340.
- Bẫy: lớp phụ Solar Bold Duotone có khi là chi tiết, có khi là cả mặt khối. Đo hộp bao không phân biệt được, phải đo diện tích thật.
