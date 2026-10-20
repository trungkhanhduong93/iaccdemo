# Chân form lúc xem cao bằng lúc sửa (T524)

- Ngày: 20/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (Gemini 3.8 Flash High) đo và sửa
- Trạng thái cuối phiên: Xong

## Đã làm

- Đo bằng Playwright chân form toàn màn hình lúc xem và lúc sửa. Phiếu thu, phiếu chi, bán hàng, mua hàng (`ChungTuForm`) đã bằng nhau 58.58px, không sửa.
- Chỗ lệch nằm ở form toàn màn hình của `CatalogScreen` (thẻ CCDC, thẻ CPTT, thẻ TSCĐ): lúc xem dùng nút `btn sm` cao 28px, lúc sửa nút `btn` cao 34px, chân form lệch 5.4px.
- `src/ui/generic/CatalogScreen.tsx`: nút Tiện ích, Sửa, Đóng lúc xem bỏ class `sm`, cao bằng nút lúc sửa.

## Đã kiểm

- Script đo (ngoài repo, `%TEMP%/do_chan_form.py`): 4 phiếu chứng từ 58.58/58.58px, 3 thẻ chi phí phân bổ từ 51.38/56.78px thành 56.78/56.78px (xem/sửa).
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
