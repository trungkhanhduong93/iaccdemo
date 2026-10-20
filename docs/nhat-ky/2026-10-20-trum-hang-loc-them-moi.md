# Hàng lọc, nút Lọc, nút Thêm mới thống nhất danh sách web (T510, T511)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code (Antigravity treo, không ra kết quả)
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Sổ quỹ, Sổ ngân hàng điện thoại: đầu trang và hàng chip dính chung khi cuộn, Tồn cuối ngày nền xám nhạt; sidebar web trả lại nền xanh chuyển màu (commit efccf69, đã push).
- Nhận việc T510, T511 (commit f8a7b2d, đã push).
- T510 code xong trên máy, CHƯA commit, nằm trong bản clone `D:\IACC-CLOUD\Web-t510`: `LocNangCao.tsx`, `ChonHaiCot.tsx`, `OChonMot.tsx` (mới), `CongCuDs.tsx`, `VoucherScreen.tsx`, `CatalogScreen.tsx`, `ToKhaiHKD.tsx`, `app.css` (2 mục cuối T510).

## Đã kiểm

- `npm run typecheck`: sạch. `npm run build`: chạy xong, không lỗi.
- `KIEM_TRA_URL=http://localhost:5181/ python tools/kiem_tra.py --nhanh`: "Không có lỗi.".
- Chưa soát giao diện bằng ảnh: Antigravity treo cả 4 lượt giao.

## Dở dang, việc tiếp theo

- Làm trong `D:\IACC-CLOUD\Web-t510`, theo spec `D:\IACC-CLOUD\Web-t510\backup\spec-T510-T511-tiep.md` (8 luật Trum chốt, phần đã code, Phần 1 soát T510, Phần 2 làm T511, nghiệm thu, commit, bẫy).
- Bước đầu: `git status --short` thấy 7 file sửa + `src/ui/OChonMot.tsx`, rồi `git pull --rebase --autostash`.
- Trước khi giao Anti: khởi động lại Antigravity, xoay tài khoản trước (không xoay giữa chừng), dặn đọc file lớn bằng shell theo khúc.

## Bẫy, quyết định mới

- Không ghi BAY.md, QUYET-DINH.md. Bẫy của `agy` (kẹt đọc file lớn, lệnh shell không báo xong, xoay tài khoản giết worker) ghi trong spec bàn giao.
