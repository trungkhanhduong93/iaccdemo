# Popup HĐĐT, Nghiệp vụ điện thoại, công thức, bảng giá web và điện thoại (T856-T864)

- Ngày: 16/11/2026
- Người: Trum, agent: Claude Code điều phối, 4 Antigravity code, 1 Antigravity review
- Trạng thái cuối phiên: Xong

## Đã làm

- T856: `hddt.tsx`, `hddtFile.ts` dòng Giảm trừ thuế hiện `money(-giamTru)`, hết "--"; popup xem hoá đơn cuộn trong thân, tờ hoá đơn không bị cắt (CSS cuối `app.css`).
- T857: màn Nghiệp vụ điện thoại thêm đệm đáy theo `--m-thanh-duoi` + safe-area, mục cuối không bị dock che (chỉ CSS).
- T858: form công thức chế biến gói Plus, 2 khung Thông tin chung và bảng nguyên vật liệu bo góc `var(--r)` (chỉ CSS).
- T859-T862: `ThemBangGia.tsx` bỏ `chuaMenu` nên form phủ cả menu trái; nút xoá dòng dùng class `ctpl-xoa` như công thức; chế độ xem khoá mọi ô đầu form; bỏ tô cố định `bg-bam`, tô theo chuột. Sửa 1 câu QD101.
- T863: `MKhac.tsx` nhóm Danh mục đọc `FLYOUT_CONFIG['danh-muc']` (export từ `SidebarFlyout.tsx`), chia 2 nhóm như menu web.
- T864: màn mới `MBangGia.tsx` gắn ở `manMobile.ts` cho 1.14: danh sách, xem, thêm, sửa, xoá; dùng chung kho phiên với web qua hàm export từ `ThemBangGia.tsx`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Anti review chéo (pre-push-qa) kèm Playwright từng mục nghiệm thu: XANH, 9/9 đạt. Ảnh ở `backup/review-T856/` (không vào git).
- `kiem_van.py` cho `MBangGia.tsx`, `MKhac.tsx`: không có ĐỎ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD101 đổi một câu: dòng dưới chuột tô nhẹ, không tô cố định dòng vừa bấm (T862).
