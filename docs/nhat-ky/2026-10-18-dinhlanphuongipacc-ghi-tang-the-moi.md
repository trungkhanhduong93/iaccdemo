# Nút Ghi tăng mở thẻ mới, Ghi tăng bổ sung trên dải cảnh báo, điện thoại mở chi tiết thẻ từ phiếu (T421)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ccdc/the-phan-bo.tsx`: kiểu thẻ `the` bỏ `goi: []`, nên nút chính Ghi tăng mở form tạo thẻ mới như ban đầu.
- `ccdc/index.ts`: giữ `hangLoat`, đổi tên thành Ghi tăng bổ sung. Giữ dải cảnh báo `useCanhBao`.
- `ccdc/GhiTangHangLoat.tsx`:
  - `useDongCho` bỏ phiếu đã có `_theCp` (thẻ tạo ngay khi lưu phiếu, T419).
  - Dải cảnh báo có nút Ghi tăng bổ sung (`hanhDong`, mở `?moi=hang-loat`).
  - Tạo thẻ hàng loạt thì `suaPhieu` ghi `_theCp` vào phiếu gốc.
  - Chữ Cách làm và gợi ý xám theo cách làm mới.
- `ui/DaiCanhBao.tsx`: `CanhBaoDs.hanhDong`, nút trên dải. `app.css`: mục cuối T421.
- `ui/mobile/MCcdc.tsx`:
  - `?mo=<số thẻ>` mở thẳng chi tiết thẻ, quay lại thì `nav(-1)`.
  - Thẻ tạo trong phiên giữ ở `theTaoPhien`, không mất khi rời màn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van --loai giao-dien` cho `GhiTangHangLoat.tsx`, `DaiCanhBao.tsx`: sạch.
- Thử tay web 1366x768:
  - nút Ghi tăng mở form Thẻ chi phí phân bổ, Thêm mới;
  - dải hiện "Còn 4 khoản…" có nút Ghi tăng bổ sung, bấm mở màn Ghi tăng thẻ chi phí phân bổ;
  - lập phiếu chờ phân bổ rồi tạo thẻ, dải vẫn 4 khoản.
- Thử tay điện thoại 375x812:
  - `?mo=TPB2610-0011` mở chi tiết thẻ;
  - phiếu mới tạo thẻ TPB2610-0012, bấm link trên phiếu mở đúng thẻ;
  - quay lại thì về phiếu.
- `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- Không. T339 (tiến độ kiểm kê nhiều cửa hàng) vẫn cất ở `git stash` "T339 tien do kiem ke nhieu cua hang (cat tam)".

## Bẫy, quyết định mới

- Không.
