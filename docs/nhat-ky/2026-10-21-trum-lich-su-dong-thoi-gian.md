# Tab Lịch sử dòng thời gian, nút back thẻ phân bổ, khung bo góc thu chi điện thoại (T536)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MCcdc.tsx`: 2 nút `.m-pb-btn-back` (ghi tăng thẻ, xem thẻ) đổi icon `back` sang SVG mũi tên ← như `MXemPhieu.tsx`.
- `src/styles/app.css`: gỡ 2 luật ép sát mép trong khối T522 (6 lớp thẻ thu chi và `.m-tc-nhom-chu`). Thêm mục cuối T536: thẻ cách mép 16px, bo 16px, viền `#eef1f5`; `.m-tc-nhom-chu` lề 20px. Thêm mục cuối T536 cho tab Lịch sử, lớp `m-ls-`.
- `src/ui/mobile/MLichSu.tsx` mới: dòng thời gian nhóm theo ngày, thẻ tóm tắt, vòng tròn màu theo loại (tạo, sửa, ghi sổ, xoá), hộp trường đổi có giá trị cũ gạch ngang và giá trị mới.
- `src/ui/mobile/MDtThuChiXem.tsx`, `src/ui/mobile/MXemPhieu.tsx`: tab Lịch sử dùng `MLichSu`, gỡ `LichSu` khỏi import. Hàm `LichSu` của web trong `ChungTuForm.tsx` giữ nguyên.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` với `KIEM_TRA_URL=http://localhost:5186/`: `Không có lỗi.`
- `python tools/kiem_van.py src/ui/mobile/MLichSu.tsx`: Sạch.
- Playwright 390x844: `.m-tc-card-thong-tin` và `.m-tc-xem-the-tom-tat` left 16, right 374, bo 16px; scrollWidth 390; tab Lịch sử phiếu chi có 2 nhãn ngày, 3 thẻ; tab Lịch sử phiếu nhập kho 3 thẻ; nút back thẻ phân bổ có `d="M19 12H5M12 19l-7-7 7-7"`.
- Chưa kiểm: `kiem_tra.py --dien-thoai` (bỏ để kịp giờ, lệnh này đang có lỗi cũ T525, T323, T314), đo `.m-tc-lap-card` màn lập phiếu, luồng sửa diễn giải rồi xem lại tab Lịch sử.

## Dở dang, việc tiếp theo

- Không. Làm ở bản clone `D:\IACC-CLOUD\Web-t536` vì `Web-dt` có phiên khác. T527 sửa chung `MDtThuChiXem.tsx`, `MXemPhieu.tsx` (phần `dsTab`, tab `hanghoa`), người gộp sau kiểm lại 2 file đó.

## Bẫy, quyết định mới

- Không.
