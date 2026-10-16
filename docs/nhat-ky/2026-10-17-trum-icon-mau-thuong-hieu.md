# Icon màu thương hiệu iPOS, cỡ chuẩn, sidebar xanh đậm (T301, T302)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash) viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Trang xem trước để Trum chốt: https://claude.ai/artifact/8bD189Sn5BhvJQXtfUsDLa. Trum chọn màu A (thân xanh, nhấn cam), kiểu nét 2 màu không ô, sidebar xanh thương hiệu đậm (QD67).
- `tools/xuat_bieu_tuong.py`: bộ nét tải Solar Line Duotone (thiếu thì Linear), nét phụ thành `class="l2"`; so hộp bao để lớp lớn là thân; bảng `DAO_TAY` lấy ngược kết quả đo (đang có `tool`); thêm `more`, `nghiepvu`. Sinh lại `src/ui/icon-dac.ts`.
- `src/ui/Icon.tsx`: icon đồ vật, phân hệ vẽ nét 2 màu lớp `ic-2m`; `ONen` bỏ lớp màu nhóm.
- `app.css`: biến `--ic-sm`, `--ic`, `--ic-lg` (16, 20, 24), `--ic-than`, `--ic-nhan`, `--sb-nen`; `.ic` nét 1.5px cố định (`vector-effect: non-scaling-stroke`); 18 luật cỡ cũ về 3 cỡ; ô nền bỏ, icon trần 24, 28, 32; sidebar xanh đậm, mục chọn nền trắng mờ. Mục cuối file T301, T302.
- `ThanhDuoi.tsx`: bỏ 4 SVG IVT, dùng Solar `home`, `nghiepvu`, `chart`, `more`.
- SVG viết tay trong `src/ui/mobile/*` (MBaoCaoLoc, MCcdc, MDanhSach, MLapPhieu, MLapPhieuKho, MLichSuQuy, MLoc, MobileShell) về nét 1.5px.
- Làm trong worktree Orca `trungkhanhduong93/T301` song song T300, rebase lên `main`, chỉ xung đột 2 mục cuối `app.css`, giữ cả hai.

## Đã kiểm

- `npm run typecheck`, `npm run build` trên `main` sau khi gộp: không lỗi.
- `python tools/kiem_tra.py --nhanh`, `--dien-thoai` trên `main` sau khi gộp: `Không có lỗi.`
- Anti đo cỡ `svg.ic`: web 16, 20, 24, 28; điện thoại 20, 24, 28.
- Xem ảnh phóng to lưới Nghiệp vụ điện thoại: thân xanh, cam là chi tiết ở mọi phân hệ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD67 trong `docs/QUYET-DINH.md`.
- Bẫy "Icon Solar Line Duotone bị cam lấn thân" trong `docs/BAY.md`.
