# Lưới chi tiết form phiếu, icon nét mảnh, ô nhập lúc xem (T516, T517, T518)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T516 (commit `a5988a6`): `src/styles/app.css` mục T516 sửa lưới chi tiết mọi form toàn màn hình (.fsf) theo bản mẫu B Trum chọn. Khung ôm số dòng, kẻ dọc mờ đồng bộ ở tiêu đề, thân và dòng tổng. Tiêu đề cột số căn phải (tránh rule `.tbl thead tr:first-child th { text-align:left }` đè `.tbl th.num`). Tiêu đề nền xám nhạt, chữ và đường kẻ đậm hơn 1 bậc. Đảo phần khung kéo tới đáy của T513.
- T517 (commit `c43d1e3`): `FormToanMan.tsx`, `ChungTuForm.tsx`, `ChungTuBanHang.tsx`, `GhiTangHangLoat.tsx`: icon góc trái form phiếu chứng từ đổi sang bộ icon nét mảnh như phiếu thu chi qua prop `iconNet` của `FormToanMan`.
- T518 (commit `21da5fb`): `FormToanMan.tsx`, `ChungTuForm.tsx`, `CatalogScreen.tsx`, `app.css`: form toàn màn hình lúc xem đổi các ô nhập sang nền trắng chữ đậm (prop `xem` gắn class `fsf-xem`), lúc sửa giữ nền xám. Thẻ chi phí phân bổ (`CatalogScreen` toanMan) chân form nền trắng, icon nét mảnh.
- Gốc cảm giác chữ mờ trong phiếu: `zoom: .9` toàn app (QD28, `src/styles/scale.css`) làm chữ 13px thành 11.7px, ô ở toạ độ lẻ. Trum chọn giữ zoom, làm lưới và ô rõ hơn. Phương án đưa form phiếu về zoom 100% tạm gác vì popup có thể lệch vị trí (docs/BAY.md dòng 18).

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: không có lỗi.
- Kiểm tra giao diện lưới phiếu theo bản mẫu B, icon nét mảnh ở các form chứng từ, ô nhập nền trắng lúc xem.

## Dở dang, việc tiếp theo

- Chưa thử Chrome có giao diện ở `device_scale_factor` 1.5 để soát khe hở tiêu đề dính khi cuộn (BAY dòng 19) cho T516.

## Bẫy, quyết định mới

- `docs/BAY.md`: ghi nhận bẫy MSYS đổi tham số URL dạng `/app/...` thành đường dẫn Windows khi chạy Playwright từ Git Bash.
