# Kéo nút nổi Trợ lý IACC sang chỗ khác (T678)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/TroLy.tsx`: nút nổi nhấn giữ kéo được. Di chuyển quá 5px mới tính là kéo, thả ra thì không mở khung chat.
- Vị trí lưu ở localStorage `iacc.troLy.viTri`, luôn giữ trong màn, đổi cỡ cửa sổ thì tự kéo vào lại. Toạ độ chuột chia zoom thẻ html như `docs/BAY.md`.
- Khung chat mở cạnh nút đã kéo: nút nửa phải thì canh mép phải, nửa dưới thì mở lên trên, không tràn màn kể cả khi phóng to. Chưa kéo lần nào thì giữ chỗ cũ góc dưới phải.
- `src/styles/app.css`: mục cuối file (T678), `touch-action: none` và kiểu nút lúc đang kéo.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Kéo thử bằng Playwright ở Thu chi gói Standard: kéo xong không mở khung, tải lại vẫn giữ chỗ, kéo ra ngoài màn thì dừng ở mép, bấm mở khung chat ngay dưới nút. Không lỗi console.
- `python tools/kiem_van.py src/ui/TroLy.tsx --loai giao-dien`: sạch.
- Chưa chạy được `python tools/xuat_bao_cao_he_thong.py`: cần `../Present/tools/build_present.py`, chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
