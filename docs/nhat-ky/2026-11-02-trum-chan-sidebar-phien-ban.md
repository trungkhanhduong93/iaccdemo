# Chân sidebar hiện phiên bản, nút thu gọn trên đường kẻ (T709)

- Ngày: 02/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `vite.config.ts`: thêm `define` hai hằng tính lúc build. `__PHIEN_BAN__`: robot release (push tag) ghi "Phiên bản vX.Y", robot deploy ghi "Bản thử dd/MM · <7 ký tự SHA>", máy dev ghi "Bản máy dev". Lấy từ biến `GITHUB_REF_TYPE`, `GITHUB_REF_NAME`, `GITHUB_SHA` robot có sẵn, không sửa `.github/workflows`. `__THAY_DOI_MOI__`: 3 mục ngày mới nhất của `CHANGELOG.md`, chỉ nhúng phần này vì cả file nặng 187 KB.
- `src/phien-ban.d.ts` (mới): khai báo kiểu hai hằng trên.
- `src/app/Shell.tsx`: chân sidebar bỏ nút Thu gọn, thay bằng nút dòng phiên bản; bấm mở hộp "Có gì mới" (đóng bằng X, Esc, bấm nền). Sidebar thu gọn thì ẩn dòng phiên bản, rê chuột vào chân sidebar hiện tooltip. Nút tròn mũi tên `.sb-toggle-btn` nằm trên đường kẻ phải sidebar, gần đỉnh, hiện khi rê chuột vào dải 12px dọc đường kẻ hoặc khi focus bằng Tab.
- Cuối `src/styles/app.css`: mục T709.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. Bundle tăng khoảng 12 KB (3 mục CHANGELOG).
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/app/Shell.tsx`: Sạch.
- Playwright (gói S, 1440x900): nút ẩn lúc đầu, rê vào đường kẻ thì hiện; nút nằm đè mép sidebar, không bị phần tử khác che; bấm thì sidebar 209px xuống 58px; lúc thu gọn dòng phiên bản ẩn; hộp Có gì mới mở đủ 3 ngày, Esc đóng.
- Chữ "Phiên bản v1.10", "Bản thử ..." chỉ thấy được trên bản robot dựng, máy dev luôn ghi "Bản máy dev".

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
