# Lịch sử thu chi điện thoại dư đầu, cuối ngày (T480)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLichSuQuy.tsx`: đầu mỗi nhóm ngày ghi "Dư cuối ngày", cuối nhóm thêm dòng "Dư đầu ngày". Dòng trong ngày vẫn xếp mới trước.
- Dư cuối ngày là số dư sau giao dịch cuối của ngày. Dư đầu ngày bằng dư cuối trừ thu cộng chi trong ngày.
- Bộ lọc Khoản thu, Khoản chi chỉ ẩn dòng, hai số dư vẫn tính trên mọi giao dịch của ngày.
- `src/styles/app.css`: mục `/* ── Lịch sử thu chi điện thoại dư đầu, cuối ngày (T480) ── */`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: in dòng `Không có lỗi.`
- `python tools/kiem_van.py src/ui/mobile/MLichSuQuy.tsx`: sạch.
- Phố Mây Lê Lợi: 06/10 dư đầu 25.033.000, dư cuối 17.130.000; 07/10 dư đầu 17.130.000, dư cuối 23.637.000.
- Ảnh `backup/T480-tat-ca.png`, `backup/T480-khoan-chi.png` ở 360x780.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Dữ liệu giả có khoản chi mang dấu cộng như khoản thu (vd "Chi mua nguyên vật liệu +21.975.000"). Nguyên nhân: `src/ui/generic/gen.ts` hàm `soChiTiet` chọn diễn giải ngẫu nhiên, không theo loại thu hay chi. Đã ghi thành việc mới trong `docs/TIEN-DO.md`.
