# Nới ô Thuế GTGT phiếu mua hàng (T592)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Bản mẫu 3 phương án đặt ô áp chung chiết khấu, thuế: https://claude.ai/artifact/HGMHPUkFkf7Hzuw6kpPzcr. Người dùng chọn A: giữ chỗ cũ trên thanh tab, chỉ nới ô.
- `src/styles/app.css` (mục T492): `.ct-ap-ts` từ 110px lên 128px để hiện đủ "Nhiều mức".

## Đã kiểm

- Đo trên `npm run dev` gói Standard: ô 128px để 84px cho chữ, "Nhiều mức" cần khoảng 66px. Ở 110px phần chữ chỉ còn khoảng 66px nên bị cắt.
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
